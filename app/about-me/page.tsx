import type { Metadata } from "next";

export const metadata: Metadata = { title: "About me" };

export default function AboutMe() {
  return (
    <>
      <h1 className="mb-4 text-5xl font-light">About me</h1>
      <p>I&apos;m a computer science student in Háskólinn í Reykjavík.</p>
    </>
  );
}
