-- 0003_business_sells_what.sql
-- Adds a lightweight classifier for what a business sells, captured during
-- onboarding step 2. Free-form text (not an enum) since it only drives
-- copy/messaging for now, not query filters.

alter table businesses add column sells_what text;
