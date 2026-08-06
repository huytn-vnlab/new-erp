<script setup lang="ts">
import type { Component } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  label: string
  icon?: Component
  type?: string
  placeholder?: string
  hint?: string
  error?: string
  autoFocus?: boolean
}>(), {
  modelValue: '',
  type: 'text',
})

defineEmits<{ 'update:modelValue': [string] }>()

const reveal = ref(false)
const isPw = computed(() => props.type === 'password')
const inputType = computed(() => (isPw.value && !reveal.value ? 'password' : isPw.value ? 'text' : props.type))
</script>

<template>
  <label class="block">
    <span class="flex items-baseline justify-between gap-3">
      <span class="text-[12.5px] font-semibold tracking-[0.01em] text-ink">{{ label }}</span>
      <slot name="right" />
    </span>
    <span
      class="mt-1.5 flex items-center gap-2 rounded-[10px] border bg-white px-3.5 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(16,156,241,0.16)]"
      :class="error ? 'border-rose-400' : 'border-border focus-within:border-[#109cf1]'"
    >
      <component :is="icon" v-if="icon" :size="15" class="text-slate-400 shrink-0" />
      <input
        :type="inputType"
        :value="modelValue"
        :autofocus="autoFocus"
        :placeholder="placeholder"
        class="flex-1 min-w-0 bg-transparent py-2.5 text-[13.5px] text-ink placeholder:text-slate-400 outline-none"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <button v-if="isPw" type="button" class="text-[11.5px] font-medium text-slate-400 hover:text-ink shrink-0" @click="reveal = !reveal">
        {{ reveal ? 'Ẩn' : 'Hiện' }}
      </button>
    </span>
    <span v-if="error || hint" class="mt-1.5 block text-[11.5px]" :class="error ? 'text-rose-600' : 'text-slate-500'">{{ error || hint }}</span>
  </label>
</template>
