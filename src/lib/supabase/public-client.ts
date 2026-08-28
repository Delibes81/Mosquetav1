import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let publicClient: SupabaseClient | null | undefined;

export function getPublicSupabaseClient() {
  if (publicClient !== undefined) return publicClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    publicClient = null;
    return publicClient;
  }

  publicClient = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return publicClient;
}
