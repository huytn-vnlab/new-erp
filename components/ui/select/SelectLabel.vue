<script setup lang="ts">
import { SelectLabel, type SelectLabelProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/utils'

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <SelectLabel v-bind="forwarded" :class="cn('py-1.5 pl-8 pr-2 text-sm font-semibold', props.class)">
    <slot />
  </SelectLabel>
</template>
