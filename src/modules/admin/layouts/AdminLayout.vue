<template>
  <div class="fixed inset-0 bg-slate-100">

    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 h-12 flex items-center justify-between pl-20 pr-4 z-40">
      <span class="text-xs font-semibold tracking-widest text-slate-400 uppercase select-none">FS Parts Dashboard</span>
      <ProfileDropdown />
    </header>

    <!-- Floating sidebar -->
    <nav class="fixed left-3 top-1/2 -translate-y-1/2 z-40 bg-slate-900 rounded-2xl shadow-2xl p-2 flex flex-col gap-0.5">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="relative group flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
        :class="route.path.startsWith(item.to)
          ? 'bg-brand-700 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'"
      >
        <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
        <span class="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {{ item.label }}
        </span>
      </RouterLink>

      <div class="my-1 h-px bg-slate-800" />

      <RouterLink
        to="/"
        class="relative group flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <ExternalLink class="h-5 w-5 flex-shrink-0" />
        <span class="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          Ver tienda
        </span>
      </RouterLink>
    </nav>

    <!-- Main content -->
    <main class="h-full overflow-y-auto pl-20 pt-12">
      <RouterView />
    </main>

  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Package, Layers, Settings, ExternalLink } from '@lucide/vue'
import ProfileDropdown from '@/modules/auth/components/ProfileDropdown.vue'

const route = useRoute()

const navItems = [
  { to: '/admin/products', label: 'Productos', icon: Package  },
  { to: '/admin/catalog',  label: 'Catálogo',  icon: Layers   },
  { to: '/admin/settings', label: 'CSV',        icon: Settings },
]
</script>
