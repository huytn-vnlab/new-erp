<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, X, Search, CalendarCheck } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Avatar from '~/components/base/Avatar.vue'
import Badge from '~/components/base/Badge.vue'
import Select from '~/components/base/Select.vue'
import LeaveGrid from '~/components/leave/LeaveGrid.vue'
import {
  LEAVE_MEMBERS, LEAVE_ENTRIES, LEAVE_TYPES, LEAVE_TYPE_META, LEAVE_STATUS_META,
  LEAVE_INFO_ROWS, LEAVE_HISTORY_ROWS, LEAVE_ADD_TYPES,
  type LeaveEntry, type LeaveInfoRow,
} from '~/mocks/leave'

definePageMeta({ layout: 'admin' })

const tab = ref<'manage' | 'create' | 'info' | 'history'>('manage')
const weekStart = ref('2026-06-02')
const search = ref('')
const fromDate = ref('')
const toDate = ref('')
const page = ref(1)
const PER_PAGE = 8

const entries = ref([...LEAVE_ENTRIES])
const detail = ref<LeaveEntry | null>(null)
const addDaysRow = ref<LeaveInfoRow | null>(null)

const createForm = ref({ member: '', type: 'Nghỉ cả ngày', from: '', to: '', half: false, reason: '' })
const addDaysForm = ref({ type: '', amount: '1', year: '2026', reason: '' })
const addDaysErrors = ref<Record<string, boolean>>({})

const { show } = useToast()

const addDaysHelper = (iso: string, n: number) => {
  const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10)
}
const fmtVN = (iso: string) => {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}
const fmtSlash = (iso: string) => `${iso.slice(0,4)}/${iso.slice(5,7)}/${iso.slice(8,10)}`

const weekEndISO = computed(() => addDaysHelper(weekStart.value, 6))

const stats = computed(() => ({
  pending: entries.value.filter(e => e.status === 'pending').length,
  approved: entries.value.filter(e => e.status === 'approved').length,
  onLeaveThisWeek: new Set(
    entries.value.filter(e => e.from <= weekEndISO.value && e.to >= weekStart.value).map(e => e.memberId)
  ).size,
}))

const filteredMembers = computed(() =>
  LEAVE_MEMBERS.filter(m => !search.value || m.name.toLowerCase().includes(search.value.toLowerCase()))
)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredMembers.value.length / PER_PAGE)))
const pagedMembers = computed(() =>
  filteredMembers.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE)
)

function approve(e: LeaveEntry) {
  entries.value = entries.value.map(x => x.id === e.id ? { ...x, status: 'approved' as const } : x)
  if (detail.value?.id === e.id) detail.value = { ...detail.value, status: 'approved' }
  show('Đã duyệt đơn nghỉ.')
}
function reject(e: LeaveEntry) {
  entries.value = entries.value.map(x => x.id === e.id ? { ...x, status: 'rejected' as const } : x)
  if (detail.value?.id === e.id) detail.value = { ...detail.value, status: 'rejected' }
  show('Đã từ chối đơn nghỉ.', 'error')
}
function submitCreate() {
  if (!createForm.value.member || !createForm.value.from || !createForm.value.to || !createForm.value.reason) return
  show('Đã gửi đơn xin nghỉ.')
  tab.value = 'manage'
  createForm.value = { member: '', type: 'Nghỉ cả ngày', from: '', to: '', half: false, reason: '' }
}
function submitAddDays() {
  addDaysErrors.value = {}
  if (!addDaysForm.value.type) addDaysErrors.value.type = true
  if (!addDaysForm.value.amount || Number(addDaysForm.value.amount) <= 0) addDaysErrors.value.amount = true
  if (!addDaysForm.value.reason.trim()) addDaysErrors.value.reason = true
  if (Object.keys(addDaysErrors.value).length) return
  show('Đã thêm ngày nghỉ.')
  addDaysRow.value = null
  addDaysForm.value = { type: '', amount: '1', year: '2026', reason: '' }
}

const TABS = [
  { k: 'manage',  l: 'Quản lí xin nghỉ' },
  { k: 'create',  l: 'Tạo xin nghỉ' },
  { k: 'info',    l: 'Thông tin nghỉ phép' },
  { k: 'history', l: 'Lịch sử thêm ngày phép' },
] as const

const memberOpts = LEAVE_MEMBERS.map(m => ({ value: m.name, label: m.name }))
const typeOpts = LEAVE_TYPES.map(t => ({ value: t, label: t }))
const addTypeOpts = LEAVE_ADD_TYPES.map(t => ({ value: t, label: t }))
const yearOpts = ['2025', '2026', '2027'].map(y => ({ value: y, label: y }))

