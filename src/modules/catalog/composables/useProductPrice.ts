import { computed, ref, type Ref, type ComputedRef } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import type { Product } from '@/shared/types'

export interface PriceResult {
  effectivePrice: ComputedRef<number | null>
  basePrice:      ComputedRef<number | null>
  isDiscounted:   ComputedRef<boolean>
  tierLabel:      ComputedRef<string | null>
  bulkPrice:      ComputedRef<number | null>
  bulkThreshold:  ComputedRef<number>
}

export function useProductPrice(
  product: Ref<Product | null | undefined>,
  qty: Ref<number> = ref(1),
): PriceResult {
  const auth = useAuthStore()

  const resolved = computed(() => {
    const p = product.value
    if (!p) {
      return { effectivePrice: null, basePrice: null, isDiscounted: false, tierLabel: null, bulkPrice: null }
    }

    const base = p.priceCop ?? p.priceUsd ?? null
    const role = auth.profile?.role
    const q    = qty.value

    if (role === 'customer_ws1') {
      const ws1       = p.priceWs1 ?? base
      const ws2       = p.priceWs2 ?? null
      const effective = q >= 10 ? (ws2 ?? ws1) : ws1
      return {
        effectivePrice: effective,
        basePrice:      effective !== null && base !== null && effective < base ? base : null,
        isDiscounted:   effective !== null && base !== null && effective < base,
        tierLabel:      p.priceWs1 != null ? (q >= 10 ? 'WS2 ×10' : 'WS1') : null,
        bulkPrice:      q < 10 ? ws2 : null,
      }
    }

    if (role === 'customer_ws3') {
      const ws3       = p.priceWs3 ?? base
      const ws4       = p.priceWs4 ?? null
      const effective = q >= 10 ? (ws4 ?? ws3) : ws3
      return {
        effectivePrice: effective,
        basePrice:      effective !== null && base !== null && effective < base ? base : null,
        isDiscounted:   effective !== null && base !== null && effective < base,
        tierLabel:      p.priceWs3 != null ? (q >= 10 ? 'OEM ×10' : 'OEM') : null,
        bulkPrice:      q < 10 ? ws4 : null,
      }
    }

    return { effectivePrice: base, basePrice: null, isDiscounted: false, tierLabel: null, bulkPrice: null }
  })

  return {
    effectivePrice: computed(() => resolved.value.effectivePrice),
    basePrice:      computed(() => resolved.value.basePrice),
    isDiscounted:   computed(() => resolved.value.isDiscounted),
    tierLabel:      computed(() => resolved.value.tierLabel),
    bulkPrice:      computed(() => resolved.value.bulkPrice),
    bulkThreshold:  computed(() => 10),
  }
}
