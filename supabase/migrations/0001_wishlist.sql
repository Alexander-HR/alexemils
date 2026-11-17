-- Wishlist schema. Terms follow GLOSSARY.md.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- People ---------------------------------------------------------------------

-- One row per logged-in account (Owner or Gifter). Guests have no profile.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  is_owner boolean not null default false
);

-- Only one Owner.
create unique index profiles_single_owner on public.profiles (is_owner) where is_owner;

create function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and is_owner
  );
$$;

-- Wishes ---------------------------------------------------------------------

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text,
  image_url text,
  shop_url text,
  price text,
  is_priority boolean not null default false,
  kind text not null default 'one_off' check (kind in ('one_off', 'recurring')),
  received_at timestamptz, -- set when the Owner marks the Wish Received
  created_at timestamptz not null default now()
);

-- Claims ---------------------------------------------------------------------

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  wish_id uuid not null references public.wishes (id) on delete cascade,
  -- The auth user that made the Claim: a Gifter's account, or a Guest's
  -- anonymous per-browser user.
  claimer_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  claimer_name text not null check (length(trim(claimer_name)) > 0),
  status text not null default 'reserved' check (status in ('reserved', 'bought')),
  -- Set when the Owner resets a Recurring Wish's counter. Kept for the archive.
  reset_at timestamptz,
  created_at timestamptz not null default now()
);

create index claims_wish_id on public.claims (wish_id);

-- Enforces the rules that depend on the Wish's kind:
--   One-off Wish: at most one Claim.
--   Recurring Wish: Claims are always Bought.
-- No new Claims on Received Wishes, and a Claim can't move to another Wish or claimer.
create function public.check_claim()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  w public.wishes;
begin
  if tg_op = 'UPDATE' and (new.wish_id <> old.wish_id or new.claimer_id <> old.claimer_id) then
    raise exception 'A Claim cannot change Wish or claimer';
  end if;

  -- Row lock serialises concurrent Claims on the same Wish, so two Gifters
  -- can't both claim a One-off Wish at the same moment.
  select * into w from public.wishes where id = new.wish_id for update;

  if tg_op = 'INSERT' and w.received_at is not null then
    raise exception 'Wish has already been received';
  end if;

  if w.kind = 'recurring' then
    new.status := 'bought';
  elsif tg_op = 'INSERT' and exists (
    select 1 from public.claims where wish_id = new.wish_id
  ) then
    raise exception 'Wish is already claimed';
  end if;

  return new;
end;
$$;

create trigger claims_check
  before insert or update on public.claims
  for each row execute function public.check_claim();

-- Row level security ---------------------------------------------------------
-- Note: Guests sign in anonymously, so they have the "authenticated" role too.

alter table public.profiles enable row level security;
alter table public.wishes enable row level security;
alter table public.claims enable row level security;

-- Profiles: you can read your own; the Owner can read all.
create policy "read own profile or owner reads all" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_owner());

-- Wishes: everyone sees active Wishes; only the Owner sees Received ones and edits.
create policy "anyone reads active wishes" on public.wishes
  for select to anon, authenticated
  using (received_at is null or public.is_owner());

create policy "owner inserts wishes" on public.wishes
  for insert to authenticated with check (public.is_owner());

create policy "owner updates wishes" on public.wishes
  for update to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "owner deletes wishes" on public.wishes
  for delete to authenticated using (public.is_owner());

-- Claims: readable by anyone (hiding them from the Owner is Spoiler Mode, a UI
-- choice). Gifters and Guests manage only their own; the Owner can clear any.
create policy "anyone reads claims" on public.claims
  for select to anon, authenticated
  using (true);

create policy "non-owners create own claims" on public.claims
  for insert to authenticated
  with check (claimer_id = auth.uid() and not public.is_owner());

create policy "claimer updates own claim" on public.claims
  for update to authenticated
  using (claimer_id = auth.uid())
  with check (claimer_id = auth.uid());

-- The Owner may reset Recurring counters (sets reset_at).
create policy "owner updates claims" on public.claims
  for update to authenticated
  using (public.is_owner()) with check (public.is_owner());

create policy "claimer or owner deletes claim" on public.claims
  for delete to authenticated
  using (claimer_id = auth.uid() or public.is_owner());

-- Grants ---------------------------------------------------------------------
-- Explicit, in case the project doesn't expose new tables to the Data API by default.
-- RLS above still decides which rows each role can touch.

grant select on public.wishes, public.claims to anon, authenticated;
grant insert, update, delete on public.wishes, public.claims to authenticated;
grant select on public.profiles to authenticated;
grant execute on function public.is_owner() to anon, authenticated;
