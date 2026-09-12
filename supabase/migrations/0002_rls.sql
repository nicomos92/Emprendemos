-- 0002_rls.sql
--
-- Row Level Security for multi-tenant isolation.
--
-- Design note (composite FKs + RLS): every business-owned table in
-- 0001_init.sql carries its own `business_id` column, even child tables
-- like quote_items/order_items whose logical parent is quotes/orders.
-- This is deliberate: RLS policies below filter directly on
-- `business_id = current_business_id()` with a single indexed column
-- comparison, no join needed. To guarantee that denormalized business_id
-- can never drift from the parent row's business_id, the parent tables
-- expose `unique (id, business_id)` and children reference the pair via
-- composite foreign keys `(parent_id, business_id) references
-- parent(id, business_id)`. Postgres then rejects any insert/update where
-- business_id doesn't match the parent's actual business_id, which keeps
-- the RLS check trustworthy without runtime triggers.

create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select business_id from public.profiles where user_id = auth.uid()
$$;

alter table businesses enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table cash_movements enable row level security;

-- ---------------------------------------------------------------------------
-- profiles: a user can only see/manage their own profile row
-- ---------------------------------------------------------------------------
create policy "profiles_select_own" on profiles
  for select using (user_id = auth.uid());

create policy "profiles_insert_own" on profiles
  for insert with check (user_id = auth.uid());

create policy "profiles_update_own" on profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------
create policy "businesses_select_own" on businesses
  for select using (id = public.current_business_id());

-- Insert is allowed for any authenticated user: onboarding creates the
-- business before the profile has a business_id, so current_business_id()
-- is still null at that point.
create policy "businesses_insert_authenticated" on businesses
  for insert with check (auth.uid() is not null);

create policy "businesses_update_own" on businesses
  for update using (id = public.current_business_id())
  with check (id = public.current_business_id());

-- No delete policy for MVP: businesses cannot be deleted via the API.

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create policy "categories_select_own" on categories
  for select using (business_id = public.current_business_id());
create policy "categories_insert_own" on categories
  for insert with check (business_id = public.current_business_id());
create policy "categories_update_own" on categories
  for update using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());
create policy "categories_delete_own" on categories
  for delete using (business_id = public.current_business_id());

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create policy "products_select_own" on products
  for select using (business_id = public.current_business_id());
create policy "products_insert_own" on products
  for insert with check (business_id = public.current_business_id());
create policy "products_update_own" on products
  for update using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());
create policy "products_delete_own" on products
  for delete using (business_id = public.current_business_id());

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
create policy "customers_select_own" on customers
  for select using (business_id = public.current_business_id());
create policy "customers_insert_own" on customers
  for insert with check (business_id = public.current_business_id());
create policy "customers_update_own" on customers
  for update using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());
create policy "customers_delete_own" on customers
  for delete using (business_id = public.current_business_id());

-- ---------------------------------------------------------------------------
-- quotes
-- ---------------------------------------------------------------------------
create policy "quotes_select_own" on quotes
  for select using (business_id = public.current_business_id());
create policy "quotes_insert_own" on quotes
  for insert with check (business_id = public.current_business_id());
create policy "quotes_update_own" on quotes
  for update using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());
create policy "quotes_delete_own" on quotes
  for delete using (business_id = public.current_business_id());

-- ---------------------------------------------------------------------------
-- quote_items
-- ---------------------------------------------------------------------------
create policy "quote_items_select_own" on quote_items
  for select using (business_id = public.current_business_id());
create policy "quote_items_insert_own" on quote_items
  for insert with check (business_id = public.current_business_id());
create policy "quote_items_update_own" on quote_items
  for update using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());
create policy "quote_items_delete_own" on quote_items
  for delete using (business_id = public.current_business_id());

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create policy "orders_select_own" on orders
  for select using (business_id = public.current_business_id());
create policy "orders_insert_own" on orders
  for insert with check (business_id = public.current_business_id());
create policy "orders_update_own" on orders
  for update using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());
create policy "orders_delete_own" on orders
  for delete using (business_id = public.current_business_id());

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
create policy "order_items_select_own" on order_items
  for select using (business_id = public.current_business_id());
create policy "order_items_insert_own" on order_items
  for insert with check (business_id = public.current_business_id());
create policy "order_items_update_own" on order_items
  for update using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());
create policy "order_items_delete_own" on order_items
  for delete using (business_id = public.current_business_id());

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create policy "payments_select_own" on payments
  for select using (business_id = public.current_business_id());
create policy "payments_insert_own" on payments
  for insert with check (business_id = public.current_business_id());
create policy "payments_update_own" on payments
  for update using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());
create policy "payments_delete_own" on payments
  for delete using (business_id = public.current_business_id());

-- ---------------------------------------------------------------------------
-- cash_movements
-- ---------------------------------------------------------------------------
create policy "cash_movements_select_own" on cash_movements
  for select using (business_id = public.current_business_id());
create policy "cash_movements_insert_own" on cash_movements
  for insert with check (business_id = public.current_business_id());
create policy "cash_movements_update_own" on cash_movements
  for update using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());
create policy "cash_movements_delete_own" on cash_movements
  for delete using (business_id = public.current_business_id());
