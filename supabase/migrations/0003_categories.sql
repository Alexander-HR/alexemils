-- Categories on Wishes: optional free text the Owner types, one per Wish.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

alter table public.wishes
  add column category text
  check (category is null or length(trim(category)) between 1 and 40);
