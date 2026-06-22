<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { FileText, Plus, Check, X, Clock } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import Select from '~/components/base/Select.vue'
import FilterBar from '~/components/base/FilterBar.vue'
import FieldInput from '~/components/base/FieldInput.vue'
import SectionCard from '~/components/home/SectionCard.vue'
import BarRow from '~/components/charts/BarRow.vue'
import { OT_REQUESTS, OT_STATUS_META, OT_PROJECTS, type OTRequest, type OTStatus } from '~/mocks/overtime'
import type { OvertimeRow } from '~/types'
import { useOvertimeStore } from '~/stores/overtime'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const auth = useAuth()
const overtimeStore = useOvertimeStore()
onMounted(() => overtimeStore.fetchOvertimes())

const ME = computed(() => auth.user.value?.name ?? 'Nguyễn Văn An')

const STATUS_MAP: Record<number, OTStatus> = { 1: 'pending', 2: 'approved', 3: 'rejected' }

function mapOtRow(r: OvertimeRow): OTRequest {
  // datetime_overtime_from format: "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss"
  const fromStr = r.datetime_overtime_from?.replace('T', ' ') ?? ''
  const toStr = r.datetime_overtime_to?.replace('T', ' ') ?? ''
  const [fromDate, fromTime] = fromStr.split(' ')
  const [, toTime] = toStr.split(' ')
  let dateVN = '—'
  if (fromDate) {
    const [y, m, d] = fromDate.split('-')
    dateVN = `${d}/${m}/${y}`
  }
  const start = fromTime?.slice(0, 5) ?? '—'
  const end = toTime?.slice(0, 5) ?? '—'
  let hours = 0
  if (fromStr && toStr) {
    const diff = (new Date(toStr.trim()).getTime() - new Date(fromStr.trim()).getTime()) / 3600000
    hours = Math.round(diff * 10) / 10
  }
  const status: OTStatus = STATUS_MAP[r.status] ?? 'pending'
  return {
    id: r.id,
    user: r.full_name ?? `User ${r.user_id}`,
    branch: '',
    project: r.project_name ?? `Project ${r.project_id}`,
    date: dateVN,
    start,
    end,
    hours,
    reason: r.reason ?? '',
    status,
    approver: null,
    approved: null,
    submitted: r.created_at?.slice(0, 10) ?? '',
  }
}

const tab = ref<'manage' | 'mine'>('manage')
const statusFilter = ref('all')
const search = ref('')
const requests = ref<OTRequest[]>(OT_REQUESTS.map(r => ({ ...r })))

// Populate from store when data loads
watch(() => overtimeStore.rows, (rows) => {
  if (rows.length > 0) requests.value = rows.map(mapOtRow)
}, { immediate: true })
const openReject = ref<OTRequest | null>(null)
const rejectReason = ref('')
const showCreate = ref(false)

const statusOpts = [
  { value: 'all', label: 'Tất cả trạng thái' },
  ...Object.entries(OT_STATUS_META).map(([k, v]) => ({ value: k, label: v.label })),
]

const projectOpts = OT_PROJECTS.map(p => ({ value: p, label: p }))
const newProject = ref('')
const newDate = ref('2026-05-25')
const newStart = ref('18:00')
const newEnd = ref('21:00')
const newReason = ref('')

const filtered = computed(() =>
  requests.value.filter(r => {
    if (tab.value === 'mine' && r.user !== ME.value) return false
    if (statusFilter.value !== 'all' && r.status !== statusFilter.value) return false
    const q = search.value.toLowerCase()
    if (q && !r.user.toLowerCase().includes(q) && !r.project.toLowerCase().includes(q)) return false
    return true
  })
)

const tabCounts = computed(() => ({
  manage: requests.value.length,
  mine: requests.value.filter(r => r.user === ME.value).length,
}))

