"use client";

import { SORT_OPTIONS, type SortId } from "./sorting";

// Chooses the order of the wish list.
export default function SortSelect({
  active,
  onChange,
}: {
  active: SortId;
  onChange: (id: SortId) => void;
}) {
  return (
    <label className="ml-auto flex items-center gap-2 text-sm">
      Sort by
      <select
        value={active}
        onChange={(e) => onChange(e.target.value as SortId)}
        className="rounded bg-surface px-3 py-1.5 outline-none focus:ring-2 focus:ring-accent christmas:rounded-full christmas:border christmas:border-edge"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
