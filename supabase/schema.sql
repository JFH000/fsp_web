-- =============================================
-- FS Parts E-Commerce — Supabase Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PRODUCT CATALOG
-- =============================================

CREATE TABLE product_lines (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(10)  NOT NULL UNIQUE,  -- 'L01', 'L06', etc.
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  icon         VARCHAR(50),
  slug         VARCHAR(100) NOT NULL UNIQUE,
  display_order INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brands (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  logo_url   TEXT,
  country    VARCHAR(50),
  is_active  BOOLEAN DEFAULT TRUE
);

CREATE TABLE categories (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  product_line_id INT REFERENCES product_lines(id) ON DELETE SET NULL,
  description     TEXT,
  display_order   INT DEFAULT 0
);

CREATE TABLE products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku                 VARCHAR(100) NOT NULL UNIQUE,
  name                VARCHAR(200) NOT NULL,
  slug                VARCHAR(200) NOT NULL UNIQUE,
  description         TEXT,
  brand_id            INT REFERENCES brands(id) ON DELETE SET NULL,
  category_id         INT REFERENCES categories(id) ON DELETE SET NULL,
  product_line_id     INT REFERENCES product_lines(id) ON DELETE SET NULL,
  -- Pricing per role
  price               NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  price_distributor   NUMERIC(10, 2) CHECK (price_distributor >= 0),
  price_technician    NUMERIC(10, 2) CHECK (price_technician >= 0),
  stock               INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_featured         BOOLEAN DEFAULT FALSE,
  is_new              BOOLEAN DEFAULT FALSE,
  is_active           BOOLEAN DEFAULT TRUE,
  main_image_url      TEXT,
  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_images (
  id          SERIAL PRIMARY KEY,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         VARCHAR(200),
  sort_order  INT DEFAULT 0
);

CREATE TABLE product_specs (
  id          SERIAL PRIMARY KEY,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  key         VARCHAR(100) NOT NULL,
  value       VARCHAR(200) NOT NULL,
  unit        VARCHAR(50),
  group_name  VARCHAR(100)
);

CREATE TABLE product_refrigerants (
  product_id   UUID REFERENCES products(id) ON DELETE CASCADE,
  refrigerant  VARCHAR(50) NOT NULL,
  PRIMARY KEY (product_id, refrigerant)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- USERS & ROLES
-- =============================================

CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   VARCHAR(200),
  email       VARCHAR(200) UNIQUE,
  phone       VARCHAR(50),
  role        VARCHAR(20) DEFAULT 'customer'
                CHECK (role IN ('customer', 'technician', 'distributor', 'admin')),
  company     VARCHAR(200),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ORDERS
-- =============================================

CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  status           VARCHAR(20) DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal         NUMERIC(10, 2) NOT NULL,
  shipping_cost    NUMERIC(10, 2) DEFAULT 0,
  total            NUMERIC(10, 2) NOT NULL,
  shipping_address JSONB,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE order_items (
  id          SERIAL PRIMARY KEY,
  order_id    UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity    INT NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(10, 2) NOT NULL,
  subtotal    NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- =============================================
-- MARKETPLACE (future — multi-vendor base)
-- =============================================

CREATE TABLE vendors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES user_profiles(id),
  name        VARCHAR(200) NOT NULL,
  slug        VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  logo_url    TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- product_vendor link (for multi-vendor future)
ALTER TABLE products ADD COLUMN vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE user_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items      ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_lines      ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands             ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_refrigerants ENABLE ROW LEVEL SECURITY;

-- Public read on catalog
CREATE POLICY "public_read_products"    ON products           FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_lines"       ON product_lines      FOR SELECT USING (TRUE);
CREATE POLICY "public_read_brands"      ON brands             FOR SELECT USING (TRUE);
CREATE POLICY "public_read_categories"  ON categories         FOR SELECT USING (TRUE);
CREATE POLICY "public_read_images"      ON product_images     FOR SELECT USING (TRUE);
CREATE POLICY "public_read_specs"       ON product_specs      FOR SELECT USING (TRUE);
CREATE POLICY "public_read_refrigerants" ON product_refrigerants FOR SELECT USING (TRUE);

-- Users can only read/write their own profile
CREATE POLICY "own_profile_select" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own_profile_insert" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own_profile_update" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own orders
CREATE POLICY "own_orders_select" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_orders_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_order_items"   ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));

-- Admins bypass RLS (use service role key on server-side)

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_products_product_line ON products(product_line_id);
CREATE INDEX idx_products_brand        ON products(brand_id);
CREATE INDEX idx_products_category     ON products(category_id);
CREATE INDEX idx_products_featured     ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_active       ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_sku          ON products(sku);
CREATE INDEX idx_orders_user           ON orders(user_id);
CREATE INDEX idx_order_items_order     ON order_items(order_id);

-- Full-text search on products
CREATE INDEX idx_products_fts ON products
  USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(description, '')));
