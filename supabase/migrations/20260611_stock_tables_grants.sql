-- Grant missing SELECT/INSERT to authenticated on stock tables.
-- The original migration created RLS policies but omitted table-level GRANTs,
-- causing "permission denied for table" before RLS could evaluate.
GRANT SELECT, INSERT ON public.stock_movements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.stock_receipts TO authenticated;

REVOKE ALL ON public.stock_movements FROM anon;
REVOKE ALL ON public.stock_receipts FROM anon;
