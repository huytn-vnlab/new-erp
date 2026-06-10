<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-base font-semibold text-gray-800">Quản lý loại hợp đồng</h2>
      <AppButton size="sm" @click="openCreate">+ Thêm loại</AppButton>
    </div>

    <AppTable :columns="columns" :rows="contractTypes" :loading="loading" empty-text="Chưa có loại hợp đồng">
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <AppButton size="xs" variant="secondary" @click="openEdit(row)">{{ $t('common.edit') }}</AppButton>
          <AppButton size="xs" variant="danger" @click="confirmDelete(row)">{{ $t('common.delete') }}</AppButton>
        </div>
      </template>
    </AppTable>

    <AppModal v-model="showModal" :title="editing ? 'Sửa loại hợp đồng' : 'Thêm loại hợp đồng'" size="sm">
      <div class="space-y-4">
        <AppInput v-model="form.name" label="Tên loại hợp đồng" placeholder="VD: Hợp đồng thử việc" required />
        <AppInput v-model.number="form.duration_months" type="number" label="Thời hạn (tháng)" />
        <div>
          <label class="form-label">Mô tả</label>
          <textarea v-model="form.description" rows="2" class="form-input resize-none" />
        </div>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" :disabled="!form.name" @click="save">{{ $t('common.save') }}</AppButton>
      </template>
    </AppModal>

    <AppModal v-model="showDeleteModal" title="Xóa loại hợp đồng" size="sm">
      <p class="text-sm text-gray-600">Xóa loại hợp đồng <strong>{{ selectedRow?.name }}</strong>?</p>
      <template #footer>
        <AppButton variant="secondary" @click="showDeleteModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton variant="danger" :loading="deleting" @click="doDelete">{{ $t('common.delete') }}</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { handleApiError } from '~/utils/error-handler'
import type { ContractType } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Loại hợp đồng — Micro ERP' })

const toast = useToast()
const { post } = useApi()

const loading  = ref(true)
const saving   = ref(false)
const deleting = ref(false)
const editing  = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const contractTypes = ref<any[]>([])
const selectedRow   = ref<any>(null)
const form = ref({ id: 0, name: '', duration_months: 0, description: '' })

const columns = [
  { key: 'name',             label: 'Tên loại' },
  { key: 'duration_months',  label: 'Thời hạn (tháng)' },
  { key: 'description',      label: 'Mô tả' },
  { key: 'actions',          label: '' },
]

function openCreate() {
  editing.value = false
  form.value = { id: 0, name: '', duration_months: 0, description: '' }
  showModal.value = true
}

function openEdit(row: any) {
  editing.value = true
  form.value = { id: row.id, name: row.name, duration_months: row.duration_months ?? 0, description: row.description ?? '' }
  showModal.value = true
}

function confirmDelete(row: any) {
  selectedRow.value = row
  showDeleteModal.value = true
}

async function save() {
  saving.value = true
  try {
    const endpoint = editing.value ? '/contract/update-contract-type' : '/contract/create-contract-type'
    await post(endpoint, { ...form.value })
    toast.success(editing.value ? 'Đã cập nhật' : 'Đã thêm loại hợp đồng')
    showModal.value = false
    await loadData()
  } catch (err) { toast.error(handleApiError(err)) }
  finally { saving.value = false }
}

async function doDelete() {
  deleting.value = true
  try {
    await post('/contract/delete-contract-type', { id: selectedRow.value.id })
    toast.success('Đã xóa')
    showDeleteModal.value = false
    await loadData()
  } catch (err) { toast.error(handleApiError(err)) }
  finally { deleting.value = false }
}

async function loadData() {
  const res = await post<{ contract_types: ContractType[] }>('/contract/get-contract-types', {})
  contractTypes.value = res.data?.contract_types ?? []
}

onMounted(async () => {
  await loadData()
  loading.value = false
})
</script>
