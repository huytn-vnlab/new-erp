<template>
  <span :class="['badge', variantClass]">
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'gray'
}>(), {
  variant: 'gray',
})

const variantClass = computed(() => `badge-${props.variant}`)
</script>
