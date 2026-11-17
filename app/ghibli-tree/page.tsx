import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ghibli tree" };

export default function GhibliTree() {
  return (
    <>
      <h1 className="mb-4 text-5xl font-light">Ghibli tree</h1>
      <p>This will eventually become a showcase for a ghibli tree</p>
    </>
  );
}
