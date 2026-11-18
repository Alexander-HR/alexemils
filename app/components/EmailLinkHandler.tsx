"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

// Supabase's default invite and password reset emails log people in by sending
// them back here with the session after a "#" (custom templates, which would use
// /auth/confirm instead, need our own SMTP). Our Supabase client refuses that
// kind of link, so pick the session up by hand and send them to choose a password.
export default function EmailLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const failed = params.has("error_code") || params.has("error_description");
    if (!failed && !(accessToken && refreshToken)) return;

    // Keep the tokens out of the address bar and browser history.
    history.replaceState(null, "", window.location.pathname + window.location.search);

    if (failed || !accessToken || !refreshToken) {
      router.replace("/login?error=invite");
      return;
    }

    createClient()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) return router.replace("/login?error=invite");
        const type = params.get("type");
        router.replace(type === "invite" || type === "recovery" ? "/set-password" : "/wish-list");
        router.refresh();
      });
  }, [router]);

  return null;
}
