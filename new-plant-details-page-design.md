# Red Anthurium Plant — Product Detail Page Design Specification

> **Design intent:** Deliver a clean, token-driven product detail page for a plant e-commerce storefront that converts browsers into buyers through clear hierarchy, fast variant selection, and a pot-customisation flow — while meeting WCAG 2.2 AA across all interactive surfaces.

---

## 1. Context & Goals

| Property | Value |
|---|---|
| **Product** | Red Anthurium Plant |
| **Reference URL** | https://www.ugaoo.com/products/anthurium-red-plant?variant=40859521187972 |
| **Page Type** | Product Detail Page (PDP) |
| **Primary Goal** | Drive Add-to-Cart conversions |
| **Secondary Goal** | Support size + pot variant selection without page reload |
| **Audience** | Online shoppers and indoor-plant consumers |
| **Surface** | E-commerce storefront (desktop-first, fully responsive) |
| **Known Page Density** | Links: 206 · Buttons: 138 · Cards: 95 · Inputs: 48 · Lists: 27 · Nav: 4 · Tables: 1 |

---

## 2. Design Tokens & Foundations

### 2.1 Typography

| Token | Value | Usage |
|---|---|---|
| `font.family.primary` | `Outfit` | All UI text |
| `font.family.stack` | `Outfit, sans-serif` | CSS font-family fallback |
| `font.size.base` | `16px` | Body reference |
| `font.weight.base` | `400` | Default weight |
| `font.lineHeight.base` | `22.4px` | Body line-height |
| `font.size.xs` | `9px` | Legal micro-labels |
| `font.size.sm` | `11px` | Meta labels, badges |
| `font.size.md` | `12px` | Helper text, captions |
| `font.size.lg` | `13px` | Secondary UI labels |
| `font.size.xl` | `13.33px` | Nav links |
| `font.size.2xl` | `14px` | Body copy, descriptions |
| `font.size.3xl` | `15px` | Section labels, price secondary |
| `font.size.4xl` | `16px` | Price primary, CTA labels |

**Typography role map:**

| Role | Size token | Weight | Line-height |
|---|---|---|---|
| Product title | `font.size.4xl` × 2.5 (~40px) | 600 | 1.15 |
| Category label | `font.size.lg` | 400 | `font.lineHeight.base` |
| Section heading | `font.size.3xl` | 600 | 1.3 |
| Body description | `font.size.2xl` | 400 | `font.lineHeight.base` |
| Price display | `font.size.4xl` × 2 (~32px) | 700 | 1 |
| Price sub-label | `font.size.3xl` | 400 | 1.2 |
| Button label | `font.size.4xl` | 600 | 1 |
| Size chip label | `font.size.3xl` | 500 | 1 |
| Breadcrumb | `font.size.lg` | 400 | 1 |
| Rating count | `font.size.lg` | 400 | 1 |
| Learn-more link | `font.size.2xl` | 400 | 1 |

### 2.2 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `color.surface.base` | `#000000` | Deepest text baseline |
| `color.text.secondary` | `#1c1c1c` | Primary body text, headings |
| `color.text.tertiary` | `#ffffff` | Text on dark/green surfaces |
| `color.text.inverse` | `#212326` | Breadcrumbs, secondary meta |
| `color.surface.raised` | `#00b566` | Add-to-Cart button, active size chip, active pot border |
| `color.surface.strong` | `#fefcf9` | Page background, card background |

**Derived semantic roles (not raw hex — reference parent token):**

| Semantic role | Maps to token |
|---|---|
| Page background | `color.surface.strong` |
| Card background | `color.surface.strong` |
| Primary CTA bg | `color.surface.raised` |
| Primary CTA text | `color.text.tertiary` |
| Body text | `color.text.secondary` |
| Chip active bg | `color.surface.raised` |
| Chip active text | `color.text.tertiary` |
| Chip default border | `color.text.secondary` @ 30% opacity |
| Focus ring | `color.surface.raised` |
| Star rating fill | `#c8a84b` (amber — one-off allowed for rating semantics) |

### 2.3 Spacing Scale

| Token | Value |
|---|---|
| `space.1` | `1px` |
| `space.2` | `2px` |
| `space.3` | `3px` |
| `space.4` | `4px` |
| `space.5` | `5px` |
| `space.6` | `6px` |
| `space.7` | `8px` |
| `space.8` | `9px` |

