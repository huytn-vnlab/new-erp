# HRM Module Migration Strategy
**Date:** 2026-05-20
**Scope:** Full HRM module (5 sub-modules, 22 screens) — old SPA (Nuxt 2 + Bootstrap Vue) → new SPA (Nuxt 3 + shadcn-vue)
**Approach:** Pattern-First, Then Parallel Execution

---

## Context

The old SPA (`micro-erp-spa`, Nuxt 2 + Bootstrap Vue + Vuex) and new SPA (`micro-erp-spa-v3`, Nuxt 3 + shadcn-vue + Pinia) share the same HRM module structure. All 5 sub-modules in v3 currently use legacy `App*` components (AppInput, AppTable, AppModal, AppPagination, etc.). This strategy covers migrating all 22 screens to shadcn-vue with full feature parity, Playwright test coverage, and a complete i18n audit.

An existing migration plan for Member screens exists at `/docs/superpowers/plans/2026-05-15-hrm-member-migration.md` and is superseded by this strategy.

---

## Core Decisions

| Decision | Choice |
|---|---|
| Component strategy | shadcn-vue primitives directly in pages — no intermediate wrapper components |
| Execution model | Parallel across modules (Phase 2), blocked by Pattern Establishment (Phase 1) |
| Definition of done | Full UI parity + validation + API + permissions + Playwright tests + i18n audit |
| i18n coverage | vi: 100% required; en/ja: 100% required or flagged `// TODO: translate` |
| Logic/API changes | None unless a bug is discovered during migration |

---

## Two-Phase Migration

### Phase 1 — Pattern Establishment (blocking)

Complete 3 reference screens end-to-end before any parallel work begins. These screens are the canonical templates every developer copies from.

| Reference Screen | Type | Path |
|---|---|---|
| `history-user-leave` | List | `/pages/hrm/leave/history-user-leave.vue` |
| `create-leave-request` | Create Form | `/pages/hrm/leave/create-leave-request.vue` |
| `manage-leave-request` | Admin-Manage | `/pages/hrm/leave/manage-leave-request.vue` |

Leave module is chosen as anchor because it has the richest variety of screen types and is the most commonly used module.

Each reference screen must satisfy the full Definition of Done before Phase 2 begins.

### Phase 2 — Parallel Execution (non-blocking)

All 5 modules execute simultaneously after Phase 1. Recommended developer assignment:

```
Dev A → Member      (5 screens)
Dev B → Leave       (3 remaining screens: manage-day-leave, bonus-leave-history, leave-for-someone/[id])
Dev C → Asset       (5 screens)
Dev D → Contract    (4 screens)
Dev E → Timekeeping (2 screens — high complexity, assign experienced developer)
```

New patterns not covered by the 3 reference screens must be documented in this file before being used elsewhere.

---

## Screen Type Taxonomy

All 22 screens map to 5 types. Each type has a defined component structure.

### List
**Structure:** `Card > CardHeader (title + action button) > CardContent (filters row + Table + Pagination)`

**Screens:** profile-list, asset-list, manage-contract, user-timekeeping, bonus-leave-history, user-log, history-user-leave

### Create Form
**Structure:** `Card > CardHeader > CardContent (Form > FormField per input) > CardFooter (Cancel + Submit Button)`

**Screens:** create-leave-request, create-asset, add-contract, leave-for-someone/[id]

### Edit Form
**Structure:** Same as Create Form but with pre-populated fields from API fetch on mount.

**Screens:** edit-profile/[id], edit-asset/[id], edit-account

### Admin-Manage
**Structure:** `Tabs > TabsList > TabsTrigger (per status) > TabsContent (List pattern per tab)`

**Screens:** manage-leave-request, manage-asset-request, manage-request, manage-day-leave, manage-contract-type, timekeeping-list

> Note: `timekeeping-list` is a special Admin-Manage variant — actions (edit + approve) are inline per row rather than tab-grouped. The `manage-leave-request` reference covers the tab pattern; `timekeeping-list` will need its own per-row action pattern documented when Dev E begins that screen.

### Detail View
**Structure:** `Card > CardHeader (Avatar + name + Badge) > CardContent (Separator-divided sections, read-only)`

**Screens:** view-profile/[id], view-user/[id]

---

## Per-Module Breakdown

### Member (5 screens)

| Screen | Type | Complexity | Notes |
|---|---|---|---|
| profile-list | List | Medium | Grid layout, avatar, branch/position filters |
| view-profile/[id] | Detail View | Low | |
| edit-profile/[id] | Edit Form | Medium | Skill toggles, branch Select, avatar upload |
| manage-request | Admin-Manage | Medium | Tabs by status, role-gated actions |
| edit-account | Edit Form | Low | Password change only |

### Leave (6 screens)

| Screen | Type | Phase | Complexity | Notes |
|---|---|---|---|---|
| history-user-leave | List | **Phase 1** | Medium | Reference implementation |
| create-leave-request | Create Form | **Phase 1** | Medium | Reference implementation |
| manage-leave-request | Admin-Manage | **Phase 1** | High | Reference implementation |
| manage-day-leave | Admin-Manage | Phase 2 | Medium | |
| bonus-leave-history | List | Phase 2 | Low | |
| leave-for-someone/[id] | Create Form | Phase 2 | Low | |

### Asset (5 screens)

| Screen | Type | Complexity | Notes |
|---|---|---|---|
| asset-list | List | Medium | |
| create-asset | Create Form | Low | |
| edit-asset/[id] | Edit Form | Low | |
| manage-asset-request | Admin-Manage | Medium | |
| user-log | List | Low | |

