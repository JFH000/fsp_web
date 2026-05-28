<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCatalogStore } from '@/modules/catalog/stores/catalog.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const catalogStore = useCatalogStore()
const authStore    = useAuthStore()

onMounted(() => {
  catalogStore.initialize()
  authStore.init()
})
</script>
