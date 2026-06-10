<template>
  <div>
    <!-- Today check-in card -->
    <div class="card mb-6">
      <h3 class="text-base font-semibold text-gray-800 mb-4">Chấm công hôm nay</h3>
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="grid grid-cols-2 gap-4 flex-1">
          <div>
            <p class="text-xs text-gray-500">Giờ vào</p>
            <p class="text-xl font-bold text-gray-900 mt-0.5">
              {{ timekeepingStore.todayRecord?.check_in_time
                  ? formatTime(timekeepingStore.todayRecord.check_in_time)
                  : '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Giờ ra</p>
            <p class="text-xl font-bold text-gray-900 mt-0.5">
              {{ timekeepingStore.todayRecord?.check_out_time
                  ? formatTime(timekeepingStore.todayRecord.check_out_time)
                  : '—' }}
            </p>
          </div>
        </div>

        <div class="flex gap-2 shrink-0">
          <AppButton
            v-if="!timekeepingStore.todayRecord?.check_in_time"
            :loading="checkingIn"
            @click="onCheckIn"
          >
            {{ $t('timekeeping.doCheckIn') }}
          </AppButton>
          <AppButton
            v-else-if="!timekeepingStore.todayRecord?.check_out_time"
            variant="secondary"
            :loading="checkingOut"
            @click="onCheckOut"
          >
            {{ $t('timekeeping.doCheckOut') }}
          </AppButton>
          <AppBadge v-else variant="green">Hoàn thành hôm nay ✓</AppBadge>
        </div>
      </div>
    </div>

    <!-- History table -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-gray-700">Lịch sử chấm công</h3>
      <div class="flex gap-2">
        <AppInput v-model="filterMonth" type="month" class="w-40" />
      </div>
    </div>

    <AppTable
      :columns="columns"
      :rows="filteredRecords"
      :loading="timekeepingStore.loading"
      :empty-text="$t('common.noData')"
    >
      <template #cell-check_in_time="{ value }">{{ value || '—' }}</template>
      <template #cell-check_out_time="{ value }">{{ value || '—' }}</template>
      <template #cell-working_hours="{ row }">
        {{ calcHours(row.check_in_time, row.check_out_time) }}
      </template>
      <template #cell-status="{ row }">
        <AppBadge :variant="row.check_in_time && row.check_out_time ? 'green' : 'yellow'">
          {{ row.check_in_time && row.check_out_time ? 'Đủ công' : 'Thiếu' }}
        </AppBadge>
      </template>

      <template #footer>
        <AppPagination
          :current-page="timekeepingStore.pagination.current_page"
          :total-row="timekeepingStore.pagination.total_row"
          :row-per-page="timekeepingStore.pagination.row_per_page"
          @change="timekeepingStore.fetchAll($event)"
        />
      </template>
    </AppTable>
  </div>
</template>

<script setup lang="ts">
import { useTimekeepingStore } from '~/stores/timekeeping'
import { useTimekeeping } from '~/composables/useTimekeeping'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'module-role'],
  meta: { module: 'timekeeping' },
})

useHead({ title: 'Chấm công — Micro ERP' })

const timekeepingStore = useTimekeepingStore()
const { doCheckIn, doCheckOut } = useTimekeeping()

const checkingIn  = ref(false)
const checkingOut = ref(false)
const filterMonth = ref(dayjs().format('YYYY-MM'))

const columns = [
  { key: 'check_in_time',  label: 'Check-in' },
  { key: 'check_out_time', label: 'Check-out' },
  { key: 'working_hours',  label: 'Số giờ' },
  { key: 'status',         label: 'Trạng thái' },
]

// Backend format: "2024/05/07 09:00 AM" → first 7 chars = "2024/05"
// filterMonth format from <input type="month">: "2024-05"
const filteredRecords = computed(() => {
  if (!filterMonth.value) return timekeepingStore.records
  return timekeepingStore.records.filter(r => {
    if (!r.check_in_time) return false
    // Convert "2024/05/07..." → "2024-05" to compare with filterMonth
    const ym = r.check_in_time.substring(0, 7).replace('/', '-')
    return ym === filterMonth.value
  })
})

// Backend format: "2024/05/07 09:00 AM"
const TK_FORMAT = 'YYYY/MM/DD hh:mm A'

function calcHours(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return '—'
  const inTime  = dayjs(checkIn,  TK_FORMAT)
  const outTime = dayjs(checkOut, TK_FORMAT)
  if (!inTime.isValid() || !outTime.isValid()) return '—'
  const diff = outTime.diff(inTime, 'minute')
  if (diff <= 0) return '—'
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return `${h}h${m > 0 ? m + 'm' : ''}`
}

async function onCheckIn() {
  checkingIn.value = true
  try { await doCheckIn() } finally { checkingIn.value = false }
}

async function onCheckOut() {
  checkingOut.value = true
  try { await doCheckOut() } finally { checkingOut.value = false }
}

onMounted(async () => {
  await Promise.all([
    timekeepingStore.fetchToday(),
    timekeepingStore.fetchAll(),
  ])
})
</script>
