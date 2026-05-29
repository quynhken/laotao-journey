# User Flow Spec — Sổ Tay Hành Trình Của Lão Tào
> Bổ sung cho Product Spec v2.0 — Flows, States, Edge Cases

---

## 1. Onboarding Flow

### Lần đầu vào app

```
Mở app
    │
    ▼
[Splash Screen]
  Logo + xe máy animation 1.5s
    │
    ▼
[Step 1 / 3 — Chào]
  "Thôi đi thôi."
  Mô tả ngắn về app
  → Button "Bắt Đầu Đi Ké"
    │
    ▼
[Step 2 / 3 — Tên]
  "Bạn tên gì để Lão Tào gọi?"
  Input tên (optional)
  → Button "Tiếp" / Skip "Để sau"
    │
    ▼
[Step 3 / 3 — Thông báo]
  "Bật thông báo để biết khi Lão Tào đến chỗ mới nhé!"
  → Button "Bật Thông Báo" (native permission)
  → Skip "Thôi kệ"
    │
    ├─ Bật → Request permission → Home
    └─ Skip → Home
    │
    ▼
[Home — Tab Bản Đồ]
  Toast: "+50đ Chào mừng bạn đến với hành trình! 🏍️"
```

### Các lần vào sau
```
Mở app → Home (tab cuối cùng đã dùng)
  Nếu có video mới → Banner notification ở top
  Nếu có địa điểm mới unlock → Map tự scroll đến điểm đó
```

---

## 2. Flow: Khám Phá Bản Đồ

```
[Tab Bản Đồ]
    │
    ├─ Tap điểm UNLOCKED trên map
    │     │
    │     ▼
    │  [Stop Detail Panel] slide up
    │     │
    │     ├─ Tap "Cắm Cờ" (chưa cắm)
    │     │     │
    │     │     ▼
    │     │  Animation stampIn
    │     │  Toast "+100đ · Cắm Cờ! 🚩"
    │     │  Button đổi → disabled "✓ Đã Cắm Cờ"
    │     │  Check badge conditions → nếu đủ → Badge notification
    │     │
    │     ├─ Tap "Hỏi Xoáy Đáp Xoay"
    │     │     └─ → [Quiz Modal] (xem flow 4)
    │     │
    │     ├─ Tap "Xem Video YouTube"
    │     │     └─ → Mở YouTube external link
    │     │
    │     └─ Swipe down / tap ngoài
    │           └─ Panel đóng lại
    │
    ├─ Tap điểm LOCKED trên map
    │     │
    │     ▼
    │  [Stop Detail Panel] — locked state
    │  "Vùng Chưa Phá Đảo"
    │  Button "Theo Dõi Kênh" → YouTube channel link
    │
    └─ Tap Progress Bar 🏍️
          │
          ▼
       Tooltip: "Đã đi 763 / 1726 km · 44%"
```

---

## 3. Flow: Quẹt Card

```
[Tab Khám Phá]
    │
    ▼
[Card Stack] — hiện card đầu tiên chưa quẹt
    │
    ├─ SWIPE PHẢI (hoặc tap 🚩)
    │     │
    │     ▼
    │  Overlay xanh "CẮM CỜ 🚩"
    │  Card fly out phải
    │  Next card slide lên
    │     │
    │     ▼
    │  [Review Sheet] slide up tự động
    │     │
    │     ├─ Chọn sao + viết review → Tap "Đăng +20đ"
    │     │     │
    │     │     ▼
    │     │  Toast "+20đ · Review đã đăng! ✍️"
    │     │  Sheet đóng
    │     │  Cắm Cờ tự động (+100đ, không hiện lại toast)
    │     │
    │     └─ Tap "Bỏ qua"
    │           │
    │           ▼
    │        Sheet đóng
    │        Cắm Cờ vẫn được tính (+100đ toast)
    │
    ├─ SWIPE TRÁI (hoặc tap ✕)
    │     │
    │     ▼
    │  Overlay đỏ "LẦN SAU 👋"
    │  Card fly out trái
    │  Next card slide lên
    │  Không có action gì thêm
    │
    ├─ SWIPE LÊN (hoặc tap ★)
    │     │
    │     ▼
    │  Overlay vàng "WISHLIST ⭐"
    │  Card fly out lên
    │  Next card slide lên
    │  Toast "+10đ · Đã lưu Wishlist!"
    │
    ├─ Tap card (không drag)
    │     │
    │     ▼
    │  [Card Detail Bottom Sheet]
    │  Ảnh lớn + full mô tả + tất cả reviews
    │  Button "Cắm Cờ" + "Lưu Wishlist"
    │
    └─ Hết card (empty state)
          "Lão Tào vẫn đang đi. Chặng mới sắp ra — chờ tí nhé! 🏍️"
          Button "Xem Wishlist" | "Về Bản Đồ"
```

