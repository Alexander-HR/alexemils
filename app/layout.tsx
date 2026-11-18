import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import EmailLinkHandler from "./components/EmailLinkHandler";
import Navbar from "./components/Navbar";
import Snow from "./components/Snow";
import { themeScript } from "./theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The Christmas Theme's fonts (see globals.css). Not preloaded, since most of
// the year nothing uses them.
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  preload: false,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Alexander",
  description: "Alexander's personal site and wishlist",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${plusJakartaSans.variable} h-full antialiased`}
      // The theme script below sets data-theme before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Snow />
        <Navbar />
        <main className="mx-auto w-full max-w-5xl px-4 mt-6">{children}</main>
        <EmailLinkHandler />
        <Analytics />
      </body>
    </html>
  );
}
