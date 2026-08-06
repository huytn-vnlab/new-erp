<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowRight } from 'lucide-vue-next'

withDefaults(defineProps<{
  variant?: 'primary' | 'ghost'
  disabled?: boolean
  type?: 'button' | 'submit'
  icon?: Component
  arrow?: boolean
}>(), {
  variant: 'primary',
  disabled: false,
  type: 'button',
  arrow: true,
})

defineEmits<{ click: [MouseEvent] }>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :style="variant === 'primary' && !disabled ? { background: 'linear-gradient(135deg,#109cf1,#1565c0)', boxShadow: '0 4px 20px rgba(16,156,241,0.4)' } : undefined"
    class="group w-full h-11 rounded-[10px] text-[13.5px] font-bold inline-flex items-center justify-center gap-2 transition-all"
    :class="variant === 'ghost'
      ? 'border border-border bg-white text-ink hover:bg-slate-50'
      : disabled
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
        : 'text-white hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(16,156,241,0.5)]'"
    @click="$emit('click', $event)"
  >
    <component :is="icon" v-if="icon" :size="16" />
    <slot />
    <span v-if="arrow && variant === 'primary' && !disabled" class="transition-transform group-hover:translate-x-0.5">
      <ArrowRight :size="15" />
    </span>
  </button>
</template>
