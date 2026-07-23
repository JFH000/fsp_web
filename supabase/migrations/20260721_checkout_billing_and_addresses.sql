ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_company TEXT,
  ADD COLUMN IF NOT EXISTS shipping_tax_id  TEXT;

CREATE TABLE IF NOT EXISTS shipping_addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  label       TEXT,
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  company     TEXT,
  tax_id      TEXT,
  address     TEXT NOT NULL,
  city        TEXT NOT NULL,
  notes       TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id, created_at DESC);

ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own addresses" ON shipping_addresses
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "users can insert own addresses" ON shipping_addresses
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "users can update own addresses" ON shipping_addresses
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "users can delete own addresses" ON shipping_addresses
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON shipping_addresses TO authenticated;
REVOKE ALL ON shipping_addresses FROM anon;
