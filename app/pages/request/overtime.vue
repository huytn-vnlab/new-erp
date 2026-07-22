<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { Plus, Check, X, Clock, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import Select from '~/components/base/Select.vue'
import FilterBar from '~/components/base/FilterBar.vue'
import FieldInput from '~/components/base/FieldInput.vue'
import DatePicker from '~/components/base/DatePicker.vue'
import TimePicker from '~/components/base/TimePicker.vue'
import SectionCard from '~/components/home/SectionCard.vue'
import BarRow from '~/components/charts/BarRow.vue'
import SkeletonRow from '~/components/base/SkeletonRow.vue'
import EmptyState from '~/components/base/EmptyState.vue'
import ErrorBanner from '~/components/base/ErrorBanner.vue'
import Modal from '~/components/base/Modal.vue'
import Pagination from '~/components/base/Pagination.vue'
import type { OvertimeRow } from '~/types'
import { useOvertimeStore } from '~/stores/overtime'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const auth = useAuth()
const overtimeStore = useOvertimeStore()
const { show } = useToast()

type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

const roleName = computed(() => auth.user.value?.role_name?.toLowerCase() ?? '')
const isManagerOrGM = computed(() => roleName.value === 'manager' || roleName.value === 'general manager')
// update-overtime-request-status is gated GM-only server-side (CheckGeneralManager
// middleware) — a Manager's approve/reject call would just 403, so the buttons
// are gated to GM only rather than the broader isManagerOrGM used elsewhere.
const isGM = computed(() => roleName.value === 'general manager')

// cf.PendingRequestStatus/DenyRequestStatus/AcceptRequestStatus — the list
// endpoint returns these pre-translated to English strings, not the raw ints.
const OT_STATUS_META: Record<string, { label: string; variant: BadgeVariant }> = {
  Pending: { label: 'Chờ duyệt', variant: 'amber' },
  Deny: { label: 'Từ chối', variant: 'red' },
  Accepted: { label: 'Đã duyệt', variant: 'green' },
}
function statusMeta(status: string) {
  return OT_STATUS_META[status] ?? { label: status, variant: 'gray' as BadgeVariant }
}
const STATUS_FILTER_OPTS = [
  { value: '0', label: 'Tất cả trạng thái' },
  { value: '1', label: 'Chờ duyệt' },
  { value: '2', label: 'Từ chối' },
  { value: '3', label: 'Đã duyệt' },
]

// cf.DayOffTypeOvertime/MoneyTypeOvertime — list rows return the English
// label ("Take Day Off"/"Take Money"); the create form sends the raw int.
const OT_TYPE_LABEL_VI: Record<string, string> = { 'Take Day Off': 'Lấy ngày nghỉ', 'Take Money': 'Lấy tiền' }
const OT_TYPE_OPTS = [
  { value: '1', label: 'Lấy ngày nghỉ' },
  { value: '2', label: 'Lấy tiền' },
]
const WORK_AT_NOON_OPTS = [
  { value: '2', label: 'Không làm buổi trưa' },
  { value: '1', label: 'Có làm buổi trưa' },
]

// ── List state ──
// Defaults to 'manage' and is corrected in onMounted once auth.user has
// actually hydrated from the cookie — isManagerOrGM reads role_name off
// auth.user, which isn't populated yet at this synchronous setup-time init.
const tab = ref<'manage' | 'mine'>('manage')
const search = ref('')
const statusF = ref('0')
const projectF = ref('0')
const branchF = ref('0')

const projectOpts = computed(() => [
  { value: '0', label: 'Tất cả dự án' },
  ...Object.entries(overtimeStore.projects).map(([id, name]) => ({ value: id, label: name })),
])
const branchOpts = computed(() => [
  { value: '0', label: 'Tất cả chi nhánh' },
  ...Object.entries(overtimeStore.branches).map(([id, name]) => ({ value: id, label: name })),
])

function currentFilterParams() {
  return {
    status: statusF.value === '0' ? undefined : Number(statusF.value),
    project_id: projectF.value === '0' ? undefined : Number(projectF.value),
    branch: branchF.value === '0' ? undefined : Number(branchF.value),
  }
}

function fetchList(page = 1) {
  return overtimeStore.fetchOvertimes({ ...currentFilterParams(), current_page: page })
}
function fetchMyList(page = 1) {
  if (!auth.user.value?.id) return Promise.resolve()
  return overtimeStore.fetchMyOvertimes(auth.user.value.id, { ...currentFilterParams(), current_page: page })
}

// ── Reporting period (month) — backs the calendar heatmap, project
// distribution and leaderboard. Defaults to the real current month (the
// original design hardcoded "May 2026"). ──
const today = new Date()
const periodMonth = ref(today.getMonth() + 1)
const periodYear = ref(today.getFullYear())

function monthRange(year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}
async function fetchPeriod() {
  const { from, to } = monthRange(periodYear.value, periodMonth.value)
  await Promise.all([
    overtimeStore.fetchPeriodOvertimes(from, to, isManagerOrGM.value ? undefined : auth.user.value?.id),
    auth.user.value?.id ? overtimeStore.fetchMyPeriodOvertimes(auth.user.value.id, from, to) : Promise.resolve(),
  ])
}
function prevMonth() { if (periodMonth.value === 1) { periodMonth.value = 12; periodYear.value-- } else periodMonth.value-- }
function nextMonth() { if (periodMonth.value === 12) { periodMonth.value = 1; periodYear.value++ } else periodMonth.value++ }
watch([periodMonth, periodYear], fetchPeriod)

onMounted(async () => {
  if (!auth.user.value && auth.token.value) await auth.fetchUser()
  if (!isManagerOrGM.value) tab.value = 'mine'
  if (isManagerOrGM.value) await fetchList(1)
  await fetchMyList(1)
  fetchPeriod()
})

// Filter changes only refetch the currently active tab, matching the
// project/recruitment pages' convention — switching tabs alone doesn't force
// a refetch since each tab already keeps its own data reasonably fresh.
watch([statusF, projectF, branchF], () => (tab.value === 'manage' ? fetchList(1) : fetchMyList(1)))
watchDebounced(search, () => {}, { debounce: 300 })

const activeRows = computed(() => tab.value === 'manage' ? overtimeStore.rows : overtimeStore.myRows)
const activePagination = computed(() => tab.value === 'manage' ? overtimeStore.pagination : overtimeStore.myPagination)
const activeLoading = computed(() => tab.value === 'manage' ? overtimeStore.loading : overtimeStore.myLoading)
const activeError = computed(() => tab.value === 'manage' ? overtimeStore.error : overtimeStore.myError)
function fetchActivePage(page: number) { return tab.value === 'manage' ? fetchList(page) : fetchMyList(page) }

// The list endpoint has no name/project keyword param — search only narrows
// whatever page is currently loaded, not the full server-side dataset.
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return activeRows.value
  return activeRows.value.filter(r => r.full_name.toLowerCase().includes(q) || r.project_name.toLowerCase().includes(q))
})

