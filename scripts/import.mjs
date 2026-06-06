/**
 * FSP — Product import script
 * Reads products.csv, converts images to WebP, uploads to Supabase Storage,
 * then inserts brands/categories/product_lines/products.
 *
 * Usage:
 *   node --env-file=.env.local scripts/import.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Install deps first: npm install --save-dev sharp csv-parse
 */

import { createClient } from '@supabase/supabase-js'
import { parse }        from 'csv-parse/sync'
import sharp            from 'sharp'
import fs               from 'node:fs'
import path             from 'node:path'

// ── Config ────────────────────────────────────────────────────
const SUPABASE_URL       = 'https://jcugmeuvwqjvrlrdlyyh.supabase.co'
const SERVICE_ROLE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET             = 'product-images'
const PROJECT_ROOT       = path.resolve('.')

if (!SERVICE_ROLE_KEY) {
  console.error('❌  Missing SUPABASE_SERVICE_ROLE_KEY — add it to .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// ── Category display names & icons ────────────────────────────
const CATEGORY_META = {
  'controladores':        { name: 'Controles y Electrónica',     icon: 'Cpu'         },
  'valvulas':             { name: 'Válvulas',                    icon: 'Gauge'        },
  'accesorios':           { name: 'Accesorios de Refrigeración', icon: 'Wrench'      },
  'compresores-hvac':     { name: 'Compresores',                 icon: 'Settings2'   },
  'ventilacion':          { name: 'Ventilación',                 icon: 'Wind'        },
  'aires-acondicionados': { name: 'Aires Acondicionados',        icon: 'Thermometer' },
  'refrigerantes':        { name: 'Refrigerantes',               icon: 'Droplets'    },
}

// ── Helpers ───────────────────────────────────────────────────
function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const csvContent = fs.readFileSync(path.join(PROJECT_ROOT, 'products.csv'), 'utf-8')
  const records = parse(csvContent, {
    columns:          true,
    skip_empty_lines: true,
    relax_quotes:     true,
    trim:             true,
    bom:              true,   // strip UTF-8 BOM so first column name is clean
  })
  console.log(`📄 Parsed ${records.length} rows from products.csv\n`)

  const categorySlugs = [...new Set(records.map(r => r.category).filter(Boolean))]
  const brandNames    = [...new Set(records.map(r => r.brand?.trim()).filter(Boolean))]

  // ── 1. product_lines ────────────────────────────────────────
  console.log('→ product_lines...')
  const plRows = categorySlugs.map((slug, i) => ({
    code:          `L${String(i + 1).padStart(2, '0')}`,
    name:          CATEGORY_META[slug]?.name  ?? slug,
    description:   '',
    icon:          CATEGORY_META[slug]?.icon  ?? 'Wrench',
    slug,
    product_count: 0,
  }))
  const { data: plData, error: plErr } = await supabase
    .from('product_lines')
    .upsert(plRows, { onConflict: 'slug' })
    .select('id, slug')
  if (plErr) throw new Error(`product_lines insert: ${plErr.message}`)
  const plBySlug = Object.fromEntries(plData.map(p => [p.slug, p]))
  console.log(`  ✓ ${plData.length} product_lines\n`)

  // ── 2. categories ───────────────────────────────────────────
  console.log('→ categories...')
  const catRows = categorySlugs.map(slug => ({
    name:            CATEGORY_META[slug]?.name ?? slug,
    slug,
    product_line_id: plBySlug[slug]?.id ?? null,
  }))
  const { data: catData, error: catErr } = await supabase
    .from('categories')
    .upsert(catRows, { onConflict: 'slug' })
    .select('id, slug')
  if (catErr) throw new Error(`categories insert: ${catErr.message}`)
  const catBySlug = Object.fromEntries(catData.map(c => [c.slug, c]))
  console.log(`  ✓ ${catData.length} categories\n`)

  // ── 3. brands ───────────────────────────────────────────────
  console.log('→ brands...')
  const brandRows = brandNames.map(name => ({ name, slug: slugify(name) }))
  const { data: brandData, error: brandErr } = await supabase
    .from('brands')
    .upsert(brandRows, { onConflict: 'slug' })
    .select('id, name')
  if (brandErr) throw new Error(`brands insert: ${brandErr.message}`)
  const brandByName = Object.fromEntries(brandData.map(b => [b.name, b]))
  console.log(`  ✓ ${brandData.length} brands\n`)

  // ── 4. products + images ────────────────────────────────────
  console.log('→ products + images...')
  const seenSlugs = new Set()
  let ok = 0, fail = 0

  for (const row of records) {
    const label = `[${String(row.id).padStart(3, ' ')}] ${row.product_name.slice(0, 55)}`

    try {
      // Convert image to WebP and upload
      const localRelPath = row.image_local_path.replace(/\\/g, '/')
      const localAbsPath = path.join(PROJECT_ROOT, localRelPath)
      const storagePath  = `${row.category}/${row.id}.webp`
      let imageUrl = null

      if (fs.existsSync(localAbsPath)) {
        const webpBuf = await sharp(localAbsPath)
          .webp({ quality: 85 })
          .toBuffer()

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, webpBuf, { contentType: 'image/webp', upsert: true })

        if (upErr) {
          console.warn(`  ⚠ image upload failed (${upErr.message}) — ${label}`)
        } else {
          imageUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
        }
      } else {
        console.warn(`  ⚠ image not found: ${localRelPath}`)
      }

      // Unique slug from page URL
      let slug = row.page_url.split('/').filter(Boolean).pop() ?? slugify(row.product_name)
      if (!slug || seenSlugs.has(slug)) slug = `${slug || slugify(row.product_name)}-${row.id}`
      seenSlugs.add(slug)

      const { error: prodErr } = await supabase.from('products').upsert({
        sku:             `FSP-${String(row.id).padStart(4, '0')}`,
        name:            row.product_name,
        slug,
        description:     row.description ?? '',
        brand_id:        row.brand?.trim() ? (brandByName[row.brand.trim()]?.id ?? null) : null,
        category_id:     catBySlug[row.category]?.id  ?? null,
        product_line_id: plBySlug[row.category]?.id   ?? null,
        price:           0,
        images:          imageUrl ? [imageUrl] : [],
        stock:           0,
        is_featured:     false,
        is_new:          false,
      }, { onConflict: 'sku' })

      if (prodErr) throw new Error(prodErr.message)
      console.log(`  ✓ ${label}`)
      ok++
    } catch (e) {
      console.error(`  ✗ ${label}: ${e.message}`)
      fail++
    }
  }

  console.log(`\n✅  Done — ${ok} inserted, ${fail} failed`)
}

main().catch(e => { console.error(e); process.exit(1) })
