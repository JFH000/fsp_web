<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Loading -->
    <div v-if="!product" class="text-center py-20">
      <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
        <PackageSearch class="h-8 w-8 text-slate-400" />
      </div>
      <p class="text-slate-500">Producto no encontrado.</p>
      <RouterLink to="/catalog" class="mt-4 inline-flex items-center gap-1 text-brand-600 hover:underline text-sm">
        <ArrowLeft class="h-4 w-4" /> Volver al catálogo
      </RouterLink>
    </div>

    <template v-else>
      <!-- Admin edit shortcut -->
      <RouterLink
        v-if="auth.isAdmin"
        :to="`/admin/products/${route.params.id}/edit`"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg transition-colors"
      >
        <Pencil class="h-4 w-4" />
        Editar producto
      </RouterLink>

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <RouterLink to="/" class="hover:text-brand-600">Inicio</RouterLink>
        <ChevronRight class="h-3 w-3" />
        <RouterLink to="/catalog" class="hover:text-brand-600">Catálogo</RouterLink>
        <ChevronRight class="h-3 w-3" />
        <RouterLink :to="`/catalog?line=${product.productLine.code}`" class="hover:text-brand-600">
          {{ product.productLine.name }}
        </RouterLink>
        <ChevronRight class="h-3 w-3" />
        <span class="text-slate-700 truncate max-w-xs">{{ product.name }}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Images -->
        <div>
          <div class="relative bg-white rounded-2xl overflow-hidden aspect-square mb-3 border border-slate-100">
            <img
              v-if="currentImage"
              :src="currentImage"
              :alt="product.name"
              class="w-full h-full object-contain p-4"
              @error="activeImage = -1"
            />
            <div v-else class="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-300">
              <PackageSearch class="h-16 w-16" />
              <span class="text-sm">Sin imagen</span>
            </div>
            <div class="absolute top-3 left-3 flex flex-col gap-1.5">
              <AppBadge v-if="product.isNew" variant="orange">NUEVO</AppBadge>
            </div>
          </div>
          <div v-if="product.images.length > 1" class="flex gap-2">
            <button
              v-for="(img, i) in product.images"
              :key="i"
              @click="activeImage = i"
              :class="[
                'w-16 h-16 rounded-xl overflow-hidden border-2 transition-all',
                activeImage === i ? 'border-brand-600' : 'border-slate-100 hover:border-slate-300',
              ]"
            >
              <img :src="img" :alt="product.name" class="w-full h-full object-contain p-1" />
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="flex flex-col gap-4">
          <!-- Brand + line + sku -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-bold text-brand-700 uppercase tracking-wider">{{ product.brand.name }}</span>
            <span class="text-slate-300">·</span>
            <AppBadge variant="slate">{{ product.productLine.code }} · {{ product.productLine.name }}</AppBadge>
            <span class="text-slate-300">·</span>
            <span class="font-mono text-xs text-slate-400">SKU: {{ product.sku }}</span>
          </div>

          <h1 class="text-3xl font-extrabold text-slate-900 leading-tight">{{ product.name }}</h1>
          <p class="text-slate-600 leading-relaxed">{{ product.description }}</p>

          <!-- Refrigerants -->
          <div v-if="product.refrigerants.length" class="flex items-start gap-2 flex-wrap">
            <span class="text-xs font-semibold text-slate-500 mt-0.5">Compatible con:</span>
            <span
              v-for="r in product.refrigerants"
              :key="r"
              class="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-full font-medium"
            >{{ r }}</span>
          </div>

          <!-- Price -->
          <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <template v-if="product.priceCop != null">
              <p class="text-4xl font-extrabold text-slate-900 mb-1">{{ formatCurrency(product.priceCop) }}</p>
              <p class="text-xs text-slate-400 mb-4">COP · IVA incluido</p>
            </template>
            <template v-else-if="product.priceUsd != null">
              <p class="text-4xl font-extrabold text-slate-900 mb-1">{{ formatCurrency(product.priceUsd) }}</p>
              <p class="text-xs text-slate-400 mb-4">USD</p>
            </template>
            <template v-else>
              <p class="text-xl font-semibold text-slate-400 mb-4">Consultar precio</p>
            </template>

            <!-- Stock (only when stock is known) -->
            <div v-if="product.stock > 0" class="flex items-center gap-2 mb-5">
              <div :class="['h-2 w-2 rounded-full', product.stock > 5 ? 'bg-emerald-500' : 'bg-amber-500']" />
              <span class="text-sm font-medium" :class="product.stock > 5 ? 'text-emerald-700' : 'text-amber-700'">
                {{ product.stock > 5 ? `${product.stock} unidades en stock` : `Solo ${product.stock} unidades disponibles` }}
              </span>
            </div>

            <!-- Qty + Add -->
            <div class="flex gap-3">
              <div class="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button @click="qty > 1 && qty--" class="px-3 py-3 text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors text-lg font-bold cursor-pointer">−</button>
                <span class="px-4 text-base font-semibold min-w-[3rem] text-center">{{ qty }}</span>
                <button @click="(!product.stock || qty < product.stock) && qty++" class="px-3 py-3 text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors text-lg font-bold cursor-pointer">+</button>
              </div>
              <button
                @click="handleAdd"
                class="flex-1 flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-bold py-3 px-6 rounded-xl transition-colors text-base"
              >
                <component :is="justAdded ? Check : ShoppingCart" class="h-5 w-5" />
                {{ justAdded ? '¡Agregado al carrito!' : 'Agregar al carrito' }}
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Specs table -->
      <div class="mt-12">
        <h2 class="text-xl font-bold text-slate-900 mb-6">Especificaciones técnicas</h2>
        <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div v-for="(group, groupName) in specGroups" :key="groupName">
            <div class="bg-slate-50 px-5 py-2.5 border-b border-slate-100">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ groupName }}</p>
            </div>
            <div v-for="spec in group" :key="spec.key" class="flex items-center border-b border-slate-50 last:border-0">
              <dt class="w-1/2 px-5 py-3 text-sm text-slate-500 font-medium">{{ spec.key }}</dt>
              <dd class="w-1/2 px-5 py-3 text-sm text-slate-900 font-semibold">
                {{ spec.value }}<span v-if="spec.unit" class="text-slate-400 font-normal ml-1">{{ spec.unit }}</span>
              </dd>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronRight, ArrowLeft, ShoppingCart, Check, PackageSearch, Pencil } from '@lucide/vue'
import { useCatalogStore } from '../stores/catalog.store'
import { useCartStore } from '@/modules/cart/stores/cart.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { formatCurrency } from '@/shared/utils/currency'
import AppBadge from '@/shared/components/ui/AppBadge.vue'

const route    = useRoute()
const catalog  = useCatalogStore()
const cart     = useCartStore()
const auth     = useAuthStore()

const product    = computed(() => catalog.getById(route.params.id as string))
const activeImage = ref(0)
const qty         = ref(1)
const justAdded   = ref(false)

const currentImage = computed(() => {
  const imgs = product.value?.images ?? []
  if (activeImage.value < 0 || activeImage.value >= imgs.length) return ''
  return imgs[activeImage.value]
})

function handleAdd() {
  if (!product.value) return
  cart.addToCart(product.value, qty.value)
  justAdded.value = true
  setTimeout(() => (justAdded.value = false), 2000)
}

const specGroups = computed(() => {
  if (!product.value) return {}
  return product.value.specs.reduce<Record<string, typeof product.value.specs>>((acc, spec) => {
    const g = spec.group ?? 'General'
    ;(acc[g] = acc[g] ?? []).push(spec)
    return acc
  }, {})
})
</script>
