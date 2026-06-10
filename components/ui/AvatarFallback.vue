<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { AvatarFallback, type AvatarFallbackProps } from 'reka-ui'
import { cn } from '~/utils/cn'

const props = defineProps<AvatarFallbackProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <AvatarFallback
    v-bind="delegatedProps"
    :class="cn('flex h-full w-full items-center justify-center rounded-full bg-muted', props.class)"
  >
    <slot />
  </AvatarFallback>
</template>
