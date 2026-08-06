<script setup lang="ts">
import { Check } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  password: string
  withBar?: boolean
}>(), { withBar: false })

const rules = computed(() => [
  { label: props.withBar ? 'Tối thiểu 8 ký tự' : '8+ ký tự', ok: props.password.length >= 8 },
  { label: props.withBar ? 'Có chữ hoa và chữ thường' : 'Chữ hoa & thường', ok: /[a-z]/.test(props.password) && /[A-Z]/.test(props.password) },
  { label: props.withBar ? 'Có ít nhất 1 chữ số' : 'Có chữ số', ok: /[0-9]/.test(props.password) },
  { label: props.withBar ? 'Có ký tự đặc biệt' : 'Ký tự đặc biệt', ok: /[^A-Za-z0-9\s]/.test(props.password) },
])
const passed = computed(() => rules.value.filter((r) => r.ok).length)
const barColor = computed(() => ['hsl(220 14% 91%)', 'hsl(0 72% 55%)', 'hsl(35 90% 50%)', 'hsl(203 89% 48%)', 'hsl(160 60% 40%)'][passed.value])
const barLabel = computed(() => ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][passed.value])
</script>

<template>
  <div v-if="password">
    <div v-if="withBar" class="flex items-center gap-2">
      <span class="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
        <span class="block h-full rounded-full transition-all" :style="{ width: (passed / 4 * 100) + '%', background: barColor }" />
      </span>
      <span class="text-[11.5px] font-semibold" :style="{ color: barColor }">{{ barLabel }}</span>
    </div>
    <ul :class="withBar ? 'mt-2 grid grid-cols-2 gap-x-3 gap-y-1' : 'mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5'">
      <li
        v-for="r in rules"
        :key="r.label"
        class="flex items-center gap-1.5 text-[11.5px]"
        :class="withBar ? (r.ok ? 'text-ink' : 'text-slate-400') : (r.ok ? 'text-emerald-700' : 'text-slate-400')"
      >
        <span
          class="h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0"
          :class="r.ok ? 'bg-emerald-500 text-white' : 'border border-border'"
        ><Check v-if="r.ok" :size="8" /></span>{{ r.label }}
      </li>
    </ul>
  </div>
</template>
