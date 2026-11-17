"use client";

import { useId, useState } from "react";
import type { Wish } from "../wish-list/types";

export type WishInput = Pick<
  Wish,
  "title" | "note" | "image_url" | "shop_url" | "price" | "is_priority" | "category" | "kind"
>;

const input = "rounded bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent";

// Add or edit a Wish. Empty optional fields are saved as null.
export default function WishForm({
  initial,
  categories,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Wish;
  // Categories already in use, suggested so spelling stays consistent.
  categories: string[];
  submitLabel: string;
  onSubmit: (wish: WishInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [pending, setPending] = useState(false);
  const categoryListId = useId();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const text = (name: string) => String(form.get(name) ?? "").trim() || null;
    setPending(true);
    try {
      await onSubmit({
        title: text("title")!,
        note: text("note"),
        image_url: text("image_url"),
        shop_url: text("shop_url"),
        price: text("price"),
        is_priority: form.get("is_priority") === "on",
        category: text("category"),
        kind: form.get("kind") === "recurring" ? "recurring" : "one_off",
      });
      if (!initial) formElement.reset();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 sm:col-span-2">
        Title
        <input name="title" required defaultValue={initial?.title} className={input} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        Note
        <input name="note" defaultValue={initial?.note ?? ""} className={input} />
      </label>
      <label className="flex flex-col gap-1">
        Image URL
        <input name="image_url" type="url" defaultValue={initial?.image_url ?? ""} className={input} />
      </label>
      <label className="flex flex-col gap-1">
        Shop link
        <input name="shop_url" type="url" defaultValue={initial?.shop_url ?? ""} className={input} />
      </label>
      <label className="flex flex-col gap-1">
        Rough price
        <input name="price" placeholder="e.g. ~5.000 kr" defaultValue={initial?.price ?? ""} className={input} />
      </label>
      <label className="flex flex-col gap-1">
        Category
        <input
          name="category"
          list={categoryListId}
          maxLength={40}
          placeholder="e.g. Books"
          defaultValue={initial?.category ?? ""}
          className={input}
        />
        <datalist id={categoryListId}>
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </label>
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1">Kind</legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="kind" value="one_off" defaultChecked={initial?.kind !== "recurring"} />
          One-off (one person gets it)
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="kind" value="recurring" defaultChecked={initial?.kind === "recurring"} />
          Recurring (can be given many times)
        </label>
      </fieldset>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="is_priority" defaultChecked={initial?.is_priority} />
        ★ Really want this
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-accent px-3 py-2 hover:opacity-90 disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-foreground/70 px-3 py-2 hover:bg-foreground/10"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
