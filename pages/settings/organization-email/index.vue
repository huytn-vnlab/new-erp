<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h2 class="text-base font-semibold text-gray-800 mb-6">Cài đặt Email tổ chức</h2>

      <AppAlert v-if="serverError" variant="error" dismissible class="mb-4">{{ serverError }}</AppAlert>
      <AppAlert v-if="success" variant="success" dismissible class="mb-4">Lưu thành công!</AppAlert>

      <div class="space-y-4">
        <AppInput v-model="form.smtp_host" label="SMTP Host" placeholder="smtp.gmail.com" />
        <AppInput v-model="form.smtp_port" label="SMTP Port" type="number" placeholder="587" />
        <AppInput v-model="form.smtp_user" label="Email gửi" type="email" placeholder="noreply@company.com" />
        <AppInput v-model="form.smtp_password" label="Mật khẩu / App password" type="password" />
        <AppInput v-model="form.from_name" label="Tên hiển thị người gửi" placeholder="Micro ERP" />
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <AppButton variant="secondary" :loading="testing" @click="testEmail">Gửi email test</AppButton>
        <AppButton :loading="saving" @click="save">{{ $t('common.save') }}</AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Cài đặt Email — Micro ERP' })

const { post } = useApi()
const toast = useToast()

const saving = ref(false)
const testing = ref(false)
const serverError = ref('')
const success = ref(false)

const form = ref({ smtp_host: '', smtp_port: 587, smtp_user: '', smtp_password: '', from_name: '' })

onMounted(async () => {
  try {
    const res = await post('/setting/get-email-setting', {})
    if (res.data) Object.assign(form.value, res.data)
  } catch { /* no config yet */ }
})

async function save() {
  saving.value = true; serverError.value = ''; success.value = false
  try {
    await post('/setting/update-email-setting', form.value)
    success.value = true
    toast.success('Cài đặt email đã được lưu')
  } catch (err: any) {
    serverError.value = err?.message ?? 'Lưu không thành công.'
  } finally { saving.value = false }
}

async function testEmail() {
  testing.value = true
  try {
    await post('/setting/test-email', { email: form.value.smtp_user })
    toast.success('Email test đã được gửi')
  } catch (err: any) {
    toast.error(err?.message ?? 'Gửi email test thất bại.')
  } finally { testing.value = false }
}
</script>
