<template>
  <div>
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <h2 class="text-lg font-semibold text-gray-800">Quản lý hợp đồng</h2>
      <AppButton size="sm" @click="openCreate">+ Tạo hợp đồng</AppButton>
    </div>

    <!-- Filters -->
    <div class="card mb-4 flex flex-wrap gap-3">
      <AppInput v-model="search" placeholder="Tìm nhân viên..." class="w-52" />
      <AppSelect
        v-model="filterType"
        :options="typeOptions"
        value-key="value"
        label-key="label"
        placeholder="Loại hợp đồng"
        class="w-44"
      />
      <AppSelect
        v-model="filterStatus"
        :options="statusOptions"
        value-key="value"
        label-key="label"
        placeholder="Trạng thái"
        class="w-36"
      />
    </div>

    <AppTable :columns="columns" :rows="filteredContracts" :loading="contractStore.loading" :empty-text="$t('common.noData')">
      <template #cell-start_date="{ value }">{{ formatDate(value) }}</template>
      <template #cell-end_date="{ value }">{{ value ? formatDate(value) : 'Không xác định' }}</template>
      <template #cell-status="{ value }">
        <AppBadge :variant="value === 1 ? 'green' : value === 2 ? 'red' : 'yellow'">
          {{ { 0: 'Chờ ký', 1: 'Còn hiệu lực', 2: 'Hết hạn' }[value as 0|1|2] ?? '—' }}
        </AppBadge>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <AppButton size="xs" variant="secondary" @click="openEdit(row)">{{ $t('common.edit') }}</AppButton>
          <AppButton size="xs" variant="danger" @click="confirmDelete(row)">{{ $t('common.delete') }}</AppButton>
        </div>
      </template>

      <template #footer>
        <AppPagination
          :current-page="contractStore.pagination.current_page"
          :total-row="contractStore.pagination.total_row"
          :row-per-page="contractStore.pagination.row_per_page"
          @change="contractStore.fetchContracts($event)"
        />
      </template>
    </AppTable>

    <!-- Create/Edit Modal -->
    <AppModal v-model="showModal" :title="editing ? 'Chỉnh sửa hợp đồng' : 'Tạo hợp đồng mới'" size="lg">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput v-model="form.employee_name" label="Nhân viên" required />
        <AppSelect
          v-model="form.contract_type_id"
          label="Loại hợp đồng"
          :options="typeOptions.filter(t => t.value !== '')"
          value-key="value"
          label-key="label"
        />
        <DatePicker v-model="form.start_date" label="Ngày bắt đầu" required />
        <DatePicker v-model="form.end_date" label="Ngày kết thúc" />
        <AppInput v-model="form.salary" type="number" label="Lương (VND)" />
        <AppSelect
          v-model="form.status"
          label="Trạng thái"
          :options="[{value:0,label:'Chờ ký'},{value:1,label:'Còn hiệu lực'},{value:2,label:'Hết hạn'}]"
          value-key="value"
          label-key="label"
        />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" @click="save">{{ $t('common.save') }}</AppButton>
      </template>
    </AppModal>

    <!-- Delete confirm -->
    <AppModal v-model="showDeleteModal" title="Xóa hợp đồng" size="sm">
      <p class="text-sm text-gray-600">Xóa hợp đồng của <strong>{{ selectedRow?.employee_name }}</strong>?</p>
      <template #footer>
        <AppButton variant="secondary" @click="showDeleteModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton variant="danger" :loading="deleting" @click="doDelete">{{ $t('common.delete') }}</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { useContractStore } from '~/stores/contract'
import { formatDate } from '~/utils/date'
import { handleApiError } from '~/utils/error-handler'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'contract' } })
useHead({ title: 'Hợp đồng — Micro ERP' })

const contractStore = useContractStore()
const toast = useToast()
const { post } = useApi()

const loading  = ref(true)
const saving   = ref(false)
const deleting = ref(false)
const editing  = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedRow = ref<any>(null)
const search      = ref('')
const filterType  = ref('')
const filterStatus = ref('')

const form = ref({ id: 0, employee_name: '', contract_type_id: '', start_date: '', end_date: '', salary: '', status: 0 })

const typeOptions = [
  { value: '',  label: 'Tất cả' },
  { value: '1', label: 'Thử việc' },
  { value: '2', label: 'Xác định thời hạn 1 năm' },
  { value: '3', label: 'Xác định thời hạn 2 năm' },
  { value: '4', label: 'Không xác định thời hạn' },
]

const statusOptions = [
  { value: '',  label: 'Tất cả' },
  { value: '0', label: 'Chờ ký' },
  { value: '1', label: 'Còn hiệu lực' },
  { value: '2', label: 'Hết hạn' },
]

const columns = [
  { key: 'employee_name',    label: 'Nhân viên' },
  { key: 'contract_type',    label: 'Loại hợp đồng' },
  { key: 'start_date',       label: 'Từ ngày' },
  { key: 'end_date',         label: 'Đến ngày' },
  { key: 'status',           label: 'Trạng thái' },
  { key: 'actions',          label: '',           class: 'text-right' },
]

const filteredContracts = computed(() => {
  let rows = contractStore.contracts
  if (search.value)       rows = rows.filter(r => r.employee_name?.toLowerCase().includes(search.value.toLowerCase()))
  if (filterType.value)   rows = rows.filter(r => String(r.contract_type_id) === filterType.value)
  if (filterStatus.value) rows = rows.filter(r => String(r.status) === filterStatus.value)
  return rows
})

function openCreate() {
  editing.value = false
  form.value = { id: 0, employee_name: '', contract_type_id: '', start_date: '', end_date: '', salary: '', status: 0 }
  showModal.value = true
}

function openEdit(row: any) {
  editing.value = true
  form.value = { ...row }
  showModal.value = true
}

function confirmDelete(row: any) {
  selectedRow.value = row
  showDeleteModal.value = true
}

async function save() {
  saving.value = true
  try {
    const endpoint = editing.value ? '/contract/update-contract' : '/contract/create-contract'
    await post(endpoint, form.value)
    toast.success(editing.value ? 'Đã cập nhật hợp đồng' : 'Tạo hợp đồng thành công')
    showModal.value = false
    await contractStore.fetchContracts()
  } catch (err) {
    toast.error(handleApiError(err))
  } finally { saving.value = false }
}

async function doDelete() {
  if (!selectedRow.value) return
  deleting.value = true
  try {
    await post('/contract/delete-contract', { id: selectedRow.value.id })
    toast.success('Đã xóa hợp đồng')
    showDeleteModal.value = false
    await contractStore.fetchContracts()
  } catch (err) {
    toast.error(handleApiError(err))
  } finally { deleting.value = false }
}

onMounted(async () => {
  await contractStore.fetchContracts()
  loading.value = false
})
</script>
