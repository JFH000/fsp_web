CREATE TABLE IF NOT EXISTS orders (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES auth.users(id),
  status                      TEXT NOT NULL DEFAULT 'pending_payment'
                               CHECK (status IN (
                                 'pending_payment', 'paid', 'preparing',
                                 'shipped', 'delivered', 'cancelled'
                               )),
  items                       JSONB NOT NULL,
  subtotal                    NUMERIC NOT NULL,
  currency                    TEXT NOT NULL DEFAULT 'COP',
  shipping_name               TEXT NOT NULL,
  shipping_phone              TEXT NOT NULL,
  shipping_address            TEXT NOT NULL,
  shipping_city               TEXT NOT NULL,
  shipping_notes              TEXT,
  stripe_checkout_session_id  TEXT UNIQUE,
  stripe_payment_intent_id    TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at                     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers can read own orders" ON orders
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "admins can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, UPDATE ON orders TO authenticated;
REVOKE ALL ON orders FROM anon;
