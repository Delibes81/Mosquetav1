"""Generate guarded SQL for an image-only batch; no remote connections."""

import argparse
import hashlib
import json
from pathlib import Path


def sql_json(value):
    return "'" + json.dumps(value, ensure_ascii=False).replace("'", "''") + "'::jsonb"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--catalog", type=Path, required=True)
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text())
    catalog = {r["id"]: r for r in json.loads(args.catalog.read_text())}
    selected = [r for r in manifest["images"] if r["status"] == "ready-for-live-match"]
    rows = []
    for image in selected:
        path = args.manifest.parent / image["path"]
        if hashlib.sha256(path.read_bytes()).hexdigest() != image["sha256"]:
            raise ValueError(f"Converted image changed: {path}")
        item = catalog[image["existingSourceRef"]]
        rows.append(dict(model=image["model"], brand=item["brand"],
                         source_ref=image["existingSourceRef"], slug=image["existingSlug"],
                         storage_path=image["storagePath"], sort_order=image["proposedOrder"],
                         is_primary=image["proposedOrder"] == 0))
    count, models = len(rows), len({r["model"] for r in rows})
    if count != 18 or models != 17:
        raise ValueError("This reviewed batch must have 18 photos for 17 models")
    batch = manifest["summary"]["batch"]
    prefix = f"""begin;
create temporary table image_batch on commit drop as
select * from jsonb_to_recordset({sql_json(rows)})
as x(model text, brand text, source_ref text, slug text, storage_path text,
     sort_order integer, is_primary boolean);
create temporary table image_targets on commit drop as
select distinct s.model, s.brand, s.source_ref, v.id as variant_id,
                v.product_id, p.name, v.slug
from image_batch s
join public.catalog_products p on p.source_ref = s.source_ref
join public.catalog_brands b on b.id = p.brand_id and lower(b.name)=lower(s.brand)
join public.catalog_variants v on v.product_id=p.id and v.slug=s.slug
  and regexp_replace(upper(v.manufacturer_model),'[^A-Z0-9]','','g')=
      regexp_replace(upper(s.model),'[^A-Z0-9]','','g');
do $validate$
begin
 if exists(select s.model from (select distinct model from image_batch) s
           left join image_targets t using(model)
           group by s.model having count(t.variant_id)<>1)
    or (select count(*) from image_targets)<>{models}
    or (select count(distinct product_id) from image_targets)<>{models} then
   raise exception 'Cancelled: expected 17 unique model/brand/source/URL matches';
 end if;
end;
$validate$;
"""
    inspect = prefix + """select
 (select count(*) from image_targets) as matched_models,
 (select count(*) from image_batch) as prepared_photos,
 (select jsonb_agg(jsonb_build_object('model',t.model,'brand',t.brand,'source_ref',t.source_ref,
    'variant_id',t.variant_id,'product_id',t.product_id,'slug',t.slug,
    'existing_images',(select count(*) from public.catalog_product_images i
      where i.product_id=t.product_id and (i.variant_id is null or i.variant_id=t.variant_id))))
    from image_targets t) as matches;
rollback;
"""
    apply = prefix + f"""
create temporary table before_variants on commit drop as
select v.* from public.catalog_variants v join image_targets t on t.variant_id=v.id;
create temporary table before_products on commit drop as
select p.* from public.catalog_products p join image_targets t on t.product_id=p.id;
create temporary table before_images on commit drop as
select i.* from public.catalog_product_images i join image_targets t on t.product_id=i.product_id
where i.variant_id is null or i.variant_id=t.variant_id;
do $storage$
begin
 if exists(select 1 from image_batch s where not exists(
   select 1 from storage.objects o where o.bucket_id='catalog-products'
     and 'catalog-products/'||o.name=s.storage_path
     and o.metadata->>'mimetype'='image/webp')) then
   raise exception 'Cancelled: not all 18 WebP objects are present in Storage';
 end if;
end;
$storage$;
update public.catalog_products p
set metadata=p.metadata||jsonb_build_object('client_images_{batch}_before',
  jsonb_build_object('product',to_jsonb(p)-'metadata',
    'variants',(select jsonb_agg(to_jsonb(v)) from before_variants v where v.product_id=p.id),
    'images',(select jsonb_agg(to_jsonb(i)) from before_images i where i.product_id=p.id)))
where p.id in(select product_id from image_targets)
  and not(p.metadata ? 'client_images_{batch}_before');

-- Retain all previous image rows/files after the new photos, without deleting.
update public.catalog_product_images i set is_primary=false, sort_order=greatest(i.sort_order,100)
where exists(select 1 from image_targets t where t.product_id=i.product_id
             and (i.variant_id is null or i.variant_id=t.variant_id))
  and not exists(select 1 from image_batch s where s.storage_path=i.storage_path);
insert into public.catalog_product_images
 (product_id,variant_id,storage_path,alt_text,image_status,is_primary,sort_order)
select t.product_id,t.variant_id,s.storage_path,
 t.name||' '||t.brand||' '||s.model||case when s.is_primary then ' - portada'
 else ' - imagen '||(s.sort_order+1)::text end,
 'final',s.is_primary,s.sort_order
from image_batch s join image_targets t using(model)
on conflict(product_id,variant_id,storage_path) do update
set alt_text=excluded.alt_text,image_status=excluded.image_status,
    is_primary=excluded.is_primary,sort_order=excluded.sort_order;

do $verify$
begin
 if exists(select 1 from before_variants b join public.catalog_variants v on v.id=b.id
           where to_jsonb(v)<>to_jsonb(b)) then
   raise exception 'Cancelled: a variant changed during this image-only import';
 end if;
 if exists(select 1 from before_products b join public.catalog_products p on p.id=b.id
           where (to_jsonb(p)-'metadata'-'updated_at')<>(to_jsonb(b)-'metadata'-'updated_at')) then
   raise exception 'Cancelled: protected product fields changed';
 end if;
 if exists(select 1 from before_images b left join public.catalog_product_images i on i.id=b.id
           where i.id is null or i.storage_path<>b.storage_path) then
   raise exception 'Cancelled: a prior image was removed or replaced';
 end if;
 if (select count(*) from image_batch s join image_targets t using(model)
     join public.catalog_product_images i on i.product_id=t.product_id
       and i.variant_id=t.variant_id and i.storage_path=s.storage_path)<>{count} then
   raise exception 'Cancelled: expected 18 linked images';
 end if;
 if (select count(*) from public.catalog_product_images i join image_targets t
     on t.product_id=i.product_id and (i.variant_id is null or i.variant_id=t.variant_id)
     where i.is_primary)<>{models} then
   raise exception 'Cancelled: expected 17 gallery covers';
 end if;
end;
$verify$;
select {count} as linked_photos,{models} as updated_galleries,
 (select count(*) from before_images) as prior_images_retained,
 0 as altered_variants,0 as altered_protected_product_fields;
commit;
"""
    (args.manifest.parent / "inspect-live-images.sql").write_text(inspect)
    (args.manifest.parent / "apply-live-images.sql").write_text(apply)
    print(json.dumps(dict(photos=count, models=models,
                         inspectBytes=len(inspect.encode()), applyBytes=len(apply.encode()))))


if __name__ == "__main__":
    main()
