# Admin & Backend Spec — Sổ Tay Hành Trình Của Lão Tào
> v1.0 — Quản trị nội dung, AI location, hệ thống dữ liệu

---

## 1. Kiến Trúc Tổng Thể Admin

```
Admin Panel
├── Dashboard (tổng quan)
├── Hành Trình (Location Manager)
│   ├── Cấp 1: Tỉnh / Thành Phố
│   │   └── Cấp 2: Điểm Đã Đi (thuộc tỉnh đó)
│   ├── Import nhanh từ YouTube Link
│   └── Preview Map & Card
├── Bảng Tin (Content Manager)
│   ├── AI tạo bài từ video
│   └── Quản lý bài đã đăng
├── Gamification
│   ├── Quiz Manager
│   └── Badge & Điểm
├── Người Dùng
│   ├── Danh sách user
│   └── Bảng Phong Thần
└── Cài Đặt
    ├── Live Status
    └── Thông Báo
```

---

## 2. Dashboard

**Mục đích:** Nhìn nhanh toàn bộ trạng thái hành trình.

### Stat Cards (hàng trên)

| Card | Nội dung |
|---|---|
| 📍 Tổng điểm | X tỉnh / X điểm dừng |
| 🟢 Đã publish | X điểm live |
| 👥 Người theo dõi | X user đang đồng hành |
| ⚡ Hoạt động hôm nay | X cắm cờ / X review / X quiz |

### Biểu đồ

- **Timeline hành trình** — trục ngang là ngày, trục dọc là km — hiện tiến độ thực tế vs dự kiến
- **Activity feed** — log real-time: "user A vừa Cắm Cờ tại Hà Giang", "video mới vừa được publish"

### Quick Actions

- `+ Thêm Điểm Mới` → mở Location Manager
- `📺 Import YouTube` → mở YouTube Import modal
- `🔴 Update Live Status` → cập nhật "Lão Tào đang ở..."
- `📣 Gửi Thông Báo` → push notification

---

## 3. Hành Trình — Location Manager

### 3.1 Cấu Trúc 2 Cấp

```
CẤP 1 — TỈNH / THÀNH PHỐ
┌─────────────────────────────────────┐
│ 🔴 01  Hà Giang          [live]     │ ← drag handle, order number
│         3 điểm dừng                 │
│         [▶ Mở rộng] [✏️] [⋮]       │
├─────────────────────────────────────┤
│ ⚪ 02  Cao Bằng          [draft]    │
│         1 điểm dừng                 │
│         [▶ Mở rộng] [✏️] [⋮]       │
└─────────────────────────────────────┘

  ↓ Mở rộng Hà Giang

CẤP 2 — ĐIỂM ĐÃ ĐI (trong Hà Giang)
┌─────────────────────────────────────┐
│   ║ 01.1  Đồng Văn - Cột Cờ Lũng Cú │ ← drag handle
│          21.3°N 105.3°E             │
│          📺 youtu.be/xxx  [live]    │
│          [✏️ Sửa] [👁 Preview] [⋮] │
├─────────────────────────────────────┤
│   ║ 01.2  Mã Pì Lèng     [draft]   │
│          [✏️ Sửa] [👁 Preview] [⋮] │
└─────────────────────────────────────┘
```

### 3.2 CRUD Cấp 1 — Tỉnh / Thành Phố

**Form thêm/sửa tỉnh:**

```
Tên tỉnh/thành phố *        [input]
Mã tỉnh (slug)              [input, auto-generate]
Vùng miền                   [select: Bắc / Trung / Nam]
Thứ tự trong hành trình     [number, hoặc drag]
Trạng thái                  [toggle: Draft / Live]
Ảnh đại diện tỉnh           [upload hoặc lấy từ video]
Mô tả ngắn về tỉnh          [textarea, 200 ký tự]
```

**Actions trên mỗi tỉnh:**
- `Mở rộng / Thu gọn` — xem danh sách điểm cấp 2
- `✏️ Sửa` — edit form tỉnh
- `Publish / Unpublish` — toggle live state
- `⋮ More`: Duplicate, Xoá (confirm dialog)
- `Drag` — kéo thả thứ tự giữa các tỉnh

### 3.3 CRUD Cấp 2 — Điểm Đã Đi

**Form thêm/sửa điểm:**