const stats = computed(() => {
  const pending = requests.value.filter(r => r.status === 'pending').length
  const approved = requests.value.filter(r => r.status === 'approved')
  const totalHours = approved.reduce((s, r) => s + r.hours, 0)
  const myPending = requests.value.filter(r => r.user === ME.value && r.status === 'pending').length
  const myHours = requests.value.filter(r => r.user === ME.value && r.status !== 'rejected').reduce((s, r) => s + r.hours, 0)
  const uniqueUsers = new Set(approved.map(r => r.user)).size
  const avgPerPerson = uniqueUsers > 0 ? totalHours / uniqueUsers : 0
  return { pending, approvedCount: approved.length, totalHours, myPending, myHours, avgPerPerson }
})

// OT hours per day (approved, May 2026)
const otByDay = computed(() => {
  const m: Record<number, number> = {}
  requests.value.filter(r => r.status === 'approved').forEach(r => {
    const d = parseInt(r.date.split('/')[0] ?? '1')
    m[d] = (m[d] ?? 0) + r.hours
  })
  return m
})

const maxOtHours = computed(() => Math.max(...Object.values(otByDay.value), 1))

// Calendar cells for May 2026
const calendarCells = computed(() => {
  const firstDow = (new Date(2026, 4, 1).getDay() + 6) % 7 // Mon-first → 4
  const cells: Array<{ blank: boolean; d?: number; h?: number }> = []
  for (let i = 0; i < firstDow; i++) cells.push({ blank: true })
  for (let d = 1; d <= 31; d++) cells.push({ blank: false, d, h: otByDay.value[d] ?? 0 })
  while (cells.length % 7) cells.push({ blank: true })
  return cells
})

// Project distribution (approved only, sorted desc)
const otByProject = computed(() => {
  const m: Record<string, number> = {}
  requests.value.filter(r => r.status === 'approved').forEach(r => {
    m[r.project] = (m[r.project] ?? 0) + r.hours
  })
  return Object.entries(m).sort((a, b) => b[1] - a[1])
})

const maxProjectHours = computed(() => Math.max(...otByProject.value.map(([, h]) => h), 1))

// Top 5 OT leaderboard (approved)
const topOT = computed(() => {
  const m: Record<string, number> = {}
  requests.value.filter(r => r.status === 'approved').forEach(r => {
    m[r.user] = (m[r.user] ?? 0) + r.hours
  })
  return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5)
})

function otCellBg(h: number, intensity: number) {
  if (h === 0) return 'hsl(var(--muted))'
  const l = Math.round(58 - intensity * 18)
  const a = Math.round(intensity * 85 + 15)
  return `hsl(var(--primary-h) var(--primary-s) ${l}% / ${a}%)`
}

async function handleApprove(row: OTRequest) {
  await overtimeStore.updateStatus(row.id, 2)
  const idx = requests.value.findIndex(r => r.id === row.id)
  if (idx >= 0) {
    const cur = requests.value[idx]!
    requests.value[idx] = { ...cur, status: 'approved', approver: ME.value }
  }
}

async function confirmReject() {
  if (!openReject.value || !rejectReason.value.trim()) return
  const id = openReject.value.id
  await overtimeStore.updateStatus(id, 3)
  const idx = requests.value.findIndex(r => r.id === id)
  if (idx >= 0) {
    const cur = requests.value[idx]!
    requests.value[idx] = { ...cur, status: 'rejected', approver: ME.value, rejectReason: rejectReason.value }
  }
  openReject.value = null
  rejectReason.value = ''
}

function openCreateReject(row: OTRequest) {
  openReject.value = row
  rejectReason.value = ''
}

