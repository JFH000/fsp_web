<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
    <RouterLink :to="`/product/${product.id}`">
      <img :src="product.image" :alt="product.name" class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
    </RouterLink>
    <div class="p-4">
      <span class="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{{ product.category }}</span>
      <RouterLink :to="`/product/${product.id}`">
        <h3 class="mt-2 font-semibold text-gray-900 hover:text-indigo-600 transition-colors">{{ product.name }}</h3>
      </RouterLink>
      <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ product.description }}</p>
      <div class="mt-4 flex items-center justify-between">
        <span class="text-lg font-bold text-gray-900">${{ product.price.toFixed(2) }}</span>
        <button
          @click="handleAdd"
          :disabled="product.stock === 0"
          class="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {{ product.stock === 0 ? 'Agotado' : 'Agregar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types'

const props = defineProps<{ product: Product }>()
const cartStore = useCartStore()

function handleAdd() {
  cartStore.addToCart(props.product)
}
</script>
