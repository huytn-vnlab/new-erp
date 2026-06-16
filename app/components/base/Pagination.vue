<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'

const props = defineProps<{ page: number; total: number; perPage: number }>()
const emit = defineEmits<{ change: [number] }>()

const pages = computed(() => Math.ceil(props.total / props.perPage))
const from = computed(() => (props.page - 1) * props.perPage + 1)
const to = computed(() => Math.min(props.page * props.perPage, props.total))
// Cửa sổ tối đa 5 trang, căn quanh trang hiện tại (kẹp trong [1, pages]).
const nums = computed(() => {
  const win = 5
  let start = Math.max(1, props.page - Math.floor(win / 2))
  const end = Math.min(pages.value, start + win - 1)
  start = Math.max(1, end - win + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})
const showLeadingDots = computed(() => (nums.value[0] ?? 1) > 1)
const showTrailingDots = computed(() => (nums.value[nums.value.length - 1] ?? pages.value) < pages.value)
const gradient = { background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }
</script>

<template>
  <div class="flex items-center justify-between px-5 py-3 border-t border-border/70 text-[12px] text-muted-foreground">
    <span>Hiển thị <span class="font-semibold text-foreground tabular-nums">{{ from }}-{{ to }}</span> trên <span class="font-semibold text-foreground tabular-nums">{{ total }}</span></span>
    <div class="flex items-center gap-1">
      <button :disabled="page <= 1" class="h-7 px-2 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1" @click="emit('change', page - 1)">
        <ChevronRight :size="11" class="rotate-180" /> Trước
      </button>
      <span v-if="showLeadingDots" class="px-1">…</span>
      <button v-for="p in nums" :key="p" :class="'h-7 min-w-7 px-2 rounded-md font-medium tabular-nums ' + (p === page ? 'text-white shadow-sm' : 'hover:bg-muted text-foreground')" :style="p === page ? gradient : {}" @click="emit('change', p)">{{ p }}</button>
      <span v-if="showTrailingDots" class="px-1">…</span>
      <button :disabled="page >= pages" class="h-7 px-2 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1" @click="emit('change', page + 1)">
        Sau <ChevronRight :size="11" />
      </button>
    </div>
  </div>
</template>
