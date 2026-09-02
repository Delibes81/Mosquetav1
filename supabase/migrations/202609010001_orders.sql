begin;

create sequence if not exists public.mosqueta_order_number_seq;

create table if not exists public.orders (
  id uuid primary key,
  order_number text not null unique default (
    'MOS-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.mosqueta_order_number_seq')::text, 6, '0')
  ),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text unique,
  currency text not null default 'mxn' check (currency = lower(currency) and length(currency) = 3),
  subtotal_mxn numeric(12, 2) not null check (subtotal_mxn >= 0),
  shipping_mxn numeric(12, 2) not null default 0 check (shipping_mxn >= 0),
  total_mxn numeric(12, 2) not null check (total_mxn >= 0 and total_mxn = subtotal_mxn + shipping_mxn),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'partially_refunded', 'refunded')),
  fulfillment_status text not null default 'new'
    check (fulfillment_status in ('new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  address_line1 text not null,
  address_line2 text,
  neighborhood text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'MX' check (length(country) = 2),
  delivery_notes text not null default '',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.catalog_variants(id) on delete set null,
  product_slug text not null,
  product_name text not null,
  brand text not null,
  model text not null,
  image_url text not null,
  unit_price_mxn numeric(12, 2) not null check (unit_price_mxn >= 0),
  quantity integer not null check (quantity > 0 and quantity <= 99),
  line_total_mxn numeric(12, 2) generated always as (unit_price_mxn * quantity) stored,
  created_at timestamptz not null default now(),
  unique (order_id, variant_id)
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null check (event_type in ('created', 'payment', 'fulfillment')),
  previous_status text,
  new_status text not null,
  note text not null default '',
  stripe_event_id text unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  order_id uuid references public.orders(id) on delete set null,
  processed_at timestamptz not null default now()
);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_payment_status_idx on public.orders(payment_status, created_at desc);
create index if not exists orders_fulfillment_status_idx on public.orders(fulfillment_status, created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_status_history_order_id_idx on public.order_status_history(order_id, created_at desc);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.stripe_webhook_events enable row level security;

revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;
revoke all on table public.order_status_history from anon, authenticated;
revoke all on table public.stripe_webhook_events from anon, authenticated;

grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;
grant select on table public.order_status_history to authenticated;

grant all on table public.orders to service_role;
grant all on table public.order_items to service_role;
grant all on table public.order_status_history to service_role;
grant all on table public.stripe_webhook_events to service_role;
grant usage, select on sequence public.mosqueta_order_number_seq to service_role;

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
on public.orders for select
to authenticated
using (public.is_catalog_admin());

drop policy if exists "Admins can read order items" on public.order_items;
create policy "Admins can read order items"
on public.order_items for select
to authenticated
using (
  public.is_catalog_admin()
  and exists (
    select 1 from public.orders order_record where order_record.id = order_items.order_id
  )
);

drop policy if exists "Admins can read order history" on public.order_status_history;
create policy "Admins can read order history"
on public.order_status_history for select
to authenticated
using (
  public.is_catalog_admin()
  and exists (
    select 1 from public.orders order_record where order_record.id = order_status_history.order_id
  )
);

create or replace function public.create_checkout_order(
  p_order_id uuid,
  p_stripe_checkout_session_id text,
  p_currency text,
  p_shipping_mxn numeric,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address_line1 text,
  p_address_line2 text,
  p_neighborhood text,
  p_city text,
  p_state text,
  p_postal_code text,
  p_country text,
  p_delivery_notes text,
  p_items jsonb
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  computed_subtotal numeric(12, 2);
  created_order_number text;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 100 then
    raise exception 'El pedido debe contener entre 1 y 100 partidas';
  end if;

  select coalesce(sum(
    (item.value ->> 'unit_price_mxn')::numeric * (item.value ->> 'quantity')::integer
  ), 0)
  into computed_subtotal
  from jsonb_array_elements(p_items) as item(value);

  if computed_subtotal <= 0 then
    raise exception 'El total del pedido debe ser mayor que cero';
  end if;

  insert into public.orders (
    id,
    stripe_checkout_session_id,
    currency,
    subtotal_mxn,
    shipping_mxn,
    total_mxn,
    customer_name,
    customer_email,
    customer_phone,
    address_line1,
    address_line2,
    neighborhood,
    city,
    state,
    postal_code,
    country,
    delivery_notes
  )
  values (
    p_order_id,
    trim(p_stripe_checkout_session_id),
    lower(trim(p_currency)),
    computed_subtotal,
    coalesce(p_shipping_mxn, 0),
    computed_subtotal + coalesce(p_shipping_mxn, 0),
    trim(p_customer_name),
    lower(trim(p_customer_email)),
    trim(p_customer_phone),
    trim(p_address_line1),
    nullif(trim(p_address_line2), ''),
    trim(p_neighborhood),
    trim(p_city),
    trim(p_state),
    trim(p_postal_code),
    upper(trim(p_country)),
    coalesce(trim(p_delivery_notes), '')
  )
  returning order_number into created_order_number;

  insert into public.order_items (
    order_id,
    variant_id,
    product_slug,
    product_name,
    brand,
    model,
    image_url,
    unit_price_mxn,
    quantity
  )
  select
    p_order_id,
    (item.value ->> 'variant_id')::uuid,
    item.value ->> 'product_slug',
    item.value ->> 'product_name',
    item.value ->> 'brand',
    item.value ->> 'model',
    item.value ->> 'image_url',
    (item.value ->> 'unit_price_mxn')::numeric,
    (item.value ->> 'quantity')::integer
  from jsonb_array_elements(p_items) as item(value);

  insert into public.order_status_history (
    order_id,
    event_type,
    new_status,
    note
  )
  values (
    p_order_id,
    'created',
    'payment:pending',
    'Pedido creado y sesión de Stripe preparada.'
  );

  return created_order_number;
end;
$$;

create or replace function public.mark_checkout_order_paid(
  p_order_id uuid,
  p_stripe_checkout_session_id text,
  p_stripe_payment_intent_id text,
  p_currency text,
  p_total_mxn numeric,
  p_stripe_event_id text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  expected_total numeric(12, 2);
  expected_currency text;
  inserted_events integer;
  previous_payment_status text;
begin
  insert into public.stripe_webhook_events (event_id, event_type, order_id)
  values (p_stripe_event_id, 'checkout.session.completed', p_order_id)
  on conflict (event_id) do nothing;

  get diagnostics inserted_events = row_count;
  if inserted_events = 0 then
    return false;
  end if;

  select order_record.total_mxn, order_record.currency, order_record.payment_status
  into expected_total, expected_currency, previous_payment_status
  from public.orders order_record
  where order_record.id = p_order_id
    and order_record.stripe_checkout_session_id = p_stripe_checkout_session_id
  for update;

  if not found then
    raise exception 'El pedido del evento de Stripe no existe';
  end if;

  if expected_total <> p_total_mxn or expected_currency <> lower(trim(p_currency)) then
    raise exception 'El monto o moneda de Stripe no coincide con el pedido';
  end if;

  update public.orders
  set
    stripe_payment_intent_id = nullif(trim(p_stripe_payment_intent_id), ''),
    payment_status = 'paid',
    paid_at = coalesce(paid_at, now())
  where id = p_order_id;

  if previous_payment_status <> 'paid' then
    insert into public.order_status_history (
      order_id,
      event_type,
      previous_status,
      new_status,
      note,
      stripe_event_id
    )
    values (
      p_order_id,
      'payment',
      'payment:' || previous_payment_status,
      'payment:paid',
      'Pago confirmado mediante webhook de Stripe.',
      p_stripe_event_id
    );
  end if;

  return true;
end;
$$;

create or replace function public.update_order_fulfillment_status(
  p_order_id uuid,
  p_new_status text,
  p_note text default ''
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  previous_fulfillment_status text;
begin
  if not public.is_catalog_admin() then
    raise exception 'No autorizado para administrar pedidos';
  end if;

  if p_new_status not in ('new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Estado operativo no válido';
  end if;

  select order_record.fulfillment_status
  into previous_fulfillment_status
  from public.orders order_record
  where order_record.id = p_order_id
  for update;

  if not found then
    raise exception 'El pedido no existe';
  end if;

  if previous_fulfillment_status = p_new_status then
    return;
  end if;

  update public.orders
  set fulfillment_status = p_new_status
  where id = p_order_id;

  insert into public.order_status_history (
    order_id,
    event_type,
    previous_status,
    new_status,
    note,
    created_by
  )
  values (
    p_order_id,
    'fulfillment',
    'fulfillment:' || previous_fulfillment_status,
    'fulfillment:' || p_new_status,
    left(coalesce(trim(p_note), ''), 500),
    (select auth.uid())
  );
end;
$$;

revoke all on function public.create_checkout_order(
  uuid, text, text, numeric, text, text, text, text,
  text, text, text, text, text, text, text, jsonb
) from public;
grant execute on function public.create_checkout_order(
  uuid, text, text, numeric, text, text, text, text,
  text, text, text, text, text, text, text, jsonb
) to service_role;

revoke all on function public.mark_checkout_order_paid(
  uuid, text, text, text, numeric, text
) from public;
grant execute on function public.mark_checkout_order_paid(
  uuid, text, text, text, numeric, text
) to service_role;

revoke all on function public.update_order_fulfillment_status(uuid, text, text) from public;
grant execute on function public.update_order_fulfillment_status(uuid, text, text) to authenticated, service_role;

commit;
