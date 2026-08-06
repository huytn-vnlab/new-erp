<template>
  <AuthCard
    wide
    eyebrow="Thành viên mới"
    :title="successMsg ? 'Đã gửi yêu cầu' : 'Yêu cầu tham gia tổ chức'"
    :sub="successMsg ? successMsg : 'Quản trị viên của tổ chức sẽ nhận yêu cầu và cấp tài khoản cho bạn.'"
    back-label="Về đăng nhập"
    :back-to="{ path: '/user/login', query: route.query }"
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
              label="Email công ty"
              :icon="Mail"
              type="email"
              placeholder="ten@congty.vn"
              :error="errors[0]"
              auto-focus
              @update:model-value="field.onChange"
            />
          </Field>

          <label class="block">
            <span class="text-[12.5px] font-semibold text-ink">Lời nhắn cho quản trị viên</span>
            <Field v-slot="{ field, errors }" name="message">
              <textarea
                :value="field.value"
                rows="3"
                placeholder="Tôi là nhân viên mới phòng Kỹ thuật, bắt đầu từ 01/08."
                class="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-slate-400 outline-none focus:border-[#109cf1] focus:shadow-[0_0_0_3px_rgba(16,156,241,0.16)] transition-shadow resize-none"
                @input="field.onChange(($event.target as HTMLTextAreaElement).value)"
              />
              <span v-if="errors[0]" class="mt-1.5 block text-[11.5px] text-rose-600">{{ errors[0] }}</span>
            </Field>
          </label>

          <AuthButton type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu' }}</AuthButton>
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

useHead({ title: 'Gửi yêu cầu — Micro ERP' })

const route      = useRoute()
const config      = useRuntimeConfig()
const apiBase     = config.public.apiBase

const successMsg = ref('')
const errorMsg   = ref('')

const organizationID = computed(() => Number(route.query.org_id) || 0)

const schema = toTypedSchema(
  z.object({
    email:   z.string().min(1, 'Bắt buộc').email('Email không hợp lệ'),
    message: z.string().min(1, 'Bắt buộc').max(300, 'Tối đa 300 ký tự'),
  })
)

async function onSubmit(values: Record<string, unknown>) {
  errorMsg.value = ''
  try {
    const res = await $fetch<{ status: number; message: string }>(
      `${apiBase}/registration/requestRegistration`,
      {
        method: 'POST',
        body: JSON.stringify({
          email:          values.email,
          organizationID: organizationID.value,
          message:        values.message,
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    )
    if (res.status === 1) {
      successMsg.value = res.message || 'Quản trị viên sẽ phê duyệt trong vòng 1 ngày làm việc.'
    } else {
      errorMsg.value = res.message || 'Có lỗi xảy ra, vui lòng thử lại.'
    }
  } catch (err: any) {
    errorMsg.value = err?.data?.message ?? err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.'
  }
}
</script>
