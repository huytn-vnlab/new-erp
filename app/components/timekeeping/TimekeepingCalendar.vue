<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import type { TimekeepingDay } from '~/mocks/timekeeping'
import { TK_STATUS_META } from '~/mocks/timekeeping'

const props = withDefaults(defineProps<{
  year: number
  month: number // 0-based
  history: TimekeepingDay[]
  todayDay?: number
}>(), { todayDay: 0 })

const emit = defineEmits<{ 'prev-month': []; 'next-month': []; today: [] }>()

const MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']

const cells = computed(() => {
  const daysInMonth = new Date(props.year, props.month + 1, 0).getDate()
  const startWeekday = (new Date(props.year, props.month, 1).getDay() + 6) % 7 // Mon=0
  const result: { blank?: true; d?: number; status: string; hist?: TimekeepingDay }[] = []

  for (let i = 0; i < startWeekday; i++) result.push({ blank: true, status: 'empty' })

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${String(d).padStart(2, '0')}/${String(props.month + 1).padStart(2, '0')}/${props.year}`
    const hist = props.history.find(h => h.date === dateStr)
    result.push({ d, status: hist?.status ?? 'empty', hist })
  }

  while (result.length % 7) result.push({ blank: true, status: 'empty' })
  return result
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h4 class="section-title">{{ MONTH_NAMES[month] }} {{ year }}</h4>
      <div class="flex items-center gap-0.5">
        <button class="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground" @click="emit('prev-month')">
          <ChevronRight :size="12" class="rotate-180" />
        </button>
        <button class="h-7 px-2 text-[11px] rounded-md hover:bg-muted text-foreground font-medium" @click="emit('today')">Hôm nay</button>
        <button class="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground" @click="emit('next-month')">
          <ChevronRight :size="12" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1.5">
      <div v-for="d in ['T2','T3','T4','T5','T6','T7','CN']" :key="d"
           class="text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground text-center py-1">
        {{ d }}
      </div>

      <template v-for="(cell, i) in cells" :key="i">
        <div v-if="cell.blank" />
        <div
          v-else
          :title="cell.hist ? `${cell.hist.date}: ${TK_STATUS_META[cell.status as keyof typeof TK_STATUS_META].label}${cell.hist.in ? ` (${cell.hist.in}–${cell.hist.out})` : ''}` : TK_STATUS_META[cell.status as keyof typeof TK_STATUS_META].label"
          :class="['aspect-square rounded-md p-1.5 text-center cursor-pointer transition-all hover:scale-[1.05] relative', todayDay === cell.d ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : '']"
          :style="{ background: TK_STATUS_META[cell.status as keyof typeof TK_STATUS_META].bg }"
        >
          <span
            class="text-[11px] tabular-nums font-medium block"
            :class="todayDay === cell.d ? 'text-primary font-bold' : ''"
            :style="{ color: (cell.status === 'weekend' || cell.status === 'empty') ? 'hsl(var(--muted-foreground))' : TK_STATUS_META[cell.status as keyof typeof TK_STATUS_META].color }"
          >{{ cell.d }}</span>
          <span
            v-if="cell.hist?.hours"
            class="text-[8.5px] font-mono mt-0.5 block"
            :style="{ color: TK_STATUS_META[cell.status as keyof typeof TK_STATUS_META].color, opacity: 0.85 }"
          >{{ cell.hist.hours }}h</span>
        </div>
      </template>
    </div>

    <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
      <span v-for="[k, l] in [['full','Đủ công'],['late','Muộn'],['short','Thiếu giờ'],['leave','Nghỉ'],['weekend','Cuối tuần']]" :key="k" class="inline-flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: TK_STATUS_META[k as keyof typeof TK_STATUS_META].color }" />
        {{ l }}
      </span>
    </div>
  </div>
</template>
