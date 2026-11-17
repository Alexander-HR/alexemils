-- Many Wishlists, one per Owner, each at /wish-list/{handle}. Terms follow GLOSSARY.md.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Moves the existing Wishes and Personal Message onto the current Owner's
-- Wishlist (Handle "alexander"). To make someone else an Owner afterwards,
-- give them a Wishlist (they need a profile, i.e. an invited account):
--
--   insert into public.wishlists (owner_id, handle)
--   select id, 'her-handle' from public.profiles where display_name = 'Her name';

-- Wishlists -------------------------------------------------------------------

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  -- Unique: a person owns at most one Wishlist.
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  -- Never changed after creation: clients may only update personal_message.
  handle text not null unique check (handle ~ '^[a-z0-9][a-z0-9-]{0,29}$'),
  personal_message text not null default '' check (length(personal_message) <= 500),
  created_at timestamptz not null default now()
);

insert into public.wishlists (owner_id, handle, personal_message)
select p.id, 'alexander', coalesce((select message from public.personal_message), '')
from public.profiles p
where p.is_owner;

do $$
begin
  if not exists (select 1 from public.wishlists) then
    raise exception 'No profile has is_owner set, so there is no Owner to give the "alexander" Wishlist to';
  end if;
end;
$$;

-- Being an Owner now means owning a Wishlist.
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.wishlists where owner_id = auth.uid()
  );
$$;

create function public.owns_wishlist(wishlist_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.wishlists where id = wishlist_id and owner_id = auth.uid()
  );
$$;

-- Wishes belong to a Wishlist ---------------------------------------------------

alter table public.wishes
  add column wishlist_id uuid references public.wishlists (id) on delete cascade;

update public.wishes set wishlist_id = (select id from public.wishlists where handle = 'alexander');

alter table public.wishes alter column wishlist_id set not null;

create index wishes_wishlist_id on public.wishes (wishlist_id);

-- Security definer so it also sees Received Wishes, which RLS hides.
create function public.owns_wish(wish_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wishes w
    join public.wishlists l on l.id = w.wishlist_id
    where w.id = wish_id and l.owner_id = auth.uid()
  );
$$;

-- The old single-Owner bits ---------------------------------------------------

drop table public.personal_message;
alter table public.profiles drop column is_owner; -- also drops profiles_single_owner

-- Row level security ---------------------------------------------------------

alter table public.wishlists enable row level security;

create policy "anyone reads wishlists" on public.wishlists
  for select to anon, authenticated
  using (true);

create policy "owner updates own wishlist" on public.wishlists
  for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Owners' names head their Wishlists, so anyone can read those profiles.
create policy "anyone reads owner profiles" on public.profiles
  for select to anon, authenticated
  using (exists (select 1 from public.wishlists where owner_id = profiles.id));

-- Wishes: everyone sees active Wishes; only a Wishlist's Owner sees its
-- Received ones and edits it.
drop policy "anyone reads active wishes" on public.wishes;
drop policy "owner inserts wishes" on public.wishes;
drop policy "owner updates wishes" on public.wishes;
drop policy "owner deletes wishes" on public.wishes;

create policy "anyone reads active wishes" on public.wishes
  for select to anon, authenticated
  using (received_at is null or public.owns_wishlist(wishlist_id));

create policy "owner inserts wishes" on public.wishes
  for insert to authenticated with check (public.owns_wishlist(wishlist_id));

create policy "owner updates wishes" on public.wishes
  for update to authenticated
  using (public.owns_wishlist(wishlist_id)) with check (public.owns_wishlist(wishlist_id));

create policy "owner deletes wishes" on public.wishes
  for delete to authenticated using (public.owns_wishlist(wishlist_id));

-- Claims: anyone but the Wishlist's own Owner can claim, so Owners are Gifters
-- on each other's Wishlists.
drop policy "non-owners create own claims" on public.claims;
drop policy "owner updates claims" on public.claims;
drop policy "claimer or owner deletes claim" on public.claims;

create policy "non-owners create own claims" on public.claims
  for insert to authenticated
  with check (claimer_id = auth.uid() and not public.owns_wish(wish_id));

-- The Owner may reset Recurring counters (sets reset_at).
create policy "owner updates claims" on public.claims
  for update to authenticated
  using (public.owns_wish(wish_id)) with check (public.owns_wish(wish_id));

create policy "claimer or owner deletes claim" on public.claims
  for delete to authenticated
  using (claimer_id = auth.uid() or public.owns_wish(wish_id));

-- Grants ---------------------------------------------------------------------

grant select on public.wishlists to anon, authenticated;
grant update (personal_message) on public.wishlists to authenticated;
grant select on public.profiles to anon;
grant execute on function public.owns_wishlist(uuid), public.owns_wish(uuid) to anon, authenticated;
