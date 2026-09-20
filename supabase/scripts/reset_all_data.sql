-- reset_all_data.sql
--
-- DESTRUCTIVE. Wipes every business, every profile, and every non-service
-- auth user from the project — a full clean slate. Intended for the moment
-- right before EmprendeMos goes live, to clear out every business created
-- during development/QA before real users sign up.
--
-- This does NOT touch the schema, RLS policies, or migrations — only data.
--
-- SAFETY: nothing below runs unless you remove the `select 1/0` guard.
-- That line intentionally raises a division-by-zero error so a careless
-- `-f` run stops here instead of deleting anything. Read the preview
-- query's output, be certain, then delete the guard line and re-run.
--
-- How to run:
--
--   npx supabase db query --linked -f supabase/scripts/reset_all_data.sql
--
-- ---------------------------------------------------------------------------
-- Preview: run this on its own first and make sure the counts are what you
-- expect to lose before touching the guard below.
-- ---------------------------------------------------------------------------
select
  (select count(*) from businesses) as businesses_to_delete,
  (select count(*) from profiles) as profiles_to_delete,
  (select count(*) from auth.users) as auth_users_to_delete;

-- Remove the next line once you've confirmed the counts above and are sure.
select 1/0; -- guard: delete this line to allow the script to proceed

begin;

-- Cascades through categories/products/customers/quotes/quote_items/
-- orders/order_items/payments/cash_movements via their FK to businesses(id).
delete from businesses;

-- Profiles whose business was just deleted are already gone via cascade;
-- this also removes any profile stuck without a business (pre-onboarding).
delete from profiles;

-- Every Supabase Auth user. If you have real accounts you want to keep,
-- add `where email not in ('owner@realaccount.com', ...)` before running.
delete from auth.users;

commit;
