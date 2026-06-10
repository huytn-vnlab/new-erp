<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-800 mb-2 text-center">Quên mật khẩu</h2>
    <p class="text-sm text-gray-500 text-center mb-6">Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.</p>

    <AppAlert v-if="successMsg" variant="success" class="mb-4">{{ successMsg }}</AppAlert>
    <AppAlert v-if="errorMsg" variant="error" dismissible class="mb-4">{{ errorMsg }}</AppAlert>

    <Form v-if="!successMsg" :validation-schema="schema" @submit="onSubmit" v-slot="{ isSubmitting }">
      <div class="mb-5">
        <Field name="email" v-slot="{ field, errors }">
          <AppInput
            v-bind="field"
            type="email"
            label="Email"
            placeholder="your@email.com"
            :error="errors[0]"
            required
            autocomplete="email"
          />
        </Field>
      </div>

      <AppButton type="submit" class="w-full" :loading="isSubmitting">Gửi link đặt lại</AppButton>
    </Form>

    <div class="mt-6 text-center">
      <NuxtLink to="/user/login" class="text-sm text-primary-600 hover:underline">← Quay lại đăng nhập</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({ title: 'Quên mật khẩu — Micro ERP' })

const { post }   = useApi()
const successMsg = ref('')
const errorMsg   = ref('')

const schema = toTypedSchema(z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
}))

async function onSubmit(values: Record<string, unknown>) {
  errorMsg.value = ''
  const email = values.email as string
  try {
    await post('/user/forgot-password', { email })
    successMsg.value = `Link đặt lại mật khẩu đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư.`
  } catch (err: any) {
    const status = err?.response?.status ?? err?.status
    if (status === 404) {
      errorMsg.value = 'Email này chưa được đăng ký trong hệ thống.'
    } else {
      errorMsg.value = err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.'
    }
  }
}
</script>