```
[Section: Thông tin cơ bản]
Tên điểm dừng *             [input]
Thuộc tỉnh *                [select — từ danh sách cấp 1]
Thứ tự trong tỉnh           [number]
Ngày Lão Tào đến            [date picker]

[Section: Vị trí]
Latitude *                  [number input]
Longitude *                 [number input]
                            [hoặc click trên mini-map để chọn]
Km từ Hà Nội               [number, auto-calculate nếu có lat/lng]

[Section: Nội dung]
Link YouTube                [input URL]
Video ID                    [auto-extract từ URL]
Mô tả ngắn (excerpt)       [textarea, 300 ký tự]
Quote nổi bật               [textarea, 150 ký tự — hiện italic trên card]
Ảnh thumbnail               [auto-fetch từ YouTube / upload]

[Section: Hiển thị]
Hiện trên Map               [toggle]
Hiện trong Quẹt Card        [toggle]
Trạng thái                  [Draft / Live]
Fog of War                  [toggle — locked cho khán giả]
```

**Actions trên mỗi điểm:**
- `✏️ Sửa` — mở form edit
- `👁 Preview` — xem trước card như khán giả thấy
- `Publish / Unpublish`
- `Drag` — kéo thả thứ tự trong tỉnh
- `⋮ More`: Move sang tỉnh khác, Duplicate, Xoá

---

## 4. YouTube Import — AI Location Extractor

### 4.1 Flow Import Nhanh

```
Admin click "📺 Import YouTube"
    │
    ▼
[Import Modal]
  Input: Dán link YouTube
  Button: "Phân Tích AI"
    │
    ▼
[Loading state]
  "AI đang xem video... (10-30s)"
  Spinner animation
    │
    ▼
[Kết Quả AI] — 2 cột
  Trái: Thumbnail video + tiêu đề YouTube
  Phải: Form đã điền sẵn:
    - Tên điểm dừng (AI đề xuất)
    - Tỉnh/thành (AI đề xuất)
    - Latitude / Longitude (AI đề xuất)
    - Mô tả ngắn (AI tóm tắt từ nội dung)
    - Quote nổi bật (AI chọn câu hay nhất)
    - Ngày (lấy từ ngày đăng video)

  Admin review, sửa nếu cần
    │
    ├─ Button "Lưu Draft" → lưu nhưng không publish
    ├─ Button "Lưu & Publish" → publish ngay
    └─ Button "Hủy"
```

### 4.2 AI Extraction Logic

**Input gửi cho AI:**
- YouTube video ID
- Title + description từ YouTube Data API
- Transcript (nếu có auto-caption)
- Thumbnail URL

**Prompt hướng dẫn AI:**
```
Phân tích nội dung video du lịch Việt Nam.
Trả về JSON:
{
  "stop_name": "Tên điểm dừng ngắn gọn",
  "province": "Tỉnh/thành phố",
  "region": "Bắc|Trung|Nam",
  "lat": number,
  "lng": number,
  "km_from_hanoi": number,
  "excerpt": "Mô tả 2-3 câu, giọng văn gần gũi GenZ",
  "quote": "1 câu quote hay nhất từ nội dung",
  "date_visited": "YYYY-MM-DD hoặc null",
  "confidence": "high|medium|low"
}
```

**Confidence indicator:**
- `high` → Hiện badge xanh "AI tự tin" — admin thường không cần sửa
- `medium` → Hiện badge vàng "Cần kiểm tra" — highlight các field cần review
- `low` → Hiện badge đỏ "Cần bổ sung" — nhiều field trống, admin tự điền

### 4.3 Batch Import

```
Admin upload file CSV với nhiều YouTube URLs
    │
    ▼
Hệ thống xử lý lần lượt (queue)
Hiện progress: "3 / 10 video đã xử lý"
    │
    ▼
Kết quả: Bảng list tất cả đã extract
Admin review từng dòng, toggle publish
Button "Publish tất cả đã chọn"
```

---

## 5. Location List — Nguồn Dữ Liệu Tổng Hợp

Đây là bảng master data — mọi tính năng đều lấy từ đây.

### 5.1 Bảng Location (database table)

```sql
locations
  id            UUID primary key
  province_id   UUID → provinces.id
  order_global  INT  -- thứ tự toàn hành trình (dùng cho map)
  order_local   INT  -- thứ tự trong tỉnh
  name          TEXT
  slug          TEXT unique
  lat           DECIMAL(9,6)
  lng           DECIMAL(9,6)
  km_from_hanoi INT
  youtube_id    TEXT
  excerpt       TEXT
  quote         TEXT
  thumbnail_url TEXT
  date_visited  DATE
  show_on_map   BOOLEAN default true
  show_on_cards BOOLEAN default true
  is_locked     BOOLEAN default false  -- fog of war
  status        ENUM('draft','live')
  created_at    TIMESTAMP
  updated_at    TIMESTAMP
```

