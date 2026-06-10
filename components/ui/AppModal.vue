<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { X } from 'lucide-vue-next'
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  persistent?: boolean
}>(), {
  title: '',
  description: '',
  size: 'md',
  persistent: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const sizeClass = computed(() => ({
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl':'max-w-2xl',
}[props.size]))
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

      <DialogContent
        :class="cn(
          'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 flex flex-col max-h-[90vh] bg-white rounded-2xl shadow-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          sizeClass,
        )"
        :disable-outside-pointer-events="persistent"
        @interact-outside="persistent ? ($event.preventDefault()) : undefined"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <DialogTitle class="text-primary text-xl font-semibold text-gray-900">{{ title }}</DialogTitle>
            <DialogDescription v-if="description" class="text-xs text-muted-foreground mt-0.5">{{ description }}</DialogDescription>
            <DialogDescription v-else class="sr-only">{{ title }}</DialogDescription>
          </div>
          <DialogClose
            v-if="!persistent"
            class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X class="h-4 w-4" />
          </DialogClose>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
