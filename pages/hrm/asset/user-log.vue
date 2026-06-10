<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-base font-semibold text-gray-800">Lịch sử mượn tài sản của tôi</h2>
    </div>

    <AppTable :columns="columns" :rows="logs" :loading="loading" empty-text="Bạn chưa mượn tài sản nào">
      <template #cell-asset_name="{ row }">
        <div>
          <p class="font-medium text-sm">{{ row.asset_name }}</p>
          <p class="text-xs text-gray-400">{{ row.asset_code }}</p>
        </div>
      </template>
      <template #cell-request_date="{ row }">{{ formatDate(row.request_date) }}</template>
      <template #cell-approved_at="{ row }">{{ row.approved_at ? formatDate(row.approved_at) : '—' }}</template>
      <template #cell-return_date="{ row }">{{ row.return_date ? formatDate(row.return_date) : '—' }}</template>
      <template #cell-status="{ row }">
        <span
          class="badge"
          :class="{
            'badge-warning': row.status === 0,
            'badge-success': row.status === 1,
            'badge-error':   row.status === 2,
          }"
        >
          {{ statusLabel(row.status) }}
        </span>
      </template>
    </AppTable>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/date'
import type { AssetRequest } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'assets' } })
useHead({ title: 'Lịch sử tài sản — Micro ERP' })

const { post } = useApi()
const { user } = useAuth()
const loading = ref(true)
const logs    = ref<any[]>([])

const columns = [
  { key: 'asset_name',   label: 'Tài sản' },
  { key: 'request_date', label: 'Ngày yêu cầu' },
  { key: 'approved_at',  label: 'Ngày duyệt' },
  { key: 'return_date',  label: 'Ngày trả' },
  { key: 'reason',       label: 'Lý do' },
  { key: 'status',       label: 'Trạng thái' },
]

function statusLabel(s: number) {
  return ['Chờ duyệt', 'Đang mượn', 'Từ chối', 'Đã trả'][s] ?? 'N/A'
}

onMounted(async () => {
  try {
    const res = await post<{ logs: AssetRequest[] }>('/asset/get-user-asset-log', { user_id: user.value?.id })
    logs.value = res.data?.logs ?? []
  } finally { loading.value = false }
})
</script>
