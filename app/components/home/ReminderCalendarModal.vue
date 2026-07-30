<script setup lang="ts">
import { ref, computed, watch, type Component } from 'vue'
import { Calendar, ChevronRight, Cake, Gift, Briefcase } from 'lucide-vue-next'
import Modal from '~/components/base/Modal.vue'
import Button from '~/components/base/Button.vue'
import { useDashboardStore } from '~/stores/dashboard'
import { useReminders, reminderCellKey, type ReminderEvent } from '~/composables/useReminders'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const { t, locale } = useI18n()
const dashStore = useDashboardStore()
const { events } = useReminders(computed(() => dashStore.calendarReminders))

const today = new Date()
const year = today.getFullYear()
const month = ref(today.getMonth()) // 0-indexed
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const selected = ref(todayKey)

// Fetch whenever the modal opens and whenever month navigation happens while open.
watch([() => props.modelValue, month], ([open]) => {
  if (open) dashStore.fetchRemindersForMonth(year, month.value + 1)
})

const TYPE_META: Record<ReminderEvent['type'], { labelKey: string; icon: Component; bg: string; fg: string; dot: string }> = {
  birthday: { labelKey: 'home.calendar.typeBirthday', icon: Cake, bg: 'hsl(38 92% 95%)', fg: 'hsl(35 90% 42%)', dot: '#f59e0b' },
  anniversary: { labelKey: 'home.calendar.typeAnniversary', icon: Gift, bg: 'hsl(203 89% 95%)', fg: 'hsl(203 89% 42%)', dot: '#38bdf8' },
  contract: { labelKey: 'home.calendar.typeContract', icon: Briefcase, bg: 'hsl(160 60% 94%)', fg: 'hsl(160 60% 34%)', dot: '#10b981' },
}
const TYPES: ReminderEvent['type'][] = ['birthday', 'anniversary', 'contract']
const filters = ref<Record<ReminderEvent['type'], boolean>>({ birthday: true, anniversary: true, contract: true })
function toggleFilter(k: ReminderEvent['type']) { filters.value[k] = !filters.value[k] }

const visible = computed(() => events.value.filter(e => filters.value[e.type]))

