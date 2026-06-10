<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800">Quản lý tuyển dụng</h2>
      <NuxtLink to="/recruitment/create-recruitment">
        <AppButton size="sm">+ Tạo tin tuyển dụng</AppButton>
      </NuxtLink>
    </div>

    <!-- Filter -->
    <div class="card mb-4 flex flex-wrap gap-3">
      <AppInput v-model="search" placeholder="Tìm vị trí..." class="w-56">
        <template #prefix>
          <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </template>
      </AppInput>
      <AppSelect
        v-model="filterStatus"
        :options="statusOptions"
        value-key="value"
        label-key="label"
        placeholder="Tất cả trạng thái"
        class="w-44"
      />
    </div>

    <AppTable
      :columns="columns"
      :rows="filteredRows"
      :loading="recruitmentStore.loading"
      :empty-text="$t('common.noData')"
    >
      <template #cell-status="{ value }">
        <AppBadge :variant="recruitmentStatusMeta(value).variant">{{ recruitmentStatusMeta(value).label }}</AppBadge>
      </template>
      <template #cell-start_date="{ value }">{{ formatDate(value) }}</template>
      <template #cell-expiry_date="{ value }">{{ formatDate(value) }}</template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <NuxtLink :to="`/recruitment/view-recruitment/${row.id}`">
            <AppButton size="xs" variant="ghost">Xem</AppButton>
          </NuxtLink>
          <NuxtLink :to="`/recruitment/edit-recruitment/${row.id}`">
            <AppButton size="xs" variant="secondary">{{ $t('common.edit') }}</AppButton>
          </NuxtLink>
          <AppButton size="xs" variant="danger" :loading="deletingId === row.id" @click="confirmDelete(row)">
            {{ $t('common.delete') }}
          </AppButton>
        </div>
      </template>

      <template #footer>
        <AppPagination
          :current-page="recruitmentStore.pagination.current_page"
          :total-row="recruitmentStore.pagination.total_row"
          :row-per-page="recruitmentStore.pagination.row_per_page"
          @change="recruitmentStore.fetchRecruitments($event)"
        />
      </template>
    </AppTable>

    <!-- Delete confirm -->
    <AppModal v-model="showDeleteModal" title="Xóa tin tuyển dụng" size="sm">
      <p class="text-sm text-gray-600">Bạn có chắc muốn xóa tin <strong>{{ selectedRow?.job_name }}</strong>?</p>
      <template #footer>
        <AppButton variant="secondary" @click="showDeleteModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton variant="danger" :loading="deleting" @click="doDelete">{{ $t('common.delete') }}</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { useRecruitmentStore } from '~/stores/recruitment'
import { useRecruitment } from '~/composables/useRecruitment'
import { formatDate } from '~/utils/date'
import { recruitmentStatusMeta } from '~/utils/format'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'recruitment' } })
useHead({ title: 'Tuyển dụng — Micro ERP' })

const recruitmentStore = useRecruitmentStore()
const { deleteRecruitment } = useRecruitment()

const columns = [
  { key: 'job_name',    label: 'Vị trí tuyển dụng' },
  { key: 'start_date',  label: 'Ngày bắt đầu' },
  { key: 'expiry_date', label: 'Hạn nộp' },
  { key: 'status',      label: 'Trạng thái' },
  { key: 'actions',     label: '', class: 'text-right' },
]

const statusOptions = [
  { value: '',  label: 'Tất cả' },
  { value: '0', label: 'Tạm dừng' },
  { value: '1', label: 'Đang tuyển' },
  { value: '2', label: 'Đã tuyển đủ' },
]

const search       = ref('')
const filterStatus = ref('')
const showDeleteModal = ref(false)
const deleting       = ref(false)
const deletingId     = ref<number | null>(null)
const selectedRow    = ref<any>(null)

const filteredRows = computed(() => {
  let rows = recruitmentStore.recruitments
  if (search.value)              rows = rows.filter(r => r.job_name?.toLowerCase().includes(search.value.toLowerCase()))
  if (filterStatus.value !== '') rows = rows.filter(r => String(r.status) === filterStatus.value)
  return rows
})

function confirmDelete(row: any) {
  selectedRow.value = row
  showDeleteModal.value = true
}

async function doDelete() {
  if (!selectedRow.value) return
  deleting.value = true
  try {
    await deleteRecruitment(selectedRow.value.id)
    showDeleteModal.value = false
  } finally { deleting.value = false }
}

onMounted(() => recruitmentStore.fetchRecruitments())
</script>
