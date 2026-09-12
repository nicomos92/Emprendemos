-- 0001_init.sql
-- Core schema for EmprendeMos: businesses, catalog, sales, and cash flow.
-- All business-owned tables carry business_id and, where referenced by
-- children, a unique(id, business_id) pair so children can use composite
-- foreign keys (id, business_id) -> parent(id, business_id). This lets RLS
-- policies check business_id directly on every table without joins.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  phone text,
  whatsapp text,
  email text,
  created_at timestamptz not null default now()
);

create index idx_businesses_slug on businesses (slug);

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  business_id uuid references businesses (id) on delete set null,
  role text not null default 'owner' check (role in ('owner', 'admin')),
  name text,
  created_at timestamptz not null default now()
);

create index idx_profiles_business_id on profiles (business_id);
create index idx_profiles_user_id on profiles (user_id);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (id, business_id)
);

create index idx_categories_business_id on categories (business_id);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  category_id uuid,
  name text not null,
  description text,
  image_url text,
  material_cost numeric not null default 0 check (material_cost >= 0),
  labor_cost numeric not null default 0 check (labor_cost >= 0),
  other_cost numeric not null default 0 check (other_cost >= 0),
  total_cost numeric not null default 0 check (total_cost >= 0),
  desired_margin numeric not null default 0 check (desired_margin >= 0),
  suggested_price numeric not null default 0 check (suggested_price >= 0),
  sale_price numeric not null default 0 check (sale_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  minimum_stock integer not null default 0 check (minimum_stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, business_id),
  foreign key (category_id, business_id) references categories (id, business_id)
);

create index idx_products_business_id on products (business_id);
create index idx_products_category_id on products (category_id);

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
create table customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  unique (id, business_id)
);

create index idx_customers_business_id on customers (business_id);

-- ---------------------------------------------------------------------------
-- quotes
-- ---------------------------------------------------------------------------
create table quotes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  customer_id uuid not null,
  number integer,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected')),
  valid_until date,
  subtotal numeric not null default 0 check (subtotal >= 0),
  discount numeric not null default 0 check (discount >= 0),
  total numeric not null default 0 check (total >= 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (id, business_id),
  foreign key (customer_id, business_id) references customers (id, business_id)
);

create index idx_quotes_business_id on quotes (business_id);
create index idx_quotes_customer_id on quotes (customer_id);
create index idx_quotes_status on quotes (status);

-- ---------------------------------------------------------------------------
-- quote_items
-- ---------------------------------------------------------------------------
create table quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null,
  business_id uuid not null references businesses (id) on delete cascade,
  product_id uuid not null,
  quantity numeric not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  subtotal numeric not null check (subtotal >= 0),
  foreign key (quote_id, business_id) references quotes (id, business_id) on delete cascade,
  foreign key (product_id, business_id) references products (id, business_id)
);

create index idx_quote_items_business_id on quote_items (business_id);
create index idx_quote_items_quote_id on quote_items (quote_id);
create index idx_quote_items_product_id on quote_items (product_id);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  customer_id uuid not null,
  quote_id uuid,
  status text not null default 'new' check (status in ('new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  subtotal numeric not null default 0 check (subtotal >= 0),
  discount numeric not null default 0 check (discount >= 0),
  total numeric not null default 0 check (total >= 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (id, business_id),
  foreign key (customer_id, business_id) references customers (id, business_id),
  foreign key (quote_id, business_id) references quotes (id, business_id)
);

create index idx_orders_business_id on orders (business_id);
create index idx_orders_customer_id on orders (customer_id);
create index idx_orders_quote_id on orders (quote_id);
create index idx_orders_status on orders (status);

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  business_id uuid not null references businesses (id) on delete cascade,
  product_id uuid not null,
  quantity numeric not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  subtotal numeric not null check (subtotal >= 0),
  foreign key (order_id, business_id) references orders (id, business_id) on delete cascade,
  foreign key (product_id, business_id) references products (id, business_id)
);

create index idx_order_items_business_id on order_items (business_id);
create index idx_order_items_order_id on order_items (order_id);
create index idx_order_items_product_id on order_items (product_id);

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  order_id uuid not null,
  amount numeric not null check (amount > 0),
  payment_method text not null check (payment_method in ('cash', 'transfer', 'mercadopago', 'other')),
  payment_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  foreign key (order_id, business_id) references orders (id, business_id)
);

create index idx_payments_business_id on payments (business_id);
create index idx_payments_order_id on payments (order_id);

-- ---------------------------------------------------------------------------
-- cash_movements
-- ---------------------------------------------------------------------------
create table cash_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  description text,
  reference_type text,
  reference_id uuid,
  movement_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index idx_cash_movements_business_id on cash_movements (business_id);
create index idx_cash_movements_movement_date on cash_movements (movement_date);
