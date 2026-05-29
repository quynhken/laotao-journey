# Design System — Sổ Tay Hành Trình Của Lão Tào
> Style cloned & adapted from Base44.com — Light Theme

---

## 1. Triết Lý Thiết Kế

Base44 dùng **clean light** — nền trắng thuần, khoảng trắng rộng rãi, typography đen đậm mạnh mẽ, accent cam `#FF631F` nổi bật duy nhất, card xám nhạt, border gần như vô hình.

Lão Tào kế thừa cấu trúc đó nhưng thêm **"warm journal"** — nền trắng ấm ngả cream nhẹ, accent từ cam chuyển sang **"Ember Gold"** gợi ánh nắng và lửa trại, texture giấy cũ tinh tế làm điểm nhấn.

**Hai nguyên tắc cốt lõi:**
1. **Sạch & thoáng** — khoảng trắng là ngôn ngữ, không nhồi nhét
2. **Warm không phải Cold** — trắng ấm, không lạnh như SaaS thông thường

---

## 2. Color System

### Background Layers
```
--bg-base:       #FFFFFF   /* Nền toàn trang — trắng thuần như Base44 */
--bg-warm:       #FDFAF6   /* Nền ấm nhẹ — dùng xen kẽ section */
--bg-surface:    #F7F3EE   /* Card, panel, input background */
--bg-elevated:   #EDE8E0   /* Hover state, tag background */
--bg-overlay:    rgba(247,243,238,0.92) /* Modal backdrop ấm */
```

### Brand Accent — "Ember Gold"
> Base44 dùng cam `#FF631F`. Lão Tào dùng "Ember Gold" — vàng hổ phách ấm hơn, gợi ánh nắng đèo cao, lửa trại đêm Tây Bắc.

```
--accent-500:    #D4820A   /* Primary CTA, active states */
--accent-400:    #E8950E   /* Hover */
--accent-300:    #F5AE2A   /* Tint nhạt, badge bg */
--accent-100:    #FDF3E0   /* Background tint rất nhạt */
--accent-600:    #B06A08   /* Pressed, border đậm */
```

### Semantic Colors
```
--success:       #2D6A3F   /* Cắm Cờ thành công, quiz đúng */
--success-bg:    #EBF5EE   /* Background success */
--danger:        #9B2C2C   /* Quiz sai, locked zone */
--danger-bg:     #FDF0F0   /* Background danger */
--warning:       #92500A   /* Deadline, đếm ngược */
--warning-bg:    #FEF5E7
--info:          #1E4D8C   /* Thông tin phụ */
--info-bg:       #EBF2FB
```

### Text Scale
```
--text-primary:   #111111   /* Tiêu đề, nội dung chính — đen đậm như Base44 */
--text-secondary: #555148   /* Label phụ, metadata — nâu ấm */
--text-tertiary:  #9A948C   /* Placeholder, disabled */
--text-accent:    #D4820A   /* Link, số điểm, badge label */
--text-inverse:   #FFFFFF   /* Text trên nền tối/accent */
--text-muted:     #B8B2AA   /* Caption, hint */
```

### Border Scale
```
--border-subtle:  #EDE8E0   /* Chia tách section nhẹ */
--border-default: #D8D2C8   /* Card border, input border off */
--border-strong:  #C4BBAF   /* Hover, focus nearby */
--border-accent:  #D4820A   /* Active, selected */
```

---

## 3. Typography

### Font Stack
> Base44 dùng sans-serif hiện đại, weight đậm cho headline. Lão Tào giữ lớp sans sạch cho UI nhưng thêm serif ấm cho storytelling — đúng với journal vibe.

