<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Plus, X, Search, CalendarCheck, FileX, ChevronRight } from 'lucide-vue-next'
import LeaveGrid from '~/components/leave/LeaveGrid.vue'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Avatar from '~/components/base/Avatar.vue'
import Badge from '~/components/base/Badge.vue'
import Select from '~/components/base/Select.vue'
import Tabs from '~/components/base/Tabs.vue'
import Pagination from '~/components/base/Pagination.vue'
import DatePicker from '~/components/base/DatePicker.vue'
import TimePicker from '~/components/base/TimePicker.vue'
import SkeletonRow from '~/components/base/SkeletonRow.vue'
import EmptyState from '~/components/base/EmptyState.vue'
import ErrorBanner from '~/components/base/ErrorBanner.vue'
import { useLeaveStore } from '~/stores/leave'
import type { LeaveRequest } from '~/types'
import { formatDateDisplay } from '~/utils/date'
import { LEAVE_TYPE_ID_MAP, BONUS_TYPE_ID_MAP, LEAVE_STATUS_META } from '~/mocks/leave'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { t, locale } = useI18n()
const leaveStore = useLeaveStore()
const auth = useAuth()
// /leave/update-leave-request-status and /leave/create-leave-bonus are both
// CheckAllManager-gated server-side — a regular employee who saw these
// buttons would click through to a silent "Only managers can do this." toast.
const isManager = computed(() => {
  const role = auth.user.value?.role_name?.toLowerCase() ?? ''
  return role === 'manager' || role === 'general manager'
})

type LeaveStatus = 'pending' | 'approved' | 'rejected'
type LeaveEntry = {
  id: number; memberId: number; name: string; branch: string
  type: string; from: string; to: string
  status: LeaveStatus; reason: string; half: boolean
}
type LeaveMember = { id: number; name: string; branch: string }
type GridEntry = { id: number; memberId: number; type: number; from: string; to: string; status: LeaveStatus; reason: string; half: boolean }

// status_req is nullable in the DB and InsertLeaveRequest never explicitly
// sets a default, so newly created requests commonly come back as 0 (not 1)
// despite the API's own docs claiming "1=pending" — map both to pending.
const LEAVE_STATUS_NUM_MAP: Record<number, LeaveStatus> = { 0: 'pending', 1: 'pending', 2: 'approved', 3: 'rejected' }

const toISO = (s?: string) => s?.slice(0, 10)?.replace(/\//g, '-') ?? ''

function mapLeaveRequest(r: LeaveRequest): LeaveEntry {
  return {
    id: r.id, memberId: r.user_id,
    name: r.full_name ?? '',
    branch: r.branch ?? '',
    type: t(LEAVE_TYPE_ID_MAP[r.leave_request_type_id ?? 1] ?? ''),
    from: toISO(r.datetime_leave_from),
    to: toISO(r.datetime_leave_to),
    status: LEAVE_STATUS_NUM_MAP[r.status] ?? 'pending',
    reason: r.reason ?? '', half: false,
  }
}

const tab = ref('manage')
const mondayOf = (iso: string) => { const d = new Date(iso); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d.toISOString().slice(0, 10) }
const weekStart = ref(mondayOf(new Date().toISOString().slice(0, 10)))
const search = ref('')
const fromDate = ref('')
const toDate = ref('')
const page = ref(1)
const PER_PAGE = 8

const entries = computed(() => leaveStore.requests.map(mapLeaveRequest))
const detail = ref<LeaveEntry | null>(null)

type InfoRow = { userId: number; name: string; email: string; branch: string; used: number; curr: number; prev: number; active: boolean }
const addDaysRow = ref<InfoRow | null>(null)

const createForm = ref({ type: '', from: '', to: '', fromH: '', fromM: '00', toH: '', toM: '00', reason: '', subtractType: 1, emailTitle: '', emailContent: '' })
const createErrors = ref<Record<string, string | boolean>>({})
const addDaysForm = ref({ type: '', amount: '1', year: '2026', reason: '' })
const addDaysErrors = ref<Record<string, boolean>>({})

const { show } = useToast()
const { user } = useAuth()

const addDaysHelper = (iso: string, n: number) => {
  const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10)
}
const fmtSlash = formatDateDisplay

const weekEndISO = computed(() => addDaysHelper(weekStart.value, 6))

function fetchWeekRequests() {
  leaveStore.fetchLeaveRequests({
    datetime_leave_from: weekStart.value,
    datetime_leave_to: weekEndISO.value,
    row_per_page: 500,
  })
}

onMounted(() => {
  leaveStore.fetchLeaveInfo()
  fetchWeekRequests()
  leaveStore.fetchLeaveInfoAll()
})

watch(tab, (t) => { if (t === 'history') fetchHistory(1) })

watch(weekStart, fetchWeekRequests)

const stats = computed(() => ({
  pending: entries.value.filter(e => e.status === 'pending').length,
  approved: entries.value.filter(e => e.status === 'approved').length,
  onLeaveThisWeek: new Set(
    entries.value.filter(e => e.from <= weekEndISO.value && e.to >= weekStart.value).map(e => e.memberId)
  ).size,
}))

