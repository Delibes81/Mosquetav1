"""Build an explicitly approved model/SKU correction and photo batch, locally."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil


def sql_json(value):
    return "'" + json.dumps(value, ensure_ascii=False).replace("'", "''") + "'::jsonb"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--approval", type=Path, required=True)
    parser.add_argument("--catalog", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    original = json.loads(args.manifest.read_text())
    source_images = {r["source"]: r for r in original["images"]}
    catalog = {r["id"]: r for r in json.loads(args.catalog.read_text())}
    approval = json.loads(args.approval.read_text())
    args.output.mkdir(parents=True, exist_ok=True)
    rows = []
    for assignment in approval["images"]:
        image = source_images[assignment["source"]]
        product = catalog[assignment["targetSourceRef"]]
        source = args.manifest.parent / image["path"]
        if digest(source) != image["sha256"]:
            raise ValueError("A reviewed WebP changed")
        model = assignment["approvedModel"]
        label = re.sub(r"[^a-z0-9]+", "-", model.lower()).strip("-")
        suffix = "portada" if assignment["order"] == 0 else f"{assignment['order']:02d}"
        filename = f"20261020-corrections-{label}-{suffix}-{image['sha256'][:12]}.webp"
        upload = args.output / "upload" / filename
        upload.parent.mkdir(exist_ok=True)
        if upload.exists() and digest(upload) != image["sha256"]:
            raise ValueError("Refusing to overwrite a different upload file")
        shutil.copy2(source, upload)
        rows.append(dict(source=assignment["source"], source_ref=product["id"],
                         brand=product["brand"], old_model=product["model"], model=model,
                         slug=product["slug"], storage_path=f"catalog-products/{filename}",
                         sort_order=assignment["order"],
                         image_status=assignment.get("imageStatus", "final"),
                         sha256=image["sha256"], path=f"upload/{filename}"))
    count, targets = len(rows), len({r["source_ref"] for r in rows})
    if len({r["storage_path"] for r in rows}) != count:
        raise ValueError("Storage paths must be unique")
    prefix = f"""begin;
create temporary table approved_photos on commit drop as
select * from jsonb_to_recordset({sql_json(rows)})
as s(source text,source_ref text,brand text,old_model text,model text,slug text,
     storage_path text,sort_order integer,image_status text,sha256 text,path text);
create temporary table approved_targets on commit drop as
select distinct s.source_ref,s.brand,s.model,v.id as variant_id,v.product_id,p.name,v.slug
from approved_photos s
join public.catalog_products p on p.source_ref=s.source_ref
join public.catalog_brands b on b.id=p.brand_id and lower(b.name)=lower(s.brand)
join public.catalog_variants v on v.product_id=p.id and v.slug=s.slug
 and regexp_replace(upper(v.manufacturer_model),'[^A-Z0-9]','','g') in
 (regexp_replace(upper(s.old_model),'[^A-Z0-9]','','g'),regexp_replace(upper(s.model),'[^A-Z0-9]','','g'));
do $validate$
begin
 if exists(select s.source_ref from (select distinct source_ref from approved_photos) s
   left join approved_targets t using(source_ref) group by s.source_ref having count(t.variant_id)<>1)
   or (select count(*) from approved_targets)<>{targets}
   or (select count(distinct product_id) from approved_targets)<>{targets} then
  raise exception 'Cancelled: approved model identities did not match uniquely';
 end if;
 if exists(select 1 from approved_targets t join public.catalog_variants v
   on lower(v.sku)=lower(t.model) and v.id<>t.variant_id) then
  raise exception 'Cancelled: approved SKU already belongs to another variant';
 end if;
end;
$validate$;
"""
    inspect = prefix + """select t.source_ref,t.brand,t.model as approved_model,
 v.manufacturer_model as current_model,v.sku as current_sku,v.slug,
 (select count(*) from public.catalog_product_images i where i.product_id=t.product_id
  and (i.variant_id is null or i.variant_id=t.variant_id)) as existing_images
from approved_targets t join public.catalog_variants v on v.id=t.variant_id order by t.source_ref;
rollback;
"""
    apply = prefix + f"""
create temporary table before_variants on commit drop as
select v.* from public.catalog_variants v join approved_targets t on t.variant_id=v.id;
create temporary table before_products on commit drop as
select p.* from public.catalog_products p join approved_targets t on t.product_id=p.id;
create temporary table before_images on commit drop as
select i.* from public.catalog_product_images i join approved_targets t on t.product_id=i.product_id
where i.variant_id is null or i.variant_id=t.variant_id;
create temporary table photo_plan on commit drop as
select s.*,t.variant_id,t.product_id,t.name,
 coalesce((select max(i.sort_order)+1 from before_images i where i.product_id=t.product_id
  and i.image_status='final' and not exists(select 1 from approved_photos f where f.storage_path=i.storage_path)),0)
   +s.sort_order as final_order,
 (s.sort_order=0 and not exists(select 1 from before_images i where i.product_id=t.product_id
   and i.is_primary and i.image_status='final'
   and not exists(select 1 from approved_photos f where f.storage_path=i.storage_path))) as primary_photo