```css
/* Display — tên địa điểm lớn, hero headline */
font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
/* Optical size variable, italic đẹp, weight 700–900 */

/* Body — mô tả, quote, nội dung đọc */
font-family: 'Lora', 'Crimson Pro', Georgia, serif;
/* Đọc tốt, italic tự nhiên */

/* UI — label, button, nav, badge, metadata */
font-family: 'DM Sans', 'Plus Jakarta Sans', system-ui, sans-serif;
/* Sạch, dễ đọc nhỏ, weight 400–700 */

/* Mono — điểm số, km, tọa độ, đếm ngược */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale
```
/* Display */
--text-display-xl:  clamp(2rem, 5vw, 3.5rem)   line-height 1.1   weight 800
--text-display-lg:  clamp(1.5rem, 4vw, 2.5rem)  line-height 1.15  weight 700
--text-display-md:  1.5rem                       line-height 1.2   weight 700

/* Body */
--text-body-lg:     1.125rem   line-height 1.75  weight 400
--text-body-md:     1rem       line-height 1.7   weight 400
--text-body-sm:     0.875rem   line-height 1.6   weight 400

/* UI (DM Sans) */
--text-label-lg:    0.875rem   line-height 1.4   weight 600   letter-spacing 0.01em
--text-label-md:    0.8125rem  line-height 1.4   weight 500
--text-label-sm:    0.75rem    line-height 1.4   weight 600   letter-spacing 0.05em   UPPERCASE

/* Mono */
--text-mono-md:     0.875rem   line-height 1.6
--text-mono-sm:     0.75rem    line-height 1.5
```

---

## 4. Spacing System

> Base44 dùng spacing rộng — khoảng trắng thở được. Lão Tào kế thừa.

```
Base unit: 4px

--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
--space-24:  96px
```

**Padding chuẩn:**
- Card: `20px`
- Section mobile: `20px` ngang / `48px` dọc
- Section desktop: `40px` ngang / `64px` dọc
- Modal / Bottom sheet: `24px`

---

## 5. Border Radius

```
--radius-sm:    6px     /* Tag, chip, badge */
--radius-md:    10px    /* Button, input */
--radius-lg:    14px    /* Card, panel */
--radius-xl:    20px    /* Modal, bottom sheet, swipe card */
--radius-2xl:   28px    /* Large feature card */
--radius-full:  9999px  /* Pill button, avatar, progress bar */
```

---

## 6. Elevation & Shadow

> Base44 dùng shadow rất nhẹ, gần flat — depth qua border + background contrast.

```css
/* Level 0 — Flat, chỉ border */
box-shadow: none;
border: 1px solid var(--border-subtle);

/* Level 1 — Card mặc định */
box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px var(--border-subtle);

/* Level 2 — Card hover, dropdown */
box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px var(--border-default);

/* Level 3 — Modal, bottom sheet */
box-shadow: 0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px var(--border-default);

/* Accent glow — CTA hover, active card */
box-shadow: 0 0 0 3px rgba(212,130,10,0.15);

/* Inner — pressed state */
box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
```

---

## 7. Components

---

### Button

```
Variants: Primary | Secondary | Ghost | Danger | Icon-only

Sizes:
  sm:  height 32px  px 12px  text-label-sm
  md:  height 40px  px 16px  text-label-md  ← default
  lg:  height 48px  px 24px  text-label-lg

States: default | hover | pressed | disabled | loading
```

**Primary Button** *(clone Base44 orange CTA)*
```
background:    var(--accent-500)       /* #D4820A */
color:         var(--text-inverse)     /* #FFFFFF */
border-radius: var(--radius-md)
font:          UI / label-md / weight 600
border:        none

hover:         background → var(--accent-400), translateY(-1px)
               box-shadow: 0 4px 12px rgba(212,130,10,0.3)
pressed:       background → var(--accent-600), translateY(0)
disabled:      opacity 0.4, cursor not-allowed
loading:       spinner 16px, text opacity 0
```

**Secondary Button**
```
background:    var(--bg-surface)
border:        1px solid var(--border-default)
color:         var(--text-primary)
font:          UI / label-md / weight 500

