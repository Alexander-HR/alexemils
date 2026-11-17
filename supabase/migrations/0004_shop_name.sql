-- The shop's name for a Wish, shown on the card. Optional: when it's empty the
-- card falls back to the shop link's domain.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

alter table public.wishes
  add column shop_name text
  check (shop_name is null or length(trim(shop_name)) between 1 and 40);
