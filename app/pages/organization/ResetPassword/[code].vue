<template>
  <AuthCard
    eyebrow="Khôi phục"
    :title="cardTitle"
    :sub="cardSub"
    back-label="Về đăng nhập"
    back-to="/user/login"
  >
    <div v-if="loading" class="flex justify-center py-8"><Loader2 :size="28" class="animate-spin text-slate-300" /></div>

    <template v-else>
      <div v-if="resetSuccess" class="-mt-2">
        <span class="h-14 w-14 rounded-2xl flex items-center justify-center" style="background: hsl(152 60% 95%); color: hsl(155 60% 32%)">
          <Check :size="26" />
        </span>
        <div class="mt-6"><AuthButton @click="router.push('/user/login')">Đăng nhập ngay</AuthButton></div>
      </div>

      <template v-else-if="success">
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

      <div v-else class="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">{{ errorMsg }}</div>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Lock, Check, Loader2 } from 'lucide-vue-next'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Đặt lại mật khẩu — Micro ERP' })

const route    = useRoute()
const router   = useRouter()
const { post } = useApi()
const loading      = ref(true)
const success      = ref(false)
const resetSuccess = ref(false)
const errorMsg     = ref('')

const cardTitle = computed(() => {
  if (loading.value) return 'Xác nhận yêu cầu'
  if (resetSuccess.value) return 'Đặt lại mật khẩu thành công'
  if (success.value) return 'Đặt lại mật khẩu'
  return 'Liên kết không hợp lệ'
})
const cardSub = computed(() => {
  if (loading.value) return 'Đang xác minh liên kết của bạn…'
  if (resetSuccess.value) return 'Bạn có thể đăng nhập với mật khẩu mới.'
  if (success.value) return 'Mật khẩu mới sẽ áp dụng cho tất cả thiết bị của bạn.'
  return undefined
})

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
