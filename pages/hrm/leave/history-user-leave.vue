<template>
  <div @click.capture="handleOutsideClick">
    <!-- Filter bar -->
    <Card class="mb-6">
      <CardContent class="pt-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <!-- Member search with autocomplete -->
          <div class="relative" ref="dropdownRef">
            <label class="text-sm font-medium block mb-1">{{ $t('hrm.leave.history.filterMember') }}</label>
            <Input
              v-model="memberNameInput"
              :placeholder="$t('hrm.leave.history.filterMemberPlaceholder')"
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
          <DatePicker v-model="dateFrom" :label="$t('common.from')" />

          <!-- Date to -->
          <DatePicker v-model="dateTo" :label="$t('common.to')" />

          <!-- Search button -->
          <Button class="w-full" @click="applyFilter">
            <Search class="h-4 w-4 mr-2" /> {{ $t('common.search') }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- "Leave management detail" shortcut -->
    <div class="mb-4">
      <Button variant="outline" size="sm" @click="$router.push('/hrm/leave/manage-leave-request')">
        {{ $t('hrm.leave.history.manageDetail') }}
      </Button>
    </div>

    <!-- Weekly calendar skeleton -->
    <div v-if="loading" class="space-y-1">
      <Skeleton class="h-12 w-full rounded-none" />
      <Skeleton v-for="i in 5" :key="i" class="h-[110px] w-full rounded-none" />
    </div>

    <!-- Weekly calendar -->
    <div v-else class="overflow-x-auto rounded-xl border border-border shadow-sm">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th class="sticky left-0 z-10 bg-[#EFEFEF] px-3 py-3 text-left font-semibold text-gray-600 min-w-[160px] border border-border">
              {{ $t('hrm.member.member') }}
            </th>
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
            <td class="sticky left-0 z-10 bg-white border border-border px-3 py-3 align-middle min-w-[160px]">
              <div class="flex items-center gap-2 max-w-[150px]">
                <img
                  :src="avatarSrc(userRow.avatar)"
                  class="w-8 h-8 rounded-full shrink-0 object-cover"
                  :alt="`${userRow.first_name} ${userRow.last_name}`"
                />
                <span class="truncate text-xs font-medium">{{ userRow.first_name }} {{ userRow.last_name }}</span>
              </div>
            </td>
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
            <td :colspan="datesOfWeek.length + 1" class="text-center py-10 text-muted-foreground text-sm border border-border">
              {{ $t('common.noData') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Week navigator + pagination -->
    <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3 bg-white border border-border rounded-lg px-4 py-2 shadow-sm">
        <button class="text-gray-400 hover:text-primary transition-colors" @click="prevWeek">
          <ChevronLeft class="h-5 w-5" />
        </button>
        <span class="text-sm font-medium">{{ rangeLabel }}</span>
        <button class="text-gray-400 hover:text-primary transition-colors" @click="nextWeek">
          <ChevronRight class="h-5 w-5" />
        </button>
      </div>

      <div class="flex flex-col items-end gap-1">
        <p class="text-sm text-muted-foreground">
          {{ $t('pagination.showing', { from: paginationFrom, to: paginationTo, total: pagination.total_row }) }}
        </p>
        <Pagination
          :total="pagination.total_row"
          :items-per-page="pagination.row_per_page"
          :page="pagination.current_page"
          :sibling-count="1"
          :show-edges="true"
          @update:page="goToPage"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious>
              <ChevronLeft class="h-4 w-4" />
              <span class="hidden sm:block">{{ $t('common.prev') }}</span>
            </PaginationPrevious>
            <template v-for="item in items" :key="item.type === 'page' ? item.page : item.index">
              <PaginationItem v-if="item.type === 'page'" :value="item.page" as-child>
                <Button
                  variant="outline"
                  size="icon-sm"
                  :class="item.isSelected ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : ''"
                >
                  {{ item.page }}
                </Button>
              </PaginationItem>
              <PaginationEllipsis v-else :index="item.index" />
            </template>
            <PaginationNext>
              <span class="hidden sm:block">{{ $t('common.next') }}</span>
              <ChevronRight class="h-4 w-4" />
            </PaginationNext>
          </PaginationContent>
        </Pagination>
      </div>
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
import DatePicker from '~/components/ui/DatePicker.vue'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationPrevious, PaginationNext, PaginationEllipsis,
} from '~/components/ui/pagination'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'module-role'],
  meta: { module: 'leave' },
})

const { t } = useI18n()
useHead({ title: computed(() => `${t('hrm.leave.history.title')} — Micro ERP`) })

const {
  loading, userLeaveList, userList, leaveRequestTypes, subtractDayOffTypes,
  pagination, memberNameInput, selectedUserId, dateFrom, dateTo,
  datesOfWeek, rangeLabel, userListSearching,
  search, prevWeek, nextWeek, selectMember, applyFilter, goToPage,
  initFromQuery, leaveCoversDay, timeOf,
} = useLeaveHistory()


const DAY_NAMES = computed(() => [
  t('hrm.leave.history.days.mon'),
  t('hrm.leave.history.days.tue'),
  t('hrm.leave.history.days.wed'),
  t('hrm.leave.history.days.thu'),
  t('hrm.leave.history.days.fri'),
  t('hrm.leave.history.days.sat'),
  t('hrm.leave.history.days.sun'),
])

// ── Pagination helpers ─────────────────────────────────────────────────────────
const paginationFrom = computed(() =>
  (pagination.value.current_page - 1) * pagination.value.row_per_page + 1
)
const paginationTo = computed(() =>
  Math.min(pagination.value.current_page * pagination.value.row_per_page, pagination.value.total_row)
)

// ── Autocomplete dropdown ──────────────────────────────────────────────────────
const isDropdownOpen  = ref(false)
const focusIndex      = ref(0)
const dropdownRef     = ref<HTMLElement | null>(null)
const dropdownListRef = ref<HTMLUListElement | null>(null)

function onMemberInput() {
  selectedUserId.value = 0
  focusIndex.value     = 0
  isDropdownOpen.value = true
}

function onSelectMember(id: string) {
  selectMember(id)
  isDropdownOpen.value = false
  focusIndex.value     = 0
}

function handleOutsideClick(e: MouseEvent) {
  if (dropdownRef.value && e.target && !dropdownRef.value.contains(e.target as Node)) {
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

// ── Leave cell helpers ─────────────────────────────────────────────────────────
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

// ── Bootstrap ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  initFromQuery()
  await search()
})
</script>
