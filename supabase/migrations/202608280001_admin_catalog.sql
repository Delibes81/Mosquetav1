begin;

do $$
begin
  create type public.catalog_admin_role as enum ('admin', 'editor');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.catalog_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.catalog_admin_role not null default 'editor',
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists catalog_admin_users_set_updated_at on public.catalog_admin_users;
create trigger catalog_admin_users_set_updated_at
before update on public.catalog_admin_users
for each row execute function public.set_updated_at();

alter table public.catalog_admin_users enable row level security;

revoke all on table public.catalog_admin_users from anon, authenticated;
grant select on table public.catalog_admin_users to authenticated;
grant all on table public.catalog_admin_users to service_role;

create or replace function public.is_catalog_admin(
  required_role public.catalog_admin_role default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.catalog_admin_users admin_user
    where admin_user.user_id = (select auth.uid())
      and admin_user.active
      and (
        required_role is null
        or admin_user.role = required_role
        or admin_user.role = 'admin'
      )
  );
$$;

revoke all on function public.is_catalog_admin(public.catalog_admin_role) from public;
grant execute on function public.is_catalog_admin(public.catalog_admin_role) to authenticated, service_role;

drop policy if exists "Admins can read their profile" on public.catalog_admin_users;
create policy "Admins can read their profile"
on public.catalog_admin_users for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_catalog_admin('admin')
);

grant insert, update on table public.catalog_brands to authenticated;
grant insert, update on table public.catalog_categories to authenticated;
grant insert, update on table public.catalog_products to authenticated;
grant insert, update on table public.catalog_variants to authenticated;
grant insert, update, delete on table public.catalog_product_images to authenticated;
grant select, insert on table public.inventory_movements to authenticated;

drop policy if exists "Admins can read every product" on public.catalog_products;
create policy "Admins can read every product"
on public.catalog_products for select
to authenticated
using (public.is_catalog_admin());

drop policy if exists "Admins can create products" on public.catalog_products;
create policy "Admins can create products"
on public.catalog_products for insert
to authenticated
with check (public.is_catalog_admin());

drop policy if exists "Admins can update products" on public.catalog_products;
create policy "Admins can update products"
on public.catalog_products for update
to authenticated
using (public.is_catalog_admin())
with check (public.is_catalog_admin());

drop policy if exists "Admins can read every variant" on public.catalog_variants;
create policy "Admins can read every variant"
on public.catalog_variants for select
to authenticated
using (public.is_catalog_admin());

drop policy if exists "Admins can create variants" on public.catalog_variants;
create policy "Admins can create variants"
on public.catalog_variants for insert
to authenticated
with check (public.is_catalog_admin());

drop policy if exists "Admins can update variants" on public.catalog_variants;
create policy "Admins can update variants"
on public.catalog_variants for update
to authenticated
using (public.is_catalog_admin())
with check (public.is_catalog_admin());

drop policy if exists "Admins can create brands" on public.catalog_brands;
create policy "Admins can create brands"
on public.catalog_brands for insert
to authenticated
with check (public.is_catalog_admin());

drop policy if exists "Admins can update brands" on public.catalog_brands;
create policy "Admins can update brands"
on public.catalog_brands for update
to authenticated
using (public.is_catalog_admin())
with check (public.is_catalog_admin());

drop policy if exists "Admins can create categories" on public.catalog_categories;
create policy "Admins can create categories"
on public.catalog_categories for insert
to authenticated
with check (public.is_catalog_admin());

drop policy if exists "Admins can update categories" on public.catalog_categories;
create policy "Admins can update categories"
on public.catalog_categories for update
to authenticated
using (public.is_catalog_admin())
with check (public.is_catalog_admin());

drop policy if exists "Admins can read every image" on public.catalog_product_images;
create policy "Admins can read every image"
on public.catalog_product_images for select
to authenticated
using (public.is_catalog_admin());

drop policy if exists "Admins can create images" on public.catalog_product_images;
create policy "Admins can create images"
on public.catalog_product_images for insert
to authenticated
with check (public.is_catalog_admin());

drop policy if exists "Admins can update images" on public.catalog_product_images;
create policy "Admins can update images"
on public.catalog_product_images for update
to authenticated
using (public.is_catalog_admin())
with check (public.is_catalog_admin());

drop policy if exists "Admins can delete images" on public.catalog_product_images;
create policy "Admins can delete images"
on public.catalog_product_images for delete
to authenticated
using (public.is_catalog_admin('admin'));

drop policy if exists "Admins can read inventory movements" on public.inventory_movements;
create policy "Admins can read inventory movements"
on public.inventory_movements for select
to authenticated
using (public.is_catalog_admin());

drop policy if exists "Admins can create inventory movements" on public.inventory_movements;
create policy "Admins can create inventory movements"
on public.inventory_movements for insert
to authenticated
with check (
  public.is_catalog_admin()
  and created_by = (select auth.uid())
);

