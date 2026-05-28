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
  price: number
  priceDistributor?: number
  priceTechnician?: number
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

export type UserRole = 'customer' | 'technician' | 'distributor' | 'admin'

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  role: UserRole
  company?: string
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
