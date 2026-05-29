# Product Spec — Sổ Tay Hành Trình Của Lão Tào
> Feature & Screen Specification v2.0 — Light Theme

---

## Tổng Quan

**Tên app:** Sổ Tay Hành Trình Của Lão Tào
**Tagline:** Không tốn tiền vé. Không xin phép sếp. Không lo say xe.
**Concept:** Companion app — khán giả đồng hành cùng hành trình thật của Lão Tào theo thời gian thực.
**Platform:** Web app, mobile-first, PWA
**Tone:** GenZ, vui tươi, nhẹ nhàng
**Theme:** Light — nền trắng ấm, accent Ember Gold

---

## Kiến Trúc Màn Hình

```
App
├── Splash / Onboarding
├── Home
│   ├── Header — Live Status Bar
│   ├── Tab: Bản Đồ
│   │   ├── Game Map (Fog of War)
│   │   ├── Stop Detail Panel
│   │   └── Chặng Strip (scroll ngang)
│   ├── Tab: Khám Phá (Quẹt Card)
│   │   ├── Card Stack
│   │   ├── Review Sheet
│   │   └── Wishlist
│   ├── Tab: Flex Book
│   │   ├── Passport Cover
│   │   ├── Stamp Grid
│   │   └── Badge Collection
│   └── Tab: Bảng Tin
│       └── Video Feed
├── Modal: Hỏi Xoáy Đáp Xoay
├── Modal: Tao Biết Mày Đi Đâu
├── Modal: Review Địa Điểm
└── Modal: Bảng Phong Thần
```

---

## Màn Hình Chi Tiết

---

### 1. Splash / Onboarding

