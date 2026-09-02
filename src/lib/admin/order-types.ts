export type OrderPaymentStatus = 'pending' | 'paid' | 'failed' | 'partially_refunded' | 'refunded';
export type OrderFulfillmentStatus = 'new' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalMxn: number;
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  itemCount: number;
  paidAt: string | null;
  createdAt: string;
}

export interface AdminOrderItem {
  id: string;
  variantId: string | null;
  productSlug: string;
  productName: string;
  brand: string;
  model: string;
  imageUrl: string;
  unitPriceMxn: number;
  quantity: number;
  lineTotalMxn: number;
}

export interface AdminOrderHistoryEntry {
  id: string;
  eventType: 'created' | 'payment' | 'fulfillment';
  previousStatus: string | null;
  newStatus: string;
  note: string;
  createdAt: string;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  currency: string;
  subtotalMxn: number;
  shippingMxn: number;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryNotes: string;
  updatedAt: string;
  items: AdminOrderItem[];
  history: AdminOrderHistoryEntry[];
}

export const paymentStatusLabels: Record<OrderPaymentStatus, string> = {
  pending: 'Pago pendiente',
  paid: 'Pagado',
  failed: 'Pago fallido',
  partially_refunded: 'Reembolso parcial',
  refunded: 'Reembolsado',
};

export const fulfillmentStatusLabels: Record<OrderFulfillmentStatus, string> = {
  new: 'Nuevo',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const fulfillmentStatuses = Object.keys(fulfillmentStatusLabels) as OrderFulfillmentStatus[];
