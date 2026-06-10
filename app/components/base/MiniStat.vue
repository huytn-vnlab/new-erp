<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  value: string | number
  sublabel?: string
  trend?: { dir: 'up' | 'down'; value: string }
  accent?: 'primary' | 'green' | 'amber' | 'red' | 'violet' | 'gray' | 'sky'
  delay?: number
}>(), { accent: 'primary', delay: 0 })

const COLORS: Record<string, string> = {
  primary: 'hsl(var(--primary))', green: 'hsl(160 60% 45%)', amber: 'hsl(35 90% 50%)',
  red: 'hsl(0 75% 55%)', violet: 'hsl(265 60% 55%)', gray: 'hsl(220 14% 55%)', sky: 'hsl(203 89% 45%)',
}
const TINTS: Record<string, string> = {
  primary: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.09)', green: 'hsl(160 60% 45% / 0.09)',
  amber: 'hsl(35 90% 50% / 0.09)', red: 'hsl(0 75% 55% / 0.09)', violet: 'hsl(265 60% 55% / 0.09)',
  gray: 'hsl(220 14% 55% / 0.06)', sky: 'hsl(203 89% 45% / 0.09)',
}
const tint = computed(() => TINTS[props.accent] ?? TINTS.primary)
const color = computed(() => COLORS[props.accent] ?? COLORS.primary)
</script>

<template>
  <div class="card-surface p-4 rise"
       :style="{ animationDelay: delay + 'ms', backgroundImage: `radial-gradient(ellipse 90% 65% at 100% 0%, ${tint}, transparent 70%)` }">
    <div class="flex items-baseline justify-between">
      <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{{ label }}</p>
      <span v-if="trend" :class="'text-[11px] font-semibold tabular-nums ' + (trend.dir === 'up' ? 'text-emerald-600' : 'text-red-500')">
        {{ trend.dir === 'up' ? '↑' : '↓' }} {{ trend.value }}
      </span>
    </div>
    <p class="text-[26px] font-bold font-heading mt-1 tabular-nums" :style="{ color }">{{ value }}</p>
    <p v-if="sublabel" class="text-[11.5px] text-muted-foreground mt-0.5">{{ sublabel }}</p>
  </div>
</template>
