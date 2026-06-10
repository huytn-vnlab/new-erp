# History User Leave Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `pages/hrm/leave/history-user-leave.vue` with a fully-functional weekly calendar grid showing all users' leave history — matching the old SPA — using the new SPA's component library (shadcn-vue / reka-ui, Tailwind, dayjs, `useApi`).

**Architecture:** One page component (`history-user-leave.vue`) orchestrates filters + calendar + pagination. A composable (`useLeaveHistory.ts`) owns all API calls and state. A pure utility function handles Vietnamese diacritic search. Leave type constants live in a shared `utils/leaveTypes.ts`.

**Tech Stack:** Nuxt 3, Vue 3 Composition API (`<script setup>`), Pinia, dayjs (already installed), reka-ui Dialog (via existing `AppModal`), shadcn-vue `Input`/`Button`/`Card`, `AppPagination`, `AppSpinner`.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `utils/leaveTypes.ts` | Leave type + subtract type ID constants and colour map |
| Create | `utils/slugify.ts` | Vietnamese diacritic-insensitive string normalizer |
| Modify | `utils/index.ts` | Re-export new utils |
| Create | `composables/useLeaveHistory.ts` | API calls, state, week navigation, member search |
| **Rewrite** | `pages/hrm/leave/history-user-leave.vue` | Filter bar + weekly calendar grid + pagination + sub-nav |

---

## Task 1: Leave type constants and colour map

**Files:**
- Create: `utils/leaveTypes.ts`

- [ ] **Step 1: Create the file**

```typescript
// utils/leaveTypes.ts
// Leave request type IDs (matches backend enum)
export const FullDayOff   = 1
export const MorningOff   = 2
export const AfternoonOff = 3
export const LateForWork  = 4
export const LeaveEarly   = 5
export const GoOutside    = 6
export const WorkAtHome   = 7
export const BusinessTrip = 8
export const OtherLeave   = 9

// Subtract day-off type IDs
export const Subtract  = 1
export const ExtraWork = 2
export const Event     = 3
export const Other     = 4

/** Tailwind bg-class for each leave type cell */
export const LEAVE_TYPE_COLOR: Record<number, string> = {
  [FullDayOff]:   'bg-[#36722B] text-white',
  [MorningOff]:   'bg-[#CCB400] text-white',
  [AfternoonOff]: 'bg-[#BC6D00] text-white',
  [LateForWork]:  'bg-[#922010] text-white',
  [LeaveEarly]:   'bg-[#55196C] text-white',
  [GoOutside]:    'bg-[#0079BF] text-white',
  [WorkAtHome]:   'bg-[#c92c8a] text-white',
  [BusinessTrip]: 'bg-[#ff7373] text-white',
  [OtherLeave]:   'bg-[#7b8b95] text-white',
}

/** Special colour when LateForWork / GoOutside has a non-Subtract subtract type */
export const LEAVE_COMPENSATED_COLOR = 'bg-[#1aa39c] text-white'
```

- [ ] **Step 2: Create slugify utility**

Create `utils/slugify.ts`:

```typescript
// utils/slugify.ts
// Vietnamese diacritic-insensitive string normalizer
const DIACRITIC_MAP: Record<string, string> = {
  a: 'á|à|ã|ạ|ả|â|ấ|ầ|ẫ|ậ|ẩ|ă|ắ|ằ|ẳ|ặ|ẳ|À|Á|Ã|Â|Ấ|Ầ|Ẩ|Ậ|Ẩ|Ă|Ắ|Ằ|Ặ|Ẳ',
  d: 'đ|Đ',
  e: 'é|è|ẹ|ẻ|ê|ệ|ế|ề|ể|É|È|Ẹ|Ẻ|Ế|Ề|Ể|Ê',
  i: 'í|ì|ỉ|ị|Ì|Í|Ỉ|Ị',
  o: 'ó|ò|ô|õ|ơ|ỏ|ọ|ố|ồ|ổ|ộ|ờ|ớ|ở|ợ|Ó|Ò|Ô|Õ|Ô|Ố|Ồ|Ổ|Ộ|Ớ|Ờ|Ở|Ợ',
  u: 'ú|ù|ủ|ụ|Ú|Ù|Ụ|Ủ|ư|ừ|ứ|ử|ự|Ư|Ứ|Ừ|Ử|Ự|Ử',
  y: 'ý|ỳ|ỷ|ỵ|Ý|Ỳ|Ỵ|Ỷ',
}

export function slugify(str: string): string {
  let s = str.toLowerCase()
  for (const [latin, pattern] of Object.entries(DIACRITIC_MAP)) {
    s = s.replace(new RegExp(pattern, 'g'), latin)
  }
  return s
}
```

