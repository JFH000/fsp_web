<template>
  <div class="flex min-h-[calc(100vh-64px)]">
    <aside class="w-56 bg-gray-900 text-gray-300 flex-shrink-0">
      <div class="p-6">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Panel Admin</p>
        <nav class="flex flex-col gap-1">
          <RouterLink
            to="/admin"
            :class="['flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors', $route.name === 'admin-dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800']"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            to="/admin/products"
            :class="['flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors', $route.name === 'admin-products' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800']"
          >
            Productos
          </RouterLink>
        </nav>
      </div>
    </aside>
    <main class="flex-1 bg-gray-50 p-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const $route = useRoute()
</script>
