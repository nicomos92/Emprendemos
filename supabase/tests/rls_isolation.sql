-- rls_isolation.sql
--
-- Manual RLS isolation verification. NOT executed automatically — this
-- project has no live Supabase/Docker instance running in this phase.
--
-- How to run once Supabase local is available:
--
--   npx supabase start
--   psql "$(npx supabase status -o json | node -e "process.stdin.once('data',d=>console.log(JSON.parse(d).DB_URL))")" \
--     -f supabase/tests/rls_isolation.sql
--
-- (or simply: psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/tests/rls_isolation.sql)
--
-- Pattern used: Supabase's local RLS testing convention of impersonating an
-- authenticated user by setting the `authenticated` role and a fake JWT
-- claims payload for the current transaction, then asserting what that
-- session can and cannot see.

begin;

-- ---------------------------------------------------------------------------
-- Fixtures: two independent tenants, each with their own auth.users row,
-- profile, business and one product.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('a0000000-0000-0000-0000-00000000000a', 'user-a@example.com'),
  ('b0000000-0000-0000-0000-00000000000b', 'user-b@example.com');

insert into businesses (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Business A', 'business-a'),
  ('b1111111-1111-1111-1111-111111111111', 'Business B', 'business-b');

insert into profiles (user_id, business_id, name) values
  ('a0000000-0000-0000-0000-00000000000a', 'a1111111-1111-1111-1111-111111111111', 'Owner A'),
  ('b0000000-0000-0000-0000-00000000000b', 'b1111111-1111-1111-1111-111111111111', 'Owner B');

insert into products (id, business_id, name, sale_price) values
  ('a2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Product A', 100),
  ('b2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'Product B', 200);

-- ---------------------------------------------------------------------------
-- Impersonate user A and assert isolation.
-- ---------------------------------------------------------------------------
set local role authenticated;
set local "request.jwt.claims" = '{"sub": "a0000000-0000-0000-0000-00000000000a", "role": "authenticated"}';

do $$
declare
  own_count integer;
  other_count integer;
begin
  select count(*) into own_count from products where business_id = 'a1111111-1111-1111-1111-111111111111';
  select count(*) into other_count from products where business_id = 'b1111111-1111-1111-1111-111111111111';

  assert own_count = 1, 'user A should see their own product';
  assert other_count = 0, 'user A must NOT see business B products';

  select count(*) into other_count from businesses where id = 'b1111111-1111-1111-1111-111111111111';
  assert other_count = 0, 'user A must NOT see business B row';
end $$;

-- Reset role before switching identities.
reset role;
reset "request.jwt.claims";

-- ---------------------------------------------------------------------------
-- Impersonate user B and assert the mirror image.
-- ---------------------------------------------------------------------------
set local role authenticated;
set local "request.jwt.claims" = '{"sub": "b0000000-0000-0000-0000-00000000000b", "role": "authenticated"}';

do $$
declare
  own_count integer;
  other_count integer;
begin
  select count(*) into own_count from products where business_id = 'b1111111-1111-1111-1111-111111111111';
  select count(*) into other_count from products where business_id = 'a1111111-1111-1111-1111-111111111111';

  assert own_count = 1, 'user B should see their own product';
  assert other_count = 0, 'user B must NOT see business A products';
end $$;

reset role;
reset "request.jwt.claims";

-- Roll back all fixtures — this script never leaves data behind.
rollback;
