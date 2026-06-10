<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">Tạo tin tuyển dụng</h2>

      <AppAlert v-if="serverError" variant="error" dismissible class="mb-4">{{ serverError }}</AppAlert>

      <Form :validation-schema="schema" @submit="onSubmit" v-slot="{ isSubmitting }">
        <!-- Job name -->
        <div class="mb-4">
          <Field name="job_name" v-slot="{ field, errors }">
            <AppInput
              v-bind="field"
              label="Tên vị trí tuyển dụng"
              placeholder="VD: Frontend Developer"
              :error="errors[0]"
              required
            />
          </Field>
        </div>

        <!-- Start / Expiry dates -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <Field name="start_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày bắt đầu" :error="errors[0]" required />
          </Field>
          <Field name="expiry_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Hạn nộp hồ sơ" :error="errors[0]" required />
          </Field>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <AppButton variant="secondary" type="button" @click="$router.back()">{{ $t('common.cancel') }}</AppButton>
          <AppButton type="submit" :loading="isSubmitting">Đăng tin</AppButton>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useRecruitment } from '~/composables/useRecruitment'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'recruitment' } })
useHead({ title: 'Tạo tin tuyển dụng — Micro ERP' })

const router = useRouter()
const { createRecruitment } = useRecruitment()
const serverError = ref('')

const schema = toTypedSchema(z.object({
  job_name:    z.string().min(2, 'Vui lòng nhập tên vị trí tuyển dụng'),
  start_date:  z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  expiry_date: z.string().min(1, 'Vui lòng chọn hạn nộp hồ sơ'),
}).refine(d => d.start_date <= d.expiry_date, {
  message: 'Hạn nộp hồ sơ phải sau hoặc bằng ngày bắt đầu',
  path: ['expiry_date'],
}))

async function onSubmit(values: any) {
  serverError.value = ''
  try {
    await createRecruitment({
      job_name:    values.job_name,
      start_date:  values.start_date,
      expiry_date: values.expiry_date,
      branch_ids:  [],   // can be expanded later with a branch picker
      assignees:   [],
    })
    router.push('/recruitment/manage-recruitment')
  } catch {
    serverError.value = 'Tạo tin tuyển dụng không thành công.'
  }
}
</script>