```sql
provinces
  id            UUID primary key
  order         INT
  name          TEXT
  slug          TEXT unique
  region        ENUM('north','central','south')
  description   TEXT
  image_url     TEXT
  status        ENUM('draft','live')
```

### 5.2 Cách Các Tính Năng Dùng Location

| Tính năng | Filter |
|---|---|
| **Map** | `show_on_map = true AND status = live` — hiển thị theo `order_global` |
| **Quẹt Card** | `show_on_cards = true AND status = live` — random hoặc theo `order_global` |
| **Chặng Strip** | Tất cả `status = live`, theo `order_global` |
| **Fog of War** | `is_locked = true` → pin ẩn trên map, card bị blur |
| **Stamp Grid** | Tất cả provinces, cả locked lẫn live |
| **Bảng Tin** | `youtube_id IS NOT NULL AND status = live` |

### 5.3 Preview Tổng Hợp

Admin có màn hình **"Preview Tổng Hợp"** — xem đúng như khán giả thấy:

```
[Tab: Bản Đồ]   [Tab: Danh Sách Card]   [Tab: Raw Data]

Bản Đồ: Map SVG preview với tất cả pin hiện tại
Danh Sách Card: Grid các card theo thứ tự — kéo thả để sắp xếp lại thứ tự xuất hiện trong Quẹt Card
Raw Data: Bảng JSON export để debug
```

---

## 6. Bảng Tin — Content Manager

### 6.1 Danh Sách Bài

```
Filter: [Tất cả] [Draft] [Live] [AI Generated] [Đã chỉnh sửa]
Sort: Mới nhất / Cũ nhất / Theo địa điểm

Mỗi bài:
┌────────────────────────────────────────┐
│ [Thumbnail] Tên địa điểm · Ngày        │
│             Tiêu đề bài viết           │
│             Type: Blog / Social / Tóm  │
│             [✏️ Sửa] [👁] [Publish] [🗑]│
└────────────────────────────────────────┘
```

### 6.2 AI Tạo Bài

```
Admin chọn location từ danh sách
    │
    ▼
Chọn loại bài:
  ☑ Blog (400-600 từ, kể chuyện)
  ☑ Social Post (150-200 từ, hashtag)
  ☑ Tóm tắt (2-3 câu, cho preview)
    │
    Button "AI Viết Bài"
    │
    ▼
AI generate cả 3 cùng lúc — hiện tab riêng từng loại
Admin review, chỉnh sửa inline (rich text editor nhẹ)
    │
    ├─ "Lưu Draft"
    ├─ "Publish Ngay"
    └─ "Viết Lại" → AI generate lại (có thể thêm gợi ý)
```

### 6.3 Rich Text Editor

- Bold / Italic / Underline
- Heading H2 / H3
- Bullet list
- Quote block (cho câu trích dẫn nổi bật)
- Emoji picker
- Không cần: table, code block

---

## 7. Gamification Manager

### 7.1 Quiz Manager

**Danh sách quiz:**

```
Filter theo location | Tìm kiếm câu hỏi

Mỗi quiz set (gắn với 1 location):
  Location: Hà Giang — Đồng Văn
  Số câu: 3
  Đã được làm: 128 lần
  Tỷ lệ đúng: 64%
  [✏️ Sửa] [+ Thêm câu] [🗑 Xoá]
```

**Form thêm/sửa câu hỏi:**

```
Câu hỏi *                 [input]
Loại                      [select: Trắc nghiệm / Đúng-Sai]
Đáp án A *                [input]
Đáp án B *                [input]
Đáp án C                  [input, optional]
Đáp án D                  [input, optional]
Đáp án đúng *             [select: A / B / C / D]
Giải thích (hiện sau khi trả lời) [textarea, optional]
Điểm thưởng              [number, default 50]
```

**AI Gợi Ý Quiz:**

```
Button "AI Gợi Ý Câu Hỏi" trên mỗi location
    │
    ▼
AI đọc excerpt + quote + tên địa điểm
Đề xuất 3-5 câu hỏi
Admin chọn câu nào để giữ lại
```

### 7.2 Badge Manager

