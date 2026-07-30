# Micro ERP — Design System

The design language of **Micro ERP**, an internal HRM / workflow ERP web app (VNLab). It is a dense, calm, information-rich admin console: sidebar + topbar shell, data tables, stat cards, filters, and forms. Vietnamese-first, with Japanese/English localization built in. This design system extracts the tokens, foundations, components, and screens directly from the existing app so future work stays visually unified.

**Source of truth:** the existing app in this same project — `Admin Dashboard.html` (global CSS + Tailwind config), `page-shell.jsx` (shared primitives), `sidebar.jsx`, `topbar.jsx`, `banner.jsx`, `charts.jsx`, `icons.jsx`, and the `page-*.jsx` module screens. Those files are the ground truth; this system documents them without changing them.

---

## Content fundamentals

- **Language.** Vietnamese is primary. UI supports `vi` / `en` / `ja` (locale switcher in the topbar). Any CJK text falls back to Noto Sans/Serif JP automatically — no manual font switching.
- **Voice.** Professional, concise, functional. Labels are short imperative or noun phrases: "Chấm công vào" (Clock in), "Tạo đơn nghỉ" (Create leave request), "Quản lý nhân viên" (Manage employees). No marketing fluff, no exclamation.
- **Casing.** Sentence case for buttons, nav, and body. UPPERCASE only for micro-labels/eyebrows (stat labels, group headers) with wide `0.14em` tracking.
- **Greeting warmth.** One deliberately warm touch: the dashboard banner greets by time of day ("Chào buổi sáng") and renders the user's given name in italic Lora serif accent. Everywhere else is neutral.
- **Numbers.** Always `tabular-nums`, usually in JetBrains Mono for IDs, times, versions, counts (e.g. `08:42`, `v3.4.1 · build 1788`).
- **No emoji** in the product chrome. Occasional inline check glyph (✓) appears in status copy only.

## Visual foundations

- **Accent.** A single sky-blue primary (`hsl(203 89% 57%)`), composed from `--primary-h` / `--primary-s` so the entire accent can be re-hued in one place. Primary surfaces (buttons, active nav, pagination) use a **135° gradient** from light→dark blue, never a flat fill.
- **Neutrals.** Cool grays with a faint blue cast (foreground `226 45% 15%`, muted `220 18% 96%`, border `220 14% 91%`). White cards on a near-white canvas.
- **Backgrounds are never flat.** The main canvas (`.app-canvas`) layers two faint radial accent tints (opposite corners) over a barely-there 22px dot grid. The sidebar (`.sidebar-bg`) blooms accent at top & bottom over a near-white middle. Kept very low opacity — texture, not decoration.
- **Cards.** `.card-surface` = white bg, 1px `--border`, **14px radius**, whisper shadow (`0 1px 2px rgb(0 0 0 /.03)`). Interactive cards lift on hover with an accent-tinted shadow and border. Stat/mini-stat cards add a soft radial accent tint in the top-right corner.
- **Radii.** Checkbox 3px · buttons/inputs 6px · icon chips/avatars 8px · filter bars/popovers 12px · cards 14px · badges/bars/pills full.
- **Shadows.** Three tiers: `--shadow-card` (rest), `--shadow-card-hover`, `--shadow-popover` (dropdowns/menus, larger + softer). Primary elements add an accent glow `--shadow-primary`.
- **Typography.** Plus Jakarta Sans for everything structural (body 13px, nav 13.5px, page title 26px/700, stat numbers 34px/700, headings tracking `-0.02em`). Lora italic serif is reserved for the one display moment (banner greeting) and pull-quote/eval headings. JetBrains Mono for all numerics.
- **Motion.** Subtle and quick. Content rises in (`rise`, 8px + fade, 0.5s `cubic-bezier(.2,.7,.2,1)`), often staggered by `animationDelay`. Dropdowns use `selectIn`. A live status dot pulses (`live-dot`). Ease is always the same custom ease-out.
- **Hover states.** Nav items tint to a light-accent background + accent text and nudge `translateX(2px)`. Buttons scale `1.02` (primary) / tint muted (secondary). Cards lift. Links/ghost items go to accent color.
- **Press states.** Primary buttons scale down to `0.98`.
- **Focus.** The browser's default outline/ring is removed globally; focus is signaled by **border-color → accent** (plus a faint 2px accent ring on custom Select/DatePicker triggers). Never a square outline.
- **Borders over shadows.** Structure is drawn mostly with hairline `--border` lines (table rows, dividers, filter bars, card edges); shadow is used sparingly for elevation.
- **Transparency & blur.** Topbar and filter bars use `bg-*/60-80` + `backdrop-blur`. Badge fills are low-opacity tints of their hue.
- **Status color system.** success/emerald (green), warning (amber), danger (red), info/sky, violet — each available as a solid (`--success` etc.) and as a soft badge tint pair (`--badge-*-bg` / `--badge-*-fg`).
- **Dark mode.** Full parallel palette on `.dark` — deep desaturated navy surfaces (`222 47% 7%` bg), lighter primary (`63%` L), reduced-opacity textures.

## Iconography

- **Custom inline-SVG icon set** — a hand-built Lucide-style family in `icons.jsx` (~55 glyphs: Dashboard, Users, Star, Folder, Calendar, Clock, Bell, Search, TrendUp/Down, etc.). All 24×24, `fill="none"`, `stroke="currentColor"`, **stroke-width 1.7**, round caps/joins. They inherit text color, so they tint with `currentColor` / the accent automatically.
- Reproduced in this system as the `Icon` component (see `components/icon/`). The full glyph map lives in `assets/icons.jsx` (copied from source) — add new glyphs there in the same style.
- **No emoji, no icon font, no PNG icons.** Flag SVGs (`assets/flags/*.svg`) are used only in the locale switcher.
- **Charts are inline SVG too** (`charts.jsx`): Sparkline, BarRow, Donut, LineChart, StackedBar — all read `--primary` so they re-tint with the accent.

## Logo

`assets/logo.png` (color, for light sidebar), `logo-white.png` (dark surfaces), `logo-blue.png` — the **VNLab** wordmark. Copied from source, used at ~28px height in the sidebar header. No logo was invented.

---

## Index / manifest

- `styles.css` — entry point; `@import`s everything below. **Consumers link this one file.**
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `effects.css`, `base.css` (element defaults + signature helper classes: `.card-surface`, `.app-canvas`, `.sidebar-bg`, `.eyebrow`, `.rise`, …).
- `components/` — reusable primitives, each with `.jsx` + `.d.ts` + `.prompt.md` + a `@dsCard` HTML:
  - `button/` · `badge/` · `avatar/` · `input/` · `select/` · `checkbox/` · `card/` · `stat/` · `pagination/` · `icon/`
- `ui_kits/erp-admin/` — full ERP admin console recreation (`index.html`).
- `assets/` — `logo*.png`, `flags/*.svg`, `icons.jsx` (glyph map).
- Foundation specimen cards live in `guidelines/` (Colors, Type, Effects groups).
- `SKILL.md` — Agent-Skills-compatible entry.
