"use client";

import { useLocalStorage } from "@/utils/useLocalStorage";

// Explains claiming as it really works: Gifters see each other's Claims, the
// Owner only sees them in Spoiler Mode, and any Claim can be cancelled.
const STEPS = [
  {
    title: "Reserve it",
    text: "Reserve a Wish so nobody else buys the same thing, then mark it as bought once you have it. Some Wishes can be given many times; just say you bought one.",
  },
  {
    title: "Coordinate",
    text: "Everyone giving gifts can see who's getting what, so you can team up. Alexander only sees it with \"Show claims (spoilers!)\" switched on, so the surprise is safe.",
  },
  {
    title: "Zero pressure",
    text: "Changed your mind? Cancel any time, even after marking it as bought, and someone else can pick it up.",
  },
];

export default function HowItWorks() {
  const [dismissed, setDismissed] = useLocalStorage("how-it-works-dismissed");

  if (dismissed === undefined) return null;
  const open = dismissed !== "yes";

  // One toggle button in both states, so keyboard focus stays on it.
  return (
    <section aria-labelledby={open ? "how-it-works-title" : undefined} className="mb-6">
      <div className="flex items-baseline justify-between gap-4">
        {open && (
          <h2 id="how-it-works-title" className="text-2xl">
            How it works
          </h2>
        )}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="how-it-works-steps"
          onClick={() => setDismissed(open ? "yes" : null)}
          className="text-sm underline opacity-70 hover:opacity-100"
        >
          {open ? "Got it, hide this" : "How does this work?"}
        </button>
      </div>
      <ol id="how-it-works-steps" hidden={!open} className="mt-3 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="rounded-lg bg-surface p-4 christmas:rounded-2xl christmas:border christmas:border-edge"
          >
            <h3 className="mb-1 text-lg">
              <span aria-hidden className="mr-2 opacity-60">
                {i + 1}.
              </span>
              {step.title}
            </h3>
            <p className="text-sm opacity-80">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
