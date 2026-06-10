<template>
  <div class="max-w-2xl mx-auto">
    <div class="card text-center py-12">
      <div class="flex justify-center mb-4">
        <div class="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Cài đặt hoàn tất!</h2>
      <p class="text-gray-500 mb-8">Hệ thống đã được cấu hình và sẵn sàng sử dụng.</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto">
        <NuxtLink to="/hrm/member/profile-list">
          <AppButton class="w-full" variant="secondary">Quản lý nhân viên</AppButton>
        </NuxtLink>
        <NuxtLink to="/settings/job-title">
          <AppButton class="w-full" variant="secondary">Quay lại cài đặt</AppButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Cài đặt hoàn tất — Micro ERP' })
</script>
