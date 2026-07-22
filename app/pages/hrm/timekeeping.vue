<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { LogIn, LogOut, Check, FileText, Clock, AlertCircle, Pencil, Search } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Select from '~/components/base/Select.vue'
import Avatar from '~/components/base/Avatar.vue'
import FilterBar from '~/components/base/FilterBar.vue'
import FieldInput from '~/components/base/FieldInput.vue'
import Badge from '~/components/base/Badge.vue'
import Modal from '~/components/base/Modal.vue'
import DatePicker from '~/components/base/DatePicker.vue'
import TimePicker from '~/components/base/TimePicker.vue'
import SectionCard from '~/components/home/SectionCard.vue'
import TimekeepingCalendar from '~/components/timekeeping/TimekeepingCalendar.vue'
import SkeletonRow from '~/components/base/SkeletonRow.vue'
import EmptyState from '~/components/base/EmptyState.vue'
import ErrorBanner from '~/components/base/ErrorBanner.vue'
import {
  TK_STATUS_META, RQ_STATUS_META, recentMonthOptions,
  type TKStatus, type TimekeepingDay, type RQStatus,
} from '~/mocks/timekeeping'
import type { TimekeepingMineRow, TimekeepingTeamRow } from '~/types'
import { useTimekeepingStore } from '~/stores/timekeeping'
import { useMemberStore } from '~/stores/member'
import { useLeaveStore } from '~/stores/leave'
import { formatDateDisplay } from '~/utils/date'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const tkStore = useTimekeepingStore()
const memberStore = useMemberStore()
const leaveStore = useLeaveStore()
const auth = useAuth()
const { show } = useToast()
const { t, locale } = useI18n()

const localeMap: Record<string, string> = { vi: 'vi-VN', en: 'en-US', ja: 'ja-JP' }
const dateLocale = computed(() => localeMap[locale.value] ?? 'vi-VN')

const roleName = computed(() => auth.user.value?.role_name?.toLowerCase() ?? '')
const isManager = computed(() => roleName.value === 'manager' || roleName.value === 'general manager')
const isGM = computed(() => roleName.value === 'general manager')

const now = new Date()
const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const selectedMonth = ref(currentMonthValue)
const monthOptions = computed(() => recentMonthOptions(12, new Date(), d => d.toLocaleDateString(dateLocale.value, { month: 'short' })))

function monthRange(monthValue: string): { date_from: string; date_to: string } {
  const [y, m] = monthValue.split('-').map(Number)
  const first = new Date(y ?? now.getFullYear(), (m ?? 1) - 1, 1)
  const last = new Date(y ?? now.getFullYear(), (m ?? 1), 0)
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { date_from: iso(first), date_to: iso(last) }
}

function fetchMineForMonth(page = 1) {
  tkStore.fetchMine({ ...monthRange(selectedMonth.value), current_page: page })
}
function fetchTeamForMonth(page = 1) {
  tkStore.fetchTeam({
    ...monthRange(selectedMonth.value),
    user_name: teamSearch.value.trim() || undefined,
    branch_id: teamBranchId.value || undefined,
    current_page: page,
  })
}

// cf.AcceptedStatus = 1 — counts only approved leave days that overlap the
// selected month, scoped to the current user via user_id (the backend only
// filters by name text, so this narrows client-side).
const leaveDaysThisMonth = ref(0)
async function fetchLeaveDaysForMonth() {
  const userId = auth.user.value?.id
  if (!userId) return
  const { date_from, date_to } = monthRange(selectedMonth.value)
  await leaveStore.fetchLeaveRequests({ datetime_leave_from: date_from, datetime_leave_to: date_to, row_per_page: 200 })
  leaveDaysThisMonth.value = leaveStore.requests.filter(r => r.user_id === userId && r.status === 1).length
}

onMounted(() => {
  tkStore.fetchToday()
  fetchMineForMonth(1)
  fetchTeamForMonth(1)
  fetchLeaveDaysForMonth()
})

watch(selectedMonth, () => { fetchMineForMonth(1); fetchTeamForMonth(1); fetchLeaveDaysForMonth() })

const activeTab = ref<'mine' | 'team'>('mine')

// Derive check-in state from store (same pattern as Banner.vue)
const checkinState = computed<'none' | 'in' | 'out'>(() => {
  if (!tkStore.today) return 'none'
  if (tkStore.today.check_out_time) return 'out'
  if (tkStore.today.check_in_time) return 'in'
  return 'none'
})

// Extract "hh:mm AM" from "yyyy/MM/dd hh:mm AM" format
function extractTime(timeStr: string | undefined | null): string | null {
  if (!timeStr) return null
  const parts = timeStr.split(' ')
  return parts.length >= 3 ? parts.slice(1).join(' ') : null
}

const checkinTimeDisplay = computed(() => extractTime(tkStore.today?.check_in_time) ?? '—')
const checkoutTimeDisplay = computed(() => extractTime(tkStore.today?.check_out_time) ?? '—')

