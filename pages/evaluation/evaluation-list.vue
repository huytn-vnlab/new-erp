<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800">Đánh giá nhân viên</h2>
      <NuxtLink to="/evaluation/create-eval-user">
        <AppButton size="sm">+ Tạo đánh giá</AppButton>
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="card mb-4 flex flex-wrap gap-3">
      <AppSelect v-model="filterYear" :options="yearOptions" value-key="value" label-key="label" class="w-28" />
      <AppSelect
        v-model="filterQuarter"
        :options="[{value:'',label:'Tất cả'},{value:'1',label:'Q1'},{value:'2',label:'Q2'},{value:'3',label:'Q3'},{value:'4',label:'Q4'}]"
        value-key="value" label-key="label" class="w-28" placeholder="Quý"
      />
      <AppInput v-model="search" placeholder="Tìm nhân viên..." class="w-52" />
    </div>

    <AppTable
      :columns="columns"
      :rows="filteredRows"
      :loading="evaluationStore.loading"
      :empty-text="$t('common.noData')"
    >
      <template #cell-score="{ value }">
        <div class="flex items-center gap-2">
          <div class="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[80px]">
            <div class="bg-primary-500 h-1.5 rounded-full" :style="`width:${Math.min(value * 10, 100)}%`" />
          </div>
          <span class="text-sm font-semibold text-gray-800">{{ value }}/10</span>
        </div>
      </template>
      <template #cell-status="{ value }">
        <AppBadge :variant="value === 1 ? 'green' : 'yellow'">{{ value === 1 ? 'Hoàn thành' : 'Nháp' }}</AppBadge>
      </template>
      <template #cell-created_at="{ value }">{{ formatDate(value) }}</template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <NuxtLink :to="`/evaluation/eval-user-detail/${row.id}`">
            <AppButton size="xs" variant="ghost">Xem</AppButton>
          </NuxtLink>
          <NuxtLink :to="`/evaluation/edit-eval-user/${row.id}`">
            <AppButton size="xs" variant="secondary">{{ $t('common.edit') }}</AppButton>
          </NuxtLink>
        </div>
      </template>

      <template #footer>
        <AppPagination
          :current-page="evaluationStore.pagination.current_page"
          :total-row="evaluationStore.pagination.total_row"
          :row-per-page="evaluationStore.pagination.row_per_page"
          @change="evaluationStore.fetchEvaluations($event)"
        />
      </template>
    </AppTable>
  </div>
</template>

<script setup lang="ts">
import { useEvaluationStore } from '~/stores/evaluation'
import { formatDate, currentYear } from '~/utils/date'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'evaluation' } })
useHead({ title: 'Đánh giá — Micro ERP' })

const evaluationStore = useEvaluationStore()

const search       = ref('')
const filterYear   = ref(String(currentYear()))
const filterQuarter = ref('')

const yearOptions = Array.from({ length: 4 }, (_, i) => {
  const y = currentYear() - i
  return { value: String(y), label: String(y) }
})

const columns = [
  { key: 'user_name',  label: 'Nhân viên' },
  { key: 'period',     label: 'Kỳ đánh giá' },
  { key: 'score',      label: 'Điểm' },
  { key: 'status',     label: 'Trạng thái' },
  { key: 'created_at', label: 'Ngày tạo' },
  { key: 'actions',    label: '' },
]

const filteredRows = computed(() => {
  let rows = evaluationStore.evaluations
  if (search.value) rows = rows.filter(r => r.user_name?.toLowerCase().includes(search.value.toLowerCase()))
  if (filterQuarter.value) rows = rows.filter(r => String(r.quarter) === filterQuarter.value)
  return rows
})

onMounted(() => evaluationStore.fetchEvaluations())
</script>
