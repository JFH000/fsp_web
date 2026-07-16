import { createRouter, createWebHistory } from 'vue-router'
import ShopLayout from '@/layouts/ShopLayout.vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useAuthModal } from '@/modules/auth/composables/useAuthModal'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ── Shop ──────────────────────────────────────────────────────
    {
      path: '/',
      component: ShopLayout,
      children: [
        { path: '',                name: 'landing',        component: () => import('@/modules/landing/views/LandingView.vue') },
        { path: 'catalog',         name: 'catalog',        component: () => import('@/modules/catalog/views/CatalogView.vue') },
        { path: 'product/:id',     name: 'product-detail', component: () => import('@/modules/catalog/views/ProductDetailView.vue') },
        { path: 'cart',            name: 'cart',           component: () => import('@/modules/cart/views/CartView.vue') },
        { path: 'checkout',        name: 'checkout',       component: () => import('@/modules/cart/views/CheckoutView.vue'), meta: { requiresUser: true } },
        { path: 'pedido-confirmado', name: 'order-confirmation', component: () => import('@/modules/orders/views/OrderConfirmationView.vue'), meta: { requiresUser: true } },
        { path: 'orders',            name: 'orders',            component: () => import('@/modules/orders/views/OrdersView.vue'), meta: { requiresUser: true } },
        { path: 'orders/:id',        name: 'order-detail',      component: () => import('@/modules/orders/views/OrderDetailView.vue'), meta: { requiresUser: true } },
        { path: 'hvac-calculator', name: 'hvac-calculator',component: () => import('@/modules/hvac/views/HvacCalculatorView.vue') },
      ],
    },

    // ── Admin panel ───────────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('@/modules/admin/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '',                  redirect: '/admin/products' },
        { path: 'products',          name: 'admin-products',    component: () => import('@/modules/admin/views/AdminProductsView.vue') },
        { path: 'products/new',      name: 'admin-product-new', component: () => import('@/modules/admin/views/AdminProductFormView.vue') },
        { path: 'products/:id/edit', name: 'admin-product-edit',component: () => import('@/modules/admin/views/AdminProductFormView.vue') },
        { path: 'catalog',           name: 'admin-catalog',     component: () => import('@/modules/admin/views/AdminCatalogView.vue') },
        { path: 'customers',         name: 'admin-customers',   component: () => import('@/modules/admin/views/AdminCustomersView.vue') },
      ],
    },
  ],

  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.isReady) await authStore.init()

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      const { open } = useAuthModal()
      open('login')
      return false
    }
    if (!authStore.isAdmin) return { name: 'landing' }
  }

  if (to.meta.requiresUser) {
    if (!authStore.isAuthenticated) {
      const { open } = useAuthModal()
      open('login')
      return false
    }
  }

  return true
})

export default router
