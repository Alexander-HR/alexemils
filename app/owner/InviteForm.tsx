"use client";

import { useActionState } from "react";
import { inviteGifter } from "./actions";

const input = "rounded bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent";

export default function InviteForm() {
  const [state, action, pending] = useActionState(inviteGifter, null);

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="flex flex-1 flex-col gap-1">
        Name
        <input name="name" required placeholder="Mom" className={input} />
      </label>
      <label className="flex flex-1 flex-col gap-1">
        Email
        <input name="email" type="email" required className={input} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-accent px-3 py-2 hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send invite"}
      </button>
      {state && (
        <p className={`sm:basis-full ${state.ok ? "text-green-400" : "text-red-400"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
