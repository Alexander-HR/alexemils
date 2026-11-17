"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountMenu from "./AccountMenu";

const links = [
  { href: "/", label: "Home" },
  { href: "/about-me", label: "About Me" },
  { href: "/wish-list", label: "Wish List" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-30 flex flex-wrap items-center gap-x-4 gap-y-2 bg-navbar px-4 py-2">
      <ul className="flex flex-wrap items-center gap-1">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`block rounded px-3 py-1 hover:bg-foreground/10 ${
                pathname === href ? "bg-foreground/15 font-semibold" : ""
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="ml-auto">
        <AccountMenu />
      </div>
    </nav>
  );
}
