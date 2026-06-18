<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import Avatar from '~/components/base/Avatar.vue'
import type { LeaveMember, LeaveEntry } from '~/mocks/leave'
import { LEAVE_TYPE_META, LEAVE_STATUS_META } from '~/mocks/leave'

const props = defineProps<{
  members: LeaveMember[]
  entries: LeaveEntry[]
  weekStart: string // ISO date, Monday
}>()

const emit = defineEmits<{ select: [LeaveEntry] }>()

const WD_VI = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

const addDays = (iso: string, n: number) => {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const fmtSlashShort = (iso: string) => iso.slice(5).replace('-', '/')

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const iso = addDays(props.weekStart, i)
    const d = new Date(iso)
    return { iso, label: WD_VI[d.getDay()], short: fmtSlashShort(iso), isWeekend: d.getDay() === 0 || d.getDay() === 6 }
  })
)

function entryFor(memberId: number, iso: string) {
  return props.entries.find(e => e.memberId === memberId && iso >= e.from && iso <= e.to)
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse" style="min-width: 880px">
      <thead>
        <tr>
          <th class="sticky left-0 z-10 bg-muted/40 text-left px-5 py-3 w-[220px] border-b border-r border-border/70">
            <span class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Thành viên</span>
          </th>
          <th
            v-for="day in weekDays" :key="day.iso"
            :class="'px-2 py-2.5 text-center border-b border-r border-border/50 last:border-r-0 ' + (day.isWeekend ? 'bg-muted/40' : 'bg-muted/20')"
            style="min-width: 94px"
          >
            <div class="text-[12px] font-semibold text-foreground">{{ day.label }}</div>
            <div class="text-[11px] text-muted-foreground font-mono tabular-nums">{{ day.short }}</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in members" :key="m.id" class="group">
          <td class="sticky left-0 z-10 bg-card group-hover:bg-muted/20 px-5 py-3 border-b border-r border-border/70 transition-colors">
            <div class="flex items-center gap-2.5">
              <Avatar :name="m.name" :size="30" />
              <div class="min-w-0">
                <p class="text-[13px] font-medium text-foreground truncate">{{ m.name }}</p>
                <p class="text-[11px] text-muted-foreground truncate">{{ m.branch }}</p>
              </div>
            </div>
          </td>
          <td
            v-for="day in weekDays" :key="day.iso"
            :class="'px-1.5 py-2 border-b border-r border-border/40 last:border-r-0 align-middle ' + (day.isWeekend ? 'bg-muted/15' : '')"
          >
            <template v-for="(e, _i) in [entryFor(m.id, day.iso)]" :key="_i">
              <button
                v-if="e"
                class="w-full rounded-md px-2 py-1.5 text-left transition-transform hover:scale-[1.03] cursor-pointer"
                :style="{
                  background: LEAVE_TYPE_META[e.type].bg,
                  borderLeft: `3px solid ${LEAVE_TYPE_META[e.type].color}`,
                  opacity: e.status === 'rejected' ? 0.5 : 1
                }"
                :title="`${e.type} · ${LEAVE_STATUS_META[e.status].label}`"
                @click="emit('select', e)"
              >
                <template v-if="e.from === day.iso">
                  <span class="block text-[11px] font-semibold leading-tight" :style="{ color: LEAVE_TYPE_META[e.type].color }">
                    {{ e.type }}{{ e.half ? ' ½' : '' }}
                  </span>
                  <span class="flex items-center gap-1 mt-0.5">
                    <span
                      class="h-1.5 w-1.5 rounded-full shrink-0"
                      :style="{ background: e.status === 'approved' ? 'hsl(160 60% 45%)' : e.status === 'rejected' ? 'hsl(0 70% 52%)' : 'hsl(38 92% 50%)' }"
                    />
                    <span class="text-[10px] text-muted-foreground truncate">{{ LEAVE_STATUS_META[e.status].label }}</span>
                  </span>
                </template>
                <template v-else>
                  <span class="block h-[26px] flex items-center text-[10.5px]" :style="{ color: LEAVE_TYPE_META[e.type].color }">•••</span>
                </template>
              </button>
              <div v-else class="h-[40px]" />
            </template>
          </td>
        </tr>
        <tr v-if="members.length === 0">
          <td :colspan="8" class="py-16 text-center text-muted-foreground">
            <ChevronRight :size="36" class="mx-auto mb-2 opacity-30" />
            Không tìm thấy nhân viên phù hợp
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
