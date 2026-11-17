import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Uses the secret key, which bypasses row level security. Only import this
// from server code (Server Actions, Route Handlers), never a Client Component.
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY isn't set, so invites can't be sent.");
  }
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
