<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-800 mb-2 text-center">Đổi email tổ chức</h2>
    <p class="text-sm text-gray-500 text-center mb-6">Nhập email mới cho tổ chức của bạn.</p>

    <AppAlert v-if="successMsg" variant="success" class="mb-4">{{ successMsg }}</AppAlert>
    <AppAlert v-if="errorMsg" variant="error" dismissible class="mb-4">{{ errorMsg }}</AppAlert>

    <Form v-if="!successMsg" v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
      <div class="mb-5">
        <Field v-slot="{ field, errors }" name="email">
          <AppInput
            v-bind="field"
            type="email"
            label="Email mới"
            placeholder="new@company.com"
            :error="errors[0]"
            required
            autocomplete="email"
          />
        </Field>
      </div>
      <AppButton type="submit" class="w-full" :loading="isSubmitting">Gửi link xác nhận</AppButton>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Đổi email — Micro ERP' })

const { post } = useApi()
const successMsg = ref('')
const errorMsg   = ref('')

const schema = toTypedSchema(z.object({
  email: z.string().email('Email không hợp lệ'),
}))

async function onSubmit(values: Record<string, unknown>) {
  errorMsg.value = ''
  const email = values.email as string
  try {
    await post('/organization/change-email', { email })
    successMsg.value = `Đã gửi link xác nhận đến ${email}. Vui lòng kiểm tra hộp thư.`
  } catch (err: any) {
    errorMsg.value = err?.message ?? 'Có lỗi xảy ra.'
  }
}
</script>