> **Note:** Larger spacing values are composed by multiplying tokens (e.g. `space.7 × 2 = 16px`, `space.7 × 3 = 24px`, `space.7 × 6 = 48px`).

### 2.4 Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius.xs` | `4px` | Badges, micro tags |
| `radius.sm` | `8px` | Input fields, thumbnail borders |
| `radius.md` | `12px` | Pot cards |
| `radius.lg` | `16px` | Size chips, quantity stepper |
| `radius.xl` | `20px` | Thumbnail image container |
| `radius.2xl` | `24px` | Main product image container |
| `radius.step7` | `50px` | Chat FAB, icon buttons |
| `radius.step8` | `9999px` | Add-to-Cart button, pill badges |

### 2.5 Shadow

| Token | Value | Usage |
|---|---|---|
| `shadow.1` | `rgb(190, 234, 212) 0px 0px 0px 0px` | Resting card (no shadow) |
| `shadow.2` | `rgb(202, 223, 212) 0px 0px 0px 1px inset` | Thumbnail default border |
| `shadow.3` | `rgb(212, 212, 212) 0px 0px 0px 1px inset` | Size chip default border |
| `shadow.4` | `rgb(0, 146, 82) 0px 0px 0px 1px inset` | Active chip / active thumbnail border |

### 2.6 Motion

| Token | Value | Usage |
|---|---|---|
| `motion.duration.instant` | `200ms` | Hover colour transitions, chip state |
| `motion.duration.fast` | `250ms` | Image crossfade on thumbnail click |
| `motion.duration.normal` | `300ms` | Price update fade, pot card selection |
| `motion.duration.slow` | `500ms` | Main image zoom overlay open/close |

---

## 3. Navigation Bar

### 3.1 Anatomy

```
[ plant byst logo ]   [ Home ][ Boixs ][ Plants ][ Products ][ Product ][ About ]   [ 🔍 ][ 👤 ][ 🛒¹ ]
```

| Element | Token / Value |
|---|---|
| Background | `color.surface.strong` |
| Logo | Logotype wordmark — `font.size.4xl`, weight 500, `color.text.secondary` |
| Nav links | `font.size.xl`, weight 400, `color.text.secondary`; 5 links |
| Icon buttons | 40×40px tap target, `radius.step7` |
| Cart badge | `color.surface.raised` bg, `color.text.tertiary` text, `radius.step8`, `font.size.sm` |
| Height | 64px |
| Sticky | Yes — `position: sticky; top: 0; z-index: 100` |

### 3.2 States

| State | Behaviour |
|---|---|
| Default | Flat, no shadow |
| Scrolled | `shadow.2` appears beneath bar |
| Nav link hover | Underline slides in, `motion.duration.instant` |
| Nav link focus-visible | `2px` focus ring in `color.surface.raised`, `radius.xs` offset |
| Icon button hover | Background `color.surface.raised` @ 10% opacity, `radius.step7` |

### 3.3 Keyboard Behaviour
- Tab order: Logo → Nav links left-to-right → Search → Account → Cart
- Enter/Space activates focused nav item
- Cart icon must announce badge count to screen readers: `aria-label="Cart, 1 item"`

---

## 4. Breadcrumb

```
Home  /  Red Anthurium Plant
```

| Property | Value |
|---|---|
| Font | `font.size.lg`, weight 400, `color.text.inverse` |
| Separator | `/` character, `space.7` padding each side |
| Current page | Non-linked, `color.text.secondary`, weight 500 |
| Margin top | `space.7 × 3 = 24px` |
| Margin bottom | `space.7 × 2 = 16px` |

**Accessibility:** Wrap in `<nav aria-label="Breadcrumb">` with `<ol>` list. Current page item must have `aria-current="page"`.

---

## 5. Product Detail Section

### 5.1 Layout

**Desktop (≥ 1024px):** Two-column, `50% / 50%` split, `space.7 × 6 = 48px` column gap.
**Tablet (768–1023px):** Two-column, `45% / 55%` split, `space.7 × 3 = 24px` gap.
**Mobile (< 768px):** Single column — image gallery stacked above info panel.

---

### 5.2 Left Column — Image Gallery

#### 5.2.1 Main Image