const infoSearch = ref('')
const infoBranch = ref('all')
const infoBranchOpts = [{ value: 'all', label: 'Tất cả' }, ...['Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh', 'Osaka'].map(b => ({ value: b, label: b }))]
const filteredInfo = computed(() =>
  LEAVE_INFO_ROWS.filter(r =>
    (!infoSearch.value || r.name.toLowerCase().includes(infoSearch.value.toLowerCase())) &&
    (infoBranch.value === 'all' || r.branch === infoBranch.value)
  )
)

const detailMember = computed(() => LEAVE_MEMBERS.find(m => m.id === detail.value?.memberId))
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      eyebrow="HRM · Nghỉ phép"
      title="Quản lý nghỉ phép"
      description="Lịch nghỉ phép theo tuần của toàn bộ nhân viên. Chọn ô để xem chi tiết và duyệt đơn."
    >
      <template #actions>
        <Btn variant="primary" @click="tab = 'create'"><Plus :size="14" /> Tạo xin nghỉ</Btn>
      </template>
    </PageHeader>

    <!-- Sub-tabs pill style -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="t in TABS" :key="t.k"
        :class="['h-10 px-5 rounded-lg text-[13.5px] font-semibold transition-all', tab === t.k ? 'text-white shadow-sm' : 'border border-border text-foreground/70 hover:text-foreground hover:border-primary/40 bg-card']"
        :style="tab === t.k ? { background: 'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 60%),hsl(var(--primary-h) var(--primary-s) 44%))' } : {}"
        @click="tab = t.k as typeof tab"
      >{{ t.l }}</button>
    </div>

    <!-- MANAGE -->
    <template v-if="tab === 'manage'">
      <div class="card-surface p-4">
        <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Tìm kiếm tên</label>
            <div class="relative">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input v-model="search" placeholder="Tìm kiếm…" class="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60 placeholder:text-muted-foreground/50" @input="page = 1">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Từ ngày</label>
            <input v-model="fromDate" type="date" class="w-full h-10 px-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60">
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Đến ngày</label>
            <input v-model="toDate" type="date" class="w-full h-10 px-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60">
          </div>
          <Btn variant="primary" @click="() => { if (fromDate) weekStart = fromDate; show('Đã áp dụng bộ lọc.') }">
            <Search :size="13" /> Tìm kiếm
          </Btn>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Chờ duyệt" :value="stats.pending" sublabel="Cần xử lý" accent="amber" :delay="40" />
        <MiniStat label="Đã duyệt" :value="stats.approved" sublabel="Trong hệ thống" accent="green" :delay="80" />
        <MiniStat label="Nghỉ trong tuần" :value="stats.onLeaveThisWeek" :sublabel="`${fmtVN(weekStart)} – ${fmtVN(addDaysHelper(weekStart,6))}`" accent="primary" :delay="120" />
        <MiniStat label="Tổng nhân viên" :value="LEAVE_MEMBERS.length" sublabel="Đang theo dõi" accent="violet" :delay="160" />
      </div>

      <div class="card-surface overflow-hidden rise" style="animation-delay: 200ms">
        <div class="flex items-center justify-between px-5 py-3 border-b border-border/70 bg-muted/20">
          <div class="flex items-center gap-2">
            <button class="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors" @click="weekStart = addDaysHelper(weekStart, -7)">
              <X :size="13" class="rotate-90" />
            </button>
            <span class="text-[13px] font-semibold font-mono tabular-nums px-2">{{ fmtSlash(weekStart) }} – {{ fmtSlash(addDaysHelper(weekStart, 6)) }}</span>
            <button class="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors" @click="weekStart = addDaysHelper(weekStart, 7)">
              <X :size="13" class="-rotate-90" />
            </button>
            <button class="h-8 px-3 rounded-lg border border-border bg-card text-[12px] font-medium text-foreground/70 hover:text-primary hover:border-primary/50 transition-colors ml-1" @click="weekStart = '2026-06-02'">Tuần này</button>
          </div>
          <div class="hidden lg:flex items-center gap-3.5 text-[11.5px] text-muted-foreground flex-wrap">
            <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded" style="background: hsl(var(--primary))" />Nghỉ cả ngày</span>
            <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded" style="background: hsl(199 89% 48%)" />Nửa ngày</span>
            <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded" style="background: hsl(160 60% 45%)" />Làm ở nhà</span>
            <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded" style="background: hsl(231 60% 55%)" />Công tác</span>
          </div>
        </div>

        <LeaveGrid :members="pagedMembers" :entries="entries" :week-start="weekStart" @select="detail = $event" />

        <div class="flex items-center justify-between gap-4 flex-wrap px-5 py-3 border-t border-border/70 bg-muted/10">
          <span class="text-[12px] text-muted-foreground font-mono tabular-nums">{{ fmtSlash(weekStart) }} – {{ fmtSlash(addDaysHelper(weekStart, 6)) }}</span>
          <div class="flex items-center gap-2 text-[12px] text-muted-foreground">
            <span>Trang {{ page }}/{{ totalPages }}</span>
            <div class="flex items-center gap-1">
              <button :disabled="page <= 1" class="h-7 w-7 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground disabled:opacity-40 hover:text-primary hover:border-primary/50 transition-colors" @click="page--">
                <X :size="11" class="rotate-90" />
              </button>
              <button v-for="p in totalPages" :key="p"
                :class="['h-7 min-w-7 px-2 rounded-md text-[12px] font-medium transition-colors', p === page ? 'text-white' : 'border border-border bg-card text-foreground/70 hover:border-primary/50']"
                :style="p === page ? { background: 'hsl(var(--primary))' } : {}"
                @click="page = p"
              >{{ p }}</button>
              <button :disabled="page >= totalPages" class="h-7 w-7 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground disabled:opacity-40 hover:text-primary hover:border-primary/50 transition-colors" @click="page++">
                <X :size="11" class="-rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- CREATE -->
    <template v-if="tab === 'create'">
      <div class="card-surface p-6 max-w-[640px] rise">
        <h3 class="font-heading font-bold text-[17px] text-foreground mb-5">Tạo đơn xin nghỉ</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Nhân viên <span class="text-red-400">*</span></label>
            <Select v-model="createForm.member" :options="memberOpts" placeholder="— Chọn nhân viên —" style="width: 100%" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Loại nghỉ phép <span class="text-red-400">*</span></label>
            <Select v-model="createForm.type" :options="typeOpts" style="width: 100%" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Từ ngày <span class="text-red-400">*</span></label>
              <input v-model="createForm.from" type="date" class="w-full h-10 px-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60">
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Đến ngày <span class="text-red-400">*</span></label>
              <input v-model="createForm.to" type="date" class="w-full h-10 px-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60">
            </div>
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer select-none">
            <input v-model="createForm.half" type="checkbox" class="h-4 w-4 rounded accent-primary cursor-pointer">
            <span class="text-[13px] text-foreground/85">Nghỉ nửa ngày</span>
          </label>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Lý do <span class="text-red-400">*</span></label>
            <textarea v-model="createForm.reason" rows="3" placeholder="Nhập lý do xin nghỉ…" class="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60 resize-none placeholder:text-muted-foreground/50" />
          </div>
          <div class="pt-2 flex items-center justify-end gap-2">
            <Btn variant="outline" @click="tab = 'manage'">Huỷ</Btn>
            <Btn variant="primary" @click="submitCreate">Gửi đơn</Btn>
          </div>
        </div>
      </div>
    </template>

    <!-- INFO -->
    <template v-if="tab === 'info'">
      <div class="space-y-4 rise">
        <div class="card-surface p-4">
          <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Tìm kiếm tên</label>
              <div class="relative">
                <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input v-model="infoSearch" placeholder="Tìm kiếm…" class="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60 placeholder:text-muted-foreground/50">
              </div>
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Chi nhánh</label>
              <Select v-model="infoBranch" :options="infoBranchOpts" style="width: 100%" />
            </div>
            <Btn variant="outline">Tải lên</Btn>
          </div>
        </div>

        <div class="card-surface overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-[13px]" style="min-width: 880px">
              <thead>
                <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold">
                  <th rowspan="2" class="text-left py-3 px-5 border-b border-border/40 align-middle">Tên</th>
                  <th rowspan="2" class="text-left py-3 px-3 border-b border-border/40 align-middle">Email</th>
                  <th rowspan="2" class="text-left py-3 px-3 border-b border-border/40 align-middle">Chi nhánh</th>
                  <th rowspan="2" class="text-center py-3 px-3 border-b border-border/40 align-middle">Đã dùng</th>
                  <th colspan="2" class="text-center py-2 px-3 border-b border-l border-border/40">Còn lại</th>
                  <th rowspan="2" class="text-center py-3 px-5 border-b border-border/40 align-middle w-56">Hành động</th>
                </tr>
                <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold">
                  <th class="text-center py-2 px-3 border-b border-l border-border/40">Năm nay</th>
                  <th class="text-center py-2 px-3 border-b border-border/40">Năm trước</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in filteredInfo" :key="r.name" class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td class="py-3 px-5"><div class="flex items-center gap-2.5"><Avatar :name="r.name" :size="30" /><span class="font-medium">{{ r.name }}</span></div></td>
                  <td class="py-3 px-3 font-mono text-[12px] text-muted-foreground">{{ r.email }}</td>
                  <td class="py-3 px-3 text-foreground/85">{{ r.branch }}</td>
                  <td class="py-3 px-3 text-center tabular-nums text-amber-600 font-semibold">{{ r.used.toFixed(2) }}</td>
                  <td class="py-3 px-3 text-center tabular-nums font-bold text-emerald-600 border-l border-border/40">{{ r.curr.toFixed(2) }}</td>
                  <td class="py-3 px-3 text-center tabular-nums text-muted-foreground">{{ r.prev.toFixed(2) }}</td>
                  <td class="py-3 px-5">
                    <div class="flex items-center justify-end gap-1.5">
                      <Btn variant="outline" size="xs" @click="() => { addDaysRow = r; addDaysForm = { type: '', amount: '1', year: '2026', reason: '' } }">
                        <Plus :size="11" /> Thêm ngày nghỉ
                      </Btn>
                      <Btn variant="primary" size="xs" @click="tab = 'create'">Tạo xin nghỉ</Btn>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredInfo.length === 0">
                  <td colspan="7" class="py-14 text-center text-muted-foreground">
                    <CalendarCheck :size="36" class="mx-auto mb-2 opacity-30" />Không tìm thấy bản ghi
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="px-5 py-3 border-t border-border/70 bg-muted/10 text-[12.5px] text-muted-foreground">
            Tổng bản ghi: <span class="font-semibold text-foreground">{{ filteredInfo.length }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- HISTORY -->
    <template v-if="tab === 'history'">
      <div class="card-surface overflow-hidden rise">
        <table class="w-full text-[13px]">
          <thead>
            <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
              <th class="text-left py-3 px-5">Ngày</th>
              <th class="text-left py-3 px-3">Nhân viên</th>
              <th class="text-center py-3 px-3">Số ngày</th>
              <th class="text-left py-3 px-3">Lý do</th>
              <th class="text-left py-3 px-5">Người thực hiện</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in LEAVE_HISTORY_ROWS" :key="i" class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
              <td class="py-3 px-5 font-mono text-muted-foreground">{{ r.date }}</td>
              <td class="py-3 px-3"><div class="flex items-center gap-2.5"><Avatar :name="r.name" :size="28" /><span class="font-medium">{{ r.name }}</span></div></td>
              <td class="py-3 px-3 text-center"><span :class="['font-bold tabular-nums', r.amount.startsWith('-') ? 'text-red-500' : 'text-emerald-600']">{{ r.amount }}</span></td>
              <td class="py-3 px-3 text-foreground/85">{{ r.reason }}</td>
              <td class="py-3 px-5 text-muted-foreground">{{ r.by }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- DETAIL DRAWER -->
    <Teleport to="body">
      <div v-if="detail" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="detail = null" />
        <div class="relative bg-background border-l border-border w-full max-w-md h-full flex flex-col rise" style="animation-duration:.3s">
          <div class="p-5 border-b border-border/70 flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <Avatar :name="detailMember?.name ?? '?'" :size="42" />
              <div>
                <p class="font-bold text-[16px] text-foreground">{{ detailMember?.name }}</p>
                <p class="text-[12px] text-muted-foreground">{{ detailMember?.branch }}</p>
              </div>
            </div>
            <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="detail = null"><X :size="15" /></button>
          </div>
          <div class="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
            <div class="flex items-center gap-2 flex-wrap">
              <Badge :variant="LEAVE_TYPE_META[detail.type].variant">{{ detail.type }}{{ detail.half ? ' (nửa ngày)' : '' }}</Badge>
              <Badge :variant="LEAVE_STATUS_META[detail.status].variant" dot>{{ LEAVE_STATUS_META[detail.status].label }}</Badge>
            </div>
            <div class="card-surface p-4 grid grid-cols-2 gap-4">
              <div><p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Từ ngày</p><p class="text-[14px] font-mono">{{ fmtVN(detail.from) }}</p></div>
              <div><p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Đến ngày</p><p class="text-[14px] font-mono">{{ fmtVN(detail.to) }}</p></div>
              <div>
                <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Số ngày</p>
                <p class="text-[14px] font-bold tabular-nums">{{ (Math.round((new Date(detail.to).getTime() - new Date(detail.from).getTime()) / 86400000) + 1 - (detail.half ? 0.5 : 0)) }} ngày</p>
              </div>
            </div>
            <div>
              <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Lý do</p>
              <p class="text-[13.5px] text-foreground/85 leading-relaxed">{{ detail.reason }}</p>
            </div>
          </div>
          <div v-if="detail.status === 'pending'" class="p-4 border-t border-border/70 flex items-center gap-2">
            <Btn variant="ghost" size="sm" @click="reject(detail)">Từ chối</Btn>
            <div class="flex-1" />
            <Btn variant="success" size="sm" @click="approve(detail)">Duyệt đơn</Btn>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ADD DAYS MODAL -->
    <Teleport to="body">
      <div v-if="addDaysRow" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/45 backdrop-blur-[4px]" @click="addDaysRow = null" />
        <div class="relative card-surface rise w-full max-w-[720px] overflow-hidden" style="border-radius:20px;animation-duration:0.2s">
          <div class="flex items-center justify-between px-6 py-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 65%),hsl(var(--primary-h) var(--primary-s) 45%))">
                <Plus :size="15" class="text-white" />
              </div>
              <div>
                <h3 class="font-heading font-bold text-[15px] text-foreground">Thêm ngày nghỉ</h3>
                <p class="text-[11.5px] text-muted-foreground">Cấp / điều chỉnh quỹ phép cho nhân viên</p>
              </div>
            </div>
            <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="addDaysRow = null"><X :size="14" /></button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-[230px_1fr]">
            <div class="p-6 border-b md:border-b-0 md:border-r border-border/70 bg-muted/20">
              <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary mb-4">Thông tin thành viên</p>
              <div class="flex flex-col items-center text-center">
                <Avatar :name="addDaysRow.name" :size="64" />
                <p class="font-semibold text-[14px] text-foreground mt-3">{{ addDaysRow.name }}</p>
                <p class="text-[11.5px] text-muted-foreground font-mono break-all mt-0.5">{{ addDaysRow.email }}</p>
              </div>
              <div class="mt-5 pt-4 border-t border-border/60 space-y-3">
                <div><p class="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground">Đã dùng</p><p class="text-[18px] font-bold font-heading tabular-nums mt-0.5">{{ addDaysRow.used.toFixed(2) }}</p></div>
                <div><p class="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground">Còn lại</p><p class="text-[18px] font-bold font-heading tabular-nums mt-0.5" style="color:hsl(var(--primary))">{{ (addDaysRow.curr + addDaysRow.prev).toFixed(2) }}</p></div>
              </div>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Loại phép <span class="text-red-400">*</span></label>
                <Select v-model="addDaysForm.type" :options="addTypeOpts" placeholder="— Chọn loại phép —" :class="addDaysErrors.type ? 'ring-1 ring-red-400 rounded-md' : ''" style="width:100%" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Số ngày <span class="text-red-400">*</span></label>
                  <input v-model="addDaysForm.amount" type="number" step="0.5" min="0"
                    :class="['w-full h-9 px-3 rounded-lg border bg-card text-[13px] outline-none', addDaysErrors.amount ? 'border-red-400' : 'border-border focus:border-primary/60']">
                </div>
                <div>
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Năm <span class="text-red-400">*</span></label>
                  <Select v-model="addDaysForm.year" :options="yearOpts" style="width:100%" />
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Lý do <span class="text-red-400">*</span></label>
                <textarea v-model="addDaysForm.reason" rows="4" placeholder="VD: Thưởng phép dự án, bù ngày lễ…"
                  :class="['w-full px-3 py-2 rounded-lg border bg-card text-[13px] outline-none resize-none placeholder:text-muted-foreground/45', addDaysErrors.reason ? 'border-red-400' : 'border-border focus:border-primary/60']" />
              </div>
              <div class="flex items-center justify-end gap-2 pt-1">
                <Btn variant="outline" size="sm" @click="addDaysRow = null">Hủy</Btn>
                <Btn variant="primary" size="sm" @click="submitAddDays"><Plus :size="13" /> Thêm</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
