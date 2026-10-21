begin;
create temporary table image_batch on commit drop as
select * from jsonb_to_recordset('[{"model": "31390", "brand": "Hamilton Beach", "source_ref": "excel-40", "slug": "horno-digital-extra-grande-sure-crisp-con-freidora-de-aire-hamilton-beach-31390", "storage_path": "catalog-products/20261020-31390-portada-ccc77fa4d02f.webp", "sort_order": 0, "is_primary": true}, {"model": "65QD7QF", "brand": "Hisense", "source_ref": "excel-52-1", "slug": "pantalla-smart-tv-65-hisense-65qd7qf", "storage_path": "catalog-products/20261020-65qd7qf-portada-24b80d3260b4.webp", "sort_order": 0, "is_primary": true}, {"model": "65UA7510PSC", "brand": "LG", "source_ref": "excel-46", "slug": "pantalla-65-4k-uhd-smart-tv-lg-65ua7510psc", "storage_path": "catalog-products/20261020-65ua7510psc-portada-dcda9f06f340.webp", "sort_order": 0, "is_primary": true}, {"model": "75QD6", "brand": "Hisense", "source_ref": "excel-57-2", "slug": "pantalla-smart-tv-75-hisense-75qd6", "storage_path": "catalog-products/20261020-75qd6-portada-0f6e8d96c9be.webp", "sort_order": 0, "is_primary": true}, {"model": "85A65NV", "brand": "Hisense", "source_ref": "excel-62-1", "slug": "pantalla-smart-tv-85-hisense-85a65nv", "storage_path": "catalog-products/20261020-85a65nv-portada-903b5236ccad.webp", "sort_order": 0, "is_primary": true}, {"model": "BN701LAA", "brand": "Ninja", "source_ref": "excel-44", "slug": "licuadora-profesional-plus-auto-iq-ninja-bn701laa", "storage_path": "catalog-products/20261020-bn701laa-portada-c9f5a2472045.webp", "sort_order": 0, "is_primary": true}, {"model": "LMA74215WBAB1", "brand": "Mabe", "source_ref": "excel-43", "slug": "lavadora-carga-superior-24-kg-mabe-lma74215wbab1", "storage_path": "catalog-products/20261020-lma74215wbab1-portada-fe24b484c843.webp", "sort_order": 0, "is_primary": true}, {"model": "MCL1740ESBB", "brand": "Mabe", "source_ref": "excel-7", "slug": "centro-de-lavado-17-kg-electrico-compacto-mabe-mcl1740esbb", "storage_path": "catalog-products/20261020-mcl1740esbb-portada-d15fede9ef50.webp", "sort_order": 0, "is_primary": true}, {"model": "MCL2040ESDG0", "brand": "Mabe", "source_ref": "excel-8", "slug": "centro-de-lavado-20-kg-electrico-mabe-mcl2040esdg0", "storage_path": "catalog-products/20261020-mcl2040esdg0-portada-fa6d9b2bbcc1.webp", "sort_order": 0, "is_primary": true}, {"model": "MCL2040PSBB0", "brand": "Mabe", "source_ref": "excel-13", "slug": "centro-de-lavado-automatico-20-kg-mabe-mcl2040psbb0", "storage_path": "catalog-products/20261020-mcl2040psbb0-portada-490c44ea1588.webp", "sort_order": 0, "is_primary": true}, {"model": "MCL2440EPDG0", "brand": "Mabe", "source_ref": "excel-9", "slug": "centro-de-lavado-24-kg-electrico-mabe-mcl2440epdg0", "storage_path": "catalog-products/20261020-mcl2440epdg0-portada-7c6adf8c8b18.webp", "sort_order": 0, "is_primary": true}, {"model": "MCL2440PSBB0", "brand": "Mabe", "source_ref": "excel-12", "slug": "centro-de-lavado-24-kg-gas-lp-natural-mabe-mcl2440psbb0", "storage_path": "catalog-products/20261020-mcl2440psbb0-portada-d27962379a22.webp", "sort_order": 0, "is_primary": true}, {"model": "MS-1536GIR", "brand": "LG", "source_ref": "excel-37", "slug": "horno-de-microondas-smart-inverter-1-5-pies-cubicos-lg-ms-1536gir", "storage_path": "catalog-products/20261020-ms-1536gir-portada-80248e0bbf4c.webp", "sort_order": 0, "is_primary": true}, {"model": "MS-1536GIR", "brand": "LG", "source_ref": "excel-37", "slug": "horno-de-microondas-smart-inverter-1-5-pies-cubicos-lg-ms-1536gir", "storage_path": "catalog-products/20261020-ms-1536gir-01-31560fa4c53f.webp", "sort_order": 1, "is_primary": false}, {"model": "RMA-250PVMRM0", "brand": "Mabe", "source_ref": "excel-72", "slug": "refrigerador-top-mount-10-pies-cubicos-250-litros-mabe-rma250pvmrm0", "storage_path": "catalog-products/20261020-rma-250pvmrm0-portada-ef08121d42ef.webp", "sort_order": 0, "is_primary": true}, {"model": "RMF0411PYMX0", "brand": "Mabe", "source_ref": "excel-34", "slug": "frigobar-93-litres-3-3-cu-ft-mabe-rmf0411pymx0", "storage_path": "catalog-products/20261020-rmf0411pymx0-portada-ac898f537348.webp", "sort_order": 0, "is_primary": true}, {"model": "RR63D6WGX", "brand": "Hisense", "source_ref": "excel-70", "slug": "refrigerador-semiautomatico-7-pies-cubicos-176-l-hisense-rr63d6wgx", "storage_path": "catalog-products/20261020-rr63d6wgx-portada-f956f08af6a7.webp", "sort_order": 0, "is_primary": true}, {"model": "UN55U8000FFXZX", "brand": "Samsung", "source_ref": "excel-45", "slug": "pantalla-55-crystal-uhd-u8000f-4k-samsung-un55u8000ffxzx", "storage_path": "catalog-products/20261020-un55u8000ffxzx-portada-1db0f3d5890a.webp", "sort_order": 0, "is_primary": true}]'::jsonb)
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
    or (select count(*) from image_targets)<>17
    or (select count(distinct product_id) from image_targets)<>17 then
   raise exception 'Cancelled: expected 17 unique model/brand/source/URL matches';
 end if;
end;
$validate$;
select
 (select count(*) from image_targets) as matched_models,
 (select count(*) from image_batch) as prepared_photos,
 (select jsonb_agg(jsonb_build_object('model',t.model,'brand',t.brand,'source_ref',t.source_ref,
    'variant_id',t.variant_id,'product_id',t.product_id,'slug',t.slug,
    'existing_images',(select count(*) from public.catalog_product_images i
      where i.product_id=t.product_id and (i.variant_id is null or i.variant_id=t.variant_id))))
    from image_targets t) as matches;
rollback;
