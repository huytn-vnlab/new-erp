<template>
  <div>
    <!-- Settings sub-nav -->
    <div class="flex gap-3 mb-6 border-b border-gray-200 pb-4">
      <NuxtLink to="/settings/job-title">
        <AppButton size="sm">Cài đặt cơ bản</AppButton>
      </NuxtLink>
      <NuxtLink to="/settings/user-permission">
        <AppButton size="sm" variant="secondary">Phân quyền người dùng</AppButton>
      </NuxtLink>
    </div>

    <div class="flex items-center justify-between mb-6">
      <h2 class="text-base font-semibold text-gray-800">Chức danh</h2>
      <AppButton size="sm" @click="openCreate">+ Thêm chức danh</AppButton>
    </div>

    <AppTable :columns="columns" :rows="jobTitles" :loading="loading" empty-text="Chưa có chức danh">
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <AppButton size="xs" variant="secondary" @click="openEdit(row)">{{ $t('common.edit') }}</AppButton>
          <AppButton size="xs" variant="danger" @click="confirmDelete(row)">{{ $t('common.delete') }}</AppButton>
        </div>
      </template>
    </AppTable>

    <AppModal v-model="showModal" :title="editing ? 'Chỉnh sửa chức danh' : 'Thêm chức danh'" size="sm">
      <AppInput v-model="form.name" label="Tên chức danh" placeholder="VD: Senior Developer" required />
      <template #footer>
        <AppButton variant="secondary" @click="showModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" :disabled="!form.name" @click="save">{{ $t('common.save') }}</AppButton>
      </template>
    </AppModal>

    <AppModal v-model="showDeleteModal" title="Xóa chức danh" size="sm">
      <p class="text-sm text-gray-600">Xóa chức danh <strong>{{ selectedRow?.name }}</strong>?</p>
      <template #footer>
        <AppButton variant="secondary" @click="showDeleteModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton variant="danger" :loading="deleting" @click="doDelete">{{ $t('common.delete') }}</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { handleApiError } from '~/utils/error-handler'
import type { JobTitle } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Chức danh — Micro ERP' })

const toast = useToast()
const { post } = useApi()
const { user } = useAuth()

const loading  = ref(true)
const saving   = ref(false)
const deleting = ref(false)
const editing  = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const jobTitles   = ref<any[]>([])
const selectedRow = ref<any>(null)
const form = ref({ id: 0, name: '' })

const columns = [
  { key: 'name',    label: 'Tên chức danh' },
  { key: 'actions', label: '' },
]

function openCreate() {
  editing.value = false
  form.value = { id: 0, name: '' }
  showModal.value = true
}

function openEdit(row: any) {
  editing.value = true
  form.value = { id: row.id, name: row.name }
  showModal.value = true
}

function confirmDelete(row: any) {
  selectedRow.value = row
  showDeleteModal.value = true
}

async function save() {
  saving.value = true
  try {
    const endpoint = editing.value ? '/setting/update-job-title' : '/setting/create-job-title'
    await post(endpoint, { ...form.value, org_id: user.value?.organization_id })
    toast.success(editing.value ? 'Đã cập nhật' : 'Đã thêm chức danh')
    showModal.value = false
    await loadData()
  } catch (err) { toast.error(handleApiError(err)) }
  finally { saving.value = false }
}

async function doDelete() {
  if (!selectedRow.value) return
  deleting.value = true
  try {
    await post('/setting/delete-job-title', { id: selectedRow.value.id })
    toast.success('Đã xóa')
    showDeleteModal.value = false
    await loadData()
  } catch (err) { toast.error(handleApiError(err)) }
  finally { deleting.value = false }
}

async function loadData() {
  const res = await post<{ job_titles: JobTitle[] }>('/setting/get-job-titles', { org_id: user.value?.organization_id })
  jobTitles.value = res.data?.job_titles ?? []
}

onMounted(async () => {
  await loadData()
  loading.value = false
})
</script>
