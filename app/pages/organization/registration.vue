<template>
  <div>
    <!-- Logo -->
    <div class="mb-4 text-center">
      <img :src="logoBlue" alt="Micro ERP" class="h-14 w-auto mx-auto" >
    </div>

    <!-- Title + subtitle -->
    <h2 class="text-2xl font-bold text-gray-800 mb-1">Đăng kí tạo tổ chức</h2>
    <p class="text-sm text-gray-400 mb-5">
      Hãy điền thông tin đăng kí tạo tổ chức của bạn và chúng tôi sẽ hỗ trợ bạn sớm nhất:
    </p>

    <!-- Success state -->
    <div v-if="emailSent" class="mb-4 rounded bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
      Vui lòng kiểm tra email của bạn để hoàn tất đăng kí tổ chức.
    </div>

    <!-- Error -->
    <div v-if="serverError" class="mb-4 rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      {{ serverError }}
    </div>

    <Form v-if="!emailSent" v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
      <!-- Email -->
      <div class="mb-3">
        <Field v-slot="{ field, errors }" name="email">
          <input
            v-bind="field"
            type="email"
            placeholder="Email"
            autocomplete="email"
            :class="['login-input', errors[0] && 'border-red-400']"
          >
          <p v-if="errors[0]" class="text-red-500 text-xs mt-1">{{ errors[0] }}</p>
        </Field>
      </div>

      <!-- Tên tổ chức -->
      <div class="mb-3">
        <input
          v-model="orgName"
          type="text"
          placeholder="Tên tổ chức"
          class="login-input"
        >
      </div>

      <!-- Terms checkbox -->
      <div class="mb-4 flex items-start gap-2">
        <input id="terms" v-model="agreed" type="checkbox" class="mt-0.5 cursor-pointer" >
        <label for="terms" class="text-sm text-gray-600 cursor-pointer">
          Tôi đã đọc và đồng ý với
          <a href="#" class="text-blue-500 hover:underline">Điều khoản sử dụng</a>
        </label>
      </div>

      <!-- Submit button -->
      <button
        type="submit"
        :disabled="isSubmitting || !agreed"
        class="w-full py-2.5 bg-blue-500 text-white uppercase font-semibold text-sm tracking-wider rounded hover:bg-blue-600 transition mb-3 disabled:opacity-60"
      >
        {{ isSubmitting ? 'Đang xử lý...' : 'Đăng Kí' }}
      </button>
    </Form>

    <!-- Google registration -->
    <a
      :href="`${apiBase}/registration/register-org-google`"
      class="block w-full py-2.5 bg-orange-500 text-white uppercase font-semibold text-sm tracking-wider rounded hover:bg-orange-600 transition text-center mb-4"
    >
      Đăng Kí Với Tài Khoản Google
    </a>

    <!-- Back to login -->
    <p class="text-sm text-gray-500">
      Đã có tài khoản?
      <NuxtLink to="/organization/find-organization" class="text-blue-500 hover:underline ml-1">
        Đăng nhập
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import logoBlue from '~/assets/images/logoblue.png'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({ title: 'Đăng kí tổ chức — Micro ERP' })

const config      = useRuntimeConfig()
const apiBase     = config.public.apiBase
const serverError = ref('')
const emailSent   = ref(false)
const orgName     = ref('')
const agreed      = ref(false)

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
      emailSent.value = true
    } else {
      serverError.value = res.message || 'Có lỗi xảy ra, vui lòng thử lại.'
    }
  } catch (err: any) {
    serverError.value = err?.data?.message ?? err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.'
  }
}
</script>

<style scoped>
.login-input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
}
.login-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
</style>
