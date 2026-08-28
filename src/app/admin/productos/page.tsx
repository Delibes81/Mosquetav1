import type { Metadata } from 'next';
import Link from 'next/link';
import { Boxes, CircleDollarSign, PackagePlus, TriangleAlert } from 'lucide-react';
import AdminCatalogTable from '@/components/admin/AdminCatalogTable';
import AdminShell from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/admin/auth';
import { getAdminCatalogItems } from '@/lib/admin/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Productos' };

export default async function AdminProductsPage() {
  const [session, items] = await Promise.all([requireAdmin(), getAdminCatalogItems()]);
  const active = items.filter((item) => item.status === 'active').length;
  const withoutPrice = items.filter((item) => item.priceMxn === null).length;
  const stockPending = items.filter((item) => item.stock === null).length;

  return (
    <AdminShell session={session}>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-mosqueta-primary">Catálogo operativo</p>
            <h1 className="mt-2 font-montserrat text-3xl font-extrabold text-slate-950">Productos y existencias</h1>
            <p className="mt-2 text-sm text-slate-600">Administra cada SKU sin entrar al panel técnico de Supabase.</p>
          </div>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-mosqueta-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-700"
          >
            <PackagePlus size={19} />
            Nuevo producto
          </Link>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><Boxes size={21} /></span>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Activos</span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">{active}</p>
            <p className="mt-1 text-sm text-slate-500">de {items.length} variantes</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><CircleDollarSign size={21} /></span>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Sin precio</span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">{withoutPrice}</p>
            <p className="mt-1 text-sm text-slate-500">requieren captura</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-violet-50 p-2.5 text-violet-700"><TriangleAlert size={21} /></span>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Stock pendiente</span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">{stockPending}</p>
            <p className="mt-1 text-sm text-slate-500">por confirmar</p>
          </article>
        </section>

        <AdminCatalogTable items={items} />
      </div>
    </AdminShell>
  );
}
