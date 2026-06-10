<template>
  <div class="max-w-2xl mx-auto">
    <Card>
      <CardHeader>
        <CardTitle>{{ $t('hrm.leave.create.title') }}</CardTitle>
      </CardHeader>
      <Form :validation-schema="schema" @submit="onSubmit" v-slot="{ isSubmitting }">
        <CardContent>
          <!-- Leave balance info -->
          <div v-if="leaveStore.leaveInfo" class="mb-6 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 flex flex-wrap gap-4">
            <div v-for="item in leaveBalance" :key="item.label" class="flex flex-col">
              <span class="text-xs text-blue-500 font-medium">{{ item.label }}</span>
              <span class="text-xl font-bold text-blue-800">{{ item.value }}</span>
            </div>
          </div>

          <!-- Server error alert -->
          <Alert v-if="serverError" variant="destructive" class="mb-4">
            <AlertDescription>{{ serverError }}</AlertDescription>
          </Alert>

          <!-- Leave type -->
          <div class="mb-4">
            <Field name="leave_request_type_id" v-slot="{ field, errors }">
              <div>
                <label class="text-sm font-medium block mb-1">
                  {{ $t('leave.type') }} <span class="text-destructive">*</span>
                </label>
                <Select
                  :model-value="field.value"
                  @update:model-value="field.onChange"
                >
                  <SelectTrigger :class="errors[0] ? 'border-destructive' : ''">
                    <SelectValue :placeholder="$t('leave.type')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in leaveTypeOptions"
                      :key="opt.value"
                      :value="String(opt.value)"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </div>
            </Field>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <!-- Start date -->
            <Field name="datetime_leave_from" v-slot="{ componentField, errors }">
              <DatePicker
                v-bind="componentField"
                :label="$t('leave.startDate')"
                :error="errors[0]"
                required
                @update:model-value="startDate = $event"
              />
            </Field>

            <!-- End date -->
            <Field name="datetime_leave_to" v-slot="{ componentField, errors }">
              <DatePicker
                v-bind="componentField"
                :label="$t('leave.endDate')"
                :error="errors[0]"
                required
                @update:model-value="endDate = $event"
              />
            </Field>
          </div>

          <!-- Reason -->
          <div class="mb-6">
            <Field name="reason" v-slot="{ field, errors }">
              <div>
                <label class="text-sm font-medium block mb-1">
                  {{ $t('leave.reason') }} <span class="text-destructive">*</span>
                </label>
                <Textarea
                  v-bind="field"
                  rows="4"
                  :class="['resize-none', errors[0] ? 'border-destructive' : '']"
                  :placeholder="$t('leave.reason')"
                />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </div>
            </Field>
          </div>

          <!-- Working days preview -->
          <div v-if="workingDays > 0" class="mb-6 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
            <Calendar class="h-4 w-4 text-gray-400 shrink-0" />
            {{ $t('hrm.leave.create.workingDaysLabel') }}: <strong class="text-gray-900">{{ workingDays }} {{ $t('hrm.leave.create.days') }}</strong>
          </div>
        </CardContent>
        <CardFooter class="justify-end gap-3 px-6 pt-0">
          <Button variant="outline" type="button" @click="router.back()">{{ $t('common.cancel') }}</Button>
          <Button type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">{{ $t('common.loading') }}</span>
            <span v-else>{{ $t('leave.submit') }}</span>
          </Button>
        </CardFooter>
      </Form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Calendar } from 'lucide-vue-next'
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useLeaveStore } from '~/stores/leave'
import { useLeave } from '~/composables/useLeave'
import { getWorkingDays } from '~/utils/date'
import Card from '~/components/ui/Card.vue'
import CardHeader from '~/components/ui/CardHeader.vue'
import CardTitle from '~/components/ui/CardTitle.vue'
import CardContent from '~/components/ui/CardContent.vue'
import CardFooter from '~/components/ui/CardFooter.vue'
import DatePicker from '~/components/ui/DatePicker.vue'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '~/components/ui/select'
import { Alert, AlertDescription } from '~/components/ui/alert'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'module-role'],
  meta: { module: 'leave' },
})

const { t } = useI18n()
useHead({ title: computed(() => `${t('hrm.leave.create.title')} — Micro ERP`) })

const router     = useRouter()
const leaveStore = useLeaveStore()
const { createLeaveRequest } = useLeave()

const serverError  = ref('')

// ── Leave balance summary ─────────────────────────────────────────────────────
const leaveBalance = computed(() => {
  const info = leaveStore.leaveInfo
  if (!info) return []
  return [
    { label: t('hrm.leave.create.remaining'),    value: info.day_remaining ?? '—' },
    { label: t('hrm.leave.create.used'),         value: info.day_used ?? '—' },
    { label: t('hrm.leave.create.fromPrevYear'), value: info.day_remaining_previous ?? 0 },
  ]
})

// Leave type options
const leaveTypeOptions = computed(() => {
  const types = leaveStore.leaveRequestTypes
  const entries = types ? Object.entries(types) : []
  if (entries.length > 0) {
    return entries.map(([k, v]) => ({ value: Number(k), label: v as string }))
  }
  return [
    { value: 1, label: 'Full day off' },
    { value: 2, label: 'Morning off' },
    { value: 3, label: 'Afternoon off' },
    { value: 4, label: 'Late for work' },
    { value: 5, label: 'Leave early' },
    { value: 6, label: 'Go outside' },
    { value: 7, label: 'Work at home' },
    { value: 8, label: 'Business trip' },
    { value: 9, label: 'Other leave' },
  ]
})

// ── Working days preview ──────────────────────────────────────────────────────
const startDate   = ref('')
const endDate     = ref('')
const workingDays = computed(() =>
  startDate.value && endDate.value && endDate.value >= startDate.value
    ? getWorkingDays(startDate.value, endDate.value)
    : 0
)

// ── Validation schema ─────────────────────────────────────────────────────────
const schema = toTypedSchema(
  z.object({
    leave_request_type_id: z.string().min(1, 'Vui lòng chọn loại nghỉ'),
    datetime_leave_from:   z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
    datetime_leave_to:     z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
    reason:                z.string().min(5, 'Vui lòng nhập lý do (ít nhất 5 ký tự)'),
  }).refine(d => !d.datetime_leave_to || !d.datetime_leave_from || d.datetime_leave_to >= d.datetime_leave_from, {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['datetime_leave_to'],
  })
)

async function onSubmit(values: any) {
  serverError.value = ''
  try {
    await createLeaveRequest({
      leave_request_type_id: Number(values.leave_request_type_id),
      datetime_leave_from:   values.datetime_leave_from,
      datetime_leave_to:     values.datetime_leave_to,
      reason:                values.reason,
    })
    router.push('/hrm/leave/history-user-leave')
  } catch {
    serverError.value = t('hrm.leave.create.submitError')
  }
}

onMounted(() => { if (!leaveStore.leaveInfo) leaveStore.fetchLeaveInfo() })
</script>
