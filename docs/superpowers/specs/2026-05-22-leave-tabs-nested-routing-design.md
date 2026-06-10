# Leave Section Tabs — Nested Routing Design

**Date:** 2026-05-22  
**Status:** Approved

## Goal

Replace the current per-page subNavItems link bar in the 4 Leave pages with a persistent `AppTabs` component that stays rendered across all 4 screens. Only the content below changes when switching tabs. URLs change on tab switch.

## Approach

Nuxt 3 nested routing: create `pages/hrm/leave.vue` as a parent that renders the tab bar + `<NuxtPage>`. The 4 existing pages in `pages/hrm/leave/` automatically become nested children.

## Files Changed

### Create: `pages/hrm/leave.vue`

- `definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'leave' } })`
- `AppTabs` component with 4 tabs driven by `useRoute().path` as modelValue
- On tab click: `useRouter().push(tab.value)`
- `<NuxtPage />` below the tab bar renders child content

Tab definitions:
```ts
[
  { value: '/hrm/leave/history-user-leave',  label: t('hrm.leave.nav.history') },
  { value: '/hrm/leave/create-leave-request', label: t('hrm.leave.nav.request') },
  { value: '/hrm/leave/manage-day-leave',     label: t('hrm.leave.nav.dayInfo') },
  { value: '/hrm/leave/bonus-leave-history',  label: t('hrm.leave.nav.bonusHistory') },
]
```

### Modify: 4 child pages

Each of the following pages:
- `pages/hrm/leave/history-user-leave.vue`
- `pages/hrm/leave/create-leave-request.vue`
- `pages/hrm/leave/manage-day-leave.vue`
- `pages/hrm/leave/bonus-leave-history.vue`

Changes per page:
1. Remove the template block rendering `subNavItems` as `NuxtLink` buttons
2. Remove `const subNavItems = computed(...)` from script
3. Keep `definePageMeta` intact on each child page

## Routing Behavior

| URL | Active Tab |
|-----|-----------|
| `/hrm/leave/history-user-leave` | Lịch sử |
| `/hrm/leave/create-leave-request` | Tạo yêu cầu |
| `/hrm/leave/manage-day-leave` | Thông tin ngày phép |
| `/hrm/leave/bonus-leave-history` | Lịch sử phép cộng |

## Constraints

- `manage-leave-request.vue` is NOT a tab (separate management screen, accessed via button inside history page)
- `leave-for-someone/[id].vue` is also NOT a tab (detail page)
