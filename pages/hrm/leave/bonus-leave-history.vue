<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-base font-semibold text-gray-800">Lịch sử phép cộng thêm</h2>
    </div>

    <!-- Filter -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-3">
        <AppSelect
          v-model="filters.year"
          :options="yearOptions"
          value-key="value"
          label-key="label"
          class="w-32"
        />
        <AppButton variant="secondary" size="sm" @click="loadData">Lọc</AppButton>
      </div>
    </div>

    <!-- Summary card -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="card text-center">
        <p class="text-2xl font-bold text-primary-700">{{ summary.total_days }}</p>
        <p class="text-sm text-gray-500 mt-1">Tổng ngày phép</p>
      </div>
      <div class="card text-center">
        <p class="text-2xl font-bold text-orange-600">{{ summary.used_days }}</p>
        <p class="text-sm text-gray-500 mt-1">Đã sử dụng</p>
      </div>
      <div class="card text-center">
        <p class="text-2xl font-bold text-green-600">{{ summary.remaining_days }}</p>
        <p class="text-sm text-gray-500 mt-1">Còn lại</p>
      </div>
    </div>

    <AppTable :columns="columns" :rows="history" :loading="loading" empty-text="Chưa có lịch sử phép cộng thêm">
      <template #cell-days="{ row }">
        <span class="font-semibold text-primary-700">+{{ row.days }}</span>
      </template>
      <template #cell-created_at="{ row }">{{ formatDate(row.created_at) }}</template>
    </AppTable>
  </div>
</template>

<script setup lang="ts">
import { currentYear, formatDate } from '~/utils/date'
import type { DayLeave } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'leave' } })
useHead({ title: 'Lịch sử phép cộng thêm — Micro ERP' })

const { post } = useApi()
const { user } = useAuth()

const loading = ref(true)
const history = ref<any[]>([])
const filters = reactive({ year: currentYear() })

const summary = computed(() => {
  const total = history.value.reduce((s, r) => s + (r.total_days ?? 0), 0)
  const used  = history.value.reduce((s, r) => s + (r.used_days ?? 0), 0)
  return { total_days: total, used_days: used, remaining_days: total - used }
})

const yearOptions = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear() - 2 + i
  return { value: y, label: String(y) }
})

const columns = [
  { key: 'year',       label: 'Năm' },
  { key: 'total_days', label: 'Tổng ngày' },
  { key: 'used_days',  label: 'Đã dùng' },
  { key: 'note',       label: 'Ghi chú' },
  { key: 'created_at', label: 'Ngày tạo' },
]

async function loadData() {
  loading.value = true
  try {
    const res = await post<{ history: DayLeave[] }>('/leave/get-bonus-leave-history', {
      user_id: user.value?.id,
      year: filters.year,
    })
    history.value = res.data?.history ?? []
  } finally { loading.value = false }
}

onMounted(loadData)
</script>
