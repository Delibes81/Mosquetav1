begin;

-- La función valida is_catalog_admin() antes de acceder al pedido.
-- Sólo esta operación puede escribir el estado y su historial de forma atómica;
-- authenticated conserva únicamente lectura sobre las tablas de pedidos.
alter function public.update_order_fulfillment_status(uuid, text, text)
  security definer;
alter function public.update_order_fulfillment_status(uuid, text, text)
  set search_path = '';

revoke all on function public.update_order_fulfillment_status(uuid, text, text)
  from public, anon;
grant execute on function public.update_order_fulfillment_status(uuid, text, text)
  to authenticated, service_role;

commit;
