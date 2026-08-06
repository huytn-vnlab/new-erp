<template>
  <AuthCard
    eyebrow="Tổ chức mới"
    :title="emailSent ? 'Kiểm tra hộp thư của bạn' : 'Đăng ký tổ chức'"
    :sub="emailSent ? `Chúng tôi đã gửi liên kết xác thực tới ${lastEmail}.` : 'Chúng tôi gửi liên kết xác thực tới email quản trị. Chưa cần thẻ thanh toán.'"
    back-label="Về trang chủ"
    back-to="/"
  >
    <div v-if="emailSent" class="-mt-2">
      <span class="h-14 w-14 rounded-2xl flex items-center justify-center" style="background: hsl(203 89% 95%); color: hsl(203 89% 40%)">
        <Mail :size="26" />
      </span>
    </div>

    <template v-else>
      <div v-if="serverError" class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">{{ serverError }}</div>

      <Form v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
        <div class="space-y-3.5">
          <AuthField v-model="orgName" label="Tên tổ chức" :icon="Building2" placeholder="Công ty TNHH ABC" auto-focus />

          <Field v-slot="{ field, errors }" name="email">
            <AuthField
              :model-value="field.value"
              label="Email quản trị"
              :icon="Mail"
              type="email"
              placeholder="admin@congty.vn"
              hint="Email này sẽ là tài khoản quản trị đầu tiên."
              :error="errors[0]"
              @update:model-value="field.onChange"
            />
          </Field>

          <label class="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-slate-600 select-none cursor-pointer">
            <input v-model="agreed" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-border accent-[#109cf1]">
            <span>Tôi đã đọc và đồng ý với <a href="#" class="text-[#1565c0] font-semibold hover:underline">Điều khoản sử dụng</a>.</span>
          </label>

          <AuthButton type="submit" :disabled="isSubmitting || !agreed">{{ isSubmitting ? 'Đang xử lý...' : 'Gửi liên kết xác thực' }}</AuthButton>

          <AuthDivider label="hoặc" />

          <a
            :href="`${apiBase}/registration/register-org-google`"
            class="w-full h-11 rounded-[10px] border border-border bg-white text-[13.5px] font-semibold text-ink inline-flex items-center justify-center gap-2.5 hover:bg-slate-50 transition-colors"
          >
            Đăng ký với tài khoản Google
          </a>
        </div>
      </Form>

      <ul class="mt-6 space-y-2">
        <li v-for="t in benefits" :key="t" class="flex items-center gap-2 text-[12.5px] text-slate-600">
          <span class="h-4 w-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Check :size="10" /></span>{{ t }}
        </li>
      </ul>
    </template>

    <template #footer>
      <span>Đã có tổ chức? <NuxtLink to="/organization/find-organization" class="text-[#1565c0] font-semibold hover:underline underline-offset-2">Đăng nhập</NuxtLink></span>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Building2, Mail, Check } from 'lucide-vue-next'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({ title: 'Đăng kí tổ chức — Micro ERP' })

const config      = useRuntimeConfig()
const apiBase     = config.public.apiBase
const serverError = ref('')
const emailSent   = ref(false)
const lastEmail   = ref('')
const orgName     = ref('')
const agreed      = ref(false)

const benefits = ['Dùng thử 30 ngày đầy đủ tính năng', 'Nhập dữ liệu nhân sự từ Excel', 'Huỷ bất cứ lúc nào']

const schema = toTypedSchema(
  z.object({
    email: z.string().min(1, 'Bắt buộc').email('Email không hợp lệ'),
  })
)

async function onSubmit(values: Record<string, unknown>) {
  serverError.value = ''
  try {
    const res = await $fetch<{ status: number; message: string }>(
      `${apiBase}/registration/checkEmail`,
      {
        method: 'POST',
        body: JSON.stringify({ email: values.email }),
        headers: { 'Content-Type': 'application/json' },
      }
    )
    if (res.status === 1) {
      lastEmail.value = values.email as string
      emailSent.value = true
    } else {
      serverError.value = res.message || 'Có lỗi xảy ra, vui lòng thử lại.'
    }
  } catch (err: any) {
    serverError.value = err?.data?.message ?? err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.'
  }
}
</script>