**Background:** `--bg-warm` (#FDFAF6) — trắng kem nhẹ

**Elements:**
- Logo + tên app (font display, `--text-primary`)
- Tagline: *"Thôi đi thôi."* (font body italic, `--text-secondary`)
- Animation xe máy chạy ngang trái → phải
- CTA: **"Bắt Đầu Đi Ké"** (primary button, accent gold)
- Input tên (optional): *"Bạn tên gì để Lão Tào gọi?"*

---

### 2. Header — Live Status Bar

**Background:** `--bg-base` (#FFFFFF)
**Border bottom:** `1px solid --border-subtle`
**Height:** 56px / Fixed top

| Zone | Nội dung |
|---|---|
| Trái | Logo nhỏ + tên app (`--text-primary`) |
| Giữa | `● Lão Tào đang ở: [Tên]` — dot đỏ pulse |
| Phải | Flex Điểm ⚡ (`--accent-500`) + nút 🔮 |

**Trạng thái:**
- `LIVE` — badge xanh lá nhỏ, text `--success`
- `CHỜ` — đếm ngược font mono, color `--warning`

---

### 3. Tab Bar

**Background:** `--bg-base`
**Border top:** `1px solid --border-subtle`
**Height:** 60px / Fixed bottom

| Tab | Icon | Label |
|---|---|---|
| 1 | 🗺️ | Bản Đồ |
| 2 | 🃏 | Khám Phá |
| 3 | 📔 | Flex Book |
| 4 | 📰 | Bảng Tin |

**Active:** label + icon đổi sang `--accent-500`, underline bar 2px accent

---

### 4. Tab: Bản Đồ

#### Game Map

**Background:** `--bg-warm` (cream nhạt gợi giấy cũ)
**Border:** `1px solid --border-subtle`
**Border-radius:** `--radius-lg`
**Height:** 320px

**States điểm dừng:**

| State | Visual |
|---|---|
| Đã đến + Cắm Cờ | Circle `--accent-500`, số, ✓ trắng |
| Đã đến, chưa Cắm Cờ | Circle `--bg-elevated`, border `--border-default` |
| Chưa đến (locked) | Circle `--bg-elevated`, text `--text-muted`, fog overlay |
| Active | Pulse ring `--accent-300` |

**Decorative:**
- Grid tọa độ: stroke `--accent-500` / opacity 8%
- Route line: `--accent-500` stroke-dasharray, marching ants
- Compass rose: stroke `--border-default`, fill `--bg-surface`
- Progress bar: gradient xanh → gold → đỏ, 🏍️ float

**Progress Bar:**
```
HN 0km ————[🏍️]————————— SG 1726km
Gradient: --success → --accent-500 → --danger
Track: --bg-elevated
```

#### Stop Detail Panel

**Background:** `--bg-base`
**Border:** `1px solid --border-subtle`
**Border-radius:** `--radius-lg`

**Elements (unlocked):**
- Thumbnail 16:9, border-radius `--radius-md`
- Order badge: bg `--accent-500`, text white
- Ngày: font mono, `--text-tertiary`
- Tên địa điểm: font display, `--text-primary`
- Địa chỉ + km: font mono sm, `--text-secondary`
- Quote: font body italic, `--text-secondary`
- **Cắm Cờ** 🚩 — primary button / disabled state: bg `--success-bg`, border `--success`, text `--success`
- **Hỏi Xoáy Đáp Xoay** 📝 — secondary button
- Button YouTube: bg `#FF0000`, text white

**Elements (locked):**
- Thumbnail: overlay `--bg-elevated` 80% + icon 🌫️ `--text-muted`
- Text: *"Vùng Chưa Phá Đảo"* — `--text-tertiary`

#### Chặng Strip

Scroll ngang, card `72×80px`, bg `--bg-surface`, border `--border-subtle`

- Số thứ tự: mono, `--text-secondary`
- Tên tỉnh: label-sm, `--text-primary`
- Active: border `--accent-500`, bg `--accent-100`
- Locked: opacity 35%
- Cắm Cờ: badge ✓ `--success`

---

### 5. Tab: Khám Phá (Quẹt Card)

#### Card Stack

**Card size:** 320×420px
**Background:** `--bg-base`
**Border:** `1px solid --border-subtle`
**Border-radius:** `--radius-xl`
**Box-shadow:** Level 2

**Layout card:**
```
┌─────────────────────────┐
│                         │
│      [Ảnh địa điểm]     │  60% height
│   gradient overlay bot  │
├─────────────────────────┤  bg: --bg-base, padding 16px
│  📍 Tên · Tỉnh · N km   │  text-secondary, label-sm
│                         │
│  "Quote ngắn 1 câu"     │  body italic, text-secondary
│                         │
│  ⭐⭐⭐⭐☆  4.2 · 128 rv │  accent-500 sao, text-tertiary count
└─────────────────────────┘
```

**Swipe overlays:**

| Hướng | Bg | Text |
|---|---|---|
| Phải ❤️ | `rgba(45,106,63,0.9)` | CẮM CỜ 🚩 |
| Trái 👎 | `rgba(155,44,44,0.9)` | LẦN SAU 👋 |
| Lên ⭐ | `rgba(212,130,10,0.9)` | WISHLIST ⭐ |

**Buttons dưới stack:**
- ✕ circle 56px — border `--danger` / bg white
- ★ circle 56px — border `--accent-500` / bg white
- 🚩 circle 56px — bg `--success` / icon white

**Empty state:**
> *"Lão Tào vẫn đang đi. Chặng mới sắp ra — chờ tí nhé!"* 🏍️
> bg `--bg-surface`, border `--border-subtle`, text `--text-tertiary`

#### Review Sheet (Bottom Sheet)

**Background:** `--bg-base`
**Border-radius:** `--radius-xl --radius-xl 0 0`

**Elements:**
- Handle bar: `--border-default`
- Thumbnail nhỏ 40px + tên địa điểm: `--text-primary`
- Star rating: ⭐ tap — filled `--accent-500` / empty `--bg-elevated`
- Textarea: bg `--bg-surface`, border `--border-default`
- Counter: `xx / 150`, `--text-tertiary`, mono
- Quick chips: bg `--bg-surface`, border `--border-default`, hover `--accent-100` / `--border-accent`
  - `Đẹp vãi 😍` `Đồ ăn ngon 🍜` `Đường khó đi 😅`
  - `Nhất định quay lại 🔥` `Lạnh lắm 🥶` `Đông khách 🧍`
- **"Đăng Review +20đ"** — primary button
- "Bỏ qua" — ghost button

#### Wishlist

Grid 2 cột, card: bg `--bg-surface`, thumbnail + tên + button "Cắm Cờ"

---

### 6. Tab: Flex Book

#### Passport Cover

**Background:** linear-gradient(`--bg-surface`, `--bg-warm`)
**Border:** `1px solid --border-default`
**Border-radius:** `--radius-xl`

**Elements:**
- Label nhỏ: `CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM` — label-sm uppercase, `--text-tertiary`
- Tiêu đề: **FLEX BOOK** — display-lg, `--text-primary`
- Icon 🗺️ 48px
- Tên user: body-md, `--text-secondary`
- 3 stat (border giữa `--border-subtle`):

| Stat | Color |
|---|---|
| X Cắm Cờ 🚩 | `--accent-500` |
| X Danh Hiệu 🎖️ | `--text-primary` |
| X Flex Điểm ⚡ | `--accent-500` |

#### Stamp Grid

**Label:** `TRANG CẮM CỜ (5/63)` — label-sm uppercase, `--text-secondary`
**Grid:** 4 cột, gap 12px

**Stamp states:**

| State | Stroke | Fill | Opacity |
|---|---|---|---|
| Locked | `--border-default` | transparent | 30%, grayscale |
| Earned | regional color | regional tint 15% | 100% |
| New | regional color | regional tint | stampIn animation |

**Regional colors:**
- Miền Bắc: `#B84C1E` đỏ gạch
- Miền Trung: `#D4820A` vàng gold
- Miền Nam: `#2D6A3F` xanh rêu

#### Badge Collection

**Label:** `DANH HIỆU (3/8)` — label-sm uppercase, `--text-secondary`
**Grid:** 3 cột

**Card state earned:** bg `--accent-100`, border `--accent-300`
**Card state locked:** bg `--bg-surface`, border `--border-subtle`, opacity 40%, grayscale

| Icon | Tên | Điều kiện |
|---|---|---|
| 🧭 | Người Theo Dõi | Đăng ký |
| 🎬 | Khán Giả Cứng | Xem 3 video |
| 🚩 | Cắm Cờ Khắp Nơi | Cắm 5 điểm |
| 🔮 | Tiên Tri | Đoán đúng 1 lần |
| 📝 | Học Giả Đường Trường | Quiz đúng 5 câu |
| ⭐ | Siêu Fan | Đạt 500 Flex Điểm |
| 🃏 | Thánh Quẹt | Quẹt 20 card |
| ✍️ | Nhà Phê Bình | Viết 5 review |

---

### 7. Tab: Bảng Tin

**Background:** `--bg-base`

**Filter chips:** scroll ngang, bg `--bg-surface`, active: bg `--accent-100` border `--accent-500`
`Tất cả` · `Mới nhất` · `Miền Bắc` · `Miền Trung` · `Miền Nam`

**Video Card:**
```
┌─────────────────────────┐  bg: --bg-base
│   [Thumbnail YouTube]   │  16:9, radius --radius-md
│   gradient overlay bot  │
├─────────────────────────┤  padding 16px
│  📍 Địa điểm · Ngày     │  label-sm, --text-tertiary
│  Tên video              │  label-lg bold, --text-primary
│  "Trích dẫn ngắn..."    │  body italic, --text-secondary
│  [▶ Xem Video]          │  bg #FF0000, text white, radius-full
└─────────────────────────┘  border: --border-subtle
```

---

### 8. Modal: Hỏi Xoáy Đáp Xoay

**Background:** `--bg-base`
**Header bg:** `--bg-surface`, border-bottom `--border-subtle`

**Layout:**
- Header: `QUIZ · [TÊN ĐỊA ĐIỂM]` (label-sm uppercase, `--text-secondary`) + progress pill
- Câu hỏi: body-lg, `--text-primary`
- 4 lựa chọn: bg `--bg-surface`, border `--border-default`, radius `--radius-md`

**States sau chọn:**
- Đúng: bg `--success-bg`, border `--success`, text `--success`
- Sai: bg `--danger-bg`, border `--danger`, text `--danger` — đáp án đúng highlight success
- Auto next 900ms

**Kết quả:** icon lớn + điểm + primary button "Tiếp Tục"

---

### 9. Modal: Tao Biết Mày Đi Đâu

**Background:** `--bg-base`

**Elements:**
- Câu hỏi: body-lg, `--text-primary`
- Grid 2×2 tỉnh locked: bg `--bg-surface`, border `--border-default`
- Selected: bg `--accent-100`, border `--accent-500`, text `--accent-600`
- CTA: **"Đặt Cược 🔮 +20đ"** — primary button

**State đã dự đoán:**
- Badge tỉnh đã chọn: bg `--accent-100`, border `--accent-300`
- Text: *"Chờ Lão Tào ra video tiếp theo nhé!"* — `--text-secondary`
- Nếu đúng: confetti + toast `+100đ` + badge 🔮

---

### 10. Modal: Bảng Phong Thần

**Background:** `--bg-base`

**Tabs:** bg `--bg-surface`, active tab: bg `--bg-base`, border-bottom `--accent-500`
`Tuần này` · `Tháng này` · `Toàn thời gian`

**Top 3 podium:**
- 🥇 vàng `#D4820A` / 🥈 bạc `#9E9488` / 🥉 đồng `#B84C1E`

**Rank list:**
- Row bg: `--bg-base`, hover `--bg-surface`
- Self highlight: bg `--accent-100`, border-left 3px `--accent-500`
- Sticky bottom: self rank row

---

## Hệ Thống Flex Điểm

| Hành động | Điểm |
|---|---|
| Đăng ký lần đầu | +50 |
| Cắm Cờ địa điểm | +100 |
| Quiz đúng 1 câu | +50 |
| Viết review | +20 |
| Đặt cược dự đoán | +20 |
| Đoán đúng (bonus) | +100 |
| Quẹt Wishlist | +10 |

---

## Micro-interactions

| Sự kiện | Animation |
|---|---|
| Cắm Cờ lần đầu | stampIn — bounce + rotate, bg flash `--accent-100` |
| Nhận Danh Hiệu | Confetti (màu accent) + card glow `--accent-300` |
| Quiz đúng | Row bg flash `--success-bg` + toast điểm |
| Quẹt Card | Fly out + next slide up |
| Unlock địa điểm | fogLift — blur + saturate |
| Flex Điểm cộng | Toast pill vàng fade từ top |
| Tab switch | Cross-dissolve 150ms |
| Button hover | translateY(-1px) + shadow tăng |

---

## Responsive

| Breakpoint | Layout |
|---|---|
| Mobile `< 480px` | 1 cột, bottom tab bar, full bleed |
| Tablet `480–768px` | 1 cột rộng, tăng padding |
| Desktop `> 768px` | 2 cột: Map trái + Feed phải, top nav thay tab bar |

---

## Component Checklist cho Figma Make

- [ ] Header / Live Status Bar (light)
- [ ] Tab Bar — 4 states
- [ ] Game Map — cream bg, light pin states
- [ ] Stop Card — locked / unlocked
- [ ] Stop Detail Panel (light)
- [ ] Swipe Card — front / 3 overlay states
- [ ] Review Bottom Sheet (light)
- [ ] Passport Cover (warm gradient)
- [ ] Stamp — locked / earned / new
- [ ] Badge Card — locked / earned
- [ ] Quiz Modal — question / correct / wrong / result
- [ ] Predict Modal — default / voted / correct
- [ ] Leaderboard Modal — podium / list
- [ ] Toast (+điểm, gold)
- [ ] Progress Bar + 🏍️
- [ ] Countdown Timer
- [ ] Feed Card (video)
- [ ] Filter Chips
- [ ] Wishlist Grid
- [ ] Empty States — mỗi tab
- [ ] Onboarding Screen

---

*Product Spec v2.0 — Light Theme*
*Sổ Tay Hành Trình Của Lão Tào*
