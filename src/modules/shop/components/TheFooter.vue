<template>
  <footer class="bg-slate-900 text-slate-400">
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <!-- Brand -->
        <div class="md:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center">
              <Snowflake class="h-4 w-4 text-white" />
            </div>
            <span class="text-xl font-bold text-white">FS <span class="text-brand-400">Parts</span></span>
          </div>
          <p class="text-sm leading-relaxed mb-4">
            Distribuidor especializado en piezas y equipos para refrigeración, aire acondicionado y HVAC/R.
          </p>
          <div class="flex items-center gap-2 text-sm">
            <MapPin class="h-4 w-4 text-brand-400 flex-shrink-0" />
            <span>Ciudad de México, México</span>
          </div>
          <div class="flex items-center gap-2 text-sm mt-2">
            <Phone class="h-4 w-4 text-brand-400 flex-shrink-0" />
            <span>+52 (55) 1234-5678</span>
          </div>
          <div class="flex items-center gap-2 text-sm mt-2">
            <Mail class="h-4 w-4 text-brand-400 flex-shrink-0" />
            <span>ventas@fsparts.org</span>
          </div>
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
        <div class="flex gap-4">
          <a href="#" class="hover:text-slate-300 transition-colors">Aviso de privacidad</a>
          <a href="#" class="hover:text-slate-300 transition-colors">Términos y condiciones</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Snowflake, MapPin, Phone, Mail, ShieldCheck } from '@lucide/vue'
import { PRODUCT_LINES, BRANDS } from '@/modules/catalog/data/mock'

const year = computed(() => new Date().getFullYear())
const productLines = PRODUCT_LINES
const brands = BRANDS
</script>
