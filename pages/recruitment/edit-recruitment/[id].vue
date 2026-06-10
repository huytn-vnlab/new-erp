<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">Chỉnh sửa tin tuyển dụng</h2>

      <div v-if="loading" class="flex justify-center py-10"><AppSpinner /></div>

      <template v-else-if="initialValues">
        <AppAlert v-if="serverError" variant="error" dismissible class="mb-4">{{ serverError }}</AppAlert>

        <Form :validation-schema="schema" :initial-values="initialValues" @submit="onSubmit" v-slot="{ isSubmitting }">
          <div class="mb-4">
            <Field name="position" v-slot="{ field, errors }">
              <AppInput v-bind="field" label="Vị trí tuyển dụng" :error="errors[0]" required />
            </Field>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <Field name="quantity" v-slot="{ field, errors }">
              <AppInput v-bind="field" type="number" label="Số lượng" :error="errors[0]" required />
            </Field>
            <Field name="deadline" v-slot="{ componentField, errors }">
              <DatePicker v-bind="componentField" label="Hạn nộp" :error="errors[0]" />
            </Field>
          </div>
          <div class="mb-4">
            <Field name="salary_range" v-slot="{ field, errors }">
              <AppInput v-bind="field" label="Mức lương" :error="errors[0]" />
            </Field>
          </div>
          <div class="mb-4">
            <Field name="status" v-slot="{ field, errors }">
              <AppSelect
                v-bind="field"
                label="Trạng thái"
                :options="statusOptions"
                value-key="value"
                label-key="label"
                :error="errors[0]"
              />
            </Field>
          </div>
          <div class="mb-6">
            <Field name="description" v-slot="{ field, errors }">
              <div>
                <label class="form-label">Mô tả công việc <span class="text-red-500">*</span></label>
                <textarea v-bind="field" rows="6"
                  :class="['form-input resize-none', errors[0] && 'border-red-400']" />
                <p v-if="errors[0]" class="form-error">{{ errors[0] }}</p>
              </div>
            </Field>
          </div>
          <div class="flex justify-end gap-3">
            <AppButton variant="secondary" type="button" @click="$router.back()">{{ $t('common.cancel') }}</AppButton>
            <AppButton type="submit" :loading="isSubmitting">{{ $t('common.save') }}</AppButton>
          </div>
        </Form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useRecruitment } from '~/composables/useRecruitment'
import type { Recruitment } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'recruitment' } })
useHead({ title: 'Chỉnh sửa tuyển dụng — Micro ERP' })

const route  = useRoute()
const router = useRouter()
const { post } = useApi()
const { updateRecruitment } = useRecruitment()

const loading       = ref(true)
const serverError   = ref('')
const initialValues = ref<any>(null)

const statusOptions = [
  { value: 1, label: 'Đang tuyển' },
  { value: 2, label: 'Đã tuyển đủ' },
  { value: 0, label: 'Tạm dừng' },
]

const schema = toTypedSchema(z.object({
  position:    z.string().min(2),
  quantity:    z.coerce.number().min(1),
  deadline:    z.string().optional(),
  salary_range:z.string().optional(),
  status:      z.coerce.number(),
  description: z.string().min(10),
}))

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) { router.replace('/recruitment/manage-recruitment'); return }
  try {
    const res = await post<{ recruitment: Recruitment }>('/recruitment/get-recruitment', { id })
    const job = res.data?.recruitment
    if (!job) { router.replace('/recruitment/manage-recruitment'); return }
    initialValues.value = {
      position:     job.position,
      quantity:     job.quantity,
      deadline:     job.deadline ?? '',
      salary_range: job.salary_range ?? '',
      status:       job.status,
      description:  job.description,
    }
  } catch {
    serverError.value = 'Không thể tải thông tin tuyển dụng.'
  } finally {
    loading.value = false
  }
})

async function onSubmit(values: any) {
  serverError.value = ''
  try {
    await updateRecruitment(Number(route.params.id), values)
    router.push(`/recruitment/view-recruitment/${route.params.id}`)
  } catch {
    serverError.value = 'Lưu không thành công, vui lòng thử lại.'
  }
}
</script>
