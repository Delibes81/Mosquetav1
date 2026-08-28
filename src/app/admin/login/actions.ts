"use server";

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { LoginActionState } from '@/app/admin/login/form-state';

export async function loginAdminAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { message: 'Ingresa correo y contraseña.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    return { message: 'Las credenciales no son válidas.' };
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    await supabase.auth.signOut();
    return { message: 'No fue posible verificar la sesión.' };
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('catalog_admin_users')
    .select('active')
    .eq('user_id', userId)
    .maybeSingle();

  if (adminError || !adminUser || !adminUser.active) {
    await supabase.auth.signOut();
    return { message: 'Esta cuenta no tiene acceso al panel administrativo.' };
  }

  redirect('/admin/productos');
}
