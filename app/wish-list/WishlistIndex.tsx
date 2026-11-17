"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "@/utils/supabase/useAccount";
import type { Wishlist } from "./types";
import { fetchWishlists, wishlistTitle } from "./wishlists";

// Every Wishlist, for Gifters and Guests. Owners go straight to their own and
// reach the others from there.
export default function WishlistIndex() {
  const account = useAccount();
  const router = useRouter();
  const [wishlists, setWishlists] = useState<Wishlist[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account.kind === "owner") router.replace(`/wish-list/${account.handle}`);
  }, [account, router]);

  useEffect(() => {
    fetchWishlists().then(setWishlists, (e: Error) => setError(e.message));
  }, []);

  if (account.kind === "loading" || account.kind === "owner") return null;

  return (
    <>
      <h1 className="mb-6 text-5xl font-light">Wish lists</h1>
      {error && <p className="mb-4 rounded bg-red-900/50 px-3 py-2">{error}</p>}
      {wishlists === null ? (
        !error && <p className="opacity-70">Loading…</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {wishlists.map((wishlist) => (
            <li key={wishlist.id}>
              <Link
                href={`/wish-list/${wishlist.handle}`}
                className="block rounded-lg bg-surface p-6 text-2xl hover:bg-foreground/10 christmas:rounded-2xl christmas:border christmas:border-edge"
              >
                {wishlistTitle(wishlist)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
