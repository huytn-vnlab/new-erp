<template>
  <div class="max-w-3xl mx-auto">
    <div v-if="loading" class="flex justify-center py-16"><AppSpinner /></div>

    <template v-else-if="evaluation">
      <!-- Header -->
      <div class="card mb-4">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Phiếu đánh giá</h2>
            <p class="text-sm text-gray-500 mt-0.5">{{ evaluation.period }} — {{ evaluation.year }}</p>
          </div>
          <div class="flex gap-2">
            <NuxtLink :to="`/evaluation/edit-eval-user/${evaluation.id}`">
              <AppButton size="sm" variant="secondary">{{ $t('common.edit') }}</AppButton>
            </NuxtLink>
            <span
              class="badge self-center"
              :class="evaluation.status === 1 ? 'badge-success' : 'badge-warning'"
            >
              {{ evaluation.status === 1 ? 'Đã gửi' : 'Nháp' }}
            </span>
          </div>
        </div>

        <!-- Employee -->
        <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span class="text-sm font-bold text-primary-700">{{ getInitials(evaluation.full_name ?? '') }}</span>
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ evaluation.full_name }}</p>
            <p class="text-sm text-gray-500">{{ evaluation.email }}</p>
          </div>
        </div>
      </div>

      <!-- Scores -->
      <div class="card mb-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Điểm đánh giá</h3>
        <div class="space-y-4">
          <div v-for="criterion in criteria" :key="criterion.key">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-700">{{ criterion.label }}</span>
              <span class="text-sm font-bold text-primary-700">{{ scoreOf(criterion.key) }}/10</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-500 rounded-full transition-all"
                :style="{ width: (scoreOf(criterion.key) * 10) + '%' }"
              />
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span class="font-semibold text-gray-700">Điểm tổng</span>
          <div class="text-right">
            <span class="text-3xl font-bold text-primary-700">{{ evaluation.total_score?.toFixed(1) }}</span>
            <span class="text-gray-400 text-lg">/10</span>
          </div>
        </div>
      </div>

      <!-- Comment -->
      <div v-if="evaluation.comment" class="card mb-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">Nhận xét</h3>
        <p class="text-sm text-gray-600 whitespace-pre-line">{{ evaluation.comment }}</p>
      </div>

      <div>
        <AppButton variant="secondary" @click="$router.back()">← Quay lại</AppButton>
      </div>
    </template>

    <div v-else class="card text-center py-12 text-sm text-gray-400">Không tìm thấy phiếu đánh giá</div>
  </div>
</template>

<script setup lang="ts">
import { getInitials } from '~/utils/format'
import type { Evaluation } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'evaluation' } })
useHead({ title: 'Chi tiết đánh giá — Micro ERP' })

const route = useRoute()
const { post } = useApi()

const loading    = ref(true)
const evaluation = ref<any>(null)

const criteria = [
  { key: 'performance',   label: 'Hiệu suất công việc' },
  { key: 'quality',       label: 'Chất lượng sản phẩm' },
  { key: 'teamwork',      label: 'Làm việc nhóm' },
  { key: 'communication', label: 'Giao tiếp' },
  { key: 'initiative',    label: 'Sáng kiến & chủ động' },
]

function scoreOf(key: string): number {
  return evaluation.value?.scores?.[key] ?? 0
}

onMounted(async () => {
  try {
    const res = await post<{ evaluation: Evaluation }>('/evaluation/get-evaluation-detail', { id: Number(route.params.id) })
    evaluation.value = res.data?.evaluation ?? null
  } finally { loading.value = false }
})
</script>
