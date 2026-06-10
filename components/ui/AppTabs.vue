<template>
  <div>
    <!-- Tab bar -->
    <div class="flex gap-1 border-b border-border" :class="navClass">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none"
        :class="modelValue === tab.value
          ? 'text-primary border-b-2 border-primary'
          : 'text-muted-foreground hover:text-foreground'"
        :disabled="tab.disabled"
        @click="$emit('update:modelValue', tab.value)"
      >
        {{ tab.label }}
        <span
          v-if="tab.badge != null"
          class="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none rounded-full"
          :class="modelValue === tab.value ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'"
        >
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <!-- Tab content -->
    <div class="mt-4">
      <slot :active="modelValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Tab {
  value:    string
  label:    string
  badge?:   number | string | null
  disabled?: boolean
}

defineProps<{
  tabs:       Tab[]
  modelValue: string
  navClass?:  string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
