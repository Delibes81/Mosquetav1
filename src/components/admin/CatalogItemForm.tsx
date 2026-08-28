"use client";

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Save } from 'lucide-react';
import { saveCatalogItemAction } from '@/app/admin/productos/actions';
import { initialCatalogFormState } from '@/app/admin/productos/form-state';
import type { AdminCatalogItem, CatalogOption } from '@/lib/admin/catalog-types';

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs font-semibold text-red-600">{message}</p> : null;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-mosqueta-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Save size={18} />
      {pending ? 'Guardando…' : 'Guardar cambios'}
    </button>
  );
}

export default function CatalogItemForm({
  item,
  brands,
  categories,
}: {
  item: AdminCatalogItem | null;
  brands: CatalogOption[];
  categories: CatalogOption[];
}) {
  const [state, action] = useActionState(saveCatalogItemAction, initialCatalogFormState);
  const isArchived = item?.status === 'archived';
  const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-mosqueta-primary focus:ring-4 focus:ring-pink-100 disabled:bg-slate-100 disabled:text-slate-500';
  const labelClass = 'mb-1.5 block text-sm font-bold text-slate-700';

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="mode" value={item ? 'update' : 'create'} />
      <input type="hidden" name="product_id" value={item?.productId ?? ''} />
      <input type="hidden" name="variant_id" value={item?.variantId ?? ''} />
      <input type="hidden" name="original_slug" value={item?.variantSlug ?? ''} />

      {isArchived ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Este producto está archivado. Restáuralo antes de editarlo.
        </div>
      ) : null}

      {state.message ? (
        <div
          role="status"
          className={`rounded-2xl px-5 py-4 text-sm font-semibold ${
            state.status === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <fieldset disabled={isArchived} className="space-y-6 disabled:opacity-80">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-montserrat text-lg font-extrabold text-slate-950">Información del producto</h2>
            <p className="mt-1 text-sm text-slate-500">Nombre comercial, clasificación y contenido de la ficha.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="name" className={labelClass}>Nombre del producto</label>
              <input id="name" name="name" required maxLength={180} defaultValue={item?.name ?? ''} className={inputClass} />
              <FieldError message={state.fieldErrors.name} />
            </div>

            <div>
              <label htmlFor="brand_id" className={labelClass}>Marca</label>
              <select id="brand_id" name="brand_id" required defaultValue={item?.brandId ?? ''} className={inputClass}>
                <option value="" disabled>Selecciona una marca</option>
                {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
              <FieldError message={state.fieldErrors.brand_id} />
            </div>

            <div>
              <label htmlFor="category_id" className={labelClass}>Categoría</label>
              <select id="category_id" name="category_id" required defaultValue={item?.categoryId ?? ''} className={inputClass}>
                <option value="" disabled>Selecciona una categoría</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <FieldError message={state.fieldErrors.category_id} />
            </div>

            <div>
              <label htmlFor="source_ref" className={labelClass}>Referencia interna</label>
              <input id="source_ref" name="source_ref" maxLength={160} defaultValue={item?.sourceRef ?? ''} placeholder="Se usará el SKU si queda vacío" className={inputClass} />
              <FieldError message={state.fieldErrors.source_ref} />
            </div>

            <div>
              <label htmlFor="product_slug" className={labelClass}>Slug del producto</label>
              <input id="product_slug" name="product_slug" maxLength={220} defaultValue={item?.productSlug ?? ''} placeholder="Se genera automáticamente" className={inputClass} />
              <FieldError message={state.fieldErrors.product_slug} />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className={labelClass}>Descripción</label>
              <textarea id="description" name="description" rows={4} defaultValue={item?.description ?? ''} className={inputClass} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-montserrat text-lg font-extrabold text-slate-950">Variante y modelo</h2>
            <p className="mt-1 text-sm text-slate-500">Identidad vendible del artículo. Cada SKU debe ser único.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="sku" className={labelClass}>SKU</label>
              <input id="sku" name="sku" required maxLength={120} defaultValue={item?.sku ?? ''} className={inputClass} />
              <FieldError message={state.fieldErrors.sku} />
            </div>
            <div>
              <label htmlFor="manufacturer_model" className={labelClass}>Modelo comercial</label>
              <input id="manufacturer_model" name="manufacturer_model" required maxLength={160} defaultValue={item?.manufacturerModel ?? ''} className={inputClass} />
              <FieldError message={state.fieldErrors.manufacturer_model} />
            </div>
            <div>
              <label htmlFor="source_model" className={labelClass}>Modelo recibido</label>
              <input id="source_model" name="source_model" maxLength={200} defaultValue={item?.sourceModel ?? ''} className={inputClass} />
            </div>
            <div>
              <label htmlFor="variant_slug" className={labelClass}>Slug de la variante</label>
              <input id="variant_slug" name="variant_slug" maxLength={220} defaultValue={item?.variantSlug ?? ''} placeholder="Se genera automáticamente" className={inputClass} />
            </div>
            <div>
              <label htmlFor="color" className={labelClass}>Color</label>
              <input id="color" name="color" maxLength={120} defaultValue={item?.color ?? ''} className={inputClass} />
            </div>
            <div>
              <label htmlFor="size" className={labelClass}>Tamaño</label>
              <input id="size" name="size" maxLength={120} defaultValue={item?.size ?? ''} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="specifications" className={labelClass}>Especificaciones</label>
              <textarea id="specifications" name="specifications" rows={6} defaultValue={item?.specifications ?? ''} className={inputClass} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-montserrat text-lg font-extrabold text-slate-950">Venta e inventario</h2>
            <p className="mt-1 text-sm text-slate-500">Los cambios de existencia quedan registrados como movimientos.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label htmlFor="price_mxn" className={labelClass}>Precio MXN</label>
              <input id="price_mxn" name="price_mxn" type="number" min="0" step="0.01" defaultValue={item?.priceMxn ?? ''} className={inputClass} />
              <FieldError message={state.fieldErrors.price_mxn} />
            </div>
            <div>
              <label htmlFor="stock" className={labelClass}>Existencia</label>
              <input id="stock" name="stock" type="number" min="0" step="1" defaultValue={item?.stock ?? ''} className={inputClass} />
              <FieldError message={state.fieldErrors.stock} />
            </div>
            <div>
              <label htmlFor="availability" className={labelClass}>Disponibilidad</label>
              <select id="availability" name="availability" defaultValue={item?.availability ?? 'por-confirmar'} className={inputClass}>
                <option value="por-confirmar">Por confirmar</option>
                <option value="en-stock">En stock</option>
                <option value="sobre-pedido">Sobre pedido</option>
                <option value="agotado">Agotado</option>
              </select>
              <FieldError message={state.fieldErrors.availability} />
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              name="published"
              defaultChecked={item?.published ?? false}
              className="mt-0.5 h-5 w-5 rounded border-slate-300 text-mosqueta-primary focus:ring-mosqueta-primary"
            />
            <span>
              <span className="block text-sm font-bold text-slate-800">Publicar en la tienda</span>
              <span className="mt-0.5 block text-xs text-slate-500">El producto será visible cuando también esté activo.</span>
            </span>
          </label>
        </section>
      </fieldset>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/admin/productos" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50">
          Cancelar
        </Link>
        <SubmitButton disabled={isArchived} />
      </div>
    </form>
  );
}
