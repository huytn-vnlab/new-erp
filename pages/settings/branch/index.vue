<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-base font-semibold text-gray-800">Quản lý chi nhánh</h2>
      <AppButton size="sm" @click="openCreate">+ Thêm chi nhánh</AppButton>
    </div>

    <AppTable :columns="columns" :rows="settingStore.branches" :loading="loading" empty-text="Chưa có chi nhánh">
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <AppButton size="xs" variant="secondary" @click="openEdit(row)">{{ $t('common.edit') }}</AppButton>
          <AppButton size="xs" variant="danger" @click="confirmDelete(row)">{{ $t('common.delete') }}</AppButton>
        </div>
      </template>
    </AppTable>

    <!-- Create/Edit modal -->
    <AppModal v-model="showModal" :title="editing ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh'" size="sm">
      <div class="space-y-3">
        <AppInput v-model="form.name" label="Tên chi nhánh" required />
        <AppInput v-model="form.address" label="Địa chỉ" />
        <AppInput v-model="form.phone" label="Điện thoại" />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" @click="save">{{ $t('common.save') }}</AppButton>
      </template>
    </AppModal>

    <!-- Delete confirm -->
    <AppModal v-model="showDeleteModal" title="Xóa chi nhánh" size="sm">
      <p class="text-sm text-gray-600">Xóa chi nhánh <strong>{{ selectedRow?.name }}</strong>?</p>
      <template #footer>
        <AppButton variant="secondary" @click="showDeleteModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton variant="danger" :loading="deleting" @click="doDelete">{{ $t('common.delete') }}</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '~/stores/setting'
import { handleApiError } from '~/utils/error-handler'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Chi nhánh — Micro ERP' })

const settingStore = useSettingStore()
const toast = useToast()
const { post } = useApi()
const { user } = useAuth()

const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const editing = ref(false)
const selectedRow = ref<any>(null)
const form = ref({ id: 0, name: '', address: '', phone: '' })

const columns = [
  { key: 'name',    label: 'Tên chi nhánh' },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'phone',   label: 'Điện thoại' },
  { key: 'actions', label: '' },
]

function openCreate() {
  editing.value = false
  form.value = { id: 0, name: '', address: '', phone: '' }
  showModal.value = true
}

function openEdit(row: any) {
  editing.value = true
  form.value = { id: row.id, name: row.name, address: row.address ?? '', phone: row.phone ?? '' }
  showModal.value = true
}

function confirmDelete(row: any) {
  selectedRow.value = row
  showDeleteModal.value = true
}

async function save() {
  saving.value = true
  try {
    const endpoint = editing.value ? '/setting/update-branch' : '/setting/create-branch'
    await post(endpoint, { ...form.value, org_id: user.value?.organization_id })
    toast.success(editing.value ? 'Đã cập nhật chi nhánh' : 'Đã thêm chi nhánh')
    showModal.value = false
    await settingStore.fetchBranches(user.value?.organization_id ?? 0)
  } catch (err) {
    toast.error(handleApiError(err))
  } finally { saving.value = false }
}

async function doDelete() {
  if (!selectedRow.value) return
  deleting.value = true
  try {
    await post('/setting/delete-branch', { id: selectedRow.value.id })
    toast.success('Đã xóa chi nhánh')
    showDeleteModal.value = false
    await settingStore.fetchBranches(user.value?.organization_id ?? 0)
  } catch (err) {
    toast.error(handleApiError(err))
  } finally { deleting.value = false }
}

onMounted(async () => {
  await settingStore.fetchBranches(user.value?.organization_id ?? 0)
  loading.value = false
})
</script>
