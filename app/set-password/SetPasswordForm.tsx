"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirm"))) {
      setError("The passwords don't match.");
      return;
    }
    setPending(true);
    setError(null);

    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }
    router.push("/wish-list");
    router.refresh();
  }

  const input =
    "rounded bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        New password
        <input name="password" type="password" required minLength={6} autoComplete="new-password" className={input} />
      </label>
      <label className="flex flex-col gap-1">
        Repeat password
        <input name="confirm" type="password" required minLength={6} autoComplete="new-password" className={input} />
      </label>
      {error && <p className="text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-accent px-3 py-2 hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
