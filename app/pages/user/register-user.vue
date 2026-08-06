<template>
  <AuthCard
    wide
    eyebrow="Thành viên mới"
    :title="successMsg ? 'Đăng ký thành công' : 'Đăng ký tài khoản'"
    :sub="successMsg ? successMsg : (orgName ? `Tạo tài khoản để truy cập tổ chức ${orgName}.` : 'Tạo tài khoản để truy cập tổ chức của bạn.')"
  >
    <div v-if="successMsg" class="-mt-2">
      <span class="h-14 w-14 rounded-2xl flex items-center justify-center" style="background: hsl(203 89% 95%); color: hsl(203 89% 40%)">
        <Check :size="26" />
      </span>
    </div>

    <template v-else>
      <div v-if="errorMsg" class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">{{ errorMsg }}</div>

      <Form v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
        <div class="grid sm:grid-cols-2 gap-3.5">
          <Field v-slot="{ field, errors }" name="full_name">
            <AuthField :model-value="field.value" label="Họ và tên" :icon="User" placeholder="Nguyễn Văn A" :error="errors[0]" auto-focus @update:model-value="field.onChange" />
          </Field>

          <Field v-slot="{ field, errors }" name="phone">
            <AuthField :model-value="field.value" label="Số điện thoại" :icon="Phone" placeholder="0901234567" :error="errors[0]" @update:model-value="field.onChange" />
          </Field>

          <div class="sm:col-span-2">
            <Field v-slot="{ field, errors }" name="email">
              <AuthField :model-value="field.value" label="Email công ty" :icon="Mail" type="email" placeholder="ten@congty.vn" :error="errors[0]" @update:model-value="field.onChange" />
            </Field>
          </div>

          <Field v-slot="{ field, errors }" name="password">
            <AuthField :model-value="field.value" label="Mật khẩu" :icon="Lock" type="password" :error="errors[0]" @update:model-value="field.onChange" />
          </Field>

          <Field v-slot="{ field, errors }" name="confirm_password">
            <AuthField :model-value="field.value" label="Xác nhận mật khẩu" :icon="Lock" type="password" :error="errors[0]" @update:model-value="field.onChange" />
          </Field>
        </div>

        <div class="mt-5"><AuthButton type="submit" :disabled="isSubmitting">Đăng ký</AuthButton></div>
      </Form>
    </template>

    <template #footer>
      <span>Đã có tài khoản? <NuxtLink :to="loginLink" class="text-[#1565c0] font-semibold hover:underline underline-offset-2">Đăng nhập</NuxtLink></span>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { User, Phone, Mail, Lock, Check } from 'lucide-vue-next'
import type { Organization } from '~/types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({ title: 'Đăng ký — Micro ERP' })

const route    = useRoute()
const { post } = useApi()
const successMsg = ref('')
const errorMsg   = ref('')
const orgName    = ref('')

const orgCode  = computed(() => route.query.org as string ?? '')
const loginLink = computed(() => orgCode.value ? `/user/login?org=${orgCode.value}` : '/user/login')

const schema = toTypedSchema(z.object({
  full_name:        z.string().min(2, 'Nhập họ tên'),
  email:            z.string().email('Email không hợp lệ'),
  phone:            z.string().optional(),
  password:         z.string().min(6, 'Ít nhất 6 ký tự'),
  confirm_password: z.string().min(6, 'Ít nhất 6 ký tự'),
}).refine(d => d.password === d.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password'],
}))

async function onSubmit(values: any) {
  errorMsg.value = ''
  try {
    await post('/user/register', {
      full_name: values.full_name,
      email:     values.email,
      phone:     values.phone,
      password:  values.password,
      org_code:  orgCode.value,
    })
    successMsg.value = 'Tài khoản của bạn đang chờ phê duyệt từ quản trị viên.'
  } catch (err: any) {
    const status = err?.response?.status ?? err?.status
    if (status === 409) {
      errorMsg.value = 'Email này đã được đăng ký trong tổ chức.'
    } else if (status === 404) {
      errorMsg.value = 'Tổ chức không tồn tại.'
    } else {
      errorMsg.value = err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.'
    }
  }
}

onMounted(async () => {
  if (orgCode.value) {
    try {
      const res = await post<{ organization: Organization }>('/organization/find-organization', { keyword: orgCode.value })
      orgName.value = res.data?.organization?.name ?? ''
    } catch {}
  }
})
</script>
