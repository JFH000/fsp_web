import { supabase } from '@/core/supabase/client'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProductStockRow {
  id:            string
  sku:           string
  name:          string
  stock:         number
  product_line:  { id: number; code: string } | null
  last_movement: { type: string; quantity: number; created_at: string } | null
}

export interface StockMovement {
  id:            string
  product_id:    string
  receipt_id:    string | null
  quantity:      number
  cost_per_unit: number | null
  type:          'ingreso' | 'ajuste'
  notes:         string | null
  created_by:    string
  created_at:    string
  receipt:       { reference: string; supplier: string | null } | null
}

export interface CreateReceiptInput {
  reference: string
  supplier:  string
  notes:     string
  lines: Array<{
    product_id:    string
    quantity:      number
    cost_per_unit: number | null
  }>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSb() {
  if (!supabase) throw new Error('Supabase no configurado')
  return supabase
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function listProductsWithStock(): Promise<ProductStockRow[]> {
  const { data, error } = await getSb()
    .from('products')
    .select(`
      id, sku, name, stock,
      product_line:product_lines(id, code)
    `)
    .eq('is_active', true)
    .order('name')
  if (error) throw new Error(error.message)

  // Fetch last movement per product in a second query (Supabase doesn't support
  // DISTINCT ON in the JS client; a simple per-product latest-row is cleaner as
  // a separate call when the product list is not huge)
  const ids = (data ?? []).map((p: { id: string }) => p.id)
  let lastMovements: Array<{ product_id: string; type: string; quantity: number; created_at: string }> = []
  if (ids.length) {
    const { data: mv } = await getSb()
      .from('stock_movements')
      .select('product_id, type, quantity, created_at')
      .in('product_id', ids)
      .order('created_at', { ascending: false })
    // keep only the most recent per product
    const seen = new Set<string>()
    for (const m of (mv ?? [])) {
      if (!seen.has(m.product_id)) {
        seen.add(m.product_id)
        lastMovements.push(m as { product_id: string; type: string; quantity: number; created_at: string })
      }
    }
  }

  const mvMap = new Map(lastMovements.map(m => [m.product_id, m]))

  return (data ?? []).map((p: Record<string, unknown>) => ({
    id:            p.id as string,
    sku:           p.sku as string,
    name:          p.name as string,
    stock:         p.stock as number,
    product_line:  p.product_line as { id: number; code: string } | null,
    last_movement: mvMap.get(p.id as string) ?? null,
  }))
}

export async function listMovements(productId: string): Promise<StockMovement[]> {
  const { data, error } = await getSb()
    .from('stock_movements')
    .select(`
      id, product_id, receipt_id, quantity, cost_per_unit, type, notes, created_by, created_at,
      receipt:stock_receipts(reference, supplier)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as StockMovement[]
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createReceipt(input: CreateReceiptInput): Promise<void> {
  const sb = getSb()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // 1. Insert receipt header
  const { data: receipt, error: rErr } = await sb
    .from('stock_receipts')
    .insert({
      reference:  input.reference,
      supplier:   input.supplier || null,
      notes:      input.notes || null,
      created_by: user.id,
    })
    .select('id')
    .single()
  if (rErr) throw new Error(rErr.message)

  // 2. Insert all movement lines in one batch
  const movements = input.lines.map(line => ({
    product_id:    line.product_id,
    receipt_id:    (receipt as { id: string }).id,
    quantity:      line.quantity,
    cost_per_unit: line.cost_per_unit ?? null,
    type:          'ingreso' as const,
    notes:         null,
    created_by:    user.id,
  }))

  const { error: mErr } = await sb.from('stock_movements').insert(movements)
  if (mErr) throw new Error(mErr.message)
}

export async function createAdjustment(
  productId: string,
  delta: number,
  notes: string,
): Promise<void> {
  const sb = getSb()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await sb.from('stock_movements').insert({
    product_id: productId,
    receipt_id: null,
    quantity:   delta,
    type:       'ajuste',
    notes:      notes || null,
    created_by: user.id,
  })
  if (error) throw new Error(error.message)
}

export async function createInitialStockMovement(
  productId: string,
  qty: number,
): Promise<void> {
  const sb = getSb()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await sb.from('stock_movements').insert({
    product_id: productId,
    receipt_id: null,
    quantity:   qty,
    type:       'ajuste',
    notes:      'Stock inicial',
    created_by: user.id,
  })
  if (error) throw new Error(error.message)
}
