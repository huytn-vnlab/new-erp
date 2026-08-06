<template>
  <AuthCard
    :step="1"
    back-label="Đổi tổ chức"
    :back-to="{ path: '/organization/find-organization', query: route.query }"
    eyebrow="Bước 2 / 2"
    :title="$t('auth.login')"
    :sub="$t('auth.loginSubtitle')"
  >
    <div class="mb-5 flex items-center gap-3 rounded-xl border border-border bg-slate-50 p-2.5">
      <span class="h-[34px] w-[34px] rounded-xl flex items-center justify-center font-heading font-bold text-white shrink-0 text-[11.5px]" style="background: hsl(203 89% 48%)">
        {{ orgInitials }}
      </span>
      <span class="min-w-0 flex-1">
        <span class="block text-[13px] font-semibold text-ink truncate">{{ orgLabel }}</span>
        <span v-if="route.query.org" class="block text-[11px] text-slate-500 font-mono">{{ route.query.org }}</span>
      </span>
      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full"><Check :size="11" />Đã chọn</span>
    </div>

    <div v-if="serverError" class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">{{ serverError }}</div>

    <Form v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
      <div class="space-y-3.5">
        <Field v-slot="{ field, errors }" name="email">
          <AuthField
            :model-value="field.value"
            :label="$t('auth.email')"
            :icon="Mail"
            type="email"
            :placeholder="$t('auth.email')"
            :error="errors[0]"
            auto-focus
            @update:model-value="field.onChange"
          />
        </Field>

        <Field v-slot="{ field, errors }" name="password">
          <AuthField
            :model-value="field.value"
            :label="$t('auth.password')"
            :icon="Lock"
            type="password"
            :error="errors[0]"
            @update:model-value="field.onChange"
          >
            <template #right>
              <NuxtLink to="/user/forgot-password" class="text-[#1565c0] font-semibold hover:underline underline-offset-2 text-[12.5px]">{{ $t('auth.forgot') }}</NuxtLink>
            </template>
          </AuthField>
        </Field>

        <label class="flex items-center gap-2 text-[12.5px] text-slate-600 select-none cursor-pointer">
          <input type="checkbox" checked class="h-4 w-4 rounded border-border accent-[#109cf1]">
          {{ $t('auth.remember') }}
        </label>

        <AuthButton type="submit" :disabled="isSubmitting">{{ isSubmitting ? $t('auth.loggingIn') : $t('auth.loginBtn') }}</AuthButton>

        <AuthDivider label="hoặc" />

        <a
          :href="`${apiBase}/auth/google`"
          class="w-full h-11 rounded-[10px] border border-border bg-white text-[13.5px] font-semibold text-ink inline-flex items-center justify-center gap-2.5 hover:bg-slate-50 transition-colors"
        >
          <GoogleIcon />{{ $t('auth.googleLogin') }}
        </a>
      </div>
    </Form>

    <template #footer>
      <span>{{ $t('auth.registerMember') }} <NuxtLink :to="{ path: '/user/user-request', query: route.query }" class="text-[#1565c0] font-semibold hover:underline underline-offset-2">{{ $t('auth.registerNow') }}</NuxtLink></span>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Mail, Lock, Check } from 'lucide-vue-next'
import { h } from 'vue'

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
const orgLabel = computed(() => (route.query.org_name as string) || (route.query.org as string) || 'Tổ chức')
const orgInitials = computed(() => orgLabel.value.split(' ').slice(0, 2).map((w) => w[0]).join(''))

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

const GoogleIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24' }, [
  h('path', { fill: '#4285F4', d: 'M22.5 12.2c0-.8-.1-1.4-.2-2H12v3.9h5.9c-.1 1-.8 2.5-2.2 3.5l3.4 2.6c2-1.8 3.4-4.6 3.4-8Z' }),
  h('path', { fill: '#34A853', d: 'M12 23c2.9 0 5.3-1 7.1-2.6l-3.4-2.6c-.9.6-2.1 1-3.7 1a6.4 6.4 0 0 1-6-4.4l-3.5 2.7A10.9 10.9 0 0 0 12 23Z' }),
  h('path', { fill: '#FBBC05', d: 'M6 14.4a6.7 6.7 0 0 1 0-4.3L2.5 7.4a11 11 0 0 0 0 9.7L6 14.4Z' }),
  h('path', { fill: '#EA4335', d: 'M12 5.4c2 0 3.4.9 4.2 1.6l3-2.9A10.5 10.5 0 0 0 12 1 10.9 10.9 0 0 0 2.5 7.4L6 10.1A6.4 6.4 0 0 1 12 5.4Z' }),
])
</script>