- [ ] **Step 3: Re-export from utils/index.ts**

Add to `utils/index.ts`:

```typescript
export * from './leaveTypes'
export { slugify } from './slugify'
```

- [ ] **Step 4: Commit**

```bash
git add utils/leaveTypes.ts utils/slugify.ts utils/index.ts
git commit -m "feat: add leave type constants and Vietnamese slugify util"
```

---

## Task 2: useLeaveHistory composable

**Files:**
- Create: `composables/useLeaveHistory.ts`

This composable owns:
- State: `userLeaveList`, `userList` (id→name map), `leaveRequestTypes` (id→name map), `subtractDayOffTypes` (id→name map), `pagination`, `loading`
- Week navigation state: `datesOfWeek` (7 Date objects for current ISO week)
- Member search: `memberNameInput`, `selectedUserId`, `userListSearching`
- Filter params synced to URL query string

- [ ] **Step 1: Create the composable**

```typescript
// composables/useLeaveHistory.ts
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import isBetween from 'dayjs/plugin/isBetween'
import { slugify } from '~/utils/slugify'

dayjs.extend(isoWeek)
dayjs.extend(isBetween)

export interface UserLeave {
  user_id:       number
  first_name:    string
  last_name:     string
  avatar:        string | null
  leave_request: LeaveRequest[]
}

export interface LeaveRequest {
  leave_request_type_id:   number
  subtract_day_off_type_id: number
  date_time_leave_from:    string
  date_time_leave_to:      string
}

export interface LeaveHistoryPagination {
  current_page: number
  total_row:    number
  row_per_page: number
}

export function useLeaveHistory() {
  const { post } = useApi()
  const route  = useRoute()
  const router = useRouter()

  // ── State ──────────────────────────────────────────────────────────────────
  const loading           = ref(false)
  const userLeaveList     = ref<UserLeave[]>([])
  const userList          = ref<Map<string, string>>(new Map())
  const leaveRequestTypes = ref<Map<string, string>>(new Map())
  const subtractDayOffTypes = ref<Map<string, string>>(new Map())
  const pagination        = ref<LeaveHistoryPagination>({ current_page: 1, total_row: 0, row_per_page: 10 })

  // Filter fields
  const memberNameInput  = ref('')
  const selectedUserId   = ref(0)
  const dateFrom         = ref<string>('')   // YYYY-MM-DD
  const dateTo           = ref<string>('')   // YYYY-MM-DD
  const currentPage      = ref(1)

  // Week navigation
  const weekOffset       = ref(0)   // +/- weeks from the anchor date
  const anchorDate       = ref<dayjs.Dayjs>(dayjs())  // base date (from dateFrom or today)
  const datesOfWeek      = computed<dayjs.Dayjs[]>(() => {
    const monday = anchorDate.value.add(weekOffset.value, 'week').isoWeekday(1)
    return Array.from({ length: 7 }, (_, i) => monday.add(i, 'day'))
  })

  // Member autocomplete
  const userListSearching = computed<string[]>(() => {
    const q = memberNameInput.value
    const result: string[] = []
    userList.value.forEach((name, id) => {
      if (!q || slugify(name).includes(slugify(q))) result.push(id)
    })
    return result
  })

  // ── API ────────────────────────────────────────────────────────────────────
  async function search() {
    loading.value = true
    try {
      const dateOfWeek = datesOfWeek.value.map(d => d.format('YYYY-MM-DD'))
      const res = await post<{
        user_leave:          UserLeave[]
        user_list:           Record<string, string>
        leave_request_types: Record<string, string>
        subtract_day_off_types: Record<string, string>
        pagination:          LeaveHistoryPagination
      }>('/leave/get-leave-history', {
        id:                      0,
        user_id:                 selectedUserId.value,
        user_name:               memberNameInput.value,
        datetime_leave_from:     dateFrom.value,
        datetime_leave_to:       dateTo.value,
        subtract_day_off_type_id: 0,
        date_of_week:            dateOfWeek,
        current_page:            currentPage.value,
      })

      const data = res.data
      userLeaveList.value       = data?.user_leave           ?? []
      userList.value            = new Map(Object.entries(data?.user_list            ?? {}))
      leaveRequestTypes.value   = new Map(Object.entries(data?.leave_request_types  ?? {}))
      subtractDayOffTypes.value = new Map(Object.entries(data?.subtract_day_off_types ?? {}))
      pagination.value          = data?.pagination           ?? pagination.value
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // ── Week navigation ────────────────────────────────────────────────────────
  function prevWeek() {
    weekOffset.value -= 1
    search()
  }

  function nextWeek() {
    weekOffset.value += 1
    search()
  }

  const rangeLabel = computed(() => {
    const first = datesOfWeek.value[0]
    const last  = datesOfWeek.value[6]
    return `${first.format('YYYY/MM/DD')} - ${last.format('YYYY/MM/DD')}`
  })

  // ── Member selection ───────────────────────────────────────────────────────
  function selectMember(id: string) {
    selectedUserId.value  = parseInt(id)
    memberNameInput.value = userList.value.get(id) ?? ''
  }

  function clearMember() {
    selectedUserId.value  = 0
    memberNameInput.value = ''
  }

  // ── Date helpers ───────────────────────────────────────────────────────────
  /** Returns true if a leave request overlaps the given day */
  function leaveCoversDay(leave: LeaveRequest, day: dayjs.Dayjs): boolean {
    const from = dayjs(leave.date_time_leave_from.split(' ')[0], 'YYYY/MM/DD')
    const to   = dayjs(leave.date_time_leave_to.split(' ')[0],   'YYYY/MM/DD')
    return day.isBetween(from, to, 'day', '[]')
  }

  /** Format HH:mm from a datetime string */
  function timeOf(dt: string): string {
    const parts = dt.split(' ')
    return parts[1] ? parts[1].slice(0, 5) : ''
  }

  // ── Apply filter ───────────────────────────────────────────────────────────
  function applyFilter() {
    weekOffset.value = 0
    if (dateFrom.value) {
      anchorDate.value = dayjs(dateFrom.value)
    } else {
      anchorDate.value = dayjs()
    }
    currentPage.value = 1
    search()
    syncUrl()
  }

  function syncUrl() {
    const q: Record<string, string> = { current_page: String(currentPage.value) }
    if (memberNameInput.value) q.user_name = memberNameInput.value
    if (selectedUserId.value)  q.user_id   = String(selectedUserId.value)
    if (dateFrom.value)        q.date_from = dateFrom.value
    if (dateTo.value)          q.date_to   = dateTo.value
    router.replace({ query: q })
  }

  function goToPage(page: number) {
    currentPage.value = page
    search()
  }

  // ── Bootstrap from URL query ───────────────────────────────────────────────
  function initFromQuery() {
    const q = route.query
    memberNameInput.value = q.user_name ? String(q.user_name) : ''
    selectedUserId.value  = q.user_id   ? parseInt(String(q.user_id)) : 0
    dateFrom.value        = q.date_from ? String(q.date_from) : ''
    dateTo.value          = q.date_to   ? String(q.date_to)   : ''
    currentPage.value     = q.current_page ? parseInt(String(q.current_page)) : 1
    if (dateFrom.value) anchorDate.value = dayjs(dateFrom.value)
  }

  return {
    // state
    loading, userLeaveList, userList, leaveRequestTypes, subtractDayOffTypes,
    pagination, memberNameInput, selectedUserId, dateFrom, dateTo, currentPage,
    datesOfWeek, rangeLabel, userListSearching,
    // actions
    search, prevWeek, nextWeek, selectMember, clearMember,
    leaveCoversDay, timeOf, applyFilter, goToPage, initFromQuery,
  }
}
```

