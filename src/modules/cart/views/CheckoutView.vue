<template>
  <div class="max-w-4xl mx-auto px-4 py-10">
    <nav class="flex items-center gap-2 text-xs text-slate-400 mb-6">
      <RouterLink to="/" class="hover:text-brand-600">Inicio</RouterLink>
      <ChevronRight class="h-3 w-3" />
      <RouterLink to="/cart" class="hover:text-brand-600">Carrito</RouterLink>
      <ChevronRight class="h-3 w-3" />
      <span class="text-slate-700 font-medium">Checkout</span>
    </nav>

    <h1 class="text-2xl font-bold text-slate-900 mb-8">Finalizar compra</h1>

    <div v-if="!cart.items.length" class="text-center py-20">
      <p class="text-slate-400 mb-4">Tu carrito está vacío.</p>
      <RouterLink to="/catalog" class="text-brand-700 font-semibold hover:text-brand-800">Ver catálogo</RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 class="font-bold text-slate-900 text-lg mb-5">Dirección de envío</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="field-label">Nombre completo *</label>
            <input v-model="form.name" type="text" class="field-input" placeholder="Nombre y apellido" />
          </div>
          <div>
            <label class="field-label">Teléfono *</label>
            <input v-model="form.phone" type="tel" class="field-input" placeholder="+57 300 000 0000" />
          </div>
          <div>
            <label class="field-label">Ciudad *</label>
            <input v-model="form.city" type="text" class="field-input" placeholder="Bogotá" />
          </div>
          <div class="col-span-2">
            <label class="field-label">Dirección *</label>
            <input v-model="form.address" type="text" class="field-input" placeholder="Calle 00 # 00-00" />
          </div>
          <div class="col-span-2">
            <label class="field-label">Notas (opcional)</label>
            <textarea v-model="form.notes" rows="2" class="field-input resize-none" placeholder="Referencias adicionales…" />
          </div>
        </div>
        <p v-if="formError" class="text-xs text-red-500 mt-4">{{ formError }}</p>
      </div>

      <div class="lg:col-span-1">
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-32">
          <h2 class="font-bold text-slate-900 text-lg mb-5">Resumen del pedido</h2>
          <div class="space-y-3 mb-5 pb-5 border-b border-slate-100">
            <div v-for="item in cart.items" :key="item.product.id" class="flex justify-between text-sm text-slate-600">
              <span class="truncate max-w-[160px]">{{ item.product.name }} <span class="text-slate-400">×{{ item.quantity }}</span></span>
              <span class="font-medium flex-shrink-0">{{ formatCurrency(cart.lineUnitPrice(item) * item.quantity) }}</span>
            </div>
          </div>
          <div class="flex justify-between items-center font-extrabold text-slate-900 text-xl pt-1 mb-6">
            <span>Total</span>
            <span>{{ formatCurrency(cart.subtotal) }}</span>
          </div>
          <button
            @click="handlePay"
            :disabled="paying"
            class="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-base transition-colors"
          >
            <Loader2 v-if="paying" class="h-4 w-4 animate-spin" />
            {{ paying ? 'Redirigiendo a Stripe…' : 'Pagar con Stripe →' }}
          </button>
          <p class="text-xs text-slate-400 text-center mt-3">Envío por cotizar, te contactaremos.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ChevronRight, Loader2 } from '@lucide/vue'
import { useCartStore } from '../stores/cart.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { formatCurrency } from '@/shared/utils/currency'
import { createCheckoutSession } from '../services/checkout.service'

const cart = useCartStore()
const auth = useAuthStore()

const form = reactive({ name: '', phone: '', address: '', city: '', notes: '' })
const paying    = ref(false)
const formError = ref('')

onMounted(() => {
  if (auth.profile) {
    form.name  = auth.profile.full_name ?? ''
    form.phone = auth.profile.phone ?? ''
  }
})

async function handlePay() {
  formError.value = ''
  if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
    formError.value = 'Completa todos los campos obligatorios de envío.'
    return
  }
  paying.value = true
  try {
    const { url } = await createCheckoutSession(cart.items, {
      name: form.name, phone: form.phone, address: form.address,
      city: form.city, notes: form.notes || undefined,
    })
    window.location.href = url
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Error al iniciar el pago'
    paying.value = false
  }
}
</script>

<style scoped>
@reference "../../../style.css";

.field-label {
  @apply block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5;
}
.field-input {
  @apply w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300
         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all;
}
</style>
