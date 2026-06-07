<template>
  <Analytics />
  <SpeedInsights />
  <RouterView />
  <AuthModal />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { useCatalogStore } from '@/modules/catalog/stores/catalog.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import AuthModal from '@/modules/auth/components/AuthModal.vue'

const catalogStore = useCatalogStore()
const authStore    = useAuthStore()

onMounted(() => {
  catalogStore.initialize()
  authStore.init()
})
</script>
