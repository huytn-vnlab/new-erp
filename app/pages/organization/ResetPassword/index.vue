<template>
  <AuthCard
    eyebrow="Khôi phục"
    :title="successMsg ? 'Đặt lại mật khẩu thành công' : 'Đặt lại mật khẩu'"
    :sub="successMsg ? successMsg : 'Mật khẩu mới sẽ áp dụng cho tất cả thiết bị của bạn.'"
    back-label="Về đăng nhập"
    back-to="/user/login"
  >
    <div v-if="successMsg" class="-mt-2">
      <span class="h-14 w-14 rounded-2xl flex items-center justify-center" style="background: hsl(152 60% 95%); color: hsl(155 60% 32%)">
        <Check :size="26" />
      </span>
      <div class="mt-6"><AuthButton @click="router.push('/user/login')">Đăng nhập ngay</AuthButton></div>
    </div>

    <template v-else>
      <div v-if="errorMsg" class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">{{ errorMsg }}</div>

      <Form v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
        <div class="space-y-3.5">
          <Field v-slot="{ field, errors }" name="new_password">
            <AuthField
              :model-value="field.value"
              label="Mật khẩu mới"
              :icon="Lock"
              type="password"
              :error="errors[0]"
              auto-focus
              @update:model-value="field.onChange"
            />
            <AuthPasswordRules :password="field.value || ''" with-bar />
          </Field>
          <Field v-slot="{ field, errors }" name="confirm_password">
            <AuthField
              :model-value="field.value"
              label="Xác nhận mật khẩu"
              :icon="Lock"
              type="password"
              :error="errors[0]"
              @update:model-value="field.onChange"
            />
          </Field>
          <AuthButton type="submit" :disabled="isSubmitting">Cập nhật mật khẩu</AuthButton>
        </div>
      </Form>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Lock, Check } from 'lucide-vue-next'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Đặt lại mật khẩu — Micro ERP' })

const route    = useRoute()
const router   = useRouter()
const { post } = useApi()
const successMsg = ref('')
const errorMsg   = ref('')

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
    successMsg.value = 'Bạn có thể đăng nhập với mật khẩu mới.'
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
