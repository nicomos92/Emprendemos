-- cleanup_test_data.sql
--
-- Removes the specific QA/test tenant created while validating the MVP
-- against the live Supabase project (business "Panadería de Prueba" and
-- its test user). Safe to run any time before going to production — it
-- only touches rows matching these exact identifiers, nothing else.
--
-- How to run (same pattern as supabase/tests/rls_isolation.sql):
--
--   npx supabase db query --linked -f supabase/scripts/cleanup_test_data.sql
--
-- Preview first: run the SELECT block below on its own and check the
-- counts before running the DELETE block.

-- ---------------------------------------------------------------------------
-- Preview: what this script is about to delete
-- ---------------------------------------------------------------------------
select
  (select count(*) from businesses where slug = 'panaderia-de-prueba-y9cpnu') as test_business,
  (select count(*) from auth.users where email = 'demo-test@emprendemos.local') as test_user;

-- ---------------------------------------------------------------------------
-- Delete: cascades through every business-owned table via the
-- `on delete cascade` foreign keys to businesses(id) from 0001_init.sql.
-- ---------------------------------------------------------------------------
begin;

delete from businesses where slug = 'panaderia-de-prueba-y9cpnu';
delete from profiles where user_id in (select id from auth.users where email = 'demo-test@emprendemos.local');
delete from auth.users where email = 'demo-test@emprendemos.local';

commit;
