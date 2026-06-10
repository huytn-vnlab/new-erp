<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">Chỉnh sửa tài sản</h2>

      <AppAlert v-if="serverError" variant="error" dismissible class="mb-4">{{ serverError }}</AppAlert>

      <div v-if="loading" class="flex justify-center py-12"><AppSpinner /></div>

      <Form v-else :validation-schema="schema" :initial-values="initialValues" @submit="onSubmit" v-slot="{ isSubmitting }">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="name" v-slot="{ field, errors }">
            <AppInput v-bind="field" label="Tên tài sản" :error="errors[0]" required />
          </Field>
          <Field name="code" v-slot="{ field, errors }">
            <AppInput v-bind="field" label="Mã tài sản" :error="errors[0]" required />
          </Field>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="category" v-slot="{ field, errors }">
            <AppSelect
              v-bind="field"
              label="Danh mục"
              :options="categoryOptions"
              value-key="value"
              label-key="label"
              :error="errors[0]"
            />
          </Field>
          <Field name="value" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="number" label="Giá trị (VNĐ)" :error="errors[0]" />
          </Field>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="purchase_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày mua" :error="errors[0]" />
          </Field>
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

        <div class="mb-4">
          <Field name="location" v-slot="{ field, errors }">
            <AppInput v-bind="field" label="Vị trí / Phòng" :error="errors[0]" />
          </Field>
        </div>

        <div class="mb-4">
          <!-- Assigned user (read-only) -->
          <div v-if="assignedUser" class="p-3 bg-gray-50 rounded-lg">
            <p class="text-xs text-gray-500">Đang được dùng bởi</p>
            <p class="font-medium text-gray-900 text-sm mt-0.5">{{ assignedUser.full_name }}</p>
          </div>
        </div>

        <div class="mb-6">
          <Field name="description" v-slot="{ field, errors }">
            <div>
              <label class="form-label">Mô tả</label>
              <textarea v-bind="field" rows="3" class="form-input resize-none" />
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
import type { Asset } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Sửa tài sản — Micro ERP' })

const route  = useRoute()
const router = useRouter()
const toast  = useToast()
const { post } = useApi()

const loading       = ref(true)
const serverError   = ref('')
const initialValues = ref<any>(null)
const assignedUser  = ref<any>(null)

const categoryOptions = [
  { value: 'electronics', label: 'Điện tử' },
  { value: 'furniture',   label: 'Nội thất' },
  { value: 'vehicle',     label: 'Phương tiện' },
  { value: 'equipment',   label: 'Thiết bị' },
  { value: 'other',       label: 'Khác' },
]

const statusOptions = [
  { value: 0, label: 'Đang sử dụng' },
  { value: 1, label: 'Sẵn sàng' },
  { value: 2, label: 'Bảo trì' },
  { value: 3, label: 'Hỏng' },
]

const schema = toTypedSchema(z.object({
  name:          z.string().min(1, 'Nhập tên tài sản'),
  code:          z.string().min(1, 'Nhập mã tài sản'),
  category:      z.string().optional(),
  value:         z.coerce.number().optional(),
  purchase_date: z.string().optional(),
  status:        z.coerce.number(),
  location:      z.string().optional(),
  description:   z.string().optional(),
}))

async function onSubmit(values: any) {
  serverError.value = ''
  try {
    await post('/asset/update-asset', { ...values, id: Number(route.params.id) })
    toast.success('Đã cập nhật tài sản')
    router.push('/hrm/asset/asset-list')
  } catch (err) {
    serverError.value = handleApiError(err)
  }
}

onMounted(async () => {
  try {
    const res = await post<{ asset: Asset }>('/asset/get-asset-detail', { id: Number(route.params.id) })
    const a   = (res.data?.asset ?? {}) as Partial<Asset>
    initialValues.value = {
      name:          a.name,
      code:          a.code,
      category:      a.category ?? '',
      value:         a.value ?? '',
      purchase_date: a.purchase_date?.substring(0, 10) ?? '',
      status:        a.status ?? 1,
      location:      a.location ?? '',
      description:   a.description ?? '',
    }
    assignedUser.value = a.assigned_user ?? null
  } finally { loading.value = false }
})
</script>
