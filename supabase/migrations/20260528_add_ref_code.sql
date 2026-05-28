-- Add optional reference code to products
-- Run in: Supabase Dashboard → SQL Editor

alter table products add column if not exists ref_code text unique;
