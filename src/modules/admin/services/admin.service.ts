import { supabase } from '@/core/supabase/client'

function slugify(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export type ProductPayload = {
  sku: string
  name: string
  slug: string
  description: string
  brand_id: number | null
  category_id: number | null
  product_line_id: number | null
  price_usd: number | null
  price_cop: number | null
  price_ws1: number | null
  price_ws2: number | null
  price_ws3: number | null
  price_ws4: number | null
  stock: number
  is_featured: boolean
  is_new: boolean
  images: string[]
  specs: Array<{ key: string; value: string; unit?: string; group?: string }>
  refrigerants: string[]
}

/** Payload for updates — stock is ledger-managed and excluded from direct edits. */
export type UpdateProductPayload = Omit<ProductPayload, 'stock'>

export type AdminProductRow = {
  id: string
  sku: string
  name: string
  price_cop: number | null
  price_usd: number | null
  stock: number
  is_featured: boolean
  is_new: boolean
  images: string[]
  brand: { id: number; name: string } | null
  product_line: { id: number; code: string } | null
}

export type AdminProductDetail = {
  id: string
  sku: string
  name: string
  slug: string
  description: string
  price_usd: number | null
  price_cop: number | null
  price_ws1: number | null
  price_ws2: number | null
  price_ws3: number | null
  price_ws4: number | null
  stock: number
  is_featured: boolean
  is_new: boolean
  images: string[]
  specs: Array<{ key?: string; label?: string; value: string; unit?: string; group?: string }>
  refrigerants: string[]
  brand_id: number | null
  category_id: number | null
  product_line_id: number | null
}

function getSb() {
  if (!supabase) throw new Error('Supabase no configurado')
  return supabase
}

export async function listAdminProducts(): Promise<AdminProductRow[]> {
  const { data, error } = await getSb()
    .from('products')
    .select('id, sku, name, price_cop, price_usd, stock, is_featured, is_new, images, brand:brands(id, name), product_line:product_lines(id, code)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as AdminProductRow[]
}

export async function getAdminProduct(id: string): Promise<AdminProductDetail> {
  const { data, error } = await getSb()
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data as AdminProductDetail
}

export async function createProduct(payload: ProductPayload): Promise<string> {
  const { data, error } = await getSb()
    .from('products')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return (data as { id: string }).id
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<void> {
  const { error } = await getSb().from('products').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await getSb().from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── CSV export / import ───────────────────────────────────────────────────────

export type ProductExportRow = {
  sku: string
  name: string
  slug: string
  description: string
  brand: string
  category: string
  product_line: string
  price_usd: number | null
  price_cop: number | null
  price_ws1: number | null
  price_ws2: number | null
  price_ws3: number | null
  price_ws4: number | null
  stock: number
  is_featured: boolean
  is_new: boolean
}

export async function exportAllProducts(): Promise<ProductExportRow[]> {
  const { data, error } = await getSb()
    .from('products')
    .select(`
      sku, name, slug, description, stock, is_featured, is_new,
      price_usd, price_cop, price_ws1, price_ws2, price_ws3, price_ws4,
      brand:brands(name),
      category:categories(slug),
      product_line:product_lines(code)
    `)
    .order('name')
  if (error) throw new Error(error.message)

  return (data ?? []).map((p: Record<string, unknown>) => ({
    sku:          (p.sku as string) ?? '',
    name:         (p.name as string) ?? '',
    slug:         (p.slug as string) ?? '',
    description:  (p.description as string) ?? '',
    brand:        ((p.brand as { name: string } | null)?.name) ?? '',
    category:     ((p.category as { slug: string } | null)?.slug) ?? '',
    product_line: ((p.product_line as { code: string } | null)?.code) ?? '',
    price_usd:    p.price_usd as number | null,
    price_cop:    p.price_cop as number | null,
    price_ws1:    p.price_ws1 as number | null,
    price_ws2:    p.price_ws2 as number | null,
    price_ws3:    p.price_ws3 as number | null,
    price_ws4:    p.price_ws4 as number | null,
    stock:        (p.stock as number) ?? 0,
    is_featured:  (p.is_featured as boolean) ?? false,
    is_new:       (p.is_new as boolean) ?? false,
  }))
}

export type ImportResult = {
  updated: number
  inserted: number
  deleted: number
  failed: number
  total: number
  errors: string[]
  autoCreated: string[]
}

export async function importCsv(csvContent: string): Promise<ImportResult> {
  const sb = getSb()
  const { data: { session } } = await sb.auth.getSession()
  if (!session) throw new Error('No autenticado')

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
  const res = await fetch(`${SUPABASE_URL}/functions/v1/sync-sheets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ csv: csvContent }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error en la importación')
  return data as ImportResult
}

// ── Brands ────────────────────────────────────────────────────────────────────

export type Brand = { id: number; name: string; slug: string; country: string | null }

export async function listBrands(): Promise<Brand[]> {
  const { data, error } = await getSb().from('brands').select('id, name, slug, country').order('name')
  if (error) throw new Error(error.message)
  return (data ?? []) as Brand[]
}

export async function createBrand(name: string, country?: string): Promise<void> {
  const { error } = await getSb().from('brands').insert({ name, slug: slugify(name), country: country || null })
  if (error) throw new Error(error.message)
}

export async function updateBrand(id: number, name: string, country?: string): Promise<void> {
  const { error } = await getSb().from('brands').update({ name, slug: slugify(name), country: country || null }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteBrand(id: number): Promise<void> {
  const { error } = await getSb().from('brands').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Categories ────────────────────────────────────────────────────────────────

export type Category = { id: number; name: string; slug: string; product_line_id: number | null }

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await getSb().from('categories').select('id, name, slug, product_line_id').order('name')
  if (error) throw new Error(error.message)
  return (data ?? []) as Category[]
}

export async function createCategory(name: string, productLineId?: number | null): Promise<void> {
  const { error } = await getSb().from('categories').insert({ name, slug: slugify(name), product_line_id: productLineId ?? null })
  if (error) throw new Error(error.message)
}

export async function updateCategory(id: number, name: string, productLineId?: number | null): Promise<void> {
  const { error } = await getSb().from('categories').update({ name, slug: slugify(name), product_line_id: productLineId ?? null }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteCategory(id: number): Promise<void> {
  const { error } = await getSb().from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Product lines ─────────────────────────────────────────────────────────────

export type ProductLine = { id: number; code: string; name: string; slug: string }

export async function listProductLines(): Promise<ProductLine[]> {
  const { data, error } = await getSb().from('product_lines').select('id, code, name, slug').order('code')
  if (error) throw new Error(error.message)
  return (data ?? []) as ProductLine[]
}

export async function createProductLine(code: string, name: string): Promise<void> {
  const { error } = await getSb().from('product_lines').insert({ code: code.toUpperCase(), name, slug: slugify(code) })
  if (error) throw new Error(error.message)
}

export async function updateProductLine(id: number, code: string, name: string): Promise<void> {
  const { error } = await getSb().from('product_lines').update({ code: code.toUpperCase(), name, slug: slugify(code) }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteProductLine(id: number): Promise<void> {
  const { error } = await getSb().from('product_lines').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
