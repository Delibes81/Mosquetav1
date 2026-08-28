import type { Metadata } from 'next';
import { Archive, RotateCcw } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import CatalogItemForm from '@/components/admin/CatalogItemForm';
import { setProductArchivedAction } from '@/app/admin/productos/actions';
import { requireAdmin } from '@/lib/admin/auth';
import { getAdminCatalogItem, getCatalogOptions } from '@/lib/admin/catalog';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Editar producto' };

export default async function EditAdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, item, options] = await Promise.all([
    requireAdmin(),
    getAdminCatalogItem(id),
    getCatalogOptions(),
  ]);
  const isArchived = item.status === 'archived';
  const archiveAction = setProductArchivedAction.bind(null, item.productId, !isArchived);

  return (
    <AdminShell session={session}>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-mosqueta-primary">Edición de catálogo</p>
            <h1 className="mt-2 font-montserrat text-3xl font-extrabold text-slate-950">{item.name}</h1>
            <p className="mt-2 font-mono text-xs font-semibold text-slate-500">{item.sku} · {item.manufacturerModel}</p>
          </div>
          <form action={archiveAction}>
            <button
              type="submit"
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                isArchived
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              {isArchived ? <RotateCcw size={17} /> : <Archive size={17} />}
              {isArchived ? 'Restaurar producto' : 'Archivar producto'}
            </button>
          </form>
        </header>

        <CatalogItemForm item={item} brands={options.brands} categories={options.categories} />
      </div>
    </AdminShell>
  );
}
