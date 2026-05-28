<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Carrito de compras</h1>

    <div v-if="cartStore.items.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 flex flex-col gap-4">
        <div
          v-for="item in cartStore.items"
          :key="item.product.id"
          class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4 items-center"
        >
          <img :src="item.product.image" :alt="item.product.name" class="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ item.product.name }}</p>
            <p class="text-sm text-gray-500">${{ item.product.price.toFixed(2) }} / ud.</p>
          </div>
          <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button @click="cartStore.updateQuantity(item.product.id, item.quantity - 1)" class="px-2 py-1 text-gray-600 hover:bg-gray-100 text-sm">-</button>
            <span class="px-3 text-sm font-medium">{{ item.quantity }}</span>
            <button @click="cartStore.updateQuantity(item.product.id, item.quantity + 1)" class="px-2 py-1 text-gray-600 hover:bg-gray-100 text-sm">+</button>
          </div>
          <p class="font-bold text-gray-900 w-20 text-right">${{ (item.product.price * item.quantity).toFixed(2) }}</p>
          <button @click="cartStore.removeFromCart(item.product.id)" class="text-red-400 hover:text-red-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-fit">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Resumen</h2>
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>Productos ({{ cartStore.totalItems }})</span>
          <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm text-gray-600 mb-4">
          <span>Envío</span>
          <span class="text-green-600">Gratis</span>
        </div>
        <hr class="border-gray-200 mb-4" />
        <div class="flex justify-between font-bold text-gray-900 text-lg mb-6">
          <span>Total</span>
          <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>
        <button class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
          Finalizar compra
        </button>
        <RouterLink to="/" class="block text-center mt-3 text-sm text-indigo-600 hover:underline">
          Seguir comprando
        </RouterLink>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <p class="text-gray-400 text-lg mb-4">Tu carrito está vacío.</p>
      <RouterLink to="/" class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
        Ver catálogo
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
const cartStore = useCartStore()
</script>
