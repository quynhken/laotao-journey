# Base44 Design System

> **Source:** https://base44.com  
> **Generated:** 2026-05-27  
> **Theme:** Light (single mode)

---

## Brand Overview

Base44's visual identity is built around a single metaphor: the sunset. The orange-striped circle in the logo isn't decorative — it's the conceptual engine of the entire design system. A warm, graduated background washes every hero section from sky blue at the top to ripe peach at the bottom, landing in a full molten orange just before the footer. The canvas is an intentionally impure off-white (#FAF9F7), warm enough to feel human without reading as beige. Headings are set in Miso, a condensed display face whose organic letterforms carry a sense of momentum and optimism, while body copy in DIN Next Light stays precise and functional. The two accent colors — brand orange and lime green — represent opposing energies: the orange is fire (identity, urgency), the lime is growth (invitation, action). Component language is clean and spacious, relying on large-radius white cards floating on gradient backgrounds rather than borders or shadows to create depth. The overall impression is an AI product that feels warm and approachable rather than sterile and technical.

---

## Color System

### Core Palette

| Token | Value | Hex | Role |
|-------|-------|-----|------|
| `canvas` | rgb(250, 249, 247) | `#FAF9F7` | Page background, warm off-white |
| `canvas-pure` | rgb(255, 255, 255) | `#FFFFFF` | Nav bar, card surfaces, modals |
| `ink` | rgb(35, 37, 41) | `#232529` | Primary text, primary button fill |
| `ink-muted` | rgb(114, 114, 114) | `#727272` | Secondary text, nav links, captions |
| `ink-subtle` | rgb(176, 176, 176) | `#B0B0B0` | Disabled states, placeholder text |
| `accent-orange` | rgb(255, 99, 31) | `#FF631F` | Brand identity, logo, footer CTA, active states |
| `accent-lime` | rgb(235, 255, 177) | `#EBFFB1` | Nav CTA button, highlight backgrounds |
| `accent-amber` | rgb(255, 152, 59) | `#FF983B` | Secondary buttons, warm highlights |
| `semantic-new` | rgb(255, 133, 79) | `#FF854F` | "New" badge, promotional labels |
| `hairline` | rgba(35, 37, 41, 0.08) | — | Dividers, FAQ separators |

### Usage Rules

