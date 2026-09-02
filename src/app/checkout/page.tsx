'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Check, CreditCard, LoaderCircle, LockKeyhole, MapPin, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '@/features/cart/CartProvider';
import { formatMxn } from '@/lib/currency';

const fieldClassName = 'mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-mosqueta-primary focus:ring-4 focus:ring-pink-100';

interface CheckoutResponse {
  url?: string;
  error?: string;
}

export default function CheckoutPage() {
  const { items, itemCount, total, hydrated } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ id, quantity }) => ({ id, quantity })),
          customer: {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            postalCode: formData.get('postalCode'),
            municipality: formData.get('municipality'),
            neighborhood: formData.get('neighborhood'),
            region: formData.get('region'),
            streetAddress: formData.get('streetAddress'),
            deliveryNotes: formData.get('deliveryNotes'),
          },
        }),
      });

      const result = await response.json().catch(() => null) as CheckoutResponse | null;
      if (!response.ok || !result?.url) {
        throw new Error(result?.error || 'No pudimos iniciar el pago. Intenta nuevamente.');
      }

      window.location.assign(result.url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos iniciar el pago. Intenta nuevamente.');
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <main className="min-h-[70vh] bg-gray-50 py-12" aria-busy="true">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="h-80 animate-pulse rounded-xl border border-gray-200 bg-white" />
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-mosqueta-primary" />
            <h1 className="mt-5 font-montserrat text-3xl font-extrabold text-gray-900">Agrega productos antes de continuar</h1>
            <p className="mt-3 text-gray-600">El checkout necesita al menos un producto en el carrito.</p>
            <Link href="/catalogo" className="mt-7 inline-flex rounded-md bg-mosqueta-primary px-6 py-3 font-bold text-white hover:bg-[#b0164e]">
              Ir al catálogo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-gray-50 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/carrito" className="inline-flex items-center gap-2 text-sm font-bold text-mosqueta-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Volver al carrito
        </Link>

        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 sm:flex sm:items-start sm:gap-3">
          <ShieldCheck className="mb-2 h-5 w-5 shrink-0 text-emerald-700 sm:mb-0" />
          <p><strong>Pago seguro de prueba:</strong> Mosqueta verificará productos y precios en el servidor; Stripe procesará los datos de la tarjeta.</p>
        </div>

        <nav className="my-8" aria-label="Progreso de compra">
          <ol className="grid grid-cols-3 gap-2 text-center text-xs font-bold sm:text-sm">
            <li className="rounded-full bg-emerald-100 px-3 py-2 text-emerald-800"><Check className="mr-1 inline h-4 w-4" /> Carrito</li>
            <li className="rounded-full bg-pink-100 px-3 py-2 text-mosqueta-primary">2. Entrega</li>
            <li className="rounded-full bg-gray-200 px-3 py-2 text-gray-600">3. Pago seguro</li>
          </ol>
        </nav>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-50 font-extrabold text-mosqueta-primary">1</span>
                <div>
                  <h1 className="font-montserrat text-2xl font-extrabold text-gray-900">Datos de contacto</h1>
                  <p className="mt-1 text-sm text-gray-600">Compra como invitado, sin crear una cuenta.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                  Nombre completo
                  <input name="fullName" autoComplete="name" required minLength={3} maxLength={120} className={fieldClassName} placeholder="Nombre y apellidos" />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  Correo electrónico
                  <input name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClassName} placeholder="correo@ejemplo.com" />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  Teléfono o WhatsApp
                  <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength={8} maxLength={30} className={fieldClassName} placeholder="10 dígitos" />
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-50 font-extrabold text-mosqueta-primary">2</span>
                <div>
                  <h2 className="font-montserrat text-2xl font-extrabold text-gray-900">Dirección de entrega</h2>
                  <p className="mt-1 text-sm text-gray-600">Cobertura inicial: Ciudad de México y área metropolitana.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-gray-700">
                  Código postal
                  <input name="postalCode" inputMode="numeric" autoComplete="postal-code" required pattern="[0-9]{5}" maxLength={5} className={fieldClassName} placeholder="00000" />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  Alcaldía o municipio
                  <input name="municipality" autoComplete="address-level2" required minLength={2} maxLength={100} className={fieldClassName} placeholder="Ej. Coyoacán" />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  Colonia
                  <input name="neighborhood" autoComplete="address-level3" required minLength={2} maxLength={100} className={fieldClassName} placeholder="Colonia" />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  Ciudad o estado
                  <input name="region" autoComplete="address-level1" required minLength={2} maxLength={100} className={fieldClassName} placeholder="Ciudad de México" />
                </label>
                <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                  Calle y número
                  <input name="streetAddress" autoComplete="street-address" required minLength={5} maxLength={200} className={fieldClassName} placeholder="Calle, número exterior e interior" />
                </label>
                <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                  Referencias para la entrega
                  <textarea name="deliveryNotes" rows={3} maxLength={500} className={fieldClassName} placeholder="Indicaciones opcionales para localizar el domicilio" />
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-50 font-extrabold text-mosqueta-primary">3</span>
                <div>
                  <h2 className="font-montserrat text-2xl font-extrabold text-gray-900">Método de pago</h2>
                  <p className="mt-1 text-sm text-gray-600">Al continuar, Stripe abrirá su página segura para capturar la tarjeta.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border-2 border-mosqueta-primary bg-pink-50 p-4">
                  <CreditCard className="h-6 w-6 text-mosqueta-primary" />
                  <p className="mt-3 font-bold text-gray-900">Tarjeta con Stripe</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">Método principal activo en modo de prueba. Mosqueta no recibe ni almacena los datos de la tarjeta.</p>
                </div>
                <div className="rounded-lg border border-gray-300 bg-white p-4 text-gray-600">
                  <LockKeyhole className="h-6 w-6 text-gray-500" />
                  <p className="mt-3 font-bold text-gray-900">Transferencia bancaria</p>
                  <p className="mt-1 text-xs leading-relaxed">Alternativa secundaria pendiente de definir cuenta y proceso de confirmación.</p>
                </div>
              </div>
            </section>

            {errorMessage && (
              <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {errorMessage}
              </div>
            )}

            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-md bg-mosqueta-primary px-6 py-4 font-bold text-white transition hover:bg-[#b0164e] disabled:cursor-wait disabled:opacity-70">
              {submitting ? <><LoaderCircle className="h-5 w-5 animate-spin" /> Preparando pago seguro…</> : <>Pagar {formatMxn(total)} con Stripe <CreditCard className="h-5 w-5" /></>}
            </button>
            <p className="text-center text-xs leading-relaxed text-gray-500">Al continuar aceptas que Mosqueta use tus datos para procesar el pedido y coordinar la entrega.</p>
          </form>

          <aside className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-28 sm:p-6">
            <h2 className="font-montserrat text-xl font-extrabold text-gray-900">Resumen del pedido</h2>
            <p className="mt-1 text-sm text-gray-500">{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</p>

            <div className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[#e9ecf2]">
                    <Image src={item.image} alt="" fill sizes="64px" className="object-contain p-1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold text-gray-900">{item.name}</p>
                    <p className="mt-1 text-xs text-gray-500">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatMxn(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <dl className="mt-6 space-y-3 border-t border-gray-200 pt-5 text-sm">
              <div className="flex justify-between gap-4 text-gray-600">
                <dt>Subtotal</dt>
                <dd className="font-semibold text-gray-900">{formatMxn(total)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-gray-600">
                <dt>Entrega</dt>
                <dd className="font-semibold text-emerald-700">Incluida</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-200 pt-4 text-lg">
                <dt className="font-bold text-gray-900">Total</dt>
                <dd className="font-extrabold text-mosqueta-primary">{formatMxn(total)}</dd>
              </div>
            </dl>

            <div className="mt-5 space-y-3 rounded-lg bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
              <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-mosqueta-secondary" /> Cobertura sujeta a validar el código postal.</p>
              <p className="flex gap-2"><Truck className="h-4 w-4 shrink-0 text-mosqueta-secondary" /> La entrega aparece sin costo en esta etapa de prueba.</p>
            </div>

            <Link href="/carrito" className="mt-5 flex items-center justify-center text-sm font-bold text-mosqueta-primary hover:underline">
              Editar carrito
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
