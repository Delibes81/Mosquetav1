import type { Metadata } from 'next';
import { Banknote, CircleCheckBig, Clock3, ShoppingBag } from 'lucide-react';
import AdminOrdersTable from '@/components/admin/AdminOrdersTable';
import AdminShell from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/admin/auth';
import { getAdminOrders } from '@/lib/admin/orders';
import { formatMxn } from '@/lib/currency';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Pedidos' };

export default async function AdminOrdersPage() {
  const [session, orders] = await Promise.all([requireAdmin(), getAdminOrders()]);
  const paidOrders = orders.filter((order) => order.paymentStatus === 'paid');
  const newPaidOrders = paidOrders.filter((order) => order.fulfillmentStatus === 'new').length;
  const activeOrders = paidOrders.filter((order) => !['delivered', 'cancelled'].includes(order.fulfillmentStatus)).length;
  const paidTotal = paidOrders.reduce((total, order) => total + order.totalMxn, 0);

  return (
    <AdminShell session={session}>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <header className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-mosqueta-primary">Operación de ventas</p>
          <h1 className="mt-2 font-montserrat text-3xl font-extrabold text-slate-950">Gestor de pedidos</h1>
          <p className="mt-2 text-sm text-slate-600">Consulta pagos confirmados, entrega y avance operativo desde un solo lugar.</p>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-pink-50 p-2.5 text-mosqueta-primary"><ShoppingBag size={21} /></span>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Pedidos</span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">{orders.length}</p>
            <p className="mt-1 text-sm text-slate-500">últimos 200 registros</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><Clock3 size={21} /></span>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Por atender</span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">{newPaidOrders}</p>
            <p className="mt-1 text-sm text-slate-500">pagados y nuevos</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><CircleCheckBig size={21} /></span>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">En proceso</span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">{activeOrders}</p>
            <p className="mt-1 text-sm text-slate-500">sin entregar</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><Banknote size={21} /></span>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Cobrado</span>
            </div>
            <p className="mt-4 text-2xl font-extrabold text-slate-950">{formatMxn(paidTotal)}</p>
            <p className="mt-1 text-sm text-slate-500">en pedidos visibles</p>
          </article>
        </section>

        <AdminOrdersTable orders={orders} />
      </div>
    </AdminShell>
  );
}
