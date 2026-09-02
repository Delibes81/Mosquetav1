import Link from 'next/link';
import { BadgeCheck, Mail, ShoppingBag } from 'lucide-react';
import ClearPaidCart from '@/components/checkout/ClearPaidCart';
import { formatMxn } from '@/lib/currency';
import { getStripeClient } from '@/lib/stripe/server';

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string | string[] }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const rawSessionId = (await searchParams).session_id;
  const sessionId = typeof rawSessionId === 'string' && rawSessionId.startsWith('cs_') ? rawSessionId : null;

  let payment: { paid: boolean; email: string | null; amount: number | null } | null = null;

  if (sessionId) {
    try {
      const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
      payment = {
        paid: session.payment_status === 'paid' || session.payment_status === 'no_payment_required',
        email: session.customer_details?.email ?? session.customer_email,
        amount: session.amount_total === null ? null : session.amount_total / 100,
      };
    } catch {
      payment = null;
    }
  }

  if (!payment?.paid) {
    return (
      <main className="min-h-[70vh] bg-gray-50 py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-xl border border-amber-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
            <ShoppingBag className="mx-auto h-12 w-12 text-amber-600" />
            <h1 className="mt-5 font-montserrat text-3xl font-extrabold text-gray-900">No pudimos confirmar el pago</h1>
            <p className="mt-3 text-gray-600">El carrito permanece intacto. Puedes volver a intentarlo o contactar a Mosqueta.</p>
            <Link href="/checkout" className="mt-7 inline-flex rounded-md bg-mosqueta-primary px-6 py-3 font-bold text-white hover:bg-[#b0164e]">
              Volver al checkout
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-gray-50 py-16">
      <ClearPaidCart />
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-xl border border-emerald-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <BadgeCheck className="h-9 w-9 text-emerald-700" />
          </span>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Pago confirmado</p>
          <h1 className="mt-2 font-montserrat text-3xl font-extrabold text-gray-900">Gracias por comprar en Mosqueta</h1>
          {payment.amount !== null && <p className="mt-4 text-xl font-extrabold text-mosqueta-primary">Total pagado: {formatMxn(payment.amount)}</p>}
          <p className="mt-4 text-gray-600">Nuestro equipo validará disponibilidad y cobertura antes de coordinar tu entrega.</p>
          {payment.email && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <Mail className="h-4 w-4 text-mosqueta-secondary" /> Recibirás el comprobante en {payment.email}
            </p>
          )}
          <div className="mt-8">
            <Link href="/catalogo" className="inline-flex rounded-md bg-mosqueta-primary px-6 py-3 font-bold text-white hover:bg-[#b0164e]">
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
