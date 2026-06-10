<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ label: string; value: number; max: number; accent?: boolean }>(), { accent: false })
const pct = computed(() => Math.round((props.value / props.max) * 100))
const bg = computed(() => props.accent
  ? 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 67%), hsl(var(--primary-h) var(--primary-s) 47%))'
  : 'hsl(var(--primary-h) var(--primary-s) 70%)')
</script>
<template>
  <div class="flex items-center gap-3">
    <span class="text-sm text-foreground w-32 shrink-0 truncate font-medium">{{ label }}</span>
    <div class="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
      <div
class="h-full rounded-full transition-all duration-700" :data-pct="pct"
           :style="{ width: pct + '%', background: bg, opacity: accent ? 1 : 0.55 }" />
    </div>
    <span class="text-sm font-semibold tabular-nums text-foreground w-10 text-right shrink-0">{{ value }}</span>
  </div>
</template>
