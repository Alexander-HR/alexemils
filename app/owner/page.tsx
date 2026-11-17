import type { Metadata } from "next";
import OwnerPage from "./OwnerPage";

export const metadata: Metadata = { title: "Manage wishlist" };

export default function Owner() {
  return <OwnerPage />;
}
