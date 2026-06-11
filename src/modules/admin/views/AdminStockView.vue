<template>
  <div class="max-w-6xl mx-auto px-8 py-8">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Stock</h1>
        <p class="text-sm text-slate-400 mt-0.5">
          {{ rows.length }} productos
          <span v-if="loadedAt"> · actualizado {{ timeAgo(loadedAt) }}</span>
        </p>
      </div>
      <RouterLink
        to="/admin/stock/new"
        class="flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
      >
        <Plus class="h-4 w-4" />
        Nuevo ingreso por lote
      </RouterLink>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{{ error }}</div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <Loader2 class="h-7 w-7 text-brand-600 animate-spin" />
    </div>

    <template v-else>
      <!-- Filter bar -->
      <div class="flex items-center gap-3 mb-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            v-model="search"
            type="text"
            placeholder="Buscar SKU o producto…"
            class="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-64"
          />
        </div>
        <div class="flex gap-2">
          <button
            v-for="f in filters"
            :key="f.key"
            @click="activeFilter = f.key"
            class="text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors"
            :class="activeFilter === f.key
              ? 'bg-brand-700 border-brand-700 text-white'
              : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-400">Producto</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-400">Línea</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-slate-400">Stock actual</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-slate-400">Ajuste rápido</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-400">Último movimiento</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in filteredRows"
              :key="row.id"
              class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
              :class="{ 'bg-amber-50 hover:bg-amber-50/80': row.stock > 0 && row.stock <= 5 }"
            >
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-900 text-sm">{{ row.name }}</div>
                <div class="text-xs text-slate-400 font-mono mt-0.5">{{ row.sku }}</div>
              </td>
              <td class="px-4 py-4">
                <span v-if="row.product_line" class="bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {{ row.product_line.code }}
                </span>
              </td>
              <td class="px-4 py-4 text-center">
                <span
                  class="text-lg font-bold"
                  :class="{
                    'text-slate-900': row.stock > 5,
                    'text-amber-600': row.stock > 0 && row.stock <= 5,
                    'text-slate-400': row.stock === 0,
                  }"
                >{{ row.stock }}</span>
                <span v-if="row.stock > 0 && row.stock <= 5" class="text-amber-500 ml-1 text-sm">⚠</span>
                <span class="text-xs text-slate-400 ml-1">uds</span>
              </td>
              <td class="px-4 py-4 text-center">
                <div class="inline-flex items-center gap-2">
                  <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      @click="adjustDeltas[row.id] = (adjustDeltas[row.id] ?? 0) - 1"
                      class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 transition-colors font-bold text-sm"
                    >−</button>
                    <input
                      :value="adjustDeltas[row.id] ?? 0"
                      @input="adjustDeltas[row.id] = parseInt(($event.target as HTMLInputElement).value) || 0"
                      type="number"
                      class="w-12 text-center border-x border-slate-200 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none"
                    />
                    <button
                      @click="adjustDeltas[row.id] = (adjustDeltas[row.id] ?? 0) + 1"
                      class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 transition-colors font-bold text-sm"
                    >+</button>
                  </div>
                  <button
                    @click="openAdjustModal(row)"
                    :disabled="!adjustDeltas[row.id]"
                    class="px-3 py-1.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
                  >✓</button>
                </div>
              </td>
              <td class="px-4 py-4">
                <template v-if="row.last_movement">
                  <div class="text-xs text-slate-600">
                    {{ row.last_movement.quantity > 0 ? '+' : '' }}{{ row.last_movement.quantity }}
                    {{ row.last_movement.type }}
                  </div>
                  <div class="text-xs text-slate-400">{{ timeAgo(row.last_movement.created_at) }}</div>
                </template>
                <span v-else class="text-xs text-slate-400">Nunca ingresado</span>
              </td>
              <td class="px-4 py-4 text-right">
                <button
                  @click="openHistorial(row)"
                  class="text-xs text-slate-400 hover:text-brand-700 transition-colors"
                >Historial →</button>
              </td>
            </tr>
            <tr v-if="!filteredRows.length">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-slate-400">
                Sin productos que coincidan
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Adjust confirmation mini-modal -->
    <Teleport to="body">
      <div v-if="adjustTarget" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="adjustTarget = null">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <h3 class="font-bold text-slate-900 mb-1">Confirmar ajuste</h3>
          <p class="text-sm text-slate-500 mb-4">
            {{ adjustTarget.name }} ·
            <span :class="(adjustDeltas[adjustTarget.id] ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'" class="font-semibold">
              {{ (adjustDeltas[adjustTarget.id] ?? 0) >= 0 ? '+' : '' }}{{ adjustDeltas[adjustTarget.id] ?? 0 }} uds
            </span>
          </p>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Motivo del ajuste *
          </label>
          <input
            v-model="adjustNotes"
            type="text"
            placeholder="p. ej. Conteo físico, daño en bodega…"
            class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent mb-4"
            @keydown.enter="confirmAdjust"
          />
          <p v-if="adjustError" class="text-xs text-red-500 mb-3">{{ adjustError }}</p>
          <div class="flex gap-3">
            <button @click="adjustTarget = null" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 transition-colors">
              Cancelar
            </button>
            <button
              @click="confirmAdjust"
              :disabled="isAdjusting || !adjustNotes.trim()"
              class="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Loader2 v-if="isAdjusting" class="h-4 w-4 animate-spin" />
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Historial slide-over -->
    <Teleport to="body">
      <div v-if="historialProduct" class="fixed inset-0 z-50" @click.self="historialProduct = null">
        <div class="absolute inset-0 bg-black/30" @click="historialProduct = null" />
        <div class="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-2xl flex flex-col">

          <!-- Panel header -->
          <div class="flex items-start justify-between p-5 border-b border-slate-100">
            <div>
              <div class="font-bold text-slate-900 text-sm">{{ historialProduct.name }}</div>
              <div class="text-xs text-slate-400 font-mono mt-0.5">{{ historialProduct.sku }}</div>
            </div>
            <div class="text-right ml-4 flex-shrink-0">
              <div class="text-2xl font-extrabold text-slate-900">{{ historialProduct.stock }}</div>
              <div class="text-xs text-slate-400">en stock</div>
            </div>
          </div>

          <!-- Movement list -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="isLoadingMovements" class="flex justify-center py-8">
              <Loader2 class="h-5 w-5 text-brand-600 animate-spin" />
            </div>
            <template v-else>
              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Historial de movimientos
              </div>
              <div class="flex flex-col gap-1.5">
                <div
                  v-for="(mv, i) in movements"
                  :key="mv.id"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  :class="mv.quantity >= 0 ? 'bg-emerald-50' : 'bg-red-50'"
                >
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    :class="mv.quantity >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
                  >
                    {{ mv.quantity >= 0 ? '+' : '' }}{{ mv.quantity }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-slate-900 text-xs">
                      {{ mv.type === 'ingreso' ? 'Ingreso' : 'Ajuste' }}
                      <span v-if="mv.receipt?.reference"> · {{ mv.receipt.reference }}</span>
                      <span v-else-if="mv.notes"> · {{ mv.notes }}</span>
                    </div>
                    <div class="text-xs text-slate-500 mt-0.5 truncate">
                      <span v-if="mv.receipt?.supplier">{{ mv.receipt.supplier }}</span>
                      <span v-if="mv.cost_per_unit"> · ${{ mv.cost_per_unit.toLocaleString('es-CO') }}/und</span>
                      <span v-if="!mv.receipt && mv.notes">{{ mv.notes }}</span>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <div class="text-xs font-semibold" :class="mv.quantity >= 0 ? 'text-emerald-600' : 'text-red-600'">
                      → {{ stockAfter(i) }}
                    </div>
                    <div class="text-xs text-slate-400">{{ timeAgo(mv.created_at) }}</div>
                  </div>
                </div>
                <div v-if="!movements.length" class="text-sm text-slate-400 py-6 text-center">
                  Sin movimientos registrados
                </div>
              </div>
            </template>
          </div>

          <button
            @click="historialProduct = null"
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus, Search, Loader2, X } from '@lucide/vue'
import {
  listProductsWithStock,
  listMovements,
  createAdjustment,
  type ProductStockRow,
  type StockMovement,
} from '@/modules/admin/services/stock.service'

