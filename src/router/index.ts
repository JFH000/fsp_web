import { createRouter, createWebHistory } from 'vue-router'
import ShopLayout from '@/layouts/ShopLayout.vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ── Shop ──────────────────────────────────────────────────────
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
          component: () => import('@/modules/cart/views/CartView.vue'),
        },
        {
          path: 'hvac-calculator',
          name: 'hvac-calculator',
          component: () => import('@/modules/hvac/views/HvacCalculatorView.vue'),
        },
      ],
    },

    // ── Admin auth (sin layout) ────────────────────────────────────
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/modules/auth/views/AdminLoginView.vue'),
    },

    // ── Admin panel (con layout protegido) ────────────────────────
    {
      path: '/admin',
      component: () => import('@/modules/admin/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/admin/products' },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('@/modules/admin/views/AdminProductsView.vue'),
        },
        {
          path: 'products/new',
          name: 'admin-product-new',
          component: () => import('@/modules/admin/views/AdminProductFormView.vue'),
        },
        {
          path: 'products/:id/edit',
          name: 'admin-product-edit',
          component: () => import('@/modules/admin/views/AdminProductFormView.vue'),
        },
      ],
    },
  ],

  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true
  const authStore = useAuthStore()
  if (!authStore.isReady) await authStore.init()
  if (!authStore.user) return { name: 'admin-login' }
})

export default router
