# Thay thế giao diện ERP-v3 bằng design `new-erp` trên nền Nuxt 4 (SPA)

- **Ngày:** 2026-06-10
- **Trạng thái:** Design — chờ review
- **Phạm vi:** Giai đoạn 1 — thay toàn bộ lớp giao diện + chuẩn hóa cấu trúc. **Chưa apply API.**

## 1. Bối cảnh & mục tiêu

`micro-erp-spa-v3` hiện là một ứng dụng **Nuxt 3 (ssr:false)** trưởng thành: ~64 pages, 21 Pinia stores, 18 composables, bộ UI shadcn-vue (135 component), i18n vi/en/ja, Firebase auth, vee-validate.

Thư mục `new-erp/` chứa một **prototype thiết kế React (Babel + Tailwind CDN)** độ trung thực cao cho cùng hệ thống ERP nội bộ của VNLab — sơ đồ trang trùng gần như 1-1 với v3.

**Mục tiêu giai đoạn 1:** Thay toàn bộ lớp trình bày của v3 bằng design `new-erp`, port sang Vue/Nuxt, **dựng lại cấu trúc dự án theo chuẩn Nuxt 4 hiện đại**, chạy với **mock data**. Logic gọi API sẽ được làm ở một plan migrate riêng (giai đoạn 2).

### Tiêu chí thành công
- Dự án chạy trên **Nuxt 4** (`app/` dir), `ssr: false`, build & dev sạch lỗi, typecheck pass.
- Toàn bộ trang chính của design hiển thị **đúng như mockup** (theme/dark/accent/density hoạt động).
- Có **bộ component design-system mới** (thuần Vue, bám prototype 1-1) + layout (Sidebar/Topbar/PageShell).
- Chart **giống mockup tuyệt đối** và **reactive theo accent**.
- Dữ liệu tách riêng trong `app/mocks/`; component không gọi data trực tiếp → sẵn sàng cắm API sau.
- Code thừa (thư viện/cấu hình không dùng) đã được loại bỏ; **một** package manager duy nhất (pnpm).

## 2. Quyết định nền tảng (đã chốt)

| Hạng mục | Quyết định | Lý do |
|---|---|---|
| Nền tảng | **Nuxt 4**, `ssr: false` (SPA) | App nội bộ sau auth, không cần SSR; Nuxt là meta-framework Vue chuẩn & hiện đại; giữ file-routing/auto-import/i18n/plugin |
| Logic cũ | **Dọn sạch, xây lại** | stores/composables/plugins/components cũ bị gỡ; logic viết mới ở plan migrate API |
| Component | **Xây bộ mới thuần Vue**, bám prototype 1-1; bỏ shadcn-vue | Khớp design tuyệt đối |
| A11y widget phức tạp | **reka-ui (headless)** cho Select/Dialog/Tooltip/Popover/Tabs | Tận dụng focus-trap/keyboard/aria, vẫn tự style 100% |
| CSS | **Tailwind v4** (`@tailwindcss/vite`, CSS-first `@theme`) | Prototype viết bằng Tailwind |
| Font | **@nuxt/fonts** self-host: Plus Jakarta Sans, Noto Sans JP, Lora, JetBrains Mono | Nhanh, không phụ thuộc CDN |
| Icon | **lucide-vue-next** | Khớp icon stroke-style prototype |
| i18n | **@nuxtjs/i18n** (vi/en/ja) | Giữ chuẩn Nuxt |
| State | **Pinia 3** + `@pinia/nuxt` | Mock store nhẹ giai đoạn này |
| Form | vee-validate + @vee-validate/zod + zod | Dùng khi migrate |
| Charts | **Hybrid** (xem mục 5) | Đẹp + hợp lý kỹ thuật |
| Package manager | **pnpm** | Nhanh, chuẩn 2026 |
| Lint/format | **@nuxt/eslint** (flat) + prettier | Chuẩn Nuxt 4 |
| Test | **vitest** + `@nuxt/test-utils` (unit/component) + Playwright (e2e) | |

