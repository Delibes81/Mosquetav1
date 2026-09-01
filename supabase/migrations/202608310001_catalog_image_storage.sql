begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'catalog-products',
  'catalog-products',
  true,
  10485760,
  array['image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Catalog staff can inspect product images" on storage.objects;
create policy "Catalog staff can inspect product images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'catalog-products'
  and public.is_catalog_admin()
);

drop policy if exists "Catalog staff can upload product images" on storage.objects;
create policy "Catalog staff can upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'catalog-products'
  and storage.extension(name) = 'webp'
  and public.is_catalog_admin()
);

drop policy if exists "Catalog admins can remove product images" on storage.objects;
create policy "Catalog admins can remove product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'catalog-products'
  and public.is_catalog_admin('admin')
);

create or replace function public.set_catalog_image_order(
  p_product_id uuid,
  p_variant_id uuid,
  p_image_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  expected_count integer;
begin
  if not public.is_catalog_admin() then
    raise exception 'No autorizado para ordenar imágenes';
  end if;

  if not exists (
    select 1
    from public.catalog_variants variant
    where variant.id = p_variant_id
      and variant.product_id = p_product_id
  ) then
    raise exception 'El producto o la variante no existen';
  end if;

  select count(*)::integer
  into expected_count
  from public.catalog_product_images image
  where image.product_id = p_product_id
    and (image.variant_id = p_variant_id or image.variant_id is null);

  if coalesce(array_length(p_image_ids, 1), 0) <> expected_count
    or exists (
      select 1
      from unnest(p_image_ids) image_id
      left join public.catalog_product_images image on image.id = image_id
      where image.id is null
        or image.product_id <> p_product_id
        or (image.variant_id <> p_variant_id and image.variant_id is not null)
    )
    or (
      select count(distinct ids.image_id)
      from unnest(p_image_ids) as ids(image_id)
    ) <> expected_count
  then
    raise exception 'La lista de imágenes no coincide con la galería actual';
  end if;

  update public.catalog_product_images image
  set is_primary = false
  where image.product_id = p_product_id
    and (image.variant_id = p_variant_id or image.variant_id is null);

  update public.catalog_product_images image
  set
    sort_order = ordered.position - 1,
    is_primary = ordered.position = 1
  from unnest(p_image_ids) with ordinality as ordered(image_id, position)
  where image.id = ordered.image_id;
end;
$$;

revoke all on function public.set_catalog_image_order(uuid, uuid, uuid[]) from public;
grant execute on function public.set_catalog_image_order(uuid, uuid, uuid[]) to authenticated, service_role;

commit;
