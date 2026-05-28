import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { Product, ProductLine, Brand, Category, FilterState, SortOption } from '@/shared/types'
import { PRODUCTS, PRODUCT_LINES, BRANDS, CATEGORIES, REFRIGERANTS, MAX_PRICE } from '../data/mock'
import { fetchProducts, fetchProductLines, fetchBrands, fetchCategories } from '@/core/supabase/catalog.service'

export const useCatalogStore = defineStore('catalog', () => {
  // ── Async data state (initialized with mock until Supabase responds) ─────────
  const allProducts     = ref<Product[]>(PRODUCTS)
  const allProductLines = ref<ProductLine[]>(PRODUCT_LINES)
  const allBrands       = ref<Brand[]>(BRANDS)
  const allCategories   = ref<Category[]>(CATEGORIES)
  const allRefrigerants = ref<string[]>(REFRIGERANTS)
  const isLoading       = ref(false)

  const maxPrice = computed(() =>
    allProducts.value.length ? Math.max(...allProducts.value.map(p => p.price)) : MAX_PRICE
  )

  // ── Filters & sort ────────────────────────────────────────────────────────────
  const filters = ref<FilterState>({
    search: '',
    productLineIds: [],
    brandIds: [],
    categoryIds: [],
    refrigerants: [],
    priceRange: [0, MAX_PRICE],
    inStockOnly: false,
  })

  const sortBy      = ref<SortOption>('relevance')
  const searchInput = ref('')

  const setSearch = useDebounceFn((val: string) => { filters.value.search = val }, 300)

  function onSearchInput(val: string) {
    searchInput.value = val
    setSearch(val)
  }

  function toggleProductLine(id: number) {
    const idx = filters.value.productLineIds.indexOf(id)
    idx === -1 ? filters.value.productLineIds.push(id) : filters.value.productLineIds.splice(idx, 1)
  }

  function toggleBrand(id: number) {
    const idx = filters.value.brandIds.indexOf(id)
    idx === -1 ? filters.value.brandIds.push(id) : filters.value.brandIds.splice(idx, 1)
  }

  function toggleRefrigerant(r: string) {
    const idx = filters.value.refrigerants.indexOf(r)
    idx === -1 ? filters.value.refrigerants.push(r) : filters.value.refrigerants.splice(idx, 1)
  }

  function resetFilters() {
    filters.value = {
      search: '',
      productLineIds: [],
      brandIds: [],
      categoryIds: [],
      refrigerants: [],
      priceRange: [0, maxPrice.value],
      inStockOnly: false,
    }
    searchInput.value = ''
  }

  // ── Computed ──────────────────────────────────────────────────────────────────
  const activeFilterCount = computed(() => {
    let n = 0
    if (filters.value.search) n++
    n += filters.value.productLineIds.length
    n += filters.value.brandIds.length
    n += filters.value.refrigerants.length
    if (filters.value.inStockOnly) n++
    if (filters.value.priceRange[1] < maxPrice.value) n++
    return n
  })

  const filteredProducts = computed(() => {
    let list = [...allProducts.value]
    const f = filters.value

    if (f.search) {
      const q = f.search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    }
    if (f.productLineIds.length) list = list.filter(p => f.productLineIds.includes(p.productLine.id))
    if (f.brandIds.length)       list = list.filter(p => f.brandIds.includes(p.brand.id))
    if (f.categoryIds.length)    list = list.filter(p => f.categoryIds.includes(p.category.id))
    if (f.refrigerants.length)   list = list.filter(p => p.refrigerants.some(r => f.refrigerants.includes(r)))
    if (f.inStockOnly)           list = list.filter(p => p.stock > 0)
    list = list.filter(p => p.price >= f.priceRange[0] && p.price <= f.priceRange[1])

    switch (sortBy.value) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break
      case 'price-desc': list.sort((a, b) => b.price - a.price); break
      case 'name-asc':   list.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'newest':     list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break
    }

    return list
  })

  const featuredProducts = computed(() => allProducts.value.filter(p => p.isFeatured).slice(0, 6))

  // ── Supabase init ─────────────────────────────────────────────────────────────
  async function initialize() {
    isLoading.value = true
    try {
      const [products, productLines, brands, categories] = await Promise.all([
        fetchProducts(),
        fetchProductLines(),
        fetchBrands(),
        fetchCategories(),
      ])

      allProducts.value     = products
      allProductLines.value = productLines
      allBrands.value       = brands
      allCategories.value   = categories

      // Derive refrigerants from loaded products
      const refs = [...new Set(products.flatMap(p => p.refrigerants))].sort()
      allRefrigerants.value = refs.length ? refs : REFRIGERANTS

      // Update price range ceiling to match loaded data
      filters.value.priceRange = [0, Math.max(...products.map(p => p.price))]
    } finally {
      isLoading.value = false
    }
  }

  return {
    // state
    isLoading,
    filters,
    sortBy,
    searchInput,
    // data
    productLines:  allProductLines,
    brands:        allBrands,
    categories:    allCategories,
    refrigerants:  allRefrigerants,
    maxPrice,
    // actions
    initialize,
    onSearchInput,
    toggleProductLine,
    toggleBrand,
    toggleRefrigerant,
    resetFilters,
    // computed
    activeFilterCount,
    filteredProducts,
    featuredProducts,
    // lookups
    getById:   (id: string)   => allProducts.value.find(p => p.id === id),
    getBySlug: (slug: string) => allProducts.value.find(p => p.slug === slug),
  }
})