function submitCreate() {
  showCreate.value = false
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      eyebrow="Yêu cầu"
      title="Quản lý tăng ca (OT)"
      description="Theo dõi và phê duyệt yêu cầu làm thêm giờ. Admin có thể duyệt/từ chối; nhân viên theo dõi trạng thái đơn của mình."
    >
      <template #actions>
        <Btn variant="outline"><FileText :size="14" />Xuất Excel</Btn>
        <Btn variant="primary" @click="showCreate = true"><Plus :size="14" />Đăng ký OT</Btn>
      </template>
    </PageHeader>

    <!-- MiniStats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MiniStat label="Chờ duyệt" :value="stats.pending" sublabel="Cần xử lý hôm nay" accent="amber" :delay="40" />
      <MiniStat label="Đã duyệt tháng này" :value="stats.approvedCount" :sublabel="`${stats.totalHours} giờ OT`" accent="green" :delay="80" />
      <MiniStat label="OT của tôi (tháng)" :value="`${stats.myHours}h`" :sublabel="`${stats.myPending} đơn chờ duyệt`" accent="primary" :delay="120" />
      <MiniStat
        label="Trung bình/người"
        :value="`${stats.avgPerPerson.toFixed(1)}h`"
        sublabel="Mức khuyến cáo <20h/tháng"
        :accent="stats.avgPerPerson > 20 ? 'red' : 'violet'"
        :delay="160"
      />
    </div>

    <!-- 3-col: heatmap | project bars | top leaderboard -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      <!-- OT heatmap calendar -->
      <SectionCard :delay="200" title="OT tháng 5/2026 — theo ngày">
        <template #action>
          <span class="text-[11px] font-mono text-muted-foreground">{{ stats.totalHours }}h tổng</span>
        </template>
        <div>
          <div class="grid grid-cols-7 gap-1">
            <div
              v-for="d in ['T2','T3','T4','T5','T6','T7','CN']" :key="d"
              class="text-[10px] uppercase font-semibold text-muted-foreground text-center py-1"
            >{{ d }}</div>
            <template v-for="(cell, i) in calendarCells" :key="i">
              <div v-if="cell.blank" />
              <div
                v-else
                :title="(cell.h ?? 0) > 0 ? `${cell.d}/5: ${cell.h}h OT` : `${cell.d}/5`"
                class="aspect-square rounded-md flex items-center justify-center cursor-pointer transition-all hover:scale-[1.05] relative"
                :class="cell.d === 22 ? 'ring-1 ring-primary' : ''"
                :style="{ background: otCellBg(cell.h ?? 0, Math.max(0.15, (cell.h ?? 0) / maxOtHours)) }"
              >
                <span
                  class="text-[11px] tabular-nums font-medium"
                  :class="(cell.h ?? 0) > 0 ? 'text-white' : cell.d === 22 ? 'text-primary font-bold' : 'text-muted-foreground'"
                >{{ cell.d }}</span>
                <span v-if="(cell.h ?? 0) > 0" class="absolute bottom-0.5 right-0.5 text-[7.5px] font-bold text-white/80">{{ cell.h }}</span>
              </div>
            </template>
          </div>
          <div class="flex items-center gap-2 mt-3 text-[10.5px] text-muted-foreground">
            <span>Ít giờ</span>
            <div class="flex gap-0.5">
              <div
                v-for="i in [0.2, 0.4, 0.6, 0.8, 1]" :key="i"
                class="w-3.5 h-3.5 rounded-sm"
                :style="{ background: `hsl(var(--primary-h) var(--primary-s) ${Math.round(58 - i * 18)}% / ${Math.round(i * 85 + 15)}%)` }"
              />
            </div>
            <span>Nhiều giờ</span>
          </div>
        </div>
      </SectionCard>

      <!-- Project distribution bars -->
      <SectionCard :delay="260" title="Phân bổ OT theo dự án">
        <div class="space-y-3">
          <BarRow
            v-for="entry in otByProject" :key="entry[0]"
            :label="entry[0].length > 22 ? entry[0].slice(0, 20) + '…' : entry[0]"
            :value="entry[1]"
            :max="maxProjectHours"
            :accent="entry[0] === 'Cổng thanh toán XYZ'"
          />
        </div>
      </SectionCard>

      <!-- Top OT leaderboard -->
      <SectionCard :delay="320" title="Top OT tháng này">
        <ul class="space-y-2.5">
          <li v-for="(entry, i) in topOT" :key="entry[0]" class="flex items-center gap-3 text-[13px]">
            <span class="w-5 text-center text-[11px] font-bold text-muted-foreground tabular-nums">#{{ i + 1 }}</span>
            <Avatar :name="entry[0]" :size="28" />
            <span class="flex-1 font-medium text-foreground truncate">{{ entry[0] }}</span>
            <span class="font-bold tabular-nums font-mono" :class="entry[1] >= 12 ? 'text-amber-600' : 'text-foreground'">{{ entry[1] }}h</span>
            <span v-if="entry[1] >= 16" class="text-[10px] text-amber-600">⚠</span>
          </li>
        </ul>
      </SectionCard>
    </div>

    <!-- Tab strip + filter + table -->
    <div class="space-y-4">
      <div class="border-b border-border/70">
        <div class="flex gap-7">
          <button
            v-for="[k, l] in [['manage', 'Tất cả yêu cầu'], ['mine', 'Đơn của tôi']]"
            :key="k"
            :data-active="tab === k"
            class="tab-trigger inline-flex items-center gap-2"
            @click="tab = k as typeof tab"
          >
            {{ l }}
            <span
              class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums"
              :class="tab === k ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'"
            >{{ tabCounts[k as typeof tab] }}</span>
          </button>
        </div>
      </div>

      <FilterBar>
        <FieldInput v-model="search" placeholder="Tên hoặc tên dự án…" :width="200" />
        <Select v-model="statusFilter" :options="statusOpts" style="min-width: 160px" />
      </FilterBar>

      <div class="card-surface overflow-hidden rise" style="animation-delay: 160ms">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 860px">
            <thead>
              <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th class="text-left py-3 px-5">Nhân viên</th>
                <th class="text-left py-3 px-3">Dự án</th>
                <th class="text-left py-3 px-3">Ngày · Thời gian</th>
                <th class="text-center py-3 px-3">Giờ</th>
                <th class="text-center py-3 px-3">Trạng thái</th>
                <th class="text-right py-3 px-5">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in filtered" :key="r.id"
                class="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td class="py-3 px-5">
                  <div class="flex items-center gap-3">
                    <Avatar :name="r.user" :size="30" />
                    <div>
                      <p class="font-semibold text-foreground">{{ r.user }}</p>
                      <p class="text-[11px] text-muted-foreground">{{ r.branch }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3">
                  <p class="text-foreground/85 text-[12.5px] truncate max-w-[200px]">{{ r.project }}</p>
                  <p class="text-[11px] text-muted-foreground truncate max-w-[200px]">{{ r.reason }}</p>
                </td>
                <td class="py-3 px-3">
                  <p class="font-mono text-foreground/85">{{ r.date }}</p>
                  <p class="text-[11.5px] font-mono text-primary">{{ r.start }} – {{ r.end }}</p>
                </td>
                <td class="py-3 px-3 text-center">
                  <span class="font-bold tabular-nums text-foreground">{{ r.hours }}</span>
                  <span class="text-muted-foreground text-[11px]">h</span>
                </td>
                <td class="py-3 px-3 text-center">
                  <Badge :variant="OT_STATUS_META[r.status].variant" dot>{{ OT_STATUS_META[r.status].label }}</Badge>
                  <p v-if="r.status === 'rejected' && r.rejectReason" class="text-[10.5px] text-muted-foreground mt-0.5 italic truncate max-w-[100px]">{{ r.rejectReason }}</p>
                </td>
                <td class="py-3 px-5 text-right">
                  <template v-if="r.status === 'pending'">
                    <div v-if="tab === 'manage'" class="inline-flex gap-1.5">
                      <Btn variant="success" size="xs" @click="handleApprove(r)"><Check :size="11" />Duyệt</Btn>
                      <Btn variant="ghost" size="xs" @click="openCreateReject(r)">Từ chối</Btn>
                    </div>
                    <Btn v-else variant="ghost" size="xs">Huỷ đơn</Btn>
                  </template>
                  <span v-else class="text-[11px] text-muted-foreground">{{ r.approver || '—' }}</span>
                </td>
              </tr>
              <tr v-if="filtered.length === 0">
                <td colspan="6" class="py-14 text-center text-muted-foreground">
                  <Clock :size="36" class="mx-auto mb-2 opacity-30" />
                  Không có yêu cầu OT phù hợp
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Reject modal -->
    <Teleport to="body">
      <div v-if="openReject" class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="openReject = null" />
        <div class="relative card-surface w-full max-w-md rise overflow-hidden">
          <div class="p-5 border-b border-border/70 flex items-center justify-between">
            <h3 class="font-bold text-[16px] font-heading">Từ chối yêu cầu OT</h3>
            <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="openReject = null"><X :size="14" /></button>
          </div>
          <div class="p-5 space-y-4">
            <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
              <Avatar :name="openReject.user" :size="32" />
              <div>
                <p class="font-semibold">{{ openReject.user }}</p>
                <p class="text-[12px] text-muted-foreground">{{ openReject.date }} · {{ openReject.hours }}h · {{ openReject.project }}</p>
              </div>
            </div>
            <div>
              <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">
                Lý do từ chối <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="rejectReason"
                placeholder="Nhập lý do từ chối để nhân viên được thông báo…"
                rows="3"
                class="w-full px-3 py-2 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60 resize-none"
              />
            </div>
          </div>
          <div class="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
            <Btn variant="ghost" size="sm" @click="openReject = null">Huỷ</Btn>
            <Btn
              variant="danger" size="sm"
              :class="!rejectReason.trim() ? 'opacity-50 pointer-events-none' : ''"
              @click="confirmReject"
            >
              <X :size="12" />Xác nhận từ chối
            </Btn>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create OT modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="showCreate = false" />
        <div class="relative card-surface w-full max-w-lg rise overflow-hidden">
          <div class="p-5 border-b border-border/70 flex items-center justify-between">
            <h3 class="font-bold text-[16px] font-heading">Đăng ký tăng ca</h3>
            <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="showCreate = false"><X :size="14" /></button>
          </div>
          <div class="p-5 space-y-4 text-[13px]">
            <div>
              <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Dự án</label>
              <Select v-model="newProject" :options="projectOpts" placeholder="-- Chọn dự án --" style="width: 100%" />
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Ngày làm OT</label>
                <input v-model="newDate" type="date" class="w-full h-9 px-3 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60">
              </div>
              <div>
                <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Từ</label>
                <input v-model="newStart" type="time" class="w-full h-9 px-3 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60 font-mono">
              </div>
              <div>
                <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Đến</label>
                <input v-model="newEnd" type="time" class="w-full h-9 px-3 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60 font-mono">
              </div>
            </div>
            <div>
              <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Lý do</label>
              <textarea
                v-model="newReason"
                placeholder="Mô tả công việc cần hoàn thành…"
                rows="3"
                class="w-full px-3 py-2 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60 resize-none"
              />
            </div>
            <div class="rounded-lg bg-muted/40 p-3 text-[12px] text-muted-foreground">
              <p class="font-semibold text-foreground mb-0.5">Lưu ý:</p>
              <p>OT tháng này của bạn: <span class="font-semibold text-primary">{{ stats.myHours }}h</span> / giới hạn khuyến cáo 20h. Đơn sẽ được gửi đến quản lý trực tiếp để duyệt.</p>
            </div>
          </div>
          <div class="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
            <Btn variant="ghost" size="sm" @click="showCreate = false">Huỷ</Btn>
            <Btn variant="primary" size="sm" @click="submitCreate"><Check :size="12" />Gửi yêu cầu</Btn>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
