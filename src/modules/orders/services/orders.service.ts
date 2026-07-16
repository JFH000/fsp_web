import { supabase } from '@/core/supabase/client'
import type { Order } from '@/shared/types'

function getSb() {
  if (!supabase) throw new Error('Supabase no configurado')
  return supabase
}

export async function fetchOrderBySessionId(sessionId: string): Promise<Order | null> {
  const { data, error } = await getSb()
    .from('orders')
    .select('*')
    .eq('stripe_checkout_session_id', sessionId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as Order | null
}
