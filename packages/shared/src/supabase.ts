import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase URL and anon key are required. Set them in your app's env vars.",
    );
  }
  return createClient(url, anonKey);
}

export type { SupabaseClient };
