# Plan A — Foundation + Design System + Layout + Home (Nuxt 4 rebuild)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng lại `micro-erp-spa-v3` trên Nuxt 4 (SPA) với design-system mới port từ prototype `new-erp`, đến mức trang Home (Dashboard) chạy đầy đủ với mock data, theme/dark/accent/density hoạt động.

**Architecture:** Nuxt 4 `app/` dir, `ssr:false`. Tailwind v4 (CSS-first tokens) + CSS vars HSL động (`--primary-h/--primary-s`). Bộ component thuần Vue `<script setup>` port 1-1 từ prototype; reka-ui headless dùng ở Plan B cho widget phức tạp. Data nằm ở `app/mocks/`, component chỉ nhận props.

**Tech Stack:** Nuxt 4, Vue 3.5, TypeScript strict, Tailwind v4, @nuxt/fonts, lucide-vue-next, Pinia 3, @nuxtjs/i18n, @unovis/vue, Vitest + @vue/test-utils, Playwright, pnpm.

**Nguồn tham chiếu thị giác (source of truth):** thư mục `../new-erp/` (cùng cấp với dự án) — đặc biệt `Admin Dashboard.html` (tokens/base CSS), `page-shell.jsx`, `charts.jsx`, `banner.jsx`, `sidebar.jsx`, `topbar.jsx`, `icons.jsx`, `dashboard.jsx`, `tabs-content.jsx`.

> **Quy ước chung:** Mọi lệnh chạy tại thư mục dự án `micro-erp-spa-v3`. Dùng `pnpm`. Sau mỗi task chạy được, commit. Test UI thuần dùng `@vue/test-utils`; verify thị giác bằng Playwright/manual ở Task cuối.

---

### Task 1: Project foundation — Nuxt 4, pnpm, dọn deps, config gốc

**Files:**
- Init: git repo (chưa có)
- Modify/replace: `package.json`
- Delete: `yarn.lock`, `package-lock.json`, `components.json`
- Create: `nuxt.config.ts` (ghi đè), `tsconfig.json` (ghi đè), `eslint.config.mjs`, `app/app.vue`, `.npmrc`
- Move: `locales/` → `i18n/locales/`

- [ ] **Step 1: Khởi tạo git để các bước commit hoạt động**

Run:
```bash
git init && git add -A && git commit -m "chore: snapshot v3 before Nuxt4 rebuild"
```
Expected: tạo commit đầu (snapshot trạng thái cũ để có thể tham chiếu/rollback).

- [ ] **Step 2: Tạo branch làm việc**

Run:
```bash
git checkout -b rebuild/nuxt4-new-design
```

- [ ] **Step 3: Gỡ thư mục/logic cũ khỏi cây build (giữ lại tham chiếu ở commit snapshot)**

Run:
```bash
git rm -r --quiet components composables stores plugins middleware pages layouts assets utils app.vue error.vue locales components.json yarn.lock package-lock.json
```
Expected: các thư mục cũ bị gỡ khỏi index (vẫn còn trong commit snapshot ở Step 1 để tham chiếu khi migrate API).

- [ ] **Step 4: Viết `package.json` mới**

Create `package.json`:
```json
{
  "name": "micro-erp-v3",
  "description": "Micro ERP SPA — Nuxt 4 / Vue 3 (new design)",
  "version": "4.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@9.12.0",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "typecheck": "nuxt typecheck",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@nuxtjs/i18n": "^9.5.6",
    "@pinia/nuxt": "^0.9.0",
    "@unovis/ts": "^1.6.5",
    "@unovis/vue": "^1.6.5",
    "@vee-validate/zod": "^4.14.0",
    "@vueuse/core": "^12.0.0",
    "@vueuse/nuxt": "^12.0.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "dayjs": "^1.11.13",
    "lucide-vue-next": "^0.460.0",
    "nuxt": "^4.0.0",
    "pinia": "^2.2.0",
    "reka-ui": "^2.9.7",
    "tailwind-merge": "^3.0.0",
    "vee-validate": "^4.14.0",
    "vue": "^3.5.0",
    "vue-router": "^4.4.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@nuxt/eslint": "^0.7.0",
    "@nuxt/fonts": "^0.10.0",
    "@nuxt/test-utils": "^3.14.0",
    "@playwright/test": "^1.60.0",
    "@tailwindcss/vite": "^4.0.0",
    "@types/node": "^22.0.0",
    "@vue/test-utils": "^2.4.6",
    "eslint": "^9.0.0",
    "happy-dom": "^15.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "vue-tsc": "^2.1.0"
  }
}
```
> Ghi chú: bỏ `firebase`, `chart.js`, `@fortawesome/*`, `@heroicons/vue`, `shadcn-vue`, `@headlessui/vue`, `tw-animate-css`, `@nuxt/typescript-build`, `pdfmake`, `xlsx`, `vuedraggable`, `@internationalized/date`, `sass`, `@vee-validate/i18n`, `@vee-validate/rules` (thêm lại khi cần ở Plan B/migrate). Pinia giữ 2.x cho tương thích `@pinia/nuxt` hiện tại; nâng Pinia 3 ở task riêng nếu cần.

- [ ] **Step 5: Tạo `.npmrc` cho pnpm + Nuxt**

Create `.npmrc`:
```
shamefully-hoist=true
strict-peer-dependencies=false
```

- [ ] **Step 6: Viết `nuxt.config.ts`**

Create `nuxt.config.ts`:
```ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: false,
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/fonts',
    '@nuxt/eslint',
  ],

  css: ['~/assets/css/main.css'],

  typescript: { strict: true, typeCheck: false },

  fonts: {
    families: [
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [400, 500, 600, 700, 800] },
      { name: 'Noto Sans JP', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Lora', provider: 'google', weights: [400, 500, 600], styles: ['normal', 'italic'] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] },
    ],
  },

  i18n: {
    locales: [
      { code: 'vi', file: 'vi.json', name: 'Tiếng Việt' },
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'ja', file: 'ja.json', name: '日本語' },
    ],
    defaultLocale: 'vi',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
  },

  app: {
    head: {
      title: 'Micro ERP',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  vite: { plugins: [tailwindcss()] },
})
```

- [ ] **Step 7: Di chuyển locales sang chuẩn Nuxt 4 i18n**

Run:
```bash
mkdir -p i18n/locales && git show HEAD:locales/vi.json > i18n/locales/vi.json && git show HEAD:locales/en.json > i18n/locales/en.json && git show HEAD:locales/ja.json > i18n/locales/ja.json
```
Expected: 3 file locale nằm ở `i18n/locales/`.

- [ ] **Step 8: Viết `tsconfig.json`**

Create `tsconfig.json`:
```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

- [ ] **Step 9: Viết `eslint.config.mjs`**

Create `eslint.config.mjs`:
```js
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
```

- [ ] **Step 10: Tạo `app/app.vue` tạm để boot**

Create `app/app.vue`:
```vue
<template>
  <div class="p-10 font-sans text-foreground">
    <h1 class="text-2xl font-bold">Micro ERP — Nuxt 4 booting…</h1>
  </div>
</template>
```

- [ ] **Step 11: Cài đặt dependencies**

Run: `pnpm install`
Expected: cài xong, không lỗi peer nghiêm trọng; sinh `pnpm-lock.yaml`.

- [ ] **Step 12: Kiểm tra dev server boot**

Run: `pnpm dev` (chạy ~10s rồi Ctrl-C)
Expected: Nuxt khởi động ở `http://localhost:3000`, log "Nuxt 4.x", không lỗi biên dịch. (`main.css` chưa có sẽ lỗi — chấp nhận, sẽ tạo ở Task 2; nếu chặn boot thì tạm comment dòng `css:` rồi bỏ comment sau Task 2.)

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "chore(nuxt4): scaffold foundation, deps cleanup, pnpm, i18n dir"
```

---

### Task 2: Design tokens + base CSS (`main.css`) + fonts

**Files:**
- Create: `app/assets/css/main.css`
- Reference: `../new-erp/Admin Dashboard.html` (lines 22–376) — copy tokens & base styles từ đây.

- [ ] **Step 1: Viết `app/assets/css/main.css`**

Create `app/assets/css/main.css` (port từ `Admin Dashboard.html` `<style>` + tailwind theme):
```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

/* Map Tailwind theme → CSS vars HSL động (đổi runtime theo accent/dark) */
@theme inline {
  --font-sans: "Plus Jakarta Sans", "Noto Sans JP", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Plus Jakarta Sans", "Noto Sans JP", ui-sans-serif, sans-serif;
  --font-display: "Lora", "Noto Serif JP", Georgia, ui-serif, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-sidebar: hsl(var(--sidebar));

  --shadow-card: 0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 1px 0 rgb(0 0 0 / 0.02);
  --shadow-card-hover: 0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.04);
  --shadow-popover: 0 12px 32px -8px rgb(0 0 0 / 0.16), 0 4px 8px -2px rgb(0 0 0 / 0.06);
}

:root {
  --primary-h: 203;
  --primary-s: 89%;
  --background: 0 0% 100%;
  --foreground: 226 45% 15%;
  --card: 0 0% 100%;
  --card-foreground: 226 45% 15%;
  --popover: 0 0% 100%;
  --popover-foreground: 226 45% 15%;
  --sidebar: 203 50% 97%;
  --primary: var(--primary-h) var(--primary-s) 57%;
  --primary-foreground: 0 0% 100%;
  --muted: 220 18% 96%;
  --muted-foreground: 215 16% 47%;
  --border: 220 14% 91%;
  --input: 220 14% 91%;
  --ring: var(--primary-h) var(--primary-s) 57%;
}

.dark {
  --background: 222 47% 7%;
  --foreground: 213 31% 91%;
  --card: 222 40% 10%;
  --card-foreground: 213 31% 91%;
  --popover: 222 40% 12%;
  --popover-foreground: 213 31% 91%;
  --sidebar: 222 47% 6%;
  --primary: var(--primary-h) var(--primary-s) 63%;
  --primary-foreground: 222 47% 11%;
  --muted: 222 30% 14%;
  --muted-foreground: 215 20% 65%;
  --border: 222 25% 17%;
  --input: 222 25% 17%;
  --ring: var(--primary-h) var(--primary-s) 57%;
}

@layer base {
  html {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
  }
  body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
  h1, h2, h3, h4, h5, h6, .font-heading {
    font-family: var(--font-heading); font-weight: 700; letter-spacing: -0.02em;
  }
  .font-display { font-family: var(--font-display); font-optical-sizing: auto; letter-spacing: -0.01em; }
  ::selection { background: hsl(var(--primary-h) var(--primary-s) 57% / 0.25); }
}

