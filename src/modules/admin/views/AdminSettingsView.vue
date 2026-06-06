<template>
  <div class="max-w-2xl mx-auto px-8 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">Catálogo CSV</h1>
      <p class="text-sm text-slate-500 mt-1">Exporta e importa productos. Las imágenes se gestionan desde el panel de productos.</p>
    </div>

    <!-- Export -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
      <div class="flex items-start gap-4 mb-5">
        <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download class="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-slate-800">Exportar</h2>
          <p class="text-xs text-slate-500 mt-0.5">Descarga todos los productos como CSV. Úsalo como base para editar e importar.</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="handleExport"
          :disabled="isExporting"
          class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Loader2 v-if="isExporting" class="h-4 w-4 animate-spin" />
          <Download v-else class="h-4 w-4" />
          {{ isExporting ? 'Generando…' : 'Descargar CSV' }}
        </button>
        <p v-if="exportCount !== null" class="text-xs text-slate-500">{{ exportCount }} productos exportados</p>
      </div>
      <p v-if="exportError" class="mt-3 text-xs text-red-600">{{ exportError }}</p>
    </div>

    <!-- Import -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6">
      <div class="flex items-start gap-4 mb-5">
        <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Upload class="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-slate-800">Importar</h2>
          <p class="text-xs text-slate-500 mt-0.5">
            El CSV es la fuente de verdad: los productos que no estén en el archivo serán <strong>eliminados</strong> de la base de datos.
          </p>
        </div>
      </div>

      <!-- Drop zone -->
      <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="fileInput?.click()"
        class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4"
        :class="isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'"
      >
        <input ref="fileInput" type="file" accept=".csv,text/csv" class="hidden" @change="onFileChange" />
        <FileSpreadsheet class="h-8 w-8 mx-auto mb-2" :class="isDragging ? 'text-brand-500' : 'text-slate-300'" />
        <template v-if="!csvFile">
          <p class="text-sm font-medium text-slate-600">Arrastra un CSV aquí o haz clic para seleccionar</p>
          <p class="text-xs text-slate-400 mt-1">Solo archivos .csv</p>
        </template>
        <template v-else>
          <p class="text-sm font-semibold text-slate-800">{{ csvFile.name }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ parsedRowCount }} filas detectadas · haz clic para cambiar</p>
        </template>
      </div>

      <!-- Warning + Import button -->
      <div v-if="csvFile" class="space-y-3">
        <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <TriangleAlert class="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p class="text-xs text-amber-700">
            Esta acción <strong>elimina permanentemente</strong> los productos que no aparezcan en el CSV. Las imágenes de los productos eliminados no se borran del storage.
          </p>
        </div>
        <button
          @click="handleImport"
          :disabled="isImporting"
          class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
        >
          <Loader2 v-if="isImporting" class="h-4 w-4 animate-spin" />
          <Upload v-else class="h-4 w-4" />
          {{ isImporting ? 'Importando…' : 'Importar y aplicar' }}
        </button>
      </div>

      <!-- Result -->
      <div v-if="importResult" class="mt-4 space-y-2">
        <div class="rounded-xl p-4 text-sm" :class="importResult.failed > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'">
          <div class="flex flex-wrap gap-x-4 gap-y-1 font-semibold" :class="importResult.failed > 0 ? 'text-amber-800' : 'text-emerald-800'">
            <span>{{ importResult.inserted }} añadidos</span>
            <span>{{ importResult.updated }} actualizados</span>
            <span>{{ importResult.deleted }} eliminados</span>
            <span v-if="importResult.failed">{{ importResult.failed }} fallidos</span>
          </div>
          <p class="text-xs mt-1" :class="importResult.failed > 0 ? 'text-amber-600' : 'text-emerald-600'">
            {{ importResult.total }} filas procesadas en total
          </p>
          <ul v-if="importResult.errors.length" class="text-xs text-amber-700 space-y-0.5 mt-2">
            <li v-for="err in importResult.errors.slice(0, 10)" :key="err">• {{ err }}</li>
            <li v-if="importResult.errors.length > 10" class="text-slate-400">y {{ importResult.errors.length - 10 }} más…</li>
          </ul>
        </div>
        <div v-if="importResult.autoCreated?.length" class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
          <p class="font-semibold text-blue-800 mb-1.5">Creados automáticamente</p>
          <ul class="text-xs text-blue-700 space-y-0.5">
            <li v-for="item in importResult.autoCreated" :key="item">• {{ item }}</li>
          </ul>
        </div>
      </div>

      <p v-if="importError" class="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{{ importError }}</p>
    </div>

    <!-- Column reference -->
    <div class="bg-slate-50 rounded-2xl border border-slate-100 p-6 mt-5">
      <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Columnas del CSV</h3>
      <div class="grid grid-cols-2 gap-x-6 gap-y-1.5">
        <div v-for="col in COLUMNS" :key="col.name" class="flex items-baseline gap-2">
          <code class="text-xs font-mono text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">{{ col.name }}</code>
          <span class="text-xs text-slate-500">{{ col.desc }}</span>
        </div>
      </div>
      <p class="text-xs text-slate-400 mt-4">La primera fila debe ser el encabezado. <code class="font-mono">sku</code> es obligatorio y es la clave de upsert.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download, Upload, Loader2, FileSpreadsheet, TriangleAlert } from '@lucide/vue'
