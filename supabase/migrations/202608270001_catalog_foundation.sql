begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.catalog_product_status as enum ('draft', 'active', 'archived');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.catalog_availability as enum ('por-confirmar', 'en-stock', 'sobre-pedido', 'agotado');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.catalog_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.catalog_categories(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  source_ref text not null unique,
  slug text not null unique,
  name text not null,
  brand_id uuid not null references public.catalog_brands(id),
  category_id uuid not null references public.catalog_categories(id),
  description text not null default '',
  status public.catalog_product_status not null default 'draft',
  data_status text not null default 'base-inicial'
    check (data_status in ('base-inicial', 'requiere-revision')),
  source_row integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products(id) on delete cascade,
  sku text not null unique,
  slug text not null unique,
  manufacturer_model text not null,
  source_model text not null,
  color text,
  size text,
  price_mxn numeric(12, 2) check (price_mxn is null or price_mxn >= 0),
  stock integer check (stock is null or stock >= 0),
  availability public.catalog_availability not null default 'por-confirmar',
  specifications text not null default '',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products(id) on delete cascade,
  variant_id uuid references public.catalog_variants(id) on delete cascade,
  storage_path text not null,
  alt_text text not null default '',
  image_status text not null default 'referencia'
    check (image_status in ('referencia', 'final')),
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, variant_id, storage_path)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.catalog_variants(id) on delete cascade,
  movement_type text not null
    check (movement_type in ('initial', 'sale', 'adjustment', 'return', 'reservation', 'release')),
  quantity_delta integer not null check (quantity_delta <> 0),
  resulting_stock integer check (resulting_stock is null or resulting_stock >= 0),
  reference text,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists catalog_brands_set_updated_at on public.catalog_brands;
create trigger catalog_brands_set_updated_at
before update on public.catalog_brands
for each row execute function public.set_updated_at();

drop trigger if exists catalog_categories_set_updated_at on public.catalog_categories;
create trigger catalog_categories_set_updated_at
before update on public.catalog_categories
for each row execute function public.set_updated_at();

drop trigger if exists catalog_products_set_updated_at on public.catalog_products;
create trigger catalog_products_set_updated_at
before update on public.catalog_products
for each row execute function public.set_updated_at();

drop trigger if exists catalog_variants_set_updated_at on public.catalog_variants;
create trigger catalog_variants_set_updated_at
before update on public.catalog_variants
for each row execute function public.set_updated_at();

drop trigger if exists catalog_product_images_set_updated_at on public.catalog_product_images;
create trigger catalog_product_images_set_updated_at
before update on public.catalog_product_images
for each row execute function public.set_updated_at();

create index if not exists catalog_products_status_idx on public.catalog_products(status);
create index if not exists catalog_products_brand_id_idx on public.catalog_products(brand_id);
create index if not exists catalog_products_category_id_idx on public.catalog_products(category_id);
create index if not exists catalog_variants_product_id_idx on public.catalog_variants(product_id);
create index if not exists catalog_variants_model_idx on public.catalog_variants(manufacturer_model);
create index if not exists catalog_product_images_product_id_idx on public.catalog_product_images(product_id);
create index if not exists catalog_product_images_variant_id_idx on public.catalog_product_images(variant_id);
create index if not exists inventory_movements_variant_id_created_at_idx
  on public.inventory_movements(variant_id, created_at desc);

alter table public.catalog_brands enable row level security;
alter table public.catalog_categories enable row level security;
alter table public.catalog_products enable row level security;
alter table public.catalog_variants enable row level security;
alter table public.catalog_product_images enable row level security;
alter table public.inventory_movements enable row level security;

revoke all on table public.catalog_brands from anon, authenticated;
revoke all on table public.catalog_categories from anon, authenticated;
revoke all on table public.catalog_products from anon, authenticated;
revoke all on table public.catalog_variants from anon, authenticated;
revoke all on table public.catalog_product_images from anon, authenticated;
revoke all on table public.inventory_movements from anon, authenticated;

grant select on table public.catalog_brands to anon, authenticated;
grant select on table public.catalog_categories to anon, authenticated;
grant select on table public.catalog_products to anon, authenticated;
grant select on table public.catalog_variants to anon, authenticated;
grant select on table public.catalog_product_images to anon, authenticated;

grant all on table public.catalog_brands to service_role;
grant all on table public.catalog_categories to service_role;
grant all on table public.catalog_products to service_role;
grant all on table public.catalog_variants to service_role;
grant all on table public.catalog_product_images to service_role;
grant all on table public.inventory_movements to service_role;

drop policy if exists "Public can read brands" on public.catalog_brands;
create policy "Public can read brands"
on public.catalog_brands for select
to anon, authenticated
using (true);

drop policy if exists "Public can read categories" on public.catalog_categories;
create policy "Public can read categories"
on public.catalog_categories for select
to anon, authenticated
using (true);

drop policy if exists "Public can read active products" on public.catalog_products;
create policy "Public can read active products"
on public.catalog_products for select
to anon, authenticated
using (status = 'active');

drop policy if exists "Public can read published variants" on public.catalog_variants;
create policy "Public can read published variants"
on public.catalog_variants for select
to anon, authenticated
using (
  published
  and exists (
    select 1
    from public.catalog_products product
    where product.id = catalog_variants.product_id
      and product.status = 'active'
  )
);

drop policy if exists "Public can read product images" on public.catalog_product_images;
create policy "Public can read product images"
on public.catalog_product_images for select
to anon, authenticated
using (
  exists (
    select 1
    from public.catalog_products product
    where product.id = catalog_product_images.product_id
      and product.status = 'active'
  )
  and (
    variant_id is null
    or exists (
      select 1
      from public.catalog_variants variant
      where variant.id = catalog_product_images.variant_id
        and variant.published
    )
  )
);

create or replace view public.catalog_products_public
with (security_invoker = true)
as
select
  variant.id,
  variant.slug,
  product.name,
  brand.name as brand,
  variant.manufacturer_model as model,
  variant.source_model,
  category.name as category,
  variant.color,
  variant.size,
  variant.specifications,
  variant.price_mxn,
  variant.stock,
  variant.availability,
  image.storage_path as image,
  coalesce(image.image_status, 'referencia') as image_status,
  product.source_row,
  variant.published,
  product.data_status,
  variant.sort_order
from public.catalog_variants variant
join public.catalog_products product on product.id = variant.product_id
join public.catalog_brands brand on brand.id = product.brand_id
join public.catalog_categories category on category.id = product.category_id
left join lateral (
  select candidate.storage_path, candidate.image_status
  from public.catalog_product_images candidate
  where candidate.product_id = product.id
    and (candidate.variant_id = variant.id or candidate.variant_id is null)
  order by
    (candidate.variant_id = variant.id) desc,
    candidate.is_primary desc,
    candidate.sort_order asc,
    candidate.created_at asc
  limit 1
) image on true
where product.status = 'active'
  and variant.published;

revoke all on table public.catalog_products_public from anon, authenticated;
grant select on table public.catalog_products_public to anon, authenticated;
grant all on table public.catalog_products_public to service_role;

commit;