- Reserve `accent-orange` for brand identity elements and maximum-emphasis CTAs only. Never use it as a background for text-heavy sections.
- `accent-lime` is exclusively for the primary nav CTA button. Do not repurpose it for success states or general highlights.
- Use `ink` (#232529) instead of pure black (#000000) for all text — the slight warmth is intentional.
- `canvas` (#FAF9F7) not `canvas-pure` (#FFFFFF) for all page-level backgrounds. Cards sit on `canvas-pure`.

### Gradients

| Token | Value | Usage |
|-------|-------|-------|
| `gradient-hero` | `linear-gradient(180deg, #B4D8E8 0%, #FAE8D0 50%, #FAEABF 100%)` | Hero section full-bleed background |
| `gradient-sunset` | `linear-gradient(180deg, #FFBA80 0%, #FF7B40 60%, #FF631F 100%)` | Bottom CTA "So, what are we building?" section |
| `gradient-card-feature` | `linear-gradient(135deg, #FFD4A8 0%, #FF9A6C 100%)` | Feature card right-side decorative panels |

---

## Typography

### Font Families

| Role | Family | Fallback | Weight |
|------|--------|----------|--------|
| Display / Headings | Miso | sans-serif | Regular (400) |
| Body / UI | DIN Next W01 Light | sans-serif | 300, 400 |
| Open-source substitute (Miso) | — | Rubik, Nunito | — |
| Open-source substitute (DIN Next) | — | Inter, DM Sans | 300, 400 |

### Type Scale

| Token | Size | Line-height | Letter-spacing | Usage |
|-------|------|-------------|----------------|-------|
| `display-xl` | 68px | 1.2em | 0 | Hero headline ("Turn your ideas into apps") |
| `display-lg` | 56px | 1.2em | 0 | Section hero ("Consider yourself limitless") |
| `display-md` | 40px | 1.1em | 0 | Section headings ("Frequently asked questions") |
| `headline` | 24px | 1.3em | 0 | Card headings, subsection titles |
| `body` | 16px | 1.4em | 0 | Body copy, descriptions |
| `body-sm` | 14px | 1.4em | 0 | Secondary UI text, nav links |
| `caption` | 12px | 1.4em | 0.05em | Labels, badges, step counters |

### Typography Rules

- Miso is a display-only typeface. Never use it for body text or anything below 24px.
- The hero headline uses `display-xl` at 68px with Miso Regular. Scaling is fluid via `cqw` units — preserve this behavior.
- Do not bold DIN Next body text. Light (300) weight is the brand voice; bold destroys the airy quality.
- Step counters ("01 / 04") use `caption` in `ink-muted` with monospace-style number spacing.

---

## Spacing & Layout

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Inline gaps, icon margins |
| `space-2` | 8px | Button icon padding |
| `space-3` | 12px | Badge padding |
| `space-4` | 16px | Component internal padding |
| `space-5` | 20px | Card padding (small) |
| `space-6` | 24px | Section sub-gaps |
| `space-8` | 32px | Card padding (standard) |
| `space-10` | 40px | Section vertical padding |
| `space-16` | 64px | Section gaps |
| `space-24` | 96px | Large section spacing |

### Layout

| Token | Value |
|-------|-------|
| `container-max` | 1280px |
| `container-padding` | 40px (desktop), 20px (mobile) |
| `grid-columns` | 12 |
| `grid-gap` | 24px |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 8px | Badges, small chips |
| `rounded-md` | 12px | Input fields, small cards |
| `rounded-lg` | 20px | Feature cards, pricing cards |
| `rounded-xl` | 24px | Feature content panels |
| `rounded-pill` | 100px | Buttons (primary and secondary), nav capsule |
| `rounded-full` | 9999px | Logo icon, avatar circles |

---

## Shadows

No box shadows are used on the primary white feature cards — depth is achieved entirely through background color contrast (white card against gradient). Subtle shadows appear only on the sticky navigation.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-nav` | `0 2px 16px rgba(35, 37, 41, 0.08)` | Sticky nav bar floating shadow |
| `shadow-dropdown` | `0 8px 24px rgba(35, 37, 41, 0.12)` | Dropdown menus, popovers |

---

## Components

### Navigation

- **Container**: White (#FFFFFF), pill/capsule shape, `border-radius: 100px`, `padding: 8px 16px`, subtle `shadow-nav`
- **Logo**: Orange sunset icon + "Base 44" in `ink` (#232529), `font: bold 18px DIN Next`
- **Nav links**: `ink-muted` (#727272), 14px DIN Next Light, no underline; hover → `ink`
- **CTA button**: `background: accent-lime (#EBFFB1)`, `color: ink (#232529)`, `border-radius: rounded-pill`, `padding: 10px 20px`, `font: 14px/400 DIN Next`
- **Position**: Sticky top, centered with max-width `container-max`

### Primary Button (Hero/Cards)

- **Background**: `ink` (#232529)
- **Color**: `canvas-pure` (#FFFFFF)
- **Border-radius**: `rounded-pill` (100px)
- **Padding**: `12px 24px`
- **Font**: `16px / 400 / DIN Next`
- **Hover**: `background: rgba(35, 37, 41, 0.85)`
- **Active**: `transform: scale(0.97)`

### Secondary Button / Nav CTA

- **Background**: `accent-lime` (#EBFFB1)
- **Color**: `ink` (#232529)
- **Border-radius**: `rounded-pill` (100px)
- **Padding**: `10px 20px`
- **Font**: `14px / 400 / DIN Next`
- **Hover**: `background: #D6F090` (slightly deeper lime)

### Feature Card

- **Background**: `canvas-pure` (#FFFFFF)
- **Border-radius**: `rounded-xl` (24px)
- **Padding**: `32px`
- **Shadow**: none — card floats on gradient background
- **Layout**: Two-column split — left: text content; right: product screenshot/illustration
- **Step counter**: `caption`, `ink-muted`, positioned top-left of card

### Tab Switcher

- **Container**: Frosted/semi-transparent pill, `background: rgba(255,255,255,0.6)`, `border-radius: rounded-pill`, `padding: 6px`
- **Active tab**: `canvas-pure` (#FFFFFF), `border-radius: rounded-lg (12px)`, `padding: 8px 20px`
- **Inactive tab**: Transparent background, `ink-muted` text
- **Badge ("New")**: `background: accent-orange (#FF7B50)`, `color: canvas-pure`, `border-radius: rounded-sm (8px)`, `padding: 2px 8px`, `font: 11px/700`

### Accordion (FAQ)

- **Divider**: `hairline` (rgba(35,37,41,0.08)), 1px
- **Question text**: `headline` size, `ink`
- **Expand icon**: `+` symbol, `ink-muted`, transitions to `×` when open
- **No background change** on expand — clean and minimal

### Card (Pricing)

- **Background**: `canvas-pure` (#FFFFFF)
- **Border-radius**: `rounded-lg` (20px)
- **Featured/image card**: full-bleed image with `rounded-lg` clipping
- **Padding**: `32px`

---

## Do's and Don'ts

### Do's

1. **Use the sunset gradient on hero sections.** `gradient-hero` is the brand's signature. Any full-bleed hero should use this gradient (or a tonal variant from it).
2. **Float white cards on gradient backgrounds.** The contrast of `canvas-pure` against the gradient creates depth without shadows. Use `rounded-xl` (24px) for all feature-level cards.
3. **Use `accent-lime` exclusively for the primary nav action.** The lime-green button is the most immediately visible element on the page — reserve it for the single most important action in the nav.
4. **Use Miso at large sizes only** (24px+). Below this threshold, switch to DIN Next. Miso at small sizes loses its character and becomes illegible.
5. **Keep body text in DIN Next Light (300 weight).** The brand voice is open and breathable; heavy body text destroys this.
6. **Use `ink` (#232529) not pure black** for all text. The warmth is deliberate — it harmonizes with the orange palette.
7. **Use the full `gradient-sunset` for major CTA sections.** The warm orange gradient as a section background is the brand's way of saying "this is the conversion moment." Don't dilute it by using it decoratively.

### Don'ts

1. **Don't use `accent-orange` as a text color on `canvas`.** The contrast ratio is insufficient for body copy; use `ink` instead.
2. **Don't add box shadows to feature cards.** The design achieves depth through color contrast alone — adding shadows breaks the floating effect and makes the cards feel heavy.
3. **Don't use Miso below 24px** — letterforms become muddled at small sizes.
4. **Don't use pure white (#FFFFFF) as a page background.** Use `canvas` (#FAF9F7). The warmth is essential to the brand personality.
5. **Don't use `accent-lime` outside the nav button context.** Using it for success messages or general highlights dilutes its signaling function.
6. **Don't center all text.** The feature card body copy is left-aligned. Centered text is reserved for hero headlines and short CTAs only.
7. **Don't use purple, blue, or cool-toned accents** in new components. The palette is intentionally warm — introducing cool tones fractures the sunset metaphor.
