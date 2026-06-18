<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { LogIn, LogOut, Check, FileText, Clock, AlertCircle, TrendingUp } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Select from '~/components/base/Select.vue'
import Avatar from '~/components/base/Avatar.vue'
import SectionCard from '~/components/home/SectionCard.vue'
import TimekeepingCalendar from '~/components/timekeeping/TimekeepingCalendar.vue'
import {
  TIMEKEEPING_HISTORY, MONTH_OPTIONS, TK_STATUS_META,
  type TKStatus,
} from '~/mocks/timekeeping'

definePageMeta({ layout: 'admin' })

const selectedMonth = ref('2026-05')
const activeTab = ref<'mine' | 'team'>('mine')

// 3-state: none → in → out
const checkinState = ref<'none' | 'in' | 'out'>('in')
function doCheck() {
  checkinState.value = checkinState.value === 'none' ? 'in' : checkinState.value === 'in' ? 'out' : 'none'
}

// Live clock
const currentTime = ref(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
let clockTimer: ReturnType<typeof setInterval>
onMounted(() => { clockTimer = setInterval(() => { currentTime.value = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }, 1000) })
onUnmounted(() => clearInterval(clockTimer))

const todayStr = computed(() => {
  const now = new Date()
  const day = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][now.getDay()]
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `${day} · ${dd}/${mm}/${now.getFullYear()}`
})

const parsedMonth = computed(() => {
  const [y = 2026, m = 5] = selectedMonth.value.split('-').map(Number)
  return { year: y, month: m - 1 }
})

const historyForMonth = computed(() => {
  const [y, m] = selectedMonth.value.split('-')
  return TIMEKEEPING_HISTORY.filter(d => d.date.slice(3, 10) === `${m}/${y}`)
})

const stats = computed(() => {
  const h = historyForMonth.value
  const work = h.filter(d => d.status !== 'weekend' && d.status !== 'empty')
  return {
    workdays: work.filter(d => d.status !== 'leave').length,
    totalHours: work.reduce((s, d) => s + (d.hours ?? 0), 0),
    lateMinutes: work.reduce((s, d) => s + (d.late ?? 0), 0),
    leaveDays: work.filter(d => d.status === 'leave').length,
    lateDays: work.filter(d => d.status === 'late').length,
  }
})

// Week strip: Mon 18 – Sun 24 May 2026 (matches mock "today = 22/05")
const weekDays = computed(() =>
  ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((label, i) => {
    const dayN = 18 + i
    const dateStr = `${String(dayN).padStart(2, '0')}/05/2026`
    const hist = TIMEKEEPING_HISTORY.find(h => h.date === dateStr) ?? null
    const status: TKStatus = hist?.status ?? 'empty'
    return { dayN, label, hist, status, isToday: dayN === 22 }
  })
)
const weekHours = computed(() => weekDays.value.reduce((s, d) => s + (d.hist?.hours ?? 0), 0))

