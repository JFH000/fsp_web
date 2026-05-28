<template>
  <div class="fixed inset-0 flex bg-slate-100">
    <!-- Sidebar -->
    <aside class="w-56 bg-slate-900 flex flex-col flex-shrink-0">
      <!-- Logo -->
      <div class="flex items-center gap-2.5 px-5 h-16 border-b border-slate-800">
        <div class="w-7 h-7 bg-brand-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Snowflake class="h-3.5 w-3.5 text-white" />
        </div>
        <div class="leading-none">
          <span class="text-sm font-bold text-white">FS <span class="text-brand-400">Parts</span></span>
          <p class="text-[10px] text-slate-500 mt-0.5">Panel admin</p>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-0.5">
        <p class="text-[10px] text-slate-600 font-semibold uppercase tracking-widest px-3 mb-2">Catálogo</p>
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="route.path.startsWith(item.to)
            ? 'bg-brand-700/90 text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'"
        >
          <component :is="item.icon" class="h-4 w-4 flex-shrink-0" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- Footer -->
      <div class="px-3 py-4 border-t border-slate-800 space-y-0.5">
        <div class="px-3 py-1.5 mb-1">
          <p class="text-[11px] text-slate-400 truncate">{{ authStore.user?.email }}</p>
        </div>
        <RouterLink
          to="/"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
        >
          <ExternalLink class="h-4 w-4" />
          Ver tienda
        </RouterLink>
        <button
          @click="handleSignOut"
          class="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all"
        >
          <LogOut class="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Snowflake, Package, LogOut, ExternalLink } from '@lucide/vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const authStore = useAuthStore()
const route     = useRoute()
const router    = useRouter()

const navItems = [
  { to: '/admin/products', label: 'Productos', icon: Package },
]

async function handleSignOut() {
  await authStore.signOut()
  router.push('/admin/login')
}
</script>
