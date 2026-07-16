-- Remove product favorites, the stock movement ledger, and app_settings
-- (features removed from the app: favorites, stock ledger UI, CSV/Sheets import).
drop table if exists public.product_favorites cascade;
drop table if exists public.stock_movements cascade;
drop table if exists public.stock_receipts cascade;
drop function if exists public.update_product_stock() cascade;
drop table if exists public.app_settings cascade;
