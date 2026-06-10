<template>
  <div>
    <h2 class="text-base font-semibold text-gray-800 mb-6">Cài đặt tăng ca</h2>

    <div v-if="loading" class="flex justify-center py-12"><AppSpinner /></div>

    <div v-else class="card max-w-xl">
      <AppAlert v-if="successMsg" variant="success" class="mb-4">{{ successMsg }}</AppAlert>

      <Form :validation-schema="schema" :initial-values="settings" @submit="onSubmit" v-slot="{ isSubmitting }">
        <div class="space-y-5 mb-6">
          <Field name="max_hours_per_day" v-slot="{ field, errors }">
            <AppInput
              v-bind="field"
              type="number"
              label="Số giờ OT tối đa / ngày"
              :error="errors[0]"
              required
            />
          </Field>

          <Field name="max_hours_per_month" v-slot="{ field, errors }">
            <AppInput
              v-bind="field"
              type="number"
              label="Số giờ OT tối đa / tháng"
              :error="errors[0]"
              required
            />
          </Field>

          <Field name="multiplier_weekday" v-slot="{ field, errors }">
            <AppInput
              v-bind="field"
              type="number"
              step="0.1"
              label="Hệ số ngày thường"
              placeholder="1.5"
              :error="errors[0]"
            />
          </Field>

          <Field name="multiplier_weekend" v-slot="{ field, errors }">
            <AppInput
              v-bind="field"
              type="number"
              step="0.1"
              label="Hệ số ngày cuối tuần"
              placeholder="2.0"
              :error="errors[0]"
            />
          </Field>

          <Field name="multiplier_holiday" v-slot="{ field, errors }">
            <AppInput
              v-bind="field"
              type="number"
              step="0.1"
              label="Hệ số ngày lễ"
              placeholder="3.0"
              :error="errors[0]"
            />
          </Field>

          <div class="flex items-center gap-3">
            <input id="require_approval" v-model="requireApproval" type="checkbox" class="h-4 w-4 rounded text-primary-600 border-gray-300" />
            <label for="require_approval" class="text-sm text-gray-700">Yêu cầu duyệt OT</label>
          </div>
        </div>

        <AppButton type="submit" :loading="isSubmitting">{{ $t('common.save') }}</AppButton>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { handleApiError } from '~/utils/error-handler'

type OvertimeSettings = {
  max_hours_per_day: number
  max_hours_per_month: number
  multiplier_weekday: number
  multiplier_weekend: number
  multiplier_holiday: number
  require_approval: boolean
}

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Cài đặt OT — Micro ERP' })

const toast = useToast()
const { post } = useApi()

const loading      = ref(true)
const successMsg   = ref('')
const settings     = ref<any>(null)
const requireApproval = ref(true)

const schema = toTypedSchema(z.object({
  max_hours_per_day:   z.coerce.number().min(1).max(24),
  max_hours_per_month: z.coerce.number().min(1).max(200),
  multiplier_weekday:  z.coerce.number().min(1).optional(),
  multiplier_weekend:  z.coerce.number().min(1).optional(),
  multiplier_holiday:  z.coerce.number().min(1).optional(),
}))

async function onSubmit(values: any) {
  successMsg.value = ''
  try {
    await post('/setting/update-overtime-settings', { ...values, require_approval: requireApproval.value })
    successMsg.value = 'Đã lưu cài đặt OT'
    toast.success('Đã lưu cài đặt OT')
  } catch (err) { toast.error(handleApiError(err)) }
}

onMounted(async () => {
  try {
    const res = await post<{ settings: OvertimeSettings }>('/setting/get-overtime-settings', {})
    const s = (res.data?.settings ?? {}) as Partial<OvertimeSettings>
    settings.value = {
      max_hours_per_day:   s.max_hours_per_day   ?? 4,
      max_hours_per_month: s.max_hours_per_month ?? 40,
      multiplier_weekday:  s.multiplier_weekday  ?? 1.5,
      multiplier_weekend:  s.multiplier_weekend  ?? 2.0,
      multiplier_holiday:  s.multiplier_holiday  ?? 3.0,
    }
    requireApproval.value = s.require_approval ?? true
  } finally { loading.value = false }
})
</script>
