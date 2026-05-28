<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
      <button @click="openCreate" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
        + Nuevo producto
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Producto</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Categoría</th>
            <th class="text-right px-4 py-3 font-semibold text-gray-600">Precio</th>
            <th class="text-right px-4 py-3 font-semibold text-gray-600">Stock</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="product in store.products" :key="product.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-900">{{ product.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ product.category }}</td>
            <td class="px-4 py-3 text-right text-gray-900">${{ product.price.toFixed(2) }}</td>
            <td class="px-4 py-3 text-right" :class="product.stock > 0 ? 'text-green-600' : 'text-red-500'">{{ product.stock }}</td>
            <td class="px-4 py-3 text-right">
              <button @click="openEdit(product)" class="text-indigo-600 hover:underline mr-3">Editar</button>
              <button @click="store.deleteProduct(product.id)" class="text-red-500 hover:underline">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">{{ editing ? 'Editar producto' : 'Nuevo producto' }}</h2>
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-3">
          <input v-model="form.name" placeholder="Nombre" required class="input" />
          <input v-model="form.description" placeholder="Descripción" required class="input" />
          <input v-model.number="form.price" type="number" step="0.01" placeholder="Precio" required class="input" />
          <input v-model="form.image" placeholder="URL de imagen" class="input" />
          <input v-model="form.category" placeholder="Categoría" required class="input" />
          <input v-model.number="form.stock" type="number" placeholder="Stock" required class="input" />
          <div class="flex gap-3 mt-2">
            <button type="button" @click="showModal = false" class="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" class="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              {{ editing ? 'Guardar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useProductsStore } from '@/stores/products'
import type { Product } from '@/types'

const store = useProductsStore()
const showModal = ref(false)
const editing = ref<Product | null>(null)

const form = reactive({ name: '', description: '', price: 0, image: '', category: '', stock: 0 })

function openCreate() {
  editing.value = null
  Object.assign(form, { name: '', description: '', price: 0, image: 'https://placehold.co/400x400?text=Producto', category: '', stock: 0 })
  showModal.value = true
}

function openEdit(product: Product) {
  editing.value = product
  Object.assign(form, { ...product })
  showModal.value = true
}

function handleSubmit() {
  if (editing.value) {
    store.updateProduct({ ...editing.value, ...form })
  } else {
    store.addProduct({ ...form })
  }
  showModal.value = false
}
</script>

<style scoped>
.input {
  @apply border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full;
}
</style>
