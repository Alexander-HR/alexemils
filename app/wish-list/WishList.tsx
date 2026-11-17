"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAccount, useSessionUserId } from "@/utils/supabase/useAccount";
import { useLocalStorage } from "@/utils/useLocalStorage";
import { cancelClaim, createClaim, markBought } from "./claims";
import SpoilerWarning from "./SpoilerWarning";
import type { Claim, Wish } from "./types";
import WishCard from "./WishCard";

type Data = { wishes: Wish[]; claims: Claim[] };

async function fetchData(): Promise<Data> {
  const supabase = createClient();
  const [wishes, claims] = await Promise.all([
    supabase
      .from("wishes")
      .select("id, title, note, image_url, shop_url, price, is_priority, kind, created_at")
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
  const [ownerShowsClaims, setOwnerShowsClaims] = useLocalStorage("spoiler-mode");
  const [guestName, setGuestName] = useLocalStorage("guest-name");
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
  const showClaims = !isOwner || ownerShowsClaims === "yes";
  const knownName =
    account.kind === "gifter" && account.displayName ? account.displayName : guestName ?? null;

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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl font-light">This is my wishlist</h1>
        {isOwner && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showClaims}
              onChange={(e) => setOwnerShowsClaims(e.target.checked ? "yes" : null)}
            />
            Show claims (spoilers!)
          </label>
        )}
      </div>

      {error && <p className="mb-4 rounded bg-red-900/50 px-3 py-2">{error}</p>}

      {data === null ? (
        <p className="opacity-70">Loading…</p>
      ) : data.wishes.length === 0 ? (
        <p className="opacity-70">No Wishes yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.wishes.map((wish) => (
            <WishCard
              key={wish.id}
              wish={wish}
              claims={data.claims.filter((c) => c.wish_id === wish.id)}
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
      )}
    </>
  );
}
