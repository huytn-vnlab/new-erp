<script setup lang="ts">
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, VisuallyHidden } from 'reka-ui'

withDefaults(defineProps<{ open: boolean; title?: string; maxWidth?: number }>(), { maxWidth: 448 })
const emit = defineEmits<{ 'update:open': [boolean] }>()
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" />
      <DialogContent
        class="fixed inset-y-0 right-0 z-50 w-full bg-background border-l border-border h-full flex flex-col rise focus:outline-none"
        :style="{ maxWidth: maxWidth + 'px' }"
      >
        <VisuallyHidden><DialogTitle>{{ title }}</DialogTitle></VisuallyHidden>
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
