<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center max-w-md px-6">
      <p class="text-6xl font-bold text-gray-200 mb-4">{{ error?.statusCode ?? 500 }}</p>
      <h1 class="text-xl font-semibold text-gray-800 mb-2">
        {{ error?.statusCode === 404 ? 'Trang không tồn tại' : 'Đã xảy ra lỗi' }}
      </h1>
      <p class="text-sm text-gray-500 mb-6">{{ error?.message || 'Vui lòng thử lại hoặc quay về trang chủ.' }}</p>
      <button
        class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
        @click="handleError"
      >
        Quay về trang chủ
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; message?: string } | null }>()
const handleError = () => clearError({ redirect: '/home-admin' })
</script>
