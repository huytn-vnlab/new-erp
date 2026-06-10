<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'
  dot?: boolean
}>(), { variant: 'gray', dot: false })

const MAP = {
  gray: { bg: 'hsl(var(--muted))', fg: 'hsl(var(--muted-foreground))', dot: 'hsl(var(--muted-foreground))' },
  primary: { bg: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.10)', fg: 'hsl(var(--primary))', dot: 'hsl(var(--primary))' },
  green: { bg: 'hsl(160 60% 90%)', fg: 'hsl(160 60% 30%)', dot: 'hsl(160 60% 45%)' },
  red: { bg: 'hsl(0 80% 95%)', fg: 'hsl(0 70% 45%)', dot: 'hsl(0 70% 55%)' },
  amber: { bg: 'hsl(38 95% 92%)', fg: 'hsl(35 90% 38%)', dot: 'hsl(38 92% 50%)' },
  sky: { bg: 'hsl(203 89% 92%)', fg: 'hsl(203 89% 35%)', dot: 'hsl(203 89% 50%)' },
  violet: { bg: 'hsl(270 70% 95%)', fg: 'hsl(265 60% 45%)', dot: 'hsl(265 60% 55%)' },
}
const v = computed(() => MAP[props.variant] ?? MAP.gray)
</script>

<template>
  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono"
        :style="{ background: v.bg, color: v.fg }">
    <span v-if="dot" data-dot class="h-1.5 w-1.5 rounded-full" :style="{ background: v.dot }" />
    <slot />
  </span>
</template>