## 3. Cấu trúc thư mục đích (Nuxt 4)

```
micro-erp-spa-v3/
├─ app/                          # srcDir mặc định Nuxt 4
│  ├─ assets/css/main.css        # Tailwind v4 entry + @theme tokens + base styles (port prototype)
│  ├─ components/
│  │  ├─ base/                   # Button, Badge, Avatar, Input, Select, Table, Pagination,
│  │  │                          #   Modal, Drawer, Toast, Tabs, FilterBar, FieldInput, MiniStat
│  │  ├─ layout/                 # Sidebar, Topbar, Breadcrumb, PageShell, PageHeader, TweaksPanel
│  │  ├─ charts/                 # Sparkline, BarRow, Donut, StackedBar (SVG/CSS) + LineChart (Unovis)
│  │  └─ <feature>/              # member/, leave/, asset/, contract/, timekeeping/, evaluation/,
│  │                             #   project/, recruitment/, overtime/, settings/, home/
│  ├─ composables/               # useTheme, useTweaks, useToast, useNavBreadcrumbs (UI-only)
│  ├─ layouts/                   # admin.vue (sidebar+topbar), auth.vue
│  ├─ pages/                     # mirror routes design (xem mục 6)
│  ├─ middleware/                # (parked) auth guard — thêm khi migrate
│  ├─ plugins/                   # tối thiểu — firebase/api/auth thêm lại pha migrate
│  ├─ stores/                    # Pinia mock nhẹ
│  ├─ utils/                     # cn.ts, format.ts, date.ts (giữ tiện ích thuần)
│  ├─ mocks/                     # ⭐ dữ liệu mock tập trung (members.ts, leaves.ts, …)
│  ├─ types/                     # type dùng chung
│  ├─ app.vue
│  └─ app.config.ts              # ⭐ accent presets + design tokens runtime
├─ i18n/locales/                 # vi.json, en.json, ja.json
├─ public/                       # logo, flags, favicon
├─ tests/                        # vitest
├─ e2e/                          # playwright
├─ nuxt.config.ts
├─ eslint.config.mjs
├─ tsconfig.json
└─ pnpm-lock.yaml
```

**Nguyên tắc tách lớp (then chốt cho migrate API):** dữ liệu nằm ở `mocks/` → store/composable đọc từ mock; **component chỉ nhận props / phát emit, không gọi data trực tiếp.** Khi migrate, chỉ thay nguồn dữ liệu trong store/composable, không đụng component.

## 4. Design foundation (port từ prototype)

1. **Tokens** — hệ HSL của prototype đưa vào Tailwind v4 `@theme` + CSS vars: `--primary-h`/`--primary-s` (đổi hue/sat runtime), `--background/foreground/card/popover/muted/border/input/ring/sidebar`; dark mode qua class `.dark`.
2. **Accent presets** (trong `app.config.ts`): Sky / Indigo / Emerald / Coral / Violet (mỗi cái `{h, s, label}`).
3. **Density**: comfortable / compact (đổi padding/spacing toàn cục).
4. **Base styles** chuyển vào `main.css`: `.app-canvas` (mesh gradient + dot grid), `.sidebar-bg`, `.sidebar-item-active`, `.card-surface`, animation `rise`/`selectIn`, `.tab-trigger`, custom checkbox, scrollbar, focus-by-border, `.live-dot`.
5. **TweaksPanel**: công cụ dev đổi theme/accent/density, lưu localStorage qua `useTweaks` (VueUse `useStorage`).
6. **Fonts**: heading/sans = Plus Jakarta Sans (+ Noto Sans JP fallback CJK), display = Lora (+ Noto Serif JP), mono = JetBrains Mono.

## 5. Chiến lược Chart (Hybrid)

**Ràng buộc bắt buộc:** mọi chart phải **giống mockup tuyệt đối** và **đổi màu theo accent** (đọc CSS var `--primary*`).

