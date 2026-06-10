<script setup lang="ts">
import { SelectSeparator, type SelectSeparatorProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/utils'

const props = defineProps<SelectSeparatorProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <SelectSeparator v-bind="forwarded" :class="cn('-mx-1 my-1 h-px bg-muted', props.class)">
    <slot />
  </SelectSeparator>
</template>
