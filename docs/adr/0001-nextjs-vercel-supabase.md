# Next.js on Vercel with Supabase, replacing GitHub Pages

The wishlist needs shared state (Claims) and logins, which a static GitHub Pages site cannot store. We're moving the whole site to Next.js hosted on Vercel, with Supabase (Postgres, Auth, row-level security) as the backend, all on free tiers and deployed from this GitHub repo.

## Considered Options

- **Stay on GitHub Pages + Firebase (Auth + Firestore)**: no build step and no framework, but the Owner preferred to learn and grow into a full-stack Next.js setup while the site is still early.
- **Google Sheet + Apps Script / GitHub Issues as storage**: rejected as clunky and, for Issues, requiring GitHub accounts or an exposed token.

## Consequences

- The `alexander-hr.github.io` address is abandoned; the repo name no longer reflects where the site is hosted.
- Supabase free-tier projects pause after a week of low database activity, which a rarely-visited family wishlist will hit. A daily Vercel cron runs a real query to keep it awake; if that ever stops working, unpausing by hand is acceptable.
