<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <h3
    :class="
      cn('font-semibold font-heading leading-snug text-primary', props.class)
    "
  >
    <slot />
  </h3>
</template>
