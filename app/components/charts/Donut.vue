<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ used: number; total: number; size?: number; stroke?: number; label?: string; sublabel?: string }>(), { size: 132, stroke: 12 })
const r = computed(() => (props.size - props.stroke) / 2)
const c = computed(() => 2 * Math.PI * r.value)
const offset = computed(() => c.value * (1 - Math.min(props.used / props.total, 1)))
</script>
<template>
  <div class="relative inline-flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="rotate-[-90deg]">
      <circle :cx="size/2" :cy="size/2" :r="r" fill="none" stroke="hsl(var(--muted))" :stroke-width="stroke" />
      <circle
:cx="size/2" :cy="size/2" :r="r" fill="none" stroke="url(#donut-grad)" :stroke-width="stroke"
              stroke-linecap="round" :stroke-dasharray="c" :stroke-dashoffset="offset"
              style="transition: stroke-dashoffset 0.9s cubic-bezier(.2,.7,.2,1)" />
      <defs>
        <linearGradient id="donut-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(var(--primary-h) var(--primary-s) 65%)" />
          <stop offset="100%" stop-color="hsl(var(--primary-h) var(--primary-s) 45%)" />
        </linearGradient>
      </defs>
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-2xl font-bold font-heading text-foreground tabular-nums">{{ label }}</span>
      <span v-if="sublabel" class="text-[11px] text-muted-foreground mt-0.5">{{ sublabel }}</span>
    </div>
  </div>
</template>
