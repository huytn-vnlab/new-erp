<script setup lang="ts">
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from 'reka-ui'
import { X } from 'lucide-vue-next'

withDefaults(defineProps<{ open: boolean; title?: string; maxWidth?: number }>(), { maxWidth: 480 })
const emit = defineEmits<{ 'update:open': [boolean] }>()
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/45 backdrop-blur-[4px]" />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] card-surface rise overflow-hidden focus:outline-none"
        :style="{ maxWidth: maxWidth + 'px', borderRadius: '18px' }"
      >
        <div v-if="title || $slots.header" class="flex items-center justify-between px-6 py-4 border-b border-border">
          <slot name="header"><DialogTitle class="font-heading font-bold text-[15px] text-foreground">{{ title }}</DialogTitle></slot>
          <DialogClose class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><X :size="14" /></DialogClose>
        </div>
        <DialogTitle v-else class="sr-only">{{ title }}</DialogTitle>
        <slot />
        <div v-if="$slots.footer" class="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/70 bg-muted/20">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