- [ ] **Step 2: Verify dayjs isoWeek plugin is available**

```bash
grep "isoWeek" /c/Working/erp/micro-erp-spa-v3/node_modules/dayjs/plugin/isoWeek.js | head -1
```

Expected output: a non-empty line containing `isoWeek`. If missing, run:
```bash
# dayjs ships isoWeek plugin out-of-the-box — no extra install needed
```

- [ ] **Step 3: Commit**

```bash
git add composables/useLeaveHistory.ts
git commit -m "feat: add useLeaveHistory composable with week navigation and member search"
```

---

## Task 3: Rewrite the page

**Files:**
- Rewrite: `pages/hrm/leave/history-user-leave.vue`

The page has four visual areas:
1. **Sub-navigation tabs** (Manage leave | Request leave | Day off info | Bonus leave history) — `NuxtLink` buttons with active state
2. **Filter bar** — member search with autocomplete dropdown, date-from, date-to, Search button
3. **Weekly calendar grid** — sticky first column (user avatar + name), 7 date columns, leave type chips per cell
4. **Week navigator + pagination** — prev/next week arrows with range label, page controls

- [ ] **Step 1: Write the page component**

```vue
<template>
  <div @click.capture="handleOutsideClick">
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

    <!-- Filter bar -->
    <Card class="mb-6">
      <CardContent class="pt-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <!-- Member search with autocomplete -->
          <div class="relative" ref="dropdownRef">
            <label class="form-label">Tìm thành viên</label>
            <AppInput
              v-model="memberNameInput"
              placeholder="Tìm kiếm..."
              @focus="isDropdownOpen = true"
              @input="onMemberInput"
              @keydown="onKeydown"
            />
            <ul
              v-if="isDropdownOpen && userListSearching.length"
              ref="dropdownListRef"
              class="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-border bg-white shadow-lg"
            >
              <li
                v-for="(id, idx) in userListSearching"
                :key="id"
                class="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                :class="{ 'bg-primary/10': idx === focusIndex - 1 }"
                @click.stop="onSelectMember(id)"
              >
                {{ userList.get(id) }}
              </li>
            </ul>
          </div>

          <!-- Date from -->
          <div>
            <label class="form-label">Từ ngày</label>
            <AppInput v-model="dateFrom" type="date" />
          </div>

          <!-- Date to -->
          <div>
            <label class="form-label">Đến ngày</label>
            <AppInput v-model="dateTo" type="date" />
          </div>

          <!-- Search button -->
          <div>
            <AppButton class="w-full" @click="applyFilter">
              <Search class="h-4 w-4 mr-2" /> Tìm kiếm
            </AppButton>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- "Leave management detail" shortcut -->
    <div class="mb-4">
      <AppButton variant="secondary" size="sm" @click="$router.push('/hrm/leave/manage-leave-request')">
        Quản lý chi tiết nghỉ phép
      </AppButton>
    </div>

    <!-- Weekly calendar -->
    <div v-if="loading" class="flex justify-center py-12">
      <AppSpinner />
    </div>
    <div v-else class="overflow-x-auto rounded-xl border border-border shadow-sm">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <!-- Sticky user column header -->
            <th class="sticky left-0 z-10 bg-[#EFEFEF] px-3 py-3 text-left font-semibold text-gray-600 min-w-[160px] border border-border">
              Thành viên
            </th>
            <!-- Day headers -->
            <th
              v-for="day in datesOfWeek"
              :key="day.valueOf()"
              class="px-3 py-3 text-center font-semibold min-w-[200px] border border-border"
              :class="isWeekend(day.toDate()) ? 'bg-[#C4C4C4] text-white' : 'bg-[#EFEFEF] text-gray-500'"
            >
              <div>{{ DAY_NAMES[day.isoWeekday() - 1] }}</div>
              <div class="text-xs font-normal">{{ day.format('YYYY/MM/DD') }}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="userRow in userLeaveList" :key="userRow.user_id">
            <!-- Sticky name column -->
            <td class="sticky left-0 z-10 bg-white border border-border px-3 py-3 align-middle min-w-[160px]">
              <div class="flex items-center gap-2 max-w-[150px]">
                <img
                  :src="avatarSrc(userRow.avatar)"
                  class="w-8 h-8 rounded-full shrink-0 object-cover"
                  alt=""
                />
                <span class="truncate text-xs font-medium">{{ userRow.first_name }} {{ userRow.last_name }}</span>
              </div>
            </td>
            <!-- Day cells -->
            <td
              v-for="day in datesOfWeek"
              :key="day.valueOf()"
              class="border border-border px-2 py-2 align-top h-[110px] min-w-[200px]"
            >
              <template v-for="leave in userRow.leave_request" :key="`${leave.leave_request_type_id}-${leave.date_time_leave_from}`">
                <div
                  v-if="leaveCoversDay(leave, day)"
                  :class="['rounded px-1.5 py-1 text-xs mb-1 leading-snug', leaveCellClass(leave)]"
                >
                  <span class="font-semibold">{{ leaveTypeName(leave.leave_request_type_id) }}</span>
                  <span v-if="leave.subtract_day_off_type_id !== Subtract && subtractDayOffTypes.get(String(leave.subtract_day_off_type_id))">
                    {{ ' (' + subtractDayOffTypes.get(String(leave.subtract_day_off_type_id)) + ')' }}
                  </span>
                  <span v-if="hasTimeRange(leave)">
                    {{ ' ' + timeOf(leave.date_time_leave_from) + '-' + timeOf(leave.date_time_leave_to) }}
                  </span>
                </div>
              </template>
            </td>
          </tr>
          <tr v-if="!userLeaveList.length">
            <td :colspan="8" class="text-center py-10 text-muted-foreground text-sm border border-border">
              Không có dữ liệu
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Week navigator + pagination -->
    <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Week navigator -->
      <div class="flex items-center gap-3 bg-white border border-border rounded-lg px-4 py-2 shadow-sm">
        <button class="text-xl text-gray-400 hover:text-primary transition-colors" @click="prevWeek">
          <ChevronLeft class="h-5 w-5" />
        </button>
        <span class="text-sm font-medium">{{ rangeLabel }}</span>
        <button class="text-xl text-gray-400 hover:text-primary transition-colors" @click="nextWeek">
          <ChevronRight class="h-5 w-5" />
        </button>
      </div>

      <!-- Pagination -->
      <AppPagination
        :current-page="pagination.current_page"
        :total-row="pagination.total_row"
        :row-per-page="pagination.row_per_page"
        @change="goToPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { isWeekend } from '~/utils/date'
import {
  Subtract, LateForWork, LeaveEarly, GoOutside,
  LEAVE_TYPE_COLOR, LEAVE_COMPENSATED_COLOR,
} from '~/utils/leaveTypes'
import { useLeaveHistory } from '~/composables/useLeaveHistory'
import type { LeaveRequest } from '~/composables/useLeaveHistory'
import Card from '~/components/ui/Card.vue'
import CardContent from '~/components/ui/CardContent.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppSpinner from '~/components/ui/AppSpinner.vue'
import AppPagination from '~/components/ui/AppPagination.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'module-role'],
  meta: { module: 'leave' },
})

useHead({ title: 'Lịch sử nghỉ phép — Micro ERP' })

const {
  loading, userLeaveList, userList, leaveRequestTypes, subtractDayOffTypes,
  pagination, memberNameInput, selectedUserId, dateFrom, dateTo,
  datesOfWeek, rangeLabel, userListSearching,
  search, prevWeek, nextWeek, selectMember, applyFilter, goToPage,
  initFromQuery, leaveCoversDay, timeOf,
} = useLeaveHistory()

// ── Sub-nav ───────────────────────────────────────────────────────────────────
const subNavItems = [
  { label: 'Quản lý nghỉ phép',         to: '/hrm/leave/history-user-leave' },
  { label: 'Yêu cầu nghỉ phép',         to: '/hrm/leave/create-leave-request' },
  { label: 'Thông tin ngày phép',        to: '/hrm/leave/manage-day-leave' },
  { label: 'Lịch sử nghỉ phép thêm',    to: '/hrm/leave/bonus-leave-history' },
]

// ── Days of week label ────────────────────────────────────────────────────────
const DAY_NAMES = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']

// ── Autocomplete dropdown ─────────────────────────────────────────────────────
const isDropdownOpen = ref(false)
const focusIndex     = ref(0)
const dropdownRef    = ref<HTMLElement | null>(null)
const dropdownListRef = ref<HTMLUListElement | null>(null)

function onMemberInput() {
  selectedUserId.value = 0
  focusIndex.value = 0
  isDropdownOpen.value = true
}

function onSelectMember(id: string) {
  selectMember(id)
  isDropdownOpen.value = false
  focusIndex.value = 0
}

function handleOutsideClick(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  const total = userListSearching.value.length
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (focusIndex.value < total) focusIndex.value++
    scrollDropdown()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (focusIndex.value > 0) focusIndex.value--
    scrollDropdown()
  } else if (e.key === 'Enter') {
    const id = userListSearching.value[focusIndex.value - 1]
    if (id) onSelectMember(id)
  }
}

function scrollDropdown() {
  if (!dropdownListRef.value) return
  const li = dropdownListRef.value.children[focusIndex.value - 1] as HTMLElement | undefined
  li?.scrollIntoView({ block: 'nearest' })
}

// ── Leave cell helpers ────────────────────────────────────────────────────────
const defaultAvatar = '/images/default_avatar.jpg'

function avatarSrc(imgStr: string | null): string {
  return imgStr ? `data:image/png;base64,${imgStr}` : defaultAvatar
}

function leaveTypeName(typeId: number): string {
  return leaveRequestTypes.value.get(String(typeId)) ?? String(typeId)
}

function leaveCellClass(leave: LeaveRequest): string {
  const isCompensated =
    (leave.leave_request_type_id === LateForWork || leave.leave_request_type_id === GoOutside) &&
    leave.subtract_day_off_type_id > 0 &&
    leave.subtract_day_off_type_id !== Subtract
  return isCompensated
    ? LEAVE_COMPENSATED_COLOR
    : (LEAVE_TYPE_COLOR[leave.leave_request_type_id] ?? 'bg-gray-400 text-white')
}

function hasTimeRange(leave: LeaveRequest): boolean {
  return [LateForWork, LeaveEarly, GoOutside].includes(leave.leave_request_type_id)
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  initFromQuery()
  await search()
})
</script>
```

