<template>
  <div>
    <!-- HERO -->
    <section class="relative bg-slate-900 overflow-hidden">
      <!-- Dot grid background -->
      <div
        class="absolute inset-0 opacity-20"
        style="background-image: radial-gradient(circle, #60a5fa 1px, transparent 1px); background-size: 36px 36px;"
      />
      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-brand-950/80 via-slate-900/60 to-slate-900/90" />

      <div class="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-16">
        <div class="max-w-3xl">
          <!-- Pill tag -->
          <div class="inline-flex items-center gap-2 bg-brand-700/30 border border-brand-500/40 rounded-full px-4 py-1.5 text-brand-300 text-sm mb-6">
            <Zap class="h-3.5 w-3.5 text-accent-400" />
            +5,000 productos en stock · Envío inmediato
          </div>

          <h1 class="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
            Tu distribuidor<br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
              HVAC/R
            </span>
            <span class="text-white"> de confianza</span>
          </h1>
          <p class="text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
            Compresores, válvulas, refrigerantes, filtros e intercambiadores de calor.
            Todo para refrigeración y aire acondicionado industrial y comercial.
          </p>

          <!-- Search bar -->
          <form @submit.prevent="handleSearch" class="flex gap-0 max-w-2xl mb-10">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nombre, SKU o marca..."
              class="flex-1 px-5 py-4 text-base rounded-l-xl border-0 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xl"
            />
            <button
              type="submit"
              class="bg-accent-500 hover:bg-accent-600 text-white px-7 py-4 rounded-r-xl font-semibold text-base transition-colors shadow-xl flex items-center gap-2"
            >
              <Search class="h-5 w-5" />
              Buscar
            </button>
          </form>

          <!-- Quick category links -->
          <div class="flex flex-wrap gap-2">
            <RouterLink
              v-for="line in productLines.slice(0, 5)"
              :key="line.id"
              :to="`/catalog?line=${line.code}`"
              class="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 text-sm px-4 py-2 rounded-full transition-all"
            >
              <component :is="lineIcon(line.icon)" class="h-3.5 w-3.5 text-brand-400" />
              {{ line.name.split(' ')[0] }}
            </RouterLink>
            <RouterLink
              to="/catalog"
              class="flex items-center gap-1 bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/40 text-accent-300 text-sm px-4 py-2 rounded-full transition-all"
            >
              Ver todo <ArrowRight class="h-3.5 w-3.5" />
            </RouterLink>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mt-16 max-w-lg">
          <div class="text-center">
            <p class="text-3xl font-bold text-white">5,000+</p>
            <p class="text-xs text-slate-400 mt-1">Productos</p>
          </div>
          <div class="text-center border-x border-slate-700">
            <p class="text-3xl font-bold text-white">50+</p>
            <p class="text-xs text-slate-400 mt-1">Marcas</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-white">15+</p>
            <p class="text-xs text-slate-400 mt-1">Años</p>
          </div>
        </div>
      </div>

      <!-- Bottom wave -->
      <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent" />
    </section>

    <!-- PRODUCT LINES -->
    <section class="max-w-7xl mx-auto px-4 py-16">
      <div class="flex items-end justify-between mb-8">
        <div>
          <p class="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-1">Catálogo organizado</p>
          <h2 class="text-3xl font-bold text-slate-900">Líneas de Producto</h2>
        </div>
        <RouterLink to="/catalog" class="text-sm font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1">
          Ver catálogo completo <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <RouterLink
          v-for="line in productLines"
          :key="line.id"
          :to="`/catalog?line=${line.code}`"
          class="group flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <div class="w-12 h-12 bg-brand-50 group-hover:bg-brand-100 rounded-xl flex items-center justify-center mb-3 transition-colors">
            <component :is="lineIcon(line.icon)" class="h-6 w-6 text-brand-700" />
          </div>
          <span class="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full mb-2">{{ line.code }}</span>
          <p class="text-xs font-semibold text-slate-800 leading-tight">{{ line.name }}</p>
          <p class="text-xs text-slate-400 mt-1">{{ line.productCount }}+ refs</p>
        </RouterLink>
      </div>
    </section>

    <!-- FEATURED PRODUCTS -->
    <section class="bg-slate-50/80 py-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-end justify-between mb-8">
          <div>
            <p class="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-1">Lo más vendido</p>
            <h2 class="text-3xl font-bold text-slate-900">Productos Destacados</h2>
          </div>
          <RouterLink to="/catalog" class="text-sm font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1">
            Ver todos <ArrowRight class="h-4 w-4" />
          </RouterLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <ProductCard
            v-for="product in catalogStore.featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <!-- HVAC CALC BANNER -->
    <section class="max-w-7xl mx-auto px-4 py-16">
      <div class="relative bg-gradient-to-r from-brand-800 to-brand-900 rounded-3xl overflow-hidden p-10 md:p-14">
        <div
          class="absolute inset-0 opacity-10"
          style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 24px 24px;"
        />
        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="text-center md:text-left">
            <div class="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 rounded-full px-4 py-1.5 text-accent-300 text-sm mb-4">
              <Zap class="h-3.5 w-3.5" />
              Herramienta premium
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-3">Calculadora de Carga Térmica</h2>
            <p class="text-slate-300 text-lg max-w-lg">
              Ingresa las dimensiones de tu espacio y obtén recomendaciones automáticas de compresores, válvulas y refrigerantes.
            </p>
          </div>
          <div class="flex flex-col gap-3 flex-shrink-0">
            <RouterLink
              to="/hvac-calculator"
              class="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
            >
              <Calculator class="h-5 w-5" />
              Calcular ahora
            </RouterLink>
            <p class="text-xs text-center text-slate-400">Gratis · Sin registro</p>
          </div>
        </div>
      </div>
    </section>

    <!-- BENEFITS -->
    <section class="bg-white py-16 border-t border-slate-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="b in benefits" :key="b.title" class="flex flex-col items-center text-center p-6">
            <div class="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
              <component :is="b.icon" class="h-6 w-6 text-brand-700" />
            </div>
            <h3 class="font-semibold text-slate-900 mb-1">{{ b.title }}</h3>
            <p class="text-sm text-slate-500">{{ b.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search, ArrowRight, Zap, Calculator,
  Truck, ShieldCheck, Headphones, Award,
  Wrench, Settings2, Gauge, Filter, Thermometer, Layers, Cpu,
} from '@lucide/vue'
import { useCatalogStore } from '@/modules/catalog/stores/catalog.store'
import ProductCard from '@/modules/catalog/components/ProductCard.vue'
import { PRODUCT_LINES } from '@/modules/catalog/data/mock'

const router       = useRouter()
const catalogStore = useCatalogStore()
const productLines = PRODUCT_LINES
const searchQuery  = ref('')

function handleSearch() {
  if (!searchQuery.value.trim()) return
  router.push({ path: '/catalog', query: { q: searchQuery.value } })
}

const ICON_MAP: Record<string, unknown> = { Wrench, Settings2, Gauge, Filter, Thermometer, Layers, Cpu }
function lineIcon(name: string) { return ICON_MAP[name] ?? Wrench }

const benefits = [
  { icon: Truck,        title: 'Envío rápido',        desc: 'Despacho mismo día en pedidos antes de las 2pm' },
  { icon: ShieldCheck,  title: 'Garantía total',       desc: 'Todos los productos son 100% originales y garantizados' },
  { icon: Headphones,   title: 'Soporte técnico',      desc: 'Asesoría especializada en refrigeración y HVAC' },
  { icon: Award,        title: 'Distribuidor oficial', desc: 'Distribuidor autorizado de las mejores marcas' },
]
</script>
