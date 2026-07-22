<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { formatDateDisplay } from '~/utils/date'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  error?: boolean
  width?: string | number
  min?: string
}>(), { placeholder: 'yyyy/mm/dd', error: false, width: '100%' })

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const WD_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const MONTH_VI = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']

function parseIso(s?: string): Date | null {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function sameDay(a: Date | null, b: Date | null): boolean {
  return !!(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate())
}

const open = ref(false)
const triggerRef = ref<HTMLElement>()
const popupRef = ref<HTMLElement>()
const pos = ref({ top: 0, left: 0, width: 268 })

const selected = computed(() => parseIso(props.modelValue))
const viewDate = ref<Date>(selected.value || new Date())

watch(() => props.modelValue, (v) => {
  const d = parseIso(v)
  if (d) viewDate.value = new Date(d)
})

function openCal() {
  if (triggerRef.value) {
    const r = triggerRef.value.getBoundingClientRect()
    pos.value = { top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: Math.max(268, r.width) }
    viewDate.value = selected.value ? new Date(selected.value) : new Date()
  }
  open.value = !open.value
}

function pick(d: Date) {
  if (isDisabled(d)) return
  emit('update:modelValue', toIso(d))
  open.value = false
}

function clear(e: MouseEvent) {
  e.stopPropagation()
  emit('update:modelValue', '')
}

function prevMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1)
}
function nextMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
}

const cells = computed(() => {
  const y = viewDate.value.getFullYear()
  const m = viewDate.value.getMonth()
  const firstOfMonth = new Date(y, m, 1)
  const startOffset = (firstOfMonth.getDay() + 6) % 7 // Monday-first
  const gridStart = new Date(y, m, 1 - startOffset)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })
})

const today = new Date()
const minDate = computed(() => parseIso(props.min))

function isDisabled(d: Date): boolean {
  if (!minDate.value) return false
  return toIso(d) < toIso(minDate.value)
}

function onDocClick(e: MouseEvent) {
  const target = e.target as Node
  if (!triggerRef.value?.contains(target) && !popupRef.value?.contains(target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>

<template>
  <div
    class="relative"
    :style="typeof width === 'number' ? { width: width + 'px' } : { width: String(width) }"
  >
    <!-- Trigger -->
    <button
      ref="triggerRef"
      type="button"
      @click="openCal"
      :class="[
        'w-full h-9 pl-3 pr-8 rounded-md border bg-muted/30 text-[13px] text-left inline-flex items-center gap-2 outline-none transition-colors relative',
        error ? 'border-red-400' : open ? 'border-primary/60 ring-2 ring-primary/15' : 'border-border hover:border-primary/40',
      ]"
    >
      <Calendar :size="13" class="text-muted-foreground shrink-0" />
      <span :class="selected ? 'text-foreground font-mono' : 'text-muted-foreground/60'">
        {{ selected ? formatDateDisplay(selected) : placeholder }}
      </span>
    </button>
    <!-- Clear button -->
    <button
      v-if="selected"
      type="button"
      @click="clear"
      class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
      <X :size="12" />
    </button>

    <!-- Floating calendar portal -->
    <!-- v-show (not v-if) here on purpose: this div toggling in/out of the DOM
         reactively while the whole DatePicker can also be unmounted in the same
         tick (e.g. a mousedown outside closes it right as a parent v-if removes
         this component, such as switching tabs) raced Vue's Teleport unmount
         and threw "Cannot read properties of null (reading 'nextSibling')". A
         style-only toggle can't collide with the parent's DOM removal. -->
    <Teleport to="body">
      <div
        v-show="open"
        ref="popupRef"
        :style="{ position: 'absolute', top: pos.top + 'px', left: pos.left + 'px', width: pos.width + 'px', zIndex: 9999 }"
        class="rounded-xl border border-border bg-popover shadow-popover overflow-hidden p-3"
        style="animation: selectIn 0.14s ease-out"
      >
        <!-- Month navigation -->
        <div class="flex items-center justify-between mb-2.5">
          <button
            type="button"
            @click="prevMonth"
            class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft :size="13" />
          </button>
          <span class="text-[13px] font-semibold text-foreground font-heading">
            {{ MONTH_VI[viewDate.getMonth()] }} {{ viewDate.getFullYear() }}
          </span>
          <button
            type="button"
            @click="nextMonth"
            class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronRight :size="13" />
          </button>
        </div>

        <!-- Weekday headers -->
        <div class="grid grid-cols-7 mb-1">
          <span
            v-for="w in WD_VI" :key="w"
            class="text-[10.5px] font-semibold text-muted-foreground/70 text-center py-1"
          >{{ w }}</span>
        </div>

        <!-- Day grid -->
        <div class="grid grid-cols-7 gap-y-0.5">
          <button
            v-for="(d, i) in cells"
            :key="i"
            type="button"
            :disabled="isDisabled(d)"
            @click="pick(d)"
            :class="[
              'h-8 w-8 mx-auto rounded-md text-[12.5px] font-medium flex items-center justify-center transition-colors tabular-nums',
              isDisabled(d) ? 'opacity-25 cursor-not-allowed' :
              sameDay(d, selected) ? 'text-white' :
              d.getMonth() !== viewDate.getMonth() ? 'text-muted-foreground/35 hover:bg-muted/50' :
              'text-foreground hover:bg-muted',
            ]"
            :style="sameDay(d, selected) ? { background: 'hsl(var(--primary))' } : sameDay(d, today) ? { boxShadow: 'inset 0 0 0 1.5px hsl(var(--primary))' } : {}"
          >
            {{ d.getDate() }}
          </button>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/60">
          <button
            type="button"
            @click="emit('update:modelValue', ''); open = false"
            class="text-[11.5px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >Xóa</button>
          <button
            type="button"
            @click="pick(today)"
            class="text-[11.5px] font-medium text-primary hover:underline"
          >Hôm nay</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
