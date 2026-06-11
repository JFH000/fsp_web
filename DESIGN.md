---
name: FSP Parts
description: Specialized HVAC/R parts distributor — catalog-first e-commerce for Colombian B2B professionals
colors:
  specification-blue: "#3b82f6"
  blueprint-indigo: "#1d4ed8"
  blueprint-indigo-hover: "#1e40af"
  depth-charge-navy: "#172554"
  thermal-orange: "#f97316"
  thermal-orange-deep: "#ea580c"
  datasheet-black: "#0f172a"
  field-slate: "#334155"
  muted-annotation: "#94a3b8"
  border-line: "#e2e8f0"
  clean-field-white: "#f8fafc"
  surface-raised: "#ffffff"
  stock-green: "#10b981"
  stock-amber: "#f59e0b"
  sku-teal: "#0f766e"
  sku-teal-bg: "#f0fdfa"
typography:
  display:
    fontFamily: "Inter, system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.025em"
  mono:
    fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  "2xl": "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.blueprint-indigo}"
    textColor: "{colors.surface-raised}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.blueprint-indigo-hover}"
    textColor: "{colors.surface-raised}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-cta:
    backgroundColor: "{colors.thermal-orange}"
    textColor: "{colors.surface-raised}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  button-cta-hover:
    backgroundColor: "{colors.thermal-orange-deep}"
    textColor: "{colors.surface-raised}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  product-card:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input-search:
    backgroundColor: "{colors.clean-field-white}"
    textColor: "{colors.datasheet-black}"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
---

# Design System: FSP Parts

## 1. Overview

**Creative North Star: "The Technical Sourcebook"**

FSP Parts is built like a well-typeset industrial parts catalog. The interface is a reference tool first and a storefront never — every layout decision, typographic choice, and color assignment answers a question a HVAC/R technician might have while looking for a compressor under a tight deadline. Clarity, density, and unambiguous hierarchy are the design virtues. White space is earned by information, not given for aesthetic comfort.

