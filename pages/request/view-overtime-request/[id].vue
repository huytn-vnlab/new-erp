<template>
  <div class="max-w-2xl mx-auto">
    <div v-if="loading" class="flex justify-center py-16"><AppSpinner /></div>

    <template v-else-if="overtime">
      <div class="card mb-4">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Chi tiết yêu cầu OT</h2>
            <p class="text-sm text-gray-500 mt-0.5">#{{ overtime.id }}</p>
          </div>
          <AppBadge :variant="overtimeStatusMeta(overtime.status).variant">
            {{ overtimeStatusMeta(overtime.status).label }}
          </AppBadge>
        </div>

        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt class="text-xs text-gray-500 uppercase tracking-wide">Nhân viên</dt>
            <dd class="mt-1 font-medium text-gray-900">{{ overtime.full_name || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500 uppercase tracking-wide">Dự án</dt>
            <dd class="mt-1 font-medium text-gray-900">{{ overtime.project_name || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500 uppercase tracking-wide">Thời gian bắt đầu</dt>
            <dd class="mt-1 font-medium text-gray-900">{{ formatDate(overtime.datetime_overtime_from) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500 uppercase tracking-wide">Thời gian kết thúc</dt>
            <dd class="mt-1 font-medium text-gray-900">{{ formatDate(overtime.datetime_overtime_to) }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs text-gray-500 uppercase tracking-wide">Lý do</dt>
            <dd class="mt-1 text-gray-700">{{ overtime.reason || '—' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Admin actions — status 1 = pending -->
      <div v-if="isAdminUser && overtime.status === 1" class="card">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Hành động</h3>
        <div class="flex gap-3">
          <AppButton :loading="approving" @click="approve">Duyệt</AppButton>
          <AppButton variant="danger" @click="showRejectModal = true">Từ chối</AppButton>
        </div>
      </div>

      <div class="mt-4">
        <AppButton variant="secondary" @click="$router.back()">← Quay lại</AppButton>
      </div>
    </template>

    <div v-else class="card text-center py-12 text-sm text-gray-400">Không tìm thấy yêu cầu OT</div>

    <!-- Reject modal -->
    <AppModal v-model="showRejectModal" title="Từ chối OT" size="sm">
      <AppInput v-model="rejectReason" label="Lý do từ chối" placeholder="Nhập lý do..." required />
      <template #footer>
        <AppButton variant="secondary" @click="showRejectModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton variant="danger" :loading="rejecting" :disabled="!rejectReason" @click="reject">Từ chối</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { overtimeStatusMeta } from '~/utils/format'
import { formatDate } from '~/utils/date'
import { handleApiError } from '~/utils/error-handler'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'overtime' } })
useHead({ title: 'Chi tiết OT — Micro ERP' })

const route  = useRoute()
const router = useRouter()
const toast  = useToast()
const { post } = useApi()
const { user } = useAuth()

const loading         = ref(true)
const approving       = ref(false)
const rejecting       = ref(false)
const showRejectModal = ref(false)
const rejectReason    = ref('')
const overtime        = ref<any>(null)

const isAdminUser = computed(() => user.value?.is_admin ?? false)

/** Approve: POST /overtime/update-overtime-request-status { request_id, status_request: 2 } */
async function approve() {
  approving.value = true
  try {
    await post('/overtime/update-overtime-request-status', {
      request_id:     overtime.value.id,
      status_request: 2,
    })
    overtime.value.status = 2
    toast.success('Đã duyệt OT')
  } catch (err) { toast.error(handleApiError(err)) }
  finally { approving.value = false }
}

/** Reject: POST /overtime/update-overtime-request-status { request_id, status_request: 3 } */
async function reject() {
  rejecting.value = true
  try {
    await post('/overtime/update-overtime-request-status', {
      request_id:     overtime.value.id,
      status_request: 3,
    })
    overtime.value.status = 3
    showRejectModal.value = false
    toast.success('Đã từ chối OT')
  } catch (err) { toast.error(handleApiError(err)) }
  finally { rejecting.value = false }
}

onMounted(async () => {
  try {
    // Backend: POST /overtime/get-overtime-request { id }
    const res = await post<Record<string, any>>('/overtime/get-overtime-request', {
      id: Number(route.params.id),
    })
    overtime.value = res.data ?? null
  } finally { loading.value = false }
})
</script>
