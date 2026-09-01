begin;

create or replace function public.replace_catalog_image(
  p_product_id uuid,
  p_variant_id uuid,
  p_image_id uuid,
  p_storage_path text
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  previous_storage_path text;
begin
  if not public.is_catalog_admin('admin') then
    raise exception 'Sólo un administrador puede reemplazar imágenes';
  end if;

  if p_storage_path !~ (
    '^catalog-products/'
    || p_product_id::text
    || '/'
    || p_variant_id::text
    || '/[0-9a-f-]{36}\.webp$'
  ) then
    raise exception 'La ruta de la nueva imagen no es válida';
  end if;

  select image.storage_path
  into previous_storage_path
  from public.catalog_product_images image
  where image.id = p_image_id
    and image.product_id = p_product_id
    and (image.variant_id = p_variant_id or image.variant_id is null);

  if not found then
    raise exception 'La imagen no existe en esta galería';
  end if;

  update public.catalog_product_images image
  set
    storage_path = p_storage_path,
    image_status = 'final'
  where image.id = p_image_id;

  return previous_storage_path;
end;
$$;

create or replace function public.delete_catalog_image(
  p_product_id uuid,
  p_variant_id uuid,
  p_image_id uuid
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deleted_storage_path text;
begin
  if not public.is_catalog_admin('admin') then
    raise exception 'Sólo un administrador puede eliminar imágenes';
  end if;

  delete from public.catalog_product_images image
  where image.id = p_image_id
    and image.product_id = p_product_id
    and (image.variant_id = p_variant_id or image.variant_id is null)
  returning image.storage_path into deleted_storage_path;

  if not found then
    raise exception 'La imagen no existe en esta galería';
  end if;

  with ordered as (
    select
      image.id,
      row_number() over (
        order by image.is_primary desc, image.sort_order asc, image.created_at asc
      ) - 1 as position
    from public.catalog_product_images image
    where image.product_id = p_product_id
      and (image.variant_id = p_variant_id or image.variant_id is null)
  )
  update public.catalog_product_images image
  set
    sort_order = ordered.position,
    is_primary = ordered.position = 0
  from ordered
  where image.id = ordered.id;

  return deleted_storage_path;
end;
$$;

revoke all on function public.replace_catalog_image(uuid, uuid, uuid, text) from public;
grant execute on function public.replace_catalog_image(uuid, uuid, uuid, text) to authenticated, service_role;

revoke all on function public.delete_catalog_image(uuid, uuid, uuid) from public;
grant execute on function public.delete_catalog_image(uuid, uuid, uuid) to authenticated, service_role;

commit;
