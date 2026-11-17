"use server";

import { cookies, headers } from "next/headers";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export type InviteState = { ok: boolean; message: string } | null;

// Invites a family member by email and creates their Gifter profile.
export async function inviteGifter(_prev: InviteState, form: FormData): Promise<InviteState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  if (!name || !email) return { ok: false, message: "Name and email are both needed." };

  // The admin client bypasses row level security, so check the Owner here.
  const supabase = createClient(await cookies());
  const { data: isOwner } = await supabase.rpc("is_owner");
  if (!isOwner) return { ok: false, message: "Only the Owner can invite people." };

  try {
    const admin = createAdminClient();
    const requestHeaders = await headers();
    const origin =
      requestHeaders.get("origin") ?? `https://${requestHeaders.get("host")}`;
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origin}/auth/confirm`,
    });
    if (error) return { ok: false, message: error.message };

    const { error: profileError } = await admin
      .from("profiles")
      .insert({ id: data.user.id, display_name: name });
    if (profileError) return { ok: false, message: profileError.message };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }

  return { ok: true, message: `Invite sent to ${name} (${email}).` };
}
