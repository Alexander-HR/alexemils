import type { Metadata } from "next";
import { Suspense } from "react";
import WishList from "../WishList";

export const metadata: Metadata = { title: "Wish list" };

// Not async: the Handle is read inside the boundary, so the shell still prerenders.
export default function WishListPage({ params }: PageProps<"/wish-list/[handle]">) {
  return (
    <Suspense>
      <WishList handle={params.then((p) => p.handle)} />
    </Suspense>
  );
}