from approved_photos s join approved_targets t using(source_ref,brand,model,slug);
do $storage$
begin
 if exists(select 1 from approved_photos s where not exists(select 1 from storage.objects o
   where o.bucket_id='catalog-products' and 'catalog-products/'||o.name=s.storage_path
   and o.metadata->>'mimetype'='image/webp')) then
  raise exception 'Cancelled: approved WebP uploads are missing';
 end if;
end;
$storage$;
update public.catalog_products p set metadata=p.metadata||jsonb_build_object(
 'client_corrections_20261020_before',jsonb_build_object('product',to_jsonb(p)-'metadata',
 'variants',(select jsonb_agg(to_jsonb(v)) from before_variants v where v.product_id=p.id),
 'images',(select jsonb_agg(to_jsonb(i)) from before_images i where i.product_id=p.id)))
where p.id in(select product_id from approved_targets)
 and not(p.metadata ? 'client_corrections_20261020_before');

-- Only the specifically approved identifiers change. URLs and commercial fields stay intact.
update public.catalog_variants v
set sku=t.model,manufacturer_model=t.model,source_model=t.model
from approved_targets t where v.id=t.variant_id
 and (v.sku<>t.model or v.manufacturer_model<>t.model or v.source_model<>t.model);
update public.catalog_product_images i set is_primary=false,sort_order=greatest(i.sort_order,100)
where i.image_status='referencia' and exists(select 1 from approved_targets t
 where t.product_id=i.product_id and (i.variant_id is null or i.variant_id=t.variant_id))
 and not exists(select 1 from approved_photos s where s.storage_path=i.storage_path);
insert into public.catalog_product_images
 (product_id,variant_id,storage_path,alt_text,image_status,is_primary,sort_order)
select product_id,variant_id,storage_path,name||' '||brand||' '||model||
 case when primary_photo then ' - portada' else ' - imagen adicional' end,
 image_status,primary_photo,final_order from photo_plan
on conflict(product_id,variant_id,storage_path) do update
set alt_text=excluded.alt_text,image_status=excluded.image_status,
 is_primary=excluded.is_primary,sort_order=excluded.sort_order;
do $verify$
begin
 if exists(select 1 from before_variants b join public.catalog_variants v on v.id=b.id
 where (to_jsonb(v)-'sku'-'manufacturer_model'-'source_model'-'updated_at')<>
       (to_jsonb(b)-'sku'-'manufacturer_model'-'source_model'-'updated_at')) then
  raise exception 'Cancelled: variant fields outside approved identifiers changed';
 end if;
 if exists(select 1 from before_products b join public.catalog_products p on p.id=b.id
 where (to_jsonb(p)-'metadata'-'updated_at')<>(to_jsonb(b)-'metadata'-'updated_at')) then
  raise exception 'Cancelled: protected product fields changed';
 end if;
 if exists(select 1 from approved_targets t join public.catalog_variants v on v.id=t.variant_id
 where v.sku<>t.model or v.manufacturer_model<>t.model or v.source_model<>t.model) then
  raise exception 'Cancelled: approved model/SKU identity mismatch';
 end if;
 if exists(select 1 from before_images b left join public.catalog_product_images i on i.id=b.id
 where i.id is null or i.storage_path<>b.storage_path) then
  raise exception 'Cancelled: a prior image was removed or replaced';
 end if;
 if (select count(*) from photo_plan f join public.catalog_product_images i
 on i.product_id=f.product_id and i.variant_id=f.variant_id and i.storage_path=f.storage_path)<>{count} then
  raise exception 'Cancelled: wrong number of linked approved images';
 end if;
 if exists(select t.product_id from approved_targets t join public.catalog_product_images i
 on i.product_id=t.product_id and (i.variant_id is null or i.variant_id=t.variant_id)
 group by t.product_id having count(*) filter(where i.is_primary)<>1) then
  raise exception 'Cancelled: a gallery does not have exactly one cover';
 end if;
end;
$verify$;
select {count} as linked_photos,{targets} as updated_galleries,
 (select count(*) from before_variants b join public.catalog_variants v on v.id=b.id where v.sku<>b.sku) as corrected_skus,
 (select count(*) from before_variants b join public.catalog_variants v on v.id=b.id
  where v.manufacturer_model<>b.manufacturer_model) as corrected_models,
 (select count(*) from before_images) as prior_images_retained,
 0 as altered_commercial_fields;
commit;
"""
    (args.output / "inspect.sql").write_text(inspect)
    (args.output / "apply.sql").write_text(apply)
    (args.output / "manifest.json").write_text(json.dumps(dict(status="prepared-not-applied",
      approval=str(args.approval),photos=count,models=targets,images=rows),ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(dict(photos=count,models=targets,inspectBytes=len(inspect.encode()),applyBytes=len(apply.encode()))))


if __name__ == "__main__":
    main()
