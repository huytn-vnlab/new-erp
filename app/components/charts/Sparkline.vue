<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  data: number[]; width?: number; height?: number; stroke?: string; filled?: boolean
}>(), { width: 96, height: 32, stroke: 'currentColor', filled: true })

const gradId = `sg-${Math.random().toString(36).slice(2, 7)}`
const geom = computed(() => {
  const d = props.data
  if (!d.length) return null
  const min = Math.min(...d), max = Math.max(...d)
  const range = max - min || 1
  const stepX = props.width / (d.length - 1 || 1)
  const pts = d.map((v, i) => [i * stepX, props.height - ((v - min) / range) * (props.height - 4) - 2])
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const area = `${path} L${props.width},${props.height} L0,${props.height} Z`
  return { path, area, last: pts[pts.length - 1]! }
})
</script>

<template>
  <svg v-if="geom" :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" class="overflow-visible">
    <defs>
      <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="stroke" stop-opacity="0.22" />
        <stop offset="100%" :stop-color="stroke" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path v-if="filled" :d="geom.area" :fill="`url(#${gradId})`" />
    <path :d="geom.path" fill="none" :stroke="stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    <circle :cx="geom.last[0]" :cy="geom.last[1]" r="2.5" :fill="stroke" />
  </svg>
</template>