/* ── App canvas (mesh gradient + dot grid) ── */
.app-canvas {
  background-color: hsl(var(--background));
  background-image:
    radial-gradient(900px 500px at 100% 0%, hsl(var(--primary-h) var(--primary-s) 60% / 0.13), transparent 70%),
    radial-gradient(700px 500px at 0% 100%, hsl(var(--primary-h) 50% 55% / 0.09), transparent 70%),
    radial-gradient(hsl(var(--primary-h) var(--primary-s) 60% / 0.055) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 22px 22px;
}
.dark .app-canvas {
  background-image:
    radial-gradient(900px 500px at 100% 0%, hsl(var(--primary-h) var(--primary-s) 60% / 0.12), transparent 70%),
    radial-gradient(700px 500px at 0% 100%, hsl(var(--primary-h) 55% 45% / 0.09), transparent 70%),
    radial-gradient(hsl(var(--foreground) / 0.03) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 22px 22px;
}

.section-title { font-family: var(--font-heading); font-size: 13.5px; font-weight: 600; letter-spacing: -0.01em; color: hsl(var(--foreground)); }

.thead-primary { background: hsl(var(--primary-h) var(--primary-s) 57% / 0.10); }
.thead-primary th { color: hsl(var(--primary-h) var(--primary-s) 38%) !important; }
.dark .thead-primary { background: hsl(var(--primary-h) var(--primary-s) 57% / 0.14); }
.dark .thead-primary th { color: hsl(var(--primary-h) var(--primary-s) 72%) !important; }

.scrollbar-thin { scrollbar-width: thin; scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent; }
.scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.3); border-radius: 9999px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }

.sidebar-bg {
  background:
    radial-gradient(130% 35% at 50% 0%, hsl(var(--primary-h) 65% 82%) 0%, transparent 100%),
    radial-gradient(130% 35% at 50% 100%, hsl(var(--primary-h) 60% 84%) 0%, transparent 100%),
    hsl(var(--primary-h) 30% 97%);
}
.dark .sidebar-bg {
  background:
    radial-gradient(120% 55% at 50% 0%, hsl(var(--primary-h) 45% 14%) 0%, transparent 65%),
    radial-gradient(90% 40% at 50% 100%, hsl(var(--primary-h) 50% 12%) 0%, transparent 70%),
    linear-gradient(180deg, hsl(222 47% 8%) 0%, hsl(222 50% 6%) 60%, hsl(222 52% 5%) 100%);
}

.sidebar-item-active {
  background: linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 62%), hsl(var(--primary-h) var(--primary-s) 46%));
  color: #fff;
  box-shadow: 0 6px 16px -6px hsl(var(--primary-h) var(--primary-s) 50% / 0.55), inset 0 1px 0 0 hsl(var(--primary-h) 100% 80% / 0.45);
}

.card-surface { background-color: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 14px; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.03); }
.card-surface.interactive { transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
.card-surface.interactive:hover { border-color: hsl(var(--primary-h) var(--primary-s) 57% / 0.45); box-shadow: 0 6px 18px -8px hsl(var(--primary-h) var(--primary-s) 50% / 0.22); }

@keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes selectIn { from { opacity: 0; transform: translateY(-4px) scaleY(0.96); } to { opacity: 1; transform: translateY(0) scaleY(1); } }
.rise { animation: rise .5s cubic-bezier(.2,.7,.2,1) both; }

.tab-trigger { position: relative; padding: 12px 0; color: hsl(var(--muted-foreground)); font-weight: 600; font-family: var(--font-heading); font-size: 14px; letter-spacing: -0.01em; cursor: pointer; transition: color .15s ease; }
.tab-trigger:hover { color: hsl(var(--foreground)); }
.tab-trigger[data-active="true"] { color: hsl(var(--primary)); }
.tab-trigger[data-active="true"]::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 70%), hsl(var(--primary-h) var(--primary-s) 47%)); border-radius: 2px; }

@keyframes pulseDot { 0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary-h) var(--primary-s) 57% / 0.55); } 50% { box-shadow: 0 0 0 6px hsl(var(--primary-h) var(--primary-s) 57% / 0); } }
.live-dot { animation: pulseDot 1.8s ease-out infinite; }

/* custom checkbox + nav item styles: port nguyên từ Admin Dashboard.html lines 272–375 */
input[type="checkbox"] { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border: 1.5px solid hsl(var(--border)); border-radius: 3px; background: hsl(var(--card)); cursor: pointer; position: relative; transition: background .12s, border-color .12s; flex-shrink: 0; }
input[type="checkbox"]:checked, input[type="checkbox"]:indeterminate { background: hsl(var(--primary)); border-color: hsl(var(--primary)); }
input[type="checkbox"]:checked::after { content: ''; position: absolute; left: 3px; top: .5px; width: 5px; height: 9px; border: 2px solid #fff; border-top: none; border-left: none; transform: rotate(45deg); }
input:focus, textarea:focus, select:focus, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: none !important; box-shadow: none !important; }

.nav-item { position: relative; color: hsl(var(--foreground) / 0.82); transition: background-color .16s ease, transform .16s ease; }
.nav-item.sidebar-item-active, .nav-item.is-sub.sidebar-item-active { color: #fff; }
.nav-item.is-sub { color: hsl(var(--foreground) / 0.72); }
.nav-item:hover:not(.sidebar-item-active) { background-color: hsl(var(--primary-h) 70% 90%); color: hsl(var(--primary-h) 80% 30%); transform: translateX(2px); }
.dark .nav-item { color: hsl(var(--foreground) / 0.85); }
.dark .nav-item:hover:not(.sidebar-item-active) { background-color: hsl(var(--primary-h) 40% 16%); color: hsl(var(--primary-h) var(--primary-s) 82%); }
.nav-ico { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0; transition: background-color .16s ease; }
.sidebar-item-active .nav-ico { background: rgba(255,255,255,0.2); }
.nav-item:hover:not(.sidebar-item-active) .nav-ico { background: hsl(var(--primary-h) 70% 84%); }
.dark .nav-item:hover:not(.sidebar-item-active) .nav-ico { background: hsl(var(--primary-h) 40% 24%); }
.nav-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; background: hsl(var(--foreground) / 0.3); transition: background-color .16s ease, transform .16s ease; }
.nav-item.is-sub:hover:not(.sidebar-item-active) .nav-dot { background: hsl(var(--primary)); }
.sidebar-item-active .nav-dot { background: #fff; transform: scale(1.3); }
```

- [ ] **Step 2: Bỏ comment dòng `css:` trong `nuxt.config.ts` nếu đã comment ở Task 1**

Đảm bảo `css: ['~/assets/css/main.css']` đang bật.

- [ ] **Step 3: Thử nghiệm thị giác nhanh trong `app/app.vue`**

Replace `app/app.vue`:
```vue
<template>
  <main class="app-canvas min-h-svh p-10">
    <div class="card-surface interactive p-6 max-w-md rise">
      <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Token check</p>
      <h1 class="text-2xl font-heading text-foreground mt-1">Plus Jakarta Sans</h1>
      <p class="font-display italic text-primary mt-2">Lora display italic</p>
      <p class="font-mono text-muted-foreground mt-1">JetBrains Mono 123</p>
      <span class="inline-block mt-3 px-3 h-9 leading-9 rounded-md text-white" :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }">Primary</span>
    </div>
  </main>
</template>
```

- [ ] **Step 4: Verify dev**

Run: `pnpm dev` (mở `http://localhost:3000`, xem ~10s, Ctrl-C)
Expected: nền có mesh gradient + dot grid; card bo góc 14px; chữ heading dùng Jakarta; nút primary gradient xanh sky. Không lỗi build.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(design): tokens, base CSS, fonts (port from prototype)"
```

---

### Task 3: Theme system — accent presets + `useTweaks` + apply runtime

**Files:**
- Create: `app/app.config.ts`, `app/composables/useTweaks.ts`, `app/plugins/theme.client.ts`
- Test: `tests/useTweaks.spec.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Viết `vitest.config.ts`**

Create `vitest.config.ts`:
```ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  },
})
```

- [ ] **Step 2: Viết `app/app.config.ts` (accent presets)**

Create `app/app.config.ts`:
```ts
export default defineAppConfig({
  accents: {
    sky: { h: 203, s: 89, label: 'Sky' },
    indigo: { h: 243, s: 75, label: 'Indigo' },
    emerald: { h: 160, s: 70, label: 'Emerald' },
    coral: { h: 14, s: 82, label: 'Coral' },
    violet: { h: 280, s: 65, label: 'Violet' },
  } as Record<string, { h: number; s: number; label: string }>,
})
```

- [ ] **Step 3: Viết test cho `useTweaks` (failing first)**

Create `tests/useTweaks.spec.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useTweaks } from '../app/composables/useTweaks'

describe('useTweaks', () => {
  beforeEach(() => localStorage.clear())

  it('mặc định light / sky / comfortable', () => {
    const { tweaks } = useTweaks()
    expect(tweaks.value).toEqual({ theme: 'light', accent: 'sky', density: 'comfortable' })
  })

  it('setTweak cập nhật và persist vào localStorage', () => {
    const { tweaks, setTweak } = useTweaks()
    setTweak('theme', 'dark')
    expect(tweaks.value.theme).toBe('dark')
    expect(JSON.parse(localStorage.getItem('erp-tweaks')!).theme).toBe('dark')
  })
})
```

- [ ] **Step 4: Chạy test để xác nhận FAIL**

Run: `pnpm test -- useTweaks`
Expected: FAIL (chưa có `useTweaks`).

- [ ] **Step 5: Viết `app/composables/useTweaks.ts`**

Create `app/composables/useTweaks.ts`:
```ts
import { useStorage } from '@vueuse/core'

export type Tweaks = { theme: 'light' | 'dark'; accent: string; density: 'comfortable' | 'compact' }

const DEFAULTS: Tweaks = { theme: 'light', accent: 'sky', density: 'comfortable' }

export function useTweaks() {
  const tweaks = useStorage<Tweaks>('erp-tweaks', { ...DEFAULTS })
  function setTweak<K extends keyof Tweaks>(key: K, value: Tweaks[K]) {
    tweaks.value = { ...tweaks.value, [key]: value }
  }
  return { tweaks, setTweak }
}
```

- [ ] **Step 6: Chạy test để xác nhận PASS**

Run: `pnpm test -- useTweaks`
Expected: PASS (2 test).

- [ ] **Step 7: Viết plugin áp dụng theme runtime**

Create `app/plugins/theme.client.ts`:
```ts
export default defineNuxtPlugin(() => {
  const { tweaks } = useTweaks()
  const app = useAppConfig()
  const root = document.documentElement

  watchEffect(() => {
    root.classList.toggle('dark', tweaks.value.theme === 'dark')
    const a = app.accents[tweaks.value.accent] ?? app.accents.sky
    root.style.setProperty('--primary-h', String(a.h))
    root.style.setProperty('--primary-s', `${a.s}%`)
  })
})
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(theme): accent presets, useTweaks (localStorage), runtime apply"
```

---

### Task 4: Tiện ích `cn` + thử icon lucide

**Files:**
- Create: `app/utils/cn.ts`
- Test: `tests/cn.spec.ts`

- [ ] **Step 1: Viết test (failing)**

Create `tests/cn.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { cn } from '../app/utils/cn'

describe('cn', () => {
  it('gộp & dedupe class tailwind', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-sm', false && 'hidden', 'font-bold')).toBe('text-sm font-bold')
  })
})
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- cn`
Expected: FAIL.

- [ ] **Step 3: Viết `app/utils/cn.ts`**

Create `app/utils/cn.ts`:
```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Chạy test → PASS**

Run: `pnpm test -- cn`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(utils): cn helper"
```

