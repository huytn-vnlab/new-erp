<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="flex items-center gap-3 text-[11.5px] uppercase tracking-[0.14em] text-slate-400">
    <span class="h-px flex-1 bg-border" />{{ label }}<span class="h-px flex-1 bg-border" />
  </div>
</template>
