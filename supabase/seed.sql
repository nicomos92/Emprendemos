-- seed.sql
--
-- Demo data TEMPLATE for "Panadería Demo".
--
-- This is not a live seed meant to run as-is against a real tenant: no
-- matching auth.users row exists for the fixed UUIDs below, and RLS would
-- block all of this data from being read by any real session (since
-- current_business_id() resolves from profiles.user_id = auth.uid()).
--
-- Intended use: a future in-app "load demo data" feature reads this file
-- (or a generated variant of it), swaps every business_id placeholder for
-- the real authenticated user's business_id, generates fresh UUIDs for the
-- child rows, and inserts as that user via the normal RLS-protected client
-- so the demo data actually belongs to them.

-- Fixed placeholder business id used throughout this template.
-- 11111111-1111-1111-1111-111111111111

insert into businesses (id, name, slug, description, phone, whatsapp, email)
values (
  '11111111-1111-1111-1111-111111111111',
  'Panadería Demo',
  'panaderia-demo',
  'Panadería artesanal de barrio, especializada en tortas y facturas.',
  '+54 11 4444-5555',
  '+54 9 11 4444-5555',
  'contacto@panaderiademo.com'
);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
insert into categories (id, business_id, name) values
  ('11111111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111111', 'Tortas'),
  ('11111111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111111', 'Facturas'),
  ('11111111-1111-1111-1111-111111111103', '11111111-1111-1111-1111-111111111111', 'Panes');

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
insert into products (
  id, business_id, category_id, name, description,
  material_cost, labor_cost, other_cost, total_cost,
  desired_margin, suggested_price, sale_price, stock, minimum_stock
) values
  (
    '11111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111101', 'Torta de chocolate (1kg)',
    'Bizcochuelo de chocolate con ganache y relleno de dulce de leche.',
    3500, 2000, 500, 6000, 40, 8400, 8500, 5, 2
  ),
  (
    '11111111-1111-1111-1111-111111111202', '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111101', 'Torta de vainilla (1kg)',
    'Bizcochuelo de vainilla con crema y frutas de estación.',
    3200, 2000, 400, 5600, 40, 7840, 8000, 4, 2
  ),
  (
    '11111111-1111-1111-1111-111111111203', '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111102', 'Docena de facturas',
    'Media docena de medialunas y media docena de vigilantes.',
    900, 600, 100, 1600, 50, 2400, 2500, 20, 5
  ),
  (
    '11111111-1111-1111-1111-111111111204', '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111103', 'Pan casero (kg)',
    'Pan casero de campo horneado a leña.',
    600, 400, 100, 1100, 35, 1485, 1500, 15, 5
  ),
  (
    '11111111-1111-1111-1111-111111111205', '11111111-1111-1111-1111-111111111111',
    null, 'Combo cumpleaños',
    'Torta + docena de facturas para eventos, sin categoría fija.',
    4400, 2600, 600, 7600, 45, 11020, 11000, 3, 1
  );

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
insert into customers (id, business_id, name, phone, email, address) values
  ('11111111-1111-1111-1111-111111111301', '11111111-1111-1111-1111-111111111111', 'María López', '+54 11 5555-1111', 'maria.lopez@example.com', 'Av. Rivadavia 1234'),
  ('11111111-1111-1111-1111-111111111302', '11111111-1111-1111-1111-111111111111', 'Juan Pérez', '+54 11 5555-2222', 'juan.perez@example.com', 'Calle Falsa 456'),
  ('11111111-1111-1111-1111-111111111303', '11111111-1111-1111-1111-111111111111', 'Sofía Gómez', '+54 11 5555-3333', 'sofia.gomez@example.com', 'Mitre 789');

-- ---------------------------------------------------------------------------
-- quotes + quote_items
-- ---------------------------------------------------------------------------
insert into quotes (id, business_id, customer_id, number, status, valid_until, subtotal, discount, total, notes) values
  ('11111111-1111-1111-1111-111111111401', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111301', 1, 'accepted', current_date + interval '7 days', 8500, 0, 8500, 'Torta para cumpleaños de 15'),
  ('11111111-1111-1111-1111-111111111402', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111302', 2, 'sent', current_date + interval '5 days', 2500, 0, 2500, 'Facturas para reunión de oficina');

insert into quote_items (id, quote_id, business_id, product_id, quantity, unit_price, subtotal) values
  ('11111111-1111-1111-1111-111111111501', '11111111-1111-1111-1111-111111111401', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111201', 1, 8500, 8500),
  ('11111111-1111-1111-1111-111111111502', '11111111-1111-1111-1111-111111111402', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111203', 1, 2500, 2500);

-- ---------------------------------------------------------------------------
-- orders + order_items (converted from the accepted quote)
-- ---------------------------------------------------------------------------
insert into orders (id, business_id, customer_id, quote_id, status, subtotal, discount, total, notes) values
  ('11111111-1111-1111-1111-111111111601', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111301', '11111111-1111-1111-1111-111111111401', 'confirmed', 8500, 0, 8500, 'Entrega el sábado a las 15hs');

insert into order_items (id, order_id, business_id, product_id, quantity, unit_price, subtotal) values
  ('11111111-1111-1111-1111-111111111701', '11111111-1111-1111-1111-111111111601', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111201', 1, 8500, 8500);

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
insert into payments (id, business_id, order_id, amount, payment_method, payment_date, notes) values
  ('11111111-1111-1111-1111-111111111801', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111601', 4250, 'transfer', current_date, 'Seña del 50%');

-- ---------------------------------------------------------------------------
-- cash_movements
-- ---------------------------------------------------------------------------
insert into cash_movements (id, business_id, type, amount, description, reference_type, reference_id, movement_date) values
  ('11111111-1111-1111-1111-111111111901', '11111111-1111-1111-1111-111111111111', 'income', 4250, 'Seña orden #1', 'payment', '11111111-1111-1111-1111-111111111801', current_date),
  ('11111111-1111-1111-1111-111111111902', '11111111-1111-1111-1111-111111111111', 'expense', 1500, 'Compra de harina y manteca', null, null, current_date);
