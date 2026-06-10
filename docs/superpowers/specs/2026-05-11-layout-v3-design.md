# SPA V3 Layout Design

**Date:** 2026-05-11
**Status:** Approved
**Approach:** Hướng 2 — Tách component (Incremental + Clean separation)

---

## Tổng quan

Cải tiến layout cho Micro ERP SPA V3 (Nuxt 3 + shadcn-vue + Tailwind v4), lấy cảm hứng từ layout cũ nhưng nâng cấp toàn diện về UX và component quality.

---

## Kiến trúc Layout

```
layouts/admin.vue
├── AppSidebar.vue          ← sidebar full-height, white bg
└── <main column>
    ├── AppTopbar.vue       ← topbar chỉ trong vùng main (bên phải sidebar)
    └── <slot />            ← page content
```

**Cấu trúc DOM:**
```
<div class="flex h-screen overflow-hidden">
  <AppSidebar />
  <div class="flex flex-col flex-1 min-w-0">
    <AppTopbar />
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
  </div>
</div>
```

---

## AppSidebar.vue

### Kích thước & trạng thái
- Mặc định: **240px** (mở rộng, icon + label)
- Thu gọn: **64px** (icon-only, tooltip label on hover)
- Toggle qua `layoutStore.toggleSidebar()`
- Trên mobile: dùng shadcn `Sheet` từ trái

### Màu sắc
- Background: `#ffffff` (trắng)
- Border right: `border-r border-gray-100`
- Nav item mặc định: `text-slate-500`, hover `bg-slate-50 text-slate-900`
- Nav item active: `bg-blue-50 text-blue-700` (primary color)
- Active icon: `stroke-blue-700`

### Brand area (top)
- Logo: `<img src="~/assets/images/new-logo.png">` — không có text
- Height: 64px, centered, `padding: 12px 16px`
- Border bottom nhẹ: `border-b border-slate-100`

### Navigation groups
| Group label | Items |
|---|---|
| Tổng quan | Bảng điều khiển |
| Module | Nghỉ phép, Chấm công, Tăng ca, Tuyển dụng, Dự án, Đánh giá, Tài sản, Hợp đồng, Nhân viên |
| Hệ thống | Cài đặt |

- Section labels: `text-[10px] font-semibold uppercase tracking-widest text-slate-400`
- Permission guard giữ nguyên logic hiện tại (`permissionStore.hasModule`)
- Badge số (ví dụ Tuyển dụng): `bg-blue-100 text-blue-700 rounded-full text-[10px]`

### Icons
- Thư viện: **lucide-vue-next** (đã có trong `package.json`)
- Không dùng emoji, không dùng FontAwesome cho nav items
- Mapping:

| Route | Lucide icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Nghỉ phép | `CalendarX` |
| Chấm công | `Clock` |
| Tăng ca | `Timer` |
| Tuyển dụng | `UserPlus` |
| Dự án | `FolderKanban` |
| Đánh giá | `Star` |
| Tài sản | `Monitor` |
| Hợp đồng | `FileText` |
| Nhân viên | `Users` |
| Cài đặt | `SlidersHorizontal` |

### Footer (bottom)
- User info: avatar (initials gradient) + tên đầy đủ + email
- Icon `ChevronsUpDown` bên phải
- Click → (future) user settings sheet
- Ẩn text khi sidebar thu gọn

---

## AppTopbar.vue

### Vị trí
Topbar **chỉ nằm trong cột main** (bên phải sidebar), không span toàn width. Sidebar và topbar không chia sẻ hàng ngang.

### Nội dung (trái → phải)
1. **Hamburger toggle** — icon `PanelLeftClose` / `PanelLeftOpen`, click gọi `layoutStore.toggleSidebar()`
2. **Breadcrumb** — động từ `layoutStore.pageTitle`, dạng `Tổng quan / Bảng điều khiển`
3. **Flex spacer**
4. **Search** — icon button `Search` (lucide)
5. **Dark mode toggle** — icon `Moon` / `Sun` (lucide), gọi `useTheme().toggle()`
6. **Notification bell** — `AppNotificationBell` hiện có (giữ nguyên), icon `Bell`
7. **Divider** — `w-px h-5 bg-gray-200`
8. **User button** — Avatar (28px, gradient blue, initials) + tên đầy đủ + `ChevronDown`

