-- 20260716_orders.sql granted SELECT/UPDATE to `authenticated` but never
-- granted anything to `service_role`. Unlike older tables, this project's
-- default privileges don't automatically extend to service_role for new
-- tables, so the create-checkout-session edge function (which uses the
-- service-role client to insert/update orders) failed on every real
-- checkout attempt with "permission denied for table orders".
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO service_role;
