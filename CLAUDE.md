# Micro ERP — Nuxt 4 SPA (`new-erp`)

## Dự án

ERP nội bộ cho **VNLab (GMO-Z.com Vietnam Lab Center)**. Rebuild toàn bộ trên Nuxt 4 SPA với design system mới, UX cải tiến. UI-first: tất cả trang dùng mock data; API integrate ở Plan B4.

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Framework | Nuxt 4 (`ssr: false`), Vue 3.5, TypeScript strict |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`), CSS custom props HSL |
| UI Primitives | reka-ui (Select/Dialog/Drawer headless), lucide-vue-next |
| State | Pinia, VueUse |
| i18n | @nuxtjs/i18n (vi/en/ja) — pages dùng text VI trực tiếp, không `t()` |
| Test | Vitest + @vue/test-utils (happy-dom), Playwright e2e |
| Package manager | **pnpm** (bắt buộc) |

## Cấu trúc thư mục

```
app/
  assets/css/main.css         Design tokens + utility classes (source of truth)
  components/
    base/                     Button, Badge, Avatar, MiniStat, Tabs, Select,
                              Modal, Drawer, Pagination, FilterBar, FieldInput, ToastHost
    layout/                   Sidebar, Topbar, PageHeader, Breadcrumb, TweaksPanel
    charts/                   Sparkline, BarRow, Donut, LineChart, StackedBar
    home/                     Banner, SectionCard, StatCard, PersonalTab, CompanyTab, ProjectTab
    member/                   MemberDetail, InviteModal
    leave/                    LeaveGrid
    asset/                    AssetDetail
    contract/                 ContractForm
    timekeeping/              TimekeepingCalendar
  composables/                useToast, useTweaks, useApi (stub), useAuth (stub)
  layouts/
    admin.vue                 Main layout (Sidebar + Topbar) — mọi page HRM dùng cái này
    auth.vue                  Login/register layout
  mocks/                      Mock data: dashboard.ts, members.ts, leave.ts,
                              asset.ts, contract.ts, timekeeping.ts
  pages/
    hrm/                      member.vue, leave.vue, asset.vue, contract.vue, timekeeping.vue
    home-admin.vue, evaluation.vue, recruitment.vue, settings.vue
    request/overtime.vue, workflow/project.vue
design/                       JSX prototype files — SOURCE OF TRUTH cho mọi UI
docs/superpowers/plans/       Implementation plans
```

## Design System — CSS Classes Quan Trọng

| Class | Mô tả |
|---|---|
| `card-surface` | Card container — bg card, border, rounded-[14px], shadow nhẹ |
| `rise` | Entry animation: `translateY(8px)→0, opacity 0→1`, duration 0.5s |
| `tab-trigger` | Tab strip button với active underline gradient |
| `thead-primary` | Table `<thead>` với primary tint background |
| `section-title` | Heading nhỏ trong card (font-heading, 13.5px, font-weight 600) |
| `app-canvas` | Body background mesh gradient + dot grid |
| `sidebar-bg` | Sidebar gradient background (light/dark responsive) |
| `sidebar-item-active` | Active nav item gradient + shadow |
| `scrollbar-thin` | Custom scrollbar nhỏ (6px) |
| `nav-item`, `nav-ico`, `nav-dot` | Sidebar nav item states |

## Component API Patterns

```typescript
// Button
variant: 'primary' | 'outline' | 'ghost' | 'danger' | 'success'
size: 'xs' | 'sm' | 'md'

// Badge
variant: 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'
dot?: boolean

// MiniStat
label, value, sublabel?, accent?: 'primary'|'green'|'amber'|'red'|'violet'|'sky', delay?

// Select (reka-ui wrapper)
modelValue, options: {value, label}[], placeholder?
// ⚠️ KHÔNG dùng empty string '' làm value — dùng sentinel 'all' cho "tất cả"

// Avatar
name: string, size?: number (px)