// ── Data loading ──────────────────────────────────────────────────────────────
const rows      = ref<ProductStockRow[]>([])
const isLoading = ref(false)
const error     = ref('')
const loadedAt  = ref<string>('')

async function load() {
  isLoading.value = true
  error.value     = ''
  try {
    rows.value    = await listProductsWithStock()
    loadedAt.value = new Date().toISOString()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al cargar stock'
  } finally {
    isLoading.value = false
  }
}

onMounted(load)

// ── Escape key to close panels ────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (historialProduct.value) { historialProduct.value = null; return }
    if (adjustTarget.value)     { adjustTarget.value = null }
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// ── Filters ───────────────────────────────────────────────────────────────────
const search       = ref('')
const activeFilter = ref<'all' | 'low' | 'out'>('all')

const filters = [
  { key: 'all' as const, label: 'Todos'      },
  { key: 'low' as const, label: 'Stock bajo' },
  { key: 'out' as const, label: 'Sin stock'  },
]

const filteredRows = computed(() => {
  let list = rows.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(r => r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q))
  }
  if (activeFilter.value === 'low') list = list.filter(r => r.stock > 0 && r.stock <= 5)
  if (activeFilter.value === 'out') list = list.filter(r => r.stock === 0)
  return list
})

// ── Adjust widget ─────────────────────────────────────────────────────────────
const adjustDeltas: Record<string, number> = reactive({})
const adjustTarget = ref<ProductStockRow | null>(null)
const adjustNotes  = ref('')
const adjustError  = ref('')
const isAdjusting  = ref(false)

