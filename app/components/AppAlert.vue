<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'error' | 'success' | 'warning' | 'info'
  dismissible?: boolean
}>(), { variant: 'error', dismissible: false })

const emit = defineEmits<{ dismiss: [] }>()

const classes = computed(() => ({
  error:   'bg-red-50 border-red-200 text-red-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  info:    'bg-blue-50 border-blue-200 text-blue-700',
}[props.variant]))
</script>

<template>
  <div :class="['rounded border px-4 py-3 text-sm flex items-start justify-between gap-2', classes]">
    <span><slot /></span>
    <button
      v-if="dismissible"
      class="shrink-0 opacity-60 hover:opacity-100 leading-none"
      @click="emit('dismiss')"
    >✕</button>
  </div>
</template>
