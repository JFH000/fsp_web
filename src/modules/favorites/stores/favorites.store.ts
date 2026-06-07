// src/modules/favorites/stores/favorites.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchFavoriteIds, insertFavorite, deleteFavorite } from '@/core/supabase/favorites.service'

export const useFavoritesStore = defineStore('favorites', () => {
  const favoriteIds = ref<Set<string>>(new Set())

  function isFavorite(productId: string): boolean {
    return favoriteIds.value.has(productId)
  }

  async function fetchFavorites(userId: string): Promise<void> {
    const ids = await fetchFavoriteIds(userId)
    favoriteIds.value = new Set(ids)
  }

  async function toggleFavorite(userId: string, productId: string): Promise<void> {
    const wasFavorite = favoriteIds.value.has(productId)

    // Optimistic update
    if (wasFavorite) {
      favoriteIds.value.delete(productId)
    } else {
      favoriteIds.value.add(productId)
    }
    // Trigger reactivity on Set mutation
    favoriteIds.value = new Set(favoriteIds.value)

    try {
      if (wasFavorite) {
        await deleteFavorite(userId, productId)
      } else {
        await insertFavorite(userId, productId)
      }
    } catch (err) {
      console.error('[favorites] toggleFavorite failed, reverting:', err)
      // Revert on error
      if (wasFavorite) {
        favoriteIds.value.add(productId)
      } else {
        favoriteIds.value.delete(productId)
      }
      favoriteIds.value = new Set(favoriteIds.value)
    }
  }

  function clearFavorites(): void {
    favoriteIds.value = new Set()
  }

  return { favoriteIds, isFavorite, fetchFavorites, toggleFavorite, clearFavorites }
})
