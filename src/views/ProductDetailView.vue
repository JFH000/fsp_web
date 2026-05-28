<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <RouterLink to="/" class="text-sm text-indigo-600 hover:underline mb-6 inline-block">&larr; Volver al catálogo</RouterLink>

    <div v-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <img :src="product.image" :alt="product.name" class="w-full rounded-xl shadow-md object-cover" />
      <div class="flex flex-col gap-4">
        <span class="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit">{{ product.category }}</span>
        <h1 class="text-3xl font-bold text-gray-900">{{ product.name }}</h1>
        <p class="text-gray-600 leading-relaxed">{{ product.description }}</p>
        <p class="text-2xl font-bold text-gray-900">${{ product.price.toFixed(2) }}</p>
        <p class="text-sm" :class="product.stock > 0 ? 'text-green-600' : 'text-red-500'">
          {{ product.stock > 0 ? `${product.stock} en stock` : 'Agotado' }}
        </p>
        <div class="flex items-center gap-3 mt-2">
          <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button @click="qty > 1 && qty--" class="px-3 py-2 text-gray-600 hover:bg-gray-100">-</button>
            <span class="px-4 py-2 text-sm font-medium">{{ qty }}</span>
            <button @click="qty < product.stock && qty++" class="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
          </div>
          <button
            @click="handleAdd"
            :disabled="product.stock === 0"
            class="flex-1 bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Agregar al carrito
          </button>
        </div>
        <p v-if="added" class="text-green-600 text-sm font-medium">¡Producto añadido al carrito!</p>
      </div>
    </div>
    <div v-else class="text-center py-20 text-gray-400">
      <p>Producto no encontrado.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const productsStore = useProductsStore()
const cartStore = useCartStore()

const product = computed(() => productsStore.getById(Number(route.params.id)))
const qty = ref(1)
const added = ref(false)

function handleAdd() {
  if (!product.value) return
  cartStore.addToCart(product.value, qty.value)
  added.value = true
  setTimeout(() => (added.value = false), 2000)
}
</script>