```
Danh sách badge + điều kiện
Admin có thể:
  - Sửa tên / mô tả / icon
  - Sửa điều kiện (số lượng, ngưỡng điểm)
  - Thêm badge mới cho event đặc biệt (VD: badge mùa lễ tết)
  - Ẩn/hiện badge

Form badge:
  Icon (emoji)          [input]
  Tên *                 [input]
  Mô tả *               [textarea]
  Loại điều kiện        [select]:
    - Số lần cắm cờ ≥ N
    - Tổng điểm ≥ N
    - Số quiz đúng ≥ N
    - Số review ≥ N
    - Đoán đúng ≥ N lần
    - Custom (nhập tay)
  Giá trị N             [number]
  Event badge           [toggle — chỉ active trong khoảng thời gian]
    Từ ngày / Đến ngày  [date range]
```

---

## 8. Quản Lý Người Dùng

### 8.1 Danh Sách User

```
Search: tên / ID
Filter: Top 10% / Mới nhất / Ít hoạt động

Mỗi user:
  Avatar | Tên | Điểm | Cắm Cờ | Ngày tham gia | Hoạt động cuối
  [👁 Xem chi tiết]
```

**User Detail:**

```
Profile: tên, điểm, ngày tham gia
Flex Book: danh sách stamp đã có
Activity log: cắm cờ ở đâu, khi nào, quiz gì
Badge đã nhận
```

### 8.2 Bảng Phong Thần Admin View

```
Xem theo: Tuần / Tháng / Toàn thời gian
Export CSV
Reset bảng (khi kết thúc season)
```

---

## 9. Live Status & Thông Báo

### 9.1 Live Status Panel

```
Lão Tào đang ở:     [input text — hiện ngay trên header app]
Trạng thái:         [toggle: LIVE 🔴 / CHỜ ⏰]

Nếu CHỜ:
  Video tiếp theo dự kiến:  [datetime picker]
  Tỉnh dự kiến (ẩn):        [select — dùng để reveal khi đúng]

Button "Cập Nhật Ngay" → push xuống app real-time (Supabase realtime)
```

### 9.2 Push Notification Manager

```
Tạo thông báo:
  Tiêu đề *         [input, max 50 ký tự]
  Nội dung *        [textarea, max 150 ký tự]
  Deep link         [select: Bản Đồ / Điểm cụ thể / Predict Modal / Leaderboard]
  Gửi đến           [All users / Top fans / Inactive users]
  Gửi lúc           [Ngay / Lên lịch datetime]

Lịch sử thông báo:
  Đã gửi | Tiêu đề | Số người nhận | Tỷ lệ tap
```

**Auto-notification triggers (admin bật/tắt):**

| Trigger | Nội dung |
|---|---|
| Publish location mới | "🏍️ Lão Tào vừa đến [Tên]! Vào Cắm Cờ +100đ" |
| 1h trước video dự kiến | "⏰ Lão Tào sắp đến chỗ mới! Đoán thử đi?" |
| User chưa vào 7 ngày | "👋 Lão Tào nhớ mày! Ghé xem hành trình nhé" |
| User lên top 10 | "🏆 Mày vừa vào Top 10 Bảng Phong Thần!" |

---

## 10. Cài Đặt Hệ Thống

```
[Season Management]
  Season hiện tại: Season 1 — Xuyên Việt
  Tên season       [input]
  Mô tả            [textarea]
  Ngày bắt đầu    [date]
  Ngày kết thúc   [date, optional]
  Button "Kết Thúc Season & Bắt Đầu Season Mới"
    → Archive toàn bộ leaderboard
    → Reset điểm (tùy chọn)
    → Tạo badge "Hoàn Thành Season 1"

[Map Config]
  Tổng km hành trình    [number, default 1726]
  Điểm xuất phát        [input, default "Hà Giang"]
  Điểm đích             [input, default "TP. Hồ Chí Minh"]
  Hiện progress bar     [toggle]

[Gamification Config]
  Điểm cắm cờ          [number, default 100]
  Điểm quiz đúng        [number, default 50]
  Điểm viết review      [number, default 20]
  Điểm đặt cược        [number, default 20]
  Điểm đoán đúng bonus  [number, default 100]
  Điểm wishlist         [number, default 10]

[YouTube API]
  API Key               [input, masked]
  Test Connection       [button]

[App Info]
  Tên app               [input]
  Tagline               [input]
  YouTube Channel URL   [input]
  Meta description      [textarea — cho SEO]
```

---

## 11. Backend — Data Architecture

### Stack

```
Frontend admin:  Next.js + Tailwind (same codebase với public app)
Database:        Supabase (PostgreSQL)
Auth admin:      Supabase Auth — role: admin
Realtime:        Supabase Realtime — live status, leaderboard
Storage:         Supabase Storage — thumbnails, uploads
AI:              Claude API (location extract, bài viết)
YouTube:         YouTube Data API v3 (metadata, transcript)
Push notif:      Web Push API + Service Worker
```

