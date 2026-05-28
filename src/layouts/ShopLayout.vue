<template>
  <div class="min-h-screen flex flex-col">
    <TheNavbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <TheFooter />
    <CartDrawer />
  </div>
</template>

<script setup lang="ts">
import TheNavbar from '@/modules/shop/components/TheNavbar.vue'
import TheFooter from '@/modules/shop/components/TheFooter.vue'
import CartDrawer from '@/modules/cart/components/CartDrawer.vue'
</script>