const gridEntries = computed<GridEntry[]>(() =>
  leaveStore.requests.map(r => ({
    id: r.id,
    memberId: r.user_id,
    type: r.leave_request_type_id ?? 9,
    from: toISO(r.datetime_leave_from),
    to: toISO(r.datetime_leave_to),
    status: (LEAVE_STATUS_NUM_MAP[r.status] ?? 'pending') as GridEntry['status'],
    reason: r.reason ?? '',
    half: false,
  }))
)
const gridMembers = computed<LeaveMember[]>(() =>
  leaveStore.allUsersLeaveInfo.map(u => ({ id: u.user_id, name: u.full_name, branch: u.branch_name }))
)
const filteredGridMembers = computed(() =>
  gridMembers.value.filter(m => !search.value || m.name.toLowerCase().includes(search.value.toLowerCase()))
)
const gridTotalPages = computed(() => Math.max(1, Math.ceil(filteredGridMembers.value.length / PER_PAGE)))
const pagedGridMembers = computed(() =>
  filteredGridMembers.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE)
)
function onGridSelect(gridEntry: GridEntry) {
  const member = gridMembers.value.find(m => m.id === gridEntry.memberId)
  detail.value = {
    id: gridEntry.id,
    memberId: gridEntry.memberId,
    name: member?.name ?? '',
    branch: member?.branch ?? '',
    type: t(LEAVE_TYPE_ID_MAP[gridEntry.type] ?? ''),
    from: gridEntry.from,
    to: gridEntry.to,
    status: gridEntry.status,
    reason: gridEntry.reason,
    half: gridEntry.half,
  }
}

async function approve(e: LeaveEntry) {
  const result = await leaveStore.updateStatus(e.id, 2)
  show(result.ok ? t('hrm.leave.manage.approveMsg') : result.message, result.ok ? 'success' : 'error')
  if (result.ok) { detail.value = null; fetchWeekRequests() }
}
async function reject(e: LeaveEntry) {
  const result = await leaveStore.updateStatus(e.id, 3)
  show(result.ok ? t('hrm.leave.manage.rejectMsg') : result.message, result.ok ? 'success' : 'error')
  if (result.ok) { detail.value = null; fetchWeekRequests() }
}
const createTypeId = computed(() => Number(createForm.value.type))
const createShowDateTo = computed(() => [1, 7, 8, 9].includes(createTypeId.value))
const createShowTime = computed(() => [4, 5, 6].includes(createTypeId.value))
// Show subtract radio for all types except 7/8/9 (no leave balance check needed)
const createShowSubtract = computed(() => [1, 2, 3, 4, 5, 6].includes(createTypeId.value))

function takeDurationLeave(): string {
  const from = createForm.value.from
  if (!from) return ''
  const fromStr = fmtSlash(from)
  if ([4, 5, 6].includes(createTypeId.value)) {
    let str = fromStr
    const fH = createForm.value.fromH
    const fM = createForm.value.fromM || '00'
    const tH = createForm.value.toH
    const tM = createForm.value.toM || '00'
    if (fH) str += ` ${fH.padStart(2, '0')}:${fM}`
    if (tH) str += ` - ${tH.padStart(2, '0')}:${tM}`
    return str
  }
  const to = createShowDateTo.value ? createForm.value.to : ''
  if (to && to !== from) return `${fromStr} - ${fmtSlash(to)}`
  return fromStr
}

function autoEmailTitle() {
  const typeKey = LEAVE_TYPE_ID_MAP[createTypeId.value]
  if (!typeKey) return ''
  const typeName = t(typeKey)
  const duration = takeDurationLeave()
  const fullName = user.value?.name ?? ''
  let title = `【${t('hrm.leave.email.important')}】【${typeName}`
  if (createForm.value.subtractType !== 1) title += ` (${t('hrm.leave.email.salaryDeduction')})`
  title += `】【${duration}】【${fullName}】`
  return title
}

function autoEmailContent() {
  const typeKey = LEAVE_TYPE_ID_MAP[createTypeId.value]
  if (!typeKey) return ''
  const typeName = t(typeKey)
  const duration = takeDurationLeave()
  const fullName = user.value?.name ?? ''
  const reason = createForm.value.reason.trim()
  const detail = `【${typeName}】【${duration}】`
  let content = t('hrm.leave.email.greeting') + '\n'
  content += t('hrm.leave.email.imUser', { name: fullName }) + '\n'
  content += t('hrm.leave.email.reasonSoITake', { reason, detail })
  return content
}

function onLeaveTypeChange() {
  createForm.value.from = ''
  createForm.value.to = ''
  createForm.value.fromH = ''
  createForm.value.fromM = '00'
  createForm.value.toH = ''
  createForm.value.toM = '00'
  createForm.value.subtractType = 1
  createErrors.value = {}
  createForm.value.emailTitle = autoEmailTitle()
  createForm.value.emailContent = autoEmailContent()
}

watch(() => [createForm.value.from, createForm.value.to, createForm.value.subtractType, createForm.value.fromH, createForm.value.fromM, createForm.value.toH, createForm.value.toM, locale.value], () => {
  if (!createForm.value.type) return
  createForm.value.emailTitle = autoEmailTitle()
  createForm.value.emailContent = autoEmailContent()
})

watch(() => [createForm.value.reason, locale.value], () => {
  if (!createForm.value.type) return
  createForm.value.emailContent = autoEmailContent()
})

