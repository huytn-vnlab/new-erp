<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    <!-- Loading overlay -->
    <div v-if="loading" class="relative">
      <div class="absolute inset-0 z-10 flex items-center justify-center bg-white/70 min-h-[120px]">
        <AppSpinner size="lg" />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              :class="['table-header', col.class]"
            >{{ col.label }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="!loading && rows.length === 0">
            <td :colspan="columns.length" class="px-4 py-10 text-center text-sm text-gray-400">
              {{ emptyText }}
            </td>
          </tr>
          <tr
            v-for="(row, idx) in rows"
            :key="idx"
            class="hover:bg-gray-50 transition-colors"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="['table-cell', col.class]"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] ?? '—' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
export interface TableColumn {
  key: string
  label: string
  class?: string
}

const props = withDefaults(defineProps<{
  columns: TableColumn[]
  rows: Record<string, any>[]
  loading?: boolean
  emptyText?: string
}>(), {
  loading: false,
  emptyText: 'No data',
})
</script>