create or replace function public.create_catalog_item(
  p_source_ref text,
  p_product_slug text,
  p_name text,
  p_brand_id uuid,
  p_category_id uuid,
  p_description text,
  p_sku text,
  p_variant_slug text,
  p_manufacturer_model text,
  p_source_model text,
  p_color text,
  p_size text,
  p_specifications text,
  p_price_mxn numeric,
  p_stock integer,
  p_availability public.catalog_availability,
  p_published boolean
)
returns table (product_id uuid, variant_id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_product_id uuid;
  created_variant_id uuid;
begin
  if not public.is_catalog_admin() then
    raise exception 'No autorizado para administrar el catálogo';
  end if;

  if p_stock is not null and p_stock < 0 then
    raise exception 'La existencia no puede ser negativa';
  end if;

  insert into public.catalog_products (
    source_ref,
    slug,
    name,
    brand_id,
    category_id,
    description,
    status,
    data_status,
    metadata
  )
  values (
    trim(p_source_ref),
    trim(p_product_slug),
    trim(p_name),
    p_brand_id,
    p_category_id,
    coalesce(trim(p_description), ''),
    case
      when p_published then 'active'::public.catalog_product_status
      else 'draft'::public.catalog_product_status
    end,
    'base-inicial',
    jsonb_build_object('created_from', 'admin')
  )
  returning id into created_product_id;

  insert into public.catalog_variants (
    product_id,
    sku,
    slug,
    manufacturer_model,
    source_model,
    color,
    size,
    price_mxn,
    stock,
    availability,
    specifications,
    published
  )
  values (
    created_product_id,
    trim(p_sku),
    trim(p_variant_slug),
    trim(p_manufacturer_model),
    trim(p_source_model),
    nullif(trim(p_color), ''),
    nullif(trim(p_size), ''),
    p_price_mxn,
    p_stock,
    p_availability,
    coalesce(trim(p_specifications), ''),
    p_published
  )
  returning id into created_variant_id;

  if p_stock is not null and p_stock <> 0 then
    insert into public.inventory_movements (
      variant_id,
      movement_type,
      quantity_delta,
      resulting_stock,
      reference,
      note,
      created_by
    )
    values (
      created_variant_id,
      'initial',
      p_stock,
      p_stock,
      'admin:create',
      'Existencia inicial capturada desde el panel',
      (select auth.uid())
    );
  end if;

  return query select created_product_id, created_variant_id;
end;
$$;

create or replace function public.update_catalog_item(
  p_product_id uuid,
  p_variant_id uuid,
  p_source_ref text,
  p_product_slug text,
  p_name text,
  p_brand_id uuid,
  p_category_id uuid,
  p_description text,
  p_sku text,
  p_variant_slug text,
  p_manufacturer_model text,
  p_source_model text,
  p_color text,
  p_size text,
  p_specifications text,
  p_price_mxn numeric,
  p_stock integer,
  p_availability public.catalog_availability,
  p_published boolean
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  previous_stock integer;
  stock_delta integer;
begin
  if not public.is_catalog_admin() then
    raise exception 'No autorizado para administrar el catálogo';
  end if;

  if p_stock is not null and p_stock < 0 then
    raise exception 'La existencia no puede ser negativa';
  end if;

  select variant.stock
  into previous_stock
  from public.catalog_variants variant
  where variant.id = p_variant_id
    and variant.product_id = p_product_id
  for update;

  if not found then
    raise exception 'El producto o la variante no existen';
  end if;

  update public.catalog_products
  set
    source_ref = trim(p_source_ref),
    slug = trim(p_product_slug),
    name = trim(p_name),
    brand_id = p_brand_id,
    category_id = p_category_id,
    description = coalesce(trim(p_description), ''),
    status = case
      when p_published then 'active'::public.catalog_product_status
      else 'draft'::public.catalog_product_status
    end
  where id = p_product_id;

  update public.catalog_variants
  set
    sku = trim(p_sku),
    slug = trim(p_variant_slug),
    manufacturer_model = trim(p_manufacturer_model),
    source_model = trim(p_source_model),
    color = nullif(trim(p_color), ''),
    size = nullif(trim(p_size), ''),
    price_mxn = p_price_mxn,
    stock = p_stock,
    availability = p_availability,
    specifications = coalesce(trim(p_specifications), ''),
    published = p_published
  where id = p_variant_id
    and product_id = p_product_id;

  if p_stock is distinct from previous_stock then
    stock_delta := coalesce(p_stock, 0) - coalesce(previous_stock, 0);

    if stock_delta <> 0 then
      insert into public.inventory_movements (
        variant_id,
        movement_type,
        quantity_delta,
        resulting_stock,
        reference,
        note,
        created_by
      )
      values (
        p_variant_id,
        case when previous_stock is null then 'initial' else 'adjustment' end,
        stock_delta,
        p_stock,
        'admin:update',
        'Ajuste desde el panel administrativo',
        (select auth.uid())
      );
    end if;
  end if;
end;
$$;

create or replace function public.set_catalog_product_archived(
  p_product_id uuid,
  p_archived boolean
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_catalog_admin() then
    raise exception 'No autorizado para administrar el catálogo';
  end if;

  update public.catalog_products product
  set status = case
    when p_archived then 'archived'::public.catalog_product_status
    when exists (
      select 1
      from public.catalog_variants variant
      where variant.product_id = product.id
        and variant.published
    ) then 'active'::public.catalog_product_status
    else 'draft'::public.catalog_product_status
  end
  where product.id = p_product_id;

  if not found then
    raise exception 'El producto no existe';
  end if;
end;
$$;

revoke all on function public.create_catalog_item(
  text, text, text, uuid, uuid, text, text, text, text, text,
  text, text, text, numeric, integer, public.catalog_availability, boolean
) from public;
grant execute on function public.create_catalog_item(
  text, text, text, uuid, uuid, text, text, text, text, text,
  text, text, text, numeric, integer, public.catalog_availability, boolean
) to authenticated, service_role;

revoke all on function public.update_catalog_item(
  uuid, uuid, text, text, text, uuid, uuid, text, text, text,
  text, text, text, text, text, numeric, integer, public.catalog_availability, boolean
) from public;
grant execute on function public.update_catalog_item(
  uuid, uuid, text, text, text, uuid, uuid, text, text, text,
  text, text, text, text, text, numeric, integer, public.catalog_availability, boolean
) to authenticated, service_role;

revoke all on function public.set_catalog_product_archived(uuid, boolean) from public;
grant execute on function public.set_catalog_product_archived(uuid, boolean) to authenticated, service_role;

commit;