function buildDateTime(date: string, h: string, m: string): string {
  if (!date) return ''
  if (h !== '') return `${date} ${h.padStart(2, '0')}:${m || '00'}`
  return `${date} 08:00`
}

async function submitCreate() {
  createErrors.value = {}
  if (!createForm.value.type) { createErrors.value.type = true; return }
  if (!createForm.value.from) createErrors.value.from = true
  if (!createForm.value.reason.trim()) createErrors.value.reason = true
  if (createShowTime.value) {
    if (!createForm.value.fromH || !createForm.value.toH) {
      createErrors.value.time = t('hrm.leave.create.timeRequired')
    } else {
      const fromMins = Number(createForm.value.fromH) * 60 + Number(createForm.value.fromM)
      const toMins = Number(createForm.value.toH) * 60 + Number(createForm.value.toM)
      if (fromMins >= toMins) createErrors.value.time = t('hrm.leave.create.timeOrderInvalid')
    }
  }
  if (Object.keys(createErrors.value).length) return
  const from = createForm.value.from
  const to = createShowDateTo.value ? (createForm.value.to || from) : from
  const datetimeFrom = buildDateTime(from, createShowTime.value ? createForm.value.fromH : '', createForm.value.fromM)
  const datetimeTo = buildDateTime(to, createShowTime.value ? createForm.value.toH : '', createForm.value.toM)
  const result = await leaveStore.createLeave({
    leave_request_type: createForm.value.type,
    datetime_leave_from: datetimeFrom,
    datetime_leave_to: datetimeTo,
    reason: createForm.value.reason,
    email_title: createForm.value.emailTitle || autoEmailTitle(),
    email_content: createForm.value.emailContent || autoEmailContent(),
    subtract_day_off_type_id: createForm.value.subtractType,
  })
  show(result.ok ? t('hrm.leave.create.submitSuccess') : result.message, result.ok ? 'success' : 'error')
  if (result.ok) {
    tab.value = 'manage'
    createForm.value = { type: '', from: '', to: '', fromH: '', fromM: '00', toH: '', toM: '00', reason: '', subtractType: 1, emailTitle: '', emailContent: '' }
    fetchWeekRequests()
  }
}
async function submitAddDays() {
  addDaysErrors.value = {}
  if (!addDaysForm.value.type) addDaysErrors.value.type = true
  if (!addDaysForm.value.amount || Number(addDaysForm.value.amount) <= 0) addDaysErrors.value.amount = true
  if (!addDaysForm.value.reason.trim()) addDaysErrors.value.reason = true
  if (Object.keys(addDaysErrors.value).length) return

  const result = await leaveStore.addLeaveBonus({
    user_id: addDaysRow.value?.userId ?? 0,
    leave_bonus_type_id: Number(addDaysForm.value.type),
    hour: Number(addDaysForm.value.amount),
    year_belong: Number(addDaysForm.value.year),
    reason: addDaysForm.value.reason,
  })
  show(result.message || (result.ok ? t('hrm.leave.history.addSuccess') : t('hrm.leave.history.addFail')), result.ok ? 'success' : 'error')
  if (result.ok) {
    addDaysRow.value = null
    addDaysForm.value = { type: '', amount: '1', year: '2026', reason: '' }
    fetchHistory(1)
  }
}

const tabItems = computed(() => [
  { value: 'manage',  label: t('hrm.leave.tabs.manage') },
  { value: 'create',  label: t('hrm.leave.tabs.create') },
  { value: 'info',    label: t('hrm.leave.tabs.info') },
  { value: 'history', label: t('hrm.leave.tabs.history') },
])

const typeOpts = computed(() =>
  Object.keys(leaveStore.leaveInfo?.leave_request_types ?? {}).map(k => ({
    value: k,
    label: LEAVE_TYPE_ID_MAP[Number(k)] ? t(LEAVE_TYPE_ID_MAP[Number(k)]!) : (leaveStore.leaveInfo!.leave_request_types![k] ?? k),
  }))
)
const addTypeOpts = computed(() =>
  Object.keys(leaveStore.leaveInfo?.leave_bonus_types ?? {}).map(k => ({
    value: k,
    label: BONUS_TYPE_ID_MAP[Number(k)] ? t(BONUS_TYPE_ID_MAP[Number(k)]!) : (leaveStore.leaveInfo!.leave_bonus_types![k] ?? k),
  }))
)
const yearOpts = ['2025', '2026', '2027'].map(y => ({ value: y, label: y }))

const infoSearch = ref('')
const infoBranch = ref('all')
const infoPage = ref(1)
const INFO_PER_PAGE = 20

const infoBranchOpts = computed(() => {
  const branches = [...new Set(leaveStore.allUsersLeaveInfo.map(r => r.branch_name).filter(Boolean))]
  return [{ value: 'all', label: t('common.all') }, ...branches.map(b => ({ value: b, label: b }))]
})

const filteredInfo = computed(() => {
  infoPage.value = 1
  return leaveStore.allUsersLeaveInfo
    .filter(r =>
      (!infoSearch.value || r.full_name.toLowerCase().includes(infoSearch.value.toLowerCase())) &&
      (infoBranch.value === 'all' || r.branch_name === infoBranch.value)
    )
    .map(r => ({
      userId: r.user_id, name: r.full_name, email: r.email, branch: r.branch_name,
      used: r.day_used, curr: r.day_remaining, prev: r.day_remaining_previous,
      active: r.status === 1,
    }))
})