> **Ghi chú icon:** Dùng `lucide-vue-next` trực tiếp trong SFC (vd `import { Menu, Bell, Star } from 'lucide-vue-next'`). Bảng map tên prototype → lucide: Dashboard→`LayoutDashboard`, Users→`Users`, Star→`Star`, Folder→`Folder`, UserPlus→`UserPlus`, Timer→`Timer`, Sliders→`SlidersHorizontal`, ChevronRight→`ChevronRight`, ChevronDown→`ChevronDown`, Search→`Search`, Bell→`Bell`, Moon→`Moon`, Sun→`Sun`, LogIn→`LogIn`, LogOut→`LogOut`, Clock→`Clock`, FileText→`FileText`, Mail→`Mail`, Phone→`Phone`, Calendar→`Calendar`, Building→`Building2`, TrendUp→`TrendingUp`, TrendDown→`TrendingDown`, Check→`Check`, X→`X`, Plus→`Plus`, Send→`Send`, External→`ExternalLink`, Globe→`Globe`. Stroke mặc định lucide 2; set `:size` và `class` cho màu.

---

### Task 5: Base component — `Button.vue`

**Files:**
- Create: `app/components/base/Button.vue`
- Test: `tests/components/Button.spec.ts`
- Reference: `../new-erp/page-shell.jsx` lines 23–49.

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/Button.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../../app/components/base/Button.vue'

describe('Button', () => {
  it('render slot + phát click', async () => {
    const wrapper = mount(Button, { slots: { default: 'Lưu' } })
    expect(wrapper.text()).toContain('Lưu')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('variant primary có gradient inline style', () => {
    const wrapper = mount(Button, { props: { variant: 'primary' } })
    expect(wrapper.attributes('style')).toContain('linear-gradient')
  })

  it('variant outline KHÔNG có gradient', () => {
    const wrapper = mount(Button, { props: { variant: 'outline' } })
    expect(wrapper.attributes('style') ?? '').not.toContain('linear-gradient')
  })
})
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- Button`
Expected: FAIL.

- [ ] **Step 3: Viết `app/components/base/Button.vue`**

Create `app/components/base/Button.vue`:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md'
}>(), { variant: 'primary', size: 'md' })

defineEmits<{ click: [MouseEvent] }>()

const sizeCls = computed(() =>
  props.size === 'sm' ? 'h-8 px-2.5 text-[12.5px]'
  : props.size === 'xs' ? 'h-7 px-2 text-[11.5px]'
  : 'h-9 px-3.5 text-[13px]')

const variantCls = computed(() => ({
  primary: 'text-white shadow-sm hover:scale-[1.02] active:scale-[0.98]',
  outline: 'border border-border bg-card text-foreground hover:border-primary/60 hover:bg-muted/40',
  ghost: 'text-foreground/80 hover:bg-muted hover:text-foreground',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600',
}[props.variant]))

const style = computed(() => props.variant === 'primary'
  ? { background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }
  : {})
</script>

<template>
  <button
    :class="cn('inline-flex items-center gap-1.5 rounded-md font-semibold transition-all whitespace-nowrap', sizeCls, variantCls)"
    :style="style"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
```

- [ ] **Step 4: Chạy test → PASS**

Run: `pnpm test -- Button`
Expected: PASS (3 test).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(base): Button"
```

---

### Task 6: Base component — `Badge.vue`

**Files:**
- Create: `app/components/base/Badge.vue`
- Test: `tests/components/Badge.spec.ts`
- Reference: `../new-erp/page-shell.jsx` lines 51–72.

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/Badge.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from '../../app/components/base/Badge.vue'

describe('Badge', () => {
  it('render text + dot khi dot=true', () => {
    const w = mount(Badge, { props: { variant: 'green', dot: true }, slots: { default: 'Active' } })
    expect(w.text()).toContain('Active')
    expect(w.find('[data-dot]').exists()).toBe(true)
  })
  it('không có dot mặc định', () => {
    const w = mount(Badge, { slots: { default: 'X' } })
    expect(w.find('[data-dot]').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- Badge`

- [ ] **Step 3: Viết `app/components/base/Badge.vue`**

Create `app/components/base/Badge.vue`:
```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'
  dot?: boolean
}>(), { variant: 'gray', dot: false })

const MAP = {
  gray: { bg: 'hsl(var(--muted))', fg: 'hsl(var(--muted-foreground))', dot: 'hsl(var(--muted-foreground))' },
  primary: { bg: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.10)', fg: 'hsl(var(--primary))', dot: 'hsl(var(--primary))' },
  green: { bg: 'hsl(160 60% 90%)', fg: 'hsl(160 60% 30%)', dot: 'hsl(160 60% 45%)' },
  red: { bg: 'hsl(0 80% 95%)', fg: 'hsl(0 70% 45%)', dot: 'hsl(0 70% 55%)' },
  amber: { bg: 'hsl(38 95% 92%)', fg: 'hsl(35 90% 38%)', dot: 'hsl(38 92% 50%)' },
  sky: { bg: 'hsl(203 89% 92%)', fg: 'hsl(203 89% 35%)', dot: 'hsl(203 89% 50%)' },
  violet: { bg: 'hsl(270 70% 95%)', fg: 'hsl(265 60% 45%)', dot: 'hsl(265 60% 55%)' },
}
const v = computed(() => MAP[props.variant] ?? MAP.gray)
</script>

<template>
  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono"
        :style="{ background: v.bg, color: v.fg }">
    <span v-if="dot" data-dot class="h-1.5 w-1.5 rounded-full" :style="{ background: v.dot }" />
    <slot />
  </span>
</template>
```

- [ ] **Step 4: Chạy test → PASS**; **Step 5: Commit**

```bash
pnpm test -- Badge
git add -A && git commit -m "feat(base): Badge"
```

---

### Task 7: Base component — `Avatar.vue`

**Files:**
- Create: `app/components/base/Avatar.vue`
- Test: `tests/components/Avatar.spec.ts`
- Reference: `../new-erp/page-shell.jsx` lines 74–91.

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/Avatar.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Avatar from '../../app/components/base/Avatar.vue'

describe('Avatar', () => {
  it('lấy initials 2 ký tự cuối, viết hoa', () => {
    expect(mount(Avatar, { props: { name: 'Nguyễn Văn An' } }).text()).toBe('VA')
  })
  it('fallback ? khi không có tên', () => {
    expect(mount(Avatar, { props: { name: '' } }).text()).toBe('?')
  })
})
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- Avatar`

- [ ] **Step 3: Viết `app/components/base/Avatar.vue`**

Create `app/components/base/Avatar.vue`:
```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name: string; size?: number; hue?: number }>(), { size: 32 })

const initials = computed(() => {
  const parts = (props.name || '?').split(' ').filter(Boolean)
  if (!parts.length) return '?'
  return parts.map(p => p[0]).slice(-2).join('').toUpperCase()
})
const hue = computed(() => {
  if (props.hue != null) return props.hue
  let h = 0
  for (let i = 0; i < (props.name || '').length; i++) h = (h * 31 + props.name.charCodeAt(i)) % 360
  return h
})
</script>

<template>
  <span class="inline-flex items-center justify-center font-semibold text-white shrink-0 rounded-lg font-heading"
        :style="{ width: size + 'px', height: size + 'px', fontSize: size * 0.36 + 'px',
          background: `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${(hue + 30) % 360} 65% 42%))` }">
    {{ initials }}
  </span>
</template>
```

- [ ] **Step 4: Chạy test → PASS**; **Step 5: Commit**

```bash
pnpm test -- Avatar
git add -A && git commit -m "feat(base): Avatar"
```

---

### Task 8: Base component — `MiniStat.vue`

**Files:**
- Create: `app/components/base/MiniStat.vue`
- Test: `tests/components/MiniStat.spec.ts`
- Reference: `../new-erp/page-shell.jsx` lines 234–271.

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/MiniStat.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MiniStat from '../../app/components/base/MiniStat.vue'

describe('MiniStat', () => {
  it('hiển thị label, value, sublabel', () => {
    const w = mount(MiniStat, { props: { label: 'Tổng', value: 248, sublabel: '4 chi nhánh' } })
    expect(w.text()).toContain('Tổng')
    expect(w.text()).toContain('248')
    expect(w.text()).toContain('4 chi nhánh')
  })
  it('trend up hiển thị mũi tên lên', () => {
    const w = mount(MiniStat, { props: { label: 'X', value: 1, trend: { dir: 'up', value: '+2' } } })
    expect(w.text()).toContain('↑')
    expect(w.text()).toContain('+2')
  })
})
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- MiniStat`

- [ ] **Step 3: Viết `app/components/base/MiniStat.vue`**

Create `app/components/base/MiniStat.vue`:
```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  value: string | number
  sublabel?: string
  trend?: { dir: 'up' | 'down'; value: string }
  accent?: 'primary' | 'green' | 'amber' | 'red' | 'violet' | 'gray' | 'sky'
  delay?: number
}>(), { accent: 'primary', delay: 0 })

const COLORS: Record<string, string> = {
  primary: 'hsl(var(--primary))', green: 'hsl(160 60% 45%)', amber: 'hsl(35 90% 50%)',
  red: 'hsl(0 75% 55%)', violet: 'hsl(265 60% 55%)', gray: 'hsl(220 14% 55%)', sky: 'hsl(203 89% 45%)',
}
const TINTS: Record<string, string> = {
  primary: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.09)', green: 'hsl(160 60% 45% / 0.09)',
  amber: 'hsl(35 90% 50% / 0.09)', red: 'hsl(0 75% 55% / 0.09)', violet: 'hsl(265 60% 55% / 0.09)',
  gray: 'hsl(220 14% 55% / 0.06)', sky: 'hsl(203 89% 45% / 0.09)',
}
const tint = computed(() => TINTS[props.accent] ?? TINTS.primary)
const color = computed(() => COLORS[props.accent] ?? COLORS.primary)
</script>

<template>
  <div class="card-surface p-4 rise"
       :style="{ animationDelay: delay + 'ms', backgroundImage: `radial-gradient(ellipse 90% 65% at 100% 0%, ${tint}, transparent 70%)` }">
    <div class="flex items-baseline justify-between">
      <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{{ label }}</p>
      <span v-if="trend" :class="'text-[11px] font-semibold tabular-nums ' + (trend.dir === 'up' ? 'text-emerald-600' : 'text-red-500')">
        {{ trend.dir === 'up' ? '↑' : '↓' }} {{ trend.value }}
      </span>
    </div>
    <p class="text-[26px] font-bold font-heading mt-1 tabular-nums" :style="{ color }">{{ value }}</p>
    <p v-if="sublabel" class="text-[11.5px] text-muted-foreground mt-0.5">{{ sublabel }}</p>
  </div>
</template>
```

- [ ] **Step 4: Chạy test → PASS**; **Step 5: Commit**

```bash
pnpm test -- MiniStat
git add -A && git commit -m "feat(base): MiniStat"
```

---

### Task 9: Base component — `Tabs.vue` (tab strip)

**Files:**
- Create: `app/components/base/Tabs.vue`
- Test: `tests/components/Tabs.spec.ts`
- Reference: `../new-erp/dashboard.jsx` lines 81–89 (tab strip + class `.tab-trigger`).

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/Tabs.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Tabs from '../../app/components/base/Tabs.vue'

const items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]

