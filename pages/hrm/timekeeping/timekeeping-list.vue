<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-base font-semibold text-gray-800">Danh sách chấm công</h2>
      <AppButton size="sm" variant="secondary" @click="exportData">Xuất Excel</AppButton>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-3">
        <AppSelect
          v-model="filters.userId"
          :options="memberOptions"
          value-key="id"
          label-key="full_name"
          placeholder="Tất cả nhân viên"
          class="w-56"
        />
        <AppInput v-model="filters.month" type="month" class="w-40" />
        <AppButton size="sm" @click="loadData">Lọc</AppButton>
        <AppButton size="sm" variant="secondary" @click="resetFilters">Đặt lại</AppButton>
      </div>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="card text-center py-4">
        <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
        <p class="text-xs text-gray-500 mt-1">Tổng bản ghi</p>
      </div>
      <div class="card text-center py-4">
        <p class="text-2xl font-bold text-green-600">{{ stats.onTime }}</p>
        <p class="text-xs text-gray-500 mt-1">Đúng giờ</p>
      </div>
      <div class="card text-center py-4">
        <p class="text-2xl font-bold text-orange-500">{{ stats.late }}</p>
        <p class="text-xs text-gray-500 mt-1">Đi muộn</p>
      </div>
      <div class="card text-center py-4">
        <p class="text-2xl font-bold text-red-500">{{ stats.absent }}</p>
        <p class="text-xs text-gray-500 mt-1">Vắng mặt</p>
      </div>
    </div>

    <AppTable :columns="columns" :rows="records" :loading="loading" empty-text="Không có dữ liệu chấm công">
      <template #cell-user_name="{ row }">
        <div class="flex items-center gap-2">
          <div class="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span class="text-xs font-bold text-primary-700">{{ getInitials(row.user_name) }}</span>
          </div>
          <span class="text-sm font-medium">{{ row.user_name || '—' }}</span>
        </div>
      </template>
      <template #cell-check_in_time="{ value }">{{ value || '—' }}</template>
      <template #cell-check_out_time="{ value }">{{ value || '—' }}</template>
      <template #cell-status="{ value }">
        <span
          class="badge"
          :class="{
            'badge-success': value === 1,
            'badge-warning': value === 3,
            'badge-error':   value === 2,
          }"
        >
          {{ tkStatusLabel(value) }}
        </span>
      </template>
    </AppTable>

    <AppPagination
      v-if="pagination.total > pagination.limit"
      :current-page="pagination.page"
      :total-row="pagination.total"
      :row-per-page="pagination.limit"
      class="mt-4"
      @change="(p: number) => { pagination.page = p; loadData() }"
    />
  </div>
</template>

<script setup lang="ts">
import { useUserProfile } from '~/composables/useUserProfile'
import { getInitials } from '~/utils/format'
import { formatDate, currentYear, currentMonth } from '~/utils/date'
import type { TimekeepingRecord } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Danh sách chấm công — Micro ERP' })

const toast = useToast()
const { post } = useApi()
const { fetchMemberList } = useUserProfile()

const loading = ref(true)
const records = ref<any[]>([])
const memberOptions = ref<any[]>([])

const nowMonth = `${currentYear()}-${String(currentMonth()).padStart(2, '0')}`
const filters = reactive({ userId: '', month: nowMonth })
const pagination = reactive({ page: 1, limit: 20, total: 0 })

// status: 1=accepted, 2=rejected, 3=pending, 0=none
const stats = computed(() => ({
  total:  records.value.length,
  onTime: records.value.filter(r => r.status === 1).length,
  late:   records.value.filter(r => r.status === 3).length,
  absent: records.value.filter(r => !r.check_in_time).length,
}))

const columns = [
  { key: 'user_name',       label: 'Nhân viên' },
  { key: 'check_in_time',  label: 'Check In' },
  { key: 'check_out_time', label: 'Check Out' },
  { key: 'status',         label: 'Trạng thái' },
]

function tkStatusLabel(s: number) {
  return { 0: 'Không có', 1: 'Đã duyệt', 2: 'Từ chối', 3: 'Chờ duyệt' }[s] ?? '—'
}

function resetFilters() {
  filters.userId = ''
  filters.month  = nowMonth
  pagination.page = 1
  loadData()
}

async function exportData() {
  toast.info('Chức năng xuất Excel đang phát triển')
}

async function loadData() {
  loading.value = true
  try {
    const [y, m] = filters.month.split('-').map(Number)
    const res = await post<{ timekeepings: TimekeepingRecord[]; pagination: { total_row: number } }>('/timekeeping/get-all-timekeeping', {
      user_id:      filters.userId || undefined,
      month:        m,
      year:         y,
      current_page: pagination.page,
      row_per_page: pagination.limit,
    })
    records.value      = res.data?.timekeepings ?? []
    pagination.total   = res.data?.pagination?.total_row ?? 0
  } finally { loading.value = false }
}

onMounted(async () => {
  memberOptions.value = await fetchMemberList()
  await loadData()
})
</script>