---

## 4. Flow: Quiz (Hỏi Xoáy Đáp Xoay)

```
[Stop Detail Panel]
    │
    Tap "Hỏi Xoáy Đáp Xoay"
    │
    ▼
[Quiz Modal] slide up
    │
    ▼
[Câu 1/N]
  Hiện câu hỏi + 4 lựa chọn
    │
    Tap đáp án
    │
    ├─ ĐÚNG
    │   Row flash green
    │   Checkmark animation
    │   Chờ 900ms
    │   → Câu tiếp theo (nếu còn)
    │
    └─ SAI
        Row flash red
        Highlight đáp án đúng (green)
        Chờ 900ms
        → Câu tiếp theo (nếu còn)
    │
    ▼
[Kết Quả]
  N/Total đúng
  Điểm tổng cộng
  Icon: 🏆 (full) / ⭐ (>50%) / 💀 (<50%)
  Toast điểm
  Check badge conditions
    │
    ├─ Button "Thử Lại" (nếu không full điểm)
    │     └─ Reset quiz, câu hỏi random lại
    │
    └─ Button "Tiếp Tục"
          └─ Đóng modal, về Stop Detail Panel
```

---

## 5. Flow: Dự Đoán (Tao Biết Mày Đi Đâu)

```
Header → Tap nút 🔮
    │
    ▼
[Predict Modal]
    │
    ├─ CHƯA DỰ ĐOÁN
    │   Hiện grid 2×2 tỉnh chưa unlock
    │   Tap 1 tỉnh → highlight selected
    │   Tap "Đặt Cược 🔮 +20đ"
    │       │
    │       ▼
    │   Lưu prediction
    │   Toast "+20đ · Đã đặt cược!"
    │   Modal đổi sang state "Đã dự đoán"
    │   Đóng sau 2s hoặc tap ngoài
    │
    └─ ĐÃ DỰ ĐOÁN
        Hiện tỉnh đã chọn (badge)
        Đếm ngược đến video tiếp theo
        "Chờ Lão Tào ra video nhé!"
        Button "Đổi Dự Đoán" (chỉ cho phép 1 lần/tuần)

--- Khi video mới ra & địa điểm unlock ---

    ├─ ĐÚNG
    │   Push notification: "🔮 Mày đoán đúng rồi! +100đ"
    │   Vào app → Confetti full screen 2s
    │   Toast "+100đ · Tiên Tri! 🔮"
    │   Badge 🔮 "Tiên Tri" unlock nếu lần đầu
    │
    └─ SAI
        Không có notification đặc biệt
        Predict modal reset → cho phép dự đoán lại
```

---

## 6. Flow: Flex Book & Stamp

```
[Tab Flex Book]
    │
    ▼
[Passport Cover] — stats overview
    │
    Scroll xuống
    │
    ▼
[Stamp Grid]
    │
    ├─ Tap stamp EARNED
    │     │
    │     ▼
    │  [Stamp Detail Tooltip/Sheet]
    │  Tên địa điểm + ngày cắm + km
    │  Quote từ video
    │  Button "Xem Video" (nếu có)
    │
    ├─ Tap stamp LOCKED (địa điểm đã unlock, chưa cắm)
    │     │
    │     ▼
    │  [Prompt Sheet]
    │  "Lão Tào đã đến đây! Bạn chưa Cắm Cờ."
    │  Button "Cắm Cờ Ngay +100đ"
    │      └─ → stampIn animation → toast
    │
    └─ Tap stamp LOCKED (địa điểm chưa unlock)
          Tooltip nhỏ: "Vùng Chưa Phá Đảo 🌫️"
    │
    Scroll tiếp
    │
    ▼
[Badge Collection]
    │
    ├─ Tap badge EARNED
    │     Tooltip: tên + điều kiện + ngày nhận
    │
    └─ Tap badge LOCKED
          Tooltip: điều kiện cần đạt + progress bar
          VD: "Cắm 3/5 điểm để mở khoá"
```

