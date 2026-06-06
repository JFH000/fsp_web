<template>
  <div class="fixed inset-0 flex bg-slate-100">
    <!-- Sidebar -->
    <aside
      :class="collapsed ? 'w-14' : 'w-56'"
      class="bg-slate-900 flex flex-col flex-shrink-0 transition-all duration-200 overflow-hidden"
    >
      <!-- Logo + toggle -->
      <div class="flex items-center h-16 border-b border-slate-800 flex-shrink-0"
           :class="collapsed ? 'justify-center px-2' : 'gap-2.5 px-4'">
        <img src="/logo.png" alt="FS Parts" :class="collapsed ? 'h-8 w-auto' : 'h-9 w-auto'" class="rounded flex-shrink-0 bg-white p-0.5" />
        <div v-if="!collapsed" class="leading-none flex-1 min-w-0">
          <p class="text-[10px] text-slate-500">Panel admin</p>
        </div>
        <button
          v-if="!collapsed"
          @click="collapsed = true"
          class="flex-shrink-0 p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <PanelLeftClose class="h-4 w-4" />
        </button>
      </div>

      <!-- Toggle button when collapsed -->
      <button
        v-if="collapsed"
        @click="collapsed = false"
        class="flex items-center justify-center h-10 mx-2 mt-3 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <PanelLeftOpen class="h-4 w-4" />
      </button>

      <!-- Nav -->
      <nav class="flex-1 px-2 py-4 space-y-0.5">
        <p
          v-if="!collapsed"
          class="text-[10px] text-slate-600 font-semibold uppercase tracking-widest px-3 mb-2"
        >Catálogo</p>
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :title="collapsed ? item.label : undefined"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="[
            route.path.startsWith(item.to)
              ? 'bg-brand-700/90 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800',
            collapsed ? 'justify-center' : '',
          ]"
        >
          <component :is="item.icon" class="h-4 w-4 flex-shrink-0" />
          <span v-if="!collapsed">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Footer -->
      <div class="px-2 py-4 border-t border-slate-800 space-y-0.5">
        <div v-if="!collapsed" class="px-3 py-1.5 mb-1">
          <p class="text-[11px] text-slate-400 truncate">{{ authStore.user?.email }}</p>
        </div>
        <RouterLink
          to="/"
          :title="collapsed ? 'Ver tienda' : undefined"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
          :class="collapsed ? 'justify-center' : ''"
        >
          <ExternalLink class="h-4 w-4" />
          <span v-if="!collapsed">Ver tienda</span>
        </RouterLink>
        <button
          @click="handleSignOut"
          :title="collapsed ? 'Cerrar sesión' : undefined"
          class="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all"
          :class="collapsed ? 'justify-center' : ''"
        >
          <LogOut class="h-4 w-4" />
          <span v-if="!collapsed">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Package, Layers, Settings, LogOut, ExternalLink, PanelLeftClose, PanelLeftOpen } from '@lucide/vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const authStore = useAuthStore()
const route     = useRoute()
const router    = useRouter()

const collapsed = ref(false)

const navItems = [
  { to: '/admin/products', label: 'Productos',     icon: Package  },
  { to: '/admin/catalog',  label: 'Catálogo',      icon: Layers   },
  { to: '/admin/settings', label: 'CSV',           icon: Settings },
]

async function handleSignOut() {
  await authStore.signOut()
  router.push('/admin/login')
}
</script>
