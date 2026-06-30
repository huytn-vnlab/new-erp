<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>
<template>
  <div data-test="error-banner" class="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-800 dark:bg-red-950/30">
    <AlertCircle :size="16" class="shrink-0 text-red-500" />
    <span class="flex-1 text-red-700 dark:text-red-400">{{ message }}</span>
    <button data-test="retry-btn" class="shrink-0 text-xs font-medium text-red-600 underline hover:no-underline dark:text-red-400" @click="$emit('retry')">
      Thử lại
    </button>
  </div>
</template>
