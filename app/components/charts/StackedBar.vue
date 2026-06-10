<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ segments: { label: string; value: number; color: string }[]; height?: number }>(), { height: 8 })
const total = computed(() => props.segments.reduce((a, s) => a + s.value, 0) || 1)
</script>
<template>
  <div class="flex w-full overflow-hidden rounded-full" :style="{ height: height + 'px' }">
    <div v-for="(s, i) in segments" :key="i" :title="`${s.label}: ${s.value}`"
         :style="{ width: (s.value / total) * 100 + '%', background: s.color }" />
  </div>
</template>
