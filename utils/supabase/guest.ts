import { createClient } from "./client";

// Makes sure this browser has a Supabase identity before it creates a Claim.
// Logged-in Gifters keep their account; everyone else becomes a Guest via an
// anonymous sign-in, which is tied to this browser only.
export async function ensureClaimerSession() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user;

  const { data: signedIn, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return signedIn.user!;
}
