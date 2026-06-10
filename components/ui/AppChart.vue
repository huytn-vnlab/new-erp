<template>
  <div class="relative">
    <canvas ref="canvasRef" :style="{ height: `${height}px` }" />
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-white/60"
    >
      <AppSpinner size="sm" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * AppChart — thin wrapper around Chart.js loaded via dynamic import (ARCH-06).
 *
 * Chart.js and its dependencies are split into a separate async chunk and only
 * fetched when the component is actually mounted — keeping the initial bundle
 * lean.
 *
 * Props mirror the Chart.js constructor signature so callers can pass any
 * supported chart type ('bar', 'line', 'doughnut', etc.) with typed config.
 */
import type { ChartConfiguration, Chart as ChartInstance } from 'chart.js'

interface Props {
  type:    ChartConfiguration['type']
  data:    ChartConfiguration['data']
  options?: ChartConfiguration['options']
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height:  220,
  options: () => ({}),
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loading   = ref(true)

let chartInstance: ChartInstance | null = null

async function buildChart() {
  if (!canvasRef.value) return
  loading.value = true

  try {
    // Dynamic import — chart.js/auto registers all controllers, elements, scales
    const { Chart } = await import('chart.js/auto')

    // Destroy previous instance (e.g. on data prop change)
    chartInstance?.destroy()

    chartInstance = new Chart(canvasRef.value, {
      type:    props.type,
      data:    props.data,
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
        },
        ...props.options,
      },
    })
  } catch (err) {
    console.error('[AppChart] buildChart failed:', err)
  } finally {
    loading.value = false
  }
}

// Rebuild whenever data changes
watch(() => [props.data, props.type], buildChart, { deep: true })

onMounted(buildChart)

onUnmounted(() => {
  chartInstance?.destroy()
  chartInstance = null
})
</script>
