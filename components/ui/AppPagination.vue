<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 sm:px-6">
    <p class="text-sm text-gray-500">
      {{ $t('pagination.showing', { from, to, total }) }}
    </p>
    <nav class="flex gap-1">
      <button
        :disabled="currentPage <= 1"
        class="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="$emit('change', currentPage - 1)"
      >‹</button>

      <template v-for="p in pages" :key="p">
        <span v-if="p === '...'" class="px-3 py-1.5 text-sm text-gray-400">…</span>
        <button
          v-else
          :class="[
            'px-3 py-1.5 rounded text-sm font-medium',
            p === currentPage
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:bg-gray-100',
          ]"
          @click="$emit('change', p)"
        >{{ p }}</button>
      </template>

      <button
        :disabled="currentPage >= totalPages"
        class="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="$emit('change', currentPage + 1)"
      >›</button>
    </nav>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalRow: number
  rowPerPage: number
}>()

defineEmits<{ change: [page: number] }>()

const totalPages = computed(() => Math.ceil(props.totalRow / props.rowPerPage) || 1)
const from = computed(() => (props.currentPage - 1) * props.rowPerPage + 1)
const to   = computed(() => Math.min(props.currentPage * props.rowPerPage, props.totalRow))
const total = computed(() => props.totalRow)

const pages = computed(() => {
  const all: (number | '...')[] = []
  const cur = props.currentPage
  const last = totalPages.value
  if (last <= 7) {
    for (let i = 1; i <= last; i++) all.push(i)
  } else {
    all.push(1)
    if (cur > 3) all.push('...')
    for (let i = Math.max(2, cur - 1); i <= Math.min(last - 1, cur + 1); i++) all.push(i)
    if (cur < last - 2) all.push('...')
    all.push(last)
  }
  return all
})
</script>
