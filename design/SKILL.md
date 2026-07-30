---
name: micro-erp-design
description: Use this skill to generate well-branded interfaces and assets for Micro ERP (VNLab HRM / workflow admin console), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read `readme.md` in this skill, then explore the other files.

- **Tokens & global styles:** link `styles.css` (it `@import`s `tokens/*.css`). All color/type/effect tokens are CSS custom properties; colors are HSL components — use `hsl(var(--token))` or `hsl(var(--token) / <alpha>)`. Dark mode via `.dark` on a root element.
- **Components:** `components/<group>/<Name>.jsx` — Button, Badge, Avatar, Input, Select, Checkbox, Card, StatCard, Pagination, Icon. Each has a `.d.ts` (props) and `.prompt.md` (usage).
- **UI kit:** `ui_kits/erp-admin/` — full interactive admin console recreation.
- **Assets:** `assets/logo*.png` (VNLab wordmark), `assets/flags/*.svg`, `assets/icons.jsx` (full ~55-glyph custom icon map).

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and produce static HTML for the user to view. If working on production code, copy assets and follow the rules here to design on-brand.

If invoked without guidance, ask what to build, ask a few questions, and act as an expert designer producing HTML artifacts or production code as needed.

Signature look to preserve: single sky-blue accent (135° gradient on primary surfaces), white 14px-radius cards on a faint accent-mesh canvas, Plus Jakarta Sans + Lora display + JetBrains Mono numerics, hairline borders over heavy shadows, focus via accent border (never an outline ring), subtle `rise` entry motion. Vietnamese-first copy, no emoji.
