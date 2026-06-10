<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-base font-semibold text-gray-800">Công nghệ / Kỹ năng</h2>
      <AppButton size="sm" @click="openCreate">+ Thêm</AppButton>
    </div>

    <p class="text-sm text-gray-500 mb-6">
      Danh sách công nghệ và kỹ năng dùng trong hồ sơ nhân viên và quản lý tuyển dụng.
    </p>

    <AppTable :columns="columns" :rows="technologies" :loading="loading" empty-text="Chưa có công nghệ / kỹ năng">
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <AppButton size="xs" variant="secondary" @click="openEdit(row)">{{ $t('common.edit') }}</AppButton>
          <AppButton size="xs" variant="danger" @click="confirmDelete(row)">{{ $t('common.delete') }}</AppButton>
        </div>
      </template>
    </AppTable>

    <AppModal v-model="showModal" :title="editing ? 'Sửa công nghệ' : 'Thêm công nghệ'" size="sm">
      <div class="space-y-4">
        <AppInput v-model="form.name" label="Tên công nghệ / kỹ năng" placeholder="VD: ReactJS, Python, AWS..." required />
        <AppSelect
          v-model="form.category"
          :options="categoryOptions"
          value-key="value"
          label-key="label"
          label="Danh mục"
        />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" :disabled="!form.name" @click="save">{{ $t('common.save') }}</AppButton>
      </template>
    </AppModal>

    <AppModal v-model="showDeleteModal" title="Xóa công nghệ" size="sm">
      <p class="text-sm text-gray-600">Xóa <strong>{{ selectedRow?.name }}</strong>?</p>
      <template #footer>
        <AppButton variant="secondary" @click="showDeleteModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton variant="danger" :loading="deleting" @click="doDelete">{{ $t('common.delete') }}</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { handleApiError } from '~/utils/error-handler'
import type { Technology } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Công nghệ & Kỹ năng — Micro ERP' })

const toast = useToast()
const { post } = useApi()

const loading  = ref(true)
const saving   = ref(false)
const deleting = ref(false)
const editing  = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const technologies = ref<any[]>([])
const selectedRow  = ref<any>(null)
const form = ref({ id: 0, name: '', category: '' })

const categoryOptions = [
  { value: 'frontend',  label: 'Frontend' },
  { value: 'backend',   label: 'Backend' },
  { value: 'devops',    label: 'DevOps' },
  { value: 'mobile',    label: 'Mobile' },
  { value: 'database',  label: 'Database' },
  { value: 'soft_skill',label: 'Kỹ năng mềm' },
  { value: 'other',     label: 'Khác' },
]

const columns = [
  { key: 'name',     label: 'Tên' },
  { key: 'category', label: 'Danh mục' },
  { key: 'actions',  label: '' },
]

function openCreate() {
  editing.value = false
  form.value = { id: 0, name: '', category: '' }
  showModal.value = true
}

function openEdit(row: any) {
  editing.value = true
  form.value = { id: row.id, name: row.name, category: row.category ?? '' }
  showModal.value = true
}

function confirmDelete(row: any) {
  selectedRow.value = row
  showDeleteModal.value = true
}

async function save() {
  saving.value = true
  try {
    const endpoint = editing.value ? '/setting/update-technology' : '/setting/create-technology'
    await post(endpoint, { ...form.value })
    toast.success(editing.value ? 'Đã cập nhật' : 'Đã thêm')
    showModal.value = false
    await loadData()
  } catch (err) { toast.error(handleApiError(err)) }
  finally { saving.value = false }
}

async function doDelete() {
  deleting.value = true
  try {
    await post('/setting/delete-technology', { id: selectedRow.value.id })
    toast.success('Đã xóa')
    showDeleteModal.value = false
    await loadData()
  } catch (err) { toast.error(handleApiError(err)) }
  finally { deleting.value = false }
}

async function loadData() {
  const res = await post<{ technologies: Technology[] }>('/setting/get-technologies', {})
  technologies.value = res.data?.technologies ?? []
}

onMounted(async () => {
  await loadData()
  loading.value = false
})
</script>