---

## 7. Flow: Share

```
[Flex Book — Passport Cover]
    │
    Tap nút Share (icon ↗)
    │
    ▼
[Share Sheet] — native OS share
  Preview image: Passport Cover snapshot
  Text gợi ý: "Tao đã đi cùng Lão Tào qua X tỉnh! 🏍️"
  Options: Copy link | Instagram Story | Facebook | Twitter/X
    │
    └─ Share thành công → Toast "Đã share! +10đ"

---

[Stop Detail Panel]
    │
    Tap nút Share
    │
    ▼
[Share Sheet]
  Preview: Thumbnail địa điểm + tên + stamp của user
  Text: "Lão Tào vừa đến [Tên địa điểm] — tao đã Cắm Cờ rồi! 🚩"
```

---

## 8. Flow: Notification

### Khi video mới ra
```
Background → Push notification:
  "🏍️ Lão Tào vừa đến [Tên địa điểm]! Vào Cắm Cờ nhận 100đ"
    │
    Tap notification
    │
    ▼
App mở → Tab Bản Đồ
  Map auto-scroll + highlight điểm mới
  fogLift animation
  Stop Detail Panel tự mở
  Badge mới nếu có → notification overlay
```

### Khi sắp có video
```
Push notification (1h trước dự kiến):
  "⏰ Lão Tào sắp ghé chỗ mới! Đoán xem đâu?"
    │
    Tap → Predict Modal mở thẳng
```

### In-app notification banner
```
Vị trí: dưới Header, trên Tab content
Height: 44px
Background: --accent-100, border-bottom --accent-300
Text: "🎉 Điểm mới vừa mở khoá — Hà Giang đang chờ bạn Cắm Cờ!"
  → Tap → scroll đến điểm đó
  → Tap ✕ → dismiss
Auto-dismiss sau 5s
```

---

## 9. Flow: Profile & Settings

```
[Flex Book — Passport Cover]
    │
    Tap avatar / tên user
    │
    ▼
[Profile Sheet] (Bottom Sheet)
    │
    ├─ Đổi tên hiển thị
    │     Input → Save
    │
    ├─ Chia sẻ Flex Book
    │     → Share flow (xem flow 7)
    │
    ├─ Thông báo
    │     Toggle: Video mới / Điểm mới / Quiz mới
    │
    ├─ Reset tiến độ
    │     Confirm dialog: "Xoá hết tem và điểm?"
    │     → Confirm → Reset + Toast "Đã reset"
    │
    └─ Về kênh YouTube
          → External link
```

---

## 10. Edge Cases & Error States

### Mất mạng
```
Map: Hiện cached data, banner "Đang offline — dữ liệu có thể chưa cập nhật"
Cắm Cờ: Cho phép offline, sync khi có mạng lại
Quiz: Không load được → "Không kết nối được. Thử lại sau."
Review: Queue local, gửi khi online
```

### Chưa có data
```
Tab Bản Đồ — chưa có điểm nào:
  Illustration xe máy + "Lão Tào chưa lên đường. Theo dõi để không bỏ lỡ!"
  Button "Theo Dõi Kênh YouTube"

Tab Khám Phá — chưa có card:
  "Chưa có địa điểm nào. Lão Tào đang chuẩn bị lên đường!"

Bảng Phong Thần — chưa có user khác:
  "Bạn đang dẫn đầu một mình! Rủ bạn bè vào đây nào."
```

### Lỗi load ảnh
```
Thumbnail: placeholder màu --bg-elevated + icon 🏔️ center
```

### User chưa đặt tên
```
Bảng Phong Thần: Hiển thị "Lữ Khách #[4 số cuối ID]"
Passport Cover: "Khách Lữ Hành"
```

---

## 11. Flow: Bảng Phong Thần

