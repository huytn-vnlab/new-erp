<script setup lang="ts">
import type { Component } from 'vue'
defineProps<{ icon: Component; title: string; description?: string }>()
</script>
<template>
  <div data-test="empty-state" class="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <component :is="icon" :size="40" class="text-muted-foreground/40" />
    <p class="text-sm font-medium text-foreground">{{ title }}</p>
    <p v-if="description" class="text-xs text-muted-foreground">{{ description }}</p>
    <slot name="action" />
  </div>
</template>
