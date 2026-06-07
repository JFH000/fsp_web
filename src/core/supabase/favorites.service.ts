import { supabase } from './client'

export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('product_favorites')
    .select('product_id')
    .eq('user_id', userId)
  if (error) return []
  return (data ?? []).map((r: { product_id: string }) => r.product_id)
}

export async function insertFavorite(userId: string, productId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('product_favorites')
    .insert({ user_id: userId, product_id: productId })
  if (error) throw new Error(error.message)
}

export async function deleteFavorite(userId: string, productId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('product_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  if (error) throw new Error(error.message)
}
