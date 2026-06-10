<script setup lang="ts">
withDefaults(defineProps<{ title?: string; delay?: number }>(), { delay: 0 })
</script>
<template>
  <div class="card-surface rise" :style="{ animationDelay: delay + 'ms' }">
    <div v-if="title || $slots.action" class="px-5 py-3.5 border-b border-border/70 flex items-center justify-between gap-3">
      <h3 class="section-title">{{ title }}</h3>
      <slot name="action" />
    </div>
    <div class="p-5">
      <slot />
    </div>
  </div>
</template>