const tabCounts = computed(() => ({ manage: overtimeStore.pagination.total_row, mine: overtimeStore.myPagination.total_row }))

// ── Summary stats — from the real month-scoped period fetch, not whatever
// page of the (server-paginated) table happens to be loaded. ──
const stats = computed(() => {
  const period = overtimeStore.periodRows
  const pending = period.filter(r => r.status === 'Pending').length
  const approved = period.filter(r => r.status === 'Accepted')
  const totalHours = approved.reduce((s, r) => s + r.working_time, 0)
  const uniquePeople = new Set(approved.map(r => r.full_name)).size
  const avgPerPerson = uniquePeople > 0 ? totalHours / uniquePeople : 0
  const myPeriod = overtimeStore.myPeriodRows
  const myHours = myPeriod.filter(r => r.status !== 'Deny').reduce((s, r) => s + r.working_time, 0)
  const myPending = myPeriod.filter(r => r.status === 'Pending').length
  return { pending, approvedCount: approved.length, totalHours, myHours, myPending, avgPerPerson }
})

// ── OT heatmap calendar for the selected period month ──
const otByDay = computed(() => {
  const m: Record<number, number> = {}
  overtimeStore.periodRows.filter(r => r.status === 'Accepted').forEach(r => {
    const day = parseInt(r.date_overtime.split('/')[2] ?? '0', 10)
    if (day) m[day] = (m[day] ?? 0) + r.working_time
  })
  return m
})
const maxOtHours = computed(() => Math.max(...Object.values(otByDay.value), 1))
const daysInPeriodMonth = computed(() => new Date(periodYear.value, periodMonth.value, 0).getDate())
const isCurrentRealMonth = computed(() => periodMonth.value === today.getMonth() + 1 && periodYear.value === today.getFullYear())
const calendarCells = computed(() => {
  const firstDow = (new Date(periodYear.value, periodMonth.value - 1, 1).getDay() + 6) % 7
  const cells: Array<{ blank: boolean; d?: number; h?: number }> = []
  for (let i = 0; i < firstDow; i++) cells.push({ blank: true })
  for (let d = 1; d <= daysInPeriodMonth.value; d++) cells.push({ blank: false, d, h: otByDay.value[d] ?? 0 })
  while (cells.length % 7) cells.push({ blank: true })
  return cells
})