function key(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const cells = computed(() => {
  const y = year
  const m = month.value
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const lead = (new Date(y, m, 1).getDay() + 6) % 7
  const prevDays = new Date(y, m, 0).getDate()
  const out: { day: number; out: true; k: string }[] = []
  for (let i = lead - 1; i >= 0; i--) out.push({ day: prevDays - i, out: true, k: key(y, m - 1, prevDays - i) })
  const inMonth: { day: number; out: false; k: string }[] = []
  for (let d = 1; d <= daysInMonth; d++) inMonth.push({ day: d, out: false, k: key(y, m, d) })
  const all: { day: number; out: boolean; k: string }[] = [...out, ...inMonth]
  let nextDay = 1
  while (all.length % 7 !== 0) { all.push({ day: nextDay, out: true, k: key(y, m + 1, nextDay) }); nextDay++ }
  return all
})

const eventsByKey = computed(() => {
  const map = new Map<string, ReminderEvent[]>()
  for (const e of visible.value) {
    const k = reminderCellKey(e, year)
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(e)
  }
  return map
})

const monthPrefix = computed(() => `${year}-${String(month.value + 1).padStart(2, '0')}`)
const monthEventCount = computed(() => [...eventsByKey.value.keys()].filter(k => k.startsWith(monthPrefix.value)).length)
const selectedEvents = computed(() => eventsByKey.value.get(selected.value) ?? [])

const localeMap: Record<string, string> = { vi: 'vi-VN', en: 'en-US', ja: 'ja-JP' }
const weekdayLabels = computed(() => [
  t('hrm.timekeeping.weekdayShort.mon'), t('hrm.timekeeping.weekdayShort.tue'), t('hrm.timekeeping.weekdayShort.wed'),
  t('hrm.timekeeping.weekdayShort.thu'), t('hrm.timekeeping.weekdayShort.fri'), t('hrm.timekeeping.weekdayShort.sat'),
  t('hrm.timekeeping.weekdayShort.sun'),
])
const monthLabel = computed(() => new Date(year, month.value, 1).toLocaleDateString(localeMap[locale.value] ?? 'vi-VN', { month: 'long' }))
const selectedLabel = computed(() => {
  const [y, m, d] = selected.value.split('-').map(Number)
  return new Date(y!, m! - 1, d!).toLocaleDateString(localeMap[locale.value] ?? 'vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
})

function goToday() { month.value = today.getMonth(); selected.value = todayKey }
function eventIcon(type: ReminderEvent['type']) { return TYPE_META[type].icon }
</script>

<template>
  <Modal :open="modelValue" :max-width="896" @update:open="emit('update:modelValue', $event)">
    <template #header>
      <div class="flex-1 flex items-center justify-between gap-4 min-w-0">
        <div class="flex items-center gap-3 min-w-0">
          <span class="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary shrink-0"><Calendar :size="18" /></span>
          <div class="min-w-0">
            <h3 class="text-[17px] font-bold font-heading leading-tight">{{ t('home.calendar.title') }}</h3>
            <p class="text-[12px] text-muted-foreground">{{ t('home.calendar.subtitle', { n: monthEventCount, month: month + 1, year }) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-1 rounded-lg border border-border/70 p-0.5 shrink-0">
          <button class="p-1.5 rounded-md hover:bg-muted text-muted-foreground" @click="month = Math.max(0, month - 1)">
            <span class="block rotate-180"><ChevronRight :size="15" /></span>
          </button>
          <span class="text-[12.5px] font-semibold px-2 tabular-nums capitalize">{{ monthLabel }} {{ year }}</span>
          <button class="p-1.5 rounded-md hover:bg-muted text-muted-foreground" @click="month = Math.min(11, month + 1)">
            <ChevronRight :size="15" />
          </button>
        </div>
      </div>
    </template>

    <div class="px-5 py-2.5 border-b border-border/70 flex items-center gap-2 flex-wrap">
      <button
        v-for="tk in TYPES" :key="tk"
        :class="'flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full border transition-colors ' + (filters[tk] ? 'border-transparent font-medium' : 'border-border/70 text-muted-foreground')"
        :style="filters[tk] ? { background: TYPE_META[tk].bg, color: TYPE_META[tk].fg } : undefined"
        @click="toggleFilter(tk)"
      >
        <span class="h-1.5 w-1.5 rounded-full" :style="{ background: filters[tk] ? TYPE_META[tk].dot : 'currentColor' }" />
        {{ t(TYPE_META[tk].labelKey) }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
      <div class="p-5">
        <div class="grid grid-cols-7 gap-1 mb-1">
          <div v-for="d in weekdayLabels" :key="d" class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center py-1">{{ d }}</div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="(c, i) in cells" :key="i"
            :disabled="c.out"
            :class="'h-[74px] rounded-lg border text-left p-1.5 flex flex-col gap-1 transition-colors ' + (c.out ? 'border-transparent text-muted-foreground/35' : c.k === selected ? 'border-primary bg-primary/[0.06]' : 'border-border/60 hover:bg-muted/40')"
            @click="!c.out && (selected = c.k)"
          >
            <span :class="'text-[12px] tabular-nums font-medium h-5 w-5 flex items-center justify-center rounded-full ' + (c.k === todayKey ? 'bg-primary text-primary-foreground font-bold' : '')">{{ c.day }}</span>
            <span class="flex flex-col gap-0.5 min-h-0">
              <span
                v-for="(e, j) in (eventsByKey.get(c.k) ?? []).slice(0, 2)" :key="j"
                class="text-[10.5px] leading-[13px] truncate rounded px-1 py-[1px]"
                :style="{ background: TYPE_META[e.type].bg, color: TYPE_META[e.type].fg }"
              >{{ e.name }}</span>
              <span v-if="(eventsByKey.get(c.k)?.length ?? 0) > 2" class="text-[10px] text-muted-foreground px-1">+{{ (eventsByKey.get(c.k)?.length ?? 0) - 2 }} {{ t('home.calendar.more') }}</span>
            </span>
          </button>
        </div>
      </div>

      <div class="border-t lg:border-t-0 lg:border-l border-border/70 p-5 flex flex-col">
        <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{{ t('home.calendar.dayDetail') }}</p>
        <p class="text-[14px] font-bold font-heading mt-0.5 capitalize">{{ selectedLabel }}</p>
        <div class="mt-4 space-y-2.5 flex-1">
          <p v-if="selectedEvents.length === 0" class="text-[12.5px] text-muted-foreground italic">{{ t('home.calendar.noEventsOnDay') }}</p>
          <div v-for="(e, i) in selectedEvents" :key="i" class="flex items-start gap-2.5">
            <span class="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" :style="{ background: TYPE_META[e.type].bg, color: TYPE_META[e.type].fg }">
              <component :is="eventIcon(e.type)" :size="14" />
            </span>
            <div class="min-w-0">
              <p class="text-[12.5px] font-medium leading-snug">{{ e.text }}</p>
              <p class="text-[11.5px] text-muted-foreground">{{ e.sub }}</p>
            </div>
          </div>
        </div>
        <div class="pt-4 mt-4 border-t border-border/70 flex items-center gap-2">
          <Button variant="outline" size="sm" @click="goToday">{{ t('home.calendar.today') }}</Button>
        </div>
      </div>
    </div>
  </Modal>
</template>
