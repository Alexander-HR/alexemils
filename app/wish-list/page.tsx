import type { Metadata } from "next";

export const metadata: Metadata = { title: "Wish list" };

export default function WishList() {
  return (
    <>
      <h1 className="mb-6 text-5xl font-light">This is my wishlist</h1>

      {/* Placeholder Wish card; real Wishes come from Supabase in step 5. */}
      <div className="w-72 overflow-hidden rounded-lg bg-surface">
        <div className="flex h-40 items-center justify-center bg-foreground/10 text-sm opacity-60">
          Image
        </div>
        <div className="p-4">
          <h5 className="mb-2 text-xl">Card title</h5>
          <p className="mb-4">
            Some quick example text to build on the card title and make up the
            bulk of the card&apos;s content.
          </p>
          <a
            href="#"
            className="inline-block rounded bg-accent px-3 py-1.5 hover:opacity-90"
          >
            Go somewhere
          </a>
        </div>
      </div>
    </>
  );
}
