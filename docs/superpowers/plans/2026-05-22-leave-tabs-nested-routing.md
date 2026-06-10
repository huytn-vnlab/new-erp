# Leave Tabs — Nested Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the link-based sub-nav in the Leave section with a persistent `AppTabs` component using Nuxt 3 nested routing, so the tab bar stays rendered while only the content below changes.

**Architecture:** Create `pages/hrm/leave.vue` as a parent route that renders `AppTabs` + `<NuxtPage>`. The 4 existing files in `pages/hrm/leave/` automatically become nested children. Active tab is derived from `useRoute().path`.

**Tech Stack:** Nuxt 3, Vue 3 Composition API, `AppTabs` component (`~/components/ui/AppTabs.vue`), `useI18n`

---

## File Map

| Action | File |
|--------|------|
| **Create** | `pages/hrm/leave.vue` |
| **Modify** | `pages/hrm/leave/history-user-leave.vue` — remove subNavItems template block + computed |

> `create-leave-request.vue`, `manage-day-leave.vue`, `bonus-leave-history.vue` do **not** have subNavItems and require no changes.

---

### Task 1: Create parent page `pages/hrm/leave.vue`

**Files:**
- Create: `pages/hrm/leave.vue`

- [ ] **Step 1: Create the file with the following content**

```vue
<template>
  <div>
    <AppTabs
      :tabs="tabs"
      :model-value="route.path"
      class="mb-6"
      @update:model-value="router.push($event)"
    />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import AppTabs from '~/components/ui/AppTabs.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'module-role'],
  meta: { module: 'leave' },
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const tabs = computed(() => [
  { value: '/hrm/leave/history-user-leave',   label: t('hrm.leave.nav.history') },
  { value: '/hrm/leave/create-leave-request', label: t('hrm.leave.nav.request') },
  { value: '/hrm/leave/manage-day-leave',     label: t('hrm.leave.nav.dayInfo') },
  { value: '/hrm/leave/bonus-leave-history',  label: t('hrm.leave.nav.bonusHistory') },
])
</script>
```

- [ ] **Step 2: Verify file exists**

Run in terminal:
```
ls micro-erp-spa-v3/pages/hrm/leave.vue
```
Expected: file listed.

---

### Task 2: Remove subNavItems from `history-user-leave.vue`

**Files:**
- Modify: `pages/hrm/leave/history-user-leave.vue`

- [ ] **Step 1: Remove the template sub-nav block (lines 3–14)**

In `history-user-leave.vue`, delete this block from the template:

```html
    <!-- Sub-nav -->
    <div class="flex gap-2 mb-6 flex-wrap">
      <NuxtLink
        v-for="nav in subNavItems"
        :key="nav.to"
        :to="nav.to"
        class="px-4 py-2 rounded-md text-sm font-medium border transition-colors"
        :class="$route.path === nav.to
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-gray-600 border-border hover:bg-muted'"
      >{{ nav.label }}</NuxtLink>
    </div>
```

- [ ] **Step 2: Remove the subNavItems computed from the script (lines 229–235)**

Delete this block:

```ts
// ── Sub-nav ────────────────────────────────────────────────────────────────────
const subNavItems = computed(() => [
  { label: t('hrm.leave.nav.history'),      to: '/hrm/leave/history-user-leave' },
  { label: t('hrm.leave.nav.request'),      to: '/hrm/leave/create-leave-request' },
  { label: t('hrm.leave.nav.dayInfo'),      to: '/hrm/leave/manage-day-leave' },
  { label: t('hrm.leave.nav.bonusHistory'), to: '/hrm/leave/bonus-leave-history' },
])
```

---

### Task 3: Manual verification

- [ ] **Step 1: Start the dev server**

```
cd micro-erp-spa-v3 && npm run dev
```

- [ ] **Step 2: Navigate to each tab and verify**

Open `http://localhost:3000/hrm/leave/history-user-leave`  
Expected:
- Tab bar shows 4 tabs, "Lịch sử" is active
- Content below is the weekly calendar + filters
- No duplicate sub-nav buttons

Click "Tạo yêu cầu" tab → URL changes to `/hrm/leave/create-leave-request`  
Expected:
- Tab bar stays rendered, "Tạo yêu cầu" is active
- Content below is the leave request form

Click "Thông tin ngày phép" tab → URL changes to `/hrm/leave/manage-day-leave`  
Expected:
- Tab bar stays, "Thông tin ngày phép" is active

Click "Lịch sử phép cộng" tab → URL changes to `/hrm/leave/bonus-leave-history`  
Expected:
- Tab bar stays, "Lịch sử phép cộng" is active

- [ ] **Step 3: Verify direct URL load**

Refresh browser on `/hrm/leave/create-leave-request`  
Expected: tabs render correctly with correct active tab — not a blank page.