| Property | Value |
|---|---|
| Container shape | `radius.2xl` |
| Aspect ratio | `1 / 1` (square) |
| Background | `color.surface.strong` |
| Object-fit | `cover` |
| Border | `shadow.2` |
| Zoom icon | Bottom-right corner, 36×36px circular button, `radius.step7`, white bg @ 90% opacity, magnifier icon |
| Wishlist icon | Top-right corner, 36×36px circular button, `radius.step7`, white bg @ 90% opacity, heart outline/filled toggle |

**Zoom icon states:**

| State | Behaviour |
|---|---|
| Default | Visible, `motion.duration.instant` opacity |
| Hover | Background darkens slightly |
| Focus-visible | `2px` focus ring `color.surface.raised` |
| Active (clicked) | Opens lightbox overlay — see §5.2.3 |

**Wishlist icon states:**

| State | Behaviour |
|---|---|
| Default | Heart outline, `color.text.secondary` |
| Active/saved | Heart filled, `color.surface.raised` |
| Hover | Scale `1.1`, `motion.duration.instant` |
| Focus-visible | `2px` focus ring |
| `aria-label` | `"Add to wishlist"` / `"Remove from wishlist"` |
| `aria-pressed` | `true` when saved, `false` when not |

#### 5.2.2 Thumbnail Strip

- 3 thumbnails visible below main image (horizontally arranged)
- Each thumbnail: `80×80px`, `radius.xl`, `shadow.2` border
- Active thumbnail: `shadow.4` (green inset border), scale `1.02`
- Inactive thumbnail hover: `shadow.3` border, scale `1.01`
- Click thumbnail → main image crossfades in `motion.duration.fast`
- Carousel dot indicators (5 dots) shown on mobile below main image:
  - Active: elongated green pill (`color.surface.raised`), `radius.step8`
  - Inactive: `8px` circle, `color.text.secondary` @ 30% opacity
  - Changing dot swaps main image in `motion.duration.fast`

**Keyboard:** Arrow keys navigate between thumbnails; Enter/Space selects. `role="tablist"` on container, `role="tab"` on each thumbnail.

#### 5.2.3 Lightbox / Zoom Overlay

| Property | Value |
|---|---|
| Trigger | Zoom icon click or main image double-tap |
| Background | `color.surface.base` @ 90% opacity |
| Image | Max `90vw × 90vh`, `radius.md`, centered |
| Close button | Top-right corner, `×` icon, `color.text.tertiary`, `radius.step7` |
| Animation open | Fade in + scale `0.95 → 1`, `motion.duration.slow` |
| Animation close | Fade out, `motion.duration.normal` |
| Focus trap | Must trap keyboard focus inside overlay |
| Close triggers | Close button, Escape key, backdrop click |
| `aria-modal` | `true` |

---

### 5.3 Right Column — Product Info Panel

#### 5.3.1 Category Label

```
PC Mentghe
```

| Property | Value |
|---|---|
| Font | `font.size.lg`, weight 400, `color.text.secondary` @ 60% opacity |
| Margin bottom | `space.4` |
| Uppercase | No |

#### 5.3.2 Product Title

```
Fern "Green Lady"  →  Red Anthurium Plant
```

| Property | Value |
|---|---|
| Font | `font.size.4xl × 2.5`, weight 600, `color.text.secondary` |
| Font style | Italic on varietal name/cultivar in quotes |
| Margin bottom | `space.7 × 2 = 16px` |
| Max lines | 2 — truncate with ellipsis beyond, reveal on hover |

#### 5.3.3 Description

```
Description
[body text] ... Learn more.
```

| Property | Value |
|---|---|
| Section label | `font.size.3xl`, weight 600, `color.text.secondary`, margin-bottom `space.6` |
| Body text | `font.size.2xl`, weight 400, `color.text.secondary` @ 85% opacity, `font.lineHeight.base` |
| Max lines | 3 collapsed, expand on "Learn more" |
| "Learn more" link | `font.size.2xl`, `color.surface.raised`, underline on hover, `motion.duration.instant` |
| "Learn more" keyboard | Enter/Space toggles expanded state; `aria-expanded` on trigger |

#### 5.3.4 Price & Rating Row

```
Price                              $15.00
★★★★☆  30 (nes)         +0+ Premium  $45.00
```

**Price block:**

| Property | Value |
|---|---|
| "Price" label | `font.size.3xl`, weight 400, `color.text.secondary` |
| Price value | `font.size.4xl × 2`, weight 700, `color.text.secondary` |
| Alignment | Price label left, price value right (space-between) |
| Price update animation | Fade out → new value fades in, `motion.duration.normal` |
| Premium price | `font.size.3xl`, weight 400, `color.text.secondary` @ 60%, right-aligned |

