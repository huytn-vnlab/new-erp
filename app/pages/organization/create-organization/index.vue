<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-800 mb-2 text-center">Tạo tổ chức mới</h2>
    <p class="text-sm text-gray-500 text-center mb-6">Điền thông tin để khởi tạo không gian làm việc của bạn.</p>

    <AppAlert v-if="errorMsg" variant="error" dismissible class="mb-4">{{ errorMsg }}</AppAlert>

    <Form v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
      <div class="space-y-4 mb-5">
        <Field v-slot="{ field, errors }" name="name">
          <AppInput
            v-bind="field"
            label="Tên tổ chức"
            placeholder="Công ty TNHH ABC"
            :error="errors[0]"
            required
          />
        </Field>

        <Field v-slot="{ field, errors }" name="code">
          <AppInput
            v-bind="field"
            label="Mã tổ chức"
            placeholder="abc-company"
            :error="errors[0]"
            required
          />
        </Field>

        <Field v-slot="{ field, errors }" name="email">
          <AppInput
            v-bind="field"
            type="email"
            label="Email quản trị viên"
            placeholder="admin@company.com"
            :error="errors[0]"
            required
          />
        </Field>

        <Field v-slot="{ field, errors }" name="password">
          <AppInput
            v-bind="field"
            type="password"
            label="Mật khẩu"
            autocomplete="new-password"
            :error="errors[0]"
            required
          />
        </Field>

        <Field v-slot="{ field, errors }" name="full_name">
          <AppInput
            v-bind="field"
            label="Tên quản trị viên"
            placeholder="Nguyễn Văn A"
            :error="errors[0]"
            required
          />
        </Field>
      </div>

      <AppButton type="submit" class="w-full" :loading="isSubmitting">Tạo tổ chức</AppButton>
    </Form>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-500">
        Đã có tổ chức?
        <NuxtLink to="/organization/find-organization" class="text-primary-600 hover:underline ml-1">Tìm tổ chức</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import type { Organization } from '~/types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({ title: 'Tạo tổ chức — Micro ERP' })

const router   = useRouter()
const { post } = useApi()
const errorMsg = ref('')

const schema = toTypedSchema(z.object({
  name:      z.string().min(2, 'Nhập tên tổ chức'),
  code:      z.string().min(2, 'Nhập mã tổ chức').regex(/^[a-z0-9-]+$/, 'Chỉ dùng chữ thường, số và dấu -'),
  email:     z.string().email('Email không hợp lệ'),
  password:  z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  full_name: z.string().min(2, 'Nhập tên quản trị viên'),
}))

async function onSubmit(values: any) {
  errorMsg.value = ''
  try {
    const res = await post<{ organization: Organization }>('/organization/create-organization', values)
    // Navigate to setup flow or login
    const orgCode = res.data?.organization?.code ?? values.code
    router.push({ path: '/user/login', query: { org: orgCode, setup: '1' } })
  } catch (err: any) {
    const status = err?.response?.status ?? err?.status
    if (status === 409) {
      errorMsg.value = 'Mã tổ chức đã tồn tại. Vui lòng chọn mã khác.'
    } else {
      errorMsg.value = err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.'
    }
  }
}
</script>
