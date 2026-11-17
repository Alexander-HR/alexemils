"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAccount } from "@/utils/supabase/useAccount";

export default function AccountMenu() {
  const account = useAccount();
  const router = useRouter();

  if (account.kind === "loading") return null;

  if (account.kind === "logged-out") {
    return (
      <Link href="/login" className="text-lg hover:opacity-80">
        Login
      </Link>
    );
  }

  async function logOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {account.kind === "owner" && (
        <Link href="/owner" className="text-sm underline hover:opacity-80">
          Manage
        </Link>
      )}
      <span className="text-lg">
        {account.displayName || "Logged in"}
        {account.kind === "owner" && (
          <span className="ml-2 rounded bg-foreground/15 px-1.5 py-0.5 text-xs">
            Owner
          </span>
        )}
      </span>
      <button
        type="button"
        onClick={logOut}
        className="rounded border border-foreground/70 px-2 py-0.5 text-sm hover:bg-foreground/10"
      >
        Log out
      </button>
    </div>
  );
}
