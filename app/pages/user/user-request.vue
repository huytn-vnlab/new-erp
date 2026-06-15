<template>
  <div>
    <!-- Logo -->
    <div class="mb-6 text-center">
      <img :src="logoBlue" alt="Micro ERP" class="h-14 w-auto mx-auto" >
    </div>

    <!-- Success -->
    <div v-if="successMsg" class="mb-4 rounded bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
      {{ successMsg }}
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="mb-4 rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      {{ errorMsg }}
    </div>

    <Form v-if="!successMsg" v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
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

      <!-- Message -->
      <div class="mb-4">
        <Field v-slot="{ field, errors }" name="message">
          <textarea
            v-bind="field"
            placeholder="Lời nhắn"
            rows="6"
            :class="['login-input resize-none', errors[0] && 'border-red-400']"
          />
          <p v-if="errors[0]" class="text-red-500 text-xs mt-1">{{ errors[0] }}</p>
        </Field>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full py-2.5 bg-blue-500 text-white font-semibold text-sm rounded hover:bg-blue-600 transition disabled:opacity-60"
      >
        {{ isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu' }}
      </button>
    </Form>
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

useHead({ title: 'Gửi yêu cầu — Micro ERP' })

const route      = useRuntimeConfig()
const routeQuery = useRoute()
const config     = useRuntimeConfig()
const apiBase    = config.public.apiBase

const successMsg = ref('')
const errorMsg   = ref('')

const organizationID = computed(() => Number(routeQuery.query.org_id) || 0)

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
      successMsg.value = res.message || 'Yêu cầu đã được gửi thành công!'
    } else {
      errorMsg.value = res.message || 'Có lỗi xảy ra, vui lòng thử lại.'
    }
  } catch (err: any) {
    errorMsg.value = err?.data?.message ?? err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.'
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
