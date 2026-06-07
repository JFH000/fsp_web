<template>
  <div class="group bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
    <!-- Image -->
    <RouterLink :to="`/product/${product.id}`" class="block relative overflow-hidden bg-white h-48">
      <img
        v-if="product.images.length && !imgBroken"
        :src="product.images[0]"
        :alt="product.name"
        class="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
        @error="imgBroken = true"
      />
      <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
        <Package class="h-10 w-10" />
        <span class="text-xs">Sin imagen</span>
      </div>
      <!-- Badges overlay -->
      <div class="absolute top-2 left-2 flex flex-col gap-1">
        <AppBadge v-if="product.isNew" variant="orange" size="xs">NUEVO</AppBadge>
        <AppBadge v-if="product.stock > 0 && product.stock <= 5" variant="orange" size="xs">Últimas {{ product.stock }} unid.</AppBadge>
      </div>
      <!-- Favorite button -->
      <button
        @click.stop.prevent="handleFavorite"
        :class="[
          'absolute top-2 right-2 z-10 transition-opacity p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm cursor-pointer',
          favoritesStore.isFavorite(product.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        ]"
        :title="favoritesStore.isFavorite(product.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'"
      >
        <Star
          class="h-4 w-4 transition-colors"
          :class="favoritesStore.isFavorite(product.id) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'"
        />
      </button>
      <!-- Quick view -->
      <RouterLink
        :to="`/product/${product.id}`"
        class="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/10 transition-colors flex items-center justify-center"
      >
        <span class="opacity-0 group-hover:opacity-100 bg-white text-brand-700 text-xs font-semibold px-4 py-1.5 rounded-full shadow-md transition-opacity">
          Ver detalle
        </span>
      </RouterLink>
    </RouterLink>

    <!-- Content -->
    <div class="p-4 flex flex-col flex-1 gap-2">
      <!-- Brand + Line -->
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-brand-700 uppercase tracking-wider">{{ product.brand.name }}</span>
        <AppBadge variant="slate" size="xs">{{ product.productLine.code }}</AppBadge>
      </div>

      <!-- Name -->
      <RouterLink :to="`/product/${product.id}`">
        <h3 class="font-semibold text-slate-900 text-sm leading-tight hover:text-brand-700 transition-colors line-clamp-2">
          {{ product.name }}
        </h3>
      </RouterLink>

      <!-- SKU -->
      <p class="text-[11px] text-slate-400 font-mono">SKU: {{ product.sku }}</p>

      <!-- Refrigerants -->
      <div v-if="product.refrigerants.length" class="flex flex-wrap gap-1">
        <span
          v-for="r in product.refrigerants.slice(0, 3)"
          :key="r"
          class="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-medium"
        >{{ r }}</span>
        <span v-if="product.refrigerants.length > 3" class="text-[10px] text-slate-400 self-center">
          +{{ product.refrigerants.length - 3 }}
        </span>
      </div>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Stock indicator (only when stock is known) -->
      <div v-if="product.stock > 0" class="flex items-center gap-1.5 text-xs">
        <div :class="['h-1.5 w-1.5 rounded-full', product.stock > 5 ? 'bg-emerald-500' : 'bg-amber-500']" />
        <span :class="product.stock > 5 ? 'text-emerald-700' : 'text-amber-700'">
          {{ product.stock > 5 ? `${product.stock} en stock` : `Solo ${product.stock} en stock` }}
        </span>
      </div>

      <!-- Price + Action -->
      <div class="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
        <div>
          <template v-if="product.priceCop != null">
            <p class="text-xl font-extrabold text-slate-900">{{ formatCurrency(product.priceCop) }}</p>
            <p class="text-[10px] text-slate-400">COP · IVA incluido</p>
          </template>
          <template v-else-if="product.priceUsd != null">
            <p class="text-xl font-extrabold text-slate-900">{{ formatCurrency(product.priceUsd) }}</p>
            <p class="text-[10px] text-slate-400">USD</p>
          </template>
          <template v-else>
            <p class="text-sm font-semibold text-slate-400">Consultar precio</p>
          </template>
        </div>
        <button
          @click.prevent="handleAdd"
          :disabled="adding"
          class="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
        >
          <component :is="adding ? Check : ShoppingCart" class="h-3.5 w-3.5" />
          {{ adding ? 'Agregado' : 'Agregar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ShoppingCart, Check, Package, Star } from '@lucide/vue'
import type { Product } from '@/shared/types'
import { useCartStore } from '@/modules/cart/stores/cart.store'
import { formatCurrency } from '@/shared/utils/currency'
import AppBadge from '@/shared/components/ui/AppBadge.vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useAuthModal } from '@/modules/auth/composables/useAuthModal'
import { useFavoritesStore } from '@/modules/favorites/stores/favorites.store'

const props = defineProps<{ product: Product }>()
const cartStore      = useCartStore()
const authStore      = useAuthStore()
const authModal      = useAuthModal()
const favoritesStore = useFavoritesStore()
const adding    = ref(false)
const imgBroken = ref(false)

function handleAdd() {
  cartStore.addToCart(props.product)
  adding.value = true
  setTimeout(() => (adding.value = false), 1500)
}

function handleFavorite() {
  if (!authStore.isAuthenticated) {
    authModal.open('login')
    return
  }
  favoritesStore.toggleFavorite(authStore.user!.id, props.product.id)
}
</script>