function otCellBg(h: number, intensity: number) {
  if (h === 0) return 'hsl(var(--muted))'
  const l = Math.round(58 - intensity * 18)
  const a = Math.round(intensity * 85 + 15)
  return `hsl(var(--primary-h) var(--primary-s) ${l}% / ${a}%)`
}

// Project distribution (approved only, sorted desc)
const otByProject = computed(() => {
  const m: Record<string, number> = {}
  overtimeStore.periodRows.filter(r => r.status === 'Accepted').forEach(r => {
    m[r.project_name] = (m[r.project_name] ?? 0) + r.working_time
  })
  return Object.entries(m).sort((a, b) => b[1] - a[1])
})
const maxProjectHours = computed(() => Math.max(...otByProject.value.map(([, h]) => h), 1))

// Top 5 OT leaderboard (approved)
const topOT = computed(() => {
  const m: Record<string, number> = {}
  overtimeStore.periodRows.filter(r => r.status === 'Accepted').forEach(r => {
    m[r.full_name] = (m[r.full_name] ?? 0) + r.working_time
  })
  return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5)
})

async function refreshAfterAction() {
  await Promise.all([
    isManagerOrGM.value ? fetchList(overtimeStore.pagination.current_page) : Promise.resolve(),
    fetchMyList(overtimeStore.myPagination.current_page),
    fetchPeriod(),
  ])
}

async function handleApprove(row: OvertimeRow) {
  const res = await overtimeStore.updateStatus(row.id, 3)
  if (res.ok) {
    show('Đã duyệt thành công!')
    await refreshAfterAction()
  } else {
    show(res.message || 'Không thể duyệt yêu cầu OT.', 'error')
  }
}

// The backend has no reason field on update-overtime-request-status (only
// request_id/status_request) — a reject-reason input would silently discard
// whatever the approver typed, so this is a plain confirm instead.
const openReject = ref<OvertimeRow | null>(null)
const rejectConfirmOpen = ref(false)
function openRejectConfirm(row: OvertimeRow) { openReject.value = row; rejectConfirmOpen.value = true }
function closeRejectConfirm() { rejectConfirmOpen.value = false; openReject.value = null }
async function confirmReject() {
  if (!openReject.value) return
  const res = await overtimeStore.updateStatus(openReject.value.id, 2)
  if (res.ok) {
    show('Đã từ chối yêu cầu OT.')
    closeRejectConfirm()
    await refreshAfterAction()
  } else {
    show(res.message || 'Không thể từ chối yêu cầu OT.', 'error')
  }
}

// ── Create OT request ──
const showCreate = ref(false)
const createForm = reactive({ projectId: '', date: '', start: '18:00', end: '21:00', reason: '', overtimeType: '1', workAtNoon: '2' })
const createErrors = reactive({ projectId: '', date: '', time: '', reason: '' })
const creating = ref(false)
const todayStr = today.toISOString().slice(0, 10)

function openCreate() {
  createForm.projectId = ''
  createForm.date = todayStr
  createForm.start = '18:00'
  createForm.end = '21:00'
  createForm.reason = ''
  createForm.overtimeType = '1'
  createForm.workAtNoon = '2'
  createErrors.projectId = ''; createErrors.date = ''; createErrors.time = ''; createErrors.reason = ''
  showCreate.value = true
}

