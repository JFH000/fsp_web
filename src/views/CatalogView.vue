<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Catálogo</h1>

    <div class="flex flex-col sm:flex-row gap-4 mb-8">
      <input
        v-model="store.searchQuery"
        type="text"
        placeholder="Buscar productos..."
        class="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <select
        v-model="store.selectedCategory"
        class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <option value="">Todas las categorías</option>
        <option v-for="cat in store.categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <div v-if="store.filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProductCard v-for="product in store.filteredProducts" :key="product.id" :product="product" />
    </div>
    <div v-else class="text-center py-20 text-gray-400">
      <p class="text-lg">No se encontraron productos.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductsStore } from '@/stores/products'
import ProductCard from '@/components/catalog/ProductCard.vue'

const store = useProductsStore()
</script>
