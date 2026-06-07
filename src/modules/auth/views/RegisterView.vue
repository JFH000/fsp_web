<template>
  <div class="min-h-screen flex">
    <!-- Panel izquierdo (idéntico a LoginView) -->
    <div class="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle, #60a5fa 1px, transparent 1px); background-size: 32px 32px;" />
      <div class="absolute inset-0 bg-gradient-to-br from-brand-950/60 via-transparent to-slate-900/80" />

      <div class="relative z-10">
        <RouterLink to="/" class="flex items-center gap-2.5 mb-16">
          <div class="w-10 h-10 bg-brand-700 rounded-xl flex items-center justify-center shadow-lg">
            <Snowflake class="h-5 w-5 text-white" />
          </div>
          <span class="text-2xl font-bold text-white tracking-tight">
            FS <span class="text-brand-400">Parts</span>
          </span>
        </RouterLink>

        <h1 class="text-4xl font-extrabold text-white leading-tight mb-4">
          Tu distribuidor<br />
          <span class="text-brand-400">HVAC/R</span> de confianza
        </h1>
        <p class="text-slate-400 text-lg mb-12">Compresores, válvulas, refrigerantes y más.</p>

        <div class="space-y-5">
          <div v-for="b in bullets" :key="b.text" class="flex items-center gap-3">
            <div class="w-8 h-8 bg-brand-700/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <component :is="b.icon" class="h-4 w-4 text-brand-400" />
            </div>
            <span class="text-slate-300 text-sm">{{ b.text }}</span>
          </div>
        </div>
      </div>

      <p class="relative z-10 text-slate-600 text-xs">© {{ new Date().getFullYear() }} FS Parts</p>
    </div>

    <!-- Panel derecho (formulario) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
      <div class="w-full max-w-sm">
        <!-- Logo móvil -->
        <div class="flex items-center gap-2 mb-8 lg:hidden">
          <div class="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center">
            <Snowflake class="h-4 w-4 text-white" />
          </div>
          <span class="text-xl font-bold text-slate-900">FS <span class="text-brand-700">Parts</span></span>
        </div>

        <h2 class="text-2xl font-extrabold text-slate-900 mb-1">Crear cuenta</h2>
        <p class="text-slate-500 text-sm mb-8">Regístrate gratis y accede al catálogo completo</p>

        <!-- Mensajes -->
        <Transition name="fade">
          <div v-if="alert" class="mb-5 px-4 py-3 rounded-xl text-sm font-medium border"
            :class="alert.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'">
            {{ alert.msg }}
          </div>
        </Transition>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="field-label">Correo electrónico</label>
            <input v-model="email" type="email" required autocomplete="email"
              placeholder="tu@correo.com" class="field-input" />
          </div>
          <div>
            <label class="field-label">Contraseña</label>
            <div class="relative">
              <input v-model="password" :type="showPwd ? 'text' : 'password'"
                required minlength="6" autocomplete="new-password"
                placeholder="Mínimo 6 caracteres" class="field-input pr-11" />
              <button type="button" @click="showPwd = !showPwd"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <Eye v-if="!showPwd" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <label class="field-label">Confirmar contraseña</label>
            <input v-model="confirm" :type="showPwd ? 'text' : 'password'"
              required autocomplete="new-password"
              placeholder="Repite la contraseña" class="field-input" />
            <p v-if="confirm && confirm !== password" class="text-xs text-red-500 mt-1">
              Las contraseñas no coinciden
            </p>
          </div>
          <button type="submit" :disabled="loading || (!!confirm && confirm !== password)" class="submit-btn">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            <span>{{ loading ? 'Creando cuenta...' : 'Registrarse' }}</span>
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?
          <RouterLink to="/login" class="font-semibold text-brand-700 hover:text-brand-800">Inicia sesión</RouterLink>
        </p>
        <p class="mt-3 text-center">
          <RouterLink to="/" class="text-xs text-slate-400 hover:text-slate-600">← Volver al catálogo</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Snowflake, Eye, EyeOff, Loader2, Package, Calculator, Headphones } from '@lucide/vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const router    = useRouter()
const authStore = useAuthStore()

const email    = ref('')
const password = ref('')
const confirm  = ref('')
const showPwd  = ref(false)
const loading  = ref(false)
const alert    = ref<{ type: 'error' | 'success'; msg: string } | null>(null)

const bullets = [
  { icon: Package,    text: '+5,000 productos en stock' },
  { icon: Calculator, text: 'Calculadora de carga térmica gratuita' },
  { icon: Headphones, text: 'Soporte técnico especializado' },
]

async function handleRegister() {
  if (password.value !== confirm.value) return
  alert.value = null
  loading.value = true
  try {
    await authStore.signUp(email.value, password.value)
    // Esperar brevemente a que onAuthStateChange actualice el estado
    await new Promise(r => setTimeout(r, 600))
    if (authStore.isAuthenticated) {
      router.push('/onboarding')
    } else {
      alert.value = {
        type: 'success',
        msg: '¡Cuenta creada! Revisa tu correo para confirmarla y luego inicia sesión.',
      }
    }
  } catch (e: unknown) {
    alert.value = {
      type: 'error',
      msg: e instanceof Error ? e.message : 'Error al crear la cuenta',
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@reference "../../../style.css";
.field-label { @apply block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5; }
.field-input  { @apply w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all; }
.submit-btn   { @apply w-full mt-2 flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-sm active:scale-[0.99]; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
