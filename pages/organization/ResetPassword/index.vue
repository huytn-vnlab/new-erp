<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-800 mb-2 text-center">Đặt lại mật khẩu</h2>
    <p class="text-sm text-gray-500 text-center mb-6">Nhập mật khẩu mới cho tài khoản của bạn.</p>

    <AppAlert v-if="successMsg" variant="success" class="mb-4">{{ successMsg }}</AppAlert>
    <AppAlert v-if="errorMsg" variant="error" dismissible class="mb-4">{{ errorMsg }}</AppAlert>

    <Form v-if="!successMsg" :validation-schema="schema" @submit="onSubmit" v-slot="{ isSubmitting }">
      <div class="space-y-4 mb-5">
        <Field name="new_password" v-slot="{ field, errors }">
          <AppInput
            v-bind="field"
            type="password"
            label="Mật khẩu mới"
            autocomplete="new-password"
            :error="errors[0]"
            required
          />
        </Field>
        <Field name="confirm_password" v-slot="{ field, errors }">
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
      <AppButton type="submit" class="w-full" :loading="isSubmitting">Đặt lại mật khẩu</AppButton>
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

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Đặt lại mật khẩu — Micro ERP' })

const route    = useRoute()
const { post } = useApi()
const successMsg = ref('')
const errorMsg   = ref('')

// token may come from query param ?token=xxx
const token = computed(() => route.query.token as string ?? '')

const schema = toTypedSchema(z.object({
  new_password:     z.string().min(6, 'Ít nhất 6 ký tự'),
  confirm_password: z.string().min(6, 'Ít nhất 6 ký tự'),
}).refine(d => d.new_password === d.confirm_password, {
  message: 'Mật khẩu không khớp',
  path: ['confirm_password'],
}))

async function onSubmit(values: any) {
  errorMsg.value = ''
  try {
    await post('/user/reset-password', {
      token:        token.value,
      new_password: values.new_password,
    })
    successMsg.value = 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.'
  } catch (err: any) {
    const status = err?.response?.status ?? err?.status
    if (status === 400 || status === 404) {
      errorMsg.value = 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'
    } else {
      errorMsg.value = err?.message ?? 'Có lỗi xảy ra.'
    }
  }
}
</script>
