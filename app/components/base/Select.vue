<script setup lang="ts">
import { computed } from 'vue'
import {
  SelectRoot, SelectTrigger, SelectValue, SelectIcon, SelectPortal,
  SelectContent, SelectViewport, SelectItem, SelectItemText, SelectItemIndicator,
} from 'reka-ui'
import { ChevronDown, Check } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue?: string
  options: { value: string; label: string }[]
  placeholder?: string
  width?: number
}>(), { placeholder: 'Chọn…', width: 160 })
const emit = defineEmits<{ 'update:modelValue': [string] }>()

/** Computed label shown in trigger — works in SSR/test without portal items mounted */
const displayLabel = computed(() => {
  if (!props.modelValue) return ''
  return props.options.find(o => o.value === props.modelValue)?.label ?? ''
})
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="emit('update:modelValue', ($event as string))">
    <SelectTrigger
      :style="{ width: width + 'px' }"
      class="h-9 pl-3 pr-8 rounded-md border border-border bg-muted/30 hover:border-primary/40 data-[state=open]:border-primary/60 text-[13px] text-left inline-flex items-center justify-between gap-2 outline-none transition-colors relative"
    >
      <!-- displayLabel shown directly so tests & SSR don't depend on portal items mounting -->
      <span v-if="displayLabel" class="truncate">{{ displayLabel }}</span>
      <SelectValue v-else :placeholder="placeholder" class="truncate" />
      <SelectIcon class="absolute right-2.5 top-1/2 -translate-y-1/2">
        <ChevronDown :size="12" class="text-muted-foreground" />
      </SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        position="popper" :side-offset="4"
        class="z-[9999] min-w-[var(--reka-select-trigger-width)] rounded-xl border border-border bg-popover shadow-popover overflow-hidden"
      >
        <SelectViewport class="max-h-60 overflow-y-auto scrollbar-thin py-1">
          <SelectItem
            v-for="o in options" :key="o.value" :value="o.value"
            class="w-full flex items-center gap-2 pl-3 pr-2.5 py-2 text-[13px] text-foreground/85 text-left cursor-pointer outline-none data-[highlighted]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-medium"
          >
            <SelectItemText>{{ o.label }}</SelectItemText>
            <SelectItemIndicator class="ml-auto">
              <Check :size="13" class="text-primary" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
