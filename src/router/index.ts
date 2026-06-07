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
        { path: '',               name: 'landing',       component: () => import('@/modules/landing/views/LandingView.vue') },
        { path: 'catalog',        name: 'catalog',       component: () => import('@/modules/catalog/views/CatalogView.vue') },
        { path: 'product/:id',    name: 'product-detail',component: () => import('@/modules/catalog/views/ProductDetailView.vue') },
        { path: 'cart',           name: 'cart',          component: () => import('@/modules/cart/views/CartView.vue') },
        { path: 'checkout',       name: 'checkout',      component: () => import('@/modules/cart/views/CartView.vue') },
        { path: 'hvac-calculator',name: 'hvac-calculator',component: () => import('@/modules/hvac/views/HvacCalculatorView.vue') },
      ],
    },

    // ── Auth público (redirige a /me si ya autenticado) ───────────
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/views/LoginView.vue'),
      meta: { publicOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/modules/auth/views/RegisterView.vue'),
      meta: { publicOnly: true },
    },

    // ── Auth privado ──────────────────────────────────────────────
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/modules/auth/views/OnboardingView.vue'),
      meta: { requiresUser: true },
    },
    {
      path: '/me',
      name: 'profile',
      component: () => import('@/modules/auth/views/ProfileView.vue'),
      meta: { requiresUser: true },
    },

    // ── Admin panel ───────────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('@/modules/admin/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '',               redirect: '/admin/products' },
        { path: 'products',       name: 'admin-products',    component: () => import('@/modules/admin/views/AdminProductsView.vue') },
        { path: 'products/new',   name: 'admin-product-new', component: () => import('@/modules/admin/views/AdminProductFormView.vue') },
        { path: 'products/:id/edit', name: 'admin-product-edit', component: () => import('@/modules/admin/views/AdminProductFormView.vue') },
        { path: 'catalog',        name: 'admin-catalog',     component: () => import('@/modules/admin/views/AdminCatalogView.vue') },
        { path: 'settings',       name: 'admin-settings',    component: () => import('@/modules/admin/views/AdminSettingsView.vue') },
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

  // Rutas solo para no autenticados (/login, /register)
  if (to.meta.publicOnly && authStore.isAuthenticated) {
    return { name: 'profile' }
  }

  // Rutas que requieren estar autenticado (/me, /onboarding)
  if (to.meta.requiresUser && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  // Rutas de admin (requieren rol admin)
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) return { name: 'login' }
    if (!authStore.isAdmin)         return { name: 'landing' }
  }

  return true
})

export default router
