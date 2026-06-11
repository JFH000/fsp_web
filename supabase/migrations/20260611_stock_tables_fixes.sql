-- ============================================================
-- Stock tables quality fixes (applied after 20260611_stock_tables.sql)
-- ============================================================

-- Fix C1: Add negative-stock guard to trigger function
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock INTO current_stock FROM products WHERE id = NEW.product_id;
  IF current_stock + NEW.quantity < 0 THEN
    RAISE EXCEPTION 'stock insuficiente: el ajuste llevaría el stock a un valor negativo (actual: %, delta: %)',
      current_stock, NEW.quantity;
  END IF;
  UPDATE products
  SET stock = stock + NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

-- Fix m1: quantity cannot be zero
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_quantity_check;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_quantity_nonzero CHECK (quantity != 0);

-- Fix I2: change created_by FK to user_profiles for consistency
ALTER TABLE stock_receipts  DROP CONSTRAINT IF EXISTS stock_receipts_created_by_fkey;
ALTER TABLE stock_receipts  ADD CONSTRAINT stock_receipts_created_by_fkey FOREIGN KEY (created_by) REFERENCES user_profiles(id);
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_created_by_fkey;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES user_profiles(id);
