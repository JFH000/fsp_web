<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <RouterLink to="/" class="text-xl font-bold text-indigo-600 tracking-tight">
        FSP Store
      </RouterLink>

      <div class="flex items-center gap-6">
        <RouterLink to="/" class="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
          Catálogo
        </RouterLink>
        <RouterLink to="/admin" class="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
          Admin
        </RouterLink>
        <RouterLink to="/cart" class="relative flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Carrito
          <span v-if="cartStore.totalItems > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {{ cartStore.totalItems }}
          </span>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
const cartStore = useCartStore()
</script>
