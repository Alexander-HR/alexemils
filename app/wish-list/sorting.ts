import { isTaken } from "./filters";
import type { Claim, Wish } from "./types";

// The sort control above the wish list. Like the filter, the chosen sort is a
// plain string so it can be remembered in localStorage.
export const SORT_OPTIONS = [
  { id: "priority", label: "Priority" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]["id"];

export const DEFAULT_SORT: SortId = "priority";

// Falls back to the default when the remembered sort is unknown.
export function activeSort(remembered: string | null | undefined): SortId {
  return SORT_OPTIONS.find((o) => o.id === remembered)?.id ?? DEFAULT_SORT;
}

// Reads the first number out of the free-text price, e.g. "~5.000 kr" → 5000,
// "12,50 €" → 12.5, "1 299" → 1299. A separator followed by exactly three
// digits is a thousands separator; otherwise it's the decimal point. A space
// only joins a group of three, so "2 x 300 kr" isn't read as 2300. Currency
// is ignored. Returns null when there's no number.
export function parsePrice(price: string | null): number | null {
  const match = price?.match(/\d+(?:[.,]\d+|\s\d{3}(?!\d))*/);
  if (!match) return null;
  const groups = match[0].split(/[.,\s]/);
  let whole = groups[0];
  let decimals = "";
  groups.slice(1).forEach((group, i) => {
    const last = i === groups.length - 2;
    if (last && group.length !== 3) decimals = group;
    else whole += group;
  });
  return Number(decimals ? `${whole}.${decimals}` : whole);
}

const byPriority = (a: Wish, b: Wish) => Number(b.is_priority) - Number(a.is_priority);
const byNewest = (a: Wish, b: Wish) => b.created_at.localeCompare(a.created_at);

// Wishes without a readable price go last whichever way prices are sorted.
function byPrice(direction: 1 | -1) {
  return (a: Wish, b: Wish) => {
    const pa = parsePrice(a.price);
    const pb = parsePrice(b.price);
    if (pa === null || pb === null) return Number(pa === null) - Number(pb === null);
    return (pa - pb) * direction;
  };
}

// The default order, also used to break ties between equal prices.
const byPriorityThenNewest = (a: Wish, b: Wish) => byPriority(a, b) || byNewest(a, b);

const COMPARE: Record<SortId, (a: Wish, b: Wish) => number> = {
  priority: byPriorityThenNewest,
  newest: byNewest,
  "price-asc": (a, b) => byPrice(1)(a, b) || byPriorityThenNewest(a, b),
  "price-desc": (a, b) => byPrice(-1)(a, b) || byPriorityThenNewest(a, b),
};

// When Claims are visible, taken One-off Wishes sink below the available ones,
// each group in the chosen order.
export function sortWishes(
  wishes: Wish[],
  sort: SortId,
  claimsFor: (wishId: string) => Claim[],
  showClaims: boolean,
): Wish[] {
  const taken = (w: Wish) => (showClaims && isTaken(w, claimsFor(w.id)) ? 1 : 0);
  return [...wishes].sort((a, b) => taken(a) - taken(b) || COMPARE[sort](a, b));
}
