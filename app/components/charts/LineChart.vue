<script setup lang="ts">
import { VisXYContainer, VisLine, VisArea, VisAxis, VisScatter } from '@unovis/vue'

type D = { label: string; value: number }
const props = withDefaults(defineProps<{ data: D[]; height?: number }>(), { height: 220 })

const x = (_d: D, i: number) => i
const y = (d: D) => d.value
const tickFormat = (i: number) => props.data[i]?.label ?? ''
</script>

<template>
  <div class="erp-linechart w-full" :style="{ height: height + 'px' }">
    <VisXYContainer :data="data" :height="height">
      <VisArea :x="x" :y="y" color="hsl(var(--primary))" :opacity="0.18" />
      <VisLine :x="x" :y="y" color="hsl(var(--primary))" :line-width="2" />
      <VisScatter :x="x" :y="y" color="hsl(var(--card))" :size="8"
                  stroke-color="hsl(var(--primary))" :stroke-width="2" />
      <VisAxis type="x" :tick-format="tickFormat" :grid-line="false" :tick-line="false" :domain-line="false" />
      <VisAxis type="y" :num-ticks="5" :grid-line="true" :tick-line="false" :domain-line="false" />
    </VisXYContainer>
  </div>
</template>

<style scoped>
/* Khớp mockup: gridline đứt nét màu border, nhãn mono, line bo tròn */
.erp-linechart :deep(.vis-axis-grid-line) { stroke: hsl(var(--border)); stroke-dasharray: 2 4; }
.erp-linechart :deep(.vis-axis-tick text) { fill: hsl(var(--muted-foreground)); font-family: var(--font-mono); font-size: 10px; }
.erp-linechart :deep(.vis-line) { stroke-linecap: round; stroke-linejoin: round; }
</style>
