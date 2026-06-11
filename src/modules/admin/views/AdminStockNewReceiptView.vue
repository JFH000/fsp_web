<template>
  <div class="max-w-3xl mx-auto px-8 py-8">

    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <RouterLink to="/admin/stock" class="hover:text-slate-600 transition-colors">Stock</RouterLink>
        <ChevronRight class="h-3 w-3" />
        <span class="text-slate-600">Nuevo ingreso</span>
      </div>
      <h1 class="text-2xl font-bold text-slate-900">Nuevo ingreso por lote</h1>
    </div>

    <!-- Page error -->
    <div v-if="pageError" class="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
      {{ pageError }}
    </div>

    <!-- Cabecera -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
      <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Cabecera del ingreso</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="field-label">Referencia / Factura *</label>
          <input v-model="form.reference" type="text" class="field-input" placeholder="FAC-2026-001" />
        </div>
        <div>
          <label class="field-label">Proveedor</label>
          <input v-model="form.supplier" type="text" class="field-input" placeholder="Danfoss Colombia" />
        </div>
        <div class="col-span-2">
          <label class="field-label">Notas</label>
          <input v-model="form.notes" type="text" class="field-input" placeholder="Opcional…" />
        </div>
      </div>
    </div>

    <!-- Líneas de producto -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Líneas de producto</h2>
        <button
          @click="showPicker = true"
          class="flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors"
        >
          <Plus class="h-4 w-4" />
          Agregar producto
        </button>
      </div>
      <div v-if="allProductsError" class="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{{ allProductsError }}</div>

      <!-- Product picker combobox -->
      <div v-if="showPicker" class="mb-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            ref="pickerInput"
            v-model="pickerQuery"
            type="text"
            placeholder="Buscar por nombre o SKU…"
            class="w-full pl-9 pr-4 py-2.5 border border-brand-400 rounded-xl text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div v-if="pickerResults.length" class="mt-1 border border-slate-200 rounded-xl overflow-hidden shadow-lg max-h-52 overflow-y-auto">
          <button
            v-for="p in pickerResults"
            :key="p.id"
            @click="addLine(p)"
            class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
          >
            <div>
              <div class="text-sm font-semibold text-slate-900">{{ p.name }}</div>
              <div class="text-xs text-slate-400 font-mono">{{ p.sku }}</div>
            </div>
            <div class="text-xs text-slate-400 ml-4">Stock: {{ p.stock }}</div>
          </button>
        </div>
        <p v-else-if="pickerQuery.length > 1" class="mt-2 text-xs text-slate-400 px-1">Sin resultados</p>
        <button @click="showPicker = false; pickerQuery = ''" class="mt-2 text-xs text-slate-400 hover:text-slate-600">Cancelar</button>
      </div>

      <!-- Line items table -->
      <template v-if="lines.length">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="text-left pb-2 text-xs font-semibold text-slate-400">Producto</th>
              <th class="text-center pb-2 px-3 text-xs font-semibold text-slate-400 w-24">Cantidad</th>
              <th class="text-center pb-2 px-3 text-xs font-semibold text-slate-400 w-32">Costo/und</th>
              <th class="pb-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in lines" :key="line.product_id" class="border-b border-slate-50 last:border-0">
              <td class="py-3 pr-3">
                <div class="text-sm font-semibold text-slate-900">{{ line.name }}</div>
                <div class="text-xs text-slate-400 font-mono">{{ line.sku }}</div>
              </td>
              <td class="py-3 px-3 text-center">
                <input
                  v-model.number="line.quantity"
                  type="number"
                  min="1"
                  class="w-20 text-center border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </td>
              <td class="py-3 px-3 text-center">
                <div class="relative">
                  <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                  <input
                    v-model.number="line.cost_per_unit"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="—"
                    class="w-full pl-6 text-center border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </td>
              <td class="py-3 pl-2">
                <button @click="removeLine(line.product_id)" class="text-slate-300 hover:text-red-500 transition-colors">
                  <X class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Summary -->
        <div class="mt-4 px-4 py-3 bg-slate-50 rounded-xl flex items-center justify-between">
          <div class="text-xs text-slate-500">
            {{ lines.length }} {{ lines.length === 1 ? 'referencia' : 'referencias' }} ·
            {{ totalUnits }} {{ totalUnits === 1 ? 'unidad' : 'unidades' }}
          </div>
          <div class="text-sm font-bold text-slate-900">
            Total: ${{ totalCost.toLocaleString('es-CO') }}
          </div>
        </div>
      </template>
      <p v-else class="text-sm text-slate-400 py-2">Agrega al menos un producto para continuar.</p>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between">
      <RouterLink to="/admin/stock" class="text-sm text-slate-500 hover:text-slate-700 transition-colors">
        ← Cancelar
      </RouterLink>
      <button
        @click="handleSubmit"
        :disabled="isSaving || !canSubmit"
        class="flex items-center gap-2 px-6 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
      >
        <Loader2 v-if="isSaving" class="h-4 w-4 animate-spin" />
        Confirmar ingreso
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { Plus, Search, X, ChevronRight, Loader2 } from '@lucide/vue'
import { listProductsWithStock, createReceipt, type ProductStockRow } from '@/modules/admin/services/stock.service'

