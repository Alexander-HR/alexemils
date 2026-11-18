import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Where invite emails link to. With custom email templates the link carries a
// one-time token, verified here to log the new Gifter in before they choose a
// password. Supabase's default templates instead arrive with the session after
// a "#", which the server never sees: that's EmailLinkHandler's job.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = createClient(await cookies());
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}/set-password`);
    return NextResponse.redirect(`${origin}/login?error=invite`);
  }

  // No token: likely a default-template link, whose "#…" the browser keeps
  // across this redirect for EmailLinkHandler to pick up.
  return NextResponse.redirect(`${origin}/`);
}
