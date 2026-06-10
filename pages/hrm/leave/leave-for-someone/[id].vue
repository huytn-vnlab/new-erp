<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">Tạo phép cho nhân viên</h2>

      <AppAlert v-if="serverError" variant="error" dismissible class="mb-4">{{ serverError }}</AppAlert>

      <div v-if="loading" class="flex justify-center py-12"><AppSpinner /></div>

      <template v-else>
        <!-- Target user info -->
        <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-6">
          <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span class="text-sm font-bold text-primary-700">{{ getInitials(targetUser?.full_name ?? '') }}</span>
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ targetUser?.full_name }}</p>
            <p class="text-sm text-gray-500">{{ targetUser?.email }}</p>
          </div>
        </div>

        <Form :validation-schema="schema" @submit="onSubmit" v-slot="{ isSubmitting }">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field name="leave_type_id" v-slot="{ field, errors }">
              <AppSelect
                v-bind="field"
                label="Loại nghỉ phép"
                :options="leaveTypes"
                value-key="id"
                label-key="name"
                placeholder="Chọn loại phép..."
                :error="errors[0]"
                required
              />
            </Field>

            <div class="flex flex-col justify-end">
              <p class="text-sm text-gray-500">
                Số phép còn lại:
                <span class="font-semibold text-primary-700 ml-1">{{ leaveBalance }} ngày</span>
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field name="start_date" v-slot="{ componentField, errors }">
              <DatePicker
                v-bind="componentField"
                label="Ngày bắt đầu"
                :error="errors[0]"
                required
                @update:model-value="startDate = $event"
              />
            </Field>
            <Field name="end_date" v-slot="{ componentField, errors }">
              <DatePicker
                v-bind="componentField"
                label="Ngày kết thúc"
                :error="errors[0]"
                required
                @update:model-value="endDate = $event"
              />
            </Field>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-500">
              Số ngày làm việc:
              <span class="font-semibold text-primary-700 ml-1">{{ workingDays }} ngày</span>
            </p>
          </div>

          <div class="mb-4">
            <Field name="reason" v-slot="{ field, errors }">
              <div>
                <label class="form-label">Lý do</label>
                <textarea v-bind="field" rows="3" class="form-input resize-none" placeholder="Lý do xin nghỉ..." />
                <p v-if="errors[0]" class="form-error">{{ errors[0] }}</p>
              </div>
            </Field>
          </div>

          <div class="flex justify-end gap-3">
            <AppButton variant="secondary" type="button" @click="$router.back()">{{ $t('common.cancel') }}</AppButton>
            <AppButton type="submit" :loading="isSubmitting">Tạo phép</AppButton>
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
import { getInitials } from '~/utils/format'
import { getWorkingDays } from '~/utils/date'
import { handleApiError } from '~/utils/error-handler'
import type { UserProfile, LeaveType } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Tạo phép cho nhân viên — Micro ERP' })

const route  = useRoute()
const router = useRouter()
const toast  = useToast()
const { post } = useApi()

const loading     = ref(true)
const serverError = ref('')
const targetUser  = ref<any>(null)
const leaveTypes  = ref<any[]>([])
const leaveBalance = ref(0)

const schema = toTypedSchema(z.object({
  leave_type_id: z.coerce.number().min(1, 'Chọn loại phép'),
  start_date:    z.string().min(1, 'Chọn ngày bắt đầu'),
  end_date:      z.string().min(1, 'Chọn ngày kết thúc'),
  reason:        z.string().optional(),
}))

const startDate = ref('')
const endDate   = ref('')
const workingDays = computed(() => {
  if (!startDate.value || !endDate.value) return 0
  return getWorkingDays(new Date(startDate.value), new Date(endDate.value))
})

async function onSubmit(values: any) {
  serverError.value = ''
  try {
    await post('/leave/create-leave-for-someone', {
      ...values,
      user_id: Number(route.params.id),
      days: workingDays.value,
    })
    toast.success('Đã tạo phép')
    router.push('/hrm/leave/manage-leave-request')
  } catch (err) {
    serverError.value = handleApiError(err)
  }
}

onMounted(async () => {
  try {
    const userId = Number(route.params.id)
    const [profileRes, typesRes, balanceRes] = await Promise.all([
      post<{ profile: UserProfile }>('/user/get-user-profile', { user_id: userId }),
      post<{ leave_types: LeaveType[] }>('/leave/get-leave-types', {}),
      post<{ remaining_days: number }>('/leave/get-leave-balance', { user_id: userId }),
    ])
    targetUser.value  = profileRes.data?.profile ?? null
    leaveTypes.value  = typesRes.data?.leave_types ?? []
    leaveBalance.value = balanceRes.data?.remaining_days ?? 0
  } finally { loading.value = false }
})
</script>
