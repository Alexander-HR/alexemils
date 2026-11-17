"use client";

import type { FilterOption } from "./filters";

// A row of pill buttons that narrows the wish list to one filter at a time.
export default function FilterPills({
  options,
  active,
  onChange,
}: {
  options: FilterOption[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="group" aria-label="Filter Wishes" className="mb-6 flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.id === active;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm ${
              selected
                ? "border-accent bg-accent"
                : "border-foreground/30 hover:bg-foreground/10 christmas:border-edge"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
