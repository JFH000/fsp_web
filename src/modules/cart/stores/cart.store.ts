import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { CartItem, Product } from '@/shared/types'

export const useCartStore = defineStore('cart', () => {
  const items = useLocalStorage<CartItem[]>('fsp-cart', [])
  const isDrawerOpen = ref(false)

  const totalItems = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const subtotal   = computed(() => items.value.reduce((s, i) => s + (i.product.priceCop ?? i.product.priceUsd ?? 0) * i.quantity, 0))

  function addToCart(product: Product, quantity = 1) {
    const existing = items.value.find(i => i.product.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }
    isDrawerOpen.value = true
  }

  function removeFromCart(productId: string) {
    items.value = items.value.filter(i => i.product.id !== productId)
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) { removeFromCart(productId); return }
    const item = items.value.find(i => i.product.id === productId)
    if (item) item.quantity = quantity
  }

  function clearCart() {
    items.value = []
  }

  function openDrawer()  { isDrawerOpen.value = true }
  function closeDrawer() { isDrawerOpen.value = false }

  return {
    items, isDrawerOpen,
    totalItems, subtotal,
    addToCart, removeFromCart, updateQuantity, clearCart,
    openDrawer, closeDrawer,
  }
})
