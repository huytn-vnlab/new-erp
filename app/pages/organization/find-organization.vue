<template>
  <AuthCard :step="0" eyebrow="Bước 1 / 2" :title="$t('org.findTitle')" :sub="$t('org.findSubtitle')">
    <Form v-slot="{ isSubmitting }" :validation-schema="schema" @submit="onSubmit">
      <Field v-slot="{ field, errors }" name="keyword" :validate-on-blur="false" :validate-on-input="false">
        <AuthField
          :model-value="field.value"
          :label="$t('org.code')"
          :icon="Tag"
          :placeholder="$t('org.findPlaceholder')"
          :error="errors[0] || errorMsg"
          auto-focus
          @update:model-value="field.onChange"
        />
      </Field>
      <div class="mt-3.5">
        <AuthButton type="submit" :disabled="isSubmitting">{{ isSubmitting ? $t('common.loading') : $t('org.findBtn') }}</AuthButton>
      </div>
    </Form>

    <div v-if="foundOrg" class="mt-6">
      <p class="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">Kết quả</p>
      <button class="mt-2.5 w-full flex items-center gap-3 rounded-xl border border-border bg-white p-3 text-left hover:border-primary transition-colors" @click="goToLogin">
        <span class="h-10 w-10 rounded-xl flex items-center justify-center font-heading font-bold text-white shrink-0 text-[13.5px]" style="background: hsl(203 89% 48%)">
          {{ initials(foundOrg.name) }}
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-[13.5px] font-semibold text-ink truncate">{{ foundOrg.name }}</span>
          <span class="block text-[11.5px] text-slate-500 font-mono">{{ $t('org.code') }}: {{ foundOrg.tag }}</span>
        </span>
        <ArrowRight :size="16" class="text-slate-400" />
      </button>
    </div>

    <template #footer>
      <span>{{ $t('auth.noOrg') }} <NuxtLink to="/organization/registration" class="text-[#1565c0] font-semibold hover:underline underline-offset-2">{{ $t('auth.registerNow') }}</NuxtLink></span>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Tag, ArrowRight } from 'lucide-vue-next'

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
  keyword: z.string({ required_error: t('org.findMin') }).min(2, t('org.findMin')),
}))

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('')
}

async function onSubmit(values: Record<string, unknown>) {
  errorMsg.value = ''
  foundOrg.value = null

  const body = new URLSearchParams()
  body.append('tag_organization', values.keyword as string)

  try {
    const config = useRuntimeConfig()
    const res = await $fetch<{ status: number; message: string; data: { id: number; name: string; tag: string } | null }>(
      `${config.public.apiBase}/api/organization/find-organization`,
      { method: 'POST', body: body.toString(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
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
        org_id: foundOrg.value.id,
        org_name: foundOrg.value.name,
      }
    })
  }
}
</script>
