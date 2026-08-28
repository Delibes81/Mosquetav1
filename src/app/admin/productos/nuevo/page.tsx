import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import CatalogItemForm from '@/components/admin/CatalogItemForm';
import { requireAdmin } from '@/lib/admin/auth';
import { getCatalogOptions } from '@/lib/admin/catalog';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Nuevo producto' };

export default async function NewAdminProductPage() {
  const [session, options] = await Promise.all([requireAdmin(), getCatalogOptions()]);

  return (
    <AdminShell session={session}>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <header className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-mosqueta-primary">Alta de catálogo</p>
          <h1 className="mt-2 font-montserrat text-3xl font-extrabold text-slate-950">Nuevo producto</h1>
          <p className="mt-2 text-sm text-slate-600">Crea el producto y su primera variante en una sola operación.</p>
        </header>

        <CatalogItemForm item={null} brands={options.brands} categories={options.categories} />
      </div>
    </AdminShell>
  );
}
