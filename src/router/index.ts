import { createRouter, createWebHistory } from 'vue-router'
import ShopLayout from '@/layouts/ShopLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: ShopLayout,
      children: [
        {
          path: '',
          name: 'landing',
          component: () => import('@/modules/landing/views/LandingView.vue'),
        },
        {
          path: 'catalog',
          name: 'catalog',
          component: () => import('@/modules/catalog/views/CatalogView.vue'),
        },
        {
          path: 'product/:id',
          name: 'product-detail',
          component: () => import('@/modules/catalog/views/ProductDetailView.vue'),
        },
        {
          path: 'cart',
          name: 'cart',
          component: () => import('@/modules/cart/views/CartView.vue'),
        },
        {
          path: 'checkout',
          name: 'checkout',
          component: () => import('@/modules/cart/views/CartView.vue'), // placeholder
        },
        {
          path: 'hvac-calculator',
          name: 'hvac-calculator',
          component: () => import('@/modules/catalog/views/CatalogView.vue'), // placeholder
        },
      ],
    },
    // Admin (will have its own layout + auth guard in future iterations)
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/modules/catalog/views/CatalogView.vue'), // placeholder
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

export default router
