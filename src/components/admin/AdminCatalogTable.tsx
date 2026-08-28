"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Archive, ChevronRight, Search } from 'lucide-react';
import type { AdminCatalogItem, CatalogProductStatus } from '@/lib/admin/catalog-types';

const statusLabels: Record<CatalogProductStatus, string> = {
  active: 'Activo',
  draft: 'Borrador',
  archived: 'Archivado',
};

function formatMoney(value: number | null) {
  if (value === null) return 'Pendiente';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AdminCatalogTable({ items }: { items: AdminCatalogItem[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | CatalogProductStatus>('all');

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = status === 'all' || item.status === status;
      const matchesQuery =
        !normalizedQuery ||
        [item.name, item.brandName, item.manufacturerModel, item.sku, item.categoryName]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [items, query, status]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar productos</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por producto, SKU, marca o modelo"
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-mosqueta-primary focus:ring-4 focus:ring-pink-100"
          />
        </label>
        <select
          aria-label="Filtrar por estado"
          value={status}
          onChange={(event) => setStatus(event.target.value as 'all' | CatalogProductStatus)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-mosqueta-primary"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="draft">Borradores</option>
          <option value="archived">Archivados</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Producto</th>
              <th className="px-5 py-3 font-bold">SKU / modelo</th>
              <th className="px-5 py-3 font-bold">Precio</th>
              <th className="px-5 py-3 font-bold">Stock</th>
              <th className="px-5 py-3 font-bold">Estado</th>
              <th className="w-14 px-5 py-3"><span className="sr-only">Editar</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <tr key={item.variantId} className="transition hover:bg-pink-50/40">
                <td className="px-5 py-4">
                  <p className="max-w-sm font-bold text-slate-950">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.brandName} · {item.categoryName}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-mono text-xs font-semibold text-slate-700">{item.sku}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.manufacturerModel}</p>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-800">{formatMoney(item.priceMxn)}</td>
                <td className="px-5 py-4">
                  {item.stock === null ? (
                    <span className="text-slate-500">Por confirmar</span>
                  ) : (
                    <span className={item.stock === 0 ? 'font-bold text-red-600' : 'font-bold text-slate-800'}>
                      {item.stock}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      item.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.status === 'archived'
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.status === 'archived' ? <Archive size={12} /> : null}
                    {statusLabels[item.status]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/productos/${item.variantId}`}
                    aria-label={`Editar ${item.name}`}
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

      {filteredItems.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="font-bold text-slate-800">No encontramos productos con esos filtros.</p>
          <p className="mt-2 text-sm text-slate-500">Prueba con otro SKU, modelo o estado.</p>
        </div>
      ) : (
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-500">
          Mostrando {filteredItems.length} de {items.length} variantes
        </div>
      )}
    </section>
  );
}
