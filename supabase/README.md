# Supabase

SQL in `migrations/` is applied by hand: Supabase dashboard → SQL Editor → paste → Run, in filename order.

## Making yourself the Owner

1. Dashboard → Authentication → Users → Add user → create your email + password account.
2. In SQL Editor, run (with your email):

```sql
insert into public.profiles (id, display_name, is_owner)
select id, 'Alexander', true from auth.users where email = 'you@example.com';
```

## Family invites

The Owner page sends invites with the secret key, so it must be set (never with a `NEXT_PUBLIC_` prefix):

- `.env.local`: `SUPABASE_SECRET_KEY=sb_secret_…`
- Vercel → Settings → Environment Variables: same name, saved as secret.

Dashboard setup (once):

1. Authentication → URL Configuration → Redirect URLs: add `http://localhost:3000/**` and your Vercel URL(s), e.g. `https://*-alexander-hr.vercel.app/**`.
2. Authentication → Emails → **Invite user** template: replace the link with

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=invite">Accept the invite</a>
```

The link lands on `/auth/confirm`, which logs them in and sends them to `/set-password`.
