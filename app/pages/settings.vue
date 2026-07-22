<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  Mail, Building, Calendar, Briefcase, Globe, Timer, Sliders, Clock,
  Plus, X, Check, Info, Search, UserPlus, FileText,
} from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import Select from '~/components/base/Select.vue'
import DatePicker from '~/components/base/DatePicker.vue'
import TimePicker from '~/components/base/TimePicker.vue'
import ErrorBanner from '~/components/base/ErrorBanner.vue'

import { useSettingsStore } from '~/stores/settings'
import type { BranchItem, JobTitleItem, TechItem, HolidayRow, PermissionFunction, PermissionUserRow } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const settingsStore = useSettingsStore()
onMounted(() => {
  settingsStore.loadAll()
  settingsStore.fetchModules()
  settingsStore.fetchOvertimeWeight()
  settingsStore.fetchPermissionUsers('')
})

// ── Custom directive: indeterminate checkbox ──
const vIndeterminate = {
  mounted: (el: HTMLInputElement, b: { value: boolean }) => { el.indeterminate = b.value },
  updated: (el: HTMLInputElement, b: { value: boolean }) => { el.indeterminate = b.value },
}

// ── Nav config ──
type SectionKey = 'email' | 'branch' | 'leave' | 'work-hours' | 'job-title' | 'technology' | 'holidays' | 'overtime' | 'permission'

const SETTINGS_NAV = [
  { group: 'Tổ chức', items: [
    { key: 'email' as SectionKey,      label: 'Email tổ chức', icon: Mail },
    { key: 'branch' as SectionKey,     label: 'Chi nhánh',     icon: Building },
    { key: 'leave' as SectionKey,      label: 'Nghỉ phép',     icon: Calendar },
    { key: 'work-hours' as SectionKey, label: 'Giờ làm việc',  icon: Clock },
  ]},
  { group: 'Nhân sự', items: [
    { key: 'job-title' as SectionKey,  label: 'Chức danh',             icon: Briefcase },
    { key: 'technology' as SectionKey, label: 'Công nghệ & Kỹ năng',   icon: Globe },
  ]},
  { group: 'Vận hành', items: [
    { key: 'holidays' as SectionKey,   label: 'Ngày nghỉ lễ', icon: Calendar },
    { key: 'overtime' as SectionKey,   label: 'Tăng ca',      icon: Timer },
  ]},
  { group: 'Hệ thống', items: [
    { key: 'permission' as SectionKey, label: 'Phân quyền', icon: Sliders },
  ]},
]

const activeSection = ref<SectionKey>('email')

// ── Toast ──
const toast = ref({ msg: '', type: 'ok' })
function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = { msg: '', type: 'ok' } }, 2800)
}

// ── Delete confirm modal (shared) ──
const delModal = reactive<{ open: boolean; label: string; onConfirm: () => void | Promise<void> }>({ open: false, label: '', onConfirm: () => {} })
function openDelModal(label: string, onConfirm: () => void) {
  Object.assign(delModal, { open: true, label, onConfirm })
}

// ── Email section ──
// edit-organization-email only ever accepts a test-recipient address — the
// server's own MAIL_ADDRESS env var is always the real "from" address, so it
// is shown read-only here; there is no endpoint to change it from the SPA.
const emailTestAddr = ref('')
const emailSending = ref(false)
async function sendEmailTest() {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailTestAddr.value.trim())) return showToast('Email không hợp lệ.', 'err')
  emailSending.value = true
  const res = await settingsStore.sendTestEmail(emailTestAddr.value.trim())
  emailSending.value = false
  showToast(res.ok ? 'Email test đã được gửi tới ' + emailTestAddr.value + '!' : (res.message || 'Gửi thất bại.'), res.ok ? 'ok' : 'err')
}

// ── Branch section ──
const branchModal = reactive({ open: false, editing: false, editId: 0, name: '' })
const branchNameError = ref('')

function openBranchCreate() {
  branchNameError.value = ''
  Object.assign(branchModal, { open: true, editing: false, editId: 0, name: '' })
}
function openBranchEdit(r: BranchItem) {
  branchNameError.value = ''
  Object.assign(branchModal, { open: true, editing: true, editId: r.id, name: r.name })
}
async function saveBranch() {
  if (!branchModal.name.trim()) {
    branchNameError.value = 'Vui lòng nhập tên chi nhánh.'
    return
  }
  branchNameError.value = ''
  const res = branchModal.editing
    ? await settingsStore.editBranch(branchModal.editId, branchModal.name)
    : await settingsStore.createBranch(branchModal.name)
  showToast(res.ok ? (branchModal.editing ? 'Đã cập nhật chi nhánh.' : 'Đã thêm chi nhánh mới.') : (res.message || 'Thao tác thất bại.'), res.ok ? 'ok' : 'err')
  if (res.ok) branchModal.open = false
}

