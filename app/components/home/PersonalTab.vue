<script setup lang="ts">
import { ArrowRight, TrendingUp, Mail, Phone, Calendar, Building2, Users } from 'lucide-vue-next'
import SectionCard from './SectionCard.vue'
import Donut from '~/components/charts/Donut.vue'
import LineChart from '~/components/charts/LineChart.vue'

const rankGrowth = [
  { label: 'Q1/24', value: 5 }, { label: 'Q2/24', value: 4 }, { label: 'Q3/24', value: 4 },
  { label: 'Q4/24', value: 3 }, { label: 'Q1/25', value: 3 }, { label: 'Q2/25', value: 2 },
  { label: 'Q3/25', value: 2 }, { label: 'Q4/25', value: 2 }, { label: 'Q1/26', value: 1 },
]
const projects = [
  { name: 'Cổng thanh toán XYZ', role: 'Tech Lead', joined: '15/01/2025', members: 12, progress: 68, color: 'sky' },
  { name: 'Hệ thống CRM nội bộ', role: 'Frontend', joined: '08/09/2024', members: 7, progress: 92, color: 'emerald' },
  { name: 'App giao đồ ăn FoodGo', role: 'Reviewer', joined: '22/11/2024', members: 18, progress: 35, color: 'amber' },
  { name: 'Quản lý kho ABC v2', role: 'Backend', joined: '04/03/2025', members: 9, progress: 54, color: 'violet' },
]
const leaveUsed = 6
const leaveTotal = 14
const fields = [
  { icon: Mail, label: 'Email', value: 'an.nguyen@vnlab.vn', hint: '' },
  { icon: Phone, label: 'Điện thoại', value: '0912 345 678', hint: '' },
  { icon: Calendar, label: 'Ngày sinh', value: '04/08/1994', hint: '31 tuổi' },
  { icon: Building2, label: 'Chi nhánh', value: 'Hà Nội – Trụ sở chính', hint: '' },
]
const projGradient = (c: string) => c === 'sky' ? 'linear-gradient(135deg,#67d4ff,#0e7eb5)'
  : c === 'emerald' ? 'linear-gradient(135deg,#6ee7b7,#047857)'
  : c === 'amber' ? 'linear-gradient(135deg,#fcd34d,#b45309)'
  : 'linear-gradient(135deg,#c4b5fd,#5b21b6)'
</script>

<template>
  <div class="space-y-6">
    <!-- Row 1: contact + leave -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <SectionCard :delay="50" class="lg:col-span-3" title="Thông tin cá nhân">
        <template #action><button class="text-[12px] text-primary hover:underline inline-flex items-center gap-1">Chỉnh sửa <ArrowRight :size="11" /></button></template>
        <div class="flex items-start gap-5">
          <span
class="w-16 h-16 rounded-xl inline-flex items-center justify-center text-[20px] font-bold text-white font-heading shrink-0"
                :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 38%))' }">NA</span>
          <div class="min-w-0 flex-1">
            <h4 class="text-[18px] font-bold text-foreground font-heading">Nguyễn Văn An</h4>
            <p class="text-[12.5px] text-muted-foreground mt-0.5">Senior Frontend Engineer · Hà Nội</p>
            <div class="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
              <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Rank A → S</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">3 năm 4 tháng</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">JLPT N2</span>
            </div>
          </div>
        </div>
        <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5 pt-5 border-t border-border/70">
          <div v-for="f in fields" :key="f.label" class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-primary/[0.08] text-primary flex items-center justify-center shrink-0">
              <component :is="f.icon" :size="14" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] text-muted-foreground uppercase tracking-wider">{{ f.label }}</p>
              <p class="text-[13.5px] text-foreground font-medium truncate">{{ f.value }}</p>
            </div>
            <span v-if="f.hint" class="text-[11px] text-muted-foreground font-mono">{{ f.hint }}</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard :delay="100" class="lg:col-span-2" title="Phép năm 2026">
        <template #action><button class="text-[12px] text-primary hover:underline">Tạo đơn →</button></template>
        <div class="flex items-center gap-5">
          <Donut :used="leaveUsed" :total="leaveTotal" :label="`${leaveTotal - leaveUsed}`" :sublabel="`/ ${leaveTotal} ngày còn`" />
          <div class="flex-1 space-y-2.5 text-[13px]">
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-2 text-muted-foreground"><span class="h-2 w-2 rounded-full" :style="{ background: 'hsl(var(--primary))' }" />Đã dùng</span>
              <span class="font-semibold tabular-nums">{{ leaveUsed }} ngày</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-2 text-muted-foreground"><span class="h-2 w-2 rounded-full bg-muted-foreground/30" />Còn lại</span>
              <span class="font-semibold tabular-nums text-emerald-600">{{ leaveTotal - leaveUsed }} ngày</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-border/70">
              <span class="text-muted-foreground">Phép thêm</span><span class="font-semibold tabular-nums">+2 ngày</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Còn lại kỳ trước</span><span class="font-semibold tabular-nums">3 ngày</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- Row 2: rank growth line -->
    <SectionCard :delay="150" title="Hạng tăng trưởng của bạn">
      <template #action>
        <div class="flex items-center gap-3 text-[12px]">
          <span class="text-muted-foreground">Kỳ hiện tại:</span>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">Rank S <TrendingUp :size="11" /></span>
        </div>
      </template>
      <div class="h-[240px]">
        <LineChart :data="rankGrowth" :height="240" />
      </div>
      <p class="text-[11.5px] text-muted-foreground mt-2 italic">Rank được đo từ 1 (S) đến 6 (E). Xu hướng càng lên thì hạng càng cao.</p>
    </SectionCard>

    <!-- Row 3: projects -->
    <SectionCard :delay="200" title="Dự án bạn tham gia">
      <template #action><span class="text-[11.5px] text-muted-foreground">{{ projects.length }} dự án đang hoạt động</span></template>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button v-for="(p, i) in projects" :key="i" class="card-surface interactive p-4 text-left flex flex-col gap-3" style="border-radius:12px">
          <div class="flex items-start gap-2.5">
            <div class="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-[13px] font-heading" :style="{ background: projGradient(p.color) }">{{ p.name.slice(0, 1) }}</div>
            <div class="min-w-0 flex-1">
              <p class="text-[13px] font-semibold text-foreground truncate">{{ p.name }}</p>
              <p class="text-[11px] text-muted-foreground">{{ p.role }}</p>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between text-[11px] mb-1">
              <span class="text-muted-foreground">Tiến độ</span><span class="font-semibold tabular-nums text-foreground">{{ p.progress }}%</span>
            </div>
            <div class="h-1.5 rounded-full bg-muted overflow-hidden">
              <div class="h-full rounded-full" :style="{ width: p.progress + '%', background: 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 65%), hsl(var(--primary-h) var(--primary-s) 45%))' }" />
            </div>
          </div>
          <div class="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/70 pt-2.5">
            <span class="inline-flex items-center gap-1"><Users :size="11" />{{ p.members }} thành viên</span>
            <span class="font-mono">{{ p.joined }}</span>
          </div>
        </button>
      </div>
    </SectionCard>
  </div>
</template>
