'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { assertAdmin } from '@/lib/admin/auth';
import { fulfillmentStatuses } from '@/lib/admin/order-types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const statusSchema = z.enum(fulfillmentStatuses as [string, ...string[]]);

export async function updateOrderFulfillmentStatusAction(
  orderId: string,
  formData: FormData,
) {
  await assertAdmin();

  const parsed = z.object({
    orderId: z.string().uuid(),
    status: statusSchema,
    note: z.string().trim().max(500),
  }).safeParse({
    orderId,
    status: String(formData.get('status') ?? ''),
    note: String(formData.get('note') ?? ''),
  });

  if (!parsed.success) throw new Error('Los datos del estado no son válidos.');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('update_order_fulfillment_status', {
    p_order_id: parsed.data.orderId,
    p_new_status: parsed.data.status,
    p_note: parsed.data.note,
  });

  if (error) {
    redirect(`/admin/pedidos/${parsed.data.orderId}?error=estado`);
  }

  revalidatePath('/admin/pedidos');
  revalidatePath(`/admin/pedidos/${parsed.data.orderId}`);
  redirect(`/admin/pedidos/${parsed.data.orderId}?updated=1`);
}
