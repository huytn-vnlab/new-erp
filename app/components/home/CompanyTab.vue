<script setup lang="ts">
import { Cake, Gift, Briefcase, ChevronDown } from 'lucide-vue-next'
import SectionCard from './SectionCard.vue'
import BarRow from '~/components/charts/BarRow.vue'
import Sparkline from '~/components/charts/Sparkline.vue'

const reminders = [
  { id: 1, type: 'birthday', text: 'Sinh nhật Trần Thị Mai', sub: 'Đà Nẵng · 25 tuổi', date: 'Hôm nay', color: 'amber' },
  { id: 2, type: 'birthday', text: 'Sinh nhật Đỗ Minh Tuấn', sub: 'Hà Nội · 31 tuổi', date: 'Thứ Hai', color: 'amber' },
  { id: 3, type: 'anniversary', text: 'Vào công ty Hoàng Đức Thành', sub: '3 năm tại VNLab', date: '24/05', color: 'sky' },
  { id: 4, type: 'contract', text: 'Gia hạn hợp đồng Lê Quang Huy', sub: 'Còn 12 ngày', date: '03/06', color: 'emerald' },
  { id: 5, type: 'contract', text: 'Gia hạn hợp đồng Phạm Thu Hà', sub: 'Còn 28 ngày', date: '19/06', color: 'emerald' },
]
const notifs = [
  { t: 'Đơn nghỉ phép của Trần Thị Mai đang chờ duyệt', s: 'HR Admin', a: '5 phút', u: true },
  { t: 'Báo cáo đánh giá Q1/2026 đã sẵn sàng', s: 'Evaluation Bot', a: '2 giờ', u: true },
  { t: 'Bạn được thêm vào dự án "Cổng thanh toán XYZ"', s: 'Hoàng Đức Thành', a: '4 giờ', u: true },
  { t: 'Đơn tăng ca của Vũ Thị Lan đã được duyệt', s: 'PM Hà Nội', a: 'Hôm qua', u: false },
  { t: 'Lương tháng 4 đã được phát', s: 'Finance', a: '3 ngày', u: false },
]
const jobTitles = [
  { label: 'Lập trình viên', value: 98 }, { label: 'Tester / QA', value: 32 }, { label: 'BrSE', value: 28 },
  { label: 'Designer', value: 18 }, { label: 'PM / Trưởng nhóm', value: 14 }, { label: 'DevOps', value: 8 }, { label: 'Khác', value: 6 },
]
const maxJob = Math.max(...jobTitles.map(j => j.value))
const jpLevels = [
  { lv: 'N1', count: 12 }, { lv: 'N2', count: 38 }, { lv: 'N3', count: 65 },
  { lv: 'N4', count: 42 }, { lv: 'N5', count: 30 }, { lv: 'Chưa thi', count: 61 },
]
const maxJp = Math.max(...jpLevels.map(j => j.count))
const tech = [
  { n: 'Vue.js', c: 64 }, { n: 'React', c: 58 }, { n: 'Node.js', c: 52 }, { n: 'Python', c: 41 },
  { n: 'TypeScript', c: 38 }, { n: 'Docker', c: 29 }, { n: 'AWS', c: 27 }, { n: 'Java', c: 22 },
  { n: 'Go', c: 14 }, { n: 'Rust', c: 8 }, { n: 'PHP / Laravel', c: 16 }, { n: 'Kubernetes', c: 11 },
  { n: 'PostgreSQL', c: 24 }, { n: 'Figma', c: 18 },
].sort((a, b) => b.c - a.c)
const ranks = ['S', 'A', 'B', 'C', 'D', 'E']
const quarters = ['Q3/25', 'Q4/25', 'Q1/26', 'Q2/26']
const evalData = [[3, 4, 6, 8], [22, 26, 31, 35], [54, 58, 60, 62], [38, 32, 28, 24], [12, 8, 6, 4], [4, 2, 1, 0]]
const rankColors = ['#0ea5e9', '#22c55e', '#a3a3a3', '#eab308', '#f97316', '#ef4444']

const reminderIcon = (t: string) => t === 'birthday' ? Cake : t === 'anniversary' ? Gift : Briefcase
const reminderBg = (c: string) => c === 'amber' ? 'hsl(38 92% 95%)' : c === 'sky' ? 'hsl(203 89% 95%)' : 'hsl(160 60% 94%)'
const reminderFg = (c: string) => c === 'amber' ? 'hsl(35 90% 45%)' : c === 'sky' ? 'hsl(203 89% 45%)' : 'hsl(160 60% 38%)'
</script>

