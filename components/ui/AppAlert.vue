<template>
  <div v-if="show" :class="['flex items-start gap-3 rounded-lg px-4 py-3 text-sm', variantClass]" role="alert">
    <svg class="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path v-if="variant === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      <path v-else-if="variant === 'error'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <path v-else-if="variant === 'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    <div class="flex-1 min-w-0">
      <slot />
    </div>
    <button v-if="dismissible" class="opacity-60 hover:opacity-100" @click="show = false">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'success' | 'error' | 'warning' | 'info'
  dismissible?: boolean
}>(), {
  variant: 'info',
  dismissible: false,
})

const show = ref(true)

const variantClass = computed(() => ({
  success: 'bg-green-50 text-green-800 border border-green-200',
  error:   'bg-red-50 text-red-800 border border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  info:    'bg-blue-50 text-blue-800 border border-blue-200',
}[props.variant]))
</script>
