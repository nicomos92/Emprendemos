-- 0004_public_catalog.sql
--
-- Public read access for the anonymous catalog page (app/catalogo/[slug]).
-- These policies are ADDITIVE to the authenticated "_own" policies from
-- 0002_rls.sql (Postgres RLS policies are OR'd together for a given
-- command), so authenticated users keep their normal scoped access and
-- unauthenticated visitors get read-only access to exactly the three
-- tables a public catalog needs.
--
-- Known MVP limitation: there is no `is_public`/draft concept yet on
-- products or businesses, so every product and business row is readable
-- by anyone once this migration is applied. A future iteration should add
-- a visibility flag before this is used for businesses that want to keep
-- some products off the public catalog.
--
-- Deliberately NOT touched: customers, quotes, quote_items, orders,
-- order_items, payments, cash_movements. Those stay fully private.

create policy "businesses_select_public" on businesses
  for select to anon
  using (true);

create policy "categories_select_public" on categories
  for select to anon
  using (true);

create policy "products_select_public" on products
  for select to anon
  using (true);