- [ ] **Step 2: Verify `isWeekend` is exported from utils/date.ts**

```bash
grep "isWeekend" /c/Working/erp/micro-erp-spa-v3/utils/date.ts
```

Expected: `export const isWeekend = ...`

If not present, add to `utils/date.ts`:

```typescript
export const isWeekend = (d: Date): boolean => {
  const day = d.getDay()
  return day === 0 || day === 6
}
```

- [ ] **Step 3: Verify default avatar asset path**

```bash
ls /c/Working/erp/micro-erp-spa-v3/public/images/default_avatar.jpg 2>/dev/null || echo "MISSING"
```

If missing, copy from old SPA:

```bash
mkdir -p /c/Working/erp/micro-erp-spa-v3/public/images
cp /c/Working/erp/micro-erp-spa/assets/images/default_avatar.jpg /c/Working/erp/micro-erp-spa-v3/public/images/default_avatar.jpg
```

- [ ] **Step 4: Commit**

```bash
git add pages/hrm/leave/history-user-leave.vue
git commit -m "feat: migrate history-user-leave page to new SPA with weekly calendar grid"
```

---

## Task 4: Wire up dayjs isoWeek plugin globally (if not already done)

**Files:**
- Modify: `plugins/dayjs.ts` (create if absent)
- Modify: `nuxt.config.ts` (add plugin if created)

