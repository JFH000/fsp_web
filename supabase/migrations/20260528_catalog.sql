-- FSP Web — Catalog schema
-- Run this in: Supabase Dashboard → SQL Editor

-- ── Tables ────────────────────────────────────────────────────────────────────

create table if not exists product_lines (
  id            serial      primary key,
  code          text        not null unique,
  name          text        not null,
  description   text        not null default '',
  icon          text        not null default 'Wrench',
  slug          text        not null unique,
  product_count integer     not null default 0
);

create table if not exists brands (
  id       serial primary key,
  name     text   not null,
  slug     text   not null unique,
  logo_url text,
  country  text
);

create table if not exists categories (
  id              serial  primary key,
  name            text    not null,
  slug            text    not null unique,
  product_line_id integer references product_lines(id) on delete set null,
  description     text
);

create table if not exists products (
  id                uuid          primary key default gen_random_uuid(),
  sku               text          not null unique,
  name              text          not null,
  slug              text          not null unique,
  description       text          not null default '',
  brand_id          integer       references brands(id) on delete set null,
  category_id       integer       references categories(id) on delete set null,
  product_line_id   integer       references product_lines(id) on delete set null,
  price             numeric(10,2) not null,
  price_distributor numeric(10,2),
  price_technician  numeric(10,2),
  stock             integer       not null default 0,
  is_featured       boolean       not null default false,
  is_new            boolean       not null default false,
  images            text[]        not null default '{}',
  specs             jsonb         not null default '[]',
  refrigerants      text[]        not null default '{}',
  created_at        timestamptz   not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table product_lines enable row level security;
alter table brands         enable row level security;
alter table categories     enable row level security;
alter table products       enable row level security;

-- Public read-only access (catalog is public, no auth required)
create policy "anon can read product_lines" on product_lines
  for select to anon, authenticated using (true);

create policy "anon can read brands" on brands
  for select to anon, authenticated using (true);

create policy "anon can read categories" on categories
  for select to anon, authenticated using (true);

create policy "anon can read products" on products
  for select to anon, authenticated using (true);

-- ── Grants (expose tables via REST/Data API) ──────────────────────────────────

grant select on product_lines to anon, authenticated;
grant select on brands         to anon, authenticated;
grant select on categories     to anon, authenticated;
grant select on products       to anon, authenticated;
