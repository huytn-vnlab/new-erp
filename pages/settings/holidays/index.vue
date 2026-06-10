<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-base font-semibold text-gray-800">Ngày nghỉ lễ {{ currentYear }}</h2>
      <div class="flex gap-2">
        <AppSelect v-model="selectedYear" :options="yearOptions" value-key="value" label-key="label" class="w-28" />
        <AppButton size="sm" @click="showAddModal = true">+ Thêm ngày lễ</AppButton>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12"><AppSpinner /></div>

    <!-- Calendar-style list grouped by month -->
    <div v-else class="space-y-4">
      <div v-for="(group, month) in groupedHolidays" :key="month" class="card">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Tháng {{ month }}</h3>
        <ul class="divide-y divide-gray-100">
          <li v-for="h in group" :key="h.id" class="py-2.5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-8 text-center text-lg font-bold text-primary-600">{{ h.day }}</span>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ h.name }}</p>
                <p class="text-xs text-gray-400">{{ formatDate(h.date) }}</p>
              </div>
            </div>
            <AppButton size="xs" variant="danger" @click="deleteHoliday(h)">Xóa</AppButton>
          </li>
        </ul>
      </div>
      <div v-if="Object.keys(groupedHolidays).length === 0" class="card text-center py-8 text-sm text-gray-400">
        Chưa có ngày lễ nào cho năm {{ selectedYear }}
      </div>
    </div>

    <!-- Add holiday modal -->
    <AppModal v-model="showAddModal" title="Thêm ngày lễ" size="sm">
      <div class="space-y-3">
        <AppInput v-model="newHoliday.name" label="Tên ngày lễ" placeholder="VD: Tết Nguyên Đán" required />
        <DatePicker v-model="newHoliday.date" label="Ngày" required />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showAddModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" :disabled="!newHoliday.name || !newHoliday.date" @click="addHoliday">
          {{ $t('common.save') }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { useHolidayStore } from '~/stores/holiday'
import { formatDate, currentYear } from '~/utils/date'
import { handleApiError } from '~/utils/error-handler'
import dayjs from 'dayjs'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Ngày lễ — Micro ERP' })

const holidayStore = useHolidayStore()
const toast = useToast()
const { post } = useApi()
const { user } = useAuth()

const loading     = ref(true)
const saving      = ref(false)
const showAddModal = ref(false)
const selectedYear = ref(String(currentYear()))
const newHoliday  = ref({ name: '', date: '' })

const yearOptions = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear() - 1 + i
  return { value: String(y), label: String(y) }
})

// Parse holiday strings into objects with day/month/name
const parsedHolidays = computed(() =>
  (holidayStore.holidays as any[]).map((h: any) => ({
    id:   h.id ?? h.date,
    date: typeof h === 'string' ? h : h.date,
    name: typeof h === 'string' ? h : h.name,
    day:  dayjs(typeof h === 'string' ? h : h.date).date(),
    month: dayjs(typeof h === 'string' ? h : h.date).month() + 1,
  }))
)

const groupedHolidays = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const h of parsedHolidays.value) {
    const key = String(h.month)
    ;(groups[key] ??= []).push(h)
  }
  return groups
})

watch(selectedYear, async (year) => {
  loading.value = true
  await holidayStore.fetchHolidays(user.value?.organization_id ?? 0, Number(year))
  loading.value = false
})

async function addHoliday() {
  saving.value = true
  try {
    await post('/holiday/create-holiday', {
      org_id: user.value?.organization_id,
      name: newHoliday.value.name,
      date: newHoliday.value.date,
    })
    toast.success('Đã thêm ngày lễ')
    showAddModal.value = false
    newHoliday.value = { name: '', date: '' }
    await holidayStore.fetchHolidays(user.value?.organization_id ?? 0, Number(selectedYear.value))
  } catch (err) {
    toast.error(handleApiError(err))
  } finally { saving.value = false }
}

async function deleteHoliday(h: any) {
  try {
    await post('/holiday/delete-holiday', { id: h.id, org_id: user.value?.organization_id })
    toast.success('Đã xóa ngày lễ')
    await holidayStore.fetchHolidays(user.value?.organization_id ?? 0, Number(selectedYear.value))
  } catch (err) {
    toast.error(handleApiError(err))
  }
}

onMounted(async () => {
  await holidayStore.fetchHolidays(user.value?.organization_id ?? 0, Number(selectedYear.value))
  loading.value = false
})
</script>
