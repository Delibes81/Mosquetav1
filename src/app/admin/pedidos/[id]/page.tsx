import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Truck,
} from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { updateOrderFulfillmentStatusAction } from '@/app/admin/pedidos/actions';
import { requireAdmin } from '@/lib/admin/auth';
import {
  fulfillmentStatuses,
  fulfillmentStatusLabels,
  paymentStatusLabels,
} from '@/lib/admin/order-types';
import type { OrderPaymentStatus } from '@/lib/admin/order-types';
import { getAdminOrder } from '@/lib/admin/orders';
import { formatMxn } from '@/lib/currency';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Detalle del pedido' };

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

function paymentBadge(status: OrderPaymentStatus) {
  if (status === 'paid') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (status === 'pending') return 'border-amber-200 bg-amber-50 text-amber-800';
  if (status.includes('refund')) return 'border-violet-200 bg-violet-50 text-violet-800';
  return 'border-red-200 bg-red-50 text-red-800';
}

function historyLabel(status: string) {
  const [kind, value] = status.split(':');
  if (kind === 'payment' && value in paymentStatusLabels) {
    return paymentStatusLabels[value as keyof typeof paymentStatusLabels];
  }
  if (kind === 'fulfillment' && value in fulfillmentStatusLabels) {
    return fulfillmentStatusLabels[value as keyof typeof fulfillmentStatusLabels];
  }
  return status;
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}

