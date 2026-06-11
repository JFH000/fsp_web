export interface ProductLine {
  id: number
  code: string
  name: string
  description: string
  icon: string
  slug: string
  productCount?: number
}

export interface Brand {
  id: number
  name: string
  slug: string
  logoUrl?: string
  country?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  productLineId: number
  description?: string
}

export interface ProductSpec {
  key: string
  value: string
  unit?: string
  group?: string
}

export interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description: string
  brand: Brand
  category: Category
  productLine: ProductLine
  priceUsd?: number
  priceCop?: number
  priceWs1?: number
  priceWs2?: number
  priceWs3?: number
  priceWs4?: number
  stock: number
  isFeatured: boolean
  isNew?: boolean
  images: string[]
  specs: ProductSpec[]
  refrigerants: string[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export type UserRole = 'admin' | 'customer' | 'customer_ws1' | 'customer_ws3'

export interface UserProfile {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  role: UserRole
  company: string | null
  notes: string | null
}

export interface FilterState {
  search: string
  productLineIds: number[]
  brandIds: number[]
  categoryIds: number[]
  refrigerants: string[]
  priceRange: [number, number]
  inStockOnly: boolean
}

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest'

export interface Order {
  id: string
  userId?: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  items: CartItem[]
  total: number
  createdAt: Date
}
