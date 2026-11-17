"use client";

import { useEffect, useState } from "react";
import { createClient } from "./client";

// Who's using the site, in glossary terms. Guests (anonymous sign-ins) count
// as logged out: they have no account, only a per-browser identity.
export type Account =
  | { kind: "loading" }
  | { kind: "logged-out" }
  | { kind: "owner" | "gifter"; userId: string; displayName: string };

type Profile = { userId: string; displayName: string; isOwner: boolean };

// The Supabase user behind this browser, Guests included: used to tell which
// Claims are "mine". null when there's no session yet.
export function useSessionUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data } = createClient().auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return userId;
}

export function useAccount(): Account {
  // undefined = session not known yet, null = no account.
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUserId(user && !user.is_anonymous ? user.id : null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Profile lookup lives outside onAuthStateChange: Supabase warns that
  // awaiting its own calls inside that callback can deadlock.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    createClient()
      .from("profiles")
      .select("display_name, is_owner")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setProfile({
          userId,
          displayName: data?.display_name ?? "",
          isOwner: data?.is_owner ?? false,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (userId === undefined) return { kind: "loading" };
  if (userId === null) return { kind: "logged-out" };
  if (profile?.userId !== userId) return { kind: "loading" };
  // An account without a profile wasn't invited; treat it as a Gifter with no
  // name rather than blocking them.
  return {
    kind: profile.isOwner ? "owner" : "gifter",
    userId,
    displayName: profile.displayName,
  };
}
