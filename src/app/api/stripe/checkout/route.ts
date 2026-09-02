import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { checkoutRequestSchema } from '@/lib/stripe/checkout-schema';
import { getCatalogProducts } from '@/lib/catalog';
import { absoluteCatalogImage } from '@/lib/catalog-image';
import { absoluteUrl } from '@/lib/site';
import { getStripeClient } from '@/lib/stripe/server';

export const runtime = 'nodejs';

const MAX_REQUEST_BYTES = 25_000;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return errorResponse('La solicitud es demasiado grande.', 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('No pudimos leer la información del checkout.', 400);
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse('Revisa los datos de contacto, entrega y carrito.', 400);
  }

  const { items, customer } = parsed.data;
  if (process.env.CATALOG_DATA_SOURCE !== 'supabase') {
    return errorResponse('El catálogo de compra no está conectado al servidor.', 503);
  }

  const catalog = await getCatalogProducts();
  const productsById = new Map(catalog.map((product) => [product.id, product]));

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of items) {
    const product = productsById.get(item.id);
    if (!product || !product.published || product.price === null || product.price <= 0) {
      return errorResponse('Uno de los productos ya no está disponible para compra.', 409);
    }

    if (product.availability === 'agotado' || (product.stock !== null && item.quantity > product.stock)) {
      return errorResponse(`No hay suficiente existencia de ${product.name}.`, 409);
    }

    const unitAmount = Math.round(product.price * 100);
    if (!Number.isSafeInteger(unitAmount) || unitAmount <= 0) {
      return errorResponse('Uno de los productos tiene un precio inválido.', 409);
    }

    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: 'mxn',
        unit_amount: unitAmount,
        product_data: {
          name: `${product.name} ${product.brand}`.trim().slice(0, 127),
          description: product.model ? `Modelo ${product.model}`.slice(0, 255) : undefined,
          images: [absoluteCatalogImage(product.image)],
          metadata: {
            catalog_variant_id: product.id,
            slug: product.slug,
          },
        },
      },
    });
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'es',
      payment_method_types: ['card'],
      customer_email: customer.email,
      line_items: lineItems,
      success_url: absoluteUrl('/checkout/exito?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: absoluteUrl('/checkout?cancelado=1'),
      submit_type: 'pay',
      payment_intent_data: {
        receipt_email: customer.email,
        description: `Pedido web Mosqueta (${items.length} partidas)`,
        shipping: {
          name: customer.fullName,
          phone: customer.phone,
          address: {
            line1: customer.streetAddress,
            line2: [customer.neighborhood, customer.deliveryNotes].filter(Boolean).join(' · ').slice(0, 200) || undefined,
            city: customer.municipality,
            state: customer.region,
            postal_code: customer.postalCode,
            country: 'MX',
          },
        },
        metadata: {
          source: 'mosqueta-web',
        },
      },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: 'Entrega incluida',
          fixed_amount: { amount: 0, currency: 'mxn' },
        },
      }],
      custom_text: {
        submit: {
          message: 'Tu compra está sujeta a confirmación de cobertura y disponibilidad por parte de Mosqueta.',
        },
      },
      metadata: {
        source: 'mosqueta-web',
        cart_item_count: String(items.reduce((total, item) => total + item.quantity, 0)),
      },
    });

    if (!session.url) {
      return errorResponse('Stripe no generó una liga de pago.', 502);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[stripe] No se pudo crear la sesión de Checkout.', error instanceof Error ? error.message : 'Error desconocido');
    return errorResponse('No pudimos iniciar el pago. Intenta nuevamente.', 502);
  }
}
