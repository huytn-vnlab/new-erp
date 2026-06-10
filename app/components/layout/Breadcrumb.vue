<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
defineProps<{ crumbs: { label: string }[] }>()
</script>
<template>
  <ol class="flex items-center gap-2 text-[13px]">
    <template v-for="(c, i) in crumbs" :key="i">
      <ChevronRight v-if="i > 0" :size="12" class="text-muted-foreground/60" />
      <li :class="i === crumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground cursor-pointer'">
        {{ c.label }}
      </li>
    </template>
  </ol>
</template>
