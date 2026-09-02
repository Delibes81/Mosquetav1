'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/features/cart/CartProvider';
import { formatMxn } from '@/lib/currency';

const availabilityLabels = {
  'por-confirmar': 'Disponibilidad por confirmar',
  'en-stock': 'En stock',
  'sobre-pedido': 'Sobre pedido',
  agotado: 'Agotado',
};

export default function CarritoPage() {
  const { items, itemCount, total, hydrated, updateQuantity, removeItem } = useCart();

  if (!hydrated) {
    return (
      <main className="min-h-[70vh] bg-gray-50 py-16" aria-busy="true">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="h-64 animate-pulse rounded-xl border border-gray-200 bg-white" />
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-mosqueta-primary">
              <ShoppingCart className="h-8 w-8" />
            </span>
            <h1 className="mt-6 font-montserrat text-3xl font-extrabold text-gray-900">Tu carrito está vacío</h1>
            <p className="mt-3 text-gray-600">Agrega una pantalla con precio temporal para probar el recorrido de compra.</p>
            <Link
              href="/catalogo"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-mosqueta-primary px-6 py-3 font-bold text-white transition-colors hover:bg-[#b0164e]"
            >
              Explorar catálogo <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-gray-50 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-mosqueta-secondary">Compra de prueba</p>
          <h1 className="mt-2 font-montserrat text-3xl font-extrabold text-gray-900 sm:text-4xl">Tu carrito</h1>
          <p className="mt-2 text-gray-600">{itemCount} {itemCount === 1 ? 'producto agregado' : 'productos agregados'}</p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" aria-label="Productos en el carrito">
            {items.map((item) => (
              <article key={item.id} className="grid gap-4 border-b border-gray-200 p-4 last:border-b-0 sm:grid-cols-[128px_minmax(0,1fr)] sm:p-6">
                <Link href={`/producto/${item.slug}`} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#e9ecf2] sm:aspect-square">
                  <Image src={item.image} alt={`${item.name} ${item.brand}`} fill sizes="128px" className="object-contain p-2" />
                </Link>

                <div className="flex min-w-0 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-mosqueta-secondary">{item.brand} · {item.model}</p>
                      <Link href={`/producto/${item.slug}`} className="mt-1 block font-montserrat text-lg font-bold text-gray-900 hover:text-mosqueta-primary">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-gray-500">{availabilityLabels[item.availability]}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"
                      aria-label={`Eliminar ${item.name} del carrito`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold text-gray-500">Cantidad</p>
                      <div className="inline-flex items-center rounded-md border border-gray-300">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity === 1}
                          className="p-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
                          aria-label={`Reducir cantidad de ${item.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-10 px-2 text-center text-sm font-bold text-gray-900" aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.stock !== null && item.quantity >= item.stock}
                          className="p-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
                          aria-label={`Aumentar cantidad de ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatMxn(item.price)} c/u</p>
                      <p className="mt-1 text-xl font-extrabold text-gray-900">{formatMxn(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="font-montserrat text-xl font-extrabold text-gray-900">Resumen</h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4 text-gray-600">
                <dt>Subtotal</dt>
                <dd className="font-semibold text-gray-900">{formatMxn(total)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-gray-600">
                <dt>Entrega</dt>
                <dd className="font-semibold text-gray-900">Por confirmar</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-200 pt-4 text-lg">
                <dt className="font-bold text-gray-900">Total provisional</dt>
                <dd className="font-extrabold text-mosqueta-primary">{formatMxn(total)}</dd>
              </div>
            </dl>

            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              Precios temporales para validar el carrito. Existencia, costo de entrega y venta final deben confirmarse.
            </div>

            <Link
              href="/checkout"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-mosqueta-primary px-6 py-3 font-bold text-white transition hover:bg-[#b0164e]"
            >
              Continuar al checkout <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-2 text-center text-xs text-gray-500">Podrás revisar los datos de entrega; todavía no se enviará ni guardará información.</p>
            <Link href="/catalogo" className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-mosqueta-primary hover:underline">
              Seguir agregando productos <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
