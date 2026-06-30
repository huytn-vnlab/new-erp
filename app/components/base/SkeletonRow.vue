<script setup lang="ts">
const props = defineProps<{ cols: number; rows?: number }>()
const rowCount = computed(() => props.rows ?? 5)
</script>
<template>
  <tr v-for="r in rowCount" :key="r" data-test="skeleton-row">
    <td v-for="c in props.cols" :key="c" class="px-4 py-3">
      <div class="h-4 animate-pulse rounded bg-muted" />
    </td>
  </tr>
</template>