- [ ] **Step 1: Check if dayjs isoWeek is already extended globally**

```bash
grep -rn "isoWeek" /c/Working/erp/micro-erp-spa-v3/plugins/ 2>/dev/null || echo "not found"
```

- [ ] **Step 2: If not found, create the plugin**

Create `plugins/dayjs.ts`:

```typescript
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isoWeek)
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export default defineNuxtPlugin(() => {})
```

Note: `date.ts` already extends isBetween/isSameOrBefore/isSameOrAfter on import, so extending again in the composable is a no-op (dayjs handles duplicate extends safely). The plugin ensures consistent isoWeek support across SSR + client.

- [ ] **Step 3: Verify nuxt.config.ts doesn't need manual plugin registration**

Nuxt 3 auto-imports files in `plugins/` — no manual addition to `nuxt.config.ts` needed.

- [ ] **Step 4: Commit (only if plugin was created)**

```bash
git add plugins/dayjs.ts
git commit -m "chore: register dayjs isoWeek plugin globally"
```

---

## Task 5: Smoke test

- [ ] **Step 1: Start dev server**

```bash
cd /c/Working/erp/micro-erp-spa-v3
npm run dev
```

Expected: server starts without TypeScript errors.

- [ ] **Step 2: Navigate to the page and verify**

Open `http://localhost:3000/hrm/leave/history-user-leave` in browser.

Checklist:
- [ ] Sub-nav renders 4 buttons; "Quản lý nghỉ phép" is active (highlighted)
- [ ] Filter bar shows: member search input, date-from, date-to, Search button
- [ ] Calendar renders 7 day columns (Mon–Sun) with correct weekend shading (grey)
- [ ] Current week's dates appear in headers
- [ ] Leave chips render with correct colour classes inside cells
- [ ] Clicking a row in the member dropdown selects the user and closes dropdown
- [ ] Prev/next week arrows shift the week and re-fetch
- [ ] Pagination controls appear when `total_row > row_per_page`
- [ ] URL query string updates on search (`?user_name=...&date_from=...`)
- [ ] Refreshing the page with query params pre-fills the filter correctly

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete history-user-leave migration — weekly calendar, filters, pagination"
```
