<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { AvatarRoot, type AvatarRootProps } from 'reka-ui'
import { cn } from '~/utils/cn'

interface Props extends AvatarRootProps {
  class?: HTMLAttributes['class']
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
}

const delegatedProps = computed(() => {
  const { class: _, size: __, ...delegated } = props
  return delegated
})
</script>

<template>
  <AvatarRoot
    :class="cn(
      'relative flex shrink-0 overflow-hidden rounded-full font-semibold',
      sizeClasses[size],
      props.class,
    )"
    v-bind="delegatedProps"
  >
    <slot />
  </AvatarRoot>
</template>
