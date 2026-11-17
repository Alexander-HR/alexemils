import type { Metadata } from "next";
import WishList from "./WishList";

export const metadata: Metadata = { title: "Wish list" };

export default function WishListPage() {
  return <WishList />;
}
