<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-800 mb-2 text-center">Xác nhận đổi email</h2>

    <div v-if="loading" class="flex justify-center py-8"><AppSpinner /></div>

    <template v-else>
      <AppAlert v-if="success" variant="success" class="mb-4">
        Email tổ chức đã được cập nhật thành công!
      </AppAlert>
      <AppAlert v-else-if="errorMsg" variant="error" class="mb-4">{{ errorMsg }}</AppAlert>

      <div class="text-center mt-4">
        <NuxtLink to="/user/login" class="text-sm text-primary-600 hover:underline">
          ← Đến trang đăng nhập
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Xác nhận đổi email — Micro ERP' })

const route    = useRoute()
const { post } = useApi()
const loading  = ref(true)
const success  = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  try {
    await post('/organization/verify-change-email', { code: route.params.code })
    success.value = true
  } catch (err: any) {
    errorMsg.value = err?.message ?? 'Mã xác nhận không hợp lệ hoặc đã hết hạn.'
  } finally { loading.value = false }
})
</script>