### User Dropdown (shadcn `DropdownMenu`)
```
┌─────────────────────┐
│ [Avatar] Tên        │
│         email       │
├─────────────────────┤
│ 👤 Hồ sơ cá nhân   │
│ 🔑 Đổi mật khẩu    │
├─────────────────────┤
│ 🚪 Đăng xuất       │
└─────────────────────┘
```
- Dùng shadcn `DropdownMenu`, `DropdownMenuSeparator`, `DropdownMenuLabel`
- Logout gọi `useAuth().logout()` rồi redirect `/user/login`

### Style
- Height: 56px
- Background: `#ffffff`, `border-b border-gray-100`
- Icon buttons: 34×34px, `rounded-lg hover:bg-slate-50`

---

## home-admin.vue (Dashboard page)

### Stat cards (mới thêm)
3 cards hàng ngang phía trên tabs:
- Tổng nhân viên (icon `Users`, blue)
- Dự án đang chạy (icon `FolderKanban`, green)
- Kỳ đánh giá hiện tại (icon `Star`, amber)

Dùng shadcn `Card` hoặc custom với `bg-white border border-gray-100 rounded-xl`.

### Tabs
Dùng shadcn `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`:
- Tab 1: Thông tin công ty
- Tab 2: Thông tin của bạn
- Tab 3: Thông tin dự án

### Widgets (Tab 1 — Thông tin công ty)
2 cột:
- **Nhắc nhở** (trái): danh sách sự kiện (sinh nhật, hết hợp đồng...), dot màu theo urgency (amber = sắp tới, green = xa, blue = khác). Bọc trong shadcn `Card`.
- **Nhân viên theo chức vụ** (phải): horizontal bar chart dùng `chart.js` (giữ nguyên `AppChart`). Bọc trong shadcn `Card`.

---

## Công nghệ & thư viện sử dụng

| Mục | Thư viện |
|---|---|
| Icons | `lucide-vue-next` (đã cài) |
| UI components | `reka-ui` + shadcn-vue pattern (đã cài) |
| Layout state | `layoutStore` (Pinia, đã có) |
| Mobile sidebar | shadcn `Sheet` |
| User dropdown | shadcn `DropdownMenu` |
| Tabs | shadcn `Tabs` |
| Charts | `chart.js` + `AppChart.vue` (giữ nguyên) |
| CSS | Tailwind v4 + CSS variables (đã cài) |

---

## Files cần tạo / sửa

| File | Hành động |
|---|---|
| `layouts/admin.vue` | Refactor: bỏ sidebar+topbar inline, dùng components mới |
| `components/layout/AppSidebar.vue` | Tạo mới |
| `components/layout/AppTopbar.vue` | Tạo mới (tách từ admin.vue) |
| `pages/home-admin.vue` | Thêm stat cards, wrap widgets trong shadcn Card, dùng shadcn Tabs |
| `public/logo.png` | Copy `micro-erp-spa/assets/images/new-logo.png` → `micro-erp-spa-v3/public/logo.png`, dùng `src="/logo.png"` trong img tag |
| `stores/layout.ts` | Giữ nguyên (sidebarOpen, pageTitle đã có) |

---

## shadcn-vue components cần scaffold

Dự án dùng `reka-ui` (primitive) nhưng chưa có component files shadcn-vue. Cần tạo thủ công hoặc dùng shadcn-vue CLI:

| Component | Dùng ở đâu |
|---|---|
| `components/ui/DropdownMenu.vue` (+ sub-components) | AppTopbar user menu |
| `components/ui/Sheet.vue` (+ sub-components) | Mobile sidebar |
| `components/ui/Tabs.vue` (+ sub-components) | home-admin dashboard |
| `components/ui/Card.vue` | Widget wrappers |
| `components/ui/Separator.vue` | DropdownMenu divider |
| `components/ui/Avatar.vue` | User avatar |

> Nếu đã có sẵn một số components, bỏ qua bước tạo cho component đó.

---

## Không thay đổi

- Logic auth middleware
- Permission guard trong nav items
- `AppNotificationBell.vue`
- `AppToast.vue`
- `useTheme` composable
- Tất cả pages khác ngoài `home-admin.vue`
- i18n keys hiện có