```
Header → Tap Flex Điểm (số)
    │
    ▼
[Leaderboard Modal] slide up
    │
    ▼
Default: Tab "Tuần này"
    │
    ├─ Podium Top 3 (1-2-3)
    │   Avatar + tên + điểm + số tỉnh đã cắm
    │
    ├─ List Rank 4–20
    │   Row: rank # | avatar | tên | điểm
    │   Tap row → Profile mini (tên + tỉnh đã cắm)
    │
    ├─ Self row (sticky bottom nếu ngoài top 20)
    │   Highlight --accent-100
    │   Hiện rank thực của mình
    │
    └─ Switch tab → Tháng này / Toàn thời gian
          Animate transition, load data mới
```

---

## 12. State Machine: Điểm Dừng

```
LOCKED (chưa unlock)
    │
    Lão Tào đến + admin publish video
    │
    ▼
UNLOCKED (đã unlock, chưa cắm cờ)
    │
    User tap "Cắm Cờ" / Swipe phải card
    │
    ▼
STAMPED (đã cắm cờ)
    │
    User viết review
    │
    ▼
REVIEWED (đã cắm + có review)

---
States visible trên map:
  LOCKED   → fog overlay, ? text
  UNLOCKED → circle rỗng, số thứ tự
  STAMPED  → circle filled --accent-500, ✓
  REVIEWED → circle filled --accent-500, ✓ + star icon nhỏ
```

---

## 13. State Machine: Video / Bài Viết

```
DRAFT (admin tạo, chưa publish)
  → Chỉ admin thấy
    │
    Admin publish
    │
    ▼
PUBLISHED
  → Unlock địa điểm tương ứng
  → Push notification gửi đi
  → Bảng Tin hiện bài
  → Map fog lift animation
    │
    Không có unpublish trong MVP
```

---

## 14. Flow: Filter Video Trên Bản Đồ

```
[Tab Bản Đồ]
    │
    ▼
[Thanh Filter Video] — nằm dưới card Tiến độ
  Chips: Tất cả | Tập 01 | Tập 02 | Tập 03 | … | Sắp tới
    │
    ├─ Tap chip "Tất cả"
    │     │
    │     ▼
    │  Hiện toàn bộ marker (mọi tập + locked)
    │  Bottom sheet đang mở → đóng lại
    │
    ├─ Tap chip "Tập N"
    │     │
    │     ▼
    │  Chỉ hiện marker thuộc tập N
    │  Marker khác fade out 200ms
    │  Map giữ nguyên viewport
    │  Bottom sheet đang mở → đóng
    │
    └─ Tap chip "Sắp tới"
          │
          ▼
       Chỉ hiện marker locked
       Marker đã unlock fade out
```

Edge cases:
- Filter Tập rỗng (không có điểm) → giữ map trống, không hiện toast
- Filter đang Tập N + tap marker khác tập → marker vẫn ẩn, không thể chọn được
- Khi switch tab rồi quay lại → filter reset về "Tất cả"

---

## 15. Flow: Tab Bảng Tin

```
[Tab Bảng Tin]
    │
    ▼
[Header section]
  "BẢNG TIN · N VIDEO"
  "Lão Tào lên sóng"
    │
    ▼
[Filter chips] — scroll ngang
  Tất cả | Mới nhất | Miền Bắc | Miền Trung | Miền Nam
    │
    ├─ Tap chip
    │     │
    │     ▼
    │  List video filter lại theo region/sort
    │  Chip active đổi style (accent-100 bg)
    │
    ▼
[Video Card list]
    │
    ├─ Tap thumbnail / "Xem Video"
    │     │
    │     ▼
    │  Mở YouTube external (deeplink nếu có app)
    │  Khi quay lại app → đánh dấu video đã xem (badge dot biến mất)
    │
    ├─ Tap MapPin trên card
    │     │
    │     ▼
    │  Switch sang Tab Bản Đồ
    │  Auto-scroll tới điểm tương ứng
    │  Mở Stop Detail Panel
    │
    └─ Scroll xuống cuối
          │
          ▼
       Empty state: "Hết rồi! Theo dõi kênh để biết tập mới."
```

Edge cases:
- Video chưa publish → không xuất hiện trong list (xem state machine 13)
- Mất mạng → hiện cached list + banner offline
- Filter region không có video → "Chưa có video ở vùng này"

---

## 16. Flow: Filter Tab Khám Phá

