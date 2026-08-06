<template>
  <AuthCard
    wide
    eyebrow="Bước cuối"
    title="Tạo tổ chức mới"
    sub="Thông tin này xuất hiện trên hợp đồng, phiếu lương và email hệ thống."
  >
    <div v-if="errorMsg" class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">{{ errorMsg }}</div>

    <Form v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
      <div class="grid sm:grid-cols-2 gap-3.5">
        <Field v-slot="{ field, errors }" name="name">
          <AuthField :model-value="field.value" label="Tên tổ chức" :icon="Building2" placeholder="Công ty TNHH ABC" :error="errors[0]" auto-focus @update:model-value="field.onChange" />
        </Field>

        <Field v-slot="{ field, errors }" name="code">
          <AuthField :model-value="field.value" label="Mã tổ chức" :icon="Tag" placeholder="abc-company" hint="Dùng để đăng nhập." :error="errors[0]" @update:model-value="field.onChange" />
        </Field>

        <div class="sm:col-span-2">
          <Field v-slot="{ field, errors }" name="full_name">
            <AuthField :model-value="field.value" label="Họ tên quản trị viên" :icon="User" placeholder="Nguyễn Văn A" :error="errors[0]" @update:model-value="field.onChange" />
          </Field>
        </div>

        <div class="sm:col-span-2">
          <Field v-slot="{ field, errors }" name="email">
            <AuthField :model-value="field.value" label="Email quản trị viên" :icon="Mail" type="email" placeholder="admin@company.com" :error="errors[0]" @update:model-value="field.onChange" />
          </Field>
        </div>

        <div class="sm:col-span-2">
          <Field v-slot="{ field, errors }" name="password">
            <AuthField :model-value="field.value" label="Mật khẩu" :icon="Lock" type="password" :error="errors[0]" @update:model-value="field.onChange" />
            <AuthPasswordRules :password="field.value || ''" />
          </Field>
        </div>
      </div>

      <div class="mt-6"><AuthButton type="submit" :disabled="isSubmitting">Tạo tổ chức &amp; vào hệ thống</AuthButton></div>
    </Form>

    <template #footer>
      <span>Đã có tổ chức? <NuxtLink to="/organization/find-organization" class="text-[#1565c0] font-semibold hover:underline underline-offset-2">Tìm tổ chức</NuxtLink></span>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Building2, Tag, User, Mail, Lock } from 'lucide-vue-next'
import type { Organization } from '~/types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({ title: 'Tạo tổ chức — Micro ERP' })

const router   = useRouter()
const { post } = useApi()
const errorMsg = ref('')

const schema = toTypedSchema(z.object({
  name:      z.string().min(2, 'Nhập tên tổ chức'),
  code:      z.string().min(2, 'Nhập mã tổ chức').regex(/^[a-z0-9-]+$/, 'Chỉ dùng chữ thường, số và dấu -'),
  email:     z.string().email('Email không hợp lệ'),
  password:  z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  full_name: z.string().min(2, 'Nhập tên quản trị viên'),
}))

async function onSubmit(values: any) {
  errorMsg.value = ''
  try {
    const res = await post<{ organization: Organization }>('/organization/create-organization', values)
    const orgCode = res.data?.organization?.code ?? values.code
    router.push({ path: '/user/login', query: { org: orgCode, setup: '1' } })
  } catch (err: any) {
    const status = err?.response?.status ?? err?.status
    if (status === 409) {
      errorMsg.value = 'Mã tổ chức đã tồn tại. Vui lòng chọn mã khác.'
    } else {
      errorMsg.value = err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.'
    }
  }
}
</script>
