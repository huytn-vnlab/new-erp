<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'

const props = defineProps<{ page: number; total: number; perPage: number }>()
const emit = defineEmits<{ change: [number] }>()

const pages = computed(() => Math.ceil(props.total / props.perPage))
const from = computed(() => (props.page - 1) * props.perPage + 1)
const to = computed(() => Math.min(props.page * props.perPage, props.total))
const nums = computed(() => Array.from({ length: Math.min(pages.value, 5) }, (_, i) => i + 1))
const gradient = { background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }
</script>

<template>
  <div class="flex items-center justify-between px-5 py-3 border-t border-border/70 text-[12px] text-muted-foreground">
    <span>Hiển thị <span class="font-semibold text-foreground tabular-nums">{{ from }}-{{ to }}</span> trên <span class="font-semibold text-foreground tabular-nums">{{ total }}</span></span>
    <div class="flex items-center gap-1">
      <button :disabled="page <= 1" class="h-7 px-2 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1" @click="emit('change', page - 1)">
        <ChevronRight :size="11" class="rotate-180" /> Trước
      </button>
      <button v-for="p in nums" :key="p" :class="'h-7 min-w-7 px-2 rounded-md font-medium tabular-nums ' + (p === page ? 'text-white shadow-sm' : 'hover:bg-muted text-foreground')" :style="p === page ? gradient : {}" @click="emit('change', p)">{{ p }}</button>
      <span v-if="pages > 5" class="px-1">…</span>
      <button :disabled="page >= pages" class="h-7 px-2 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1" @click="emit('change', page + 1)">
        Sau <ChevronRight :size="11" />
      </button>
    </div>
  </div>
</template>
