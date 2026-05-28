import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { FilterState, SortOption } from '@/shared/types'
import { PRODUCTS, PRODUCT_LINES, BRANDS, CATEGORIES, REFRIGERANTS, MAX_PRICE } from '../data/mock'

export const useCatalogStore = defineStore('catalog', () => {
  const filters = ref<FilterState>({
    search: '',
    productLineIds: [],
    brandIds: [],
    categoryIds: [],
    refrigerants: [],
    priceRange: [0, MAX_PRICE],
    inStockOnly: false,
  })

  const sortBy = ref<SortOption>('relevance')
  const searchInput = ref('')

  const setSearch = useDebounceFn((val: string) => {
    filters.value.search = val
  }, 300)

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
      priceRange: [0, MAX_PRICE],
      inStockOnly: false,
    }
    searchInput.value = ''
  }

  const activeFilterCount = computed(() => {
    let n = 0
    if (filters.value.search) n++
    n += filters.value.productLineIds.length
    n += filters.value.brandIds.length
    n += filters.value.refrigerants.length
    if (filters.value.inStockOnly) n++
    if (filters.value.priceRange[1] < MAX_PRICE) n++
    return n
  })

  const filteredProducts = computed(() => {
    let list = [...PRODUCTS]
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

  const featuredProducts = computed(() => PRODUCTS.filter(p => p.isFeatured).slice(0, 6))

  return {
    filters,
    sortBy,
    searchInput,
    onSearchInput,
    toggleProductLine,
    toggleBrand,
    toggleRefrigerant,
    resetFilters,
    activeFilterCount,
    filteredProducts,
    featuredProducts,
    productLines: PRODUCT_LINES,
    brands: BRANDS,
    categories: CATEGORIES,
    refrigerants: REFRIGERANTS,
    maxPrice: MAX_PRICE,
    getById: (id: string) => PRODUCTS.find(p => p.id === id),
    getBySlug: (slug: string) => PRODUCTS.find(p => p.slug === slug),
  }
})
