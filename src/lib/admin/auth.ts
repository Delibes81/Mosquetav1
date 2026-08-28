import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AdminSession, CatalogAdminRole } from '@/lib/admin/catalog-types';

interface AdminUserRow {
  role: CatalogAdminRole;
  display_name: string | null;
  active: boolean;
}

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) return null;

  const { data, error } = await supabase
    .from('catalog_admin_users')
    .select('role,display_name,active')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  const adminUser = data as AdminUserRow;
  if (!adminUser.active) return null;

  return {
    userId,
    role: adminUser.role,
    displayName: adminUser.display_name,
  };
});

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login?error=no-autorizado');
  return session;
}

export async function assertAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error('No autorizado para administrar el catálogo.');
  return session;
}