**Price changes by selected size variant:**
- Small → $15.00
- Medium → $25.00
- Large → $35.00

**Rating block:**

| Property | Value |
|---|---|
| Stars | 5 SVG stars, filled amber `#c8a84b`, empty `color.text.secondary` @ 25% |
| Star size | 16×16px |
| Count | `font.size.lg`, `color.text.secondary` @ 70%, `(30 reviews)` |
| `aria-label` | `"4 out of 5 stars, 30 reviews"` |
| Margin top | `space.6` |
| Margin bottom | `space.7 × 3 = 24px` |

#### 5.3.5 Divider

- `1px` horizontal rule, `color.text.secondary` @ 12% opacity
- `space.7 × 2` margin top and bottom

---

### 5.4 Size Selector

```
Select Size                        See All
[ Small ]  [ Medium ]  [ Large ]
```

| Property | Value |
|---|---|
| Section label | `font.size.3xl`, weight 600, `color.text.secondary` |
| "See All" link | `font.size.3xl`, weight 400, `color.surface.raised`, right-aligned |
| Chip layout | Horizontal flex row, `space.7` gap |
| Chip min-width | `88px` |
| Chip height | `44px` (meets 44×44px touch target minimum) |
| Chip border-radius | `radius.lg` |
| Chip font | `font.size.3xl`, weight 500 |
| Margin bottom | `space.7 × 3 = 24px` |

**Chip states:**

| State | Background | Border | Text | Shadow |
|---|---|---|---|---|
| Default | `color.surface.strong` | `shadow.3` | `color.text.secondary` | — |
| Hover | `color.surface.raised` @ 8% | `shadow.4` | `color.text.secondary` | — |
| Focus-visible | `color.surface.strong` | `shadow.4` | `color.text.secondary` | `2px` focus ring `color.surface.raised` |
| Active/selected | `color.surface.raised` | `shadow.4` | `color.text.tertiary` | — |
| Disabled | `color.surface.strong` @ 40% | `shadow.3` @ 40% | `color.text.secondary` @ 30% | — |
| Loading | Skeleton shimmer over chip | — | Hidden | — |

**Interaction:**
- Click/tap: selects chip, deselects previous, price updates
- Keyboard: `role="radiogroup"` on container, `role="radio"` on each chip; Arrow keys move selection; `aria-checked="true"` on active
- Touch: full tap area 44×44px minimum

**When a size is out of stock:**
- Chip shows diagonal strikethrough overlay
- `aria-disabled="true"` and `aria-label="[Size] — out of stock"`
- Must not be keyboard-selectable (skip in Arrow key navigation)

---

### 5.5 Quantity Stepper + Add to Cart

```
[ − ]  [ 1 ]  [ + ]          [ Add to Cart ]
```

#### Quantity Stepper

| Property | Value |
|---|---|
| Layout | Inline-flex, `radius.step8`, `shadow.3` border |
| Height | `52px` |
| Width | `120px` |
| `−` / `+` buttons | `44×44px` tap target, `color.surface.raised` icon |
| Count display | `font.size.4xl`, weight 600, `color.text.secondary`, center-aligned |
| Min value | `1` (− button disabled at 1) |
| Max value | Stock limit (+ button disabled at max) |
| Button disabled state | `color.text.secondary` @ 30%, `pointer-events: none` |
| `aria-label` on `−` | `"Decrease quantity"` |
| `aria-label` on `+` | `"Increase quantity"` |
| `aria-live` on count | `"polite"` — announces new count to screen readers |

#### Add to Cart Button

| Property | Value |
|---|---|
| Background | `color.surface.raised` |
| Text | `color.text.tertiary`, `font.size.4xl`, weight 600 |
| Height | `52px` |
| Border-radius | `radius.step8` |
| Width | Fills remaining space in row (`flex: 1`) |
| Shadow | `shadow.1` |
| Gap from stepper | `space.7 × 2 = 16px` |

**Button states:**

