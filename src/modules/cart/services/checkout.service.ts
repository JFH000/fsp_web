import { supabase } from '@/core/supabase/client'
import type { CartItem } from '@/shared/types'

export type ShippingInfo = {
  name: string
  phone: string
  address: string
  city: string
  notes?: string
}

export async function createCheckoutSession(
  items: CartItem[],
  shipping: ShippingInfo,
): Promise<{ url: string }> {
  if (!supabase) throw new Error('Supabase no configurado')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No autenticado')

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
      shipping,
    },
  })
  if (error) throw new Error(error.message)
  if (!data?.url) throw new Error(data?.error ?? 'No se pudo iniciar el pago')
  return data
}
