"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import AccountMenu from "./AccountMenu";

const links = [
  // The site's name, so it stands out. The tree only shows during the Christmas Theme.
  { href: "/", label: "AlexEmils", christmasEmoji: "🎄", prominent: true },
  { href: "/about-me", label: "About Me" },
  { href: "/wish-list", label: "Wish List" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-30 flex flex-wrap items-center gap-x-4 gap-y-2 bg-navbar px-4 py-2">
      {/* The pathname isn't known while prerendering a Wishlist (/wish-list/{handle}),
          so the links first render without a current page. */}
      <Suspense fallback={<NavLinks pathname={null} />}>
        <CurrentNavLinks />
      </Suspense>
      <div className="ml-auto">
        <AccountMenu />
      </div>
    </nav>
  );
}

function CurrentNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex flex-wrap items-center gap-1">
      {links.map(({ href, label, christmasEmoji, prominent }) => {
        // Each Wishlist (/wish-list/{handle}) counts as the Wish List page.
        const current =
          pathname === href || (href !== "/" && !!pathname?.startsWith(`${href}/`));
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={current ? "page" : undefined}
              className={`block rounded px-3 py-1 hover:bg-foreground/10 ${
                prominent ? "text-2xl font-semibold" : ""
              } ${current ? "bg-foreground/15 font-semibold" : ""}`}
            >
              {label}
              {christmasEmoji && (
                <span aria-hidden className="ml-1 hidden christmas:inline">
                  {christmasEmoji}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