| State | Background | Text | Behaviour |
|---|---|---|---|
| Default | `color.surface.raised` | `color.text.tertiary` | Enabled |
| Hover | `color.surface.raised` darkened 10% | `color.text.tertiary` | Cursor pointer |
| Focus-visible | `color.surface.raised` | `color.text.tertiary` | `2px` focus ring `color.text.secondary` offset `2px` |
| Active (pressed) | `color.surface.raised` darkened 20% | `color.text.tertiary` | Scale `0.98` |
| Loading | `color.surface.raised` @ 70% | Spinner icon replaces text | `aria-busy="true"`, `aria-label="Adding to cart"` |
| Success | `color.surface.raised` | Checkmark + "Added!" | Auto-reverts after `1500ms` |
| Error | `#c0392b` | `color.text.tertiary` | "Try again" label, `aria-live="assertive"` error message |
| Disabled (no size) | `color.surface.raised` @ 40% | `color.text.tertiary` @ 60% | `aria-disabled="true"` |

**Keyboard:** Enter/Space triggers add. Tab moves to next focusable element.

---

### 5.6 Secondary Actions Row

```
🚚 Add by Prize Price          ♡ Filter more
```

| Property | Value |
|---|---|
| Layout | Flex row, space-between |
| Font | `font.size.3xl`, weight 400, `color.text.secondary` |
| Icon size | `16×16px`, inline with text, `space.4` gap |
| "Filter more" | Heart icon toggle + label; `aria-pressed` for wishlist state |
| Margin top | `space.7 × 2 = 16px` |

---

## 6. Select Your Pot Section

> Allows buyers to pair a pot with their plant purchase without leaving the PDP.

### 6.1 Section Header

```
Select Your Pot                   Calale  ‹  ›
```

| Property | Value |
|---|---|
| Heading | `font.size.4xl × 1.5 (~24px)`, weight 700, `color.text.secondary` |
| "Calale" filter link | `font.size.3xl`, `color.surface.raised` |
| Prev/Next arrows | `32×32px` icon buttons, `radius.step7`, `shadow.3` border |
| Margin top | `space.7 × 6 = 48px` |
| Margin bottom | `space.7 × 3 = 24px` |

### 6.2 Category Filter Tabs

```
[ Normal ]  [ Normies ]  [ Varieties ]
```

| Property | Value |
|---|---|
| Layout | Horizontal flex, `space.6` gap |
| Font | `font.size.3xl`, weight 500 |
| Default state | `color.text.secondary` @ 60%, no underline |
| Active state | `color.text.secondary`, weight 600, `color.surface.raised` underline `2px` |
| Hover | `color.text.secondary`, `motion.duration.instant` |
| Focus-visible | `2px` focus ring `color.surface.raised` |
| `role` | `tablist` on container, `tab` on each, `tabpanel` on associated content |

### 6.3 Pot Card Grid

**Layout:** Horizontal scrollable row, `space.7 × 2` gap between cards, prev/next arrows for desktop navigation.

**Single Pot Card:**

| Property | Value |
|---|---|
| Width | `140px` |
| Image | `120×120px`, `radius.md`, `object-fit: contain`, neutral background |
| Label | `font.size.3xl`, weight 500, `color.text.secondary`, centered below image |
| Card radius | `radius.md` |
| Card background | `color.surface.strong` |
| Card border | `shadow.3` |
| Padding | `space.7 × 2 = 16px` all sides |

**Pot card states:**

| State | Border | Background | Label |
|---|---|---|---|
| Default | `shadow.3` | `color.surface.strong` | `color.text.secondary` |
| Hover | `shadow.4` | `color.surface.strong` | `color.text.secondary` |
| Focus-visible | `shadow.4` + `2px` focus ring `color.surface.raised` | — | — |
| Selected | `shadow.4`, `2px` solid `color.surface.raised` | `color.surface.strong` | `color.text.secondary`, weight 600 |
| Disabled | `shadow.1` | `color.surface.strong` @ 50% | `color.text.secondary` @ 30% |

**Pot types visible (left to right):**
1. Normal — terracotta standard pot
2. White Minimalist — smooth white cylinder
3. Vorite Door — tapered white ceramic
4. Vorite Door (variant) — black geometric faceted pot
5. Dutfcier lies — natural wicker basket
6. Phnte Sear — white pot with plant shown
7. Boat Dan — terracotta with rim (partially visible)

**Scroll behaviour:**
- Overflow: horizontal scroll, `scroll-snap-type: x mandatory`, `scroll-snap-align: start` on each card
- Prev/Next arrow buttons advance by 3 cards
- Arrow buttons: `aria-label="Previous pots"` / `"Next pots"`, disabled at scroll ends

