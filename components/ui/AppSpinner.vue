<template>
  <svg
    :class="['animate-spin', sizeClass, colorClass]"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: string
}>(), {
  size: 'md',
  color: 'text-primary-600',
})

const sizeClass = computed(() => ({
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}[props.size]))

const colorClass = computed(() => props.color)
</script>
