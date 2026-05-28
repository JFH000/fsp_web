<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Dot grid -->
    <div
      class="absolute inset-0 opacity-10"
      style="background-image: radial-gradient(circle, #60a5fa 1px, transparent 1px); background-size: 32px 32px;"
    />
    <div class="absolute inset-0 bg-gradient-to-br from-brand-950/60 via-transparent to-slate-900/80" />

    <div class="relative z-10 w-full max-w-sm">
      <!-- Logo -->
      <div class="flex items-center justify-center gap-2.5 mb-8">
        <div class="w-10 h-10 bg-brand-700 rounded-xl flex items-center justify-center shadow-lg">
          <Snowflake class="h-5 w-5 text-white" />
        </div>
        <span class="text-2xl font-bold text-white tracking-tight">
          FS <span class="text-brand-400">Parts</span>
        </span>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <!-- Tabs -->
        <div class="flex border-b border-slate-100">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="switchTab(tab.id)"
            class="flex-1 py-3.5 text-sm font-semibold transition-all duration-200"
            :class="activeTab === tab.id
              ? 'text-brand-700 bg-brand-50/60 border-b-2 border-brand-700'
              : 'text-slate-400 hover:text-slate-600'"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="p-7">
          <!-- Alert -->
          <transition name="fade">
            <div
              v-if="alert"
              class="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              :class="alert.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
            >
              {{ alert.msg }}
            </div>
          </transition>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                placeholder="tu@correo.com"
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPwd ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  @click="showPwd = !showPwd"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Eye v-if="!showPwd" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full mt-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
              <span>{{ activeTab === 'login' ? 'Entrar al panel' : 'Crear cuenta' }}</span>
            </button>
          </form>
        </div>
      </div>

      <p class="text-center text-slate-600 text-xs mt-6">
        <RouterLink to="/" class="hover:text-slate-400 transition-colors">
          ← Volver a la tienda
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Snowflake, Eye, EyeOff, Loader2 } from '@lucide/vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const router    = useRouter()
const authStore = useAuthStore()

type TabId = 'login' | 'signup'
const tabs = [
  { id: 'login' as TabId,  label: 'Iniciar sesión' },
  { id: 'signup' as TabId, label: 'Crear cuenta' },
]
const activeTab = ref<TabId>('login')
const form      = reactive({ email: '', password: '' })
const showPwd   = ref(false)
const loading   = ref(false)
const alert     = ref<{ type: 'error' | 'success'; msg: string } | null>(null)

function switchTab(id: TabId) {
  activeTab.value = id
  alert.value = null
}

async function handleSubmit() {
  alert.value = null
  loading.value = true
  try {
    if (activeTab.value === 'login') {
      await authStore.signIn(form.email, form.password)
      router.push('/admin/products')
    } else {
      await authStore.signUp(form.email, form.password)
      alert.value = { type: 'success', msg: 'Cuenta creada. Revisa tu correo para confirmarla.' }
    }
  } catch (e: unknown) {
    alert.value = { type: 'error', msg: e instanceof Error ? e.message : 'Ocurrió un error' }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
