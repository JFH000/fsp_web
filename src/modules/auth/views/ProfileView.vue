<template>
  <div class="min-h-screen flex bg-slate-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 flex flex-col flex-shrink-0">
      <!-- Logo -->
      <div class="px-6 py-5 border-b border-slate-800">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center">
            <Snowflake class="h-4 w-4 text-white" />
          </div>
          <span class="text-lg font-bold text-white">FS <span class="text-brand-400">Parts</span></span>
        </RouterLink>
      </div>

      <!-- Avatar + info -->
      <div class="px-6 py-6 border-b border-slate-800">
        <div class="w-14 h-14 bg-brand-700 rounded-full flex items-center justify-center text-white text-xl font-extrabold mb-3">
          {{ initials }}
        </div>
        <p class="text-white font-semibold text-sm leading-tight truncate">
          {{ authStore.profile?.full_name || authStore.user?.email || 'Usuario' }}
        </p>
        <p class="text-slate-400 text-xs mt-0.5 truncate">{{ authStore.user?.email }}</p>
        <span class="inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full" :class="roleBadge">
          {{ roleLabel }}
        </span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        <RouterLink to="/catalog" class="nav-link">
          <Package class="h-4 w-4" /> Ver catálogo
        </RouterLink>
        <RouterLink to="/hvac-calculator" class="nav-link">
          <Calculator class="h-4 w-4" /> Calculadora HVAC
        </RouterLink>
      </nav>

      <!-- Admin button -->
      <div v-if="authStore.isAdmin" class="px-3 pb-3">
        <RouterLink to="/admin/products"
          class="flex items-center gap-2 w-full bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]">
          <ShieldCheck class="h-4 w-4" /> Panel Admin
        </RouterLink>
      </div>

      <!-- Sign out -->
      <div class="px-3 pb-4">
        <button @click="handleSignOut"
          class="flex items-center gap-2 w-full text-red-400 hover:text-red-300 hover:bg-red-950/30 text-sm font-medium px-4 py-2.5 rounded-xl transition-all">
          <LogOut class="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Contenido principal -->
    <main class="flex-1 p-8 overflow-auto">
      <div class="max-w-lg">
        <h1 class="text-2xl font-extrabold text-slate-900 mb-1">Mi perfil</h1>
        <p class="text-slate-500 text-sm mb-8">Gestiona tu información personal</p>

        <!-- Success message -->
        <Transition name="fade">
          <div v-if="saved" class="mb-6 px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium">
            Perfil actualizado correctamente
          </div>
        </Transition>

        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-bold text-slate-900">Información personal</h2>
            <button v-if="!editing" @click="startEdit" class="edit-btn">
              <Pencil class="h-3.5 w-3.5" /> Editar
            </button>
          </div>

          <div class="space-y-4">
            <!-- Email (siempre readonly) -->
            <div>
              <label class="field-label">Correo electrónico</label>
              <div class="field-readonly">{{ authStore.user?.email }}</div>
            </div>

            <!-- Nombre -->
            <div>
              <label class="field-label">Nombre completo</label>
              <input v-if="editing" v-model="form.full_name" type="text" class="field-input" placeholder="Tu nombre" />
              <div v-else class="field-readonly">{{ authStore.profile?.full_name || '—' }}</div>
            </div>

            <!-- Teléfono -->
            <div>
              <label class="field-label">Teléfono</label>
              <input v-if="editing" v-model="form.phone" type="tel" class="field-input" placeholder="+57 300 000 0000" />
              <div v-else class="field-readonly">{{ authStore.profile?.phone || '—' }}</div>
            </div>

            <!-- Empresa -->
            <div>
              <label class="field-label">Empresa</label>
              <input v-if="editing" v-model="form.company" type="text" class="field-input" placeholder="Nombre de empresa" />
              <div v-else class="field-readonly">{{ authStore.profile?.company || '—' }}</div>
            </div>

            <!-- Acciones edición -->
            <div v-if="editing" class="flex gap-3 pt-2">
              <button @click="saveEdit" :disabled="saving" class="save-btn">
                <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
                <span>{{ saving ? 'Guardando...' : 'Guardar cambios' }}</span>
              </button>
              <button @click="cancelEdit" class="cancel-btn">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  Snowflake, Package, Calculator, ShieldCheck,
  LogOut, Pencil, Loader2,
} from '@lucide/vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const router    = useRouter()
const authStore = useAuthStore()

const editing = ref(false)
const saving  = ref(false)
const saved   = ref(false)
const form    = reactive({ full_name: '', phone: '', company: '' })

const initials = computed(() => {
  const name = authStore.profile?.full_name ?? authStore.user?.email ?? '?'
  return name.split(/[\s@]/).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
})

const roleBadge = computed(() => ({
  'admin':       'bg-red-900/50 text-red-300',
  'technician':  'bg-blue-900/50 text-blue-300',
  'distributor': 'bg-purple-900/50 text-purple-300',
  'customer':    'bg-slate-700 text-slate-300',
}[authStore.profile?.role ?? 'customer'] ?? 'bg-slate-700 text-slate-300'))

const roleLabel = computed(() => ({
  admin:       'Administrador',
  technician:  'Técnico',
  distributor: 'Distribuidor',
  customer:    'Cliente',
}[authStore.profile?.role ?? 'customer'] ?? 'Cliente'))

function startEdit() {
  form.full_name = authStore.profile?.full_name ?? ''
  form.phone    = authStore.profile?.phone    ?? ''
  form.company  = authStore.profile?.company  ?? ''
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function saveEdit() {
  saving.value = true
  try {
    await authStore.updateProfile({
      full_name: form.full_name || undefined,
      phone:    form.phone    || undefined,
      company:  form.company  || undefined,
    })
    editing.value = false
    saved.value   = true
    setTimeout(() => (saved.value = false), 3000)
  } finally {
    saving.value = false
  }
}

async function handleSignOut() {
  await authStore.signOut()
  router.push('/login')
}
</script>

<style scoped>
@reference "../../../style.css";
.nav-link      { @apply flex items-center gap-2.5 text-slate-400 hover:text-white hover:bg-slate-800 text-sm px-3 py-2 rounded-lg transition-all; }
.field-label   { @apply block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5; }
.field-input   { @apply w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all; }
.field-readonly{ @apply text-sm text-slate-900 py-2.5 px-0; }
.edit-btn      { @apply flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-all; }
.save-btn      { @apply flex items-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm active:scale-[0.99]; }
.cancel-btn    { @apply text-sm text-slate-500 hover:text-slate-700 font-medium px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
