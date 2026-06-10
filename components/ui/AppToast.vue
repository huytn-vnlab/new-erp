<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" aria-live="polite">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg max-w-sm w-full', bgClass(toast.variant)]"
        >
          <!-- Icon -->
          <svg class="h-5 w-5 shrink-0 mt-0.5" :class="iconColor(toast.variant)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="toast.variant === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            <path v-else-if="toast.variant === 'error'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            <path v-else-if="toast.variant === 'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>

          <!-- Message -->
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>

          <!-- Dismiss -->
          <button class="text-current opacity-60 hover:opacity-100 shrink-0" @click="remove(toast.id)">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ToastVariant } from '~/composables/useToast'

const { toasts, remove } = useToast()

const bgClass = (v: ToastVariant) => ({
  success: 'bg-green-50 text-green-800 border border-green-200',
  error:   'bg-red-50 text-red-800 border border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  info:    'bg-blue-50 text-blue-800 border border-blue-200',
}[v])

const iconColor = (v: ToastVariant) => ({
  success: 'text-green-500',
  error:   'text-red-500',
  warning: 'text-yellow-500',
  info:    'text-blue-500',
}[v])
</script>