### Contract (4 screens)

| Screen | Type | Complexity | Notes |
|---|---|---|---|
| manage-contract | List | Medium | Multi-column, salary display |
| add-contract | Create Form | Medium | Contract type Select, date range |
| manage-contract-type | Admin-Manage | Low | Simple CRUD |
| view-user/[id] | Detail View | Low | |

### Timekeeping (2 screens)

| Screen | Type | Complexity | Notes |
|---|---|---|---|
| timekeeping-list | Admin-Manage | High | Edit + approve per row, date range filter |
| user-timekeeping | List | Medium | |

---

## Definition of Done

Every screen must satisfy all items before it is considered complete.

### UI Parity
- [ ] Side-by-side visual comparison with old SPA — no missing fields, columns, buttons, filters, or modals
- [ ] All legacy `App*` components replaced with shadcn-vue primitives
- [ ] Layout matches screen type pattern (List / Create Form / Edit Form / Admin-Manage / Detail View)
- [ ] Loading states: `Skeleton` components shown while data is fetching
- [ ] Empty states: shown when table/list has no data
- [ ] Error states: shown when API call fails
- [ ] Responsive behavior preserved

### Validation & Logic
- [ ] All form fields have vee-validate + zod schema matching old SPA validation rules
- [ ] Permission-gated UI elements (admin-only buttons, role-restricted tabs) behave identically
- [ ] Form submission flow (loading → success toast → redirect/reset) matches old SPA
- [ ] Modal/dialog open-close flow matches old SPA

### API & State
- [ ] All API calls preserved — same endpoints, same request shapes, same response handling
- [ ] Pagination works correctly (`current_page`, `total_row`, `row_per_page` from backend)
- [ ] Store state updates correctly after mutations (create/edit/delete)

### i18n
- [ ] All visible text uses `$t()` — no hardcoded strings
- [ ] `vi` locale: all keys present and accurate
- [ ] `en` locale: all keys present (translated or flagged `// TODO: translate`)
- [ ] `ja` locale: all keys present (translated or flagged `// TODO: translate`)

### Playwright Tests
- [ ] Page loads successfully and displays data
- [ ] Primary user action works (submit form / approve request / filter table)
- [ ] Error state is shown on API failure (mocked 500 response via `route()`)
- [ ] Permission-gated elements are hidden for non-admin users
- [ ] Pagination navigates correctly

---

## i18n Strategy

### Key naming convention
```
hrm.<module>.<screen>.<element>
```

Examples:
```
hrm.leave.history.title
hrm.leave.history.filters.status
hrm.asset.list.columns.assignedTo
hrm.contract.add.fields.startDate
hrm.timekeeping.list.actions.approve
```

### Audit process per screen
1. Grep old SPA screen for all visible text strings
2. Cross-check against `/locales/vi.json`, `en.json`, `ja.json`
3. Add missing keys under the appropriate HRM namespace
4. Replace any hardcoded strings in the new SPA page with `$t('...')`

### Coverage requirement
- `vi`: 100% complete — no missing keys, no TODOs
- `en` and `ja`: 100% present, but gaps acceptable with `// TODO: translate` comment on the line

---

## Playwright Testing Strategy

### File structure
```
/tests/hrm/
  leave/
    history-user-leave.spec.ts
    create-leave-request.spec.ts
    manage-leave-request.spec.ts
    manage-day-leave.spec.ts
    bonus-leave-history.spec.ts
    leave-for-someone.spec.ts
  member/
    profile-list.spec.ts
    view-profile.spec.ts
    edit-profile.spec.ts
    manage-request.spec.ts
    edit-account.spec.ts
  asset/
    asset-list.spec.ts
    create-asset.spec.ts
    edit-asset.spec.ts
    manage-asset-request.spec.ts
    user-log.spec.ts
  contract/
    manage-contract.spec.ts
    add-contract.spec.ts
    manage-contract-type.spec.ts
    view-user.spec.ts
  timekeeping/
    timekeeping-list.spec.ts
    user-timekeeping.spec.ts
```

### Test structure per screen
```typescript
test.describe('<Screen Name>', () => {
  test('loads and displays data', ...)
  test('primary user action works', ...)       // submit / approve / filter
  test('shows error state on API failure', ...) // mock 500 via route()
  test('admin sees restricted actions', ...)
  test('non-admin does not see restricted actions', ...)
  test('pagination navigates correctly', ...)   // if screen has pagination
})
```

### Auth strategy
- Two pre-authenticated sessions stored in `playwright/.auth/`:
  - `admin.json` — admin user session
  - `user.json` — regular user session
- No login flow repeated per test
- Each test file specifies which session to use via `storageState`

### API mocking scope
- **Happy-path tests**: hit real dev server at `localhost:3000`
- **Error state tests only**: use Playwright `route()` to mock API responses (e.g., return 500)

---

## Developer Workflow Per Screen

1. **Read the old SPA screen** — understand layout, logic, API calls
2. **Check the reference implementation** for the matching screen type
3. **Migrate the template** — replace `App*` components with shadcn-vue primitives following the type pattern
4. **Audit i18n** — add missing keys to all 3 locale files
5. **Side-by-side comparison** — open old SPA and new SPA side by side, verify visual parity
6. **Write Playwright tests** — follow the standard test structure above
7. **Submit for review** — reviewer checks Definition of Done checklist

---

## Out of Scope

- Changes to stores, composables, or API endpoints (unless a bug is found)
- New features not present in the old SPA
- Intermediate wrapper components or HRM-specific shared component libraries
- Performance optimization beyond what shadcn-vue provides by default