**Keyboard:** Arrow keys scroll through pot cards; Enter/Space selects. `role="radiogroup"` on container, `role="radio"` on each card.

---

## 7. Floating Chat Button (FAB)

| Property | Value |
|---|---|
| Position | Fixed, bottom-right `space.7 × 3`, `z-index: 200` |
| Size | `52×52px`, `radius.step7` |
| Background | `color.surface.raised` |
| Icon | Chat bubble icon, `color.text.tertiary`, `24×24px` |
| Shadow | `shadow.1` (elevated drop shadow variant) |
| `aria-label` | `"Open live chat"` |

**States:**

| State | Behaviour |
|---|---|
| Default | Visible, subtle pulse animation every 4s |
| Hover | Scale `1.08`, `motion.duration.instant` |
| Focus-visible | `2px` focus ring `color.text.secondary`, `radius.step7` |
| Active | Scale `0.96` |

---

## 8. Image Gallery Carousel (Full-Width — Mobile Scroll View)

Visible in frame 5 — a full-width horizontal gallery showing the plant in different pot combinations.

| Property | Value |
|---|---|
| Layout | Full-width horizontal scroll, 3 cards visible |
| Card size | `~380px wide × 300px tall` |
| Card radius | `radius.2xl` |
| Image | `object-fit: cover`, fills card |
| Active indicator | `shadow.4` green bottom border on active card |
| Wishlist icon | Top-right of active card, `radius.step7`, white bg |
| Carousel dots | 4 dots below; active = green pill `radius.step8` |
| Scroll | `scroll-snap-type: x mandatory` |
| Keyboard | Arrow keys advance slides; `role="region"` with `aria-label="Product gallery"` |

---

## 9. Accessibility Requirements

### 9.1 Contrast