// Work-hour schedule: personal override if the employee has one, else the
// organization's default (already resolved server-side — see GetLoginUser).
function toMinutes(hhmm: string | undefined, fallback: string): number {
  const [h, m] = (hhmm || fallback).split(':')
  return parseInt(h || '0', 10) * 60 + parseInt(m || '0', 10)
}
const workStartMinutes = computed(() => toMinutes(auth.user.value?.work_start_time, '08:00'))
const workEndMinutes = computed(() => toMinutes(auth.user.value?.work_end_time, '17:30'))
const lunchBreakMinutes = computed(() =>
  Math.max(0, toMinutes(auth.user.value?.lunch_break_end_time, '13:30') - toMinutes(auth.user.value?.lunch_break_start_time, '12:00')),
)
// 30-minute grace period after the nominal start time before a check-in counts as late.
const onTimeCutoffMinutes = computed(() => workStartMinutes.value + 30)
// Expected net working hours for a full day: the work-start→work-end span minus the lunch break.
const expectedWorkHours = computed(() => Math.max(0, (workEndMinutes.value - workStartMinutes.value - lunchBreakMinutes.value) / 60))

const isCheckinOnTime = computed(() => {
  const t = tkStore.today?.check_in_time
  if (!t) return false
  const timePart = t.split(' ')[1] // "hh:mm"
  if (!timePart) return false
  const [h = '8', m = '30'] = timePart.split(':')
  const totalMin = parseInt(h) * 60 + parseInt(m)
  return totalMin <= onTimeCutoffMinutes.value
})

async function doCheck() {
  if (checkinState.value === 'none') await tkStore.checkIn()
  else if (checkinState.value === 'in') await tkStore.checkOut()
  await tkStore.fetchToday()
}

// ── Parsing helpers for the two different display formats the backend uses ──
// "mine" endpoint: "yyyy/MM/dd hh:mm AM" (12h, slash date)
function parseMineDisplay(s: string | null | undefined): { date: string; time: string } | null {
  if (!s) return null
  const m = s.match(/^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}) (AM|PM)$/)
  if (!m) return null
  const [, y, mo, d, hh, mi, ap] = m as unknown as [string, string, string, string, string, string, string]
  let h = parseInt(hh, 10)
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return { date: `${y}-${mo}-${d}`, time: `${String(h).padStart(2, '0')}:${mi}` }
}
// "team" endpoint: "yyyy-MM-dd HH:mm" (24h, dash date)
function parseTeamDisplay(s: string | null | undefined): { date: string; time: string } | null {
  if (!s) return null
  const [date, time] = s.split(' ')
  if (!date || !time) return null
  return { date, time: time.slice(0, 5) }
}
function hoursBetween(from: { date: string; time: string }, to: { date: string; time: string }): number {
  const start = new Date(`${from.date}T${from.time}:00`)
  const end = new Date(`${to.date}T${to.time}:00`)
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 36000) / 100)
}

// Group "mine" rows (each is one check-in/out cycle) by calendar day — a user
// can check in/out more than once per day, so a day's total is the sum.
const historyForMonth = computed((): TimekeepingDay[] => {
  const byDate = new Map<string, TimekeepingDay & { _lastOut?: { date: string; time: string } }>()
  for (const r of tkStore.mineRows) {
    const inP = parseMineDisplay(r.check_in_time)
    const outP = parseMineDisplay(r.check_out_time)
    if (!inP) continue
    const dateKey = formatDateDisplay(inP.date)
    const d = new Date(inP.date)
    let day = byDate.get(dateKey)
    if (!day) {
      day = { date: dateKey, weekday: d.getDay(), status: 'empty', hours: 0 }
      byDate.set(dateKey, day)
    }
    if (!day.in || inP.time < day.in) day.in = inP.time
    if (outP && (!day.out || outP.time > day.out)) day.out = outP.time
    if (outP) day.hours = Math.round(((day.hours ?? 0) + hoursBetween(inP, outP)) * 10) / 10
  }
  for (const day of byDate.values()) {
    const isWeekend = day.weekday === 0 || day.weekday === 6
    if (isWeekend) { day.status = 'weekend'; continue }
    // Missing either check-in or check-out is an incomplete record — must not
    // count as valid attendance (previously a check-in-only day fell through
    // to the `else` branch below with hours still 0, misreporting as 'full').
    if (!day.in || !day.out) { day.status = 'empty'; continue }
    const [h = '8', m = '0'] = day.in.split(':')
    const lateMin = Math.max(0, parseInt(h) * 60 + parseInt(m) - onTimeCutoffMinutes.value)
    day.late = lateMin
    if (lateMin > 5) day.status = 'late'
    else if ((day.hours ?? 0) > 0 && day.hours! < expectedWorkHours.value) day.status = 'short'
    else day.status = 'full'
  }
  return [...byDate.values()].sort((a, b) => a.date < b.date ? 1 : -1)
})

const stats = computed(() => {
  const h = historyForMonth.value
  const work = h.filter(d => d.status !== 'weekend' && d.status !== 'empty')
  return {
    workdays: work.length,
    totalHours: work.reduce((s, d) => s + (d.hours ?? 0), 0),
    lateMinutes: work.reduce((s, d) => s + (d.late ?? 0), 0),
    leaveDays: leaveDaysThisMonth.value,
    lateDays: work.filter(d => d.status === 'late').length,
  }
})

