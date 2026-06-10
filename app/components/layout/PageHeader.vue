<script setup lang="ts">
defineProps<{ eyebrow?: string; title?: string; description?: string }>()
</script>
<template>
  <div class="rise">
    <div class="flex items-start justify-between gap-6 flex-wrap">
      <div class="min-w-0 flex-1">
        <p v-if="eyebrow" class="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground mb-1.5">{{ eyebrow }}</p>
        <h1 v-if="title" class="text-[26px] font-bold font-heading text-foreground leading-tight">{{ title }}</h1>
        <p v-if="description" class="text-[13px] text-muted-foreground mt-1.5 max-w-2xl">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2 flex-nowrap shrink-0"><slot name="actions" /></div>
    </div>
    <slot />
  </div>
</template>