async function submitCreate() {
  createErrors.projectId = ''; createErrors.date = ''; createErrors.time = ''; createErrors.reason = ''
  if (!createForm.projectId) createErrors.projectId = 'Vui lòng chọn dự án'
  if (!createForm.date) createErrors.date = 'Vui lòng chọn ngày'
  else if (createForm.date < todayStr) createErrors.date = 'Không thể đăng ký OT cho ngày trong quá khứ'
  if (!createForm.reason.trim()) createErrors.reason = 'Vui lòng nhập lý do'
  if (createForm.start >= createForm.end) createErrors.time = 'Giờ bắt đầu phải trước giờ kết thúc'
  if (Object.values(createErrors).some(Boolean) || !auth.user.value?.id) return

  creating.value = true
  const res = await overtimeStore.createOvertime({
    user_id: auth.user.value.id,
    project_id: Number(createForm.projectId),
    datetime_overtime_from: `${createForm.date} ${createForm.start}`,
    datetime_overtime_to: `${createForm.date} ${createForm.end}`,
    overtime_type: Number(createForm.overtimeType),
    work_at_noon: Number(createForm.workAtNoon),
    reason: createForm.reason,
  })
  creating.value = false
  if (res.ok) {
    show('Đã gửi yêu cầu tăng ca')
    showCreate.value = false
    await refreshAfterAction()
  } else {
    show(res.message || 'Gửi yêu cầu thất bại.', 'error')
  }
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
        <Btn variant="primary" @click="openCreate"><Plus :size="14" />Đăng ký OT</Btn>
      </template>
    </PageHeader>

    <!-- MiniStats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MiniStat label="Chờ duyệt" :value="stats.pending" sublabel="Trong kỳ đang xem" accent="amber" :delay="40" />
      <MiniStat label="Đã duyệt trong kỳ" :value="stats.approvedCount" :sublabel="`${stats.totalHours}h OT`" accent="green" :delay="80" />
      <MiniStat label="OT của tôi (kỳ)" :value="`${stats.myHours}h`" :sublabel="`${stats.myPending} đơn chờ duyệt`" accent="primary" :delay="120" />
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
      <SectionCard :delay="200" :title="`OT tháng ${periodMonth}/${periodYear} — theo ngày`">
        <template #action>
          <div class="flex items-center gap-2">
            <button class="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors" @click="prevMonth"><ChevronLeft :size="13" /></button>
            <span class="text-[11px] font-mono text-muted-foreground">{{ stats.totalHours }}h tổng</span>
            <button class="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors" @click="nextMonth"><ChevronRight :size="13" /></button>
          </div>
        </template>
        <div>
          <div v-if="overtimeStore.periodLoading" class="py-10 text-center text-[12.5px] text-muted-foreground">Đang tải…</div>
          <div v-else class="grid grid-cols-7 gap-1">
            <div
              v-for="d in ['T2','T3','T4','T5','T6','T7','CN']" :key="d"
              class="text-[10px] uppercase font-semibold text-muted-foreground text-center py-1"
            >{{ d }}</div>
            <template v-for="(cell, i) in calendarCells" :key="i">
              <div v-if="cell.blank" />
              <div
                v-else
                :title="(cell.h ?? 0) > 0 ? `${cell.d}/${periodMonth}: ${cell.h}h OT` : `${cell.d}/${periodMonth}`"
                class="aspect-square rounded-md flex items-center justify-center cursor-pointer transition-all hover:scale-[1.05] relative"
                :class="isCurrentRealMonth && cell.d === today.getDate() ? 'ring-1 ring-primary' : ''"
                :style="{ background: otCellBg(cell.h ?? 0, Math.max(0.15, (cell.h ?? 0) / maxOtHours)) }"
              >
                <span
                  class="text-[11px] tabular-nums font-medium"
                  :class="(cell.h ?? 0) > 0 ? 'text-white' : (isCurrentRealMonth && cell.d === today.getDate()) ? 'text-primary font-bold' : 'text-muted-foreground'"
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
        <div v-if="otByProject.length === 0" class="py-8 text-center text-[12.5px] text-muted-foreground">Chưa có dữ liệu trong kỳ này.</div>
        <div v-else class="space-y-3">
          <BarRow
            v-for="entry in otByProject" :key="entry[0]"
            :label="entry[0].length > 22 ? entry[0].slice(0, 20) + '…' : entry[0]"
            :value="entry[1]"
            :max="maxProjectHours"
          />
        </div>
      </SectionCard>

      <!-- Top OT leaderboard -->
      <SectionCard :delay="320" title="Top OT trong kỳ">
        <ul v-if="topOT.length > 0" class="space-y-2.5">
          <li v-for="(entry, i) in topOT" :key="entry[0]" class="flex items-center gap-3 text-[13px]">
            <span class="w-5 text-center text-[11px] font-bold text-muted-foreground tabular-nums">#{{ i + 1 }}</span>
            <Avatar :name="entry[0]" :size="28" />
            <span class="flex-1 font-medium text-foreground truncate">{{ entry[0] }}</span>
            <span class="font-bold tabular-nums font-mono" :class="entry[1] >= 12 ? 'text-amber-600' : 'text-foreground'">{{ entry[1] }}h</span>
            <span v-if="entry[1] >= 16" class="text-[10px] text-amber-600">⚠</span>
          </li>
        </ul>
        <div v-else class="py-8 text-center text-[12.5px] text-muted-foreground">Chưa có dữ liệu trong kỳ này.</div>
      </SectionCard>
    </div>

    <!-- Error banner -->
    <ErrorBanner v-if="activeError" :message="activeError" @retry="fetchActivePage(activePagination.current_page)" />

    <!-- Tab strip + filter + table -->
    <div class="space-y-4">
      <div class="border-b border-border/70">
        <div class="flex gap-7">
          <button
            v-if="isManagerOrGM"
            :data-active="tab === 'manage'"
            class="tab-trigger inline-flex items-center gap-2"
            @click="tab = 'manage'"
          >
            Tất cả yêu cầu
            <span class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums" :class="tab === 'manage' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'">{{ tabCounts.manage }}</span>
          </button>
          <button
            :data-active="tab === 'mine'"
            class="tab-trigger inline-flex items-center gap-2"
            @click="tab = 'mine'"
          >
            Đơn của tôi
            <span class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums" :class="tab === 'mine' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'">{{ tabCounts.mine }}</span>
          </button>
        </div>
      </div>

      <FilterBar>
        <FieldInput v-model="search" placeholder="Tên hoặc tên dự án (trang hiện tại)…" :width="240" />
        <Select v-model="statusF" :options="STATUS_FILTER_OPTS" style="min-width: 160px" />
        <Select v-model="projectF" :options="projectOpts" style="min-width: 170px" />
        <Select v-if="isManagerOrGM" v-model="branchF" :options="branchOpts" style="min-width: 160px" />
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
                <th class="text-center py-3 px-3">Loại</th>
                <th class="text-center py-3 px-3">Trạng thái</th>
                <th class="text-right py-3 px-5">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRow v-if="activeLoading" :cols="7" :rows="5" />
              <tr v-else-if="filtered.length === 0">
                <td colspan="7" class="p-0">
                  <EmptyState :icon="Clock" title="Không có yêu cầu OT" description="Không có yêu cầu OT phù hợp với bộ lọc hiện tại." />
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="r in filtered" :key="r.id"
                  class="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td class="py-3 px-5">
                    <div class="flex items-center gap-3">
                      <Avatar :name="r.full_name" :size="30" />
                      <div>
                        <p class="font-semibold text-foreground">{{ r.full_name }}</p>
                        <p class="text-[11px] text-muted-foreground">{{ r.branch }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-3">
                    <p class="text-foreground/85 text-[12.5px] truncate max-w-[200px]">{{ r.project_name }}</p>
                  </td>
                  <td class="py-3 px-3">
                    <p class="font-mono text-foreground/85">{{ r.date_overtime }}</p>
                    <p class="text-[11.5px] font-mono text-primary">{{ r.time_overtime }}</p>
                  </td>
                  <td class="py-3 px-3 text-center">
                    <span class="font-bold tabular-nums text-foreground">{{ r.working_time }}</span>
                    <span class="text-muted-foreground text-[11px]">h</span>
                  </td>
                  <td class="py-3 px-3 text-center">
                    <span class="text-[11.5px] text-muted-foreground">{{ OT_TYPE_LABEL_VI[r.overtime_type] ?? r.overtime_type }}</span>
                  </td>
                  <td class="py-3 px-3 text-center">
                    <Badge :variant="statusMeta(r.status).variant" dot>{{ statusMeta(r.status).label }}</Badge>
                  </td>
                  <td class="py-3 px-5 text-right">
                    <div v-if="r.status === 'Pending' && isGM" class="inline-flex gap-1.5">
                      <Btn variant="success" size="xs" @click="handleApprove(r)"><Check :size="11" />Duyệt</Btn>
                      <Btn variant="ghost" size="xs" @click="openRejectConfirm(r)">Từ chối</Btn>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="activePagination.total_row > 0"
          :page="activePagination.current_page"
          :total="activePagination.total_row"
          :per-page="activePagination.row_per_page"
          @change="fetchActivePage"
        />
      </div>
    </div>

    <!-- Reject confirm -->
    <Modal v-model:open="rejectConfirmOpen" title="Từ chối yêu cầu OT" :max-width="420">
      <div v-if="openReject" class="px-6 py-4 space-y-3">
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
          <Avatar :name="openReject.full_name" :size="32" />
          <div>
            <p class="font-semibold">{{ openReject.full_name }}</p>
            <p class="text-[12px] text-muted-foreground">{{ openReject.date_overtime }} · {{ openReject.working_time }}h · {{ openReject.project_name }}</p>
          </div>
        </div>
        <p class="text-[13px] text-foreground/85">Bạn có chắc chắn muốn từ chối yêu cầu tăng ca này không?</p>
      </div>
      <template #footer>
        <Btn variant="ghost" size="sm" @click="closeRejectConfirm">Huỷ</Btn>
        <Btn variant="danger" size="sm" @click="confirmReject"><X :size="12" />Xác nhận từ chối</Btn>
      </template>
    </Modal>

    <!-- Create OT modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="showCreate = false" />
        <div class="relative card-surface w-full max-w-lg rise flex flex-col" style="max-height: 92vh; overflow: hidden">
          <div class="p-5 border-b border-border/70 flex items-center justify-between shrink-0">
            <h3 class="font-bold text-[16px] font-heading">Đăng ký tăng ca</h3>
            <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="showCreate = false"><X :size="14" /></button>
          </div>
          <div class="p-5 space-y-4 text-[13px] overflow-y-auto overscroll-contain scrollbar-thin">
            <div>
              <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Dự án <span class="text-red-500">*</span></label>
              <Select v-model="createForm.projectId" :options="projectOpts.filter(o => o.value !== '0')" placeholder="-- Chọn dự án --" style="width: 100%" />
              <p v-if="createErrors.projectId" class="text-[11.5px] text-red-500 mt-1">{{ createErrors.projectId }}</p>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Ngày làm OT</label>
                <DatePicker v-model="createForm.date" :min="todayStr" width="100%" :error="!!createErrors.date" />
              </div>
              <div>
                <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Từ</label>
                <TimePicker v-model="createForm.start" />
              </div>
              <div>
                <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Đến</label>
                <TimePicker v-model="createForm.end" />
              </div>
            </div>
            <p v-if="createErrors.date" class="text-[11.5px] text-red-500 -mt-2">{{ createErrors.date }}</p>
            <p v-if="createErrors.time" class="text-[11.5px] text-red-500 -mt-2">{{ createErrors.time }}</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Hình thức</label>
                <Select v-model="createForm.overtimeType" :options="OT_TYPE_OPTS" style="width: 100%" />
              </div>
              <div>
                <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Buổi trưa</label>
                <Select v-model="createForm.workAtNoon" :options="WORK_AT_NOON_OPTS" style="width: 100%" />
              </div>
            </div>
            <div>
              <label class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Lý do <span class="text-red-500">*</span></label>
              <textarea
                v-model="createForm.reason"
                placeholder="Mô tả công việc cần hoàn thành…"
                rows="3"
                class="w-full px-3 py-2 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60 resize-none"
              />
              <p v-if="createErrors.reason" class="text-[11.5px] text-red-500 mt-1">{{ createErrors.reason }}</p>
            </div>
            <div class="rounded-lg bg-muted/40 p-3 text-[12px] text-muted-foreground">
              <p class="font-semibold text-foreground mb-0.5">Lưu ý:</p>
              <p>OT tháng này của bạn: <span class="font-semibold text-primary">{{ stats.myHours }}h</span> / giới hạn khuyến cáo 20h. Đơn sẽ được gửi đến quản lý để duyệt.</p>
            </div>
          </div>
          <div class="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2 shrink-0">
            <Btn variant="ghost" size="sm" @click="showCreate = false">Huỷ</Btn>
            <Btn variant="primary" size="sm" :disabled="creating" @click="submitCreate"><Check :size="12" />Gửi yêu cầu</Btn>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
