# Supabase

SQL in `migrations/` is applied by hand: Supabase dashboard → SQL Editor → paste → Run, in filename order.

## Making yourself the Owner

1. Dashboard → Authentication → Users → Add user → create your email + password account.
2. In SQL Editor, run (with your email):

```sql
insert into public.profiles (id, display_name, is_owner)
select id, 'Alexander', true from auth.users where email = 'you@example.com';
```