| Thành phần | Triển khai | Ghi chú |
|---|---|---|
| **Sparkline** | SVG tự viết (port) | area gradient dọc opacity 0.22→0, stroke 1.6 bo tròn, end-dot r=2.5 |
| **BarRow** | CSS/div | thanh 1.5px bo tròn, gradient/flat, transition 700ms |
| **Donut** | SVG tự viết | cung tiến độ stroke 12, gradient chéo, rounded cap, label giữa |
| **StackedBar** | CSS/div | các đoạn màu, bo tròn |
| **LineChart** | **@unovis/vue** | style lại để khớp mockup 100%: gridline đứt nét `2 4`, area gradient primary 0.22→0, line 2px `--primary`, dot nền card viền primary r=4, nhãn mono; tận dụng tooltip/crosshair/responsive của Unovis |

Các chart phân tích phức tạp phát sinh về sau → dùng **Unovis**, áp cùng bộ style/token để đồng nhất.

## 6. Inventory trang (mirror design `new-erp`)

Theo `ROUTES` của prototype + cấu trúc pages v3 hiện có:

- `home-admin` — Dashboard (banner chấm công, stat cards + sparkline, tabs Company/Personal/Project)
- **HRM**: `hrm/member` (+ drawer chi tiết, modal mời), `hrm/member/profile`, `hrm/leave`, `hrm/asset`, `hrm/contract`, `hrm/timekeeping`
- `evaluation` — Đánh giá nhân sự
- `workflow/project` — Dự án
- `recruitment` — Tuyển dụng
- `request/overtime` — Tăng ca
- `settings` — Cài đặt hệ thống
- **Auth** (layout `auth`): login + các luồng organization (giữ khung, mock)

> Các trang con/CRUD chi tiết của v3 (create/edit/[id]…) sẽ được map dần; giai đoạn 1 ưu tiên các trang có trong mockup. Trang ngoài mockup giữ ở mức khung + mock để không vỡ route.

## 7. Dọn dẹp (remove)

- **Packages bỏ:** `@fortawesome/fontawesome-free`, `@heroicons/vue`, `shadcn-vue`, `@headlessui/vue`, `chart.js`, `tw-animate-css`, `@nuxt/typescript-build`.
- **Mã nguồn bỏ:** toàn bộ `components/ui` (shadcn) cũ, stores/composables/plugins/middleware gắn API cũ. Bản logic cũ vẫn còn để tham chiếu cho plan migrate ở: dự án `micro-erp-spa` (SPA cũ) và lịch sử file v3 hiện tại — vì vậy gỡ khỏi cây build mới là an toàn.
- **Lock files:** xóa `yarn.lock` + `package-lock.json`, chỉ giữ `pnpm-lock.yaml`.
- **Font CDN cũ** (Inter/Be Vietnam Pro) trong `nuxt.config` → thay bằng @nuxt/fonts.

## 8. Cách thực hiện thay thế

Re-scaffold **tại chỗ** trong cùng thư mục `micro-erp-spa-v3` (giữ `public/`, `i18n/locales/`, `.env*`, một số `utils` thuần) → nâng Nuxt 4, dời nguồn vào `app/`, gỡ phần cũ, dựng mới design-system + pages theo mock. Tránh tạo thư mục dự án mới để giữ liên tục.

## 9. Ngoài phạm vi (giai đoạn sau)

- **Plan migrate API/logic** từ SPA cũ (`micro-erp-spa`) + v3 stores → nối store/composable vào component, auth guard, Firebase, validation thật, export thật.
- i18n nội dung đầy đủ (giai đoạn 1 chỉ đảm bảo khung đa ngữ + chuỗi chính).
- Responsive mobile chuyên sâu (mockup thiên desktop).

## 10. Rủi ro & lưu ý

- **Nâng Nuxt 3→4** có thể vướng breaking change (i18n v9→v10, dir `app/`, Pinia 2→3). Cần nâng từng bước, chạy thử.
- **Khối lượng UI lớn** (nhiều trang/biến thể) → ưu tiên dựng design-system + layout + vài trang trục (home, member, leave) trước, rồi nhân bản pattern.
- Tách lớp data nghiêm ngặt để giai đoạn migrate không phải sửa lại component.
