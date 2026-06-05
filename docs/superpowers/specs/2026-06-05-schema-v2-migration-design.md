# Schema v2 Migration Design

**Date:** 2026-06-05
**Approach:** Layer-by-layer (Types → Services → Store → Views)

---

## Context

The Supabase database was updated to a new schema (v2). This document describes the full app migration to align the Vue 3 frontend with the new schema.

**Key schema changes driving this migration:**
- `product_lines` is now a sub-level (belongs to a category); categories are top-level
- `products.name` → `product_name`; `linea_id` → `product_line_id`; `price` → `price_usd` + `price_cop` + 4 wholesale tiers
- Images moved from `products.images[]` (URL array) to a dedicated `product_images` table (files in Supabase Storage bucket `product-images`)
- Removed from products: `stock`, `is_featured`, `is_new`, `specs[]`, `refrigerants[]`
- Public display price: `price_cop`

---

## Layer 1 — Types (`src/shared/types/index.ts`)

Full rewrite. All interfaces reflect the new schema exactly.

```typescript
interface ProductLine  { id, name, slug, categoryId: number | null }
interface Brand        { id, name, slug, logoUrl? }
interface Category     { id, name, slug, description? }
interface ProductImage { id, productId, storagePath, altText?, sortOrder }

interface Product {
  id, sku, slug, productName, description, pageUrl
  brand: Brand | null
  category: Category | null
  productLine: ProductLine | null
  images: ProductImage[]
  priceCop, priceUsd, priceWs1, priceWs2, priceWs3, priceWs4: number | null
  language, tags, isActive
}

interface CartItem   { product: Product; quantity: number }
interface UserProfile { id, email, role: 'customer' | 'admin' }

interface FilterState {
  search: string
  categoryIds: number[]
  productLineIds: number[]
  brandIds: number[]
}

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc'
```

**Removed:** `ProductSpec`, `Order`, `stock/isFeatured/isNew/specs/refrigerants` fields,
`UserRole` values `technician` and `distributor`.

---

## Layer 2 — Services

### `src/core/supabase/storage.ts` (new file)

```typescript
export function getImageUrl(storagePath: string): string
// Returns full public URL for a path in the product-images bucket
```

Used by both catalog display and admin form.

### `src/core/supabase/catalog.service.ts` (rewrite)

- Remove all mock fallbacks and mock imports
- Remove `DbProductLine` shape with `code/description/icon/product_count`
- `fetchProductLines()` queries `product_lines` table
- `fetchProducts()` single query joining:
  - `brands`, `categories`, `product_lines`, `product_images` (ordered by `sort_order`)
  - Maps DB rows to `Product` interface; resolves each image's public URL via `getImageUrl()`

### `src/modules/admin/services/admin.service.ts` (update)

**Types updated:**
- `ProductPayload`: `product_name`, `product_line_id`; 6 price fields; no stock/featured/new/specs/refrigerants
- `AdminProductRow`: `product_name`, `price_cop`; no stock/featured columns
- `AdminProductDetail`: matches new schema

**CRUD updated:**
- `listAdminProducts()`: selects `product_name`, `price_cop`; joins `brands`, `product_lines`; includes first image
- `getAdminProduct(id)`: returns full product with `product_images` joined
- `createProduct()` / `updateProduct()`: use new payload shape
- `createProductLine(name)`: inserts into `product_lines` with only `name` + `slug` (no code/description/icon)
- `createCategory(name)`: inserts into `categories` with only `name` + `slug` (no product_line_id)

**New image functions:**
- `uploadProductImage(productId, file, sortOrder)`: uploads file to bucket at `products/{productId}/{filename}`, inserts row in `product_images`
- `deleteProductImage(imageId, storagePath)`: deletes from `product_images` table AND removes file from bucket
- `updateImageOrder(imageId, sortOrder)`: updates `sort_order` on `product_images` row

---

## Layer 3 — Store (`src/modules/catalog/stores/catalog.store.ts`)

**State:**
- `allProducts`, `allProductLines`, `allBrands`, `allCategories`: start as empty arrays (no mock defaults)
- Remove `allRefrigerants`

