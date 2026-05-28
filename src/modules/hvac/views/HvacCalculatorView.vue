<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-20">
    <div class="text-center max-w-md">
      <div class="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Calculator class="h-10 w-10 text-brand-700" />
      </div>

      <div class="inline-flex items-center gap-2 bg-accent-50 border border-accent-200 rounded-full px-4 py-1.5 text-accent-600 text-sm font-medium mb-5">
        <Clock class="h-3.5 w-3.5" />
        Próximamente
      </div>

      <h1 class="text-3xl font-bold text-slate-900 mb-3">Calculadora de Carga Térmica</h1>
      <p class="text-slate-500 leading-relaxed">
        Estamos trabajando en esta herramienta. Pronto podrás calcular la carga térmica de tu espacio
        y obtener recomendaciones automáticas de equipos.
      </p>

      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 mt-8 bg-brand-700 hover:bg-brand-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        <ArrowLeft class="h-4 w-4" />
        Volver al inicio
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calculator, Clock, ArrowLeft } from '@lucide/vue'
</script>
