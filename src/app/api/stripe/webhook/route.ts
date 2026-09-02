import type Stripe from 'stripe';
import { getStripeClient, getStripeWebhookSecret } from '@/lib/stripe/server';
import { getSupabaseServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return Response.json({ error: 'Falta la firma de Stripe.' }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );
  } catch {
    return Response.json({ error: 'Firma de webhook inválida.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;

    if (!orderId || session.payment_status !== 'paid' || session.amount_total === null || !session.currency) {
      console.warn(`[stripe] Checkout ${session.id} recibido sin un pedido pagado procesable.`);
      return Response.json({ received: true });
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? '';

    const { error } = await getSupabaseServiceClient().rpc('mark_checkout_order_paid', {
      p_order_id: orderId,
      p_stripe_checkout_session_id: session.id,
      p_stripe_payment_intent_id: paymentIntentId,
      p_currency: session.currency,
      p_total_mxn: session.amount_total / 100,
      p_stripe_event_id: event.id,
    });

    if (error) {
      console.error(`[orders] No se pudo confirmar el pago (${error.code}).`);
      return Response.json({ error: 'No se pudo procesar el evento.' }, { status: 500 });
    }

    console.info(`[stripe] Pedido ${orderId} confirmado mediante ${event.id}.`);
  }

  return Response.json({ received: true });
}