hover:         border → var(--border-strong)
               background → var(--bg-elevated)
```

**Ghost Button**
```
background:    transparent
border:        none
color:         var(--text-secondary)

hover:         color → var(--text-primary)
               background → var(--bg-surface)
```

---

### Card

```
background:    var(--bg-base)          /* Trắng thuần */
border:        1px solid var(--border-subtle)
border-radius: var(--radius-lg)
padding:       var(--space-5)
transition:    border-color 200ms, box-shadow 200ms

hover:
  border-color: var(--border-default)
  box-shadow:   Level 2
```

**Card variants:**
- `CardDefault` — content card thông thường, nền trắng
- `CardTinted` — nền `--bg-surface` (xám kem nhạt)
- `CardFeature` — card lớn có ảnh, gradient overlay
- `CardInteractive` — swipe card
- `CardStat` — số lớn + label nhỏ, border accent khi active
- `CardLocked` — overlay xám mờ + icon 🔒

---

### Input / Textarea

```
background:    var(--bg-surface)
border:        1px solid var(--border-default)
border-radius: var(--radius-md)
padding:       12px 16px
color:         var(--text-primary)
placeholder:   var(--text-tertiary)
font:          UI / body-md

focus:
  border-color: var(--accent-500)
  box-shadow:   0 0 0 3px rgba(212,130,10,0.12)
  background:   var(--bg-base)
  outline:      none

error:
  border-color: var(--danger)
  box-shadow:   0 0 0 3px rgba(155,44,44,0.1)
```

---

### Badge / Tag

```
height:        20px (sm) | 24px (md) | 28px (lg)
border-radius: var(--radius-full)
padding:       0 10px
font:          UI / label-sm / weight 600

Variants:
  default:  bg --bg-elevated   border --border-default  color --text-secondary
  accent:   bg --accent-100    border --accent-300       color --accent-600
  success:  bg --success-bg    border --success          color --success
  danger:   bg --danger-bg     border --danger           color --danger
  outline:  bg transparent     border --border-default   color --text-secondary
```

---

### Progress Bar

```
Track:
  height:        6px
  background:    var(--bg-elevated)
  border-radius: var(--radius-full)

