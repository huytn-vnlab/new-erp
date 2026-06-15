<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-800 mb-2 text-center">Đăng ký tài khoản</h2>
    <p class="text-sm text-gray-500 text-center mb-6">
      Tạo tài khoản để truy cập tổ chức
      <strong v-if="orgName" class="text-gray-700">{{ orgName }}</strong>.
    </p>

    <AppAlert v-if="successMsg" variant="success" class="mb-4">{{ successMsg }}</AppAlert>
    <AppAlert v-if="errorMsg" variant="error" dismissible class="mb-4">{{ errorMsg }}</AppAlert>

    <Form v-if="!successMsg" v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
      <div class="space-y-4 mb-5">
        <Field v-slot="{ field, errors }" name="full_name">
          <AppInput
            v-bind="field"
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            :error="errors[0]"
            required
            autocomplete="name"
          />
        </Field>

        <Field v-slot="{ field, errors }" name="email">
          <AppInput
            v-bind="field"
            type="email"
            label="Email công ty"
            placeholder="your@company.com"
            :error="errors[0]"
            required
            autocomplete="email"
          />
        </Field>

        <Field v-slot="{ field, errors }" name="phone">
          <AppInput
            v-bind="field"
            type="tel"
            label="Số điện thoại"
            placeholder="0901234567"
            :error="errors[0]"
            autocomplete="tel"
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

        <Field v-slot="{ field, errors }" name="confirm_password">
          <AppInput
            v-bind="field"
            type="password"
            label="Xác nhận mật khẩu"
            autocomplete="new-password"
            :error="errors[0]"
            required
          />
        </Field>
      </div>

      <AppButton type="submit" class="w-full" :loading="isSubmitting">Đăng ký</AppButton>
    </Form>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-500">
        Đã có tài khoản?
        <NuxtLink :to="loginLink" class="text-primary-600 hover:underline ml-1">Đăng nhập</NuxtLink>
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

useHead({ title: 'Đăng ký — Micro ERP' })

const route    = useRoute()
const { post } = useApi()
const successMsg = ref('')
const errorMsg   = ref('')
const orgName    = ref('')

const orgCode  = computed(() => route.query.org as string ?? '')
const loginLink = computed(() => orgCode.value ? `/user/login?org=${orgCode.value}` : '/user/login')

const schema = toTypedSchema(z.object({
  full_name:        z.string().min(2, 'Nhập họ tên'),
  email:            z.string().email('Email không hợp lệ'),
  phone:            z.string().optional(),
  password:         z.string().min(6, 'Ít nhất 6 ký tự'),
  confirm_password: z.string().min(6, 'Ít nhất 6 ký tự'),
}).refine(d => d.password === d.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password'],
}))

async function onSubmit(values: any) {
  errorMsg.value = ''
  try {
    await post('/user/register', {
      full_name: values.full_name,
      email:     values.email,
      phone:     values.phone,
      password:  values.password,
      org_code:  orgCode.value,
    })
    successMsg.value = 'Đăng ký thành công! Tài khoản của bạn đang chờ phê duyệt từ quản trị viên.'
  } catch (err: any) {
    const status = err?.response?.status ?? err?.status
    if (status === 409) {
      errorMsg.value = 'Email này đã được đăng ký trong tổ chức.'
    } else if (status === 404) {
      errorMsg.value = 'Tổ chức không tồn tại.'
    } else {
      errorMsg.value = err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.'
    }
  }
}

onMounted(async () => {
  if (orgCode.value) {
    try {
      const res = await post<{ organization: Organization }>('/organization/find-organization', { keyword: orgCode.value })
      orgName.value = res.data?.organization?.name ?? ''
    } catch {}
  }
})
</script>
