<template>
  <div class="max-w-xl mx-auto">
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <!-- Success -->
        <div v-if="successMsg" class="mb-4 rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          {{ successMsg }}
        </div>
        <!-- Error -->
        <div v-if="errorMsg" class="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {{ errorMsg }}
        </div>

        <Form :validation-schema="schema" @submit="onSubmit" v-slot="{ isSubmitting }">
          <div class="space-y-4 mb-6">
            <Field name="current_password" v-slot="{ field, errors }">
              <div class="space-y-1.5">
                <label class="text-sm font-medium leading-none">Mật khẩu hiện tại <span class="text-destructive">*</span></label>
                <Input v-bind="field" type="password" autocomplete="current-password" :class="errors.length ? 'border-destructive focus-visible:ring-destructive' : ''" />
                <p v-if="errors[0]" class="text-xs text-destructive">{{ errors[0] }}</p>
              </div>
            </Field>
            <Field name="new_password" v-slot="{ field, errors }">
              <div class="space-y-1.5">
                <label class="text-sm font-medium leading-none">Mật khẩu mới <span class="text-destructive">*</span></label>
                <Input v-bind="field" type="password" autocomplete="new-password" :class="errors.length ? 'border-destructive focus-visible:ring-destructive' : ''" />
                <p v-if="errors[0]" class="text-xs text-destructive">{{ errors[0] }}</p>
              </div>
            </Field>
            <Field name="repeat_new_password" v-slot="{ field, errors }">
              <div class="space-y-1.5">
                <label class="text-sm font-medium leading-none">Xác nhận mật khẩu mới <span class="text-destructive">*</span></label>
                <Input v-bind="field" type="password" autocomplete="new-password" :class="errors.length ? 'border-destructive focus-visible:ring-destructive' : ''" />
                <p v-if="errors[0]" class="text-xs text-destructive">{{ errors[0] }}</p>
              </div>
            </Field>
          </div>

          <Button type="submit" :disabled="isSubmitting" class="w-full">
            <AppSpinner v-if="isSubmitting" class="mr-2 h-4 w-4" />
            Đổi mật khẩu
          </Button>
        </Form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { handleApiError } from '~/utils/error-handler'
import Card from '~/components/ui/Card.vue'
import CardHeader from '~/components/ui/CardHeader.vue'
import CardTitle from '~/components/ui/CardTitle.vue'
import CardContent from '~/components/ui/CardContent.vue'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import AppSpinner from '~/components/ui/AppSpinner.vue'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: 'Đổi mật khẩu — Micro ERP' })

const { post } = useApi()
const successMsg = ref('')
const errorMsg   = ref('')

const schema = toTypedSchema(z.object({
  current_password:    z.string().min(8, 'Ít nhất 8 ký tự'),
  new_password:        z.string().min(8, 'Ít nhất 8 ký tự'),
  repeat_new_password: z.string().min(8, 'Ít nhất 8 ký tự'),
}).refine(d => d.new_password === d.repeat_new_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['repeat_new_password'],
}))

async function onSubmit(values: any, { resetForm }: any) {
  successMsg.value = ''
  errorMsg.value   = ''
  try {
    await post('/api/user/changepassword', {
      current_password:    values.current_password,
      new_password:        values.new_password,
      repeat_new_password: values.repeat_new_password,
    })
    successMsg.value = 'Đã đổi mật khẩu thành công!'
    resetForm()
  } catch (err) {
    const e = err as any
    const status = e?.response?.status ?? e?.status
    if (status === 401 || status === 400) {
      errorMsg.value = 'Mật khẩu hiện tại không đúng.'
    } else {
      errorMsg.value = handleApiError(err)
    }
  }
}
</script>
