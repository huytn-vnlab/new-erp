<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name: string; size?: number; hue?: number }>(), { size: 32 })

const initials = computed(() => {
  const parts = (props.name || '?').split(' ').filter(Boolean)
  if (!parts.length) return '?'
  return parts.map(p => p[0]).slice(-2).join('').toUpperCase()
})
const hue = computed(() => {
  if (props.hue != null) return props.hue
  let h = 0
  for (let i = 0; i < (props.name || '').length; i++) h = (h * 31 + props.name.charCodeAt(i)) % 360
  return h
})
</script>

<template>
  <span
class="inline-flex items-center justify-center font-semibold text-white shrink-0 rounded-lg font-heading"
        :style="{ width: size + 'px', height: size + 'px', fontSize: size * 0.36 + 'px',
          background: `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${(hue + 30) % 360} 65% 42%))` }">
    {{ initials }}
  </span>
</template>
