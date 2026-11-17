import { createClient } from "@/utils/supabase/client";
import type { Wishlist } from "./types";

// Every Wishlist, oldest first, with its Owner's name for headings and links.
export async function fetchWishlists(): Promise<Wishlist[]> {
  const { data, error } = await createClient()
    .from("wishlists")
    .select("id, handle, personal_message, owner_id, owner:profiles(display_name)")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data.map(({ owner, ...wishlist }) => ({
    ...wishlist,
    // A to-one relation, so PostgREST returns an object (the untyped client guesses an array).
    owner_name: (owner as unknown as { display_name: string } | null)?.display_name || wishlist.handle,
  }));
}

// "Alexander's wish list"
export const wishlistTitle = (wishlist: Wishlist) => `${wishlist.owner_name}'s wish list`;