// ── Leave section ──
// expiration_reset_day_off is 0-indexed on the backend (0=Jan...11=Dec).
const MONTHS_OPT = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }))
const leaveMonth = ref('1')
watch(() => settingsStore.orgSetting, (o) => { if (o) leaveMonth.value = String(o.expiration_reset_day_off + 1) }, { immediate: true })
async function saveLeave() {
  const res = await settingsStore.editLeaveResetMonth(Number(leaveMonth.value))
  showToast(res.ok ? `Đã lưu: ngày phép sẽ reset vào Tháng ${leaveMonth.value} hàng năm.` : (res.message || 'Lưu thất bại.'), res.ok ? 'ok' : 'err')
}

// ── Work hours section ──
const workHours = reactive({ work_start_time: '08:00', lunch_break_start_time: '12:00', lunch_break_end_time: '13:30', work_end_time: '17:30' })
watch(() => settingsStore.orgSetting, (o) => {
  if (!o) return
  workHours.work_start_time = o.work_start_time
  workHours.lunch_break_start_time = o.lunch_break_start_time
  workHours.lunch_break_end_time = o.lunch_break_end_time
  workHours.work_end_time = o.work_end_time
}, { immediate: true })
async function saveWorkHours() {
  const res = await settingsStore.editWorkHours({ ...workHours })
  showToast(res.ok ? 'Đã lưu giờ làm việc chuẩn.' : (res.message || 'Lưu thất bại.'), res.ok ? 'ok' : 'err')
}

// ── Job title section ──
const jobModal = reactive({ open: false, editing: false, editId: 0, name: '' })

function openJobCreate() { Object.assign(jobModal, { open: true, editing: false, editId: 0, name: '' }) }
function openJobEdit(r: JobTitleItem) { Object.assign(jobModal, { open: true, editing: true, editId: r.id, name: r.name }) }
async function saveJob() {
  if (!jobModal.name.trim()) return
  const res = jobModal.editing
    ? await settingsStore.editJobTitle(jobModal.editId, jobModal.name)
    : await settingsStore.createJobTitle(jobModal.name)
  showToast(res.ok ? (jobModal.editing ? 'Đã cập nhật chức danh.' : 'Đã thêm chức danh mới.') : (res.message || 'Thao tác thất bại.'), res.ok ? 'ok' : 'err')
  if (res.ok) jobModal.open = false
}

// ── Technology section ──
// No `category` concept exists on the backend (CreateTechnologyParam only has
// name+priority) — the old category filter/badges were pure UI fiction.
const techModal = reactive({ open: false, editing: false, editId: 0, name: '' })

function openTechCreate() { Object.assign(techModal, { open: true, editing: false, editId: 0, name: '' }) }
function openTechEdit(r: TechItem) { Object.assign(techModal, { open: true, editing: true, editId: r.id, name: r.name }) }
async function saveTech() {
  if (!techModal.name.trim()) return
  const res = techModal.editing
    ? await settingsStore.editTechnology(techModal.editId, techModal.name)
    : await settingsStore.createTechnology(techModal.name)
  showToast(res.ok ? (techModal.editing ? 'Đã cập nhật.' : 'Đã thêm: ' + techModal.name) : (res.message || 'Thao tác thất bại.'), res.ok ? 'ok' : 'err')
  if (res.ok) techModal.open = false
}

// ── Holidays section ──
// Backend list rows format holiday_date "YYYY/MM/DD" (FormatDateDisplay);
// create/edit expect "YYYY-MM-DD" (FormatDateDatabase) — DatePicker's
// v-model already emits the dash format, so no conversion needed there.
const MONTH_VI = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
const thisYear = new Date().getFullYear()
const holidayYear = ref(String(thisYear))
const YEAR_OPTS = [thisYear - 1, thisYear, thisYear + 1, thisYear + 2].map(y => ({ value: String(y), label: String(y) }))
const holidayModal = reactive({ open: false, form: { description: '', holiday_date: '' } })

watch(holidayYear, (y) => settingsStore.fetchHolidays(Number(y)))

const groupedHolidays = computed(() => {
  const g: Record<number, Array<HolidayRow & { day: number }>> = {}
  for (const h of settingsStore.holidays) {
    const [, mm, dd] = h.holiday_date.split('/')
    const m = parseInt(mm ?? '1')
    if (!g[m]) g[m] = []
    g[m].push({ ...h, day: parseInt(dd ?? '1') })
  }
  return Object.entries(g).sort((a, b) => Number(a[0]) - Number(b[0]))
})

async function addHoliday() {
  if (!holidayModal.form.holiday_date) return showToast('Vui lòng chọn ngày.', 'err')
  const res = await settingsStore.createHoliday(holidayModal.form, Number(holidayYear.value))
  showToast(res.ok ? 'Đã thêm ngày nghỉ lễ.' : (res.message || 'Thêm thất bại.'), res.ok ? 'ok' : 'err')
  if (res.ok) {
    Object.assign(holidayModal.form, { description: '', holiday_date: '' })
    holidayModal.open = false
  }
}

