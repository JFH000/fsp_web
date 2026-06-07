<template>
  <header :class="['sticky top-0 z-40 w-full transition-shadow duration-300', scrolled ? 'shadow-lg' : 'shadow-sm']">
    <!-- Main navbar -->
    <nav class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center gap-2 sm:gap-4">

        <!-- Logo -->
        <RouterLink to="/" class="flex-shrink-0">
          <img src="/logo.png" alt="FS Parts" class="h-10 w-auto" />
        </RouterLink>

        <!-- Search bar — siempre visible -->
        <form class="flex-1 min-w-0" @submit.prevent="handleSearch">
          <div class="flex items-center bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:bg-white">
            <Search class="h-4 w-4 text-slate-400 ml-3.5 flex-shrink-0" />
            <input
              v-model="searchValue"
              type="text"
              placeholder="Buscar por nombre, SKU o marca..."
              class="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
            />
            <!-- Line filter: solo en lg+ -->
            <div class="hidden lg:flex items-center gap-1.5 border-l border-slate-200 px-3 flex-shrink-0">
              <Layers class="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <select
                v-model="selectedLine"
                class="bg-transparent text-xs text-slate-500 focus:outline-none cursor-pointer max-w-[130px]"
              >
                <option value="">Todas las líneas</option>
                <option v-for="line in catalogStore.productLines" :key="line.id" :value="line.code">
                  {{ line.code }} – {{ line.name }}
                </option>
              </select>
            </div>
            <button
              type="submit"
              class="m-1.5 flex-shrink-0 bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
            >
              <Search class="h-4 w-4" />
              <span class="hidden sm:inline">Buscar</span>
            </button>
          </div>
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
          <!-- Auth -->
          <RouterLink
            v-if="!authStore.isAuthenticated"
            to="/login"
            class="hidden sm:flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap font-medium"
          >
            <User class="h-4 w-4" />
            Ingresar
          </RouterLink>
          <RouterLink
            v-else
            to="/me"
            class="hidden sm:flex items-center justify-center w-8 h-8 bg-brand-700 hover:bg-brand-800 text-white text-xs font-extrabold rounded-full transition-colors"
            :title="authStore.profile?.fullName || authStore.user?.email || 'Mi perfil'"
          >
            {{ userInitials }}
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
      <div class="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-center gap-1 overflow-x-auto no-scrollbar">
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
          class="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 text-xs font-medium text-accent-400 hover:text-accent-300 transition-colors whitespace-nowrap"
        >
          Ver todos <ChevronRight class="h-3.5 w-3.5" />
        </RouterLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWindowScroll } from '@vueuse/core'
import { Search, ShoppingCart, Calculator, ChevronRight, Wrench, Settings2, Gauge, Filter, Thermometer, Layers, Cpu, User } from '@lucide/vue'
import { useCartStore } from '@/modules/cart/stores/cart.store'
import { useCatalogStore } from '@/modules/catalog/stores/catalog.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const cartStore    = useCartStore()
const catalogStore = useCatalogStore()
const authStore    = useAuthStore()

const userInitials = computed(() => {
  const name = authStore.profile?.fullName ?? authStore.user?.email ?? '?'
  return name.split(/[\s@]/).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
})
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
