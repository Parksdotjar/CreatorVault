import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function createSupabaseBrowserClient() {
  const isServer = typeof window === "undefined";
  if (!isServer && browserClient) return browserClient;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isServer) {
      return createClient<Database>("http://localhost", "anon-key", {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
    }
    throw new Error("Missing Supabase environment variables.");
  }

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  if (!isServer) {
    browserClient = client;
  }

  return client;
}
