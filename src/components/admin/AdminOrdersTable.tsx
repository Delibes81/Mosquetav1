'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, ShoppingBag } from 'lucide-react';
import type {
  AdminOrderSummary,
  OrderFulfillmentStatus,
  OrderPaymentStatus,
} from '@/lib/admin/order-types';
import { fulfillmentStatusLabels, paymentStatusLabels } from '@/lib/admin/order-types';
import { formatMxn } from '@/lib/currency';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function paymentBadge(status: OrderPaymentStatus) {
  if (status === 'paid') return 'bg-emerald-50 text-emerald-700';
  if (status === 'pending') return 'bg-amber-50 text-amber-700';
  if (status.includes('refund')) return 'bg-violet-50 text-violet-700';
  return 'bg-red-50 text-red-700';
}

function fulfillmentBadge(status: OrderFulfillmentStatus) {
  if (status === 'delivered') return 'bg-emerald-50 text-emerald-700';
  if (status === 'cancelled') return 'bg-red-50 text-red-700';
  if (status === 'new') return 'bg-pink-50 text-mosqueta-primary';
  return 'bg-blue-50 text-blue-700';
}

export default function AdminOrdersTable({ orders }: { orders: AdminOrderSummary[] }) {
  const [query, setQuery] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'all' | OrderPaymentStatus>('all');
  const [fulfillmentStatus, setFulfillmentStatus] = useState<'all' | OrderFulfillmentStatus>('all');

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesQuery = !normalizedQuery || [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
      ].join(' ').toLowerCase().includes(normalizedQuery);
      const matchesPayment = paymentStatus === 'all' || order.paymentStatus === paymentStatus;
      const matchesFulfillment = fulfillmentStatus === 'all' || order.fulfillmentStatus === fulfillmentStatus;

      return matchesQuery && matchesPayment && matchesFulfillment;
    });
  }, [fulfillmentStatus, orders, paymentStatus, query]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[minmax(280px,1fr)_220px_220px]">
        <label className="relative">
          <span className="sr-only">Buscar pedidos</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por pedido, cliente o correo"
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-mosqueta-primary focus:ring-4 focus:ring-pink-100"
          />
        </label>
        <select
          aria-label="Filtrar por estado de pago"
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value as 'all' | OrderPaymentStatus)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-mosqueta-primary"
        >
          <option value="all">Todos los pagos</option>
          {Object.entries(paymentStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select
          aria-label="Filtrar por estado operativo"
          value={fulfillmentStatus}
          onChange={(event) => setFulfillmentStatus(event.target.value as 'all' | OrderFulfillmentStatus)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-mosqueta-primary"
        >
          <option value="all">Todos los procesos</option>
          {Object.entries(fulfillmentStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Pedido</th>
              <th className="px-5 py-3 font-bold">Cliente</th>
              <th className="px-5 py-3 font-bold">Total</th>
              <th className="px-5 py-3 font-bold">Pago</th>
              <th className="px-5 py-3 font-bold">Operación</th>
              <th className="w-14 px-5 py-3"><span className="sr-only">Abrir</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="transition hover:bg-pink-50/40">
                <td className="px-5 py-4">
                  <p className="font-mono text-xs font-bold text-slate-950">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-950">{order.customerName}</p>
                  <p className="mt-1 max-w-64 truncate text-xs text-slate-500">{order.customerEmail}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-extrabold text-slate-950">{formatMxn(order.totalMxn)}</p>
                  <p className="mt-1 text-xs text-slate-500">{order.itemCount} {order.itemCount === 1 ? 'pieza' : 'piezas'}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${paymentBadge(order.paymentStatus)}`}>
                    {paymentStatusLabels[order.paymentStatus]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${fulfillmentBadge(order.fulfillmentStatus)}`}>
                    {fulfillmentStatusLabels[order.fulfillmentStatus]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    aria-label={`Abrir ${order.orderNumber}`}
                    className="inline-flex rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-mosqueta-primary hover:shadow"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-bold text-slate-800">No encontramos pedidos con esos filtros.</p>
          <p className="mt-2 text-sm text-slate-500">Los pedidos nuevos aparecerán después de iniciar un pago en Stripe.</p>
        </div>
      ) : (
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-500">
          Mostrando {filteredOrders.length} de {orders.length} pedidos recientes
        </div>
      )}
    </section>
  );
}
