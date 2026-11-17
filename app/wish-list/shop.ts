import type { Wish } from "./types";

export type Shop = { name: string; url: string | null };

// The shop shown on a Wish's card: the name the Owner typed, otherwise the shop
// link's domain without "www.". Only http(s) links are used, so a stray
// "javascript:" URL can't end up in the link. Null when there's nothing to show.
export function shopOf(wish: Pick<Wish, "shop_name" | "shop_url">): Shop | null {
  const url = parseShopUrl(wish.shop_url);
  const name = wish.shop_name ?? url?.hostname.replace(/^www\./, "");
  return name ? { name, url: url?.href ?? null } : null;
}

function parseShopUrl(text: string | null): URL | null {
  if (!text) return null;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}
