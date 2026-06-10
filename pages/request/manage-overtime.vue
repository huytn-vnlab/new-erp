<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800">Quản lý OT</h2>
      <NuxtLink to="/request/create-overtime">
        <AppButton size="sm">+ Đăng ký OT</AppButton>
      </NuxtLink>
    </div>

    <!-- Tabs: my requests / all requests (admin) -->
    <div class="mb-4 border-b border-gray-200">
      <nav class="flex gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'pb-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.key
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
          @click="activeTab = tab.key"
        >{{ tab.label }}</button>
      </nav>
    </div>

    <AppTable
      :columns="columns"
      :rows="overtimeStore.requests"
      :loading="overtimeStore.loading"
      :empty-text="$t('common.noData')"
    >
      <template #cell-status="{ value }">
        <span :class="['badge', otStatusCls(value)]">{{ otStatusLabel(value) }}</span>
      </template>
      <template #cell-working_time="{ value }">{{ value ? `${value}h` : '—' }}</template>
      <template #cell-actions="{ row }">
        <div v-if="user && isAdmin(user) && row.status === 'Pending'" class="flex gap-2">
          <AppButton size="xs" :loading="processingId === row.id" @click="doApprove(row)">Duyệt</AppButton>
          <AppButton size="xs" variant="danger" @click="openRejectModal(row)">Từ chối</AppButton>
        </div>
        <div v-else-if="row.status === 'Pending'" class="flex gap-2">
          <AppButton size="xs" variant="danger" @click="doDelete(row)">Hủy</AppButton>
        </div>
      </template>

      <template #footer>
        <AppPagination
          :current-page="overtimeStore.pagination.current_page"
          :total-row="overtimeStore.pagination.total_row"
          :row-per-page="overtimeStore.pagination.row_per_page"
          @change="overtimeStore.fetchRequests($event)"
        />
      </template>
    </AppTable>

    <!-- Reject modal -->
    <AppModal v-model="showRejectModal" title="Từ chối yêu cầu OT" size="sm">
      <p class="text-sm text-gray-600 mb-3">Nhập lý do từ chối:</p>
      <textarea v-model="rejectReason" rows="3" class="form-input resize-none" placeholder="Lý do..." />
      <template #footer>
        <AppButton variant="secondary" @click="showRejectModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton variant="danger" :loading="rejecting" :disabled="!rejectReason.trim()" @click="doReject">Từ chối</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { useOvertimeStore } from '~/stores/overtime'
import { useOvertime } from '~/composables/useOvertime'
import { isAdmin } from '~/utils/permission'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'overtime' } })
useHead({ title: 'Quản lý OT — Micro ERP' })

const { user }       = useAuth()
const overtimeStore  = useOvertimeStore()
const { approveOvertime, rejectOvertime, deleteOvertimeRequest } = useOvertime()

const activeTab = ref('mine')
const tabs = [
  { key: 'mine', label: 'Yêu cầu của tôi' },
  { key: 'all',  label: 'Tất cả (Admin)' },
]

const columns = [
  { key: 'full_name',     label: 'Nhân viên' },
  { key: 'date_overtime', label: 'Ngày OT' },
  { key: 'time_overtime', label: 'Giờ OT' },
  { key: 'overtime_type', label: 'Loại OT' },
  { key: 'project_name',  label: 'Dự án' },
  { key: 'working_time',  label: 'Số giờ' },
  { key: 'status',        label: 'Trạng thái' },
  { key: 'actions',       label: '' },
]

// Status is a string from API: "Pending", "Accepted", "Deny"
function otStatusLabel(s: string) {
  return { Pending: 'Chờ duyệt', Accepted: 'Đã duyệt', Deny: 'Từ chối' }[s] ?? s
}
function otStatusCls(s: string) {
  return { Pending: 'badge-warning', Accepted: 'badge-success', Deny: 'badge-error' }[s] ?? ''
}

const processingId   = ref<number | null>(null)
const showRejectModal = ref(false)
const rejecting       = ref(false)
const rejectReason    = ref('')
const selectedRow     = ref<any>(null)

async function doApprove(row: any) {
  processingId.value = row.id
  try { await approveOvertime(row.id) } finally { processingId.value = null }
}

function openRejectModal(row: any) {
  selectedRow.value = row
  rejectReason.value = ''
  showRejectModal.value = true
}

async function doReject() {
  if (!selectedRow.value) return
  rejecting.value = true
  try {
    await rejectOvertime(selectedRow.value.id, rejectReason.value)
    showRejectModal.value = false
  } finally { rejecting.value = false }
}

async function doDelete(row: any) {
  await deleteOvertimeRequest(row.id)
}

onMounted(() => overtimeStore.fetchRequests())
</script>