export default async function AdminOrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [session, order] = await Promise.all([requireAdmin(), getAdminOrder(id)]);
  const updateStatusAction = updateOrderFulfillmentStatusAction.bind(null, order.id);
  const stripeModePath = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? '' : 'test/';
  const stripePaymentUrl = order.stripePaymentIntentId
    ? `https://dashboard.stripe.com/${stripeModePath}payments/${order.stripePaymentIntentId}`
    : null;

  return (
    <AdminShell session={session}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <Link href="/admin/pedidos" className="inline-flex items-center gap-2 text-sm font-bold text-mosqueta-primary hover:underline">
          <ArrowLeft size={17} /> Volver a pedidos
        </Link>

        <header className="mt-5 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-mosqueta-primary">Detalle de venta</p>
            <h1 className="mt-2 font-montserrat text-3xl font-extrabold text-slate-950">{order.orderNumber}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={16} /> {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold ${paymentBadge(order.paymentStatus)}`}>
              <CreditCard size={16} /> {paymentStatusLabels[order.paymentStatus]}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-800">
              <PackageCheck size={16} /> {fulfillmentStatusLabels[order.fulfillmentStatus]}
            </span>
          </div>
        </header>

        {query.updated === '1' && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <CheckCircle2 size={19} /> Estado operativo actualizado.
          </div>
        )}
        {query.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            No se pudo actualizar el pedido. Intenta nuevamente.
          </div>
        )}

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <h2 className="font-montserrat text-xl font-extrabold text-slate-950">Productos</h2>
                <p className="mt-1 text-sm text-slate-500">{order.itemCount} {order.itemCount === 1 ? 'pieza' : 'piezas'} en el pedido</p>
              </div>
              <div className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <article key={item.id} className="flex gap-4 p-5 sm:p-6">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-contain p-2" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-mosqueta-secondary">{item.brand} · {item.model}</p>
                      <p className="mt-1 font-bold text-slate-950">{item.productName}</p>
                      <p className="mt-2 text-sm text-slate-500">{item.quantity} × {formatMxn(item.unitPriceMxn)}</p>
                    </div>
                    <p className="shrink-0 font-extrabold text-slate-950">{formatMxn(item.lineTotalMxn)}</p>
                  </article>
                ))}
              </div>
              <dl className="space-y-3 border-t border-slate-200 bg-slate-50 px-5 py-5 text-sm sm:px-6">
                <div className="flex justify-between gap-4 text-slate-600"><dt>Subtotal</dt><dd className="font-semibold text-slate-950">{formatMxn(order.subtotalMxn)}</dd></div>
                <div className="flex justify-between gap-4 text-slate-600"><dt>Entrega</dt><dd className="font-semibold text-slate-950">{formatMxn(order.shippingMxn)}</dd></div>
                <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-lg"><dt className="font-bold text-slate-950">Total</dt><dd className="font-extrabold text-mosqueta-primary">{formatMxn(order.totalMxn)}</dd></div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-montserrat text-xl font-extrabold text-slate-950">Cliente y entrega</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Contacto</p>
                  <p className="mt-2 font-bold text-slate-950">{order.customerName}</p>
                  <a href={`mailto:${order.customerEmail}`} className="mt-2 flex items-center gap-2 text-sm text-slate-600 hover:text-mosqueta-primary"><Mail size={16} /> {order.customerEmail}</a>
                  <a href={`tel:${order.customerPhone}`} className="mt-2 flex items-center gap-2 text-sm text-slate-600 hover:text-mosqueta-primary"><Phone size={16} /> {order.customerPhone}</a>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Domicilio</p>
                  <address className="mt-2 flex gap-2 text-sm not-italic leading-relaxed text-slate-700">
                    <MapPin size={17} className="mt-0.5 shrink-0 text-mosqueta-secondary" />
                    <span>
                      {order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ''}<br />
                      {order.neighborhood}, {order.city}<br />
                      {order.state}, C.P. {order.postalCode}, {order.country}
                    </span>
                  </address>
                </div>
              </div>
              {order.deliveryNotes && (
                <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-bold text-slate-900">Referencias de entrega</p>
                  <p className="mt-1 leading-relaxed">{order.deliveryNotes}</p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-montserrat text-xl font-extrabold text-slate-950">Historial</h2>
              <ol className="mt-5 space-y-4">
                {order.history.map((entry) => (
                  <li key={entry.id} className="relative border-l-2 border-slate-200 pl-5">
                    <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-mosqueta-primary ring-4 ring-pink-50" />
                    <p className="font-bold text-slate-900">{historyLabel(entry.newStatus)}</p>
                    {entry.note && <p className="mt-1 text-sm text-slate-600">{entry.note}</p>}
                    <p className="mt-1 text-xs text-slate-400">{formatDate(entry.createdAt)}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><Truck size={20} /></span>
                <div>
                  <h2 className="font-montserrat text-lg font-extrabold text-slate-950">Avance operativo</h2>
                  <p className="text-xs text-slate-500">El pago no se modifica aquí.</p>
                </div>
              </div>

              <form action={updateStatusAction} className="mt-5 space-y-4">
                <label className="block text-sm font-bold text-slate-700">
                  Estado
                  <select name="status" defaultValue={order.fulfillmentStatus} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-mosqueta-primary">
                    {fulfillmentStatuses.map((status) => <option key={status} value={status}>{fulfillmentStatusLabels[status]}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-bold text-slate-700">
                  Nota interna
                  <textarea name="note" rows={3} maxLength={500} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-mosqueta-primary" placeholder="Ej. Entrega coordinada para el viernes" />
                </label>
                <button type="submit" className="w-full rounded-xl bg-mosqueta-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-pink-700">
                  Guardar estado
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-montserrat text-lg font-extrabold text-slate-950">Referencia de pago</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Sesión de Stripe</dt><dd className="mt-1 break-all font-mono text-xs text-slate-700">{order.stripeCheckoutSessionId}</dd></div>
                {order.stripePaymentIntentId && <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Payment Intent</dt><dd className="mt-1 break-all font-mono text-xs text-slate-700">{order.stripePaymentIntentId}</dd></div>}
              </dl>
              {stripePaymentUrl && (
                <a href={stripePaymentUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-mosqueta-primary hover:underline">
                  Abrir pago en Stripe <ExternalLink size={15} />
                </a>
              )}
            </section>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
