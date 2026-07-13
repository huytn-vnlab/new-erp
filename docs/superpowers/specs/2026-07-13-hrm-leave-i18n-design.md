# HRM Leave module — i18n

## Goal

Apply full i18n (vi/en/ja) to `app/pages/hrm/leave.vue` and its supporting component `app/components/leave/LeaveGrid.vue`, so every user-facing string — including the auto-generated leave-request email title/content — renders in the currently selected locale. This is a deliberate exception to the project convention "pages dùng text VI trực tiếp, không `t()`" (documented in `new-erp/CLAUDE.md`), scoped to this module only per explicit request.

## Scope

- `app/pages/hrm/leave.vue`
- `app/components/leave/LeaveGrid.vue`
- `app/mocks/leave.ts` (shared type/color/status constants consumed by both of the above)
- `i18n/locales/vi.json`, `en.json`, `ja.json`

Out of scope: other HRM pages, unrelated mock arrays in `mocks/leave.ts` (`LEAVE_MEMBERS`, `LEAVE_ENTRIES`, `LEAVE_INFO_ROWS`, `LEAVE_HISTORY_ROWS`, `LEAVE_ADD_TYPES`) beyond the mechanical type-key update needed to keep them type-checking.

## Problem: labels are used as lookup keys, not just display text

Today, `LEAVE_TYPE_ID_MAP` (in `leave.vue`) maps a numeric `leave_request_type_id` (1–9) straight to a **Vietnamese label**, and that label is then used both for display AND as the object key into `LEAVE_TYPE_META` (in `mocks/leave.ts`, consumed by `LeaveGrid.vue`) to look up calendar-cell colors. If the label becomes locale-dependent, switching to EN/JA silently breaks calendar coloring (lookup miss → undefined style) and any other place doing string-keyed lookups against the label.

`LEAVE_STATUS_META` has the same shape issue (keyed by stable slug `'pending'/'approved'/'rejected'`, which is fine, but currently stores raw Vietnamese `label` text instead of an i18n key).

### Resolution

Follow the pattern already established in `app/pages/hrm/member/index.vue` (`MEMBER_STATUS_META: Record<string, { labelKey: string; variant }>`, resolved via `t(v.labelKey)` at render time):

- Rekey `LEAVE_TYPE_META` in `mocks/leave.ts` from Vietnamese-string keys to the numeric `leave_request_type_id` (1–9). Colors/variants unchanged, only the key type changes.
- Change `LeaveType` (in `mocks/leave.ts`) from a Vietnamese string-literal union to `number`.
- `LEAVE_TYPE_ID_MAP` and `BONUS_TYPE_ID_MAP` (currently local `Record<number, string>` in `leave.vue`, storing literal Vietnamese text) move to `mocks/leave.ts` as the single shared source, and store **i18n key strings** (e.g. `'hrm.leave.type.fullDay'`) instead of literal text.
- `LEAVE_STATUS_META` (both the copy in `mocks/leave.ts` and the duplicate defined locally in `leave.vue`) collapses to one definition in `mocks/leave.ts`, storing `labelKey` instead of `label`.
- `GridEntry.type` / `LeaveEntry.type` (in `leave.vue`) carry the raw numeric ID directly — no label lookup happens at mapping time. Labels are resolved with `t()` only at the point of display (template interpolation, tooltip, badge).
- `LeaveGrid.vue` gains `const { t } = useI18n()`, imports `LEAVE_TYPE_ID_MAP` alongside the existing `LEAVE_TYPE_META`/`LEAVE_STATUS_META` imports, and calls `t(LEAVE_TYPE_ID_MAP[e.type])` / `t(LEAVE_STATUS_META[e.status].labelKey)` wherever it currently interpolates `e.type` or `.label` directly. Its hardcoded weekday array (`WD_VI`) is replaced by calls to the existing `hrm.leave.history.days.{mon..sun}` keys, indexed by `Date#getDay()`. The "Thành viên" column header and "Không tìm thấy nhân viên phù hợp" empty-state string also move to new i18n keys.
- The unused demo arrays in `mocks/leave.ts` (`LEAVE_ENTRIES` etc.) get their `type: 'Nghỉ cả ngày'`-style literals swapped for the corresponding numeric ID, purely to keep them type-checking against the new `LeaveType = number` — no behavioral impact since nothing in the app currently imports them.

## Translation keys

Extend the existing `hrm.leave` namespace in all three locale files (it currently has partial `nav`/`history`/`create`/`manage` groups). New/changed groups:

- `hrm.leave.pageTitle`, `pageEyebrow`, `pageDescription` — PageHeader props (distinct from `create.title` which already exists for the form heading).
- `hrm.leave.type.{fullDay,morningOff,afternoonOff,late,early,goOut,workAtHome,businessTrip,other}` — the 9 leave-request types (i18n keys stored in `LEAVE_TYPE_ID_MAP`, not literal text).
- `hrm.leave.bonusType.*` — the leave-bonus types (i18n keys stored in `BONUS_TYPE_ID_MAP`), mirroring the existing 8 Vietnamese entries (Phép năm, Phép thâm niên, …).
- `hrm.leave.status.{pending,approved,rejected}` — replaces the local `LEAVE_STATUS_META` labels (`labelKey` values).
- `hrm.leave.tabs.{manage,create,info,history}` — the 4 tab labels shown in the page's `Tabs` component (kept distinct from the existing `nav.*` group, which has slightly different wording used elsewhere).
- `hrm.leave.manage.*` — filter labels, stat cards (`pending`/`approved`/`onLeaveThisWeek`/`totalRequests` + sublabels), week-nav ("Tuần này", "Trang {p}/{n}"), legend labels ("Nửa ngày"), empty states, the "gửi đơn trước ít nhất 1 ngày" notice.
- `hrm.leave.create.*` (extends existing) — balance card labels (Còn lại/Đã dùng/Năm trước/ngày), field labels (Loại nghỉ phép/Từ ngày/Đến ngày/Ngày/Giờ bắt đầu/Giờ kết thúc/Hình thức/Lý do/Tiêu đề email/Nội dung email), placeholders, validation messages, buttons.
- `hrm.leave.email.*` — `important`, `salaryDeduction`, `greeting`, `imUser`, `reasonSoITake` (see below).
- `hrm.leave.info.*` — filter labels, table headers, row actions, empty state.
- `hrm.leave.history.*` (extends existing) — filter labels, table headers, empty state.
- `hrm.leave.detail.*` — drawer labels (Từ ngày/Đến ngày/Số ngày/Lý do), "(nửa ngày)" suffix, action buttons.
- `hrm.leave.addModal.*` — modal title/subtitle, member-info section label, stat labels, field labels/placeholders, buttons.
- `hrm.leave.grid.*` — `LeaveGrid.vue`'s own column header and empty state.

Where an existing key already covers the concept (`common.all`, `common.from`, `common.to`, `common.cancel`), reuse it instead of duplicating.

## Auto-generated email — translated per locale

Per explicit decision: the email title/content generated by `autoEmailTitle()`/`autoEmailContent()` must change with the active locale, mirroring old ERP's `$t()`-driven `takeTitleEmail`/`takeContentEmail`.

New keys, VI/EN sourced from what was already validated this session, JA sourced from old ERP's `locales/ja.json` where an equivalent existed:

| Key | VI | EN | JA |
|---|---|---|---|
| `hrm.leave.email.important` | Quan trọng | Important | 重要 |
| `hrm.leave.email.salaryDeduction` | Trừ lương | Salary deduction | 給与控除 |
| `hrm.leave.email.greeting` | Kính gửi ban giám đốc, | Dear all, | お疲れ様です。 |
| `hrm.leave.email.imUser` | Tôi là {name}. | I'm {name}. | {name} です。 |
| `hrm.leave.email.reasonSoITake` | Tôi {reason} nên tôi xin phép {detail}. | I have {reason} so I take a {detail}. | {reason}があるので{detail}と取ると思います。 |

`{detail}` is composed in code as `【{typeName}】【{duration}】` (bracket-wrapped, not itself translated — matches old ERP exactly). `takeDurationLeave()` keeps its `YYYY/MM/DD` format regardless of locale (already confirmed correct behavior, unchanged from the current implementation).

`autoEmailTitle()`/`autoEmailContent()` call `t()` for every translatable fragment; `typeName` comes from `t(LEAVE_TYPE_ID_MAP[createTypeId.value])`.

## Locale-aware date formatting

The bonus-history table's `new Date(b.created_at).toLocaleDateString('vi-VN')` switches on `useI18n()`'s `locale.value`: `vi` → `vi-VN`, `en` → `en-US`, `ja` → `ja-JP`.

## Non-goals

- No change to API contracts, request/response shapes, or backend code.
- No change to visual design, layout, or component structure beyond replacing literal strings with `t()` calls and the key-type rework described above.
- No cleanup of the unused mock demo arrays beyond the mechanical type fix required to keep them compiling.

## Verification

- `pnpm typecheck` clean (no new errors introduced).
- Manual browser pass: switch locale via the topbar language switcher and confirm, for each of vi/en/ja:
  - All 4 tabs, filter bars, table headers, and buttons render translated text.
  - The weekly calendar grid (`LeaveGrid`) still colors entries correctly and shows translated type/status labels and weekday headers.
  - Creating a leave request regenerates the email title/content in the selected language as form fields change.
  - The bonus-history table's date column formats per-locale.
  - End-to-end submit flow (create leave request) still succeeds, matching the already-verified flow from the prior session.