| Pairing | Ratio | Required | Pass/Fail |
|---|---|---|---|
| `color.text.secondary` (#1c1c1c) on `color.surface.strong` (#fefcf9) | ~18:1 | 4.5:1 AA | ✅ Pass |
| `color.text.tertiary` (#fff) on `color.surface.raised` (#00b566) | ~3.4:1 | 3:1 AA (large text) | ✅ Pass (large) |
| `color.text.tertiary` (#fff) on `color.surface.raised` (#00b566) — body size | ~3.4:1 | 4.5:1 AA (body) | ⚠️ Must use weight 600+ at `font.size.4xl` to maintain legibility |
| Rating amber on `color.surface.strong` | — | Decorative (no text) | ✅ Pass |

> **Rule:** CTA button text must use `font.size.4xl` weight 600 minimum to compensate for contrast ratio on `color.surface.raised`. Never place `font.size.sm` or lighter weights as white text on green.

### 9.2 Focus Management

- Every interactive element must show a visible focus ring — `2px solid color.surface.raised`, `2px offset`.
- Focus must not be trapped outside of intentional modal dialogs (lightbox).
- After lightbox closes, focus must return to the zoom trigger button.
- After adding to cart, focus must remain on the Add-to-Cart button (do not shift focus).

### 9.3 ARIA Requirements

| Component | Required ARIA |
|---|---|
| Breadcrumb | `<nav aria-label="Breadcrumb">`, current page `aria-current="page"` |
| Main image | `alt` text: `"Red Anthurium Plant in [size] size, [pot name] pot"` (dynamic) |
| Thumbnails | `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` |
| Wishlist toggle | `aria-pressed`, `aria-label` switches on state |
| Size chips | `role="radiogroup"`, `role="radio"`, `aria-checked` |
| Quantity stepper | `aria-label` on each button; `aria-live="polite"` on count |
| Add to Cart | `aria-busy` during loading; `aria-live="assertive"` on error |
| Pot selector | `role="radiogroup"`, `role="radio"`, `aria-checked` |
| Category tabs | `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` |
| Chat FAB | `aria-label="Open live chat"` |
| Lightbox | `role="dialog"`, `aria-modal="true"`, `aria-label="Product image zoom"` |

### 9.4 Keyboard Navigation Order (Tab sequence on PDP)

1. Skip-to-main-content link (visually hidden, appears on focus)
2. Logo
3. Nav links (5)
4. Search icon
5. Account icon
6. Cart icon
7. Breadcrumb link (Home)
8. Thumbnails (arrow key sub-navigation)
9. Zoom icon
10. Wishlist icon
11. "Learn more" link
12. Size chips (arrow key sub-navigation)
13. "See All" sizes link
14. Quantity decrement button
15. Quantity count (read-only, skippable)
16. Quantity increment button
17. Add to Cart button
18. "Add by Prize Price" link
19. "Filter more" / wishlist secondary
20. Pot category tabs (arrow key sub-navigation)
21. Pot prev arrow
22. Pot cards (arrow key sub-navigation)
23. Pot next arrow
24. Chat FAB

### 9.5 Testable Acceptance Criteria

| # | Criterion | Test method | Pass condition |
|---|---|---|---|
| A1 | All text meets contrast ratio | axe DevTools scan | Zero contrast failures |
| A2 | Focus ring visible on all interactive elements | Manual tab traversal | Every element shows `2px` green ring |
| A3 | Size chip updates price on selection | Keyboard + screen reader | Price region announces new value |
| A4 | Add to Cart loading state announced | Screen reader (NVDA/VoiceOver) | `aria-busy` change announced |
| A5 | Lightbox traps focus | Keyboard test | Tab cycles only within lightbox |
| A6 | Lightbox closes on Escape | Keyboard | Dialog closes, focus returns to zoom button |
| A7 | Wishlist state announced | Screen reader | `aria-pressed` change read aloud |
| A8 | Out-of-stock size skipped | Keyboard | Arrow key skips disabled chip |
| A9 | Quantity counter announced | Screen reader | `aria-live` reads new number |
| A10 | Image alt updates on variant | Screen reader | Alt text reflects selected size + pot |

---

## 10. Content & Tone Standards

### 10.1 Product Title
- Must: Use sentence case. Cultivar names in quotes with italic style.
- Must not: Use ALL CAPS or excessive punctuation.
- Example ✅: `Red Anthurium Plant`
- Example ❌: `RED ANTHURIUM PLANT!!!`

### 10.2 Description
- Must: Be 2–4 sentences, factual, benefit-led.
- Must: Include a "Learn more" expandable link if text exceeds 3 lines.
- Must not: Use vague filler copy or lorem-ipsum in production.

### 10.3 Size Labels
- Must: Use standardised vocabulary: `Small`, `Medium`, `Large` — not `S`, `M`, `L` or abbreviations.
- Must: Show price alongside chip when hovered/selected.

### 10.4 CTA Label
- Must: `"Add to Cart"` — not "Buy", "Purchase", "Shop", or any other variation.
- Loading state: `"Adding…"`
- Success state: `"Added to Cart ✓"`

### 10.5 Pot Labels
- Must: Use the pot's proper product name below each card.
- Must not: Use internal SKU codes as labels.

### 10.6 Price Format
- Must: Use `$XX.00` format with two decimal places.
- Must: Show premium price as `+ Premium $XX.00` in secondary style.
- Must not: Abbreviate or truncate price values.

---

## 11. Anti-Patterns & Prohibited Implementations

| Anti-pattern | Why prohibited | Correct approach |
|---|---|---|
| Raw hex `#00b566` in component CSS | Breaks token system — hard to update | Use `color.surface.raised` |
| `outline: none` on any interactive element | Kills keyboard accessibility | Use `outline: 2px solid color.surface.raised` |
| Hiding focus ring with `opacity: 0` | Same as outline none | Always show focus-visible ring |
| `font-size: 10px` or below for interactive labels | Below minimum legible size; fails AA | Use `font.size.sm = 11px` minimum |
| Local `border-radius: 6px` not in token scale | One-off exception breaks consistency | Snap to nearest token: `radius.xs=4px` or `radius.sm=8px` |
| Quantity input typed by user without validation | Risk of invalid/negative values | Stepper buttons only; read-only display |
| Price displayed without currency symbol | Ambiguous globally | Always prefix with `$` (or locale currency) |
| CTA button below 44px height | Fails touch target minimum | Minimum `52px` height as specified |
| Active size chip with insufficient contrast | Green bg + white text at small sizes fails 4.5:1 | Use `font.size.4xl` weight 600 minimum on green |
| Pot carousel without keyboard nav | Mouse-only interaction | Arrow keys + Enter selection required |
| Missing `alt` on product images | Screen reader gets no context | Dynamic alt: product name + variant |
| Auto-advance carousel without pause control | Fails WCAG 2.2 2.2.2 | No auto-advance unless user-initiated; or provide pause button |

---

## 12. Edge-Case Handling

| Scenario | Behaviour |
|---|---|
| Product title > 40 chars | Clamp to 2 lines, ellipsis; full title in `title` attribute tooltip |
| Price > 4 digits (e.g. $1,200) | Use comma separator; ensure layout does not break |
| No reviews yet | Hide stars row; show `"Be the first to review"` link |
| All sizes out of stock | Show all chips disabled; CTA becomes `"Notify Me"` |
| Single size only | Hide size selector section entirely |
| No pot options | Hide "Select Your Pot" section entirely |
| Image fails to load | Show placeholder with plant icon + `color.surface.strong` bg |
| Description < 3 lines | Show full text; hide "Learn more" trigger |
| Cart add error (network) | Show inline error below CTA: `"Couldn't add to cart. Try again."`, `aria-live="assertive"` |
| Viewport < 320px | Min width `320px`; horizontal scroll disabled; all elements stack |

---

## 13. Responsive Behaviour Summary

| Breakpoint | Layout change |
|---|---|
| `≥ 1024px` Desktop | Two-column 50/50 layout; thumbnails shown as strip; pot cards show 5+ |
| `768–1023px` Tablet | Two-column 45/55; thumbnails strip; pot cards show 3–4 |
| `< 768px` Mobile | Single column; image fills full width; thumbnails become dot carousel; pot cards horizontal scroll snap; CTA full-width; quantity stepper full-width above CTA |
| `< 480px` Small mobile | Font sizes step down one token; CTA and stepper stacked vertically |

---

## 14. QA Checklist

### Visual
- [ ] Page background matches `color.surface.strong` (#fefcf9)
- [ ] All text uses `Outfit` font family
- [ ] No raw hex values in component stylesheets — tokens only
- [ ] CTA button uses `radius.step8` (fully rounded pill)
- [ ] Size chips use `radius.lg = 16px`
- [ ] Pot cards use `radius.md = 12px`
- [ ] Active chip/pot shows `color.surface.raised` fill and border
- [ ] Price updates when size chip changes — no page reload
- [ ] Main image updates when thumbnail clicked — crossfade in `motion.duration.fast`
- [ ] Wishlist heart fills on toggle

### Interaction
- [ ] All buttons and links keyboard-navigable in documented Tab order
- [ ] Arrow keys work on size chips (radiogroup)
- [ ] Arrow keys work on pot cards (radiogroup)
- [ ] Arrow keys work on thumbnail strip (tablist)
- [ ] Escape closes lightbox
- [ ] Focus returns to zoom button after lightbox close
- [ ] Quantity − button disabled at value = 1
- [ ] Add to Cart shows loading spinner, then success/error state

### Accessibility
- [ ] axe DevTools scan: zero critical/serious errors
- [ ] All images have descriptive, dynamic `alt` text
- [ ] All focus rings visible (`2px solid`, `color.surface.raised`)
- [ ] No `outline: none` anywhere in CSS
- [ ] `aria-live` regions announce price, quantity, and cart changes
- [ ] Screen reader announces size selection and price update
- [ ] Lightbox has `aria-modal="true"` and traps focus
- [ ] Breadcrumb has `aria-current="page"` on current item
- [ ] Cart icon announces badge count in `aria-label`
- [ ] WCAG 2.2 AA contrast passed for all text/background pairs

### Content
- [ ] Product title: `Red Anthurium Plant` (sentence case, no ALL CAPS)
- [ ] CTA label: `"Add to Cart"` exactly
- [ ] Prices formatted `$XX.00` with two decimal places
- [ ] Size labels: `Small` / `Medium` / `Large` (not abbreviations)
- [ ] Pot names use product names, not SKU codes
- [ ] "Learn more" present only if description exceeds 3 lines
- [ ] No placeholder/lorem-ipsum copy in production build

### Responsive
- [ ] Layout switches to single column at `< 768px`
- [ ] No horizontal overflow at `320px` viewport width
- [ ] Touch targets ≥ `44×44px` on all interactive elements (mobile)
- [ ] Pot card horizontal scroll snaps correctly on touch

---

*Document version: 1.0 — Synthesised from PDP video analysis + Red Anthurium Plant brief*
*Guideline standard: WCAG 2.2 AA | Token system: Outfit / brand token set*