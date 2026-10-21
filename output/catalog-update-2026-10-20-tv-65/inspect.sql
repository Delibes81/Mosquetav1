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
select t.source_ref,t.brand,t.model as approved_model,
 v.manufacturer_model as current_model,v.sku as current_sku,v.slug,
 (select count(*) from public.catalog_product_images i where i.product_id=t.product_id
  and (i.variant_id is null or i.variant_id=t.variant_id)) as existing_images
from approved_targets t join public.catalog_variants v on v.id=t.variant_id order by t.source_ref;
rollback;
