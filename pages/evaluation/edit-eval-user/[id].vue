<template>
  <div class="max-w-3xl mx-auto">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">Chỉnh sửa phiếu đánh giá</h2>

      <AppAlert v-if="serverError" variant="error" dismissible class="mb-4">{{ serverError }}</AppAlert>

      <div v-if="loading" class="flex justify-center py-12"><AppSpinner /></div>

      <Form v-else :validation-schema="schema" :initial-values="initialValues" @submit="onSubmit" v-slot="{ isSubmitting }">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="period" v-slot="{ field, errors }">
            <AppInput v-bind="field" label="Kỳ đánh giá" :error="errors[0]" required />
          </Field>
          <Field name="year" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="number" label="Năm" :error="errors[0]" required />
          </Field>
        </div>

        <div class="mb-4">
          <Field name="quarter" v-slot="{ field, errors }">
            <AppSelect
              v-bind="field"
              label="Quý"
              :options="[{value:1,label:'Q1'},{value:2,label:'Q2'},{value:3,label:'Q3'},{value:4,label:'Q4'}]"
              value-key="value"
              label-key="label"
              :error="errors[0]"
            />
          </Field>
        </div>

        <!-- Criteria scores -->
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Tiêu chí đánh giá</h3>
          <div class="space-y-3">
            <div v-for="criterion in criteria" :key="criterion.key" class="flex items-center gap-4">
              <span class="text-sm text-gray-700 w-48 shrink-0">{{ criterion.label }}</span>
              <div class="flex-1 flex items-center gap-3">
                <input
                  v-model.number="scores[criterion.key]"
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  class="flex-1 h-2 rounded-full accent-primary-600"
                />
                <span class="text-sm font-bold text-primary-700 w-8 text-right">{{ scores[criterion.key] }}</span>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span class="text-sm font-semibold text-gray-700">Điểm tổng</span>
            <span class="text-2xl font-bold text-primary-700">{{ averageScore.toFixed(1) }}/10</span>
          </div>
        </div>

        <!-- Comment -->
        <div class="mb-6">
          <Field name="comment" v-slot="{ field, errors }">
            <div>
              <label class="form-label">Nhận xét chung</label>
              <textarea v-bind="field" rows="4" class="form-input resize-none" placeholder="Nhận xét về hiệu suất..." />
              <p v-if="errors[0]" class="form-error">{{ errors[0] }}</p>
            </div>
          </Field>
        </div>

        <div class="flex justify-end gap-3">
          <AppButton variant="secondary" type="button" @click="$router.back()">{{ $t('common.cancel') }}</AppButton>
          <AppButton type="submit" :loading="isSubmitting">{{ $t('common.save') }}</AppButton>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { handleApiError } from '~/utils/error-handler'
import type { Evaluation } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'evaluation' } })
useHead({ title: 'Sửa đánh giá — Micro ERP' })

const route  = useRoute()
const router = useRouter()
const toast  = useToast()
const { post } = useApi()

const loading = ref(true)
const serverError = ref('')
const initialValues = ref<any>(null)

const criteria = [
  { key: 'performance',   label: 'Hiệu suất công việc' },
  { key: 'quality',       label: 'Chất lượng sản phẩm' },
  { key: 'teamwork',      label: 'Làm việc nhóm' },
  { key: 'communication', label: 'Giao tiếp' },
  { key: 'initiative',    label: 'Sáng kiến & chủ động' },
]

const scores = reactive(Object.fromEntries(criteria.map(c => [c.key, 5])))

const averageScore = computed(() => {
  const vals = Object.values(scores) as number[]
  return vals.reduce((a, b) => a + b, 0) / vals.length
})

const schema = toTypedSchema(z.object({
  period:  z.string().min(1, 'Nhập kỳ đánh giá'),
  year:    z.coerce.number().min(2020).max(2100),
  quarter: z.coerce.number().optional(),
  comment: z.string().optional(),
}))

async function onSubmit(values: any) {
  serverError.value = ''
  try {
    await post('/evaluation/update-evaluation', {
      ...values,
      id: Number(route.params.id),
      scores: { ...scores },
      total_score: averageScore.value,
    })
    toast.success('Đã cập nhật phiếu đánh giá')
    router.push('/evaluation/evaluation-list')
  } catch (err) {
    serverError.value = handleApiError(err)
  }
}

onMounted(async () => {
  try {
    const res = await post<{ evaluation: Evaluation }>('/evaluation/get-evaluation-detail', { id: Number(route.params.id) })
    const ev  = (res.data?.evaluation ?? {}) as Partial<Evaluation>
    initialValues.value = {
      period:  ev.period ?? '',
      year:    ev.year ?? new Date().getFullYear(),
      quarter: ev.quarter ?? '',
      comment: ev.comment ?? '',
    }
    if (ev.scores) {
      Object.assign(scores, ev.scores)
    }
  } finally { loading.value = false }
})
</script>
