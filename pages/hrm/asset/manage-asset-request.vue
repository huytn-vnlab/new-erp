<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-base font-semibold text-gray-800">Yêu cầu mượn tài sản</h2>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 border-b border-gray-200">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="activeTab === tab.value
          ? 'text-primary-600 border-b-2 border-primary-600'
          : 'text-gray-500 hover:text-gray-700'"
        @click="activeTab = tab.value; loadData()"
      >
        {{ tab.label }}
      </button>
    </div>

    <AppTable :columns="columns" :rows="requests" :loading="loading" empty-text="Không có yêu cầu nào">
      <template #cell-asset_name="{ row }">
        <div>
          <p class="font-medium text-sm">{{ row.asset_name }}</p>
          <p class="text-xs text-gray-400">{{ row.asset_code }}</p>
        </div>
      </template>
      <template #cell-request_date="{ row }">{{ formatDate(row.request_date) }}</template>
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
          {{ requestStatusLabel(row.status) }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <div v-if="row.status === 0" class="flex gap-2">
          <AppButton size="xs" :loading="actionId === row.id && action === 'approve'" @click="handleApprove(row)">
            Duyệt
          </AppButton>
          <AppButton size="xs" variant="danger" :loading="actionId === row.id && action === 'reject'" @click="handleReject(row)">
            Từ chối
          </AppButton>
        </div>
        <div v-else-if="row.status === 1">
          <AppButton size="xs" variant="secondary" :loading="actionId === row.id && action === 'return'" @click="handleReturn(row)">
            Trả lại
          </AppButton>
        </div>
      </template>
    </AppTable>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/date'
import { handleApiError } from '~/utils/error-handler'
import type { AssetRequest } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Yêu cầu tài sản — Micro ERP' })

const toast = useToast()
const { post } = useApi()

const loading   = ref(true)
const requests  = ref<any[]>([])
const activeTab = ref('pending')
const actionId  = ref<number | null>(null)
const action    = ref('')

const tabs = [
  { value: 'pending',  label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'all',      label: 'Tất cả' },
]

const columns = [
  { key: 'full_name',    label: 'Nhân viên' },
  { key: 'asset_name',   label: 'Tài sản' },
  { key: 'request_date', label: 'Ngày yêu cầu' },
  { key: 'return_date',  label: 'Ngày trả' },
  { key: 'reason',       label: 'Lý do' },
  { key: 'status',       label: 'Trạng thái' },
  { key: 'actions',      label: '' },
]

function requestStatusLabel(s: number) {
  return ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã trả'][s] ?? 'N/A'
}

// Backend: POST /asset/edit-user-requests-asset { id, user_id, asset_id, status }
async function handleApprove(row: any) {
  actionId.value = row.id; action.value = 'approve'
  try {
    await post('/asset/edit-user-requests-asset', { id: row.id, user_id: row.user_id, asset_id: row.asset_id, status: 2 })
    row.status = 2
    toast.success('Đã duyệt')
  } catch (err) { toast.error(handleApiError(err)) }
  finally { actionId.value = null }
}

async function handleReject(row: any) {
  actionId.value = row.id; action.value = 'reject'
  try {
    await post('/asset/edit-user-requests-asset', { id: row.id, user_id: row.user_id, asset_id: row.asset_id, status: 3 })
    row.status = 3
    toast.success('Đã từ chối')
  } catch (err) { toast.error(handleApiError(err)) }
  finally { actionId.value = null }
}

async function handleReturn(row: any) {
  actionId.value = row.id; action.value = 'return'
  try {
    await post('/asset/edit-user-requests-asset', { id: row.id, user_id: row.user_id, asset_id: row.asset_id, status: 4 })
    row.status = 4
    toast.success('Đã cập nhật trả tài sản')
  } catch (err) { toast.error(handleApiError(err)) }
  finally { actionId.value = null }
}

async function loadData() {
  loading.value = true
  try {
    const res = await post<{ requests: AssetRequest[] }>('/asset/get-asset-requests', { status: activeTab.value })
    requests.value = res.data?.requests ?? []
  } finally { loading.value = false }
}

onMounted(loadData)
</script>
