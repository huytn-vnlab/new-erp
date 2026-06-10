<script setup lang="ts">
defineProps<{ modelValue: string; items: { value: string; label: string; count?: number }[] }>()
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="border-b border-border/70">
    <div class="flex gap-7">
      <button v-for="t in items" :key="t.value" class="tab-trigger inline-flex items-center gap-2"
              :data-active="modelValue === t.value" @click="$emit('update:modelValue', t.value)">
        {{ t.label }}
        <span v-if="t.count != null"
              :class="'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums ' + (modelValue === t.value ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')">
          {{ t.count }}
        </span>
      </button>
    </div>
  </div>
</template>