**FilterState** matches new interface: `{ search, categoryIds, productLineIds, brandIds }`

**Actions:**
- `toggleCategory(id)` — new, primary filter
- `toggleProductLine(id)` — secondary filter (unchanged signature)
- `toggleBrand(id)` — unchanged
- `resetFilters()` — clears all four fields
- Remove: `toggleRefrigerant`, `inStockOnly`, `priceRange`

**`filteredProducts` computed:**
```
1. search   → productName, sku, brand.name, description
2. categories → product.category.id in categoryIds
3. productLines → product.productLine.id in productLineIds
4. brands   → product.brand.id in brandIds
5. sort     → relevance | price-asc | price-desc | name-asc (uses priceCop)
```

**Updated computeds:**
- `featuredProducts` → renamed to `highlightedProducts`: returns first 6 products from `allProducts` (used by LandingView; no longer depends on `isFeatured`)
- Remove: `maxPrice`, simplify `activeFilterCount` to count non-empty filter arrays

**`initialize()`:** fetches brands, categories, product_lines, products in parallel — no mock fallback.

**Mutations exposed:** `addBrand`, `addProductLine`, `addCategory` — same API, updated types.

---

## Layer 4 — Views & Components

### `ProductCard.vue`
- `product.productName` for name display
- Image: `product.images[0]?.storagePath` → `getImageUrl()` (fallback to placeholder if empty)
- Price: `product.priceCop` formatted as COP
- Remove: stock badge, stock indicator dot, refrigerant chips, disabled state on cart button

### `ProductDetailView.vue`
- Field renames: `productName`, `priceCop`
- Slideshow: iterate `product.images` (already sorted by `sort_order`); use `getImageUrl()` per image
- Remove: stock section + qty constraint, refrigerants section, specs table
- Breadcrumb: `product.productLine.name` (no `.code`)
- Cart qty: free input, no upper bound

### `FilterSidebar.vue` / `FilterSection.vue`
- **Categorías** section (primary): lists all categories; calls `toggleCategory`
- **Líneas de Producto** section (secondary): shows only lines whose `categoryId` is in selected categories (or all lines if no category selected); calls `toggleProductLine`
- **Marcas** section: unchanged
- Remove: refrigerant filter, price range slider, in-stock toggle

### `AdminProductFormView.vue`
- **Clasificación section:** category selector (no parent dependency); product line selector filtered by selected `category_id`; `createCategory` only needs name; `createProductLine` only needs name
- **Pricing section:** 6 fields in 2-row grid — `price_usd`, `price_cop` (row 1); `price_ws1`–`price_ws4` (row 2)
- **Images section:** replaces URL array input with file uploader — multiple file select, shows thumbnails with delete button per image, drag handles for reorder (updates `sort_order`); on save: uploads new files, deletes removed ones, updates orders
- **Remove sections entirely:** Stock/Destacado/Nuevo toggles; Refrigerantes; Especificaciones técnicas
- Form field: `form.productName` (was `form.name`)

### `AdminProductsView.vue`
- Table columns: `product_name`, `price_cop`
- Remove: stock column, featured column

### `src/modules/catalog/data/mock.ts`
- Delete file entirely — no more mock fallback anywhere

---

## Data Flow: Image Upload (Admin)

```
User selects files
  → uploadProductImage(productId, file, sortOrder)
    → supabase.storage.from('product-images').upload('products/{id}/{filename}', file)
    → supabase.from('product_images').insert({ product_id, storage_path, sort_order })
  → UI refreshes image list from product_images rows

User deletes image
  → deleteProductImage(imageId, storagePath)
    → supabase.from('product_images').delete().eq('id', imageId)
    → supabase.storage.from('product-images').remove([storagePath])

User reorders images
  → updateImageOrder(imageId, newSortOrder) per changed image
```

---

## Out of Scope

- Cart checkout / order processing (no schema changes there)
- Auth flow (profiles table unchanged)
- HVAC calculator view (no product data dependency)
- Landing view deep changes (store exposes `highlightedProducts` as drop-in replacement for `featuredProducts`; LandingView only needs to update the computed name it reads)
