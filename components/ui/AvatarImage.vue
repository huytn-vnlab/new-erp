<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { AvatarImage, type AvatarImageProps } from 'reka-ui'
import { cn } from '~/utils/cn'

const props = defineProps<AvatarImageProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <AvatarImage
    v-bind="delegatedProps"
    :class="cn('aspect-square h-full w-full object-cover', props.class)"
  />
</template>
