-- ============================================================
-- Stock management tables
-- ============================================================

-- stock_receipts: one row per batch purchase order received
CREATE TABLE IF NOT EXISTS stock_receipts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference   TEXT NOT NULL,
  supplier    TEXT,
  notes       TEXT,
  created_by  UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- stock_movements: immutable ledger; one row per unit-event
CREATE TABLE IF NOT EXISTS stock_movements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  receipt_id    UUID REFERENCES stock_receipts(id) ON DELETE SET NULL,
  quantity      INTEGER NOT NULL,
  cost_per_unit NUMERIC(12,2),
  type          TEXT NOT NULL CHECK (type IN ('ingreso', 'ajuste')),
  notes         TEXT,
  created_by    UUID NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for per-product history queries
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id
  ON stock_movements(product_id, created_at DESC);

-- ============================================================
-- Trigger: maintain products.stock after each movement insert
-- ============================================================
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE products
  SET stock = stock + NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_product_stock ON stock_movements;
CREATE TRIGGER trg_update_product_stock
  AFTER INSERT ON stock_movements
  FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE stock_receipts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Helper reused from existing schema: is_admin() checks user_profiles.role = 'admin'
-- stock_receipts: admins full access
CREATE POLICY "admins_stock_receipts_select" ON stock_receipts
  FOR SELECT USING (is_admin());
CREATE POLICY "admins_stock_receipts_insert" ON stock_receipts
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admins_stock_receipts_update" ON stock_receipts
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- stock_movements: admins can read and insert; no update/delete (immutable ledger)
CREATE POLICY "admins_stock_movements_select" ON stock_movements
  FOR SELECT USING (is_admin());
CREATE POLICY "admins_stock_movements_insert" ON stock_movements
  FOR INSERT WITH CHECK (is_admin());
