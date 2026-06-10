<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-base font-semibold text-gray-800">Quản lý ngày phép</h2>
      <AppButton size="sm" @click="openAdd">+ Cộng phép</AppButton>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-3">
        <AppSelect
          v-model="filters.userId"
          :options="memberOptions"
          value-key="id"
          label-key="full_name"
          placeholder="Tất cả nhân viên"
          class="w-56"
        />
        <AppSelect
          v-model="filters.year"
          :options="yearOptions"
          value-key="value"
          label-key="label"
          class="w-32"
        />
        <AppButton variant="secondary" size="sm" @click="loadData">Lọc</AppButton>
      </div>
    </div>

    <AppTable :columns="columns" :rows="leaves" :loading="loading" empty-text="Không có dữ liệu">
      <template #cell-total_days="{ row }">
        <span class="font-semibold text-primary-700">{{ row.total_days }}</span>
      </template>
      <template #cell-used_days="{ row }">
        <span class="text-orange-600">{{ row.used_days }}</span>
      </template>
      <template #cell-remaining_days="{ row }">
        <span :class="row.remaining_days < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-semibold'">
          {{ row.remaining_days }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <AppButton size="xs" variant="secondary" @click="openEdit(row)">Sửa</AppButton>
          <AppButton size="xs" variant="danger" @click="confirmDelete(row)">Xóa</AppButton>
        </div>
      </template>
    </AppTable>

    <!-- Add/Edit modal -->
    <AppModal v-model="showModal" :title="editing ? 'Sửa phép' : 'Cộng phép'" size="sm">
      <div class="space-y-4">
        <AppSelect
          v-model="form.user_id"
          :options="memberOptions"
          value-key="id"
          label-key="full_name"
          label="Nhân viên"
          required
          :disabled="editing"
        />
        <AppInput v-model.number="form.year" type="number" label="Năm" required />
        <AppInput v-model.number="form.total_days" type="number" label="Tổng ngày phép" required />
        <AppInput v-model="form.note" label="Ghi chú" placeholder="Lý do cộng phép..." />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" :disabled="!form.user_id || !form.year" @click="save">
          {{ $t('common.save') }}
        </AppButton>
      </template>
    </AppModal>

    <!-- Delete confirm -->
    <AppModal v-model="showDeleteModal" title="Xóa bản ghi phép" size="sm">
      <p class="text-sm text-gray-600">
        Xóa bản ghi phép của <strong>{{ selectedRow?.full_name }}</strong> năm {{ selectedRow?.year }}?
      </p>
      <template #footer>
        <AppButton variant="secondary" @click="showDeleteModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton variant="danger" :loading="deleting" @click="doDelete">{{ $t('common.delete') }}</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { useUserProfile } from '~/composables/useUserProfile'
import { handleApiError } from '~/utils/error-handler'
import { currentYear } from '~/utils/date'
import type { DayLeave } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Quản lý ngày phép — Micro ERP' })

const toast = useToast()
const { post } = useApi()
const { fetchMemberList } = useUserProfile()

const loading  = ref(true)
const saving   = ref(false)
const deleting = ref(false)
const editing  = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const leaves = ref<any[]>([])
const memberOptions = ref<any[]>([])
const selectedRow = ref<any>(null)

const filters = reactive({ userId: '', year: currentYear() })
const form = ref({ user_id: 0, year: currentYear(), total_days: 12, note: '' })

const yearOptions = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear() - 2 + i
  return { value: y, label: String(y) }
})

const columns = [
  { key: 'full_name',      label: 'Nhân viên' },
  { key: 'year',           label: 'Năm' },
  { key: 'total_days',     label: 'Tổng phép' },
  { key: 'used_days',      label: 'Đã dùng' },
  { key: 'remaining_days', label: 'Còn lại' },
  { key: 'note',           label: 'Ghi chú' },
  { key: 'actions',        label: '' },
]

function openAdd() {
  editing.value = false
  form.value = { user_id: 0, year: currentYear(), total_days: 12, note: '' }
  showModal.value = true
}

function openEdit(row: any) {
  editing.value = true
  form.value = { user_id: row.user_id, year: row.year, total_days: row.total_days, note: row.note ?? '' }
  showModal.value = true
}

function confirmDelete(row: any) {
  selectedRow.value = row
  showDeleteModal.value = true
}

async function save() {
  saving.value = true
  try {
    const endpoint = editing.value ? '/leave/update-day-leave' : '/leave/create-day-leave'
    await post(endpoint, { ...form.value })
    toast.success(editing.value ? 'Đã cập nhật' : 'Đã cộng phép')
    showModal.value = false
    await loadData()
  } catch (err) { toast.error(handleApiError(err)) }
  finally { saving.value = false }
}

async function doDelete() {
  if (!selectedRow.value) return
  deleting.value = true
  try {
    await post('/leave/delete-day-leave', { id: selectedRow.value.id })
    toast.success('Đã xóa')
    showDeleteModal.value = false
    await loadData()
  } catch (err) { toast.error(handleApiError(err)) }
  finally { deleting.value = false }
}

async function loadData() {
  loading.value = true
  try {
    const res = await post<{ leaves: DayLeave[] }>('/leave/get-day-leave-list', {
      user_id: filters.userId || undefined,
      year: filters.year,
    })
    leaves.value = res.data?.leaves ?? []
  } finally { loading.value = false }
}

onMounted(async () => {
  memberOptions.value = await fetchMemberList()
  await loadData()
})
</script>