describe('Tabs', () => {
  it('đánh dấu active theo modelValue', () => {
    const w = mount(Tabs, { props: { modelValue: 'a', items } })
    const btns = w.findAll('button')
    expect(btns[0].attributes('data-active')).toBe('true')
    expect(btns[1].attributes('data-active')).toBe('false')
  })
  it('click phát update:modelValue', async () => {
    const w = mount(Tabs, { props: { modelValue: 'a', items } })
    await w.findAll('button')[1].trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual(['b'])
  })
})
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- Tabs`

- [ ] **Step 3: Viết `app/components/base/Tabs.vue`**

Create `app/components/base/Tabs.vue`:
```vue
<script setup lang="ts">
defineProps<{ modelValue: string; items: { value: string; label: string; count?: number }[] }>()
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="border-b border-border/70">
    <div class="flex gap-7">
      <button v-for="t in items" :key="t.value" class="tab-trigger inline-flex items-center gap-2"
              :data-active="modelValue === t.value" @click="$emit('update:modelValue', t.value)">
        {{ t.label }}
        <span v-if="t.count != null"
              :class="'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums ' + (modelValue === t.value ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')">
          {{ t.count }}
        </span>
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Chạy test → PASS**; **Step 5: Commit**

```bash
pnpm test -- Tabs
git add -A && git commit -m "feat(base): Tabs strip"
```

---

### Task 10: Chart — `Sparkline.vue` (SVG)

**Files:**
- Create: `app/components/charts/Sparkline.vue`
- Test: `tests/components/Sparkline.spec.ts`
- Reference: `../new-erp/charts.jsx` lines 4–27.

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/Sparkline.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Sparkline from '../../app/components/charts/Sparkline.vue'

describe('Sparkline', () => {
  it('vẽ path line + area + end dot', () => {
    const w = mount(Sparkline, { props: { data: [1, 3, 2, 5] } })
    expect(w.findAll('path')).toHaveLength(2) // area + line
    expect(w.find('circle').exists()).toBe(true)
  })
  it('rỗng khi không có data', () => {
    const w = mount(Sparkline, { props: { data: [] } })
    expect(w.find('svg').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- Sparkline`

- [ ] **Step 3: Viết `app/components/charts/Sparkline.vue`**

Create `app/components/charts/Sparkline.vue`:
```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  data: number[]; width?: number; height?: number; stroke?: string; filled?: boolean
}>(), { width: 96, height: 32, stroke: 'currentColor', filled: true })

const gradId = `sg-${Math.random().toString(36).slice(2, 7)}`
const geom = computed(() => {
  const d = props.data
  if (!d.length) return null
  const min = Math.min(...d), max = Math.max(...d)
  const range = max - min || 1
  const stepX = props.width / (d.length - 1 || 1)
  const pts = d.map((v, i) => [i * stepX, props.height - ((v - min) / range) * (props.height - 4) - 2])
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const area = `${path} L${props.width},${props.height} L0,${props.height} Z`
  return { path, area, last: pts[pts.length - 1] }
})
</script>

<template>
  <svg v-if="geom" :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" class="overflow-visible">
    <defs>
      <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="stroke" stop-opacity="0.22" />
        <stop offset="100%" :stop-color="stroke" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path v-if="filled" :d="geom.area" :fill="`url(#${gradId})`" />
    <path :d="geom.path" fill="none" :stroke="stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    <circle :cx="geom.last[0]" :cy="geom.last[1]" r="2.5" :fill="stroke" />
  </svg>
</template>
```

- [ ] **Step 4: Chạy test → PASS**; **Step 5: Commit**

```bash
pnpm test -- Sparkline
git add -A && git commit -m "feat(charts): Sparkline (SVG)"
```

---

### Task 11: Charts — `BarRow.vue`, `Donut.vue`, `StackedBar.vue`

**Files:**
- Create: `app/components/charts/BarRow.vue`, `app/components/charts/Donut.vue`, `app/components/charts/StackedBar.vue`
- Test: `tests/components/charts-misc.spec.ts`
- Reference: `../new-erp/charts.jsx` lines 30–50 (BarRow), 53–87 (Donut), 147–160 (StackedBar).

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/charts-misc.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BarRow from '../../app/components/charts/BarRow.vue'
import Donut from '../../app/components/charts/Donut.vue'
import StackedBar from '../../app/components/charts/StackedBar.vue'

describe('charts misc', () => {
  it('BarRow tính % và hiển thị label/value', () => {
    const w = mount(BarRow, { props: { label: 'FE', value: 5, max: 10 } })
    expect(w.text()).toContain('FE')
    expect(w.text()).toContain('5')
    expect(w.html()).toContain('width: 50%')
  })
  it('Donut render 2 vòng + label giữa', () => {
    const w = mount(Donut, { props: { used: 3, total: 4, label: '75%' } })
    expect(w.findAll('circle')).toHaveLength(2)
    expect(w.text()).toContain('75%')
  })
  it('StackedBar render đủ segments', () => {
    const w = mount(StackedBar, { props: { segments: [{ label: 'a', value: 1, color: '#000' }, { label: 'b', value: 1, color: '#fff' }] } })
    expect(w.findAll('div > div')).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- charts-misc`

- [ ] **Step 3a: Viết `app/components/charts/BarRow.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ label: string; value: number; max: number; accent?: boolean }>(), { accent: false })
const pct = computed(() => Math.round((props.value / props.max) * 100))
const bg = computed(() => props.accent
  ? 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 67%), hsl(var(--primary-h) var(--primary-s) 47%))'
  : 'hsl(var(--primary-h) var(--primary-s) 70%)')
</script>
<template>
  <div class="flex items-center gap-3">
    <span class="text-sm text-foreground w-32 shrink-0 truncate font-medium">{{ label }}</span>
    <div class="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
      <div class="h-full rounded-full transition-all duration-700"
           :style="{ width: pct + '%', background: bg, opacity: accent ? 1 : 0.55 }" />
    </div>
    <span class="text-sm font-semibold tabular-nums text-foreground w-10 text-right shrink-0">{{ value }}</span>
  </div>
</template>
```

- [ ] **Step 3b: Viết `app/components/charts/Donut.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ used: number; total: number; size?: number; stroke?: number; label?: string; sublabel?: string }>(), { size: 132, stroke: 12 })
const r = computed(() => (props.size - props.stroke) / 2)
const c = computed(() => 2 * Math.PI * r.value)
const offset = computed(() => c.value * (1 - Math.min(props.used / props.total, 1)))
</script>
<template>
  <div class="relative inline-flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="rotate-[-90deg]">
      <circle :cx="size/2" :cy="size/2" :r="r" fill="none" stroke="hsl(var(--muted))" :stroke-width="stroke" />
      <circle :cx="size/2" :cy="size/2" :r="r" fill="none" stroke="url(#donut-grad)" :stroke-width="stroke"
              stroke-linecap="round" :stroke-dasharray="c" :stroke-dashoffset="offset"
              style="transition: stroke-dashoffset 0.9s cubic-bezier(.2,.7,.2,1)" />
      <defs>
        <linearGradient id="donut-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(var(--primary-h) var(--primary-s) 65%)" />
          <stop offset="100%" stop-color="hsl(var(--primary-h) var(--primary-s) 45%)" />
        </linearGradient>
      </defs>
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-2xl font-bold font-heading text-foreground tabular-nums">{{ label }}</span>
      <span v-if="sublabel" class="text-[11px] text-muted-foreground mt-0.5">{{ sublabel }}</span>
    </div>
  </div>
</template>
```

- [ ] **Step 3c: Viết `app/components/charts/StackedBar.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ segments: { label: string; value: number; color: string }[]; height?: number }>(), { height: 8 })
const total = computed(() => props.segments.reduce((a, s) => a + s.value, 0) || 1)
</script>
<template>
  <div class="flex w-full overflow-hidden rounded-full" :style="{ height: height + 'px' }">
    <div v-for="(s, i) in segments" :key="i" :title="`${s.label}: ${s.value}`"
         :style="{ width: (s.value / total) * 100 + '%', background: s.color }" />
  </div>
</template>
```

- [ ] **Step 4: Chạy test → PASS**; **Step 5: Commit**

```bash
pnpm test -- charts-misc
git add -A && git commit -m "feat(charts): BarRow, Donut, StackedBar"
```

---

### Task 12: Chart — `LineChart.vue` (Unovis, style khớp mockup)

**Files:**
- Create: `app/components/charts/LineChart.vue`
- Test: `tests/components/LineChart.spec.ts`
- Reference: `../new-erp/charts.jsx` lines 89–144 (tiêu chí thị giác bắt buộc: gridline đứt, area gradient primary 0.22→0, line 2px, dot card+primary r=4).

- [ ] **Step 1: Viết test (failing) — kiểm tra render + props**

Create `tests/components/LineChart.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LineChart from '../../app/components/charts/LineChart.vue'

describe('LineChart', () => {
  it('mount với data không lỗi', async () => {
    const w = await mountSuspended(LineChart, { props: { data: [{ label: 'Q1', value: 3 }, { label: 'Q2', value: 2 }] } })
    expect(w.find('svg').exists()).toBe(true)
  })
})
```
> Nếu `mountSuspended` cần cấu hình Nuxt env, đặt `// @vitest-environment nuxt` ở đầu file test.

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- LineChart`

- [ ] **Step 3: Viết `app/components/charts/LineChart.vue`**

> Dùng `VisXYContainer` + `VisLine` + `VisArea` + `VisAxis` của @unovis/vue. Đọc màu từ CSS var qua `getComputedStyle` để khớp accent. Style line/area/dot bằng CSS override để đạt thị giác mockup.

Create `app/components/charts/LineChart.vue`:
```vue
<script setup lang="ts">
import { VisXYContainer, VisLine, VisArea, VisAxis, VisScatter } from '@unovis/vue'

type D = { label: string; value: number }
const props = withDefaults(defineProps<{ data: D[]; height?: number }>(), { height: 220 })

const x = (_d: D, i: number) => i
const y = (d: D) => d.value
const tickFormat = (i: number) => props.data[i]?.label ?? ''
</script>

<template>
  <div class="erp-linechart w-full" :style="{ height: height + 'px' }">
    <VisXYContainer :data="data" :height="height">
      <VisArea :x="x" :y="y" color="hsl(var(--primary))" :opacity="0.18" />
      <VisLine :x="x" :y="y" color="hsl(var(--primary))" :lineWidth="2" />
      <VisScatter :x="x" :y="y" color="hsl(var(--card))" :size="8"
                  :strokeColor="'hsl(var(--primary))'" :strokeWidth="2" />
      <VisAxis type="x" :tickFormat="tickFormat" :gridLine="false" :tickLine="false" :domainLine="false" />
      <VisAxis type="y" :numTicks="5" :gridLine="true" :tickLine="false" :domainLine="false" />
    </VisXYContainer>
  </div>
</template>

<style scoped>
/* Khớp mockup: gridline đứt nét màu border, nhãn mono, line bo tròn */
.erp-linechart :deep(.vis-axis-grid-line) { stroke: hsl(var(--border)); stroke-dasharray: 2 4; }
.erp-linechart :deep(.vis-axis-tick text) { fill: hsl(var(--muted-foreground)); font-family: var(--font-mono); font-size: 10px; }
.erp-linechart :deep(.vis-line) { stroke-linecap: round; stroke-linejoin: round; }
</style>
```
> Ghi chú: nếu prop name của Unovis khác (vd `lineWidth` vs `line-width`), tra `node_modules/@unovis/vue` và chỉnh; mục tiêu thị giác là bất biến — đối chiếu trực tiếp với `charts.jsx` LineChart khi verify Playwright ở Task 20.

- [ ] **Step 4: Chạy test → PASS**; **Step 5: Commit**

```bash
pnpm test -- LineChart
git add -A && git commit -m "feat(charts): LineChart (Unovis, styled to mockup)"
```

---

### Task 13: Layout — `Breadcrumb.vue` + `Topbar.vue`

**Files:**
- Create: `app/components/layout/Breadcrumb.vue`, `app/components/layout/Topbar.vue`
- Test: `tests/components/Topbar.spec.ts`
- Reference: `../new-erp/topbar.jsx` (toàn bộ), `../new-erp/sidebar.jsx` logo.

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/Topbar.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Topbar from '../../app/components/layout/Topbar.vue'

const crumbs = [{ label: 'Trang chủ' }, { label: 'Tổng quan' }]

describe('Topbar', () => {
  it('render breadcrumb + badge unread', () => {
    const w = mount(Topbar, { props: { crumbs, isDark: false, locale: 'vi', unread: 3 } })
    expect(w.text()).toContain('Tổng quan')
    expect(w.text()).toContain('3')
  })
  it('toggle theme phát event', async () => {
    const w = mount(Topbar, { props: { crumbs, isDark: false, locale: 'vi', unread: 0 } })
    await w.find('[data-test="theme-toggle"]').trigger('click')
    expect(w.emitted('toggleTheme')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- Topbar`

- [ ] **Step 3a: Viết `app/components/layout/Breadcrumb.vue`**

```vue
<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
defineProps<{ crumbs: { label: string }[] }>()
</script>
<template>
  <ol class="flex items-center gap-2 text-[13px]">
    <template v-for="(c, i) in crumbs" :key="i">
      <ChevronRight v-if="i > 0" :size="12" class="text-muted-foreground/60" />
      <li :class="i === crumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground cursor-pointer'">
        {{ c.label }}
      </li>
    </template>
  </ol>
</template>
```

- [ ] **Step 3b: Viết `app/components/layout/Topbar.vue`**

> Port từ `topbar.jsx`: menu toggle, breadcrumb, spacer, language dropdown (vi/en/ja + cờ), theme toggle, bell + popover (mock 5 thông báo), user dropdown. Dùng `lucide-vue-next` + `onClickOutside` (VueUse) để đóng popover. Cờ đặt ở `public/flags/{vn,us,jp}.svg` (copy từ `../new-erp/assets/flags`).

Create `app/components/layout/Topbar.vue`:
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { Menu, Bell, Moon, Sun, ChevronDown, Check } from 'lucide-vue-next'
import Breadcrumb from './Breadcrumb.vue'

defineProps<{ crumbs: { label: string }[]; isDark: boolean; locale: string; unread: number }>()
const emit = defineEmits<{ toggleTheme: []; 'update:locale': [string]; toggleSidebar: [] }>()

const FLAGS: Record<string, string> = { vi: '/flags/vn.svg', en: '/flags/us.svg', ja: '/flags/jp.svg' }
const LOCALE_NAMES: Record<string, string> = { vi: 'Tiếng Việt', en: 'English', ja: '日本語' }
const NOTIS = [
  { t: 'Đơn nghỉ phép của Trần Thị Mai đang chờ duyệt', s: 'HR Admin', a: '5 phút', u: true },
  { t: 'Bạn được thêm vào dự án "Cổng thanh toán XYZ"', s: 'Hoàng Đức Thành', a: '1 giờ', u: true },
  { t: 'Báo cáo đánh giá Q1/2026 đã sẵn sàng', s: 'Evaluation Bot', a: '2 giờ', u: true },
  { t: 'Hợp đồng của Lê Quang Huy sắp hết hạn (15 ngày)', s: 'Contract Bot', a: 'Hôm qua', u: false },
  { t: 'Lương tháng 4 đã được phát', s: 'Finance', a: '3 ngày', u: false },
]

const root = ref<HTMLElement>()
const langOpen = ref(false), bellOpen = ref(false), userOpen = ref(false)
const closeAll = () => { langOpen.value = bellOpen.value = userOpen.value = false }
onClickOutside(root, closeAll)
</script>

<template>
  <header ref="root" class="h-14 shrink-0 px-5 flex items-center gap-3 border-b border-border/70 bg-background/80 backdrop-blur-md sticky top-0 z-20">
    <button class="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Đóng / mở sidebar" @click="emit('toggleSidebar')">
      <Menu :size="18" />
    </button>
    <Breadcrumb :crumbs="crumbs" />
    <div class="flex-1" />

    <!-- Language -->
    <div class="relative">
      <button class="flex items-center gap-1.5 p-1.5 px-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              @click="closeAll(); langOpen = !langOpen">
        <img :src="FLAGS[locale]" alt="" class="h-4 w-5 rounded-[2px] object-cover" />
        <span class="text-[11px] font-semibold uppercase">{{ locale }}</span>
      </button>
      <div v-if="langOpen" class="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-popover shadow-popover py-1 z-50">
        <button v-for="l in ['vi', 'en', 'ja']" :key="l"
                :class="'w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-muted transition-colors ' + (locale === l ? 'bg-muted/60 font-medium' : '')"
                @click="emit('update:locale', l); langOpen = false">
          <img :src="FLAGS[l]" alt="" class="h-4 w-5 rounded-[2px] object-cover" />
          <span class="flex-1 text-left">{{ LOCALE_NAMES[l] }}</span>
          <Check v-if="locale === l" :size="14" class="text-primary" />
        </button>
      </div>
    </div>

    <!-- Theme -->
    <button data-test="theme-toggle" class="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" @click="emit('toggleTheme')">
      <Sun v-if="isDark" :size="16" />
      <Moon v-else :size="16" />
    </button>

    <!-- Bell -->
    <div class="relative">
      <button class="relative p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" @click="closeAll(); bellOpen = !bellOpen">
        <Bell :size="16" />
        <span v-if="unread > 0" class="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
              :style="{ background: 'linear-gradient(135deg, hsl(0 80% 60%), hsl(355 75% 50%))' }">{{ unread }}</span>
      </button>
      <div v-if="bellOpen" class="absolute right-0 top-full mt-1 w-[340px] rounded-lg border border-border bg-popover shadow-popover z-50 overflow-hidden">
        <div class="px-4 py-3 border-b border-border flex items-center justify-between">
          <h4 class="text-sm font-semibold text-foreground">Thông báo</h4>
          <button class="text-[11px] text-primary hover:underline">Đánh dấu đã đọc</button>
        </div>
        <ul class="max-h-[320px] overflow-y-auto scrollbar-thin divide-y divide-border">
          <li v-for="(n, i) in NOTIS" :key="i" class="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3">
            <span :class="'mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ' + (n.u ? 'bg-primary' : 'bg-muted-foreground/40')" />
            <div class="min-w-0 flex-1">
              <p class="text-[13px] text-foreground leading-snug">{{ n.t }}</p>
              <p class="text-[11px] text-muted-foreground mt-0.5">{{ n.s }} · {{ n.a }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="w-px h-5 bg-border" />

    <!-- User -->
    <div class="relative">
      <button class="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-muted transition-colors" @click="closeAll(); userOpen = !userOpen">
        <span class="inline-flex items-center justify-center w-8 h-8 rounded-md text-[11.5px] font-semibold text-white"
              :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 40%))' }">NA</span>
        <span class="text-[13px] font-medium text-foreground hidden lg:inline">Nguyễn Văn An</span>
        <ChevronDown :size="14" class="text-muted-foreground/80 hidden lg:inline" />
      </button>
      <div v-if="userOpen" class="absolute right-0 top-full mt-1 w-60 rounded-lg border border-border bg-popover shadow-popover z-50 overflow-hidden">
        <div class="px-3 py-3 flex items-center gap-3 border-b border-border">
          <span class="inline-flex items-center justify-center w-10 h-10 rounded-lg text-[13px] font-semibold text-white"
                :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 40%))' }">NA</span>
          <div class="min-w-0">
            <p class="text-[13px] font-semibold text-foreground truncate">Nguyễn Văn An</p>
            <p class="text-[11px] text-muted-foreground truncate">an.nguyen@vnlab.vn</p>
          </div>
        </div>
        <div class="py-1 text-[13px]">
          <button class="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-foreground/90">Hồ sơ cá nhân</button>
          <button class="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-foreground/90">Đổi mật khẩu</button>
          <div class="my-1 border-t border-border" />
          <button class="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition-colors">Đăng xuất</button>
        </div>
      </div>
    </div>
  </header>