// PageHeader
eyebrow, title, description?, #actions slot
```

## Mock Data Convention

- Mock data sống trong `app/mocks/<feature>.ts`
- Export: types + mock arrays + meta objects (status, category mapping) + helpers
- Pages import trực tiếp, không qua store hay API call
- `useApi` và `useAuth` là **stubs** — comment rõ: _"Logic thật sẽ khôi phục ở B4 migrate API"_

## Quy tắc Code

1. **pnpm** — không dùng npm hay yarn
2. **`definePageMeta({ layout: 'admin' })`** — bắt buộc trên mọi HRM page
3. **Không comment thừa** — chỉ khi WHY không tự hiển nhiên
4. **Text tiếng Việt trực tiếp** — không wrap `t()` ở B1–B3
5. **Đọc file trước khi edit** — Write tool yêu cầu; không bao giờ overwrite mù
6. **Import alias `~/`** — luôn dùng `~/components/`, `~/mocks/`, `~/composables/`
7. **Tailwind inline style** khi cần dynamic HSL: `style="{ color: 'hsl(var(--primary))' }"`

## Development Commands

```bash
pnpm dev                # Dev server → http://localhost:3000
pnpm typecheck          # vue-tsc type check
pnpm lint               # ESLint (Nuxt flat config)
pnpm test               # Vitest unit tests
pnpm test:e2e           # Playwright e2e
pnpm test:screenshots   # Capture & compare screenshots (xem bên dưới)
```

## Quy trình Screenshot Comparison

**Sau mỗi lần implement xong một màn hình mới, bắt buộc chạy:**

```bash
pnpm test:screenshots
```

Lệnh này:
1. Chạy Nuxt dev server (port 3000) + design server (port 3001)
2. Playwright navigate đến từng route trong Nuxt → chụp ảnh → `test-results/screenshots/actual/<slug>.png`
3. Playwright mở `design/Admin Dashboard.html`, gọi `window.__erp_navigate(route)` → chụp ảnh → `test-results/screenshots/design/<slug>.png`
4. So sánh `actual/` vs `design/` bằng mắt (dùng VS Code image diff hoặc bất kỳ image viewer nào)

**Các trang được capture:**

| Slug | Nuxt route | Design route |
|---|---|---|
| `home-admin` | `/home-admin` | `/home-admin` |
| `hrm-member` | `/hrm/member` | `/hrm/member` |
| `hrm-leave` | `/hrm/leave` | `/hrm/leave` |
| `hrm-asset` | `/hrm/asset` | `/hrm/asset` |
| `hrm-contract` | `/hrm/contract` | `/hrm/contract` |
| `hrm-timekeeping` | `/hrm/timekeeping` | `/hrm/timekeeping` |
| `evaluation` | `/evaluation` | `/evaluation` |
| `recruitment` | `/recruitment` | `/recruitment` |
| `overtime` | `/request/overtime` | `/request/overtime` |
| `project` | `/workflow/project` | `/workflow/project` |
| `settings` | `/settings` | `/settings` |

**Rule bắt buộc:** Nếu screenshot `actual` và `design` khác nhau đáng kể → fix trước khi chuyển sang trang tiếp theo.

## Source of Truth cho UI

Design prototype JSX files trong `design/` là nguồn chân lý duy nhất cho layout, màu sắc, interaction:

| File | Trang |
|---|---|
| `design/page-leave.jsx` | HRM → Nghỉ phép |
| `design/page-asset.jsx` | HRM → Tài sản |
| `design/page-contract.jsx` | HRM → Hợp đồng |
| `design/page-timekeeping.jsx` | HRM → Chấm công |
| `design/page-shell.jsx` | Base components (Button, Badge, Avatar, ...) |
| `design/dashboard.jsx` | Home Dashboard |
| `design/sidebar.jsx` | Sidebar layout |
| `design/topbar.jsx` | Topbar layout |

## Plan Status

| Plan | Status | Nội dung |
|---|---|---|
| **B1** | ✅ Hoàn thành | Foundation + Design System + Layout + Home Dashboard + Member |
| **B2** | 🔄 Đang làm | HRM pages: leave, asset, contract, timekeeping (mock data) |
| **B3** | ⏳ Tiếp theo | Pages còn lại: evaluation, recruitment, overtime, project, settings |
| **B4** | ⏳ Sau này | Migrate API — thay mock data bằng real API calls |

## Lưu ý API Migration (B4)

`useApi` và `useAuth` composables hiện là stubs với comment hướng dẫn restore.
`runtimeConfig.public.apiBase` → `NUXT_ENV_AXIOS_BASE_URL` (default: `http://localhost:8080`).