```
[Tab Khám Phá] — Card Stack mode
    │
    ▼
[Filter Chips] (region/loại)
  Tất cả | Ăn | Ngủ | Cảnh đẹp | Đường đi
    │
    Tap chip
    │
    ▼
Card Stack reset → chỉ load card khớp filter
Counter "X / Y card" update
    │
    └─ Nếu kết quả rỗng
          "Không có địa điểm nào khớp. Thử lọc khác xem?"
          Button "Bỏ Filter"
```

---

## 17. Flow: Tab Navigation

```
[Tab Bar] — sticky bottom, 4 tabs
  Bản Đồ | Khám Phá | Flex Book | Bảng Tin
    │
    ├─ Tap tab khác
    │     │
    │     ▼
    │  Active indicator slide sang tab mới (200ms)
    │  Content fade swap (150ms)
    │  Scroll position của tab cũ được lưu lại
    │  State của modal/sheet tab cũ → đóng hết
    │
    ├─ Double-tap tab đang active
    │     │
    │     ▼
    │  Scroll to top của tab đó (smooth)
    │  Reset filter về mặc định (nếu có)
    │
    └─ Badge dot trên tab
          Bản Đồ: điểm mới unlock chưa xem
          Bảng Tin: video mới chưa xem
          Flex Book: badge mới earn chưa xem
          → Tap tab → dot biến mất
```

---

## 18. Flow: First-Run Coach Marks

```
Sau Onboarding lần đầu vào Tab Bản Đồ
    │
    ▼
[Coach Mark 1/4] — overlay dim toàn screen
  Spotlight trên Header Flex Điểm
  Tooltip: "Đây là điểm thưởng của bạn"
  Button "Tiếp" / "Bỏ qua tour"
    │
    ▼
[Coach Mark 2/4]
  Spotlight nút 🔮
  "Đoán nơi Lão Tào sẽ đến để +100đ!"
    │
    ▼
[Coach Mark 3/4]
  Spotlight marker đầu tiên trên map
  "Tap để xem chi tiết và Cắm Cờ"
    │
    ▼
[Coach Mark 4/4]
  Spotlight Tab Bar
  "Khám Phá có card quẹt, Flex Book là sổ tem của bạn"
  Button "Bắt đầu thôi!"
    │
    ▼
Toast: "Lão Tào chào mừng bạn! 🏍️"
Flag onboarding=done → không hiện lại
```

Edge cases:
- Tap "Bỏ qua tour" bất kỳ bước → flag done, không bao giờ hiện lại
- App killed giữa chừng → next launch resume từ bước đang dở

---

## 19. Flow: Daily Login Reward

```
Mở app (mỗi ngày 1 lần)
    │
    ▼
Check lastLoginDate
    │
    ├─ Cùng ngày → bỏ qua
    │
    ├─ Hôm qua (streak liên tục)
    │     │
    │     ▼
    │  [Daily Reward Modal] center
    │  "Ngày thứ N liên tiếp! 🔥"
    │  Hiện row 7 ngày, ngày N highlight
    │  Reward: +10đ × N (cap 70đ)
    │  Button "Nhận!"
    │     └─ Toast "+Nđ · Streak ngày thứ N!"
    │
    └─ Cách >1 ngày (đứt streak)
          [Daily Reward Modal]
          "Bắt đầu lại từ ngày 1"
          +10đ
          Streak reset = 1
```

---

## 20. Flow: Badge Unlock

```
Action bất kỳ (cắm cờ / quiz / predict đúng / share)
    │
    ▼
Check badge conditions (background)
    │
    Nếu đạt điều kiện badge mới
    │
    ▼
Queue badge notification
    │
    Sau toast điểm 800ms (tránh chồng)
    │
    ▼
[Badge Unlock Overlay] — center, full backdrop blur
  Badge icon zoom-in + glow animation 600ms
  Confetti burst
  "BADGE MỚI 🎖️"
  Tên badge + mô tả
  Button "Xem Bộ Sưu Tập" → Tab Flex Book + scroll Badge section
  Button "Đóng" (auto-dismiss 4s)
    │
    └─ Đóng → badge dot xuất hiện trên Tab Flex Book
```

Edge cases:
- Nhiều badge unlock cùng lúc → queue, hiện lần lượt
- App background lúc unlock → hiện khi user mở lại app

---

*User Flow Spec v1.1*
*Sổ Tay Hành Trình Của Lão Tào*
