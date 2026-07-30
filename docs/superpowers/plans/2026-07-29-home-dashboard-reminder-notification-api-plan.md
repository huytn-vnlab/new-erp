# Home dashboard: reminder calendar + notification center — backend follow-up plan

## Status

FE modals (`ReminderCalendarModal.vue`, `NotificationCenterModal.vue` under `app/components/home/`) are implemented and wired into `CompanyTab.vue`. **Gap 1 below is now resolved** (2026-07-29) — kept here as a record of what changed. Gaps 2 and 3 remain open follow-up work, not implemented.

## Gap 1 — Reminder calendar only covered a fixed near-term window — RESOLVED

Two changes landed together:

**1. Fixed the "upcoming reminders" advance-notice windows** in `NotiEventRemind` (`micro-erp-api/internal/domains/notification/controller.go:462`, backs `POST /notification/notification-event-remind`, used by the dashboard's "Nhắc nhở sắp tới" preview card):

| Loại | Trước | Sau |
|---|---|---|
| Sinh nhật | 30 ngày | 30 ngày (không đổi) |
| Kỷ niệm vào công ty | 4 ngày | **7 ngày** |
| Hết hạn hợp đồng | 8 ngày | **30 ngày** |

(Misleading local var names `threeDaysBefore…`/`sevenDaysBefore…` that didn't match their actual `AddDate` offsets were also renamed to match reality while touching this code.)

**2. Added a month-range endpoint** for the calendar modal, since the above is still a fixed "near now" window and can't serve arbitrary months:
- `POST /notification/get-reminder-calendar` — new `GetReminderCalendarParam{ Year, Month }` in `requestparams/notification.go`, new controller handler `GetReminderCalendar` and repo method `SelectReminderCalendarEvents` (`pgrepository.go`) querying `user_profiles` directly (joined to `users` for `organization_id`), registered in `approuter.go` next to the existing reminder route.
  - Birthdays/anniversaries: matched by `EXTRACT(MONTH FROM ...) = ?` only (recurring every year, any birth/join year matches).
  - Contract expiration: matched by `EXTRACT(YEAR FROM ...) = ? AND EXTRACT(MONTH FROM ...) = ?` (absolute one-off date).
  - Reuses the existing `BirthdayNoti`/`CompanyJoinedNoti`/`RemindNoti` response shapes and the `bithday_list`/`company_join_date_list`/`contract_remind_list` envelope keys, so the FE didn't need new types.
- FE: `app/stores/dashboard.ts` gained a separate `calendarReminders` ref + `fetchRemindersForMonth(year, month)` action (kept independent from `reminders`/`fetchReminders()`, which still feeds the dashboard preview card's fixed near-term window). `ReminderCalendarModal.vue` now reads from `calendarReminders` and calls `fetchRemindersForMonth` on open and on every month-nav click.
- Not done: year navigation in the UI (modal still pins to the current calendar year, matching the original design prototype) — the backend endpoint already accepts any `year`, so wiring up year nav later is FE-only work.

## Gap 2 — Notifications have no category column

`models/notification.go`'s `Notification` struct only has `Sender, Receiver, Content, RedirectUrl, Status, Title` — no category/type. The FE derives a category client-side from `redirect_url` prefix (`app/utils/notificationCategory.ts`), matching the **real** notification sources found by grepping `RedirectUrl:` across `internal/domains/*/pgrepository.go`: leave, overtime, asset, recruitment, timekeeping, kanbantask(project). There is no "eval" or generic "system" source today — the design prototype's 5-tab taxonomy (leave/eval/project/overtime/system) was fictional mock content, not a real backend concept.

**Decision point for later, not resolved here:**
- **(a) Keep the client-side heuristic** (current state) — zero backend risk, but can't distinguish two notification subtypes that happen to share a redirect prefix, and breaks if a domain's redirect URL scheme changes.
- **(b) Add a real `category` column** — migration on `notifications`, plus updating every `InsertNotificationWithTx`/`BulkInsertNotificationsWithTx` call site (6 domains: `leave`, `overtime`, `asset`, `recruitment`, `timekeeping`, `kanbantask`) to set it explicitly. Exact, future-proof, but a wider change with more surface area for regressions.

Recommendation: stay on (a) until there's a concrete product need (e.g. a notification type that doesn't map cleanly to a redirect prefix, or a request for server-side category filtering).

## Gap 3 — No server-side filtering / bounded page size

`NotificationCenterModal.vue` fetches `rowPerPage=100` once on open and does all tab/group filtering client-side. `pagination.total_row` is now exposed by the FE store (already implemented — see `app/stores/notification.ts`), so the modal header can show an accurate "X unread · Y total" count, but if `total_row` exceeds 100 the unread/category tabs would only reflect the fetched subset. In practice this is bounded by the backend's own read/count queries being scoped to `< 31` days old (`CountNotificationsUnRead`, `UpdateNotificationStatusRead` in `pgrepository.go`), so 100 rows should cover the realistic case — but if this proves insufficient, add either server-side `status`/`category` query params to `GetNotifications`/`SelectNotifications`, or a "load more" pattern in the modal instead of one large fetch.
