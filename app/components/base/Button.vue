<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md'
}>(), { variant: 'primary', size: 'md' })

defineEmits<{ click: [MouseEvent] }>()

const sizeCls = computed(() =>
  props.size === 'sm' ? 'h-8 px-2.5 text-[12.5px]'
  : props.size === 'xs' ? 'h-7 px-2 text-[11.5px]'
  : 'h-9 px-3.5 text-[13px]')

const variantCls = computed(() => ({
  primary: 'text-white shadow-sm hover:scale-[1.02] active:scale-[0.98]',
  outline: 'border border-border bg-card text-foreground hover:border-primary/60 hover:bg-muted/40',
  ghost: 'text-foreground/80 hover:bg-muted hover:text-foreground',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600',
}[props.variant]))

const style = computed(() => props.variant === 'primary'
  ? { background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }
  : {})
</script>

<template>
  <button
    :class="cn('inline-flex items-center gap-1.5 rounded-md font-semibold transition-all whitespace-nowrap', sizeCls, variantCls)"
    :style="style"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
