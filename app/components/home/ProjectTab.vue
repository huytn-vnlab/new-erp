<script setup lang="ts">
import { ref, computed } from 'vue'
import { Target, Plus, ChevronRight, X, ExternalLink } from 'lucide-vue-next'
import SectionCard from './SectionCard.vue'
import StackedBar from '~/components/charts/StackedBar.vue'

type Project = { id: number; name: string; manager: string; members: number; status: 'active' | 'pending' | 'ended'; branch: string; targets: number }

const projects: Project[] = [
  { id: 1, name: 'Cổng thanh toán XYZ', manager: 'Hoàng Đức Thành', members: 12, status: 'active', branch: 'Hà Nội', targets: 2 },
  { id: 2, name: 'Hệ thống CRM nội bộ', manager: 'Phạm Thu Hà', members: 7, status: 'active', branch: 'Đà Nẵng', targets: 1 },
  { id: 3, name: 'App giao đồ ăn FoodGo', manager: 'Lê Quang Huy', members: 18, status: 'active', branch: 'HCM', targets: 1 },
  { id: 4, name: 'Quản lý kho ABC v2', manager: 'Trần Thị Mai', members: 9, status: 'active', branch: 'Hà Nội', targets: 0 },
  { id: 5, name: 'Module báo cáo BI', manager: 'Vũ Thị Lan', members: 4, status: 'pending', branch: 'Đà Nẵng', targets: 1 },
  { id: 6, name: 'Hệ thống tuyển dụng', manager: 'Đỗ Minh Tuấn', members: 6, status: 'pending', branch: 'Hà Nội', targets: 0 },
  { id: 7, name: 'Mobile companion app', manager: 'Bùi Đức Thành', members: 11, status: 'active', branch: 'Osaka', targets: 0 },
  { id: 8, name: 'Security audit & hardening', manager: 'Lê Quang Huy', members: 5, status: 'ended', branch: 'HCM', targets: 1 },
]
const PROJ_STATUS: Record<string, { label: string; dot: string; cls: string }> = {
  active: { label: 'Đang hoạt động', dot: '#22c55e', cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
  pending: { label: 'Chờ khởi động', dot: '#f59e0b', cls: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
  ended: { label: 'Đã kết thúc', dot: '#a3a3a3', cls: 'text-muted-foreground bg-muted' },
}
const sumMembers = (b: string) => projects.filter(p => p.branch === b).reduce((a, p) => a + p.members, 0)
const totalMembers = computed(() => projects.reduce((a, p) => a + p.members, 0))
const activeCount = computed(() => projects.filter(p => p.status === 'active').length)
const pendingCount = computed(() => projects.filter(p => p.status === 'pending').length)
const endedCount = computed(() => projects.filter(p => p.status === 'ended').length)
const totalTargets = computed(() => projects.reduce((a, p) => a + p.targets, 0))
const summary = computed(() => [
  { l: 'Tổng dự án', v: projects.length, sub: `${activeCount.value} đang hoạt động` },
  { l: 'Chờ / Kết thúc', v: `${pendingCount.value} / ${endedCount.value}`, sub: 'Chờ khởi động · đã xong' },
  { l: 'Tổng thành viên', v: totalMembers.value, sub: 'Trên tất cả dự án' },
  { l: 'Mục tiêu quý', v: totalTargets.value, sub: 'Đang theo dõi' },
])
const branchDist = [
  { label: 'Hà Nội', color: 'hsl(var(--primary))', value: sumMembers('Hà Nội') },
  { label: 'Đà Nẵng', color: 'hsl(var(--primary-h) 70% 70%)', value: sumMembers('Đà Nẵng') },
  { label: 'HCM', color: 'hsl(38 92% 60%)', value: sumMembers('HCM') },
  { label: 'Osaka', color: 'hsl(160 60% 50%)', value: sumMembers('Osaka') },
]
const topManagers = [
  { n: 'Hoàng Đức Thành', c: 2, p: 'PM Senior' }, { n: 'Phạm Thu Hà', c: 1, p: 'Tech Lead' },
  { n: 'Lê Quang Huy', c: 1, p: 'Engineering Manager' }, { n: 'Trần Thị Mai', c: 1, p: 'PM' }, { n: 'Đỗ Minh Tuấn', c: 1, p: 'PM' },
]
const memberRows = [
  ['Nguyễn Văn An', 'Hà Nội', '15/01/2025'], ['Trần Thị Mai', 'Đà Nẵng', '15/01/2025'],
  ['Lê Quang Huy', 'Hồ Chí Minh', '04/03/2025'], ['Phạm Thu Hà', 'Đà Nẵng', '12/02/2025'],
  ['Hoàng Đức Thành', 'Hà Nội', '15/01/2025'], ['Đỗ Minh Tuấn', 'Hà Nội', '20/04/2025'], ['Vũ Thị Lan', 'Hà Nội', '02/05/2025'],
]
const initials = (n: string) => n.split(' ').map(s => s[0]).slice(-2).join('')
const openProject = ref<Project | null>(null)
</script>

<template>
  <div class="space-y-6">
    <!-- Summary strip -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="(s, i) in summary" :key="i" class="card-surface p-4 rise" :style="{ animationDelay: i * 40 + 'ms' }">
        <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{{ s.l }}</p>
        <p class="text-[24px] font-bold font-heading text-foreground mt-0.5 tabular-nums">{{ s.v }}</p>
        <p class="text-[11px] text-muted-foreground mt-0.5">{{ s.sub }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Project list -->
      <SectionCard :delay="200" class="lg:col-span-3" title="Danh sách dự án">
        <template #action>
          <div class="flex items-center gap-2">
            <button class="text-[12px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted">Lọc</button>
            <button class="inline-flex items-center gap-1 text-[12px] font-semibold text-white px-2.5 py-1.5 rounded-md"
                    :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }"
                    @click="navigateTo('/workflow/project')">
              <Plus :size="12" /> Dự án mới
            </button>
          </div>
        </template>
        <div class="-m-5">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="thead-primary border-b border-border/70">
                <th class="text-left font-semibold py-2.5 px-5">Dự án</th>
                <th class="text-left font-semibold py-2.5 px-2">Quản lý</th>
                <th class="text-right font-semibold py-2.5 px-2">Thành viên</th>
                <th class="text-left font-semibold py-2.5 px-3">Trạng thái</th>
                <th class="text-center font-semibold py-2.5 px-3">Mục tiêu quý</th>
                <th class="py-2.5 px-3" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in projects" :key="p.id" class="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" @click="openProject = p">
                <td class="py-3 px-5">
                  <div class="flex items-center gap-2.5">
                    <span class="h-2 w-2 rounded-full shrink-0" :style="{ background: PROJ_STATUS[p.status]!.dot }" />
                    <div>
                      <p class="font-medium text-foreground">{{ p.name }}</p>
                      <p class="text-[11px] text-muted-foreground">{{ p.branch }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-2 text-foreground/80">{{ p.manager }}</td>
                <td class="py-3 px-2 text-right font-bold text-primary tabular-nums">{{ p.members }}</td>
                <td class="py-3 px-3">
                  <span :class="'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ' + PROJ_STATUS[p.status]!.cls">
                    <span class="h-1.5 w-1.5 rounded-full" :style="{ background: PROJ_STATUS[p.status]!.dot }" />{{ PROJ_STATUS[p.status]!.label }}
                  </span>
                </td>
                <td class="py-3 px-3 text-center">
                  <span v-if="p.targets > 0" class="inline-flex items-center gap-1 text-[12px] font-medium text-primary"><Target :size="11" />{{ p.targets }}</span>
                  <span v-else class="text-muted-foreground/50">—</span>
                </td>
                <td class="py-3 px-3 text-right text-muted-foreground"><ChevronRight :size="14" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      <!-- Right side -->
      <div class="lg:col-span-2 space-y-6">
        <SectionCard :delay="250" title="Phân bố thành viên theo chi nhánh">
          <div class="space-y-3">
            <StackedBar :segments="branchDist" :height="10" />
            <ul class="grid grid-cols-2 gap-2 text-[12px]">
              <li v-for="b in branchDist" :key="b.label" class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: b.color }" />
                <span class="text-foreground/80 flex-1">{{ b.label }}</span>
                <span class="font-semibold tabular-nums">{{ b.value }}</span>
              </li>
            </ul>
          </div>
        </SectionCard>

        <SectionCard :delay="300" title="Top quản lý dự án">
          <ul class="space-y-3">
            <li v-for="(u, i) in topManagers" :key="i" class="flex items-center gap-3">
              <span class="h-9 w-9 rounded-lg flex items-center justify-center text-[11px] font-semibold text-white"
                    :style="{ background: `linear-gradient(135deg, hsl(${(i * 60 + 200) % 360} 70% 65%), hsl(${(i * 60 + 200) % 360} 70% 45%))` }">{{ initials(u.n) }}</span>
              <div class="min-w-0 flex-1">
                <p class="text-[13px] font-medium text-foreground truncate">{{ u.n }}</p>
                <p class="text-[11px] text-muted-foreground">{{ u.p }}</p>
              </div>
              <span class="text-[11.5px] font-mono font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-full">{{ u.c }} dự án</span>
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="openProject" class="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="openProject = null" />
      <div class="relative card-surface w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rise">
        <div class="px-5 py-4 border-b border-border/70 flex items-center justify-between">
          <div>
            <h3 class="text-[16px] font-bold font-heading text-foreground">{{ openProject.name }}</h3>
            <p class="text-[12px] text-muted-foreground mt-0.5">Quản lý: {{ openProject.manager }} · {{ openProject.members }} thành viên</p>
          </div>
          <button class="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" @click="openProject = null"><X :size="16" /></button>
        </div>
        <div class="flex-1 overflow-y-auto scrollbar-thin p-5">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="text-muted-foreground border-b border-border/70">
                <th class="text-left font-semibold pb-2">Thành viên</th>
                <th class="text-left font-semibold pb-2">Chi nhánh</th>
                <th class="text-right font-semibold pb-2">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in memberRows.slice(0, openProject.members)" :key="i" class="border-b border-border/50 last:border-0 hover:bg-muted/40 cursor-pointer">
                <td class="py-2.5 text-foreground">{{ row[0] }}</td>
                <td class="py-2.5 text-foreground/80">{{ row[1] }}</td>
                <td class="py-2.5 text-right font-mono text-muted-foreground">{{ row[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
          <button class="px-3 py-1.5 text-[13px] rounded-md hover:bg-muted text-foreground/80" @click="openProject = null">Đóng</button>
          <button class="px-3 py-1.5 text-[13px] rounded-md text-white font-semibold inline-flex items-center gap-1"
                  :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }">
            Chi tiết dự án <ExternalLink :size="12" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
