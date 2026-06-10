<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">Thêm hợp đồng mới</h2>

      <AppAlert v-if="serverError" variant="error" dismissible class="mb-4">{{ serverError }}</AppAlert>

      <Form :validation-schema="schema" @submit="onSubmit" v-slot="{ isSubmitting }">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="user_id" v-slot="{ field, errors }">
            <AppSelect
              v-bind="field"
              label="Nhân viên"
              :options="memberOptions"
              value-key="id"
              label-key="full_name"
              placeholder="Chọn nhân viên..."
              :error="errors[0]"
              required
            />
          </Field>
          <Field name="contract_type_id" v-slot="{ field, errors }">
            <AppSelect
              v-bind="field"
              label="Loại hợp đồng"
              :options="contractTypes"
              value-key="id"
              label-key="name"
              placeholder="Chọn loại hợp đồng..."
              :error="errors[0]"
              required
            />
          </Field>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="contract_number" v-slot="{ field, errors }">
            <AppInput v-bind="field" label="Số hợp đồng" placeholder="HD-2024-001" :error="errors[0]" required />
          </Field>
          <Field name="salary" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="number" label="Lương (VNĐ)" :error="errors[0]" />
          </Field>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="start_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày bắt đầu" :error="errors[0]" required />
          </Field>
          <Field name="end_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày kết thúc" :error="errors[0]" />
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
          <Field name="note" v-slot="{ field, errors }">
            <div>
              <label class="form-label">Ghi chú</label>
              <textarea v-bind="field" rows="3" class="form-input resize-none" placeholder="Ghi chú thêm..." />
              <p v-if="errors[0]" class="form-error">{{ errors[0] }}</p>
            </div>
          </Field>
        </div>

        <div class="flex justify-end gap-3">
          <AppButton variant="secondary" type="button" @click="$router.back()">{{ $t('common.cancel') }}</AppButton>
          <AppButton type="submit" :loading="isSubmitting">Tạo hợp đồng</AppButton>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useUserProfile } from '~/composables/useUserProfile'
import { handleApiError } from '~/utils/error-handler'
import type { ContractType } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Thêm hợp đồng — Micro ERP' })

const router = useRouter()
const toast  = useToast()
const { post } = useApi()
const { fetchMemberList } = useUserProfile()

const serverError    = ref('')
const memberOptions  = ref<any[]>([])
const contractTypes  = ref<any[]>([])

const statusOptions = [
  { value: 0, label: 'Chờ ký' },
  { value: 1, label: 'Có hiệu lực' },
  { value: 2, label: 'Hết hạn' },
  { value: 3, label: 'Chấm dứt' },
]

const schema = toTypedSchema(z.object({
  user_id:           z.coerce.number().min(1, 'Chọn nhân viên'),
  contract_type_id:  z.coerce.number().min(1, 'Chọn loại hợp đồng'),
  contract_number:   z.string().min(1, 'Nhập số hợp đồng'),
  salary:            z.coerce.number().optional(),
  start_date:        z.string().min(1, 'Chọn ngày bắt đầu'),
  end_date:          z.string().optional(),
  status:            z.coerce.number().default(0),
  note:              z.string().optional(),
}))

async function onSubmit(values: any) {
  serverError.value = ''
  try {
    await post('/contract/create-contract', values)
    toast.success('Đã tạo hợp đồng')
    router.push('/hrm/contract/manage-contract')
  } catch (err) {
    serverError.value = handleApiError(err)
  }
}

onMounted(async () => {
  const [members, typesRes] = await Promise.all([
    fetchMemberList(),
    useApi().post<{ contract_types: ContractType[] }>('/contract/get-contract-types', {}),
  ])
  memberOptions.value = members
  contractTypes.value = typesRes.data?.contract_types ?? []
})
</script>
