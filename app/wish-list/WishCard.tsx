"use client";

import { useState } from "react";
import type { Claim, Wish } from "./types";

type Props = {
  wish: Wish;
  // Active Claims on this Wish (Recurring counters exclude reset ones).
  claims: Claim[];
  showClaims: boolean;
  canClaim: boolean;
  myUserId: string | null;
  // The name to claim under, if we already know it.
  knownName: string | null;
  onClaim: (wishId: string, name: string) => Promise<void>;
  onMarkBought: (claimId: string) => Promise<void>;
  onCancel: (claimId: string) => Promise<void>;
};

const button = "rounded px-3 py-1.5 text-sm disabled:cursor-not-allowed";
const primary = `${button} bg-accent hover:opacity-90 disabled:bg-foreground/20 disabled:opacity-60`;
const secondary = `${button} border border-foreground/70 hover:bg-foreground/10`;

export default function WishCard(props: Props) {
  const { wish, claims, showClaims } = props;
  // A taken One-off Wish, when the viewer is allowed to see that it's taken.
  const takenClaim = showClaims && wish.kind === "one_off" ? claims[0] : undefined;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-surface christmas:rounded-2xl christmas:border christmas:border-edge christmas:p-3 christmas:shadow-sm">
      <div className="relative christmas:overflow-hidden christmas:rounded-xl">
        {wish.image_url ? (
          // External URLs from anywhere, so a plain <img> rather than next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={wish.image_url}
            alt=""
            className={`h-48 w-full object-cover christmas:h-auto christmas:aspect-[4/3] ${
              takenClaim ? "christmas:opacity-40 christmas:grayscale-50" : ""
            }`}
          />
        ) : (
          <div className="h-48 bg-foreground/10 christmas:h-auto christmas:aspect-[4/3]" />
        )}
        {takenClaim && (
          <div className="absolute inset-0 hidden items-center justify-center christmas:flex">
            <span className="rounded-full border border-edge bg-surface/95 px-3.5 py-1.5 text-xs font-semibold">
              {takenClaim.status === "bought" ? "Bought" : "Reserved"}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 christmas:px-1 christmas:pb-1">
        <h2 className="text-xl">
          {wish.is_priority && (
            <span title="Really want this" className="mr-1 text-yellow-400 christmas:text-highlight">
              ★
            </span>
          )}
          {wish.title}
        </h2>
        {wish.note && <p className="opacity-80">{wish.note}</p>}
        <div className="flex flex-wrap items-center gap-x-3 text-sm opacity-80">
          {wish.price && <span className="christmas:font-semibold christmas:text-highlight">{wish.price}</span>}
          {wish.shop_url && (
            <a href={wish.shop_url} target="_blank" rel="noreferrer" className="underline">
              Where to buy
            </a>
          )}
          {wish.category && (
            <span className="rounded-full border border-foreground/30 px-2 py-0.5 text-xs christmas:border-edge">
              {wish.category}
            </span>
          )}
          {wish.kind === "recurring" && <span>Can be given many times</span>}
        </div>
        <div className="mt-auto pt-3">
          {wish.kind === "recurring" ? <RecurringClaims {...props} /> : <OneOffClaim {...props} />}
        </div>
      </div>
    </article>
  );
}

function OneOffClaim(props: Props) {
  const { claims, showClaims, canClaim, myUserId } = props;
  const claim = claims[0];

  if (!showClaims) return null;

  if (!claim) {
    return canClaim ? <ClaimButton {...props} label="Reserve" /> : null;
  }

  const verb = claim.status === "bought" ? "Bought" : "Reserved";
  const mine = claim.claimer_id === myUserId;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        {verb} by {mine ? "you" : claim.claimer_name}
      </p>
      {mine ? (
        <div className="flex flex-wrap gap-2">
          {claim.status === "reserved" && (
            <Action className={primary} onClick={() => props.onMarkBought(claim.id)}>
              Mark as bought
            </Action>
          )}
          <Action className={secondary} onClick={() => props.onCancel(claim.id)}>
            Cancel
          </Action>
        </div>
      ) : (
        canClaim && (
          <button type="button" disabled className={`${primary} self-start`}>
            {verb}
          </button>
        )
      )}
    </div>
  );
}

function RecurringClaims(props: Props) {
  const { claims, showClaims, canClaim, myUserId } = props;
  const mine = claims.filter((c) => c.claimer_id === myUserId);

  if (!showClaims) return null;

  const count = claims.length;
  return (
    <div className="flex flex-col gap-2">
      {count > 0 && (
        <p className="text-sm">
          {count === 1 ? "1 person has" : `${count} people have`} bought this
          <span className="opacity-70">
            {" "}
            ({claims.map((c) => (c.claimer_id === myUserId ? "you" : c.claimer_name)).join(", ")})
          </span>
        </p>
      )}
      {canClaim && (
        <div className="flex flex-wrap gap-2">
          <ClaimButton {...props} label="I bought this" />
          {mine.length > 0 && (
            <Action className={secondary} onClick={() => props.onCancel(mine[mine.length - 1].id)}>
              Undo
            </Action>
          )}
        </div>
      )}
    </div>
  );
}

// Claims straight away when we know the name; otherwise asks for it first.
function ClaimButton({ wish, knownName, onClaim, label }: Props & { label: string }) {
  const [asking, setAsking] = useState(false);
  const [name, setName] = useState("");

  if (!asking) {
    return (
      <Action
        className={primary}
        onClick={() => (knownName ? onClaim(wish.id, knownName) : Promise.resolve(setAsking(true)))}
      >
        {label}
      </Action>
    );
  }

  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        await onClaim(wish.id, name.trim());
        setAsking(false);
      }}
    >
      <input
        autoFocus
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        aria-label="Your name"
        className="min-w-0 flex-1 rounded bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent"
      />
      <button type="submit" disabled={!name.trim()} className={primary}>
        {label}
      </button>
    </form>
  );
}

// A button that disables itself while its action runs.
function Action({
  onClick,
  className,
  children,
}: {
  onClick: () => Promise<void>;
  className: string;
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={async () => {
        setPending(true);
        try {
          await onClick();
        } finally {
          setPending(false);
        }
      }}
    >
      {children}
    </button>
  );
}
