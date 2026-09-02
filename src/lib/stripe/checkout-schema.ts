import { z } from 'zod';

const trimmedText = (minimum: number, maximum: number) => z.string().trim().min(minimum).max(maximum);

const checkoutItemSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(100).refine(
    (items) => new Set(items.map((item) => item.id)).size === items.length,
    { message: 'El carrito contiene productos duplicados.' },
  ),
  customer: z.object({
    fullName: trimmedText(3, 120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(8).max(30).regex(/^[+()\d\s.-]+$/),
    postalCode: z.string().trim().regex(/^\d{5}$/),
    municipality: trimmedText(2, 100),
    neighborhood: trimmedText(2, 100),
    region: trimmedText(2, 100),
    streetAddress: trimmedText(5, 200),
    deliveryNotes: z.string().trim().max(500).default(''),
  }),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