Fill:
  background:    linear-gradient(90deg, #2D6A3F 0%, #D4820A 60%, #9B2C2C 100%)
  border-radius: var(--radius-full)
  transition:    width 800ms cubic-bezier(0.4,0,0.2,1)

🏍️ icon:
  position:  absolute, translateX(-50%)
  animation: floatBike 2s ease-in-out infinite
```

---

### Bottom Sheet / Modal

```
Backdrop:
  background:      rgba(17,17,17,0.4)
  backdrop-filter: blur(4px)

Sheet:
  background:    var(--bg-base)
  border-top:    1px solid var(--border-subtle)
  border-radius: var(--radius-xl) var(--radius-xl) 0 0
  padding:       var(--space-6)
  max-height:    90vh

Handle bar:
  width:         36px
  height:        4px
  background:    var(--border-default)
  border-radius: var(--radius-full)
  margin:        0 auto var(--space-5)

Animation:
  Enter: translateY(100%) → translateY(0), 280ms ease-out
  Exit:  translateY(0) → translateY(100%), 220ms ease-in
```

---

### Swipe Card

```
Card:
  background:    var(--bg-base)
  border:        1px solid var(--border-subtle)
  border-radius: var(--radius-xl)
  box-shadow:    Level 2
  overflow:      hidden
  cursor:        grab

Stack depth:
  Card 1 (top):  scale(1)    translateY(0)    z-index 3
  Card 2 (mid):  scale(0.96) translateY(12px) z-index 2
  Card 3 (back): scale(0.92) translateY(24px) z-index 1

Swipe overlay (drag > 40px):
  Phải → rgba(45,106,63,0.88)  + "CẮM CỜ 🚩"
  Trái → rgba(155,44,44,0.88)  + "LẦN SAU 👋"
  Lên  → rgba(212,130,10,0.88) + "WISHLIST ⭐"

Overlay text: display-md, color white, centered, font weight 800
```

---

### Stamp (Flex Book)

```
Size: 64×64px (SVG)

States:
  Locked:
    stroke:  var(--border-default)
    fill:    transparent
    opacity: 0.3
    filter:  grayscale(1)

  Earned:
    stroke:  màu vùng miền
    fill:    tint 15%
    text:    số thứ tự + tên tỉnh viết tắt + ngày

  New (animation stampIn):
    0%:   scale(2.5) rotate(-20deg) opacity(0)
    60%:  scale(0.85) rotate(3deg)  opacity(1)
    100%: scale(1)    rotate(0)     opacity(1)
    duration: 500ms  easing: ease-spring

Regional colors:
  Miền Bắc  (1–25):  #B84C1E  /* Đỏ gạch — đất Bắc */
  Miền Trung (26–44): #D4820A  /* Vàng hổ phách — nắng Trung */
  Miền Nam  (45–63):  #2D6A3F  /* Xanh rêu — xanh Nam */
```

---

### Toast (+điểm)

```
position:      fixed top-20, left 50%, translateX(-50%)
background:    var(--accent-500)
color:         var(--text-inverse)
border-radius: var(--radius-full)
padding:       8px 20px
font:          UI / label-md / weight 700
box-shadow:    0 4px 16px rgba(212,130,10,0.35)
white-space:   nowrap

Animation:
  Enter: stampIn 300ms
  Hold:  1200ms
  Exit:  fadeOut + translateY(-8px) 200ms
```

---

### Live Dot

```
width:         8px
height:        8px
background:    #E53E3E
border-radius: 50%

::after (pulse ring):
  inset:      -4px
  background: #E53E3E
  opacity:    0.3
  animation:  pulseRing 1.5s ease infinite
```

---

## 8. Iconography

```
Library:   Lucide Icons (match Base44)
Sizes:     16px | 20px | 24px
Stroke:    1.5px default / 2px emphasis
Color:     inherit

Custom SVG:
  🗺️  Vietnam silhouette map
  📔  Passport cover minimal
  🚩  Pin + circle stamp
  🔮  Crystal ball minimal
  🏍️  Motorcycle side view
```

---

## 9. Motion & Animation

### Timing Functions
```
--ease-default: cubic-bezier(0.4, 0, 0.2, 1)
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1)   /* Bounce cho stamp/badge */
--ease-out:     cubic-bezier(0, 0, 0.2, 1)
--ease-in:      cubic-bezier(0.4, 0, 1, 1)
```

### Duration Scale
```
--duration-fast:    150ms   /* Hover */
--duration-normal:  250ms   /* Button, card */
--duration-slow:    400ms   /* Modal, sheet */
--duration-story:   800ms   /* Map reveal, fog lift */
```

### Named Animations
```css
@keyframes fogLift {
  from { opacity: 0; filter: blur(12px) saturate(0) brightness(1.2); }
  to   { opacity: 1; filter: blur(0)    saturate(1) brightness(1); }
}

@keyframes stampIn {
  0%   { transform: scale(2.5) rotate(-20deg); opacity: 0; }
  60%  { transform: scale(0.85) rotate(3deg);  opacity: 1; }
  100% { transform: scale(1)    rotate(0);     opacity: 1; }
}

@keyframes marchingAnts {
  to { stroke-dashoffset: -20; }
}

@keyframes floatBike {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}

@keyframes pulseRing {
  0%   { transform: scale(0.9); opacity: 0.6; }
  70%  { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(0.9); opacity: 0; }
}
```

---

## 10. Layout Grid

```
Mobile (< 480px):
  Columns:    1
  Margin:     16px
  Gutter:     12px

Tablet (480–768px):
  Columns:    2
  Margin:     24px
  Gutter:     16px

