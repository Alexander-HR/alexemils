"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SpoilerWarning({
  ownerName,
  onContinue,
}: {
  ownerName: string;
  onContinue: () => void;
}) {
  const router = useRouter();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spoiler-warning-title"
      className="mx-auto mt-10 max-w-md rounded-lg bg-surface p-6 text-center"
    >
      <h2 id="spoiler-warning-title" className="mb-2 text-2xl">
        You&apos;re not logged in
      </h2>
      <p className="mb-6 opacity-80">
        This page shows which gifts have already been claimed. If you&apos;re
        {` ${ownerName}`}, go back so you don&apos;t spoil the surprise!
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded border border-foreground/70 px-3 py-1.5 hover:bg-foreground/10"
        >
          Go back
        </button>
        <Link
          href="/login"
          className="rounded border border-foreground/70 px-3 py-1.5 hover:bg-foreground/10"
        >
          Log in
        </Link>
        <button
          type="button"
          onClick={onContinue}
          className="rounded bg-accent px-3 py-1.5 hover:opacity-90"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
