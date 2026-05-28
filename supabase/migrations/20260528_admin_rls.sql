-- Admin RLS: authenticated users can fully manage products
-- Run in: Supabase Dashboard → SQL Editor

create policy "authenticated can insert products" on products
  for insert to authenticated
  with check (true);

create policy "authenticated can update products" on products
  for update to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete products" on products
  for delete to authenticated
  using (true);
