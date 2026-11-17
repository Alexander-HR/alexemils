"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import AccountMenu from "./AccountMenu";

const links = [
  { href: "/", label: "Home" },
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
      {links.map(({ href, label }) => {
        // Each Wishlist (/wish-list/{handle}) counts as the Wish List page.
        const current =
          pathname === href || (href !== "/" && !!pathname?.startsWith(`${href}/`));
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={current ? "page" : undefined}
              className={`block rounded px-3 py-1 hover:bg-foreground/10 ${
                current ? "bg-foreground/15 font-semibold" : ""
              }`}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
