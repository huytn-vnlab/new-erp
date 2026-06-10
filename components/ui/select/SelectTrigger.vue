<script setup lang="ts">
import { SelectTrigger, type SelectTriggerProps, useForwardProps } from 'reka-ui'
import { ChevronDown } from 'lucide-vue-next'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/utils'

const props = defineProps<SelectTriggerProps & { class?: HTMLAttributes['class'] }>()

const forwarded = useForwardProps(props)
</script>

<template>
  <SelectTrigger
    v-bind="forwarded"
    :class="cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground transition-colors hover:border-primary focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      props.class
    )"
  >
    <slot />
    <ChevronDown class="h-4 w-4 opacity-50 shrink-0" />
  </SelectTrigger>
</template>