<template>
  <div class="space-y-6">
    <!-- Row 1: reminders + notifications -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SectionCard :delay="50" title="Nhắc nhở sắp tới">
        <template #action><button class="text-[12px] text-primary hover:underline">Xem lịch →</button></template>
        <ul class="space-y-3">
          <li v-for="r in reminders" :key="r.id" class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" :style="{ background: reminderBg(r.color), color: reminderFg(r.color) }">
              <component :is="reminderIcon(r.type)" :size="15" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[13px] text-foreground font-medium truncate">{{ r.text }}</p>
              <p class="text-[11.5px] text-muted-foreground">{{ r.sub }}</p>
            </div>
            <span class="text-[11.5px] font-mono font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{{ r.date }}</span>
          </li>
        </ul>
      </SectionCard>

      <SectionCard :delay="100" title="Thông báo gần đây">
        <template #action>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
              <span class="h-1.5 w-1.5 rounded-full bg-primary live-dot" /> 3 mới
            </span>
            <button class="text-[12px] text-primary hover:underline">Tất cả →</button>
          </div>
        </template>
        <ul class="divide-y divide-border/70 -my-2">
          <li v-for="(n, i) in notifs" :key="i" class="py-2.5 flex items-start gap-3 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors">
            <span :class="'mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ' + (n.u ? 'bg-primary' : 'bg-muted-foreground/30')" />
            <div class="min-w-0 flex-1">
              <p class="text-[13px] text-foreground leading-snug">{{ n.t }}</p>
              <p class="text-[11px] text-muted-foreground mt-0.5">{{ n.s }} · {{ n.a }} trước</p>
            </div>
            <span v-if="n.u" class="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">MỚI</span>
          </li>
        </ul>
      </SectionCard>
    </div>

    <!-- Row 2: job titles + Japanese level -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <SectionCard :delay="150" class="lg:col-span-3" title="Nhân viên theo chức vụ">
        <template #action>
          <button class="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-border bg-muted/30 text-[12px] text-muted-foreground">
            Toàn công ty <ChevronDown :size="12" />
          </button>
        </template>
        <div class="space-y-3">
          <BarRow v-for="(j, i) in jobTitles" :key="i" :label="j.label" :value="j.value" :max="maxJob" :accent="i === 0" />
        </div>
      </SectionCard>

      <SectionCard :delay="200" class="lg:col-span-2" title="Trình độ tiếng Nhật">
        <template #action><span class="text-[11px] font-mono text-muted-foreground">N=248</span></template>
        <div class="grid grid-cols-3 gap-2.5">
          <div
v-for="(j, i) in jpLevels" :key="j.lv"
               :class="'rounded-xl border p-3 flex flex-col items-center justify-center gap-0.5 ' + (i < 2 ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/30')">
            <span :class="'text-[20px] font-bold font-heading tabular-nums ' + (i < 2 ? 'text-primary' : 'text-foreground')">{{ j.count }}</span>
            <span class="text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground">{{ j.lv }}</span>
            <div class="w-full h-0.5 rounded-full bg-muted/70 mt-1.5 overflow-hidden">
              <div class="h-full" :style="{ width: (j.count / maxJp * 100) + '%', background: i < 2 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.5)' }" />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- Row 3: tech chips + eval rank -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <SectionCard :delay="250" class="lg:col-span-2" title="Công nghệ quan tâm">
        <template #action><span class="text-[11px] text-muted-foreground">Top 14</span></template>
        <div class="flex flex-wrap gap-1.5">
          <button
v-for="(t, i) in tech" :key="t.n"
                  :class="'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-medium border transition-colors hover:border-primary/50 ' + (i === 0 ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-muted/40 text-foreground/85')">
            {{ t.n }}
            <span :class="'text-[10.5px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full ' + (i === 0 ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground')">{{ t.c }}</span>
          </button>
        </div>
      </SectionCard>

      <SectionCard :delay="300" class="lg:col-span-3" title="Phân bố rank đánh giá — 4 quý gần nhất">
        <template #action><button class="text-[12px] text-primary hover:underline">Xem chi tiết →</button></template>
        <table class="w-full text-[13px]">
          <thead>
            <tr class="text-muted-foreground">
              <th class="text-left font-semibold pb-2 pr-3">Rank</th>
              <th v-for="q in quarters" :key="q" class="text-center font-semibold pb-2 px-1 text-[12px] font-mono">{{ q }}</th>
              <th class="pl-3 pb-2 text-left text-[11px] font-semibold">Xu hướng</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in ranks" :key="r" class="border-t border-border/60">
              <td class="py-2 pr-3">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold text-white tabular-nums" :style="{ background: rankColors[i] }">{{ r }}</span>
              </td>
              <td v-for="(v, j) in evalData[i]" :key="j" class="text-center font-medium tabular-nums py-2 px-1">{{ v }}</td>
              <td class="pl-3 py-2" :style="{ color: rankColors[i] }">
                <Sparkline :data="evalData[i]!" :width="56" :height="20" stroke="currentColor" :filled="false" />
              </td>
            </tr>
          </tbody>
        </table>
      </SectionCard>
    </div>
  </div>
</template>
