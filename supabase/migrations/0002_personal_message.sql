-- The Owner's Personal Message, shown under the wishlist heading.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- A single row: the primary key can only ever be true.
create table public.personal_message (
  id boolean primary key default true check (id),
  message text not null default '' check (length(message) <= 500),
  updated_at timestamptz not null default now()
);

insert into public.personal_message default values;

alter table public.personal_message enable row level security;

create policy "anyone reads the personal message" on public.personal_message
  for select to anon, authenticated
  using (true);

create policy "owner updates the personal message" on public.personal_message
  for update to authenticated
  using (public.is_owner()) with check (public.is_owner());

grant select on public.personal_message to anon, authenticated;
grant update on public.personal_message to authenticated;
