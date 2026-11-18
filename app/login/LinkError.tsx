"use client";

import { useSearchParams } from "next/navigation";

// /auth/confirm sends people here with ?error=invite when an invite or
// password reset link can't be verified.
export default function LinkError() {
  if (useSearchParams().get("error") !== "invite") return null;
  return (
    <p role="alert" className="mb-6 rounded bg-red-900/50 px-3 py-2">
      That email link didn&apos;t work. It may have expired or already been used. Ask for a
      new one.
    </p>
  );
}
