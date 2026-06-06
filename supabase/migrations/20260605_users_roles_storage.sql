-- ============================================================
-- FSP Web — User roles & product image storage
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. user_profiles ─────────────────────────────────────────

create table if not exists public.user_profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  role       text        not null default 'customer'
                           check (role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "users can read own profile"
  on public.user_profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "users can update own profile"
  on public.user_profiles for update to authenticated
  using  ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select, update on public.user_profiles to authenticated;

-- ── 2. Auto-create profile on signup (role = customer) ───────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 3. is_admin() helper ──────────────────────────────────────
-- Used by product and storage policies.
-- Security invoker: runs under the calling user's RLS context,
-- which is safe because users can already read their own profile.

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ── 4. Product write policies — admin only ────────────────────
-- Drop the old "any authenticated user" policies from admin_rls.sql.

drop policy if exists "authenticated can insert products" on public.products;
drop policy if exists "authenticated can update products" on public.products;
drop policy if exists "authenticated can delete products" on public.products;

create policy "admins can insert products"
  on public.products for insert to authenticated
  with check (public.is_admin());

create policy "admins can update products"
  on public.products for update to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

create policy "admins can delete products"
  on public.products for delete to authenticated
  using (public.is_admin());

-- ── 5. Storage bucket for product images ─────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,         -- public CDN URLs work without auth
  5242880,      -- 5 MB per file
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public read (also enforced at bucket level, but explicit is cleaner)
create policy "public can view product images"
  on storage.objects for select to public
  using (bucket_id = 'product-images');

-- Admins can upload new images
create policy "admins can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

-- Admins can replace/overwrite images (upsert requires update too)
create policy "admins can update product images"
  on storage.objects for update to authenticated
  using  (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- Admins can delete images
create policy "admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ── 6. Promote first admin ────────────────────────────────────
-- After running this script, execute the following line manually
-- (replace the email with your actual admin email):
--
--   update public.user_profiles set role = 'admin'
--   where email = 'tu-email@ejemplo.com';