import { exportAllProducts, importCsv, type ImportResult } from '@/modules/admin/services/admin.service'

// ── Export ────────────────────────────────────────────────────────────────────
const isExporting = ref(false)
const exportCount = ref<number | null>(null)
const exportError = ref('')

const COLUMNS = [
  { name: 'sku',          desc: 'Obligatorio · clave única' },
  { name: 'name',         desc: 'Nombre del producto' },
  { name: 'description',  desc: 'Descripción' },
  { name: 'slug',         desc: 'URL (auto si vacío)' },
  { name: 'brand',        desc: 'Nombre de marca' },
  { name: 'category',     desc: 'Slug de categoría' },
  { name: 'product_line', desc: 'Código de línea' },
  { name: 'price_usd',    desc: 'Precio USD' },
  { name: 'price_cop',    desc: 'Precio COP' },
  { name: 'price_ws1',    desc: 'WS1' },
  { name: 'price_ws2',    desc: 'WS2' },
  { name: 'price_ws3',    desc: 'WS3' },
  { name: 'price_ws4',    desc: 'WS4' },
  { name: 'stock',        desc: 'Unidades' },
  { name: 'is_featured',  desc: 'true / false' },
  { name: 'is_new',       desc: 'true / false' },
]

async function handleExport() {
  isExporting.value = true
  exportError.value = ''
  exportCount.value = null
  try {
    const rows = await exportAllProducts()
    exportCount.value = rows.length

    const cols = COLUMNS.map(c => c.name) as (keyof typeof rows[0])[]
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [cols.join(','), ...rows.map(r => cols.map(c => escape(r[c])).join(','))]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `fsp-products-${new Date().toISOString().slice(0, 10)}.csv` })
    a.click()
    URL.revokeObjectURL(url)
  } catch (e: unknown) {
    exportError.value = e instanceof Error ? e.message : 'Error al exportar'
  } finally {
    isExporting.value = false
  }
}

// ── Import ────────────────────────────────────────────────────────────────────
const fileInput    = ref<HTMLInputElement | null>(null)
const csvFile      = ref<File | null>(null)
const csvContent   = ref('')
const parsedRowCount = ref(0)
const isDragging   = ref(false)
const isImporting  = ref(false)
const importResult = ref<ImportResult | null>(null)
const importError  = ref('')

function readFile(file: File) {
  if (!file.name.endsWith('.csv') && file.type !== 'text/csv') return
  csvFile.value = file
  importResult.value = null
  importError.value  = ''
  const reader = new FileReader()
  reader.onload = ev => {
    const text = (ev.target?.result as string) ?? ''
    csvContent.value = text
    parsedRowCount.value = text.split('\n').slice(1).filter(l => l.trim()).length
  }
  reader.readAsText(file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) readFile(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) readFile(file)
}

async function handleImport() {
  if (!csvContent.value) return
  isImporting.value = true
  importResult.value = null
  importError.value  = ''
  try {
    importResult.value = await importCsv(csvContent.value)
  } catch (e: unknown) {
    importError.value = e instanceof Error ? e.message : 'Error desconocido'
  } finally {
    isImporting.value = false
  }
}
</script>