function openAdjustModal(row: ProductStockRow) {
  adjustTarget.value = row
  adjustNotes.value  = ''
  adjustError.value  = ''
}

async function confirmAdjust() {
  if (!adjustTarget.value || !adjustNotes.value.trim()) {
    adjustError.value = 'El motivo es obligatorio.'
    return
  }
  const delta = adjustDeltas[adjustTarget.value.id] ?? 0
  if (delta === 0) return
  const newStock = adjustTarget.value.stock + delta
  if (newStock < 0) {
    adjustError.value = `El stock resultante sería negativo (${newStock}). Ajusta el delta.`
    return
  }

  isAdjusting.value = true
  adjustError.value = ''
  try {
    await createAdjustment(adjustTarget.value.id, delta, adjustNotes.value.trim())
    // Optimistic local update
    const row = rows.value.find(r => r.id === adjustTarget.value!.id)
    if (row) {
      row.stock = newStock
      row.last_movement = { type: 'ajuste', quantity: delta, created_at: new Date().toISOString() }
    }
    adjustDeltas[adjustTarget.value.id] = 0
    adjustTarget.value = null
  } catch (e: unknown) {
    adjustError.value = e instanceof Error ? e.message : 'Error al guardar ajuste'
  } finally {
    isAdjusting.value = false
  }
}

// ── Historial slide-over ──────────────────────────────────────────────────────
const historialProduct    = ref<ProductStockRow | null>(null)
const movements           = ref<StockMovement[]>([])
const isLoadingMovements  = ref(false)

async function openHistorial(row: ProductStockRow) {
  historialProduct.value   = row
  isLoadingMovements.value = true
  movements.value          = []
  try {
    movements.value = await listMovements(row.id)
  } finally {
    isLoadingMovements.value = false
  }
}

// Compute stock_after for each movement (movements are newest-first from DB;
// reverse to accumulate oldest→newest, then index back)
function stockAfter(indexFromTop: number): number {
  if (!historialProduct.value) return 0
  // movements[0] is the latest; we want to show the stock resulting from each event
  // Accumulate from oldest (end of array) to newest
  const reversed = [...movements.value].reverse()
  let acc = 0
  const afterValues = reversed.map(m => { acc += m.quantity; return acc })
  afterValues.reverse()
  return afterValues[indexFromTop] ?? historialProduct.value.stock
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diffMs  = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1)   return 'ahora'
  if (minutes < 60)  return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7)      return `hace ${days} días`
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
