import type Stripe from 'stripe';
import { getStripeClient, getStripeWebhookSecret } from '@/lib/stripe/server';

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
    console.info(`[stripe] Checkout completado: ${session.id}; estado: ${session.payment_status}.`);
  }

  return Response.json({ received: true });
}