The palette is anchored in two committed colors: Blueprint Indigo (#1d4ed8) for authoritative actions and navigation, and Thermal Orange (#f97316) for the singular purchase CTA. The background — Clean Field White (#f8fafc) — is deliberately low-noise, giving technical data (SKUs, specs, refrigerant codes) room to be read, not styled. The dark navbar and category bar (Datasheet Black, #0f172a) is the product line directory: always present, always utilitarian.

This system explicitly rejects the vocabulary of consumer retail. No impulse-buy urgency patterns, no promotional badge inflation, no hero sections that prioritize spectacle over the catalog. A technician arriving with a part number should feel they have reached a trusted supplier's reference shelf, not a flash-sale storefront.

**Key Characteristics:**
- Catalog-first hierarchy: product data is the protagonist, not hero imagery
- Density is a feature, not a bug — B2B users want specs, not padding
- Technical vocabulary (SKUs, part codes, refrigerant identifiers) is treated as first-class typography with its own mono typeface
- Actions are solid and direct; affordances are unambiguous and filled, never ghost-only
- Color carries function — status, action, identity — never decoration

## 2. Colors: The Specification Palette

A committed two-accent palette: one authoritative blue for navigation and primary actions, one thermal orange for the singular purchase CTA. Everything else is neutral infrastructure.

### Primary

- **Specification Blue** (#3b82f6): Mid-range brand blue. Used for icon container backgrounds (brand-50 tint), focus rings, active state indicators, secondary link text. The lighter face of the brand.
- **Blueprint Indigo** (#1d4ed8): The workhorse action color. All primary buttons ("Buscar", "Agregar", navbar search submit), active category nav states, prominent link emphasis. Signals intent without shouting.
- **Depth Charge Navy** (#172554): Dark end of the brand ramp. Hero section deep gradients, overlay backgrounds. Never used on interactive elements — it is structural depth only.

### Secondary

- **Thermal Orange** (#f97316): The single purchase CTA color. "Agregar al carrito", hero search button, HVAC calculator CTA, the cart badge counter. One color, one meaning: complete the transaction. Its rarity is deliberate.
- **Thermal Orange Deep** (#ea580c): Hover state for Thermal Orange. Never used at rest.

### Neutral

- **Datasheet Black** (#0f172a): Body text and the dark navbar/category bar background. Maximum contrast, maximum legibility. Never lightened for "subtlety" in running copy.
- **Field Slate** (#334155): Secondary text, subheadings, supporting labels. Used where body text would be too heavy.
- **Muted Annotation** (#94a3b8): Placeholder text, timestamps, price qualifiers ("COP · IVA incluido"). Never used for body copy — contrast is insufficient for reading.
- **Border Line** (#e2e8f0): Dividers, card borders at rest, input strokes. Structural, never decorative.
- **Clean Field White** (#f8fafc): Body background. Near-white at zero chroma. It is not warm, not cool — neutral infrastructure that lets product data read clearly.
- **Surface Raised** (#ffffff): Card backgrounds, modals, the search input on focus, cart drawer. One step above the body.

### Status (informational only — not available as accent)

- **Stock Green** (#10b981): In-stock indicator dot and label. Used only for "N en stock" status.
- **Stock Amber** (#f59e0b): Low-stock warning ("Solo N en stock"). Never repurposed for warnings outside stock context.
- **SKU Teal** (#0f766e) on **SKU Teal Background** (#f0fdfa): Refrigerant compatibility badges (R-22, R-410A, etc.). These are data identifiers; the teal reads as "technical specification," distinct from actions or status.

### Named Rules

**The One CTA Rule.** Thermal Orange appears on one interactive element per screen: the primary purchase or search action. A second orange element anywhere on the screen dilutes the signal and starts to look like consumer retail. If two actions compete for orange, one of them is not the primary CTA.

**The Neutral Infrastructure Rule.** Every color token has a named functional role. Using any color "for visual interest" or "for variety" is prohibited. If you cannot name the function, remove the color.

## 3. Typography

**Primary Font:** Inter (with system-ui, 'Segoe UI', Roboto, sans-serif fallback stack)
**Code / Identifier Font:** System monospace stack (ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace)

**Character:** Inter is the default of technical documentation — legible at density, neutral without being cold, weight-range wide enough for clear hierarchy in compressed product grids. The monospace font for SKUs and part numbers is not decorative; it signals "this is a precise identifier, treat it as data." The pairing achieves clarity through contrast of role, not through stylistic contrast of form.

### Hierarchy

- **Display** (800 weight, clamp(2.5rem, 6vw, 4.5rem), line-height 1.05, -0.02em tracking): Hero headline only. One per page. Applied to the main landing page H1.
- **Headline** (700, 1.875rem / 30px, line-height 1.2, -0.01em tracking): Section titles ("Líneas de Producto", "Productos Destacados"). Two or three per full-page scroll maximum.
- **Title** (600, 1.125rem / 18px, line-height 1.4): Component headers, modal titles, card section group labels.
- **Body** (400, 0.875rem / 14px, line-height 1.6): All running text, product descriptions, filter labels. Cap at 65–70ch for prose. This is the dominant size in the catalog.
- **Label** (600, 0.75rem / 12px, 0.025em letter-spacing): Badges, product line codes, stock labels, button text at small size. The uppercase-tracked label is the only tracked type in the system and is used exclusively for data classification.
- **Mono** (400, 0.6875rem / 11px, line-height 1.5): SKUs, part numbers, version codes. Always in the monospace stack. Never colored, never animated, never italic.

### Named Rules

**The SKU-as-Data Rule.** Part numbers, SKUs, and refrigerant codes are rendered in the mono stack. They are identifiers — not prose, not decorative content. They do not get colored, italicized, or animated. If a SKU appears at body size it still uses the mono stack.

**The Eyebrow Prohibition.** Small all-caps kicker labels above section headings (e.g., "CATÁLOGO ORGANIZADO", "LO MÁS VENDIDO") are a 2023-era SaaS scaffold. The current codebase uses them and they should be removed. Section hierarchy is established through weight and size contrast alone — a 700-weight 30px headline needs no uppercase label above it to announce itself.

## 4. Elevation

Flat by default, state-triggered lift. Depth at rest is conveyed through tonal layering (body `#f8fafc` → card surface `#ffffff` → border `#e2e8f0`), not shadows. Box-shadows appear only as state responses: hover, active elevation, or layer separation for overlays (drawers, modals).

### Shadow Vocabulary

- **Surface hover** (`0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)`): Product cards and interactive tile-like containers on hover. Confirms interactability; invisible at rest.
- **Action emphasis** (`0 4px 20px rgba(0,0,0,0.12)`): Hero search bar, prominent CTA buttons. Used at rest for the primary action zone only — draws the eye without motion.
- **Overlay separation** (`0 8px 48px rgba(0,0,0,0.18)`): Cart drawer, auth modal, cart summary. Clear separation from the content layer beneath.
- **Sticky header** (`0 1px 3px rgba(0,0,0,0.08)`): Navbar shadow-sm at scroll. Minimal — just enough to indicate stickiness.

### Named Rules

**The Flat-By-Default Rule.** A component at rest is flat. A shadow means either "this element has changed state" or "this layer is above content." Decorative shadows on static cards are prohibited. If a card has a shadow at rest, it should not.

## 5. Components

### Buttons

**Character:** Solid, filled, no ambiguity. A technician under pressure does not hunt for an action.

- **Shape:** 8px radius (rounded-md, `{rounded.md}`) for inline actions (add-to-cart, filter submit, small actions); 12px (rounded-lg, `{rounded.lg}`) for medium CTAs and the search button; 16px (rounded-xl, `{rounded.xl}`) for hero CTAs; full-pill (`{rounded.full}`) for category filter chips and badge-style links only.
- **Primary (Blueprint Indigo):** Background `#1d4ed8`, white text, 8px or 12px radius depending on size, `padding: 8px 16px` (small) / `10px 20px` (medium). Hover: darken to `#1e40af`, no scale transform.
- **CTA (Thermal Orange):** Background `#f97316`, white text, 12px radius, `padding: 8px 12px` (catalog) / `14px 28px` (hero). Used once per screen. Hover: darken to `#ea580c`.
- **Ghost / Secondary:** Transparent background, brand-700 text, 1px border currentColor. For secondary actions placed alongside a primary.
- **Disabled:** Explicit `background: #e2e8f0`, `color: #94a3b8`. Never use opacity to indicate disabled — a technician reading a dense grid should not have to infer state from a faded version of a color.

### Chips / Badges

- **Product line code** (AppBadge slate): `background: #f1f5f9`, `color: #334155`, `font-size: 11px`, `font-weight: 600`, `padding: 2px 6px`, `border-radius: 4px`. Data classification chip — identifies which product line a part belongs to (CMP, VAL, REF, etc.).
- **Status chip** (AppBadge orange): `background: #fff7ed`, `color: #c2410c`, same dimensions. For "NUEVO" and low-stock count alerts.
- **Refrigerant tag**: `background: #f0fdfa`, `color: #0f766e`, `font-size: 10px`, `font-weight: 500`, `padding: 2px 6px`, `border-radius: 3px`. Compatible refrigerant identifiers on product cards.

### Cards / Containers

- **Product card:** White (`#ffffff`) background, 16px radius (`{rounded.xl}`), `1px solid #e2e8f0` border at rest. On hover: border shifts to `#bfdbfe` (brand-200), `box-shadow: 0 4px 16px rgba(0,0,0,0.08)`, `transform: translateY(-2px)`. Internal padding: 16px. The image area is 192px tall, white background, `object-contain` with slight scale on hover.
- **Feature banner / calculator block:** 24px radius (`{rounded.2xl}`), used for large section-spanning feature blocks only. Never for repeating grid items.
- **Internal padding:** 16px standard (product cards, sidebar sections), 24–40px for hero/feature panels.
- **Nesting rule:** A card inside a card is never correct.

### Inputs / Fields

- **Style:** `background: #f8fafc` (clean-field-white) at rest, `background: #ffffff` on focus, 8px radius, `1px solid #e2e8f0` border. The search input in the main navbar uses this treatment.
- **Focus state:** Border shifts to `#3b82f6` (specification-blue), `box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15)`. No shadow animation, no glow spread — a precise, legible focus ring.
- **Search with attached submit:** The search input and its submit button share a visual container. The button inherits primary button styling but is physically joined to the right edge of the input. Desktop variant includes an inline line-filter selector separated by a left border.

### Navigation

- **Top navbar:** White background, `1px solid #e2e8f0` bottom border, sticky at z-40. Contains logo (left, flex-shrink-0), search (center, flex-1), actions (right). 56px height mobile, 64px desktop.
- **Category nav bar:** `background: #0f172a` (Datasheet Black), `color: #cbd5e1` default, `color: #ffffff` + `background: #1e293b` on hover and active. 10–12px font. Horizontally scrollable on mobile with hidden scrollbar. Always visible — never collapsed.
- **Mobile behavior:** Search is always visible (flex-1, never hidden). Cart button always visible. Thermal calculator link, auth button, and profile dropdown collapse on small screens.

### Product Card (Signature Component)

The core repeating unit of the catalog. Four data zones, top to bottom:

1. **Image zone** (192px, white bg, `object-contain`, `padding: 12px`): Scale 1.05 on group hover. Overlaid: badges (top-left), favorite star button (top-right, appears on hover or when favorited), and a "Ver detalle" label (center, appears on hover, confirms clickability of the zone).
2. **Meta row:** Brand name in Blueprint Indigo (`font-size: 12px`, `font-weight: 700`, uppercase), product line code badge (AppBadge slate, right).
3. **Spec block:** Product name (2-line clamp, 14px, 600 weight, hover links to detail), SKU in mono, refrigerant tags in a flex-wrap row.
4. **Commerce row:** Stock indicator dot + label (when stock > 0), then price (`font-size: 20px`, `font-weight: 800`) + currency subline in muted annotation, add-to-cart button (CTA orange, right-aligned). Divided from spec block by a 1px top border.

## 6. Do's and Don'ts

### Do:

- **Do** use Blueprint Indigo (#1d4ed8) as the default action color and Thermal Orange (#f97316) as the one purchase/conversion CTA per screen.
- **Do** render SKUs, part numbers, and refrigerant codes in the mono stack. They are data identifiers; their typeface signals precision.
- **Do** use stock status colors (Stock Green, Stock Amber) only for stock indicators. These colors have one meaning in this system.
- **Do** keep the category nav always visible as a horizontal scroll bar on mobile — it is the primary navigation instrument for repeat users who already know the product line structure.
- **Do** treat density as a feature: product grids can display more data than a consumer catalog because the user is reading specs, not mood.
- **Do** use flat-at-rest, shadow-on-hover elevation on interactive surfaces. Rest states are quiet; hover/active states are legible.
- **Do** keep section hierarchy from weight and size contrast. A 700-weight 30px section title needs no uppercase eyebrow label to announce itself.
- **Do** establish line hierarchy in the product card top-to-bottom: image → brand/line → name/SKU/refrigerants → stock/price/action.

### Don't:

- **Don't** use consumer / retail e-commerce patterns — sale badges, countdown timers, "only X left!" urgency overlays, flash-sale promotional banners. As stated in PRODUCT.md: HVAC/R buyers are rational, not impulse-shopping. Urgency patterns signal the wrong type of supplier.
- **Don't** extend the generic blue-and-orange Tailwind SaaS palette in its current default form. The existing system is documented here as the baseline; future refinements should push toward more differentiated, spec-forward color use — heavier Blueprint Indigo presence, restrained Thermal Orange, more structured neutral hierarchy.
- **Don't** use gradient text (`background-clip: text` with a gradient). The `.hvac-gradient` animated gradient on the hero HVAC/R span in `LandingView.vue` is a current violation and should be replaced with solid white or brand-300.
- **Don't** use uppercase-tracked kicker labels above section headings ("CATÁLOGO ORGANIZADO", "LO MÁS VENDIDO"). The current codebase uses these; remove existing instances. Hierarchy is established through weight and size.
- **Don't** use `border-left` greater than 1px as a colored accent stripe on any component. Use full borders, background tints, or leading icons instead.
- **Don't** hide or de-emphasize technical data. SKUs are not metadata to be grayed out — they are the primary identifier a B2B buyer may have arrived with.
- **Don't** use opacity to represent the disabled state. Use the explicit disabled color pair: `background: #e2e8f0`, `color: #94a3b8`.
- **Don't** add decorative shadows to cards at rest. The Flat-By-Default Rule: shadows are state responses, not permanent decoration.
