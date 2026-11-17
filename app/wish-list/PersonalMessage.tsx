"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Wishlist } from "./types";

const MAX_LENGTH = 500;

// The Owner's Personal Message under the wishlist heading. The Owner edits it
// in place; everyone else just reads it (and sees nothing when it's empty).
export default function PersonalMessage({ wishlist, isOwner }: { wishlist: Wishlist; isOwner: boolean }) {
  const [saved, setSaved] = useState(wishlist.personal_message);
  const [draft, setDraft] = useState(wishlist.personal_message);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOwner) {
    return saved ? <p className="mb-6 max-w-2xl whitespace-pre-line opacity-80">{saved}</p> : null;
  }

  async function save() {
    setSaving(true);
    setError(null);
    const { error } = await createClient()
      .from("wishlists")
      .update({ personal_message: draft.trim() })
      .eq("id", wishlist.id);
    setSaving(false);
    if (error) return setError(error.message);
    setSaved(draft.trim());
    setDraft(draft.trim());
  }

  const changed = draft.trim() !== saved;

  return (
    <div className="mb-6 flex max-w-2xl flex-col gap-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={3}
        placeholder="A small personal message for everyone visiting your wishlist…"
        aria-label="Personal message"
        className="rounded bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent christmas:rounded-xl christmas:border christmas:border-edge"
      />
      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={save}
          disabled={!changed || saving}
          className="rounded bg-accent px-3 py-1.5 hover:opacity-90 disabled:cursor-not-allowed disabled:bg-foreground/20 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save message"}
        </button>
        <span className="opacity-60">
          {draft.length}/{MAX_LENGTH}
        </span>
        {error && <span className="text-red-400">{error}</span>}
      </div>
    </div>
  );
}
