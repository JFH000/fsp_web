import { supabase } from './client'
import type { Product, ProductLine, Brand, Category } from '@/shared/types'
import { PRODUCTS, PRODUCT_LINES, BRANDS, CATEGORIES } from '@/modules/catalog/data/mock'

// ── DB row shapes ─────────────────────────────────────────────────────────────

type DbProductLine = {
  id: number
  code: string
  name: string
  description: string
  icon: string
  slug: string
  product_count: number
}

type DbBrand = {
  id: number
  name: string
  slug: string
  logo_url: string | null
  country: string | null
}

type DbCategory = {
  id: number
  name: string
  slug: string
  product_line_id: number | null
  description: string | null
}

type DbSpec = { key: string; value: string; unit?: string; group?: string }

type DbProduct = {
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
  specs: DbSpec[]
  refrigerants: string[]
  brand: DbBrand | null
  category: DbCategory | null
  product_line: DbProductLine | null
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function toProductLine(r: DbProductLine): ProductLine {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    description: r.description,
    icon: r.icon,
    slug: r.slug,
    productCount: r.product_count,
  }
}

function toBrand(r: DbBrand): Brand {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    logoUrl: r.logo_url ?? undefined,
    country: r.country ?? undefined,
  }
}

function toCategory(r: DbCategory): Category {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    productLineId: r.product_line_id ?? 0,
  }
}

function toProduct(r: DbProduct): Product | null {
  if (!r.brand || !r.category || !r.product_line) return null
  return {
    id: r.id,
    sku: r.sku,
    name: r.name,
    slug: r.slug,
    description: r.description,
    brand: toBrand(r.brand),
    category: toCategory(r.category),
    productLine: toProductLine(r.product_line),
    price: r.price,
    priceDistributor: r.price_distributor ?? undefined,
    priceTechnician: r.price_technician ?? undefined,
    stock: r.stock,
    isFeatured: r.is_featured,
    isNew: r.is_new,
    images: r.images,
    specs: r.specs,
    refrigerants: r.refrigerants,
  }
}

// ── Fetchers (fall back to mock when Supabase is unconfigured or tables empty) ─

export async function fetchProductLines(): Promise<ProductLine[]> {
  if (!supabase) return PRODUCT_LINES
  const { data, error } = await supabase.from('product_lines').select('*').order('id')
  if (error || !data?.length) return PRODUCT_LINES
  return (data as DbProductLine[]).map(toProductLine)
}

export async function fetchBrands(): Promise<Brand[]> {
  if (!supabase) return BRANDS
  const { data, error } = await supabase.from('brands').select('*').order('name')
  if (error || !data?.length) return BRANDS
  return (data as DbBrand[]).map(toBrand)
}

export async function fetchCategories(): Promise<Category[]> {
  if (!supabase) return CATEGORIES
  const { data, error } = await supabase.from('categories').select('*').order('id')
  if (error || !data?.length) return CATEGORIES
  return (data as DbCategory[]).map(toCategory)
}

export async function fetchProducts(): Promise<Product[]> {
  if (!supabase) return PRODUCTS
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      product_line:product_lines(*)
    `)
    .order('name')
  if (error || !data?.length) return PRODUCTS
  return (data as DbProduct[]).map(toProduct).filter((p): p is Product => p !== null)
}
