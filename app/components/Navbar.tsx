"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about-me", label: "About Me" },
  { href: "/ghibli-tree", label: "Ghibli Tree" },
  { href: "/wish-list", label: "Wish List" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="sticky top-0 z-30 flex items-center gap-3 bg-navbar px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          className="rounded border border-foreground/70 px-3 py-1 hover:bg-foreground/10"
        >
          ☰
        </button>
        {/* Login isn't built yet; it'll link to the login page in step 4. */}
        <span className="text-lg">Login</span>
      </nav>

      {/* Sidebar */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-label="Navigation"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-background p-4 shadow-xl transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-xl">Navigation</h5>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="text-2xl leading-none hover:opacity-70"
          >
            ×
          </button>
        </div>
        <ul className="flex flex-col">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className={`block rounded px-2 py-2 hover:bg-foreground/10 ${
                  pathname === href ? "font-semibold" : ""
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