</template>
```

- [ ] **Step 4: Copy cờ + logo vào `public/`**

Run:
```bash
mkdir -p public/flags && cp ../new-erp/assets/flags/*.svg public/flags/ && cp ../new-erp/assets/logo.png public/logo.png
```

- [ ] **Step 5: Chạy test → PASS**; **Step 6: Commit**

```bash
pnpm test -- Topbar
git add -A && git commit -m "feat(layout): Breadcrumb + Topbar"
```

---

### Task 14: Layout — `Sidebar.vue`

**Files:**
- Create: `app/components/layout/Sidebar.vue`
- Test: `tests/components/Sidebar.spec.ts`
- Reference: `../new-erp/sidebar.jsx` (toàn bộ — NAV, NavLink, NavCollapsible, footer mini card).

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/Sidebar.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Sidebar from '../../app/components/layout/Sidebar.vue'

describe('Sidebar', () => {
  it('đánh dấu route active', () => {
    const w = mount(Sidebar, { props: { activeRoute: '/home-admin' } })
    expect(w.find('.sidebar-item-active').exists()).toBe(true)
  })
  it('click nav phát navigate', async () => {
    const w = mount(Sidebar, { props: { activeRoute: '/home-admin' } })
    await w.find('[data-to="/home-admin"]').trigger('click')
    expect(w.emitted('navigate')![0]).toEqual(['/home-admin'])
  })
})
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- Sidebar`

- [ ] **Step 3: Viết `app/components/layout/Sidebar.vue`**

> Port `sidebar.jsx`: cấu trúc `NAV` (overview/module/system), `NavLink`, `NavCollapsible` (mở khi có child active), footer mini card (live dot + version). Icon qua lucide theo bảng map Task 4.

Create `app/components/layout/Sidebar.vue`:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { LayoutDashboard, Users, Star, Folder, UserPlus, Timer, SlidersHorizontal, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{ activeRoute: string }>()
const emit = defineEmits<{ navigate: [string] }>()

const ICONS: Record<string, any> = { Dashboard: LayoutDashboard, Users, Star, Folder, UserPlus, Timer, Sliders: SlidersHorizontal }

const NAV = {
  overview: [{ key: 'dashboard', label: 'Tổng quan', icon: 'Dashboard', to: '/home-admin' }],
  module: [
    { key: 'hrm', label: 'Nhân sự (HRM)', icon: 'Users', children: [
      { key: 'member', label: 'Quản lý nhân viên', to: '/hrm/member' },
      { key: 'leave', label: 'Đơn nghỉ phép', to: '/hrm/leave' },
      { key: 'assets', label: 'Tài sản công ty', to: '/hrm/asset' },
      { key: 'contract', label: 'Hợp đồng', to: '/hrm/contract' },
      { key: 'timekeeping', label: 'Chấm công', to: '/hrm/timekeeping' },
    ]},
    { key: 'evaluation', label: 'Đánh giá nhân sự', icon: 'Star', to: '/evaluation' },
    { key: 'workflow', label: 'Workflow', icon: 'Folder', children: [{ key: 'project', label: 'Dự án', to: '/workflow/project' }] },
    { key: 'recruitment', label: 'Tuyển dụng', icon: 'UserPlus', children: [{ key: 'manage-recruitment', label: 'Quản lý tin tuyển dụng', to: '/recruitment' }] },
    { key: 'request', label: 'Yêu cầu', icon: 'Timer', children: [{ key: 'overtime', label: 'Tăng ca', to: '/request/overtime' }] },
  ],
  system: [{ key: 'setting', label: 'Cài đặt hệ thống', icon: 'Sliders', to: '/settings' }],
} as const

const isActive = (to: string) => props.activeRoute === to
const activeChildKey = (item: any) => item.children?.find((c: any) => isActive(c.to))?.key
</script>

<template>
  <aside class="sidebar-bg w-[260px] shrink-0 h-svh sticky top-0 border-r border-border/60 flex flex-col">
    <div class="h-14 px-5 flex items-center justify-center border-b border-border/60">
      <img src="/logo.png" alt="VNLab" class="h-7 w-auto select-none" draggable="false" />
    </div>
    <nav class="flex-1 overflow-y-auto scrollbar-thin px-2 pb-6">
      <!-- Overview -->
      <div class="px-3 pt-4 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/70 font-heading">Tổng quan</div>
      <div class="space-y-0.5">
        <button v-for="item in NAV.overview" :key="item.key" :data-to="item.to"
                :class="'nav-item w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium ' + (isActive(item.to) ? 'sidebar-item-active' : '')"
                @click="emit('navigate', item.to)">
          <span class="nav-ico"><component :is="ICONS[item.icon]" :size="16" /></span>
          <span class="flex-1 text-left truncate">{{ item.label }}</span>
        </button>
      </div>

      <!-- Module -->
      <div class="px-3 pt-4 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/70 font-heading">Module</div>
      <div class="space-y-0.5">
        <template v-for="item in NAV.module" :key="item.key">
          <SidebarCollapsible v-if="item.children" :item="item" :icon="ICONS[item.icon]"
                              :active-child="activeChildKey(item)" @child="emit('navigate', $event)" />
          <button v-else :data-to="item.to"
                  :class="'nav-item w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium ' + (isActive(item.to) ? 'sidebar-item-active' : '')"
                  @click="emit('navigate', item.to)">
            <span class="nav-ico"><component :is="ICONS[item.icon]" :size="16" /></span>
            <span class="flex-1 text-left truncate">{{ item.label }}</span>
          </button>
        </template>
      </div>

      <!-- System -->
      <div class="px-3 pt-4 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/70 font-heading">Hệ thống</div>
      <div class="space-y-0.5">
        <button v-for="item in NAV.system" :key="item.key" :data-to="item.to"
                :class="'nav-item w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium ' + (isActive(item.to) ? 'sidebar-item-active' : '')"
                @click="emit('navigate', item.to)">
          <span class="nav-ico"><component :is="ICONS[item.icon]" :size="16" /></span>
          <span class="flex-1 text-left truncate">{{ item.label }}</span>
        </button>
      </div>
    </nav>

    <div class="mx-3 mb-3 rounded-xl border border-border/70 bg-card/60 backdrop-blur p-3">
      <div class="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span class="relative inline-flex h-1.5 w-1.5"><span class="absolute inset-0 rounded-full bg-emerald-500 live-dot" /></span>
        <span>Tất cả hệ thống hoạt động</span>
      </div>
      <div class="mt-1.5 text-[10.5px] font-mono text-muted-foreground/70">v4.0.0 · build 1</div>
    </div>
  </aside>
</template>
```

- [ ] **Step 4: Viết `app/components/layout/SidebarCollapsible.vue`** (tách menu con để file gọn)

Create `app/components/layout/SidebarCollapsible.vue`:
```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
const props = defineProps<{ item: any; icon: any; activeChild?: string }>()
const emit = defineEmits<{ child: [string] }>()
const open = ref(!!props.activeChild)
watch(() => props.activeChild, v => { if (v) open.value = true })
</script>
<template>
  <div>
    <button class="nav-item w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium" @click="open = !open">
      <span class="nav-ico"><component :is="icon" :size="16" /></span>
      <span class="flex-1 text-left truncate">{{ item.label }}</span>
      <ChevronRight :size="14" :class="'transition-transform duration-200 ' + (open ? 'rotate-90' : '')" />
    </button>
    <div class="overflow-hidden transition-[max-height] duration-300" :style="{ maxHeight: open ? item.children.length * 40 + 'px' : '0px' }">
      <div class="mt-1 ml-3 pl-3 border-l border-border/70 space-y-0.5">
        <button v-for="c in item.children" :key="c.key" :data-to="c.to"
                :class="'nav-item is-sub w-full flex items-center gap-2.5 text-left rounded-md px-2.5 py-1.5 text-[12.5px] ' + (activeChild === c.key ? 'sidebar-item-active' : '')"
                @click="emit('child', c.to)">
          <span class="nav-dot" />
          <span class="flex-1 truncate">{{ c.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Chạy test → PASS**; **Step 6: Commit**

```bash
pnpm test -- Sidebar
git add -A && git commit -m "feat(layout): Sidebar + collapsible"
```

---

### Task 15: Layout — `PageHeader.vue` + `admin` layout + wiring `app.vue`

**Files:**
- Create: `app/components/layout/PageHeader.vue`, `app/layouts/admin.vue`
- Replace: `app/app.vue`
- Reference: `../new-erp/page-shell.jsx` lines 3–20 (PageHeader), `../new-erp/dashboard.jsx` lines 98–229 (shell composition).

- [ ] **Step 1: Viết `app/components/layout/PageHeader.vue`**

Create `app/components/layout/PageHeader.vue`:
```vue
<script setup lang="ts">
defineProps<{ eyebrow?: string; title?: string; description?: string }>()
</script>
<template>
  <div class="rise">
    <div class="flex items-start justify-between gap-6 flex-wrap">
      <div class="min-w-0 flex-1">
        <p v-if="eyebrow" class="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground mb-1.5">{{ eyebrow }}</p>
        <h1 v-if="title" class="text-[26px] font-bold font-heading text-foreground leading-tight">{{ title }}</h1>
        <p v-if="description" class="text-[13px] text-muted-foreground mt-1.5 max-w-2xl">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2 flex-nowrap shrink-0"><slot name="actions" /></div>
    </div>
    <slot />
  </div>
</template>
```

- [ ] **Step 2: Viết `app/layouts/admin.vue`**

> Bao Sidebar + Topbar + `<slot/>` trong `<main class="app-canvas">`. Route hiện tại lấy từ `useRoute().path`; điều hướng bằng `navigateTo`. Theme/locale từ `useTweaks` + `useI18n`. Tiêu đề/breadcrumb suy từ map route.

Create `app/layouts/admin.vue`:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import Sidebar from '~/components/layout/Sidebar.vue'
import Topbar from '~/components/layout/Topbar.vue'

const route = useRoute()
const { tweaks, setTweak } = useTweaks()
const { locale, setLocale } = useI18n()

const CRUMBS: Record<string, { label: string }[]> = {
  '/home-admin': [{ label: 'Trang chủ' }, { label: 'Tổng quan' }],
}
const crumbs = computed(() => CRUMBS[route.path] ?? [{ label: 'Trang chủ' }])
const isDark = computed(() => tweaks.value.theme === 'dark')
const density = computed(() => tweaks.value.density)

function navigate(to: string) { navigateTo(to) }
function toggleTheme() { setTweak('theme', isDark.value ? 'light' : 'dark') }
</script>

<template>
  <div class="flex min-h-svh">
    <Sidebar :active-route="route.path" @navigate="navigate" />
    <div class="flex-1 min-w-0 flex flex-col">
      <Topbar :crumbs="crumbs" :is-dark="isDark" :locale="locale" :unread="3"
              @toggle-theme="toggleTheme" @update:locale="(l) => setLocale(l as any)" />
      <main class="app-canvas flex-1 overflow-y-auto scrollbar-thin">
        <div :key="route.path" :class="'mx-auto max-w-[1400px] flex flex-col min-h-full ' + (density === 'compact' ? 'p-4' : 'p-6')">
          <div :class="'flex-1 ' + (density === 'compact' ? 'space-y-4' : 'space-y-6')">
            <slot />
          </div>
          <footer class="pt-4 pb-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/70 mt-10">
            <span>© 2026 GMO-Z.com Vietnam Lab Center · VNLab Internal</span>
            <span class="font-mono">Cập nhật lần cuối · {{ new Date().toLocaleString('vi-VN') }}</span>
          </footer>
        </div>
      </main>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Viết `app/app.vue` chính thức**

Replace `app/app.vue`:
```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 4: Tạo redirect index → /home-admin**

Create `app/pages/index.vue`:
```vue
<script setup lang="ts">
definePageMeta({ layout: false })
await navigateTo('/home-admin')
</script>
<template><div /></template>
```

- [ ] **Step 5: Tạo placeholder `app/pages/home-admin.vue` để verify shell**

Create `app/pages/home-admin.vue`:
```vue
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
<template>
  <PageHeader eyebrow="Tổng quan" title="Bảng điều khiển" description="Shell hoạt động — Home thật ở Task 18-19." />
</template>
```

- [ ] **Step 6: Verify dev**

Run: `pnpm dev` → mở `http://localhost:3000`
Expected: vào thẳng `/home-admin`; sidebar trái (logo, nav, active highlight, footer live dot), topbar (breadcrumb, cờ, theme toggle, bell badge 3, user), nền app-canvas. Bấm theme toggle → dark mode đổi tức thì. Bấm nav HRM → menu con xổ. Không lỗi.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(layout): PageHeader, admin layout, app shell wiring"
```

---

### Task 16: `TweaksPanel.vue` (Vue, localStorage — KHÔNG dùng host-protocol)

**Files:**
- Create: `app/components/layout/TweaksPanel.vue`
- Modify: `app/layouts/admin.vue` (gắn panel)
- Reference: `../new-erp/dashboard.jsx` lines 164–226 (nội dung panel: theme/density radio, route select bỏ, accent grid). KHÔNG port `tweaks-panel.jsx` (đó là tooling host-protocol).

- [ ] **Step 1: Viết `app/components/layout/TweaksPanel.vue`**

> Panel nổi góc phải-dưới, toggle bằng nút bánh răng. Điều khiển: Chế độ (Sáng/Tối), Mật độ (Thoáng/Đặc), Màu chủ đạo (5 swatch accent từ `useAppConfig().accents`). Ghi qua `setTweak`.

Create `app/components/layout/TweaksPanel.vue`:
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SlidersHorizontal, X, Check } from 'lucide-vue-next'
const { tweaks, setTweak } = useTweaks()
const accents = useAppConfig().accents
const open = ref(false)
</script>

<template>
  <div class="fixed right-4 bottom-4 z-[2147483646]">
    <button v-if="!open" class="h-11 w-11 rounded-full text-white shadow-popover flex items-center justify-center"
            :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }"
            title="Tweaks" @click="open = true">
      <SlidersHorizontal :size="18" />
    </button>

    <div v-else class="w-[280px] rounded-2xl border border-border bg-popover/95 backdrop-blur shadow-popover overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-border">
        <b class="text-[13px] font-heading">Tweaks</b>
        <button class="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="open = false"><X :size="14" /></button>
      </div>
      <div class="p-4 space-y-4">
        <!-- Theme -->
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Chế độ</p>
          <div class="grid grid-cols-2 gap-1.5">
            <button v-for="o in [{ v: 'light', l: 'Sáng' }, { v: 'dark', l: 'Tối' }]" :key="o.v"
                    :class="'h-8 rounded-lg text-[12.5px] font-medium border ' + (tweaks.theme === o.v ? 'border-primary text-primary bg-primary/10' : 'border-border text-foreground/80 hover:bg-muted')"
                    @click="setTweak('theme', o.v as any)">{{ o.l }}</button>
          </div>
        </div>
        <!-- Density -->
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Mật độ</p>
          <div class="grid grid-cols-2 gap-1.5">
            <button v-for="o in [{ v: 'comfortable', l: 'Thoáng' }, { v: 'compact', l: 'Đặc' }]" :key="o.v"
                    :class="'h-8 rounded-lg text-[12.5px] font-medium border ' + (tweaks.density === o.v ? 'border-primary text-primary bg-primary/10' : 'border-border text-foreground/80 hover:bg-muted')"
                    @click="setTweak('density', o.v as any)">{{ o.l }}</button>
          </div>
        </div>
        <!-- Accent -->
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Màu chủ đạo</p>
          <div class="grid grid-cols-5 gap-1.5">
            <button v-for="(p, k) in accents" :key="k" :title="p.label"
                    class="aspect-square rounded-lg flex items-center justify-center text-white"
                    :style="{ border: tweaks.accent === k ? '2px solid #fff' : '1px solid rgba(0,0,0,0.06)', boxShadow: tweaks.accent === k ? `0 0 0 2px hsl(${p.h} ${p.s}% 50%)` : 'none', background: `linear-gradient(135deg, hsl(${p.h} ${p.s}% 65%), hsl(${p.h} ${p.s}% 42%))` }"
                    @click="setTweak('accent', k as string)">
              <Check v-if="tweaks.accent === k" :size="12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Gắn panel vào `admin.vue`**

Trong `app/layouts/admin.vue`, thêm trước `</div>` cuối: `<TweaksPanel />` và import:
```ts
import TweaksPanel from '~/components/layout/TweaksPanel.vue'
```
(đặt `<TweaksPanel />` ngay sau `</main>`-bao, bên trong root `div.flex`).

- [ ] **Step 3: Verify dev** — Run `pnpm dev`, bấm nút bánh răng góc phải-dưới: đổi Sáng/Tối, Thoáng/Đặc, 5 màu accent → toàn UI đổi màu/độ đặc tức thì, reload vẫn giữ (localStorage).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(layout): TweaksPanel (theme/density/accent, persisted)"
```

---

### Task 17: Mock data infra + dữ liệu Home

**Files:**
- Create: `app/types/index.ts`, `app/mocks/dashboard.ts`
- Test: `tests/mocks.spec.ts`
- Reference: `../new-erp/dashboard.jsx` lines 39–70, `../new-erp/tabs-content.jsx` (dữ liệu reminders/notifications/project).

- [ ] **Step 1: Viết test (failing)**

Create `tests/mocks.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { dashboardStats, homeTabs } from '../app/mocks/dashboard'

describe('mocks/dashboard', () => {
  it('có 3 stat card với sparkData', () => {
    expect(dashboardStats).toHaveLength(3)
    expect(dashboardStats[0].sparkData.length).toBeGreaterThan(0)
  })
  it('có 3 tab', () => {
    expect(homeTabs.map(t => t.value)).toEqual(['company', 'personal', 'project'])
  })
})
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- mocks`

- [ ] **Step 3: Viết `app/types/index.ts`**

Create `app/types/index.ts`:
```ts
export type Trend = { dir: 'up' | 'down'; value: string }
export type StatCardData = {
  label: string; icon: string; value: string | number
  trend?: Trend; sublabel?: string; sparkData: number[]
  breakdown: { label: string; value: string | number }[]
}
export type TabItem = { value: string; label: string }
```

- [ ] **Step 4: Viết `app/mocks/dashboard.ts`**

Create `app/mocks/dashboard.ts`:
```ts
import type { StatCardData, TabItem } from '~/types'

export const dashboardStats: StatCardData[] = [
  { label: 'Tổng nhân viên', icon: 'Users', value: 248, trend: { dir: 'up', value: '+12' }, sublabel: 'So với quý trước',
    sparkData: [212, 218, 224, 229, 232, 238, 244, 248],
    breakdown: [{ label: 'Hà Nội', value: 142 }, { label: 'Đà Nẵng', value: 58 }, { label: 'Hồ Chí Minh', value: 38 }, { label: 'Osaka', value: 10 }] },
  { label: 'Dự án', icon: 'Folder', value: 9, trend: { dir: 'up', value: '+1' }, sublabel: '6 đang hoạt động',
    sparkData: [6, 6, 7, 7, 8, 8, 9, 9],
    breakdown: [{ label: 'Đang hoạt động', value: 6 }, { label: 'Chờ khởi động', value: 2 }, { label: 'Đã kết thúc', value: 1 }] },
  { label: 'Kỳ đánh giá', icon: 'Star', value: 'Q2/26', sublabel: '94 nhân viên đã đánh giá',
    sparkData: [40, 55, 68, 80, 92, 94],
    breakdown: [{ label: 'Đã hoàn thành', value: '94 / 248' }, { label: 'Hạn cuối nộp', value: '15/06' }, { label: 'Tỷ lệ đạt S+A', value: '17%' }] },
]

export const homeTabs: TabItem[] = [
  { value: 'company', label: 'Thông tin công ty' },
  { value: 'personal', label: 'Thông tin của bạn' },
  { value: 'project', label: 'Thông tin dự án' },
]

export const reminders = [
  { name: 'Sinh nhật Trần Thị Mai', sub: 'Đà Nẵng · 25 tuổi', when: 'Hôm nay', icon: 'cake' },
  { name: 'Sinh nhật Đỗ Minh Tuấn', sub: 'Hà Nội · 31 tuổi', when: 'Thứ Hai', icon: 'cake' },
  { name: 'Vào công ty Hoàng Đức Thành', sub: '3 năm tại VNLab', when: '24/05', icon: 'gift' },
]
```
> Bổ sung dữ liệu Personal/Project khi dựng tab panels (Task 19); đối chiếu `tabs-content.jsx` để khớp.

- [ ] **Step 5: Chạy test → PASS**; **Step 6: Commit**

```bash
pnpm test -- mocks
git add -A && git commit -m "feat(mocks): dashboard data + types"
```

---

### Task 18: Home — `Banner.vue` + `StatCard.vue`

**Files:**
- Create: `app/components/home/Banner.vue`, `app/components/home/StatCard.vue`
- Test: `tests/components/StatCard.spec.ts`
- Reference: `../new-erp/banner.jsx` (toàn bộ).

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/StatCard.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatCard from '../../app/components/home/StatCard.vue'

describe('StatCard', () => {
  it('hiển thị value, sublabel, sparkline, breakdown', () => {
    const w = mount(StatCard, { props: {
      label: 'Tổng', icon: 'Users', value: 248, sublabel: 'x',
      sparkData: [1, 2, 3], breakdown: [{ label: 'HN', value: 142 }],
    } })
    expect(w.text()).toContain('248')
    expect(w.find('svg').exists()).toBe(true)
    expect(w.text()).toContain('142')
  })
})
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `pnpm test -- StatCard`

- [ ] **Step 3: Viết `app/components/home/StatCard.vue`**

> Port `banner.jsx` StatCard (lines 114–177): header (label/value/trend + icon chip), sparkline (width 240 h 36 màu primary), breakdown list. Icon qua lucide map.

Create `app/components/home/StatCard.vue`:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { Users, Folder, Star, TrendingUp, TrendingDown } from 'lucide-vue-next'
import Sparkline from '~/components/charts/Sparkline.vue'
import type { StatCardData } from '~/types'

const props = withDefaults(defineProps<StatCardData & { delay?: number }>(), { delay: 0 })
const ICONS: Record<string, any> = { Users, Folder, Star }
const trendUp = computed(() => props.trend?.dir === 'up')
</script>

<template>
  <div class="card-surface interactive p-5 rise flex flex-col gap-4"
       :style="{ animationDelay: delay + 'ms', backgroundImage: 'radial-gradient(ellipse 80% 60% at 100% 0%, hsl(var(--primary-h) var(--primary-s) 57% / 0.09), transparent 70%)' }">
    <div class="flex items-start justify-between gap-3">
      <div>
        <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{{ label }}</span>
        <div class="mt-1.5 flex items-baseline gap-2">
          <span class="text-[34px] font-bold text-foreground font-heading tabular-nums leading-none">{{ value }}</span>
          <span v-if="trend" :class="'inline-flex items-center gap-0.5 text-[12px] font-semibold tabular-nums ' + (trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')">
            <component :is="trendUp ? TrendingUp : TrendingDown" :size="12" />{{ trend.value }}
          </span>
        </div>
        <p v-if="sublabel" class="text-[12px] text-muted-foreground mt-1">{{ sublabel }}</p>
      </div>
      <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
           :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60% / 0.16), hsl(var(--primary-h) var(--primary-s) 40% / 0.10))', color: 'hsl(var(--primary))' }">
        <component :is="ICONS[icon]" :size="18" />
      </div>
    </div>
    <div v-if="sparkData" class="text-primary -mx-1">
      <Sparkline :data="sparkData" :width="240" :height="36" stroke="currentColor" />
    </div>
    <div v-if="breakdown" class="space-y-1.5 pt-2 border-t border-border/70">
      <div v-for="(b, i) in breakdown" :key="i" class="flex items-center justify-between text-[12px]">
        <span class="text-muted-foreground">{{ b.label }}</span>
        <span class="font-semibold text-foreground tabular-nums">{{ b.value }}</span>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Viết `app/components/home/Banner.vue`**

> Port `banner.jsx` Banner (lines 3–112): greeting theo giờ, tên (Lora italic accent), ngày + giờ live dot, thẻ check-in 3 trạng thái (none→in→out), strip "Truy cập nhanh". State `checkinState` nội bộ component.

Create `app/components/home/Banner.vue`:
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar, LogIn, LogOut, Check, FileText, Timer, Clock, Users, Folder } from 'lucide-vue-next'

const checkinState = ref<'none' | 'in' | 'out'>('none')
const now = new Date()
const greet = computed(() => { const h = now.getHours(); return h < 12 ? 'Chào buổi sáng' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối' })
const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const QUICK = [
  { l: 'Tạo đơn nghỉ', i: FileText }, { l: 'Yêu cầu tăng ca', i: Timer },
  { l: 'Xem lịch chấm công', i: Clock }, { l: 'Hồ sơ nhân viên', i: Users }, { l: 'Tạo dự án', i: Folder },
]
function toggleCheckin() { checkinState.value = checkinState.value === 'none' ? 'in' : checkinState.value === 'in' ? 'out' : 'none' }
</script>

<template>
  <div class="relative overflow-hidden card-surface rise">
    <div class="absolute inset-y-0 right-0 w-1/2 pointer-events-none opacity-90"
         :style="{ background: 'linear-gradient(115deg, transparent 25%, hsl(var(--primary-h) var(--primary-s) 60% / 0.10) 60%, hsl(var(--primary-h) var(--primary-s) 50% / 0.18) 100%)' }" />
    <div class="absolute -right-12 -bottom-12 w-56 h-56 rounded-full pointer-events-none"
         :style="{ background: 'radial-gradient(circle, hsl(var(--primary-h) var(--primary-s) 60% / 0.22), transparent 65%)' }" />

    <div class="relative p-6 flex items-stretch justify-between gap-6 flex-wrap">
      <div class="min-w-0">
        <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ greet }},</p>
        <h1 class="font-display mt-1.5 leading-[1.05] text-foreground" style="font-size:36px;font-weight:500;letter-spacing:-0.025em">
          Nguyễn <span style="font-style:italic;font-weight:400;color:hsl(var(--primary-h) var(--primary-s) 47%)">Văn An</span>
        </h1>
        <div class="mt-3 flex items-center gap-3 text-[12.5px] text-muted-foreground">
          <span class="inline-flex items-center gap-1.5"><Calendar :size="13" />{{ dateStr }}</span>
          <span class="text-border">•</span>
          <span class="inline-flex items-center gap-1.5 font-mono"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot" />08:42</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden sm:block text-right">
          <p class="text-[12px] text-muted-foreground uppercase tracking-wider font-medium">Trạng thái hôm nay</p>
          <p v-if="checkinState === 'in'" class="text-[13px] text-foreground mt-1">Đã chấm công vào lúc <span class="font-semibold tabular-nums">08:42</span></p>
          <p v-else-if="checkinState === 'out'" class="text-[13px] text-foreground mt-1">Đã hoàn tất chấm công <span class="text-emerald-600 font-semibold">✓</span></p>
          <p v-else class="text-[13px] text-foreground mt-1">Bạn chưa chấm công vào</p>
        </div>
        <button v-if="checkinState === 'none'" class="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold text-white shadow-card-hover transition-all hover:scale-[1.02]"
                :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }" @click="toggleCheckin">
          <LogIn :size="15" />Chấm công vào
        </button>
        <button v-else-if="checkinState === 'in'" class="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold border border-border bg-card text-foreground hover:border-primary transition-colors" @click="toggleCheckin">
          <LogOut :size="15" />Chấm công ra
        </button>
        <button v-else class="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold border border-border bg-muted/50 text-muted-foreground cursor-default">
          <Check :size="15" />Đã hoàn tất
        </button>
      </div>
    </div>

    <div class="relative border-t border-border/70 px-6 py-3 flex items-center gap-1 flex-wrap text-[12.5px]">
      <span class="text-muted-foreground mr-2 font-medium">Truy cập nhanh:</span>
      <button v-for="(a, i) in QUICK" :key="i" class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-foreground/80 hover:bg-muted hover:text-primary transition-colors">
        <component :is="a.i" :size="13" />{{ a.l }}
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Chạy test → PASS**; **Step 6: Commit**

```bash
pnpm test -- StatCard
git add -A && git commit -m "feat(home): Banner + StatCard"
```

---

### Task 19: Home — tab panels + ráp trang `home-admin.vue`

**Files:**
- Create: `app/components/home/CompanyTab.vue`, `app/components/home/PersonalTab.vue`, `app/components/home/ProjectTab.vue`
- Replace: `app/pages/home-admin.vue`
- Reference: `../new-erp/tabs-content.jsx` (toàn bộ 652 dòng — port cấu trúc từng tab), `../new-erp/dashboard.jsx` lines 35–96 (PageHome).

- [ ] **Step 1: Viết `CompanyTab.vue`** (Nhắc nhở sắp tới + Thông báo gần đây + chart công ty)

> Port section "Thông tin công ty" từ `tabs-content.jsx`: lưới 2 cột — card "Nhắc nhở sắp tới" (dùng `reminders` mock, icon cake/gift) và card "Thông báo gần đây"; bên dưới chart phân bố nhân sự (dùng `BarRow`) + tăng trưởng (dùng `LineChart`). Đối chiếu trực tiếp `tabs-content.jsx` cho từng block để khớp markup/spacing.

Create `app/components/home/CompanyTab.vue` (port theo reference; cấu trúc tối thiểu phải có: 2 card grid + 1 khối chart). Dùng `card-surface`, `section-title`, `Badge`, `BarRow`, `LineChart`.

- [ ] **Step 2: Viết `PersonalTab.vue`** (thông tin cá nhân: nghỉ phép còn lại dạng `Donut`, lịch sử chấm công, đơn của tôi) — port từ `tabs-content.jsx` section "Thông tin của bạn".

- [ ] **Step 3: Viết `ProjectTab.vue`** (danh sách dự án + tiến độ `StackedBar`/`BarRow`) — port từ `tabs-content.jsx` section "Thông tin dự án".

- [ ] **Step 4: Ráp `app/pages/home-admin.vue`**

Replace `app/pages/home-admin.vue`:
```vue
<script setup lang="ts">
import { ref } from 'vue'
import Banner from '~/components/home/Banner.vue'
import StatCard from '~/components/home/StatCard.vue'
import Tabs from '~/components/base/Tabs.vue'
import CompanyTab from '~/components/home/CompanyTab.vue'
import PersonalTab from '~/components/home/PersonalTab.vue'
import ProjectTab from '~/components/home/ProjectTab.vue'
import { dashboardStats, homeTabs } from '~/mocks/dashboard'

definePageMeta({ layout: 'admin' })
const activeTab = ref('company')
</script>

<template>
  <Banner />
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <StatCard v-for="(s, i) in dashboardStats" :key="i" v-bind="s" :delay="80 + i * 60" />
  </div>
  <Tabs v-model="activeTab" :items="homeTabs" />
  <CompanyTab v-if="activeTab === 'company'" />
  <PersonalTab v-else-if="activeTab === 'personal'" />
  <ProjectTab v-else />
</template>
```

- [ ] **Step 5: Verify dev** — Run `pnpm dev`, mở `/home-admin`.
Expected: trùng khớp screenshot `../new-erp/screenshots/01-final.png` (banner, 3 stat card có sparkline + breakdown, 3 tab; mỗi tab hiển thị nội dung đúng). Đổi accent ở TweaksPanel → sparkline/chart đổi màu theo.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(home): tab panels + assemble dashboard page"
```

---

### Task 20: Routing/error + verify thị giác (Playwright)

**Files:**
- Create: `app/error.vue`, `e2e/home.spec.ts`, `playwright.config.ts`
- Create placeholder pages cho các route sidebar còn lại (tránh 404 khi click nav)

- [ ] **Step 1: Viết `app/error.vue`**

Create `app/error.vue`:
```vue
<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>()
</script>
<template>
  <div class="app-canvas min-h-svh flex items-center justify-center p-10">
    <div class="card-surface p-8 text-center max-w-md">
      <p class="text-[64px] font-bold font-heading text-primary">{{ props.error.statusCode }}</p>
      <p class="text-muted-foreground mt-2">{{ props.error.message }}</p>
      <button class="mt-4 h-9 px-4 rounded-md text-white" :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }" @click="clearError({ redirect: '/home-admin' })">Về trang chủ</button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Tạo placeholder cho các route sidebar còn lại**

Create các file sau, mỗi file dùng layout admin + `PageHeader` placeholder (Plan B/C sẽ thay nội dung thật):
`app/pages/hrm/member.vue`, `app/pages/hrm/leave.vue`, `app/pages/hrm/asset.vue`, `app/pages/hrm/contract.vue`, `app/pages/hrm/timekeeping.vue`, `app/pages/evaluation.vue`, `app/pages/workflow/project.vue`, `app/pages/recruitment.vue`, `app/pages/request/overtime.vue`, `app/pages/settings.vue`.

Mẫu nội dung mỗi file (đổi title cho đúng):
```vue
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
<template>
  <PageHeader eyebrow="Đang phát triển" title="<TÊN TRANG>" description="Trang này sẽ được dựng ở Plan B/C." />
</template>
```
> Cập nhật bảng `CRUMBS` trong `admin.vue` thêm các path tương ứng (breadcrumb đúng).

- [ ] **Step 3: Viết `playwright.config.ts`**

Create `playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: { command: 'pnpm dev', url: 'http://localhost:3000', reuseExistingServer: true, timeout: 120000 },
})
```

- [ ] **Step 4: Viết e2e smoke + ảnh chụp**

Create `e2e/home.spec.ts`:
```ts
import { test, expect } from '@playwright/test'

test('home dashboard render + theme toggle + nav', async ({ page }) => {
  await page.goto('/home-admin')
  await expect(page.getByText('Bảng điều khiển').or(page.getByRole('heading', { name: /Văn An/ }))).toBeVisible()
  // stat cards
  await expect(page.getByText('Tổng nhân viên')).toBeVisible()
  await expect(page.getByText('248')).toBeVisible()
  // theme toggle
  await page.locator('[data-test="theme-toggle"]').click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  // nav HRM → member
  await page.getByText('Nhân sự (HRM)').click()
  await page.getByText('Quản lý nhân viên').click()
  await expect(page).toHaveURL(/hrm\/member/)
  await page.screenshot({ path: 'e2e/__screenshots__/home.png', fullPage: true })
})
```

- [ ] **Step 5: Chạy e2e**

Run: `pnpm exec playwright install --with-deps chromium` rồi `pnpm test:e2e`
Expected: PASS. Mở `e2e/__screenshots__/home.png` đối chiếu `../new-erp/screenshots/01-final.png` — bố cục, màu, font khớp.

- [ ] **Step 6: Typecheck + lint toàn dự án**

Run: `pnpm typecheck && pnpm lint`
Expected: không lỗi (sửa nếu có).

- [ ] **Step 7: Commit + merge branch**

```bash
git add -A && git commit -m "feat: error page, route placeholders, e2e smoke (Plan A done)"
git checkout main 2>/dev/null || git checkout master
git merge --no-ff rebuild/nuxt4-new-design -m "merge: Nuxt4 rebuild Plan A"
```

---

## Self-Review (đã rà)

- **Spec coverage:** Nuxt 4 SPA (Task 1) ✓; tokens/fonts/dark/accent/density (Task 2-3, 16) ✓; bộ component mới thuần Vue (Task 5-9) ✓; reka-ui headless — *hoãn sang Plan B* (Plan A chưa cần widget phức tạp) ✓ có chủ đích; chart hybrid (Task 10-12) ✓; layout Sidebar/Topbar/PageShell (Task 13-15) ✓; tách mocks (Task 17) ✓; dọn deps + 1 lock file (Task 1) ✓; eslint/vitest/playwright (Task 1, 3, 20) ✓; trang Home khớp mockup (Task 18-19) ✓.
- **Placeholder scan:** Task 19 Step 1-3 và Task 20 Step 2 cố tình để executor port nội dung dài từ `tabs-content.jsx` (file nguồn có sẵn trong repo) + nêu rõ block bắt buộc — đây là tham chiếu nguồn cụ thể, không phải placeholder mơ hồ.
- **Type consistency:** `Tweaks`, `StatCardData`, `TabItem` dùng nhất quán; `setTweak(key, value)`, `useTweaks()` đồng nhất giữa Task 3/15/16; `dashboardStats`/`homeTabs` khớp test Task 17 và dùng ở Task 19.

## Phạm vi tiếp theo
- **Plan B (HRM):** base components còn lại (Select, FieldInput, FilterBar, Pagination, Modal, Drawer, Toast, Table — dùng reka-ui cho Select/Dialog/Tooltip) + trang member/leave/asset/contract/timekeeping + mocks tương ứng.
- **Plan C:** evaluation, project, recruitment, overtime, settings, auth.
- **Plan migrate API:** nối store/composable thật vào component (component đã tách data nên không phải sửa).
