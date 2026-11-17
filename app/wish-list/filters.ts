import type { Claim, Wish } from "./types";

// The filter pills above the wish list. A filter is a plain string so it can be
// remembered in localStorage: "all", "priority", "available" or "category:<name>".
export type FilterOption = { id: string; label: string };

const CATEGORY = "category:";

// Categories in use, sorted, each listed once. "Books" and "books" count as
// the same Category; the first spelling seen wins.
export function categoriesOf(wishes: Pick<Wish, "category">[]): string[] {
  const names = new Map<string, string>();
  for (const { category } of wishes) {
    if (category && !names.has(category.toLowerCase())) names.set(category.toLowerCase(), category);
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b));
}

// Only offers pills that can match something. "Still available" needs Claims to
// be visible, otherwise it would give away which Wishes are taken.
export function filterOptions(wishes: Wish[], showClaims: boolean): FilterOption[] {
  return [
    { id: "all", label: "All" },
    ...(wishes.some((w) => w.is_priority) ? [{ id: "priority", label: "★ Priority" }] : []),
    ...(showClaims ? [{ id: "available", label: "Still available" }] : []),
    ...categoriesOf(wishes).map((name) => ({ id: CATEGORY + name, label: name })),
  ];
}

// Falls back to "all" when the remembered filter no longer applies (e.g. its
// Category is gone, or Claims are now hidden).
export function activeFilter(remembered: string | null | undefined, options: FilterOption[]) {
  return options.some((o) => o.id === remembered) ? remembered! : "all";
}

export function matchesFilter(filter: string, wish: Wish, claims: Claim[]): boolean {
  if (filter === "priority") return wish.is_priority;
  // Recurring Wishes are never taken.
  if (filter === "available") return wish.kind === "recurring" || claims.length === 0;
  if (filter.startsWith(CATEGORY)) {
    return wish.category?.toLowerCase() === filter.slice(CATEGORY.length).toLowerCase();
  }
  return true;
}
