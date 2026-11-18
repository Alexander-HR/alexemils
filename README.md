# alexemils

Personal site and family wishlist. Next.js + Tailwind, hosted on Vercel, with Supabase as the backend (see `docs/adr/`). Domain terms live in `GLOSSARY.md`.

```sh
npm install
npm run dev   # http://localhost:3000
```

## Supabase setup

Invite and password reset emails work with Supabase's default templates: the link logs the person in and the site sends them to choose a password (`app/components/EmailLinkHandler.tsx`). Editing the templates needs a custom SMTP provider. If one is ever set up, links of this form are handled by `/auth/confirm`:

- **Invite user**: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`
- **Reset password**: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`

Under **Authentication → URL Configuration**, the **Site URL** must be `https://alexemils.vercel.app`, with `https://alexemils.vercel.app/**` (and `http://localhost:3000/**` for local testing) in **Redirect URLs**.

Sending invites needs `SUPABASE_SECRET_KEY` in Vercel's environment variables (and in `.env.local` locally).

New Owners get their Wishlist by hand in the SQL Editor (see `supabase/migrations/0005_wishlists.sql`).
