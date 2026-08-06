<script setup lang="ts">
withDefaults(defineProps<{ total?: number; current: number }>(), { total: 2 })
</script>

<template>
  <div class="flex items-center gap-1.5">
    <span
      v-for="i in total"
      :key="i"
      class="h-1 rounded-full transition-all"
      :class="i - 1 === current ? 'w-6 bg-[#109cf1]' : i - 1 < current ? 'w-3 bg-[#109cf1]/40' : 'w-3 bg-border'"
    />
  </div>
</template>
