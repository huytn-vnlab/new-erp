<template>
  <AuthCard
    eyebrow="Khôi phục"
    :title="successMsg ? 'Kiểm tra hộp thư của bạn' : 'Quên mật khẩu?'"
    :sub="successMsg ? successMsg : 'Nhập email của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.'"
    back-label="Về đăng nhập"
    back-to="/user/login"
  >
    <div v-if="successMsg" class="-mt-2">
      <span class="h-14 w-14 rounded-2xl flex items-center justify-center" style="background: hsl(203 89% 95%); color: hsl(203 89% 40%)">
        <Mail :size="26" />
      </span>
    </div>

    <template v-else>
      <div v-if="errorMsg" class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">{{ errorMsg }}</div>

      <Form v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
        <div class="space-y-3.5">
          <Field v-slot="{ field, errors }" name="email">
            <AuthField
              :model-value="field.value"
              label="Email"
              :icon="Mail"
              type="email"
              placeholder="ten@congty.vn"
              :error="errors[0]"
              auto-focus
              @update:model-value="field.onChange"
            />
          </Field>
          <AuthButton type="submit" :disabled="isSubmitting">Gửi liên kết đặt lại</AuthButton>
        </div>
      </Form>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Mail } from 'lucide-vue-next'

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
    successMsg.value = `Chúng tôi đã gửi liên kết đặt lại mật khẩu tới ${email}.`
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
