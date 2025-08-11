import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Attempts to create a Supabase client from globally provided secrets.
// If not available, returns null so the app can operate in guest mode.
export function getSupabaseClientOrNull(): SupabaseClient | null {
  if (client) return client;

  const g: any = typeof window !== "undefined" ? (window as any) : {};
  const url = g.SUPABASE_URL || g.__SUPABASE_URL__ || g.NEXT_PUBLIC_SUPABASE_URL;
  const anon = g.SUPABASE_ANON_KEY || g.__SUPABASE_ANON_KEY__ || g.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    if (url && anon) {
      client = createClient(url, anon, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
      return client;
    }
  } catch (e) {
    // ignore and fall back to guest mode
  }
  return null;
}
