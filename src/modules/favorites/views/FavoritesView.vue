<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs text-slate-400 mb-6">
      <RouterLink to="/" class="hover:text-brand-600">Inicio</RouterLink>
      <ChevronRight class="h-3 w-3" />
      <span class="text-slate-700">Mis favoritos</span>
    </nav>

    <!-- Title row -->
    <div class="flex items-center gap-3 mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900">Mis favoritos</h1>
      <span class="text-sm text-slate-400 font-medium">
        ({{ favoriteProducts.length }} producto{{ favoriteProducts.length !== 1 ? 's' : '' }})
      </span>
    </div>

    <!-- Empty state -->
    <div v-if="favoriteProducts.length === 0" class="text-center py-20">
      <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
        <Star class="h-8 w-8 text-amber-400" />
      </div>
      <p class="text-slate-700 font-semibold mb-1">Aún no tienes favoritos</p>
      <p class="text-slate-400 text-sm mb-6">Marca productos con ⭐ para guardarlos aquí</p>
      <RouterLink
        to="/catalog"
        class="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
      >
        Explorar catálogo
      </RouterLink>
    </div>

    <!-- Product grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <ProductCard
        v-for="product in favoriteProducts"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, Star } from '@lucide/vue'
import { useFavoritesStore } from '@/modules/favorites/stores/favorites.store'
import { useCatalogStore } from '@/modules/catalog/stores/catalog.store'
import ProductCard from '@/modules/catalog/components/ProductCard.vue'

const favoritesStore = useFavoritesStore()
const catalogStore = useCatalogStore()

const favoriteProducts = computed(() =>
  catalogStore.allProducts.filter(p => favoritesStore.isFavorite(p.id))
)
</script>
