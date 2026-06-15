<template>
  <div>
    <!-- Logo -->
    <div class="mb-4 text-center">
      <img :src="logoBlue" alt="Micro ERP" class="h-14 w-auto mx-auto" >
    </div>

    <!-- Title + subtitle -->
    <h2 class="text-2xl font-bold text-gray-800 mb-1">{{ $t('auth.login') }}</h2>
    <p class="text-sm text-gray-400 mb-5">{{ $t('auth.loginSubtitle') }}</p>

    <!-- Global error -->
    <div v-if="serverError" class="mb-4 rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      {{ serverError }}
    </div>

    <Form v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
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

      <!-- Password -->
      <div class="mb-3">
        <Field v-slot="{ field, errors }" name="password">
          <input
            v-bind="field"
            type="password"
            placeholder="Password"
            autocomplete="current-password"
            :class="['login-input', errors[0] && 'border-red-400']"
          >
          <p v-if="errors[0]" class="text-red-500 text-xs mt-1">{{ errors[0] }}</p>
        </Field>
      </div>

      <!-- Forgot password -->
      <div class="mb-4">
        <NuxtLink to="/user/forgot-password" class="text-sm text-gray-400 hover:text-gray-600">
          {{ $t('auth.forgot') }}
        </NuxtLink>
      </div>

      <!-- Login button -->
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full py-2.5 bg-blue-500 text-white uppercase font-semibold text-sm tracking-wider rounded hover:bg-blue-600 transition mb-3 disabled:opacity-60"
      >
        {{ isSubmitting ? $t('auth.loggingIn') : $t('auth.loginBtn') }}
      </button>
    </Form>

    <!-- Google login -->
    <a
      :href="`${apiBase}/auth/google`"
      class="block w-full py-2.5 bg-orange-500 text-white uppercase font-semibold text-sm tracking-wider rounded hover:bg-orange-600 transition text-center mb-4"
    >
      {{ $t('auth.googleLogin') }}
    </a>

    <!-- No org link -->
    <p class="text-sm text-gray-400 mb-4">
      {{ $t('auth.noOrg') }}
      <NuxtLink to="/organization/registration" class="text-blue-500 hover:underline ml-1">
        {{ $t('auth.registerNow') }}
      </NuxtLink>
    </p>

    <!-- Register as member -->
    <NuxtLink
      to="/user/user-request"
      class="block w-full py-2.5 border border-blue-500 text-blue-500 uppercase font-semibold text-sm tracking-wider rounded hover:bg-blue-50 transition text-center"
    >
      {{ $t('auth.registerMember') }}
    </NuxtLink>
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

useHead({ title: 'Đăng nhập — Micro ERP' })

const { login } = useAuth()
const router   = useRouter()
const route    = useRoute()
const { t }    = useI18n()
const config   = useRuntimeConfig()

const apiBase      = config.public.apiBase
const serverError  = ref('')

const organizationId = computed(() => Number(route.query.org_id) || 0)

if (!organizationId.value) {
  navigateTo({
    path: '/organization/find-organization',
    query: route.query
  })
}

const schema = toTypedSchema(
  z.object({
    email:    z.string().min(1, t('auth.required')).email(t('auth.invalidEmail')),
    password: z.string().min(6, t('auth.minPassword')),
  })
)

async function onSubmit(values: Record<string, unknown>) {
  serverError.value = ''
  try {
    await login({
      email:           values.email as string,
      password:        values.password as string,
      organization_id: organizationId.value,
    })
    const redirect = (route.query.redirect as string) || '/home-admin'
    router.push(redirect)
  } catch (err: any) {
    const status = err?.response?.status ?? err?.status
    if (status === 401 || status === 400) {
      serverError.value = t('auth.invalidCredentials')
    } else {
      serverError.value = err?.message ?? t('auth.unexpectedError')
    }
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
  box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
}
</style>
