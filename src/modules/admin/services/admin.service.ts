import { supabase } from '@/core/supabase/client'

export type ProductPayload = {
  sku: string
  name: string
  slug: string
  description: string
  brand_id: number | null
  category_id: number | null
  product_line_id: number | null
  price: number
  price_distributor: number | null
  price_technician: number | null
  stock: number
  is_featured: boolean
  is_new: boolean
  images: string[]
  specs: Array<{ key: string; value: string; unit?: string; group?: string }>
  refrigerants: string[]
}

export type AdminProductRow = {
  id: string
  sku: string
  name: string
  price: number
  price_distributor: number | null
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
  price: number
  price_distributor: number | null
  price_technician: number | null
  stock: number
  is_featured: boolean
  is_new: boolean
  images: string[]
  specs: Array<{ key: string; value: string; unit?: string; group?: string }>
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
    .select('id, sku, name, price, price_distributor, stock, is_featured, is_new, images, brand:brands(id, name), product_line:product_lines(id, code)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as AdminProductRow[]
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

export async function updateProduct(id: string, payload: ProductPayload): Promise<void> {
  const { error } = await getSb().from('products').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await getSb().from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