async function deleteHolidayItem(h: HolidayRow) {
  const res = await settingsStore.deleteHoliday(h.id, Number(holidayYear.value))
  showToast(res.ok ? 'Đã xoá ngày nghỉ lễ.' : (res.message || 'Xoá thất bại.'), res.ok ? 'ok' : 'err')
}

// ── Overtime settings ──
// Only the 3 salary-weight multipliers exist on the backend — max_day/
// max_month/req_approval have no server-side counterpart and were removed.
const otWeights = reactive({ normal_day_weight: 1, weekend_weight: 1, holiday_weight: 1 })
watch(() => settingsStore.overtimeWeight, (w) => {
  if (w) Object.assign(otWeights, { normal_day_weight: w.normal_day_weight, weekend_weight: w.weekend_weight, holiday_weight: w.holiday_weight })
}, { immediate: true })
async function saveOT() {
  const res = await settingsStore.saveOvertimeWeight({ ...otWeights })
  showToast(res.ok ? 'Đã lưu cài đặt tăng ca.' : (res.message || 'Lưu thất bại.'), res.ok ? 'ok' : 'err')
}

// ── Permission section ──
// Module id→icon is a display-only guess (module names are English, backend-
// controlled: "Base HRM"/"Base Goal"/"Base Work"/"Base E-Hiring"/"Base Request").
const MODULE_ICONS: Record<number, unknown> = { 1: UserPlus, 2: Check, 3: Briefcase, 4: FileText, 5: Timer }
function fnsFor(moduleId: number): PermissionFunction[] {
  return settingsStore.userPermissions[moduleId] ?? []
}

const permQuery = ref('')
watch(permQuery, () => settingsStore.fetchPermissionUsers(permQuery.value))

const permSelectedId = ref<number | null>(null)
async function selectPermUser(id: number) {
  permSelectedId.value = id
  await settingsStore.fetchUserPermissions(id)
}
watch(() => settingsStore.permUsers, (list) => {
  if (permSelectedId.value === null && list.length > 0) selectPermUser(list[0]!.id)
}, { immediate: true })

const permSelected = computed(() => settingsStore.permUsers.find((u: PermissionUserRow) => u.id === permSelectedId.value) ?? null)
const totalFunctions = computed(() => Object.values(settingsStore.userPermissions).reduce((a: number, fns: PermissionFunction[]) => a + fns.length, 0))
const grantedCount = computed(() => Object.values(settingsStore.userPermissions).reduce((a: number, fns: PermissionFunction[]) => a + fns.filter((f: PermissionFunction) => f.status).length, 0))

const permSavingKey = ref('')
async function togglePermFn(fn: PermissionFunction) {
  if (permSelectedId.value === null) return
  const key = String(fn.function_id)
  permSavingKey.value = key
  const newStatus = !fn.status
  const res = await settingsStore.editPermission(permSelectedId.value, fn.function_id, newStatus)
  if (res.ok) fn.status = newStatus
  else showToast(res.message || 'Cập nhật quyền thất bại.', 'err')
  permSavingKey.value = ''
}

// No bulk endpoint on the backend — "select all" fires one edit-permission
// call per function that needs to change.
const permSavingGroup = ref<number | null>(null)
async function toggleModuleAll(moduleId: number, checked: boolean) {
  if (permSelectedId.value === null) return
  const fns: PermissionFunction[] = settingsStore.userPermissions[moduleId] ?? []
  const targets = fns.filter((f: PermissionFunction) => f.status !== checked)
  if (targets.length === 0) return
  permSavingGroup.value = moduleId
  await Promise.all(targets.map(async (f: PermissionFunction) => {
    const res = await settingsStore.editPermission(permSelectedId.value!, f.function_id, checked)
    if (res.ok) f.status = checked
  }))
  permSavingGroup.value = null
}
</script>