### Database Schema

```sql
-- Provinces (Cấp 1)
provinces (id, order, name, slug, region, description, image_url, status)

-- Locations (Cấp 2)
locations (id, province_id, order_global, order_local, name, slug,
           lat, lng, km_from_hanoi, youtube_id, excerpt, quote,
           thumbnail_url, date_visited, show_on_map, show_on_cards,
           is_locked, status, created_at, updated_at)

-- Users
users (id, display_name, created_at, last_active_at, total_points)

-- User Stamps (cắm cờ)
user_stamps (id, user_id, location_id, stamped_at)

-- User Reviews
user_reviews (id, user_id, location_id, rating, content, created_at)

-- User Quiz Results
user_quiz_results (id, user_id, location_id, score, total, played_at)

-- User Predictions
user_predictions (id, user_id, province_predicted, created_at, is_correct)

-- User Badges
user_badges (id, user_id, badge_id, earned_at)

-- Badges
badges (id, icon, name, description, condition_type, condition_value,
        is_event, event_start, event_end, is_active)

-- Quiz Questions
quiz_questions (id, location_id, question, option_a, option_b,
                option_c, option_d, correct_answer, explanation, points)

-- Articles (Bảng Tin)
articles (id, location_id, type, title, content, status,
          ai_generated, created_at, published_at)

-- Notifications Log
notification_logs (id, title, body, deep_link, sent_to, sent_at, tap_count)

-- Live Status (single row)
live_status (id, current_location_text, is_live, next_video_at,
             next_province_hint, updated_at)

-- App Settings (key-value)
app_settings (key, value, updated_at)
```

### API Endpoints (Supabase + Edge Functions)

```
-- Public (khán giả)
GET  /locations?status=live&show_on_map=true
GET  /locations?status=live&show_on_cards=true
GET  /provinces?status=live
GET  /live-status
GET  /articles?status=live
GET  /leaderboard?period=week

-- Authenticated (user)
POST /user/stamp          { location_id }
POST /user/review         { location_id, rating, content }
POST /user/prediction     { province_id }
POST /user/quiz-result    { location_id, score, total }
GET  /user/profile        -- stamps, badges, points

-- Admin only
POST /admin/locations     -- create
PUT  /admin/locations/:id -- update
DEL  /admin/locations/:id -- delete
POST /admin/ai/extract    { youtube_url } -- AI location extract
POST /admin/ai/article    { location_id, types[] } -- AI viết bài
POST /admin/notify        { title, body, deep_link, target }
PUT  /admin/live-status   { text, is_live, next_video_at }
POST /admin/batch-import  { urls[] } -- batch YouTube import
```

### Realtime Subscriptions

```javascript
// Live status → tất cả clients cập nhật ngay
supabase.channel('live_status').on('UPDATE', handler)

// Leaderboard → cập nhật khi có stamp/quiz mới
supabase.channel('leaderboard').on('INSERT', handler)

// New location unlock → trigger fog lift animation
supabase.channel('locations').on('UPDATE',
  filter: 'status=eq.live', handler)
```

---

## 12. Admin UI — Design Notes

### Theme
- Dùng chung Design System với public app (light theme)
- Sidebar trái: `--bg-surface` (#F7F3EE)
- Content area: `--bg-base` (#FFFFFF)
- Header admin: `--bg-base`, border-bottom `--border-subtle`

### Sidebar Navigation

```
┌──────────────────┐
│ 🗺️ Lão Tào Admin │  logo
├──────────────────┤
│ 📊 Dashboard     │
│ 📍 Hành Trình    │  ← active
│ 📰 Bảng Tin      │
│ 🎮 Gamification  │
│ 👥 Người Dùng    │
│ 🔔 Thông Báo     │
│ ⚙️ Cài Đặt       │
├──────────────────┤
│ 👁 Xem Website   │  link ra public
└──────────────────┘
```

### Drag & Drop Reorder

- Dùng thư viện: `@dnd-kit/core`
- Visual feedback: item đang drag nổi lên, shadow level 3
- Auto-save thứ tự sau khi thả (optimistic update)
- Toast xác nhận: "Đã cập nhật thứ tự"

### Confirm Dialogs

- Xoá location: "Xoá [Tên điểm]? Hành động này không thể hoàn tác."
- Unpublish: "Ẩn [Tên điểm] khỏi app? Khán giả sẽ không thấy nữa."
- Reset season: "Kết thúc Season 1? Leaderboard sẽ được archive."

---

*Admin & Backend Spec v1.0*
*Sổ Tay Hành Trình Của Lão Tào*
