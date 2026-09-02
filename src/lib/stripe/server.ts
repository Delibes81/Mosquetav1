import 'server-only';

import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error('Falta STRIPE_SECRET_KEY en las variables del servidor.');
  }

  stripeClient = new Stripe(secretKey, {
    appInfo: {
      name: 'Mosqueta',
      version: '0.1.0',
    },
  });

  return stripeClient;
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    throw new Error('Falta STRIPE_WEBHOOK_SECRET en las variables del servidor.');
  }

  return webhookSecret;
}
