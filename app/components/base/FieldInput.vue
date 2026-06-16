<script setup lang="ts">
import type { Component } from 'vue'
import { Search } from 'lucide-vue-next'

withDefaults(defineProps<{ modelValue?: string; placeholder?: string; icon?: Component; width?: number }>(), {
  modelValue: '', width: 220,
})
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/30 focus-within:border-primary/60 transition-colors" :style="{ width: width + 'px' }">
    <component :is="icon ?? Search" :size="14" class="text-muted-foreground" />
    <input
      type="text" :value="modelValue" :placeholder="placeholder"
      class="bg-transparent text-[13px] flex-1 appearance-none border-0 outline-none placeholder:text-muted-foreground/70 text-foreground min-w-0"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>