const router = useRouter()

// ── Form state ────────────────────────────────────────────────────────────────
const form = reactive({ reference: '', supplier: '', notes: '' })

interface LineItem {
  product_id:    string
  name:          string
  sku:           string
  quantity:      number
  cost_per_unit: number | null
}

const lines     = ref<LineItem[]>([])
const pageError = ref('')
const isSaving  = ref(false)

const totalUnits = computed(() => lines.value.reduce((s, l) => s + (l.quantity || 0), 0))
const totalCost  = computed(() => lines.value.reduce((s, l) => s + (l.quantity || 0) * (l.cost_per_unit || 0), 0))
const canSubmit  = computed(() => form.reference.trim() && lines.value.length > 0 && lines.value.every(l => l.quantity >= 1))

// ── Product picker ────────────────────────────────────────────────────────────
const showPicker      = ref(false)
const pickerQuery     = ref('')
const pickerInput     = ref<HTMLInputElement | null>(null)
const allProducts     = ref<ProductStockRow[]>([])
const allProductsError = ref<string | null>(null)

// Load product catalogue once
;(async () => {
  try { allProducts.value = await listProductsWithStock() } catch (err) {
    allProductsError.value = (err as Error).message ?? 'Error al cargar productos'
  }
})()

// Auto-focus input when picker opens
watch(showPicker, async (v) => {
  if (v) { await nextTick(); pickerInput.value?.focus() }
})

const pickerResults = computed(() => {
  if (pickerQuery.value.length < 2) return []
  const q   = pickerQuery.value.toLowerCase()
  const ids = new Set(lines.value.map(l => l.product_id))
  return allProducts.value
    .filter(p => !ids.has(p.id) && (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)))
    .slice(0, 8)
})

function addLine(p: ProductStockRow) {
  lines.value.push({ product_id: p.id, name: p.name, sku: p.sku, quantity: 1, cost_per_unit: null })
  showPicker.value = false
  pickerQuery.value = ''
}

function removeLine(productId: string) {
  lines.value = lines.value.filter(l => l.product_id !== productId)
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function handleSubmit() {
  pageError.value = ''
  if (!form.reference.trim()) { pageError.value = 'La referencia es obligatoria.'; return }
  if (!lines.value.length)    { pageError.value = 'Agrega al menos un producto.'; return }
  if (lines.value.some(l => !l.quantity || l.quantity < 1)) {
    pageError.value = 'Todas las líneas deben tener cantidad ≥ 1.'
    return
  }

  isSaving.value = true
  try {
    await createReceipt({
      reference: form.reference.trim(),
      supplier:  form.supplier.trim(),
      notes:     form.notes.trim(),
      lines:     lines.value.map(l => ({
        product_id:    l.product_id,
        quantity:      l.quantity,
        cost_per_unit: l.cost_per_unit,
      })),
    })
    router.push('/admin/stock')
  } catch (e: unknown) {
    pageError.value = e instanceof Error ? e.message : 'Error al guardar el ingreso'
  } finally {
    isSaving.value = false
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
