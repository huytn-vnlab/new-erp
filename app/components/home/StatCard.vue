<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Users, Folder, Star, TrendingUp, TrendingDown } from 'lucide-vue-next'
import Sparkline from '~/components/charts/Sparkline.vue'
import type { StatCardData } from '~/types'

const props = withDefaults(defineProps<StatCardData & { delay?: number }>(), { delay: 0 })
const ICONS: Record<string, Component> = { Users, Folder, Star }
const trendUp = computed(() => props.trend?.dir === 'up')
</script>

<template>
  <div
class="card-surface interactive p-5 rise flex flex-col gap-4"
       :style="{ animationDelay: delay + 'ms', backgroundImage: 'radial-gradient(ellipse 80% 60% at 100% 0%, hsl(var(--primary-h) var(--primary-s) 57% / 0.09), transparent 70%)' }">
    <div class="flex items-start justify-between gap-3">
      <div>
        <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{{ label }}</span>
        <div class="mt-1.5 flex items-baseline gap-2">
          <span class="text-[34px] font-bold text-foreground font-heading tabular-nums leading-none">{{ value }}</span>
          <span v-if="trend" :class="'inline-flex items-center gap-0.5 text-[12px] font-semibold tabular-nums ' + (trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')">
            <component :is="trendUp ? TrendingUp : TrendingDown" :size="12" />{{ trend.value }}
          </span>
        </div>
        <p v-if="sublabel" class="text-[12px] text-muted-foreground mt-1">{{ sublabel }}</p>
      </div>
      <div
class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
           :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60% / 0.16), hsl(var(--primary-h) var(--primary-s) 40% / 0.10))', color: 'hsl(var(--primary))' }">
        <component :is="ICONS[icon]" :size="18" />
      </div>
    </div>
    <div v-if="sparkData" class="text-primary -mx-1">
      <Sparkline :data="sparkData" :width="240" :height="36" stroke="currentColor" />
    </div>
    <div v-if="breakdown" class="space-y-1.5 pt-2 border-t border-border/70">
      <div v-for="(b, i) in breakdown" :key="i" class="flex items-center justify-between text-[12px]">
        <span class="text-muted-foreground">{{ b.label }}</span>
        <span class="font-semibold text-foreground tabular-nums">{{ b.value }}</span>
      </div>
    </div>
  </div>
</template>
