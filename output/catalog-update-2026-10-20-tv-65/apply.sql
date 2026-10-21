begin;
create temporary table approved_photos on commit drop as
select * from jsonb_to_recordset('[{"source": "55A65NV/55A65NV.jpg", "source_ref": "excel-52-2", "brand": "Hisense", "old_model": "65QD6QV", "model": "65QD6QV", "slug": "pantalla-smart-tv-65-hisense-65qd6qv", "storage_path": "catalog-products/20261020-corrections-65qd6qv-portada-b2da23140c93.webp", "sort_order": 0, "image_status": "final", "sha256": "b2da23140c93d625784878d1d552aa88a786d5ae8434afa8bbd56cb030b5796d", "path": "upload/20261020-corrections-65qd6qv-portada-b2da23140c93.webp"}]'::jsonb)
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
   or (select count(*) from approved_targets)<>1
   or (select count(distinct product_id) from approved_targets)<>1 then
  raise exception 'Cancelled: approved model identities did not match uniquely';
 end if;
 if exists(select 1 from approved_targets t join public.catalog_variants v
   on lower(v.sku)=lower(t.model) and v.id<>t.variant_id) then
  raise exception 'Cancelled: approved SKU already belongs to another variant';
 end if;
end;
$validate$;

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
 on i.product_id=f.product_id and i.variant_id=f.variant_id and i.storage_path=f.storage_path)<>1 then
  raise exception 'Cancelled: wrong number of linked approved images';
 end if;
 if exists(select t.product_id from approved_targets t join public.catalog_product_images i
 on i.product_id=t.product_id and (i.variant_id is null or i.variant_id=t.variant_id)
 group by t.product_id having count(*) filter(where i.is_primary)<>1) then
  raise exception 'Cancelled: a gallery does not have exactly one cover';
 end if;
end;
$verify$;
select 1 as linked_photos,1 as updated_galleries,
 (select count(*) from before_variants b join public.catalog_variants v on v.id=b.id where v.sku<>b.sku) as corrected_skus,
 (select count(*) from before_variants b join public.catalog_variants v on v.id=b.id
  where v.manufacturer_model<>b.manufacturer_model) as corrected_models,
 (select count(*) from before_images) as prior_images_retained,
 0 as altered_commercial_fields;
commit;
