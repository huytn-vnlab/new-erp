<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">Đăng ký làm thêm giờ</h2>

      <AppAlert v-if="serverError" variant="error" dismissible class="mb-4">{{ serverError }}</AppAlert>

      <Form :validation-schema="schema" @submit="onSubmit" v-slot="{ isSubmitting }">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <!-- From datetime -->
          <Field name="datetime_overtime_from" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="datetime-local" label="Thời gian bắt đầu OT" :error="errors[0]" required />
          </Field>

          <!-- To datetime -->
          <Field name="datetime_overtime_to" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="datetime-local" label="Thời gian kết thúc OT" :error="errors[0]" required />
          </Field>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <!-- OT type -->
          <Field name="overtime_type" v-slot="{ field, errors }">
            <div>
              <label class="form-label">Loại OT</label>
              <select v-bind="field" class="form-input">
                <option value="">-- Chọn loại OT --</option>
                <option v-for="(label, id) in otStore.overtimeTypes" :key="id" :value="id">{{ label }}</option>
              </select>
              <p v-if="errors[0]" class="form-error">{{ errors[0] }}</p>
            </div>
          </Field>

          <!-- Project -->
          <Field name="project_id" v-slot="{ field, errors }">
            <div>
              <label class="form-label">Dự án</label>
              <select v-bind="field" class="form-input">
                <option value="">-- Chọn dự án --</option>
                <option v-for="(label, id) in otStore.projects" :key="id" :value="id">{{ label }}</option>
              </select>
              <p v-if="errors[0]" class="form-error">{{ errors[0] }}</p>
            </div>
          </Field>
        </div>

        <!-- Reason -->
        <div class="mb-6">
          <Field name="reason" v-slot="{ field, errors }">
            <div>
              <label class="form-label">Lý do <span class="text-red-500">*</span></label>
              <textarea
                v-bind="field"
                rows="4"
                :class="['form-input resize-none', errors[0] && 'border-red-400']"
                placeholder="Nhập lý do làm thêm giờ..."
              />
              <p v-if="errors[0]" class="form-error">{{ errors[0] }}</p>
            </div>
          </Field>
        </div>

        <div class="flex justify-end gap-3">
          <AppButton variant="secondary" type="button" @click="$router.back()">{{ $t('common.cancel') }}</AppButton>
          <AppButton type="submit" :loading="isSubmitting">Gửi yêu cầu</AppButton>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useOvertime } from '~/composables/useOvertime'
import { useOvertimeStore } from '~/stores/overtime'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'module-role'],
  meta: { module: 'overtime' },
})

useHead({ title: 'Đăng ký OT — Micro ERP' })

const router = useRouter()
const { createOvertimeRequest } = useOvertime()
const otStore = useOvertimeStore()
const serverError = ref('')

const schema = toTypedSchema(
  z.object({
    datetime_overtime_from: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
    datetime_overtime_to:   z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
    reason:                 z.string().min(5, 'Vui lòng nhập lý do (ít nhất 5 ký tự)'),
    overtime_type:          z.string().optional(),
    project_id:             z.string().optional(),
  }).refine(d => d.datetime_overtime_from < d.datetime_overtime_to, {
    message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
    path: ['datetime_overtime_to'],
  })
)

async function onSubmit(values: any) {
  serverError.value = ''
  try {
    await createOvertimeRequest({
      datetime_overtime_from: values.datetime_overtime_from,
      datetime_overtime_to:   values.datetime_overtime_to,
      reason:                 values.reason,
      overtime_type:          values.overtime_type ? Number(values.overtime_type) : undefined,
      project_id:             values.project_id    ? Number(values.project_id)    : undefined,
    })
    router.push('/request/manage-overtime')
  } catch {
    serverError.value = 'Gửi yêu cầu không thành công, vui lòng thử lại.'
  }
}

onMounted(() => {
  // Load overtime types and projects if not already loaded
  if (!Object.keys(otStore.overtimeTypes).length) otStore.fetchRequests(1, 1)
})
</script>