const paginatedInfo = computed(() =>
  filteredInfo.value.slice((infoPage.value - 1) * INFO_PER_PAGE, infoPage.value * INFO_PER_PAGE)
)

const detailMember = computed(() => detail.value ? { name: detail.value.name, branch: detail.value.branch } : null)

const historySearch = ref('')
const historyYear = ref(0)
const historyType = ref(0)
const CUR_YEAR = new Date().getFullYear()
const historyYearOpts = computed(() => [
  { value: 0, label: t('common.all') },
  ...Array.from({ length: 4 }, (_, i) => CUR_YEAR - i).map(y => ({ value: y, label: String(y) })),
])
const historyTypeOpts = computed(() => {
  const types = leaveStore.leaveInfo?.leave_bonus_types ?? {}
  return [{ value: 0, label: t('common.all') }, ...Object.entries(types).map(([k, v]) => ({ value: Number(k), label: BONUS_TYPE_ID_MAP[Number(k)] ? t(BONUS_TYPE_ID_MAP[Number(k)]!) : (v as string) }))]
})

function fetchHistory(page = 1) {
  leaveStore.fetchBonuses({
    current_page: page,
    full_name: historySearch.value,
    leave_bonus_type_id: historyType.value,
    year: historyYear.value,
  })
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="t('hrm.leave.pageEyebrow')"
      :title="t('hrm.leave.pageTitle')"
      :description="t('hrm.leave.pageDescription')"
    >
      <template #actions>
        <Btn variant="primary" @click="tab = 'create'"><Plus :size="14" /> {{ t('hrm.leave.createBtn') }}</Btn>
      </template>
    </PageHeader>

    <Tabs v-model="tab" :items="tabItems" />

    <!-- MANAGE -->
    <template v-if="tab === 'manage'">
      <div class="card-surface p-4">
        <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.manage.searchName') }}</label>
            <div class="relative">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input v-model="search" :placeholder="t('hrm.leave.manage.searchNamePh')" class="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60 placeholder:text-muted-foreground/50" @input="page = 1">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('common.from') }}</label>
            <DatePicker v-model="fromDate" width="100%" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('common.to') }}</label>
            <DatePicker v-model="toDate" width="100%" />
          </div>
          <Btn variant="primary" @click="() => { if (fromDate) weekStart = fromDate; show(t('hrm.leave.manage.filterApplied')) }">
            <Search :size="13" /> {{ t('hrm.leave.manage.search') }}
          </Btn>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat :label="t('hrm.leave.manage.stats.pending')" :value="stats.pending" :sublabel="t('hrm.leave.manage.stats.pendingSub')" accent="amber" :delay="40" />
        <MiniStat :label="t('hrm.leave.manage.stats.approved')" :value="stats.approved" :sublabel="t('hrm.leave.manage.stats.inSystem')" accent="green" :delay="80" />
        <MiniStat :label="t('hrm.leave.manage.stats.onLeaveThisWeek')" :value="stats.onLeaveThisWeek" :sublabel="`${fmtSlash(weekStart)} – ${fmtSlash(addDaysHelper(weekStart,6))}`" accent="primary" :delay="120" />
        <MiniStat :label="t('hrm.leave.manage.stats.total')" :value="leaveStore.pagination.total_row" :sublabel="t('hrm.leave.manage.stats.inSystem')" accent="violet" :delay="160" />
      </div>

      <div class="card-surface overflow-hidden rise" style="animation-delay: 200ms">
        <ErrorBanner
          v-if="leaveStore.error"
          :message="leaveStore.error"
          @retry="leaveStore.fetchLeaveRequests()"
        />
        <template v-if="!leaveStore.error">
          <!-- Week navigation -->
          <div class="flex items-center justify-between px-5 py-3 border-b border-border/70 bg-muted/20">
            <div class="flex items-center gap-2">
              <button class="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors" @click="weekStart = addDaysHelper(weekStart, -7)">
                <ChevronRight :size="14" class="rotate-180" />
              </button>
              <span class="text-[13px] font-semibold text-foreground font-mono tabular-nums px-2">
                {{ fmtSlash(weekStart) }} – {{ fmtSlash(addDaysHelper(weekStart, 6)) }}
              </span>
              <button class="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors" @click="weekStart = addDaysHelper(weekStart, 7)">
                <ChevronRight :size="14" />
              </button>
              <button class="h-8 px-3 rounded-lg border border-border bg-card text-[12px] font-medium text-foreground/70 hover:text-primary hover:border-primary/50 transition-colors ml-1" @click="weekStart = mondayOf(new Date().toISOString().slice(0, 10))">
                {{ t('hrm.leave.manage.thisWeek') }}
              </button>
            </div>
            <div class="hidden lg:flex items-center gap-3.5 text-[11.5px] text-muted-foreground flex-wrap">
              <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded" style="background: hsl(var(--primary))" />{{ t('hrm.leave.type.fullDay') }}</span>
              <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded" style="background: hsl(199 89% 48%)" />{{ t('hrm.leave.manage.legendHalfDay') }}</span>
              <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded" style="background: hsl(160 60% 45%)" />{{ t('hrm.leave.type.workAtHome') }}</span>
              <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded" style="background: hsl(231 60% 55%)" />{{ t('hrm.leave.type.businessTrip') }}</span>
            </div>
          </div>

          <!-- Loading skeleton -->
          <template v-if="leaveStore.loading">
            <div class="overflow-x-auto">
              <table class="w-full border-collapse" style="min-width: 880px">
                <tbody><SkeletonRow :cols="8" :rows="5" /></tbody>
              </table>
            </div>
          </template>

          <!-- Empty state -->
          <template v-else-if="filteredGridMembers.length === 0">
            <EmptyState :icon="FileX" :title="t('hrm.leave.manage.emptyTitle')" :description="t('hrm.leave.manage.emptyDesc')" />
          </template>

          <!-- LeaveGrid calendar -->
          <LeaveGrid
            v-else
            :members="pagedGridMembers"
            :entries="gridEntries"
            :week-start="weekStart"
            @select="onGridSelect"
          />

          <!-- Footer: week range + pagination -->
          <div class="flex items-center justify-between gap-4 flex-wrap px-5 py-3 border-t border-border/70 bg-muted/10">
            <span class="text-[12px] text-muted-foreground font-mono tabular-nums">{{ fmtSlash(weekStart) }} – {{ fmtSlash(addDaysHelper(weekStart, 6)) }}</span>
            <div v-if="gridTotalPages > 1" class="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span>{{ t('hrm.leave.manage.page', { page, total: gridTotalPages }) }}</span>
              <div class="flex items-center gap-1">
                <button :disabled="page <= 1" class="h-7 w-7 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground disabled:opacity-40 hover:text-primary hover:border-primary/50 transition-colors" @click="page--">
                  <ChevronRight :size="11" class="rotate-180" />
                </button>
                <button v-for="p in gridTotalPages" :key="p"
                  :class="['h-7 min-w-7 px-2 rounded-md text-[12px] font-medium transition-colors', p === page ? 'text-white' : 'border border-border bg-card text-foreground/70 hover:border-primary/50']"
                  :style="p === page ? { background: 'hsl(var(--primary))' } : {}"
                  @click="page = p"
                >{{ p }}</button>
                <button :disabled="page >= gridTotalPages" class="h-7 w-7 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground disabled:opacity-40 hover:text-primary hover:border-primary/50 transition-colors" @click="page++">
                  <ChevronRight :size="11" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- CREATE -->
    <template v-else-if="tab === 'create'">
      <div class="card-surface p-6 rise">
        <h3 class="font-heading font-bold text-[17px] text-foreground mb-5">{{ t('hrm.leave.create.formTitle') }}</h3>

        <!-- Leave balance summary -->
        <div v-if="leaveStore.leaveInfo" class="grid grid-cols-3 gap-3 mb-5">
          <div class="rounded-xl border border-border bg-muted/30 p-3 text-center">
            <div class="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1">{{ t('hrm.leave.create.balanceRemaining') }}</div>
            <div class="text-[22px] font-bold text-primary leading-none">{{ leaveStore.leaveInfo.day_remaining }}</div>
            <div class="text-[11px] text-muted-foreground mt-0.5">{{ t('hrm.leave.create.daysUnit') }}</div>
          </div>
          <div class="rounded-xl border border-border bg-muted/30 p-3 text-center">
            <div class="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1">{{ t('hrm.leave.create.balanceUsed') }}</div>
            <div class="text-[22px] font-bold text-amber-500 leading-none">{{ leaveStore.leaveInfo.day_used }}</div>
            <div class="text-[11px] text-muted-foreground mt-0.5">{{ t('hrm.leave.create.daysUnit') }}</div>
          </div>
          <div class="rounded-xl border border-border bg-muted/30 p-3 text-center">
            <div class="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1">{{ t('hrm.leave.create.balancePrevYear') }}</div>
            <div class="text-[22px] font-bold text-sky-500 leading-none">{{ leaveStore.leaveInfo.day_remaining_previous }}</div>
            <div class="text-[11px] text-muted-foreground mt-0.5">{{ t('hrm.leave.create.daysUnit') }}</div>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Step 1: Type selection -->
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.create.typeLabel') }} <span class="text-red-400">*</span></label>
            <Select v-model="createForm.type" :options="typeOpts" :placeholder="t('hrm.leave.create.typePlaceholder')" style="width: 100%" @update:modelValue="onLeaveTypeChange" />
            <p v-if="createErrors.type" class="text-red-500 text-[11px] mt-1">{{ t('hrm.leave.create.typeRequired') }}</p>
          </div>

          <!-- Step 2: Fields appear after type is selected -->
          <template v-if="createForm.type">
            <!-- Note for full-day (type 1) -->
            <p v-if="createTypeId === 1" class="text-[12px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
              {{ t('hrm.leave.create.fullDayNotice') }}
            </p>

            <!-- Date fields -->
            <div :class="createShowDateTo ? 'grid grid-cols-2 gap-4' : ''">
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">
                  {{ createShowDateTo ? t('common.from') : t('hrm.leave.create.dateLabel') }} <span class="text-red-400">*</span>
                </label>
                <DatePicker v-model="createForm.from" width="100%" :error="!!createErrors.from" />
                <p v-if="createErrors.from" class="text-red-500 text-[11px] mt-1">{{ t('hrm.leave.create.dateRequired') }}</p>
              </div>
              <div v-if="createShowDateTo">
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('common.to') }} <span class="text-red-400">*</span></label>
                <DatePicker v-model="createForm.to" width="100%" :min="createForm.from" :error="!!createErrors.to" />
                <p v-if="createErrors.to" class="text-red-500 text-[11px] mt-1">{{ t('hrm.leave.create.toDateRequired') }}</p>
              </div>
            </div>

            <!-- Time pickers for types 4/5/6 -->
            <template v-if="createShowTime">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.create.fromTime') }} <span class="text-red-400">*</span></label>
                  <TimePicker
                    :model-value="createForm.fromH ? `${createForm.fromH}:${createForm.fromM}` : ''"
                    :error="!!createErrors.time && !createForm.fromH"
                    @update:model-value="(v) => { const [h,m] = v.split(':'); createForm.fromH = h ?? ''; createForm.fromM = m ?? '00' }"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.create.toTime') }} <span class="text-red-400">*</span></label>
                  <TimePicker
                    :model-value="createForm.toH ? `${createForm.toH}:${createForm.toM}` : ''"
                    :error="!!createErrors.time && !createForm.toH"
                    @update:model-value="(v) => { const [h,m] = v.split(':'); createForm.toH = h ?? ''; createForm.toM = m ?? '00' }"
                  />
                </div>
              </div>
              <p v-if="createErrors.time" class="text-red-500 text-[11px]">{{ createErrors.time }}</p>
            </template>

            <!-- Subtract type segmented control -->
            <div v-if="createShowSubtract">
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-2">{{ t('hrm.leave.create.subtractLabel') }}</label>
              <div class="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
                <button
                  type="button"
                  :class="['px-4 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150', createForm.subtractType === 1 ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/80']"
                  @click="createForm.subtractType = 1"
                >{{ t('hrm.leave.create.subtractLeave') }}</button>
                <button
                  type="button"
                  :class="['px-4 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150', createForm.subtractType === 4 ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/80']"
                  @click="createForm.subtractType = 4"
                >{{ t('hrm.leave.create.subtractSalary') }}</button>
              </div>
            </div>

            <!-- Reason -->
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.create.reasonLabel') }} <span class="text-red-400">*</span></label>
              <textarea v-model="createForm.reason" rows="3" :placeholder="t('hrm.leave.create.reasonPh')" :class="['w-full px-3 py-2 rounded-lg border bg-card text-[13px] outline-none resize-none placeholder:text-muted-foreground/50', createErrors.reason ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary/60']" />
              <p v-if="createErrors.reason" class="text-red-500 text-[11px] mt-1">{{ t('hrm.leave.create.reasonRequired') }}</p>
            </div>

            <!-- Email subject & content -->
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.create.emailTitleLabel') }}</label>
              <input v-model="createForm.emailTitle" type="text" :placeholder="t('hrm.leave.create.emailTitlePh')" class="w-full h-9 px-3 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60 placeholder:text-muted-foreground/50" />
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.create.emailContentLabel') }}</label>
              <textarea v-model="createForm.emailContent" rows="4" :placeholder="t('hrm.leave.create.emailContentPh')" class="w-full px-3 py-2 rounded-md border border-border bg-muted/30 text-[13px] outline-none resize-none focus:border-primary/60 placeholder:text-muted-foreground/50" />
            </div>
          </template>

          <div class="pt-2 flex items-center justify-end gap-2">
            <Btn variant="outline" @click="tab = 'manage'">{{ t('common.cancel') }}</Btn>
            <Btn variant="primary" @click="submitCreate">{{ t('hrm.leave.create.submit') }}</Btn>
          </div>
        </div>
      </div>
    </template>

    <!-- INFO -->
    <template v-else-if="tab === 'info'">
      <div class="space-y-4 rise">
        <div class="card-surface p-4">
          <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.info.searchName') }}</label>
              <div class="relative">
                <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input v-model="infoSearch" :placeholder="t('hrm.leave.info.searchPh')" class="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60 placeholder:text-muted-foreground/50">
              </div>
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.info.branch') }}</label>
              <Select v-model="infoBranch" :options="infoBranchOpts" style="width: 100%" />
            </div>
            <Btn variant="outline">{{ t('hrm.leave.info.upload') }}</Btn>
          </div>
        </div>

        <div class="card-surface overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-[13px]" style="min-width: 880px">
              <thead>
                <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold">
                  <th rowspan="2" class="text-left py-3 px-5 border-b border-border/40 align-middle">{{ t('hrm.leave.info.colName') }}</th>
                  <th rowspan="2" class="text-left py-3 px-3 border-b border-border/40 align-middle">{{ t('hrm.leave.info.colEmail') }}</th>
                  <th rowspan="2" class="text-left py-3 px-3 border-b border-border/40 align-middle">{{ t('hrm.leave.info.colBranch') }}</th>
                  <th rowspan="2" class="text-center py-3 px-3 border-b border-border/40 align-middle">{{ t('hrm.leave.info.colUsed') }}</th>
                  <th colspan="2" class="text-center py-2 px-3 border-b border-l border-border/40">{{ t('hrm.leave.info.colRemaining') }}</th>
                  <th rowspan="2" class="text-center py-3 px-5 border-b border-border/40 align-middle w-56">{{ t('hrm.leave.info.colAction') }}</th>
                </tr>
                <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold">
                  <th class="text-center py-2 px-3 border-b border-l border-border/40">{{ t('hrm.leave.info.colThisYear') }}</th>
                  <th class="text-center py-2 px-3 border-b border-border/40">{{ t('hrm.leave.info.colPrevYear') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in paginatedInfo" :key="r.userId" class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td class="py-3 px-5"><div class="flex items-center gap-2.5"><Avatar :name="r.name" :size="30" /><span class="font-medium">{{ r.name }}</span></div></td>
                  <td class="py-3 px-3 font-mono text-[12px] text-muted-foreground">{{ r.email }}</td>
                  <td class="py-3 px-3 text-foreground/85">{{ r.branch }}</td>
                  <td class="py-3 px-3 text-center tabular-nums text-amber-600 font-semibold">{{ r.used.toFixed(2) }}</td>
                  <td class="py-3 px-3 text-center tabular-nums font-bold text-emerald-600 border-l border-border/40">{{ r.curr.toFixed(2) }}</td>
                  <td class="py-3 px-3 text-center tabular-nums text-muted-foreground">{{ r.prev.toFixed(2) }}</td>
                  <td class="py-3 px-5">
                    <div class="flex items-center justify-end gap-1.5">
                      <Btn v-if="isManager" variant="outline" size="xs" @click="() => { addDaysRow = r; addDaysForm = { type: '', amount: '1', year: '2026', reason: '' } }">
                        <Plus :size="11" /> {{ t('hrm.leave.info.addDays') }}
                      </Btn>
                      <Btn variant="primary" size="xs" @click="tab = 'create'">{{ t('hrm.leave.info.createLeave') }}</Btn>
                    </div>
                  </td>
                </tr>
                <tr v-if="paginatedInfo.length === 0">
                  <td colspan="7" class="py-14 text-center text-muted-foreground">
                    <CalendarCheck :size="36" class="mx-auto mb-2 opacity-30" />{{ t('hrm.leave.info.emptyRecords') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Pagination
            :page="infoPage"
            :total="filteredInfo.length"
            :per-page="INFO_PER_PAGE"
            @change="infoPage = $event"
          />
        </div>
      </div>
    </template>

    <!-- HISTORY -->
    <template v-else-if="tab === 'history'">
      <div class="space-y-4 rise">
        <!-- Filter bar -->
        <div class="card-surface p-4">
          <div class="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-4 items-end">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.history.searchName') }}</label>
              <div class="relative">
                <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input v-model="historySearch" :placeholder="t('hrm.leave.history.searchPh')" class="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60 placeholder:text-muted-foreground/50" @keyup.enter="fetchHistory(1)">
              </div>
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.history.typeLabel') }}</label>
              <Select v-model="historyType" :options="historyTypeOpts" style="width: 100%" />
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.history.yearLabel') }}</label>
              <Select v-model="historyYear" :options="historyYearOpts" style="width: 100%" />
            </div>
            <Btn variant="primary" @click="fetchHistory(1)">
              <Search :size="13" /> {{ t('hrm.leave.history.search') }}
            </Btn>
          </div>
        </div>

        <!-- Table -->
        <div class="card-surface overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-[13px]" style="min-width: 700px">
              <thead>
                <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                  <th class="text-left py-3 px-5">{{ t('hrm.leave.history.colDate') }}</th>
                  <th class="text-left py-3 px-3">{{ t('hrm.leave.history.colEmployee') }}</th>
                  <th class="text-left py-3 px-3">{{ t('hrm.leave.history.colType') }}</th>
                  <th class="text-center py-3 px-3">{{ t('hrm.leave.history.colHours') }}</th>
                  <th class="text-center py-3 px-3">{{ t('hrm.leave.history.colYear') }}</th>
                  <th class="text-left py-3 px-3">{{ t('hrm.leave.history.colReason') }}</th>
                  <th class="text-left py-3 px-5">{{ t('hrm.leave.history.colBy') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in leaveStore.bonuses" :key="b.id" class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td class="py-3 px-5 font-mono text-[12px] text-muted-foreground">{{ formatDateDisplay(b.created_at) }}</td>
                  <td class="py-3 px-3"><div class="flex items-center gap-2.5"><Avatar :name="b.full_name" :size="28" /><span class="font-medium">{{ b.full_name }}</span></div></td>
                  <td class="py-3 px-3 text-foreground/85">{{ BONUS_TYPE_ID_MAP[b.leave_bonus_type_id] ? t(BONUS_TYPE_ID_MAP[b.leave_bonus_type_id]!) : b.leave_bonus_type }}</td>
                  <td class="py-3 px-3 text-center"><span :class="['font-bold tabular-nums', b.hour < 0 ? 'text-red-500' : 'text-emerald-600']">{{ b.hour > 0 ? '+' + b.hour : b.hour }}</span></td>
                  <td class="py-3 px-3 text-center tabular-nums text-muted-foreground">{{ b.year }}</td>
                  <td class="py-3 px-3 text-foreground/85">{{ b.reason }}</td>
                  <td class="py-3 px-5 text-muted-foreground">{{ b.created_by }}</td>
                </tr>
                <tr v-if="leaveStore.bonuses.length === 0">
                  <td colspan="7">
                    <EmptyState :icon="FileX" :title="t('hrm.leave.history.emptyTitle')" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Pagination
            :page="leaveStore.bonusPagination.current_page"
            :total="leaveStore.bonusPagination.total_row"
            :per-page="leaveStore.bonusPagination.row_per_page"
            @change="fetchHistory($event)"
          />
        </div>
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
          <div class="flex-1 overflow-y-auto overscroll-contain scrollbar-thin p-5 space-y-5">
            <div class="flex items-center gap-2 flex-wrap">
              <Badge variant="primary">{{ detail.type }}{{ detail.half ? t('hrm.leave.detail.halfDaySuffix') : '' }}</Badge>
              <Badge :variant="LEAVE_STATUS_META[detail.status].variant" dot>{{ t(LEAVE_STATUS_META[detail.status].labelKey) }}</Badge>
            </div>
            <div class="card-surface p-4 grid grid-cols-2 gap-4">
              <div><p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">{{ t('common.from') }}</p><p class="text-[14px] font-mono">{{ fmtSlash(detail.from) }}</p></div>
              <div><p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">{{ t('common.to') }}</p><p class="text-[14px] font-mono">{{ fmtSlash(detail.to) }}</p></div>
              <div>
                <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">{{ t('hrm.leave.detail.days') }}</p>
                <p class="text-[14px] font-bold tabular-nums">{{ (Math.round((new Date(detail.to).getTime() - new Date(detail.from).getTime()) / 86400000) + 1 - (detail.half ? 0.5 : 0)) }} {{ t('hrm.leave.detail.daysUnit') }}</p>
              </div>
            </div>
            <div>
              <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">{{ t('hrm.leave.detail.reason') }}</p>
              <p class="text-[13.5px] text-foreground/85 leading-relaxed">{{ detail.reason }}</p>
            </div>
          </div>
          <div v-if="detail.status === 'pending' && isManager" class="p-4 border-t border-border/70 flex items-center gap-2">
            <Btn variant="ghost" size="sm" @click="reject(detail)">{{ t('hrm.leave.detail.reject') }}</Btn>
            <div class="flex-1" />
            <Btn variant="success" size="sm" @click="approve(detail)">{{ t('hrm.leave.detail.approve') }}</Btn>
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
                <h3 class="font-heading font-bold text-[15px] text-foreground">{{ t('hrm.leave.addModal.title') }}</h3>
                <p class="text-[11.5px] text-muted-foreground">{{ t('hrm.leave.addModal.subtitle') }}</p>
              </div>
            </div>
            <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="addDaysRow = null"><X :size="14" /></button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-[230px_1fr]">
            <div class="p-6 border-b md:border-b-0 md:border-r border-border/70 bg-muted/20">
              <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary mb-4">{{ t('hrm.leave.addModal.memberInfo') }}</p>
              <div class="flex flex-col items-center text-center">
                <Avatar :name="addDaysRow.name" :size="64" />
                <p class="font-semibold text-[14px] text-foreground mt-3">{{ addDaysRow.name }}</p>
                <p class="text-[11.5px] text-muted-foreground font-mono break-all mt-0.5">{{ addDaysRow.email }}</p>
              </div>
              <div class="mt-5 pt-4 border-t border-border/60 space-y-3">
                <div><p class="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground">{{ t('hrm.leave.addModal.used') }}</p><p class="text-[18px] font-bold font-heading tabular-nums mt-0.5">{{ addDaysRow.used.toFixed(2) }}</p></div>
                <div><p class="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground">{{ t('hrm.leave.addModal.remaining') }}</p><p class="text-[18px] font-bold font-heading tabular-nums mt-0.5" style="color:hsl(var(--primary))">{{ (addDaysRow.curr + addDaysRow.prev).toFixed(2) }}</p></div>
              </div>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.addModal.typeLabel') }} <span class="text-red-400">*</span></label>
                <Select v-model="addDaysForm.type" :options="addTypeOpts" :placeholder="t('hrm.leave.addModal.typePlaceholder')" :class="addDaysErrors.type ? 'ring-1 ring-red-400 rounded-md' : ''" style="width:100%" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.addModal.amountLabel') }} <span class="text-red-400">*</span></label>
                  <input v-model="addDaysForm.amount" type="number" step="0.5" min="0"
                    :class="['w-full h-9 px-3 rounded-lg border bg-card text-[13px] outline-none', addDaysErrors.amount ? 'border-red-400' : 'border-border focus:border-primary/60']">
                </div>
                <div>
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.addModal.yearLabel') }} <span class="text-red-400">*</span></label>
                  <Select v-model="addDaysForm.year" :options="yearOpts" style="width:100%" />
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.leave.addModal.reasonLabel') }} <span class="text-red-400">*</span></label>
                <textarea v-model="addDaysForm.reason" rows="4" :placeholder="t('hrm.leave.addModal.reasonPh')"
                  :class="['w-full px-3 py-2 rounded-lg border bg-card text-[13px] outline-none resize-none placeholder:text-muted-foreground/45', addDaysErrors.reason ? 'border-red-400' : 'border-border focus:border-primary/60']" />
              </div>
              <div class="flex items-center justify-end gap-2 pt-1">
                <Btn variant="outline" size="sm" @click="addDaysRow = null">{{ t('common.cancel') }}</Btn>
                <Btn variant="primary" size="sm" @click="submitAddDays"><Plus :size="13" /> {{ t('hrm.leave.addModal.submit') }}</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
