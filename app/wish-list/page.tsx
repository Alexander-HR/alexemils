import type { Metadata } from "next";
import WishlistIndex from "./WishlistIndex";

export const metadata: Metadata = { title: "Wish lists" };

export default function WishListsPage() {
  return <WishlistIndex />;
}
