<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-800 mb-2 text-center">Xác nhận yêu cầu</h2>

    <div v-if="loading" class="flex justify-center py-8"><AppSpinner /></div>

    <template v-else>
      <AppAlert v-if="success" variant="success" class="mb-6">
        Yêu cầu hợp lệ! Vui lòng nhập mật khẩu mới của bạn.
      </AppAlert>
      <AppAlert v-else-if="errorMsg" variant="error" class="mb-4">{{ errorMsg }}</AppAlert>

      <!-- Show password form after code verified -->
      <Form v-if="success" v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
        <div class="space-y-4 mb-5">
          <Field v-slot="{ field, errors }" name="new_password">
            <AppInput v-bind="field" type="password" label="Mật khẩu mới" :error="errors[0]" required autocomplete="new-password" />
          </Field>
          <Field v-slot="{ field, errors }" name="confirm_password">
            <AppInput v-bind="field" type="password" label="Xác nhận mật khẩu" :error="errors[0]" required autocomplete="new-password" />
          </Field>
        </div>
        <AppButton type="submit" class="w-full" :loading="isSubmitting">Đặt lại mật khẩu</AppButton>
      </Form>
      <AppAlert v-if="resetSuccess" variant="success" class="mt-4">
        Mật khẩu đã được cập nhật thành công!
        <NuxtLink to="/user/login" class="font-semibold hover:underline ml-1">Đăng nhập ngay</NuxtLink>
      </AppAlert>
    </template>
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
const loading      = ref(true)
const success      = ref(false)
const resetSuccess = ref(false)
const errorMsg     = ref('')

const schema = toTypedSchema(z.object({
  new_password:     z.string().min(6, 'Ít nhất 6 ký tự'),
  confirm_password: z.string().min(6, 'Ít nhất 6 ký tự'),
}).refine(d => d.new_password === d.confirm_password, {
  message: 'Mật khẩu không khớp',
  path: ['confirm_password'],
}))

async function onSubmit(values: any) {
  try {
    await post('/user/reset-password', {
      token:        route.params.code,
      new_password: values.new_password,
    })
    success.value = false
    resetSuccess.value = true
  } catch (err: any) {
    errorMsg.value = err?.message ?? 'Có lỗi xảy ra.'
  }
}

onMounted(async () => {
  try {
    await post('/user/verify-reset-token', { token: route.params.code })
    success.value = true
  } catch (err: any) {
    errorMsg.value = 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'
  } finally { loading.value = false }
})
</script>
