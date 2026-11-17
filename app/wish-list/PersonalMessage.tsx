"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const MAX_LENGTH = 500;

// The Owner's Personal Message under the wishlist heading. The Owner edits it
// in place; everyone else just reads it (and sees nothing when it's empty).
export default function PersonalMessage({ isOwner }: { isOwner: boolean }) {
  // null = not loaded yet.
  const [saved, setSaved] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from("personal_message")
      .select("message")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) return setError(error.message);
        setSaved(data?.message ?? "");
        setDraft(data?.message ?? "");
      });
  }, []);

  if (saved === null) return error && isOwner ? <p className="mb-6 text-sm text-red-400">{error}</p> : null;

  if (!isOwner) {
    return saved ? <p className="mb-6 max-w-2xl whitespace-pre-line opacity-80">{saved}</p> : null;
  }

  async function save() {
    setSaving(true);
    setError(null);
    const { error } = await createClient()
      .from("personal_message")
      .update({ message: draft.trim(), updated_at: new Date().toISOString() })
      .eq("id", true);
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
