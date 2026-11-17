-- Two test Wishes for trying the wishlist before the Owner page exists.
-- Run in SQL Editor. Delete them later from the Owner page (or: delete from public.wishes where title like 'TEST:%';).
insert into public.wishes (wishlist_id, title, note, price, is_priority, kind, shop_url, image_url)
select (select id from public.wishlists where handle = 'alexander'), * from (values
  ('TEST: Noise-cancelling headphones', 'Over-ear, black please', '~40.000 kr', true, 'one_off',
   'https://example.com', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'),
  ('TEST: A nice bottle of red wine', 'Something Spanish or Italian', '~4.000 kr', false, 'recurring',
   null, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600')
) as test_wishes;
