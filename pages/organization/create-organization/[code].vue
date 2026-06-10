<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-800 mb-2 text-center">Xác nhận tổ chức</h2>
    <p class="text-sm text-gray-500 text-center mb-6">Xác minh email để kích hoạt tổ chức của bạn.</p>

    <div v-if="loading" class="flex justify-center py-8"><AppSpinner /></div>

    <template v-else>
      <AppAlert v-if="success" variant="success" class="mb-4">
        Tổ chức đã được kích hoạt thành công! Bạn có thể đăng nhập ngay.
      </AppAlert>
      <AppAlert v-else-if="errorMsg" variant="error" class="mb-4">{{ errorMsg }}</AppAlert>

      <div class="text-center mt-4">
        <NuxtLink to="/organization/find-organization" class="text-sm text-primary-600 hover:underline">
          Đến trang đăng nhập
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({ title: 'Xác nhận tổ chức — Micro ERP' })

const route    = useRoute()
const { post } = useApi()
const loading  = ref(true)
const success  = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  try {
    await post('/organization/verify-organization', { code: route.params.code })
    success.value = true
  } catch (err: any) {
    errorMsg.value = err?.message ?? 'Mã xác nhận không hợp lệ hoặc đã hết hạn.'
  } finally {
    loading.value = false
  }
})
</script>