const DEPT_HISTORY: { name: string; workdays: number; totalHours: number; lateCount: number; leaveDays: number }[] = [
  { name: 'Nguyễn Văn An',   workdays: 18, totalHours: 154, lateCount: 0, leaveDays: 2 },
  { name: 'Trần Thị Mai',     workdays: 17, totalHours: 149, lateCount: 1, leaveDays: 1 },
  { name: 'Lê Quang Huy',     workdays: 19, totalHours: 161, lateCount: 0, leaveDays: 0 },
  { name: 'Vũ Thị Lan',       workdays: 16, totalHours: 138, lateCount: 2, leaveDays: 3 },
  { name: 'Phạm Thu Hà',      workdays: 18, totalHours: 155, lateCount: 1, leaveDays: 1 },
  { name: 'Bùi Đức Thành',    workdays: 20, totalHours: 168, lateCount: 0, leaveDays: 0 },
  { name: 'Hoàng Đức Thành',  workdays: 15, totalHours: 130, lateCount: 3, leaveDays: 4 },
]
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      eyebrow="HRM · Chấm công"
      title="Chấm công"
      description="Theo dõi thời gian làm việc hàng ngày của bạn và lịch sử trong tháng. Quản lý có thể xem cả nhóm."
    >
      <template #actions>
        <Btn variant="outline"><FileText :size="14" />Xuất Excel</Btn>
        <Btn variant="outline"><Clock :size="14" />Yêu cầu sửa giờ</Btn>
      </template>
    </PageHeader>

    <!-- Today check-in card: 2-panel grid -->
    <div class="card-surface overflow-hidden rise" style="animation-delay: 40ms">
      <div class="relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-0">

        <!-- Left: check-in panel -->
        <div class="p-6 relative overflow-hidden">
          <div
            class="absolute -right-12 -top-12 w-48 h-48 rounded-full"
            style="background: radial-gradient(circle, hsl(var(--primary-h) var(--primary-s) 60% / 0.18), transparent 65%)"
          />
          <div class="relative">
            <p class="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Chấm công hôm nay</p>
            <div class="mt-2 flex items-baseline gap-2">
              <h2 class="text-[40px] font-bold font-heading text-foreground tabular-nums leading-none">{{ currentTime }}</h2>
              <span class="text-[14px] text-muted-foreground">{{ todayStr }}</span>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-3 max-w-md">
              <div class="rounded-xl border border-border/70 bg-muted/30 p-4">
                <div class="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                  <LogIn :size="12" /> Giờ vào
                </div>
                <p
                  class="text-[24px] font-bold font-heading mt-1 tabular-nums"
                  :class="checkinState === 'none' ? 'text-muted-foreground/60' : 'text-foreground'"
                >{{ checkinState === 'none' ? '—' : '08:42' }}</p>
                <p v-if="checkinState !== 'none'" class="text-[11px] text-emerald-600 font-medium">Đúng giờ</p>
              </div>
              <div class="rounded-xl border border-border/70 bg-muted/30 p-4">
                <div class="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                  <LogOut :size="12" /> Giờ ra
                </div>
                <p
                  class="text-[24px] font-bold font-heading mt-1 tabular-nums"
                  :class="checkinState === 'out' ? 'text-foreground' : 'text-muted-foreground/60'"
                >{{ checkinState === 'out' ? '18:15' : '—' }}</p>
                <p v-if="checkinState === 'out'" class="text-[11px] text-emerald-600 font-medium">9h 33m làm việc</p>
              </div>
            </div>

            <div class="mt-6 flex items-center gap-3">
              <Btn v-if="checkinState === 'none'" variant="primary" @click="doCheck">
                <LogIn :size="14" />Chấm công vào
              </Btn>
              <Btn v-else-if="checkinState === 'in'" variant="primary" @click="doCheck">
                <LogOut :size="14" />Chấm công ra
              </Btn>
              <span v-else class="inline-flex items-center gap-2 px-3 h-9 rounded-md bg-emerald-500/10 text-emerald-600 font-semibold text-[13px]">
                <Check :size="14" /> Đã hoàn tất hôm nay
              </span>
              <Btn variant="ghost" size="sm" @click="checkinState = 'none'">Đặt lại (demo)</Btn>
            </div>
          </div>
        </div>

        <!-- Right: week strip + stats -->
        <div class="border-l border-border/70 p-6 bg-muted/20">
          <p class="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Tuần này</p>
          <div class="mt-3 grid grid-cols-7 gap-1.5">
            <div v-for="d in weekDays" :key="d.dayN" class="text-center">
              <p class="text-[10px] uppercase font-semibold text-muted-foreground">{{ d.label }}</p>
              <div
                class="mt-1 aspect-square rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-105"
                :class="d.isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''"
                :style="{ background: TK_STATUS_META[d.status].bg }"
              >
                <span class="text-[13px] font-bold tabular-nums" :style="{ color: TK_STATUS_META[d.status].color }">{{ d.dayN }}</span>
                <span v-if="d.hist?.hours" class="text-[9px] font-mono" :style="{ color: TK_STATUS_META[d.status].color }">{{ d.hist.hours }}h</span>
              </div>
            </div>
          </div>

          <div class="mt-5 space-y-2 text-[12px]">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Đã làm tuần này</span>
              <span class="font-bold tabular-nums text-foreground">{{ weekHours.toFixed(1) }} / 40 giờ</span>
            </div>
            <div class="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                class="h-full rounded-full"
                :style="{ width: Math.min(weekHours / 40 * 100, 100) + '%', background: 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 65%), hsl(var(--primary-h) var(--primary-s) 45%))' }"
              />
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-border/60">
              <span class="text-muted-foreground">Tổng tháng</span>
              <span class="font-bold tabular-nums text-foreground">{{ stats.totalHours.toFixed(1) }} giờ</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Số ngày đi muộn</span>
              <span class="font-bold tabular-nums" :class="stats.lateDays > 0 ? 'text-amber-600' : 'text-foreground'">{{ stats.lateDays }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MiniStats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MiniStat label="Ngày công" :value="stats.workdays" :sublabel="MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label ?? ''" accent="green" :delay="80" />
      <MiniStat label="Tổng giờ" :value="stats.totalHours.toFixed(1)" sublabel="Mục tiêu 160h" accent="primary" :delay="120" />
      <MiniStat label="Tổng phút muộn" :value="stats.lateMinutes" :sublabel="`${stats.lateDays} ngày`" :accent="stats.lateMinutes > 0 ? 'amber' : 'green'" :delay="160" />
      <MiniStat label="Ngày nghỉ" :value="stats.leaveDays" sublabel="Đã được duyệt" accent="violet" :delay="200" />
    </div>

    <!-- Tab strip -->
    <div class="border-b border-border/70 flex items-center justify-between">
      <div class="flex gap-7">
        <button
          v-for="[k, l] in [['mine', 'Lịch sử của tôi'], ['team', 'Cả phòng ban']]"
          :key="k"
          :data-active="activeTab === k"
          class="tab-trigger"
          @click="activeTab = k as typeof activeTab"
        >{{ l }}</button>
      </div>
      <div class="flex items-center gap-2 pb-1">
        <Select v-model="selectedMonth" :options="MONTH_OPTIONS" style="min-width: 150px" />
      </div>
    </div>

    <!-- MINE -->
    <template v-if="activeTab === 'mine'">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <SectionCard :delay="260" class="lg:col-span-2" title="Lịch tháng">
          <TimekeepingCalendar
            :year="parsedMonth.year"
            :month="parsedMonth.month"
            :history="historyForMonth"
            :today-day="selectedMonth === '2026-05' ? 22 : 0"
            @prev-month="selectedMonth = MONTH_OPTIONS[Math.min(MONTH_OPTIONS.length - 1, MONTH_OPTIONS.findIndex(m => m.value === selectedMonth) + 1)]?.value ?? selectedMonth"
            @next-month="selectedMonth = MONTH_OPTIONS[Math.max(0, MONTH_OPTIONS.findIndex(m => m.value === selectedMonth) - 1)]?.value ?? selectedMonth"
            @today="selectedMonth = '2026-05'"
          />
        </SectionCard>

        <SectionCard :delay="300" class="lg:col-span-3" title="Lịch sử chấm công">
          <template #action>
            <span class="text-[11.5px] text-muted-foreground">{{ historyForMonth.length }} bản ghi · {{ MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label }}</span>
          </template>
          <div class="-mx-5 -mb-5">
            <div class="max-h-[480px] overflow-y-auto scrollbar-thin">
              <table class="w-full text-[13px]">
                <thead class="sticky top-0 bg-card z-10">
                  <tr class="bg-muted/40 border-y border-border/70 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    <th class="text-left py-2.5 px-5">Ngày</th>
                    <th class="text-left py-2.5 px-3">Giờ vào</th>
                    <th class="text-left py-2.5 px-3">Giờ ra</th>
                    <th class="text-right py-2.5 px-3">Số giờ</th>
                    <th class="text-center py-2.5 px-3">Trạng thái</th>
                    <th class="text-left py-2.5 px-5">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="h in [...historyForMonth].reverse()" :key="h.date"
                    class="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td class="py-2.5 px-5">
                      <span class="font-mono font-medium text-foreground">{{ h.date }}</span>
                      <p class="text-[11px] text-muted-foreground">{{ ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][h.weekday] }}</p>
                    </td>
                    <td class="py-2.5 px-3 font-mono tabular-nums">
                      <span v-if="h.in">{{ h.in }}</span>
                      <span v-else class="text-muted-foreground">—</span>
                    </td>
                    <td class="py-2.5 px-3 font-mono tabular-nums">
                      <span v-if="h.out">{{ h.out }}</span>
                      <span v-else class="text-muted-foreground">—</span>
                    </td>
                    <td class="py-2.5 px-3 text-right font-semibold tabular-nums">
                      <span v-if="h.hours">{{ h.hours }}h</span>
                      <span v-else class="text-muted-foreground font-normal">—</span>
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <span
                        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono"
                        :style="{ background: TK_STATUS_META[h.status].bg, color: TK_STATUS_META[h.status].color }"
                      >
                        <span class="h-1.5 w-1.5 rounded-full" :style="{ background: TK_STATUS_META[h.status].color }" />
                        {{ TK_STATUS_META[h.status].label }}
                      </span>
                    </td>
                    <td class="py-2.5 px-5 text-muted-foreground text-[12px]">
                      {{ h.note || ((h.late ?? 0) > 0 ? `Muộn ${h.late} phút` : '') }}
                    </td>
                  </tr>
                  <tr v-if="historyForMonth.length === 0">
                    <td colspan="6" class="py-12 text-center text-muted-foreground">
                      <TrendingUp :size="30" class="mx-auto mb-2 opacity-30" />Chưa có dữ liệu chấm công
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>
      </div>
    </template>

    <!-- TEAM -->
    <template v-if="activeTab === 'team'">
      <div class="card-surface overflow-hidden rise">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 700px">
            <thead>
              <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold border-b border-border/70">
                <th class="text-left py-3 px-5">Nhân viên</th>
                <th class="text-center py-3 px-3">Ngày công</th>
                <th class="text-center py-3 px-3">Tổng giờ</th>
                <th class="text-center py-3 px-3">Số lần muộn</th>
                <th class="text-center py-3 px-3">Ngày nghỉ</th>
                <th class="text-center py-3 px-5">Trạng thái tháng</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(m, i) in DEPT_HISTORY" :key="i" class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                <td class="py-3 px-5">
                  <div class="flex items-center gap-2.5">
                    <Avatar :name="m.name" :size="30" />
                    <span class="font-medium">{{ m.name }}</span>
                  </div>
                </td>
                <td class="py-3 px-3 text-center tabular-nums font-bold" :class="m.workdays >= 20 ? 'text-emerald-600' : m.workdays >= 16 ? 'text-foreground' : 'text-amber-600'">{{ m.workdays }}</td>
                <td class="py-3 px-3 text-center tabular-nums">{{ m.totalHours }}h</td>
                <td class="py-3 px-3 text-center">
                  <span v-if="m.lateCount > 0" class="inline-flex items-center gap-1 text-amber-600 font-semibold"><AlertCircle :size="11" />{{ m.lateCount }}</span>
                  <span v-else class="text-emerald-500 font-bold">0</span>
                </td>
                <td class="py-3 px-3 text-center tabular-nums text-muted-foreground">{{ m.leaveDays }}</td>
                <td class="py-3 px-5 text-center">
                  <span
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                    :style="m.workdays >= 20
                      ? { background: 'hsl(160 60% 88%)', color: 'hsl(160 60% 40%)' }
                      : m.workdays >= 16
                        ? { background: 'hsl(var(--primary-h) var(--primary-s) 90%)', color: 'hsl(var(--primary-h) var(--primary-s) 45%)' }
                        : { background: 'hsl(38 92% 92%)', color: 'hsl(38 92% 40%)' }"
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :style="m.workdays >= 20 ? { background: 'hsl(160 60% 50%)' } : m.workdays >= 16 ? { background: 'hsl(var(--primary-h) var(--primary-s) 55%)' } : { background: 'hsl(38 92% 50%)' }"
                    />
                    {{ m.workdays >= 20 ? 'Xuất sắc' : m.workdays >= 16 ? 'Bình thường' : 'Thiếu công' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-5 py-3 border-t border-border/70 bg-muted/10 text-[12.5px] text-muted-foreground">
          {{ MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label }} · <span class="font-semibold text-foreground">{{ DEPT_HISTORY.length }}</span> thành viên
        </div>
      </div>
    </template>
  </div>
</template>
