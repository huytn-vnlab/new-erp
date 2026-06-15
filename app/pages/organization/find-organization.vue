<template>
  <div>
    <!-- Logo -->
    <div class="mb-5 text-center">
      <img :src="logoBlue" alt="Micro ERP" class="h-14 w-auto mx-auto" >
    </div>

    <!-- Title + subtitle -->
    <h2 class="text-2xl font-bold text-gray-800 mb-1">{{ $t('org.findTitle') }}</h2>
    <p class="text-sm text-gray-400 mb-5">{{ $t('org.findSubtitle') }}</p>

    <AppAlert v-if="errorMsg" variant="error" dismissible class="mb-4">{{ errorMsg }}</AppAlert>

    <Form v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
      <div class="mb-4">
        <Field v-slot="{ field, errors }" name="keyword">
          <input
            v-bind="field"
            :placeholder="$t('org.findPlaceholder')"
            :class="['login-input', errors[0] && 'border-red-400']"
          >
          <p v-if="errors[0]" class="text-red-500 text-xs mt-1">{{ errors[0] }}</p>
        </Field>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full py-2.5 bg-blue-500 text-white font-semibold text-sm rounded hover:bg-blue-600 transition disabled:opacity-60"
      >
        {{ isSubmitting ? $t('common.loading') : $t('org.findBtn') }}
      </button>
    </Form>

    <!-- Search result -->
    <div v-if="foundOrg" class="mt-5 p-4 border border-blue-200 rounded-lg bg-blue-50 flex items-center justify-between">
      <div>
        <p class="font-semibold text-gray-900">{{ foundOrg.name }}</p>
        <p class="text-sm text-gray-500 mt-0.5">{{ $t('org.code') }}: {{ foundOrg.tag }}</p>
      </div>
      <button
        class="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 transition"
        @click="goToLogin"
      >
        {{ $t('auth.login') }}
      </button>
    </div>
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

useHead({ title: 'Tìm tổ chức — Micro ERP' })

const router   = useRouter()
const route    = useRoute()
const foundOrg = ref<any>(null)
const errorMsg = ref('')
const { t }    = useI18n()

const schema = toTypedSchema(z.object({
  keyword: z.string().min(2, t('org.findMin')),
}))

async function onSubmit(values: Record<string, unknown>) {
  errorMsg.value = ''
  foundOrg.value = null

  const formData = new FormData()
  formData.append('tag_organization', values.keyword as string)

  try {
    const config = useRuntimeConfig()
    const res = await $fetch<{ status: number; message: string; data: { id: number; name: string; tag: string } | null }>(
      `${config.public.apiBase}/api/organization/find-organization`,
      { method: 'POST', body: formData }
    )
    if (res.status === 1 && res.data) {
      foundOrg.value = res.data
    } else {
      errorMsg.value = t('org.findNotFound')
    }
  } catch {
    errorMsg.value = t('org.findNotFound')
  }
}

function goToLogin() {
  if (foundOrg.value) {
    router.push({
      path: '/user/login',
      query: {
        ...route.query,
        org: foundOrg.value.tag,
        org_id: foundOrg.value.id
      }
    })
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
