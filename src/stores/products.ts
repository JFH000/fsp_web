import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/types'

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Camiseta Básica', description: 'Camiseta de algodón 100%', price: 19.99, image: 'https://placehold.co/400x400?text=Camiseta', category: 'Ropa', stock: 50 },
  { id: 2, name: 'Zapatillas Running', description: 'Zapatillas ligeras para correr', price: 89.99, image: 'https://placehold.co/400x400?text=Zapatillas', category: 'Calzado', stock: 30 },
  { id: 3, name: 'Mochila Urbana', description: 'Mochila resistente 20L', price: 49.99, image: 'https://placehold.co/400x400?text=Mochila', category: 'Accesorios', stock: 20 },
  { id: 4, name: 'Auriculares BT', description: 'Auriculares inalámbricos con cancelación de ruido', price: 129.99, image: 'https://placehold.co/400x400?text=Auriculares', category: 'Electrónica', stock: 15 },
  { id: 5, name: 'Reloj Inteligente', description: 'Smartwatch con monitor de salud', price: 199.99, image: 'https://placehold.co/400x400?text=Reloj', category: 'Electrónica', stock: 10 },
  { id: 6, name: 'Pantalón Chino', description: 'Pantalón slim fit casual', price: 39.99, image: 'https://placehold.co/400x400?text=Pantalon', category: 'Ropa', stock: 40 },
]

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>(MOCK_PRODUCTS)
  const searchQuery = ref('')
  const selectedCategory = ref('')

  const categories = computed(() =>
    [...new Set(products.value.map(p => p.category))]
  )

  const filteredProducts = computed(() =>
    products.value.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchesCategory = !selectedCategory.value || p.category === selectedCategory.value
      return matchesSearch && matchesCategory
    })
  )

  function addProduct(product: Omit<Product, 'id'>) {
    const id = Math.max(0, ...products.value.map(p => p.id)) + 1
    products.value.push({ ...product, id })
  }

  function updateProduct(updated: Product) {
    const index = products.value.findIndex(p => p.id === updated.id)
    if (index !== -1) products.value[index] = updated
  }

  function deleteProduct(id: number) {
    products.value = products.value.filter(p => p.id !== id)
  }

  function getById(id: number) {
    return products.value.find(p => p.id === id)
  }

  return { products, searchQuery, selectedCategory, categories, filteredProducts, addProduct, updateProduct, deleteProduct, getById }
})
