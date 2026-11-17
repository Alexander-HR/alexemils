"use client";

import { useCallback, useEffect, useState } from "react";
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
import type { Claim, Wish } from "./types";
import WishCard from "./WishCard";

type Data = { wishes: Wish[]; claims: Claim[] };

async function fetchData(): Promise<Data> {
  const supabase = createClient();
  const [wishes, claims] = await Promise.all([
    supabase
      .from("wishes")
      .select("id, title, note, image_url, shop_url, shop_name, price, is_priority, category, kind, created_at")
      .is("received_at", null)
      .order("is_priority", { ascending: false })
      .order("created_at", { ascending: false }),
    // Reset Claims only matter for the archive.
    supabase
      .from("claims")
      .select("id, wish_id, claimer_id, claimer_name, status, reset_at")
      .is("reset_at", null)
      .order("created_at"),
  ]);
  if (wishes.error) throw new Error(wishes.error.message);
  if (claims.error) throw new Error(claims.error.message);
  return { wishes: wishes.data, claims: claims.data };
}

export default function WishList() {
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
      fetchData().then(setData, (e: Error) => setError(e.message)),
    [],
  );

  useEffect(() => {
    reload();
    // Pick up other people's Claims when coming back to the tab.
    window.addEventListener("focus", reload);
    return () => window.removeEventListener("focus", reload);
  }, [reload]);

  if (account.kind === "loading" || warningAccepted === undefined) return null;

  if (account.kind === "logged-out" && warningAccepted !== "yes") {
    return <SpoilerWarning onContinue={() => setWarningAccepted("yes")} />;
  }

  const isOwner = account.kind === "owner";
  // The Owner never sees Claims here; Spoiler Mode lives on the Owner page.
  const showClaims = !isOwner;
  const knownName =
    account.kind === "gifter" && account.displayName ? account.displayName : guestName ?? null;

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
      <h1 className="mb-6 text-5xl font-light">This is my wishlist</h1>

      <PersonalMessage isOwner={isOwner} />

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
