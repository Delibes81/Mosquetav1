import 'server-only';

import { cache } from 'react';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import type {
  AdminOrderDetail,
  AdminOrderHistoryEntry,
  AdminOrderItem,
  AdminOrderSummary,
  OrderFulfillmentStatus,
  OrderPaymentStatus,
} from '@/lib/admin/order-types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface OrderSummaryRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_mxn: number | string;
  payment_status: OrderPaymentStatus;
  fulfillment_status: OrderFulfillmentStatus;
  paid_at: string | null;
  created_at: string;
  items: Array<{ quantity: number }>;
}

interface OrderDetailRow extends Omit<OrderSummaryRow, 'items'> {
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  currency: string;
  subtotal_mxn: number | string;
  shipping_mxn: number | string;
  customer_phone: string;
  address_line1: string;
  address_line2: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  delivery_notes: string;
  updated_at: string;
}

interface OrderItemRow {
  id: string;
  variant_id: string | null;
  product_slug: string;
  product_name: string;
  brand: string;
  model: string;
  image_url: string;
  unit_price_mxn: number | string;
  quantity: number;
  line_total_mxn: number | string;
}

interface OrderHistoryRow {
  id: string;
  event_type: AdminOrderHistoryEntry['eventType'];
  previous_status: string | null;
  new_status: string;
  note: string;
  created_at: string;
}

function mapSummary(row: OrderSummaryRow): AdminOrderSummary {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    totalMxn: Number(row.total_mxn),
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    itemCount: row.items.reduce((total, item) => total + item.quantity, 0),
    paidAt: row.paid_at,
    createdAt: row.created_at,
  };
}

export const getAdminOrders = cache(async (): Promise<AdminOrderSummary[]> => {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      total_mxn,
      payment_status,
      fulfillment_status,
      paid_at,
      created_at,
      items:order_items(quantity)
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(`No se pudieron cargar los pedidos: ${error.message}`);
  return ((data ?? []) as unknown as OrderSummaryRow[]).map(mapSummary);
});

export async function getAdminOrder(orderId: string): Promise<AdminOrderDetail> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const [orderResult, itemsResult, historyResult] = await Promise.all([
    supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle(),
    supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true }),
    supabase
      .from('order_status_history')
      .select('id,event_type,previous_status,new_status,note,created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false }),
  ]);

  if (orderResult.error) throw new Error(`No se pudo cargar el pedido: ${orderResult.error.message}`);
  if (!orderResult.data) notFound();
  if (itemsResult.error) throw new Error(`No se pudieron cargar las partidas: ${itemsResult.error.message}`);
  if (historyResult.error) throw new Error(`No se pudo cargar el historial: ${historyResult.error.message}`);

  const row = orderResult.data as OrderDetailRow;
  const items = ((itemsResult.data ?? []) as OrderItemRow[]).map((item): AdminOrderItem => ({
    id: item.id,
    variantId: item.variant_id,
    productSlug: item.product_slug,
    productName: item.product_name,
    brand: item.brand,
    model: item.model,
    imageUrl: item.image_url,
    unitPriceMxn: Number(item.unit_price_mxn),
    quantity: item.quantity,
    lineTotalMxn: Number(item.line_total_mxn),
  }));
  const history = ((historyResult.data ?? []) as OrderHistoryRow[]).map((entry): AdminOrderHistoryEntry => ({
    id: entry.id,
    eventType: entry.event_type,
    previousStatus: entry.previous_status,
    newStatus: entry.new_status,
    note: entry.note,
    createdAt: entry.created_at,
  }));

  return {
    ...mapSummary({ ...row, items: items.map((item) => ({ quantity: item.quantity })) }),
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    currency: row.currency,
    subtotalMxn: Number(row.subtotal_mxn),
    shippingMxn: Number(row.shipping_mxn),
    customerPhone: row.customer_phone,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    neighborhood: row.neighborhood,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    deliveryNotes: row.delivery_notes,
    updatedAt: row.updated_at,
    items,
    history,
  };
}
