<template>
  <footer class="bg-slate-900 text-slate-400">
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <!-- Brand -->
        <div class="md:col-span-1">
          <div class="mb-4">
            <div class="inline-flex items-baseline gap-1.5">
              <span class="text-2xl font-black text-white tracking-tight">FS</span>
              <span class="text-2xl font-black text-brand-400 tracking-tight">Parts</span>
            </div>
          </div>
          <p class="text-sm leading-relaxed">
            Distribuidor especializado en piezas y equipos para refrigeración, aire acondicionado y HVAC/R.
          </p>
        </div>

        <!-- Lines -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Líneas de Producto</h4>
          <ul class="space-y-2 text-sm">
            <li v-for="line in productLines" :key="line.id">
              <RouterLink :to="`/catalog?line=${line.code}`" class="hover:text-brand-400 transition-colors">
                {{ line.code }} · {{ line.name }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Info -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Información</h4>
          <ul class="space-y-2 text-sm">
            <li><RouterLink to="/catalog" class="hover:text-brand-400 transition-colors">Catálogo completo</RouterLink></li>
            <li><RouterLink to="/hvac-calculator" class="hover:text-brand-400 transition-colors">Calculadora HVAC</RouterLink></li>
            <li><a href="#" class="hover:text-brand-400 transition-colors">Quiénes somos</a></li>
            <li><a href="#" class="hover:text-brand-400 transition-colors">Política de envíos</a></li>
            <li><a href="#" class="hover:text-brand-400 transition-colors">Devoluciones</a></li>
            <li><a href="#" class="hover:text-brand-400 transition-colors">Contacto</a></li>
          </ul>
        </div>

        <!-- Brands & Certs -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Marcas que distribuimos</h4>
          <div class="flex flex-wrap gap-2 mb-6">
            <span v-for="b in brands" :key="b.id" class="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md">
              {{ b.name }}
            </span>
          </div>
          <div class="flex items-center gap-2 bg-slate-800 rounded-lg p-3 text-xs">
            <ShieldCheck class="h-8 w-8 text-emerald-400 flex-shrink-0" />
            <div>
              <p class="text-white font-medium">Distribuidor autorizado</p>
              <p class="text-slate-400">Productos 100% originales y garantizados</p>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {{ year }} FS Parts. Todos los derechos reservados.</p>
        <div class="flex items-center gap-4">
          <a href="https://www.facebook.com/fsparts.col/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors" aria-label="Facebook">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97H15.83c-1.491 0-1.956.931-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
          </a>
          <a href="https://www.instagram.com/fsparts.col/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors" aria-label="Instagram">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
          <span class="text-slate-700">·</span>
          <a href="#" class="hover:text-slate-300 transition-colors">Aviso de privacidad</a>
          <a href="#" class="hover:text-slate-300 transition-colors">Términos y condiciones</a>
          <RouterLink to="/admin" class="hover:text-slate-300 transition-colors">Admin</RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ShieldCheck } from '@lucide/vue'
import { PRODUCT_LINES, BRANDS } from '@/modules/catalog/data/mock'

const year = computed(() => new Date().getFullYear())
const productLines = PRODUCT_LINES
const brands = BRANDS
</script>