// Live clock
const currentTime = ref(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
let clockTimer: ReturnType<typeof setInterval>
onMounted(() => { clockTimer = setInterval(() => { currentTime.value = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }, 1000) })
onUnmounted(() => clearInterval(clockTimer))

const WEEKDAY_FULL_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const todayStr = computed(() => {
  const d = new Date()
  const day = t(`hrm.timekeeping.weekdayFull.${WEEKDAY_FULL_KEYS[d.getDay()]}`)
  return `${day} · ${formatDateDisplay(d)}`
})

const parsedMonth = computed(() => {
  const [y = now.getFullYear(), m = now.getMonth() + 1] = selectedMonth.value.split('-').map(Number)
  return { year: y, month: m - 1 }
})
const todayDay = computed(() => selectedMonth.value === currentMonthValue ? now.getDate() : 0)

// Week strip: current week (Mon-Sun)
const weekStartDate = computed(() => {
  const d = new Date()
  const diff = d.getDay() === 0 ? -6 : 1 - d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  return monday
})
const todayISO = new Date().toISOString().slice(0, 10)

const WEEKDAY_SHORT_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const weekDays = computed(() =>
  WEEKDAY_SHORT_KEYS.map((key, i) => {
    const d = new Date(weekStartDate.value)
    d.setDate(weekStartDate.value.getDate() + i)
    const dayN = d.getDate()
    const dateISO = d.toISOString().slice(0, 10)
    const dateVN = formatDateDisplay(dateISO)
    const hist = historyForMonth.value.find(h => h.date === dateVN) ?? null
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const status: TKStatus = hist?.status ?? (isWeekend ? 'weekend' : 'empty')
    return { dayN, label: t(`hrm.timekeeping.weekdayShort.${key}`), hist, status, isToday: dateISO === todayISO }
  })
)
const weekHours = computed(() => weekDays.value.reduce((s, d) => s + (d.hist?.hours ?? 0), 0))

// ── Team tab (flat per-day-per-employee list, matching old ERP's "Manage timekeeping") ──
const teamSearch = ref('')
const teamBranchId = ref(0)
watch([teamSearch, teamBranchId], () => fetchTeamForMonth(1))

const teamBranchOpts = computed(() => [
  { value: 0, label: t('hrm.timekeeping.team.allBranches') },
  ...Object.entries(tkStore.teamBranches).map(([id, name]) => ({ value: Number(id), label: name })),
])

// ── Request-edit modal (employee self-service correction request) ──────────
const requestModalOpen = ref(false)
const requestRecordId = ref<number | null>(null)
const requestForm = ref({ date: '', inTime: '', outTime: '' })
const requestSubmitting = ref(false)
const requestConflict = ref(false)

const mineRecordOpts = computed(() =>
  tkStore.mineRows.map(r => {
    const inP = parseMineDisplay(r.check_in_time)
    return { value: r.id, label: inP ? `${formatDateDisplay(inP.date)} ${inP.time}` : `#${r.id}` }
  }),
)

function openRequestModal(row?: TimekeepingMineRow) {
  requestConflict.value = false
  if (row) {
    requestRecordId.value = row.id
    const inP = parseMineDisplay(row.check_in_time)
    const outP = parseMineDisplay(row.check_out_time)
    requestForm.value = { date: inP?.date ?? '', inTime: inP?.time ?? '', outTime: outP?.time ?? '' }
  } else {
    requestRecordId.value = null
    requestForm.value = { date: '', inTime: '', outTime: '' }
  }
  requestModalOpen.value = true
}

function onPickRequestRecord(id: number) {
  requestRecordId.value = id
  const row = tkStore.mineRows.find(r => r.id === id)
  if (!row) return
  const inP = parseMineDisplay(row.check_in_time)
  const outP = parseMineDisplay(row.check_out_time)
  requestForm.value = { date: inP?.date ?? '', inTime: inP?.time ?? '', outTime: outP?.time ?? '' }
}

async function submitRequest(risky = false) {
  if (!requestRecordId.value || !requestForm.value.date || !requestForm.value.inTime) {
    show(t('hrm.timekeeping.toast.selectRecordAndTime'))
    return
  }
  requestSubmitting.value = true
  const res = await tkStore.requestEditTimekeeping({
    id: requestRecordId.value,
    user_id: auth.user.value?.id ?? 0,
    check_in_time: `${requestForm.value.date} ${requestForm.value.inTime}`,
    check_out_time: requestForm.value.outTime ? `${requestForm.value.date} ${requestForm.value.outTime}` : undefined,
    risky_update: risky,
  })
  requestSubmitting.value = false
  if (res.ok) {
    show(t('hrm.timekeeping.toast.requestSent'))
    requestModalOpen.value = false
    fetchMineForMonth(tkStore.minePagination.current_page)
  } else if (res.risky) {
    requestConflict.value = true
  } else {
    show(res.message || t('hrm.timekeeping.toast.requestFailed'))
  }
}

// ── Approval modal (GM: accept/reject a pending edit request) ──────────────
const approvalOpen = ref(false)
const approvalTarget = ref<TimekeepingTeamRow | null>(null)
const approvalDetail = ref<{ check_in_time: string; check_out_time: string } | null>(null)
const approvalReason = ref('')
const approvalRejecting = ref(false)
const approvalSubmitting = ref(false)

async function openApproval(row: TimekeepingTeamRow) {
  if (row.status !== 3) return
  approvalTarget.value = row
  approvalReason.value = ''
  approvalRejecting.value = false
  approvalDetail.value = await tkStore.getUserEditTkRequest(row.id)
  approvalOpen.value = true
}

async function submitApproval(statusId: 1 | 2) {
  if (!approvalTarget.value) return
  if (statusId === 2 && !approvalReason.value.trim()) {
    show(t('hrm.timekeeping.toast.enterRejectReason'))
    return
  }
  approvalSubmitting.value = true
  const res = await tkStore.updateRequestEditTkStatus({
    id: approvalTarget.value.id,
    user_id: auth.user.value?.id ?? 0,
    status_id: statusId,
    reason: approvalReason.value,
  })
  approvalSubmitting.value = false
  show(res.message || (res.ok ? t('hrm.timekeeping.toast.updateSuccess') : t('hrm.timekeeping.toast.updateFailed')))
  if (res.ok) {
    approvalOpen.value = false
    fetchTeamForMonth(tkStore.teamPagination.current_page)
  }
}

// ── GM: add / direct-edit timekeeping ───────────────────────────────────────
const gmModalOpen = ref(false)
const gmModalMode = ref<'add' | 'edit'>('add')
const gmForm = ref({ id: 0, userId: 0, userName: '', branch: '', date: '', inTime: '', outTime: '' })
const gmSubmitting = ref(false)
const gmConflict = ref(false)
const gmEmployeeQuery = ref('')
watch(gmEmployeeQuery, (q) => { if (q.trim()) memberStore.fetchMembers({ name: q }) })
const gmEmployeeResults = computed(() => memberStore.members)

function openGmAdd() {
  gmModalMode.value = 'add'
  gmForm.value = { id: 0, userId: 0, userName: '', branch: '', date: '', inTime: '', outTime: '' }
  gmEmployeeQuery.value = ''
  gmConflict.value = false
  gmModalOpen.value = true
}
function openGmEdit(row: TimekeepingTeamRow) {
  gmModalMode.value = 'edit'
  const inP = parseTeamDisplay(row.check_in_time)
  const outP = parseTeamDisplay(row.check_out_time)
  gmForm.value = { id: row.id, userId: 0, userName: row.user_name, branch: row.branch, date: inP?.date ?? '', inTime: inP?.time ?? '', outTime: outP?.time ?? '' }
  gmConflict.value = false
  gmModalOpen.value = true
}
function pickGmEmployee(id: number, name: string) {
  gmForm.value.userId = id
  gmForm.value.userName = name
  gmEmployeeQuery.value = ''
}

async function submitGm(risky = false) {
  if (!gmForm.value.date || !gmForm.value.inTime) { show(t('hrm.timekeeping.toast.enterDateAndCheckIn')); return }
  // AddTimekeeping has no server-side required check on user_id — an unpicked
  // employee would silently insert an orphan row (user_id: 0).
  if (gmModalMode.value === 'add' && !gmForm.value.userId) { show(t('hrm.timekeeping.toast.selectEmployee')); return }
  gmSubmitting.value = true
  const checkIn = `${gmForm.value.date} ${gmForm.value.inTime}`
  const checkOut = gmForm.value.outTime ? `${gmForm.value.date} ${gmForm.value.outTime}` : undefined
  const res = gmModalMode.value === 'add'
    ? await tkStore.addTimekeeping({ user_id: gmForm.value.userId, user_name: gmForm.value.userName, check_in_time: checkIn, check_out_time: checkOut, risky_update: risky })
    : await tkStore.editTimekeeping({ id: gmForm.value.id, user_name: gmForm.value.userName, branch: gmForm.value.branch, check_in_time: checkIn, check_out_time: checkOut, risky_update: risky })
  gmSubmitting.value = false
  if (res.ok) {
    show(gmModalMode.value === 'add' ? t('hrm.timekeeping.toast.addSuccess') : t('hrm.timekeeping.toast.editSuccess'))
    gmModalOpen.value = false
    fetchTeamForMonth(tkStore.teamPagination.current_page)
  } else if (res.risky) {
    gmConflict.value = true
  } else {
    show(res.message || t('hrm.timekeeping.toast.actionFailed'))
  }
}

async function doExportExcel() {
  const res = await tkStore.exportExcel(monthRange(selectedMonth.value))
  if (!res.ok) show(t('hrm.timekeeping.toast.exportFailed'))
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="t('hrm.timekeeping.pageEyebrow')"
      :title="t('hrm.timekeeping.pageTitle')"
      :description="t('hrm.timekeeping.pageDescription')"
    >
      <template #actions>
        <Btn v-if="isManager" variant="outline" @click="doExportExcel"><FileText :size="14" />{{ t('hrm.timekeeping.actions.exportExcel') }}</Btn>
        <Btn variant="outline" @click="openRequestModal()"><Clock :size="14" />{{ t('hrm.timekeeping.actions.requestEdit') }}</Btn>
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
            <p class="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">{{ t('hrm.timekeeping.checkin.title') }}</p>
            <div class="mt-2 flex items-baseline gap-2">
              <h2 class="text-[40px] font-bold font-heading text-primary tabular-nums leading-none">{{ currentTime }}</h2>
              <span class="text-[14px] text-muted-foreground">{{ todayStr }}</span>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-3 max-w-md">
              <div class="rounded-xl border border-border/70 bg-muted/30 p-4">
                <div class="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                  <LogIn :size="12" /> {{ t('hrm.timekeeping.checkin.checkIn') }}
                </div>
                <p
                  class="text-[24px] font-bold font-heading mt-1 tabular-nums"
                  :class="checkinState === 'none' ? 'text-muted-foreground/60' : 'text-primary'"
                >{{ checkinState === 'none' ? '—' : checkinTimeDisplay }}</p>
                <p v-if="checkinState !== 'none'" class="text-[11px] font-medium" :class="isCheckinOnTime ? 'text-emerald-600' : 'text-amber-600'">{{ isCheckinOnTime ? t('hrm.timekeeping.checkin.onTime') : t('hrm.timekeeping.checkin.late') }}</p>
              </div>
              <div class="rounded-xl border border-border/70 bg-muted/30 p-4">
                <div class="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                  <LogOut :size="12" /> {{ t('hrm.timekeeping.checkin.checkOut') }}
                </div>
                <p
                  class="text-[24px] font-bold font-heading mt-1 tabular-nums"
                  :class="checkinState === 'out' ? 'text-primary' : 'text-muted-foreground/60'"
                >{{ checkinState === 'out' ? checkoutTimeDisplay : '—' }}</p>
                <p v-if="checkinState === 'out'" class="text-[11px] text-emerald-600 font-medium">{{ t('hrm.timekeeping.checkin.completed') }}</p>
              </div>
            </div>

            <div class="mt-6 flex items-center gap-3">
              <Btn v-if="checkinState === 'none'" variant="primary" @click="doCheck">
                <LogIn :size="14" />{{ t('hrm.timekeeping.checkin.checkInBtn') }}
              </Btn>
              <Btn v-else-if="checkinState === 'in'" variant="primary" @click="doCheck">
                <LogOut :size="14" />{{ t('hrm.timekeeping.checkin.checkOutBtn') }}
              </Btn>
              <span v-else class="inline-flex items-center gap-2 px-3 h-9 rounded-md bg-emerald-500/10 text-emerald-600 font-semibold text-[13px]">
                <Check :size="14" /> {{ t('hrm.timekeeping.checkin.doneToday') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right: week strip + stats -->
        <div class="border-l border-border/70 p-6 bg-muted/20">
          <p class="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">{{ t('hrm.timekeeping.checkin.thisWeek') }}</p>
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
              <span class="text-muted-foreground">{{ t('hrm.timekeeping.checkin.workedThisWeek') }}</span>
              <span class="font-bold tabular-nums text-foreground">{{ t('hrm.timekeeping.checkin.weekProgress', { hours: weekHours.toFixed(1) }) }}</span>
            </div>
            <div class="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                class="h-full rounded-full"
                :style="{ width: Math.min(weekHours / 40 * 100, 100) + '%', background: 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 65%), hsl(var(--primary-h) var(--primary-s) 45%))' }"
              />
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-border/60">
              <span class="text-muted-foreground">{{ t('hrm.timekeeping.checkin.monthTotal') }}</span>
              <span class="font-bold tabular-nums text-foreground">{{ t('hrm.timekeeping.checkin.monthTotalValue', { hours: stats.totalHours.toFixed(1) }) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t('hrm.timekeeping.checkin.lateDaysCount') }}</span>
              <span class="font-bold tabular-nums" :class="stats.lateDays > 0 ? 'text-amber-600' : 'text-foreground'">{{ stats.lateDays }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MiniStats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MiniStat :label="t('hrm.timekeeping.stats.workdays')" :value="stats.workdays" :sublabel="monthOptions.find(m => m.value === selectedMonth)?.label ?? ''" accent="green" :delay="80" />
      <MiniStat :label="t('hrm.timekeeping.stats.totalHours')" :value="stats.totalHours.toFixed(1)" :sublabel="t('hrm.timekeeping.stats.totalHoursSub')" accent="primary" :delay="120" />
      <MiniStat :label="t('hrm.timekeeping.stats.lateMinutes')" :value="stats.lateMinutes" :sublabel="t('hrm.timekeeping.stats.lateDaysSuffix', { n: stats.lateDays })" :accent="stats.lateMinutes > 0 ? 'amber' : 'green'" :delay="160" />
      <MiniStat :label="t('hrm.timekeeping.stats.leaveDays')" :value="stats.leaveDays" :sublabel="t('hrm.timekeeping.stats.leaveDaysSub')" accent="violet" :delay="200" />
    </div>

    <!-- Tab strip -->
    <div class="border-b border-border/70 flex items-center justify-between">
      <div class="flex gap-7">
        <button
          v-for="[k, l] in (isManager ? [['mine', t('hrm.timekeeping.tabs.mine')], ['team', t('hrm.timekeeping.tabs.team')]] : [['mine', t('hrm.timekeeping.tabs.mine')]])"
          :key="k"
          :data-active="activeTab === k"
          class="tab-trigger"
          @click="activeTab = k as typeof activeTab"
        >{{ l }}</button>
      </div>
      <div class="flex items-center gap-2 pb-1">
        <Select v-model="selectedMonth" :options="monthOptions" style="min-width: 150px" />
      </div>
    </div>

    <!-- MINE -->
    <template v-if="activeTab === 'mine'">
      <ErrorBanner v-if="tkStore.mineError" :message="tkStore.mineError" @retry="fetchMineForMonth(1)" />
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <SectionCard :delay="260" class="lg:col-span-2" :title="t('hrm.timekeeping.mine.calendarTitle')">
          <TimekeepingCalendar
            :year="parsedMonth.year"
            :month="parsedMonth.month"
            :history="historyForMonth"
            :today-day="todayDay"
            @prev-month="selectedMonth = monthOptions[Math.min(monthOptions.length - 1, monthOptions.findIndex(m => m.value === selectedMonth) + 1)]?.value ?? selectedMonth"
            @next-month="selectedMonth = monthOptions[Math.max(0, monthOptions.findIndex(m => m.value === selectedMonth) - 1)]?.value ?? selectedMonth"
            @today="selectedMonth = currentMonthValue"
          />
        </SectionCard>

        <SectionCard :delay="300" class="lg:col-span-3" :title="t('hrm.timekeeping.mine.historyTitle')">
          <template #action>
            <span class="text-[11.5px] text-muted-foreground">{{ tkStore.mineRows.length }} {{ t('hrm.timekeeping.mine.recordsSuffix') }} · {{ monthOptions.find(m => m.value === selectedMonth)?.label }}</span>
          </template>
          <div class="-mx-5 -mb-5">
            <div class="max-h-[480px] overflow-y-auto scrollbar-thin">
              <table class="w-full text-[13px]">
                <thead class="sticky top-0 bg-card z-10">
                  <tr class="bg-muted/40 border-y border-border/70 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    <th class="text-left py-2.5 px-5">{{ t('hrm.timekeeping.mine.colDate') }}</th>
                    <th class="text-left py-2.5 px-3">{{ t('hrm.timekeeping.mine.colCheckIn') }}</th>
                    <th class="text-left py-2.5 px-3">{{ t('hrm.timekeeping.mine.colCheckOut') }}</th>
                    <th class="text-center py-2.5 px-3">{{ t('hrm.timekeeping.mine.colStatus') }}</th>
                    <th class="text-left py-2.5 px-5">{{ t('hrm.timekeeping.mine.colNote') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <SkeletonRow v-if="tkStore.mineLoading" :cols="5" :rows="5" />
                  <template v-else>
                    <tr
                      v-for="day in historyForMonth" :key="day.date"
                      class="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td class="py-2.5 px-5">
                        <span class="font-mono font-medium text-foreground">{{ day.date }}</span>
                        <p class="text-[11px] text-muted-foreground">{{ t(`hrm.timekeeping.weekdayShort.${WEEKDAY_FULL_KEYS[day.weekday]}`) }}</p>
                      </td>
                      <td class="py-2.5 px-3 font-mono tabular-nums">
                        <span v-if="day.in">{{ day.in }}</span>
                        <span v-else class="text-muted-foreground">—</span>
                      </td>
                      <td class="py-2.5 px-3 font-mono tabular-nums">
                        <span v-if="day.out">{{ day.out }}</span>
                        <span v-else class="text-muted-foreground">—</span>
                      </td>
                      <td class="py-2.5 px-3 text-center">
                        <span
                          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono"
                          :style="{ background: TK_STATUS_META[day.status].bg, color: TK_STATUS_META[day.status].color }"
                        >
                          <span class="h-1.5 w-1.5 rounded-full" :style="{ background: TK_STATUS_META[day.status].color }" />
                          {{ t(TK_STATUS_META[day.status].labelKey) }}
                        </span>
                      </td>
                      <td class="py-2.5 px-5 text-muted-foreground text-[12px]">
                        {{ day.note || (day.late ? t('hrm.timekeeping.mine.lateNote', { n: day.late }) : '') }}
                      </td>
                    </tr>
                    <tr v-if="historyForMonth.length === 0">
                      <td colspan="5">
                        <EmptyState :icon="Clock" :title="t('hrm.timekeeping.mine.emptyTitle')" :description="t('hrm.timekeeping.mine.emptyDesc')" />
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>
      </div>
    </template>

    <!-- TEAM -->
    <template v-else-if="activeTab === 'team'">
      <ErrorBanner v-if="tkStore.teamError" :message="tkStore.teamError" @retry="fetchTeamForMonth(1)" />
      <FilterBar>
        <FieldInput v-model="teamSearch" :icon="Search" :placeholder="t('hrm.timekeeping.team.searchPh')" :width="240" />
        <Select v-model="teamBranchId" :options="teamBranchOpts" :width="180" />
        <div class="flex-1" />
        <Btn v-if="isGM" variant="primary" @click="openGmAdd"><Clock :size="13" /> {{ t('hrm.timekeeping.team.addBtn') }}</Btn>
      </FilterBar>

      <div class="card-surface overflow-hidden rise">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 760px">
            <thead>
              <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold border-b border-border/70">
                <th class="text-left py-3 px-5">{{ t('hrm.timekeeping.team.colEmployee') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.timekeeping.team.colBranch') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.timekeeping.team.colCheckIn') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.timekeeping.team.colCheckOut') }}</th>
                <th class="text-center py-3 px-3">{{ t('hrm.timekeeping.team.colStatus') }}</th>
                <th v-if="isGM" class="text-center py-3 px-5 w-16">{{ t('hrm.timekeeping.team.colEdit') }}</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRow v-if="tkStore.teamLoading" :cols="isGM ? 6 : 5" :rows="6" />
              <template v-else>
                <tr v-for="r in tkStore.teamRows" :key="r.id" class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td class="py-3 px-5">
                    <div class="flex items-center gap-2.5">
                      <Avatar :name="r.user_name" :size="28" />
                      <span class="font-medium">{{ r.user_name }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-3 text-foreground/80">{{ r.branch }}</td>
                  <td class="py-3 px-3 font-mono tabular-nums">{{ parseTeamDisplay(r.check_in_time)?.time ?? '—' }}</td>
                  <td class="py-3 px-3 font-mono tabular-nums">{{ parseTeamDisplay(r.check_out_time)?.time ?? '—' }}</td>
                  <td class="py-3 px-3 text-center">
                    <button
                      v-if="r.status === 3 && isGM"
                      class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium hover:opacity-80 transition-opacity"
                      :style="{ background: 'hsl(38 92% 92%)', color: 'hsl(38 92% 40%)' }"
                      @click="openApproval(r)"
                    >
                      <AlertCircle :size="11" /> {{ t(RQ_STATUS_META[3].labelKey) }}
                    </button>
                    <Badge v-else :variant="RQ_STATUS_META[r.status as RQStatus]?.variant ?? 'gray'" dot>{{ RQ_STATUS_META[r.status as RQStatus] ? t(RQ_STATUS_META[r.status as RQStatus].labelKey) : '—' }}</Badge>
                  </td>
                  <td v-if="isGM" class="py-3 px-5 text-center">
                    <button class="h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" :title="t('hrm.timekeeping.team.editTitle')" @click="openGmEdit(r)">
                      <Pencil :size="13" />
                    </button>
                  </td>
                </tr>
                <tr v-if="tkStore.teamRows.length === 0">
                  <td :colspan="isGM ? 6 : 5">
                    <EmptyState :icon="Clock" :title="t('hrm.timekeeping.team.emptyTitle')" :description="t('hrm.timekeeping.team.emptyDesc')" />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div class="px-5 py-3 border-t border-border/70 bg-muted/10 text-[12.5px] text-muted-foreground">
          {{ monthOptions.find(m => m.value === selectedMonth)?.label }} · <span class="font-semibold text-foreground">{{ tkStore.teamPagination.total_row }}</span> {{ t('hrm.timekeeping.team.recordsSuffix') }}
        </div>
      </div>
    </template>

    <!-- REQUEST-EDIT MODAL (employee self-service) -->
    <Modal v-model:open="requestModalOpen" :title="t('hrm.timekeeping.requestModal.title')" :max-width="480">
      <div class="p-6 space-y-4">
        <div v-if="!requestRecordId">
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.timekeeping.requestModal.chooseRecordLabel') }} <span class="text-red-400">*</span></label>
          <Select :model-value="requestRecordId ?? ''" :options="mineRecordOpts" :placeholder="t('hrm.timekeeping.requestModal.chooseRecordPh')" style="width: 100%" @update:model-value="onPickRequestRecord(Number($event))" />
        </div>
        <template v-else>
          <div>
            <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.timekeeping.requestModal.dateLabel') }}</label>
            <DatePicker v-model="requestForm.date" width="100%" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.timekeeping.requestModal.checkInLabel') }} <span class="text-red-400">*</span></label>
              <TimePicker v-model="requestForm.inTime" />
            </div>
            <div>
              <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.timekeeping.requestModal.checkOutLabel') }}</label>
              <TimePicker v-model="requestForm.outTime" />
            </div>
          </div>
          <div v-if="requestConflict" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-[12.5px] text-amber-700">
            {{ t('hrm.timekeeping.requestModal.conflictMsg') }}
            <div class="flex justify-end gap-2 mt-2">
              <Btn variant="outline" size="xs" @click="requestConflict = false">{{ t('hrm.timekeeping.requestModal.cancel') }}</Btn>
              <Btn variant="primary" size="xs" @click="submitRequest(true)">{{ t('hrm.timekeeping.requestModal.continue') }}</Btn>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <Btn variant="outline" @click="requestModalOpen = false">{{ t('hrm.timekeeping.requestModal.cancel') }}</Btn>
        <Btn v-if="requestRecordId" variant="primary" :disabled="requestSubmitting" @click="submitRequest(false)">{{ t('hrm.timekeeping.requestModal.submit') }}</Btn>
      </template>
    </Modal>

    <!-- APPROVAL MODAL (GM) -->
    <Modal v-model:open="approvalOpen" :title="t('hrm.timekeeping.approvalModal.title')" :max-width="440">
      <div class="p-6 space-y-4" v-if="approvalTarget">
        <div class="flex items-center gap-2.5">
          <Avatar :name="approvalTarget.user_name" :size="28" />
          <span class="font-medium">{{ approvalTarget.user_name }}</span>
        </div>
        <div class="grid grid-cols-2 gap-4 text-[13px]">
          <div><p class="text-[11px] text-muted-foreground mb-0.5">{{ t('hrm.timekeeping.approvalModal.currentCheckIn') }}</p><p class="font-mono">{{ parseTeamDisplay(approvalTarget.check_in_time)?.time ?? '—' }}</p></div>
          <div><p class="text-[11px] text-muted-foreground mb-0.5">{{ t('hrm.timekeeping.approvalModal.currentCheckOut') }}</p><p class="font-mono">{{ parseTeamDisplay(approvalTarget.check_out_time)?.time ?? '—' }}</p></div>
          <div><p class="text-[11px] text-muted-foreground mb-0.5">{{ t('hrm.timekeeping.approvalModal.proposedCheckIn') }}</p><p class="font-mono text-primary">{{ parseTeamDisplay(approvalDetail?.check_in_time)?.time ?? '—' }}</p></div>
          <div><p class="text-[11px] text-muted-foreground mb-0.5">{{ t('hrm.timekeeping.approvalModal.proposedCheckOut') }}</p><p class="font-mono text-primary">{{ parseTeamDisplay(approvalDetail?.check_out_time)?.time ?? '—' }}</p></div>
        </div>
        <div v-if="approvalRejecting">
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.timekeeping.approvalModal.rejectReasonLabel') }} <span class="text-red-400">*</span></label>
          <textarea v-model="approvalReason" rows="3" class="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] outline-none resize-none focus:border-primary/60" />
        </div>
      </div>
      <template #footer>
        <template v-if="!approvalRejecting">
          <Btn variant="outline" @click="approvalRejecting = true">{{ t('hrm.timekeeping.approvalModal.reject') }}</Btn>
          <Btn variant="primary" :disabled="approvalSubmitting" @click="submitApproval(1)">{{ t('hrm.timekeeping.approvalModal.approve') }}</Btn>
        </template>
        <template v-else>
          <Btn variant="outline" @click="approvalRejecting = false">{{ t('hrm.timekeeping.approvalModal.back') }}</Btn>
          <Btn variant="danger" :disabled="approvalSubmitting" @click="submitApproval(2)">{{ t('hrm.timekeeping.approvalModal.confirmReject') }}</Btn>
        </template>
      </template>
    </Modal>

    <!-- GM: ADD / DIRECT-EDIT TIMEKEEPING MODAL -->
    <Modal v-model:open="gmModalOpen" :title="gmModalMode === 'add' ? t('hrm.timekeeping.gmModal.addTitle') : t('hrm.timekeeping.gmModal.editTitle')" :max-width="480">
      <div class="p-6 space-y-4">
        <div v-if="gmModalMode === 'add'">
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.timekeeping.gmModal.employeeLabel') }} <span class="text-red-400">*</span></label>
          <div class="relative">
            <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              v-model="gmEmployeeQuery"
              :placeholder="gmForm.userName || t('hrm.timekeeping.gmModal.employeeSearchPh')"
              class="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground/45"
            >
            <div v-if="gmEmployeeQuery" class="absolute z-20 left-0 right-0 mt-1 card-surface border border-border shadow-popover rounded-xl overflow-hidden max-h-52 overflow-y-auto scrollbar-thin">
              <button
                v-for="m in gmEmployeeResults" :key="m.id" type="button"
                class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/40 transition-colors text-left"
                @click="pickGmEmployee(m.id, m.name)"
              >
                <Avatar :name="m.name" :size="24" /><span class="text-[13px] text-foreground">{{ m.name }}</span>
              </button>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.timekeeping.gmModal.dateLabel') }}</label>
          <DatePicker v-model="gmForm.date" width="100%" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.timekeeping.gmModal.checkInLabel') }} <span class="text-red-400">*</span></label>
            <TimePicker v-model="gmForm.inTime" />
          </div>
          <div>
            <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.timekeeping.gmModal.checkOutLabel') }}</label>
            <TimePicker v-model="gmForm.outTime" />
          </div>
        </div>
        <div v-if="gmConflict" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-[12.5px] text-amber-700">
          {{ t('hrm.timekeeping.gmModal.conflictMsg') }}
          <div class="flex justify-end gap-2 mt-2">
            <Btn variant="outline" size="xs" @click="gmConflict = false">{{ t('hrm.timekeeping.gmModal.cancel') }}</Btn>
            <Btn variant="primary" size="xs" @click="submitGm(true)">{{ t('hrm.timekeeping.gmModal.continue') }}</Btn>
          </div>
        </div>
      </div>
      <template #footer>
        <Btn variant="outline" @click="gmModalOpen = false">{{ t('hrm.timekeeping.gmModal.cancel') }}</Btn>
        <Btn variant="primary" :disabled="gmSubmitting" @click="submitGm(false)">{{ t('hrm.timekeeping.gmModal.save') }}</Btn>
      </template>
    </Modal>
  </div>
</template>
