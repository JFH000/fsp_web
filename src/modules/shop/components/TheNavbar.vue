<template>
  <header :class="['sticky top-0 z-40 w-full transition-shadow duration-300', scrolled ? 'shadow-lg' : 'shadow-sm']">
    <!-- Main navbar -->
    <nav class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center gap-2 sm:gap-4">

        <!-- Logo -->
        <RouterLink to="/" class="flex-shrink-0 flex items-center gap-2">
          <div class="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center">
            <Snowflake class="h-4 w-4 text-white" />
          </div>
          <span class="hidden sm:block text-xl font-bold text-slate-900 whitespace-nowrap">
            FS <span class="text-brand-700">Parts</span>
          </span>
        </RouterLink>

        <!-- Search bar — siempre visible -->
        <form class="flex-1 min-w-0 flex" @submit.prevent="handleSearch">
          <!-- Line filter: solo en lg+ -->
          <select
            v-model="selectedLine"
            class="hidden lg:block flex-shrink-0 border border-r-0 border-slate-300 rounded-l-lg bg-slate-50 px-3 text-sm text-slate-600 focus:outline-none"
          >
            <option value="">Todas las líneas</option>
            <option v-for="line in catalogStore.productLines" :key="line.id" :value="line.code">
              {{ line.code }} – {{ line.name }}
            </option>
          </select>

          <!-- Input -->
          <input
            v-model="searchValue"
            type="text"
            placeholder="Buscar por nombre, SKU, marca..."
            class="flex-1 min-w-0 border border-slate-300 px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-l-lg lg:rounded-none lg:border-l-0"
          />

          <!-- Search button -->
          <button
            type="submit"
            class="flex-shrink-0 bg-brand-700 hover:bg-brand-800 text-white px-3 sm:px-5 rounded-r-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Search class="h-4 w-4" />
            <span class="hidden xl:inline">Buscar</span>
          </button>
        </form>

        <!-- Right actions -->
        <div class="flex-shrink-0 flex items-center gap-1">
          <RouterLink
            to="/hvac-calculator"
            class="hidden lg:flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Calculator class="h-4 w-4" />
            <span>Calc. Térmica</span>
          </RouterLink>
          <RouterLink
            to="/admin"
            class="hidden lg:flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <LayoutDashboard class="h-4 w-4" />
            <span>Admin</span>
          </RouterLink>

          <!-- Cart — siempre visible -->
          <button
            @click="cartStore.openDrawer()"
            class="relative flex items-center gap-1.5 sm:gap-2 bg-brand-700 hover:bg-brand-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <ShoppingCart class="h-4 w-4" />
            <span class="hidden sm:inline">Carrito</span>
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -top-2 -right-2 bg-accent-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}
            </span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Category nav — siempre visible, scroll horizontal en móvil -->
    <nav class="bg-slate-900 text-slate-300">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
        <RouterLink
          v-for="line in catalogStore.productLines"
          :key="line.id"
          :to="`/catalog?line=${line.code}`"
          class="flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 text-xs font-medium hover:text-white hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
          :class="isActiveLine(line.code) ? 'text-white bg-slate-800' : ''"
          @click="setActiveLine(line.code)"
        >
          <component :is="lineIcon(line.icon)" class="h-3.5 w-3.5 text-brand-400 flex-shrink-0" />
          <span class="hidden sm:inline">{{ line.code }} · </span>{{ line.name.split(' ')[0] }}
        </RouterLink>
        <RouterLink
          to="/catalog"
          class="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 text-xs font-medium text-accent-400 hover:text-accent-300 transition-colors whitespace-nowrap ml-auto"
        >
          Ver todos <ChevronRight class="h-3.5 w-3.5" />
        </RouterLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWindowScroll } from '@vueuse/core'
import { Search, ShoppingCart, Calculator, LayoutDashboard, ChevronRight, Snowflake, Wrench, Settings2, Gauge, Filter, Thermometer, Layers, Cpu } from '@lucide/vue'
import { useCartStore } from '@/modules/cart/stores/cart.store'
import { useCatalogStore } from '@/modules/catalog/stores/catalog.store'

const cartStore    = useCartStore()
const catalogStore = useCatalogStore()
const router       = useRouter()
const route        = useRoute()

const { y } = useWindowScroll()
const scrolled = shallowRef(false)
watch(y, val => { scrolled.value = val > 10 })

const searchValue  = ref('')
const selectedLine = ref('')
const activeLine   = ref('')

function handleSearch() {
  if (!searchValue.value.trim()) return
  router.push({ path: '/catalog', query: { q: searchValue.value, line: selectedLine.value || undefined } })
}

function isActiveLine(code: string) { return activeLine.value === code || route.query.line === code }
function setActiveLine(code: string) { activeLine.value = code }

const ICON_MAP: Record<string, unknown> = { Wrench, Settings2, Gauge, Filter, Thermometer, Layers, Cpu }
function lineIcon(name: string) { return ICON_MAP[name] ?? Wrench }
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