<template>
<div>
  <PageHeader eyebrow="Cài đặt hệ thống"/>

  <div class="flex gap-6 rise" style="animation-delay: 60ms">
    <!-- Left nav -->
    <aside class="w-[196px] shrink-0" data-test="settings-nav">
      <nav class="card-surface overflow-hidden sticky top-6">
        <div v-for="group in SETTINGS_NAV" :key="group.group">
          <div class="px-4 pt-4 pb-1 text-[10px] font-semibold tracking-[0.13em] uppercase text-muted-foreground/65 font-heading">
            {{ group.group }}
          </div>
          <button
            v-for="item in group.items" :key="item.key"
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors"
            :class="activeSection === item.key ? 'text-primary bg-primary/5' : 'text-foreground/70 hover:text-foreground hover:bg-muted/40'"
            :style="activeSection === item.key ? { boxShadow: 'inset 3px 0 0 hsl(var(--primary))' } : {}"
            @click="activeSection = item.key"
          >
            <component :is="item.icon" :size="14" :class="activeSection === item.key ? 'text-primary' : 'text-muted-foreground/70'" />
            <span>{{ item.label }}</span>
          </button>
        </div>
        <div class="h-4" />
      </nav>
    </aside>

    <!-- Content area -->
    <div class="flex-1 min-w-0">

      <ErrorBanner
        v-if="settingsStore.error"
        :message="settingsStore.error"
        class="mb-4"
        @retry="settingsStore.loadAll()"
      />

      <!-- ═══ Email org ═══ -->
      <div v-if="activeSection === 'email'">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="font-heading font-bold text-[20px] text-foreground leading-tight">Email tổ chức</h2>
            <p class="text-[13px] text-muted-foreground mt-1 max-w-xl">Địa chỉ email hệ thống dùng để gửi thông báo tự động cho nhân viên.</p>
          </div>
        </div>
        <div class="card-surface p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Email hệ thống</label>
            <div class="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-[13px] text-foreground/80 flex items-center font-mono">
              {{ settingsStore.orgSetting?.email || '—' }}
            </div>
            <p class="text-[11.5px] text-muted-foreground/70">Địa chỉ này do hệ thống quản lý và không thể đổi từ giao diện này.</p>
          </div>
          <div class="space-y-1.5 pt-2 border-t border-border/60">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Gửi email test</label>
            <input v-model="emailTestAddr" type="email" placeholder="you@company.com"
              class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/50" />
            <p class="text-[11.5px] text-muted-foreground/70">Gửi một email thử để kiểm tra cấu hình email tổ chức hiện tại.</p>
          </div>
          <div class="pt-5 border-t border-border/60 flex items-center gap-2">
            <Btn variant="primary" size="sm" @click="sendEmailTest">{{ emailSending ? 'Đang gửi…' : 'Gửi email test' }}</Btn>
          </div>
        </div>
      </div>

      <!-- ═══ Branch ═══ -->
      <div v-else-if="activeSection === 'branch'">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="font-heading font-bold text-[20px] text-foreground leading-tight">Chi nhánh</h2>
            <p class="text-[13px] text-muted-foreground mt-1">Quản lý các chi nhánh và văn phòng của tổ chức.</p>
          </div>
          <Btn variant="primary" size="sm" @click="openBranchCreate"><Plus :size="13" />Thêm chi nhánh</Btn>
        </div>
        <div class="card-surface overflow-hidden">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="thead-primary border-b border-border/70">
                <th class="px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Tên chi nhánh</th>
                <th class="px-4 py-2.5 w-28" />
              </tr>
            </thead>
            <tbody>
              <tr v-if="settingsStore.branches.length === 0"><td colspan="2" class="px-4 py-10 text-center text-muted-foreground">Chưa có dữ liệu</td></tr>
              <tr
                v-for="r in settingsStore.branches" :key="r.id"
                class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td class="px-4 py-3 font-medium text-foreground">{{ r.name }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 justify-end">
                    <Btn variant="ghost" size="xs" @click="openBranchEdit(r)">Sửa</Btn>
                    <button
                      class="h-7 px-2.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      @click="openDelModal(r.name, async () => { const res = await settingsStore.deleteBranch(r.id); showToast(res.ok ? 'Đã xoá chi nhánh.' : (res.message || 'Xoá thất bại.'), res.ok ? 'ok' : 'err') })"
                    >Xoá</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══ Leave settings ═══ -->
      <div v-else-if="activeSection === 'leave'">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="font-heading font-bold text-[20px] text-foreground leading-tight">Nghỉ phép</h2>
            <p class="text-[13px] text-muted-foreground mt-1 max-w-xl">Thiết lập thời điểm hết hạn và reset số ngày phép năm cho toàn tổ chức.</p>
          </div>
        </div>
        <div class="card-surface p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Tháng reset ngày phép <span class="text-red-400">*</span></label>
            <Select v-model="leaveMonth" :options="MONTHS_OPT" style="width: 100%" />
            <p class="text-[11.5px] text-muted-foreground/70">Vào đầu tháng được chọn, số ngày phép chưa dùng sẽ hết hạn và quota năm mới được cấp lại.</p>
          </div>
          <div class="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
            <Info :size="13" class="text-primary shrink-0 mt-0.5" />
            <p class="text-[12px] text-foreground/75 leading-relaxed">
              Chu kỳ phép hiện tại: <strong class="text-foreground">01/{{ String(leaveMonth).padStart(2, '0') }}</strong> năm nay
              → <strong class="text-foreground">cuối tháng {{ leaveMonth === '1' ? '12' : Number(leaveMonth) - 1 }}</strong> năm sau.
            </p>
          </div>
          <div class="pt-5 border-t border-border/60">
            <Btn variant="primary" size="sm" @click="saveLeave">Lưu cài đặt</Btn>
          </div>
        </div>
      </div>

      <!-- ═══ Work hours settings ═══ -->
      <div v-else-if="activeSection === 'work-hours'">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="font-heading font-bold text-[20px] text-foreground leading-tight">Giờ làm việc</h2>
            <p class="text-[13px] text-muted-foreground mt-1 max-w-xl">Thiết lập giờ làm việc chuẩn áp dụng cho toàn tổ chức, dùng để tính chấm công đúng giờ / muộn / thiếu công.</p>
          </div>
        </div>
        <div class="card-surface p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Giờ vào <span class="text-red-400">*</span></label>
            <TimePicker v-model="workHours.work_start_time" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Nghỉ trưa từ <span class="text-red-400">*</span></label>
              <TimePicker v-model="workHours.lunch_break_start_time" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Đến <span class="text-red-400">*</span></label>
              <TimePicker v-model="workHours.lunch_break_end_time" />
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Giờ ra <span class="text-red-400">*</span></label>
            <TimePicker v-model="workHours.work_end_time" />
          </div>
          <div class="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
            <Info :size="13" class="text-primary shrink-0 mt-0.5" />
            <p class="text-[12px] text-foreground/75 leading-relaxed">
              Quản lý có thể điều chỉnh giờ làm việc riêng cho từng nhân viên tại trang hồ sơ nhân viên nếu cần.
            </p>
          </div>
          <div class="pt-5 border-t border-border/60">
            <Btn variant="primary" size="sm" @click="saveWorkHours">Lưu cài đặt</Btn>
          </div>
        </div>
      </div>

      <!-- ═══ Job titles ═══ -->
      <div v-else-if="activeSection === 'job-title'">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="font-heading font-bold text-[20px] text-foreground leading-tight">Chức danh</h2>
            <p class="text-[13px] text-muted-foreground mt-1">Danh sách chức danh được sử dụng trong hồ sơ nhân viên và hợp đồng lao động.</p>
          </div>
          <Btn variant="primary" size="sm" @click="openJobCreate"><Plus :size="13" />Thêm chức danh</Btn>
        </div>
        <div class="card-surface overflow-hidden">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="thead-primary border-b border-border/70">
                <th class="px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Tên chức danh</th>
                <th class="px-4 py-2.5 w-28" />
              </tr>
            </thead>
            <tbody>
              <tr v-if="settingsStore.jobTitles.length === 0"><td colspan="2" class="px-4 py-10 text-center text-muted-foreground">Chưa có dữ liệu</td></tr>
              <tr
                v-for="r in settingsStore.jobTitles" :key="r.id"
                class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td class="px-4 py-3 font-medium text-foreground">{{ r.name }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 justify-end">
                    <Btn variant="ghost" size="xs" @click="openJobEdit(r)">Sửa</Btn>
                    <button
                      class="h-7 px-2.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      @click="openDelModal(r.name, async () => { const res = await settingsStore.deleteJobTitle(r.id); showToast(res.ok ? 'Đã xoá chức danh.' : (res.message || 'Xoá thất bại.'), res.ok ? 'ok' : 'err') })"
                    >Xoá</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══ Technology ═══ -->
      <div v-else-if="activeSection === 'technology'">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="font-heading font-bold text-[20px] text-foreground leading-tight">Công nghệ & Kỹ năng</h2>
            <p class="text-[13px] text-muted-foreground mt-1">Danh mục công nghệ và kỹ năng dùng trong hồ sơ nhân viên và quản lý tuyển dụng.</p>
          </div>
          <Btn variant="primary" size="sm" @click="openTechCreate"><Plus :size="13" />Thêm</Btn>
        </div>
        <div class="card-surface overflow-hidden">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="thead-primary border-b border-border/70">
                <th class="px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Tên công nghệ / kỹ năng</th>
                <th class="px-4 py-2.5 w-28" />
              </tr>
            </thead>
            <tbody>
              <tr v-if="settingsStore.technologies.length === 0"><td colspan="2" class="px-4 py-10 text-center text-muted-foreground">Chưa có dữ liệu</td></tr>
              <tr
                v-for="r in settingsStore.technologies" :key="r.id"
                class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td class="px-4 py-3 font-medium text-foreground">{{ r.name }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 justify-end">
                    <Btn variant="ghost" size="xs" @click="openTechEdit(r)">Sửa</Btn>
                    <button
                      class="h-7 px-2.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      @click="openDelModal(r.name, async () => { const res = await settingsStore.deleteTechnology(r.id); showToast(res.ok ? 'Đã xoá.' : (res.message || 'Xoá thất bại.'), res.ok ? 'ok' : 'err') })"
                    >Xoá</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══ Holidays ═══ -->
      <div v-else-if="activeSection === 'holidays'">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="font-heading font-bold text-[20px] text-foreground leading-tight">Ngày nghỉ lễ</h2>
            <p class="text-[13px] text-muted-foreground mt-1">Thiết lập lịch nghỉ lễ hàng năm cho toàn tổ chức.</p>
          </div>
          <div class="flex items-center gap-2">
            <Select v-model="holidayYear" :options="YEAR_OPTS" style="min-width: 100px" />
            <Btn variant="primary" size="sm" @click="holidayModal.open = true"><Plus :size="13" />Thêm ngày lễ</Btn>
          </div>
        </div>
        <div class="mb-3">
          <Badge variant="primary">{{ settingsStore.holidays.length }} ngày nghỉ lễ · {{ holidayYear }}</Badge>
        </div>
        <div v-if="groupedHolidays.length === 0" class="card-surface p-12 text-center text-muted-foreground text-[13px]">
          Chưa có ngày lễ nào cho năm {{ holidayYear }}
        </div>
        <div v-else class="space-y-3">
          <div v-for="([m, hs]) in groupedHolidays" :key="m" class="card-surface overflow-hidden">
            <div class="px-5 py-2.5 bg-muted/30 border-b border-border/60 flex items-center gap-2.5">
              <Calendar :size="12" class="text-muted-foreground" />
              <span class="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">{{ MONTH_VI[parseInt(m)] }} {{ holidayYear }}</span>
              <span class="ml-auto text-[11px] text-muted-foreground/70 tabular-nums">{{ hs.length }} ngày</span>
            </div>
            <div
              v-for="(h, hi) in hs" :key="h.id"
              class="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors"
              :class="hi < hs.length - 1 ? 'border-b border-border/40' : ''"
            >
              <div class="flex items-center gap-4">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold font-heading text-[14px] shrink-0"
                  style="background: hsl(var(--primary-h) var(--primary-s) 57% / 0.1); color: hsl(var(--primary))">
                  {{ h.day }}
                </div>
                <div>
                  <p class="text-[13.5px] font-medium text-foreground">{{ h.description || '(không có mô tả)' }}</p>
                  <p class="text-[11.5px] text-muted-foreground font-mono">{{ h.holiday_date }}</p>
                </div>
              </div>
              <button
                class="h-7 px-2.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                @click="deleteHolidayItem(h)"
              >Xoá</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Overtime settings ═══ -->
      <div v-else-if="activeSection === 'overtime'">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="font-heading font-bold text-[20px] text-foreground leading-tight">Cài đặt tăng ca</h2>
            <p class="text-[13px] text-muted-foreground mt-1 max-w-xl">Thiết lập hệ số lương tăng ca cho từng loại ngày.</p>
          </div>
        </div>
        <div class="card-surface p-6 space-y-6">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3">Hệ số lương tăng ca</p>
            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-1.5">
                <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Ngày thường</label>
                <input v-model.number="otWeights.normal_day_weight" type="number" min="0" step="0.1"
                  class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Cuối tuần</label>
                <input v-model.number="otWeights.weekend_weight" type="number" min="0" step="0.1"
                  class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Ngày lễ</label>
                <input v-model.number="otWeights.holiday_weight" type="number" min="0" step="0.1"
                  class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
              </div>
            </div>
            <p class="text-[11.5px] text-muted-foreground/70 mt-2">Lương tăng ca = lương cơ bản × hệ số × số giờ OT</p>
          </div>

          <div class="border-t border-border/60 pt-4">
            <Btn variant="primary" size="sm" @click="saveOT">Lưu cài đặt</Btn>
          </div>
        </div>
      </div>

      <!-- ═══ Permission matrix ═══ -->
      <div v-else-if="activeSection === 'permission'">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="font-heading font-bold text-[20px] text-foreground leading-tight">Phân quyền người dùng</h2>
            <p class="text-[13px] text-muted-foreground mt-1">Chọn nhân viên và cấp quyền truy cập chi tiết theo từng module chức năng.</p>
          </div>
        </div>

        <div class="flex gap-5 items-start">
          <!-- Left: user list -->
          <div class="w-[280px] shrink-0 card-surface overflow-hidden flex flex-col" style="max-height: 640px">
            <div class="p-3 border-b border-border/70">
              <div class="relative">
                <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input v-model="permQuery" placeholder="Tìm tên / email…"
                  class="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/50" />
                <button v-if="permQuery" class="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                  @click="permQuery = ''"><X :size="11" /></button>
              </div>
              <p class="text-[11px] text-muted-foreground mt-2 tabular-nums px-0.5">{{ settingsStore.permUsers.length }} nhân viên</p>
            </div>
            <div class="overflow-y-auto scrollbar-thin flex-1 p-1.5">
              <div v-if="settingsStore.permUsersLoading" class="py-10 text-center text-muted-foreground text-[12px]">Đang tải…</div>
              <div v-else-if="settingsStore.permUsers.length === 0" class="py-10 text-center text-muted-foreground">
                <Search :size="26" class="mx-auto mb-2 opacity-30" />
                <p class="text-[12px] px-3">Không khớp "<span class="text-foreground font-medium">{{ permQuery }}</span>"</p>
              </div>
              <button
                v-for="m in settingsStore.permUsers" :key="m.id"
                class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors mb-0.5"
                :class="m.id === permSelectedId ? 'bg-primary/10' : 'hover:bg-muted/50'"
                :style="m.id === permSelectedId ? { boxShadow: 'inset 2px 0 0 hsl(var(--primary))' } : {}"
                @click="selectPermUser(m.id)"
              >
                <Avatar :name="`${m.first_name} ${m.last_name}`" :size="32" />
                <div class="min-w-0 flex-1">
                  <p class="text-[13px] font-medium truncate" :class="m.id === permSelectedId ? 'text-primary' : 'text-foreground'">{{ m.first_name }} {{ m.last_name }}</p>
                  <p class="text-[11px] text-muted-foreground font-mono truncate">{{ m.email }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Right: permission matrix -->
          <div class="flex-1 min-w-0">
            <div v-if="!permSelected" class="card-surface py-20 text-center text-muted-foreground">
              <Sliders :size="34" class="mx-auto mb-2 opacity-30" />
              <p class="text-[13px]">Chọn một nhân viên để cấu hình quyền</p>
            </div>
            <template v-else>
              <!-- Selected user header -->
              <div class="card-surface p-4 mb-4 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-10">
                <div class="flex items-center gap-3">
                  <Avatar :name="`${permSelected.first_name} ${permSelected.last_name}`" :size="40" />
                  <div>
                    <p class="font-semibold text-[15px] text-foreground">{{ permSelected.first_name }} {{ permSelected.last_name }}</p>
                    <p class="text-[12px] text-muted-foreground font-mono">{{ permSelected.email }}</p>
                  </div>
                </div>
                <Badge variant="primary">{{ grantedCount }}/{{ totalFunctions }} quyền</Badge>
              </div>

              <div v-if="settingsStore.userPermissionsLoading" class="card-surface py-16 text-center text-muted-foreground text-[13px]">Đang tải quyền…</div>

              <!-- Permission groups -->
              <div v-else class="space-y-3">
                <div v-for="mod in settingsStore.modules" :key="mod.id" class="card-surface overflow-hidden">
                  <div class="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/60">
                    <div class="flex items-center gap-2.5">
                      <component :is="MODULE_ICONS[mod.id] ?? Sliders" :size="14" class="text-muted-foreground" />
                      <span class="text-[12px] font-semibold uppercase tracking-wide text-foreground">{{ mod.name }}</span>
                      <span class="text-[11px] font-mono text-muted-foreground tabular-nums">
                        {{ fnsFor(mod.id).filter((f: PermissionFunction) => f.status).length }}/{{ fnsFor(mod.id).length }}
                      </span>
                      <span v-if="permSavingGroup === mod.id" class="text-[10.5px] text-muted-foreground">đang lưu…</span>
                    </div>
                    <label class="flex items-center gap-1.5 cursor-pointer select-none text-[11.5px] text-muted-foreground hover:text-foreground transition-colors">
                      <input
                        type="checkbox"
                        :checked="fnsFor(mod.id).length > 0 && fnsFor(mod.id).every((f: PermissionFunction) => f.status)"
                        v-indeterminate="fnsFor(mod.id).some((f: PermissionFunction) => f.status) && !fnsFor(mod.id).every((f: PermissionFunction) => f.status)"
                        class="h-3.5 w-3.5 rounded accent-primary cursor-pointer"
                        @change="(e: Event) => toggleModuleAll(mod.id, (e.target as HTMLInputElement).checked)"
                      />
                      Chọn tất cả
                    </label>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-0.5 p-3">
                    <label
                      v-for="fn in fnsFor(mod.id)" :key="fn.function_id"
                      class="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer select-none group hover:bg-muted/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        :checked="fn.status"
                        :disabled="permSavingKey === String(fn.function_id)"
                        class="h-3.5 w-3.5 rounded accent-primary cursor-pointer shrink-0"
                        @change="togglePermFn(fn)"
                      />
                      <span class="text-[12.5px] transition-colors"
                        :class="fn.status ? 'text-foreground' : 'text-foreground/65 group-hover:text-foreground'">
                        {{ fn.name }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

    </div><!-- end content -->
  </div>

  <!-- ── Branch modal ── -->
  <Teleport to="body">
    <div v-if="branchModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="branchModal.open = false" />
      <div class="relative card-surface rise w-full overflow-hidden" style="max-width: 440px; border-radius: 18px; animation-duration: .18s">
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 class="font-heading font-bold text-[15px] text-foreground">{{ branchModal.editing ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh' }}</h3>
          <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="branchModal.open = false"><X :size="14" /></button>
        </div>
        <div class="p-5">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Tên chi nhánh <span class="text-red-400">*</span></label>
            <input v-model="branchModal.name" placeholder="VD: Hà Nội, TP.HCM…" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
            <p v-if="branchNameError" class="text-[11.5px] text-red-500">{{ branchNameError }}</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-border/70 bg-muted/20">
          <Btn variant="outline" size="sm" @click="branchModal.open = false">Huỷ</Btn>
          <Btn variant="primary" size="sm" @click="saveBranch">Lưu</Btn>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── Job title modal ── -->
  <Teleport to="body">
    <div v-if="jobModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="jobModal.open = false" />
      <div class="relative card-surface rise w-full overflow-hidden" style="max-width: 440px; border-radius: 18px; animation-duration: .18s">
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 class="font-heading font-bold text-[15px] text-foreground">{{ jobModal.editing ? 'Chỉnh sửa chức danh' : 'Thêm chức danh' }}</h3>
          <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="jobModal.open = false"><X :size="14" /></button>
        </div>
        <div class="p-5">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Tên chức danh <span class="text-red-400">*</span></label>
            <input v-model="jobModal.name" placeholder="VD: Senior Developer" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-border/70 bg-muted/20">
          <Btn variant="outline" size="sm" @click="jobModal.open = false">Huỷ</Btn>
          <Btn variant="primary" size="sm" @click="saveJob">Lưu</Btn>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── Technology modal ── -->
  <Teleport to="body">
    <div v-if="techModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="techModal.open = false" />
      <div class="relative card-surface rise w-full overflow-hidden" style="max-width: 440px; border-radius: 18px; animation-duration: .18s">
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 class="font-heading font-bold text-[15px] text-foreground">{{ techModal.editing ? 'Sửa công nghệ' : 'Thêm công nghệ / kỹ năng' }}</h3>
          <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="techModal.open = false"><X :size="14" /></button>
        </div>
        <div class="p-5">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Tên <span class="text-red-400">*</span></label>
            <input v-model="techModal.name" placeholder="VD: ReactJS, Python, AWS…" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-border/70 bg-muted/20">
          <Btn variant="outline" size="sm" @click="techModal.open = false">Huỷ</Btn>
          <Btn variant="primary" size="sm" @click="saveTech">Lưu</Btn>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── Holiday modal ── -->
  <Teleport to="body">
    <div v-if="holidayModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="holidayModal.open = false" />
      <div class="relative card-surface rise w-full overflow-hidden" style="max-width: 440px; border-radius: 18px; animation-duration: .18s">
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 class="font-heading font-bold text-[15px] text-foreground">Thêm ngày lễ</h3>
          <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="holidayModal.open = false"><X :size="14" /></button>
        </div>
        <div class="p-5 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Ngày <span class="text-red-400">*</span></label>
            <DatePicker v-model="holidayModal.form.holiday_date" />
          </div>
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Mô tả</label>
            <input v-model="holidayModal.form.description" placeholder="VD: Tết Nguyên Đán" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-border/70 bg-muted/20">
          <Btn variant="outline" size="sm" @click="holidayModal.open = false">Huỷ</Btn>
          <Btn variant="primary" size="sm" @click="addHoliday">Thêm</Btn>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── Delete confirm modal ── -->
  <Teleport to="body">
    <div v-if="delModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="delModal.open = false" />
      <div class="relative card-surface rise w-full overflow-hidden" style="max-width: 440px; border-radius: 18px; animation-duration: .18s">
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 class="font-heading font-bold text-[15px] text-foreground">Xác nhận xoá</h3>
          <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="delModal.open = false"><X :size="14" /></button>
        </div>
        <div class="p-5">
          <p class="text-[13.5px] text-foreground/80">Xoá <strong class="text-foreground">{{ delModal.label }}</strong>?<br />
          <span class="text-[12.5px] text-muted-foreground">Hành động này không thể hoàn tác.</span></p>
        </div>
        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-border/70 bg-muted/20">
          <Btn variant="outline" size="sm" @click="delModal.open = false">Huỷ</Btn>
          <Btn variant="danger" size="sm" @click="delModal.onConfirm(); delModal.open = false">Xoá</Btn>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Toast -->
  <Teleport to="body">
    <div v-if="toast.msg"
      class="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-white shadow-lg rise"
      :style="{ background: toast.type === 'ok' ? 'hsl(160 60% 40%)' : 'hsl(0 70% 52%)', animationDuration: '.2s' }"
    >
      <Check v-if="toast.type === 'ok'" :size="13" />
      <X v-else :size="13" />
      {{ toast.msg }}
    </div>
  </Teleport>
</div>
</template>
