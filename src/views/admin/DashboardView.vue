<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p class="text-sm text-gray-500">Total productos</p>
        <p class="text-3xl font-bold text-indigo-600 mt-1">{{ store.products.length }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p class="text-sm text-gray-500">Categorías</p>
        <p class="text-3xl font-bold text-indigo-600 mt-1">{{ store.categories.length }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p class="text-sm text-gray-500">Unidades en stock</p>
        <p class="text-3xl font-bold text-indigo-600 mt-1">{{ totalStock }}</p>
      </div>
    </div>
    <RouterLink to="/admin/products" class="text-sm text-indigo-600 hover:underline">
      Gestionar productos &rarr;
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductsStore } from '@/stores/products'

const store = useProductsStore()
const totalStock = computed(() => store.products.reduce((s, p) => s + p.stock, 0))
</script>
