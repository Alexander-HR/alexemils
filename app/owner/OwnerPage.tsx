"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAccount } from "@/utils/supabase/useAccount";
import { useLocalStorage } from "@/utils/useLocalStorage";
import { categoriesOf } from "../wish-list/filters";
import type { Claim, Wish } from "../wish-list/types";
import InviteForm from "./InviteForm";
import WishForm, { type WishInput } from "./WishForm";

type OwnerWish = Wish & { received_at: string | null };
type Data = { wishlistId: string; wishes: OwnerWish[]; claims: (Claim & { created_at: string })[] };

// Only the Owner's own Wishlist: other people's active Wishes are readable too.
async function fetchData(ownerId: string): Promise<Data> {
  const supabase = createClient();
  const wishlist = await supabase.from("wishlists").select("id").eq("owner_id", ownerId).single();
  if (wishlist.error) throw new Error(wishlist.error.message);
  const wishlistId: string = wishlist.data.id;

  const [wishes, claims] = await Promise.all([
    supabase
      .from("wishes")
      .select("*")
      .eq("wishlist_id", wishlistId)
      .order("is_priority", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("claims")
      .select("*, wishes!inner(wishlist_id)")
      .eq("wishes.wishlist_id", wishlistId)
      .order("created_at"),
  ]);
  if (wishes.error) throw new Error(wishes.error.message);
  if (claims.error) throw new Error(claims.error.message);
  return { wishlistId, wishes: wishes.data, claims: claims.data };
}

// Supabase returns { error } instead of throwing; turn it into an exception.
function check({ error }: { error: { message: string } | null }) {
  if (error) throw new Error(error.message);
}

const small = "rounded border border-foreground/70 px-2 py-1 text-sm hover:bg-foreground/10";

export default function OwnerPage() {
  const account = useAccount();
  const [showClaimsPref, setShowClaimsPref] = useLocalStorage("spoiler-mode");
  const showClaims = showClaimsPref === "yes";
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const ownerId = account.kind === "owner" ? account.userId : null;
  const reload = useCallback(
    async () => {
      if (ownerId) await fetchData(ownerId).then(setData, (e: Error) => setError(e.message));
    },
    [ownerId],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  if (account.kind === "loading") return null;
  if (account.kind !== "owner") {
    return (
      <p>
        Only Owners can see this page.{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    );
  }

  async function act(change: () => Promise<void>) {
    setError(null);
    try {
      await change();
    } catch (e) {
      setError((e as Error).message);
    }
    await reload();
  }

  const supabase = createClient();
  const active = data?.wishes.filter((w) => !w.received_at) ?? [];
  const received = data?.wishes.filter((w) => w.received_at) ?? [];
  const claimsFor = (wishId: string) => data?.claims.filter((c) => c.wish_id === wishId) ?? [];
  const categories = categoriesOf(data?.wishes ?? []);

  return (
    <div className="flex flex-col gap-10 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-light">Manage wishlist</h1>
          <Link href={`/wish-list/${account.handle}`} className="text-sm underline hover:opacity-80">
            View your wish list
          </Link>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showClaims}
            onChange={(e) => setShowClaimsPref(e.target.checked ? "yes" : null)}
          />
          Show claims (spoilers!)
        </label>
      </div>

      {error && <p className="rounded bg-red-900/50 px-3 py-2">{error}</p>}

      <section className="rounded-lg bg-surface p-4">
        <h2 className="mb-4 text-2xl">Add a Wish</h2>
        <WishForm
          categories={categories}
          submitLabel="Add Wish"
          onSubmit={(wish) =>
            act(async () => {
              if (!data) throw new Error("Still loading your wish list.");
              check(await supabase.from("wishes").insert({ ...wish, wishlist_id: data.wishlistId }));
            })
          }
        />
      </section>

      <section>
        <h2 className="mb-4 text-2xl">Wishes ({active.length})</h2>
        {data === null ? (
          <p className="opacity-70">Loading…</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((wish) => {
              const claims = claimsFor(wish.id).filter((c) => !c.reset_at);
              return (
                <li key={wish.id} className="rounded-lg bg-surface p-4">
                  {editingId === wish.id ? (
                    <WishForm
                      initial={wish}
                      categories={categories}
                      submitLabel="Save"
                      onCancel={() => setEditingId(null)}
                      onSubmit={(changes: WishInput) =>
                        act(async () => {
                          check(await supabase.from("wishes").update(changes).eq("id", wish.id));
                          setEditingId(null);
                        })
                      }
                    />
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-lg">
                          {wish.is_priority && <span className="mr-1 text-yellow-400 christmas:text-highlight">★</span>}
                          {wish.title}
                          {wish.kind === "recurring" && (
                            <span className="ml-2 text-sm opacity-60">Recurring</span>
                          )}
                          {wish.category && (
                            <span className="ml-2 text-sm opacity-60">{wish.category}</span>
                          )}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <button className={small} onClick={() => setEditingId(wish.id)}>
                            Edit
                          </button>
                          <button
                            className={small}
                            onClick={() =>
                              act(async () =>
                                check(
                                  await supabase
                                    .from("wishes")
                                    .update({ received_at: new Date().toISOString() })
                                    .eq("id", wish.id),
                                ),
                              )
                            }
                          >
                            Mark Received
                          </button>
                          {wish.kind === "recurring" && (
                            <button
                              className={small}
                              onClick={() =>
                                confirm(`Reset the counter for "${wish.title}"?`) &&
                                act(async () =>
                                  check(
                                    await supabase
                                      .from("claims")
                                      .update({ reset_at: new Date().toISOString() })
                                      .eq("wish_id", wish.id)
                                      .is("reset_at", null),
                                  ),
                                )
                              }
                            >
                              Reset counter
                            </button>
                          )}
                          <button
                            className={`${small} border-red-400 text-red-300`}
                            onClick={() =>
                              confirm(`Delete "${wish.title}" and all its Claims?`) &&
                              act(async () =>
                                check(await supabase.from("wishes").delete().eq("id", wish.id)),
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {showClaims && claims.length > 0 && (
                        <ul className="mt-3 flex flex-col gap-1 text-sm">
                          {claims.map((claim) => (
                            <li key={claim.id} className="flex items-center gap-2">
                              <span>
                                {claim.status === "bought" ? "Bought" : "Reserved"} by{" "}
                                {claim.claimer_name}
                              </span>
                              <button
                                className="text-red-300 underline hover:opacity-80"
                                onClick={() =>
                                  act(async () =>
                                    check(await supabase.from("claims").delete().eq("id", claim.id)),
                                  )
                                }
                              >
                                Clear
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl">Received ({received.length})</h2>
        <ul className="flex flex-col gap-3">
          {received.map((wish) => {
            const givers = claimsFor(wish.id).map((c) => c.claimer_name);
            return (
              <li key={wish.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface p-4">
                <div>
                  <h3 className="text-lg">{wish.title}</h3>
                  <p className="text-sm opacity-70">
                    Received {new Date(wish.received_at!).toLocaleDateString()}
                    {givers.length > 0 && ` · from ${givers.join(", ")}`}
                  </p>
                </div>
                <button
                  className={small}
                  onClick={() =>
                    act(async () =>
                      check(await supabase.from("wishes").update({ received_at: null }).eq("id", wish.id)),
                    )
                  }
                >
                  Put back on the list
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-lg bg-surface p-4">
        <h2 className="mb-1 text-2xl">Invite family</h2>
        <p className="mb-4 text-sm opacity-70">
          They&apos;ll get an email to choose a password, then claim under this name.
        </p>
        <InviteForm />
      </section>
    </div>
  );
}
