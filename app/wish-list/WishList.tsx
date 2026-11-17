"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAccount, useSessionUserId } from "@/utils/supabase/useAccount";
import { useLocalStorage } from "@/utils/useLocalStorage";
import { cancelClaim, createClaim, markBought } from "./claims";
import FilterPills from "./FilterPills";
import { activeFilter, filterOptions, matchesFilter } from "./filters";
import HowItWorks from "./HowItWorks";
import PersonalMessage from "./PersonalMessage";
import { activeSort, DEFAULT_SORT, sortWishes } from "./sorting";
import SortSelect from "./SortSelect";
import SpoilerWarning from "./SpoilerWarning";
import type { Claim, Wish, Wishlist } from "./types";
import WishCard from "./WishCard";
import { fetchWishlists, wishlistTitle } from "./wishlists";

// wishlist is null when no Wishlist has this Handle.
type Data = { wishlist: Wishlist | null; others: Wishlist[]; wishes: Wish[]; claims: Claim[] };

async function fetchData(handle: string): Promise<Data> {
  const all = await fetchWishlists();
  const wishlist = all.find((w) => w.handle === handle) ?? null;
  const others = all.filter((w) => w !== wishlist);
  if (!wishlist) return { wishlist, others, wishes: [], claims: [] };

  const supabase = createClient();
  const [wishes, claims] = await Promise.all([
    supabase
      .from("wishes")
      .select("id, title, note, image_url, shop_url, shop_name, price, is_priority, category, kind, created_at")
      .eq("wishlist_id", wishlist.id)
      .is("received_at", null)
      .order("is_priority", { ascending: false })
      .order("created_at", { ascending: false }),
    // Reset Claims only matter for the archive.
    supabase
      .from("claims")
      .select("id, wish_id, claimer_id, claimer_name, status, reset_at, wishes!inner(wishlist_id)")
      .eq("wishes.wishlist_id", wishlist.id)
      .is("reset_at", null)
      .order("created_at"),
  ]);
  if (wishes.error) throw new Error(wishes.error.message);
  if (claims.error) throw new Error(claims.error.message);
  return { wishlist, others, wishes: wishes.data, claims: claims.data };
}

export default function WishList({ handle: handlePromise }: { handle: Promise<string> }) {
  const handle = use(handlePromise);
  const account = useAccount();
  const myUserId = useSessionUserId();
  const [warningAccepted, setWarningAccepted] = useLocalStorage("spoiler-warning-accepted");
  const [guestName, setGuestName] = useLocalStorage("guest-name");
  const [rememberedFilter, setFilter] = useLocalStorage("wish-filter");
  const [rememberedSort, setSort] = useLocalStorage("wish-sort");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    () =>
      fetchData(handle).then(setData, (e: Error) => setError(e.message)),
    [handle],
  );

  useEffect(() => {
    reload();
    // Pick up other people's Claims when coming back to the tab.
    window.addEventListener("focus", reload);
    return () => window.removeEventListener("focus", reload);
  }, [reload]);

  if (account.kind === "loading" || warningAccepted === undefined) return null;

  if (data && !data.wishlist) {
    return (
      <p>
        There&apos;s no wish list here.{" "}
        <Link href="/wish-list" className="underline">
          See all wish lists
        </Link>
      </p>
    );
  }

  if (account.kind === "logged-out" && warningAccepted !== "yes") {
    // The Owner's name isn't known until data loads; wait so the warning names them.
    if (!data) return null;
    return (
      <SpoilerWarning
        ownerName={data.wishlist!.owner_name}
        onContinue={() => setWarningAccepted("yes")}
      />
    );
  }

  // Owner of *this* Wishlist; on anyone else's they're a Gifter.
  const isOwner = account.kind === "owner" && account.handle === handle;
  // The Owner never sees Claims here; Spoiler Mode lives on the Owner page.
  const showClaims = !isOwner;
  const knownName =
    account.kind !== "logged-out" && account.displayName ? account.displayName : guestName ?? null;

  const claimsFor = (wishId: string) => data?.claims.filter((c) => c.wish_id === wishId) ?? [];
  const options = filterOptions(data?.wishes ?? [], showClaims);
  const filter = activeFilter(rememberedFilter, options);
  const sort = activeSort(rememberedSort);
  const shown = sortWishes(
    data?.wishes.filter((wish) => matchesFilter(filter, wish, claimsFor(wish.id))) ?? [],
    sort,
    claimsFor,
    showClaims,
  );

  // Runs a Claim change, then reloads so the page matches the database (which
  // may have refused it, e.g. someone else claimed the Wish a moment earlier).
  async function act(change: () => Promise<void>) {
    setError(null);
    try {
      await change();
    } catch (e) {
      setError((e as Error).message);
    }
    await reload();
  }

  return (
    <>
      {data && data.others.length > 0 && (
        <nav aria-label="Other wish lists" className="mb-4 flex flex-wrap gap-x-3 gap-y-1 text-sm">
          <span className="opacity-70">Other wish lists:</span>
          {data.others.map((other) => (
            <Link key={other.id} href={`/wish-list/${other.handle}`} className="underline hover:opacity-80">
              {other.owner_name}
            </Link>
          ))}
        </nav>
      )}

      <h1 className="mb-6 text-5xl font-light">
        {data?.wishlist ? wishlistTitle(data.wishlist) : "Wish list"}
      </h1>

      {data?.wishlist && <PersonalMessage key={data.wishlist.id} wishlist={data.wishlist} isOwner={isOwner} />}

      <HowItWorks />

      {error && <p className="mb-4 rounded bg-red-900/50 px-3 py-2">{error}</p>}

      {data === null ? (
        <p className="opacity-70">Loading…</p>
      ) : data.wishes.length === 0 ? (
        <p className="opacity-70">No Wishes yet.</p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-4">
            {options.length > 1 && (
              <FilterPills options={options} active={filter} onChange={(id) => setFilter(id === "all" ? null : id)} />
            )}
            <SortSelect active={sort} onChange={(id) => setSort(id === DEFAULT_SORT ? null : id)} />
          </div>
          {shown.length === 0 && <p className="opacity-70">No Wishes match this filter.</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((wish) => (
              <WishCard
                key={wish.id}
                wish={wish}
                claims={claimsFor(wish.id)}
                showClaims={showClaims}
                canClaim={!isOwner}
                myUserId={myUserId}
                knownName={knownName}
                onClaim={(wishId, name) =>
                  act(async () => {
                    if (account.kind === "logged-out") setGuestName(name);
                    await createClaim(wishId, name);
                  })
                }
                onMarkBought={(claimId) => act(() => markBought(claimId))}
                onCancel={(claimId) => act(() => cancelClaim(claimId))}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