Desktop (> 768px):
  Columns:    12
  Max-width:  1200px
  Margin:     auto
  Gutter:     24px

App shell max-width:   480px (mobile-first)
Content max-width:     720px (reading)
```

---

## 11. Imagery & Visual Texture

```
Thumbnails:
  aspect-ratio:   16/9
  border-radius:  var(--radius-lg)
  border:         1px solid var(--border-subtle)
  overlay:        linear-gradient(to top, rgba(17,17,17,0.5) 0%, transparent 50%)

Map background:
  base:           var(--bg-warm)           /* Cream nhạt như giấy */
  grid overlay:   stroke #D4820A / opacity 0.08 / spacing 40px
  border:         1px solid var(--border-subtle)

Fog of war:
  background:     var(--bg-elevated)
  filter:         blur(2px) saturate(0) brightness(1.1)
  overlay text:   color --text-muted

Journal texture (decorative):
  SVG feTurbulence noise, opacity 0.025
  Chỉ trên section hero / passport cover
  Không ảnh hưởng readability
```

---

## 12. Accessibility

```
Contrast ratios (WCAG AA):
  text-primary  trên bg-base:     19.1:1  ✓
  text-secondary trên bg-base:     7.4:1  ✓
  accent-500    trên bg-base:      4.6:1  ✓ (large text)
  text-inverse  trên accent-500:   4.8:1  ✓

Focus ring:
  outline:        2px solid var(--accent-500)
  outline-offset: 3px
  border-radius:  inherit

Touch targets:   44×44px minimum
Swipe buttons:   56×56px

Motion:
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms; transition-duration: 0.01ms; }
  }
```

---

## 13. CSS Custom Properties — Full Reference

```css
:root {
  /* Backgrounds — LIGHT */
  --bg-base:         #FFFFFF;
  --bg-warm:         #FDFAF6;
  --bg-surface:      #F7F3EE;
  --bg-elevated:     #EDE8E0;

  /* Accent — Ember Gold */
  --accent-100:      #FDF3E0;
  --accent-300:      #F5AE2A;
  --accent-400:      #E8950E;
  --accent-500:      #D4820A;
  --accent-600:      #B06A08;

  /* Semantic */
  --success:         #2D6A3F;
  --success-bg:      #EBF5EE;
  --danger:          #9B2C2C;
  --danger-bg:       #FDF0F0;
  --warning:         #92500A;
  --warning-bg:      #FEF5E7;
  --info:            #1E4D8C;
  --info-bg:         #EBF2FB;

  /* Text */
  --text-primary:    #111111;
  --text-secondary:  #555148;
  --text-tertiary:   #9A948C;
  --text-accent:     #D4820A;
  --text-inverse:    #FFFFFF;
  --text-muted:      #B8B2AA;

  /* Border */
  --border-subtle:   #EDE8E0;
  --border-default:  #D8D2C8;
  --border-strong:   #C4BBAF;
  --border-accent:   #D4820A;

  /* Regional stamp */
  --region-north:    #B84C1E;
  --region-central:  #D4820A;
  --region-south:    #2D6A3F;

  /* Radius */
  --radius-sm:       6px;
  --radius-md:       10px;
  --radius-lg:       14px;
  --radius-xl:       20px;
  --radius-2xl:      28px;
  --radius-full:     9999px;

  /* Spacing */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-8: 32px;  --space-10: 40px; --space-12: 48px;
  --space-16: 64px; --space-20: 80px;

  /* Duration */
  --duration-fast:   150ms;
  --duration-normal: 250ms;
  --duration-slow:   400ms;
  --duration-story:  800ms;

  /* Easing */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);
  --ease-in:      cubic-bezier(0.4, 0, 1, 1);
}
```

---

*Design System v2.0 — Light Theme*
*Sổ Tay Hành Trình Của Lão Tào · Inspired by Base44.com*
