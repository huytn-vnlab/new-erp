<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  Mail, Building, Calendar, Briefcase, Globe, Timer, Sliders,
  Plus, X, Check, Info, Search, UserPlus, FileText,
} from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import Select from '~/components/base/Select.vue'

import { useSettingsStore } from '~/stores/settings'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const settingsStore = useSettingsStore()
onMounted(() => settingsStore.loadAll())

type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

// ── Custom directive: indeterminate checkbox ──
const vIndeterminate = {
  mounted: (el: HTMLInputElement, b: { value: boolean }) => { el.indeterminate = b.value },
  updated: (el: HTMLInputElement, b: { value: boolean }) => { el.indeterminate = b.value },
}

// ── Nav config ──
type SectionKey = 'email' | 'branch' | 'leave' | 'job-title' | 'technology' | 'holidays' | 'overtime' | 'permission'

const SETTINGS_NAV = [
  { group: 'Tổ chức', items: [
    { key: 'email' as SectionKey,      label: 'Email tổ chức', icon: Mail },
    { key: 'branch' as SectionKey,     label: 'Chi nhánh',     icon: Building },
    { key: 'leave' as SectionKey,      label: 'Nghỉ phép',     icon: Calendar },
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

// ── Email section ──
const emailAddr = ref('noreply@vnlab.com.vn')
const emailTesting = ref(false)
const emailValid = computed(() => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailAddr.value.trim()))

function emailSave() {
  if (!emailValid.value) return showToast('Email không hợp lệ.', 'err')
  showToast('Đã lưu email tổ chức thành công.')
}
function emailTest() {
  if (!emailValid.value) return showToast('Email không hợp lệ.', 'err')
  emailTesting.value = true
  setTimeout(() => { emailTesting.value = false; showToast('Email test đã được gửi tới ' + emailAddr.value + '!') }, 1400)
}

// ── Branch section ──
type BranchRow = { id: number; name: string; address: string; phone: string }
const branches = ref<BranchRow[]>([
  { id: 1, name: 'Hà Nội (Trụ sở)',  address: '123 Cầu Giấy, Hà Nội',        phone: '024 3789 0000' },
  { id: 2, name: 'Đà Nẵng',          address: '45 Nguyễn Văn Linh, Đà Nẵng', phone: '0236 378 9111' },
  { id: 3, name: 'Hồ Chí Minh',      address: '88 Điện Biên Phủ, Q.1',        phone: '028 3789 2222' },
  { id: 4, name: 'Osaka (Japan)',     address: '2-3-4 Namba, Osaka-shi',        phone: '+81 6 1234 5678' },
])
const branchModal = reactive({ open: false, editing: false, editId: 0, form: { name: '', address: '', phone: '' } })
const delModal = reactive<{ open: boolean; label: string; onConfirm: () => void }>({ open: false, label: '', onConfirm: () => {} })

function openDelModal(label: string, onConfirm: () => void) {
  Object.assign(delModal, { open: true, label, onConfirm })
}

function openBranchCreate() {
  Object.assign(branchModal, { open: true, editing: false, editId: 0, form: { name: '', address: '', phone: '' } })
}
function openBranchEdit(r: BranchRow) {
  Object.assign(branchModal, { open: true, editing: true, editId: r.id, form: { name: r.name, address: r.address, phone: r.phone } })
}
async function saveBranch() {
  if (!branchModal.form.name.trim()) return
  if (branchModal.editing) {
    await settingsStore.editBranch(branchModal.editId, branchModal.form.name)
    const idx = branches.value.findIndex(b => b.id === branchModal.editId)
    if (idx >= 0) branches.value[idx] = { ...branches.value[idx]!, ...branchModal.form }
    showToast('Đã cập nhật chi nhánh.')
  } else {
    await settingsStore.createBranch(branchModal.form.name)
    branches.value.push({ id: Date.now(), name: branchModal.form.name, address: branchModal.form.address, phone: branchModal.form.phone })
    showToast('Đã thêm chi nhánh mới.')
  }
  branchModal.open = false
}

// ── Leave section ──
const leaveMonth = ref('1')
const MONTHS_OPT = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }))
function saveLeave() {
  showToast(`Đã lưu: ngày phép sẽ reset vào Tháng ${leaveMonth.value} hàng năm.`)
}

// ── Job title section ──
type JobRow = { id: number; name: string }
const jobTitles = ref<JobRow[]>([
  { id: 1, name: 'Software Engineer' }, { id: 2, name: 'Senior Software Engineer' },
  { id: 3, name: 'Tech Lead' }, { id: 4, name: 'Product Manager' },
  { id: 5, name: 'UI/UX Designer' }, { id: 6, name: 'QA Engineer' },
  { id: 7, name: 'DevOps Engineer' }, { id: 8, name: 'Business Analyst' },
  { id: 9, name: 'Scrum Master' }, { id: 10, name: 'BrSE' },
])
const jobModal = reactive({ open: false, editing: false, editId: 0, name: '' })

function openJobCreate() { Object.assign(jobModal, { open: true, editing: false, editId: 0, name: '' }) }
function openJobEdit(r: JobRow) { Object.assign(jobModal, { open: true, editing: true, editId: r.id, name: r.name }) }
async function saveJob() {
  if (!jobModal.name.trim()) return
  if (jobModal.editing) {
    await settingsStore.editJobTitle(jobModal.editId, jobModal.name)
    const idx = jobTitles.value.findIndex(j => j.id === jobModal.editId)
    if (idx >= 0) jobTitles.value[idx]!.name = jobModal.name
    showToast('Đã cập nhật chức danh.')
  } else {
    await settingsStore.createJobTitle(jobModal.name)
    jobTitles.value.push({ id: Date.now(), name: jobModal.name })
    showToast('Đã thêm chức danh mới.')
  }
  jobModal.open = false
}

// ── Technology section ──
type TechRow = { id: number; name: string; category: string }
const CATS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'frontend', label: 'Frontend' }, { value: 'backend', label: 'Backend' },
  { value: 'devops', label: 'DevOps' }, { value: 'mobile', label: 'Mobile' },
  { value: 'database', label: 'Database' }, { value: 'soft_skill', label: 'Kỹ năng mềm' },
  { value: 'other', label: 'Khác' },
]
const CAT_OPTS = CATS.filter(c => c.value !== 'all')
const CAT_BADGE: Record<string, BadgeVariant> = {
  frontend: 'primary', backend: 'violet', devops: 'amber',
  mobile: 'green', database: 'sky', soft_skill: 'gray', other: 'gray',
}
const technologies = ref<TechRow[]>([
  { id: 1, name: 'ReactJS', category: 'frontend' }, { id: 2, name: 'VueJS', category: 'frontend' },
  { id: 3, name: 'TypeScript', category: 'frontend' }, { id: 4, name: 'Node.js', category: 'backend' },
  { id: 5, name: 'Python', category: 'backend' }, { id: 6, name: 'Go', category: 'backend' },
  { id: 7, name: 'PostgreSQL', category: 'database' }, { id: 8, name: 'MongoDB', category: 'database' },
  { id: 9, name: 'Docker', category: 'devops' }, { id: 10, name: 'Kubernetes', category: 'devops' },
  { id: 11, name: 'AWS', category: 'devops' }, { id: 12, name: 'React Native', category: 'mobile' },
  { id: 13, name: 'Agile / Scrum', category: 'soft_skill' }, { id: 14, name: 'Redis', category: 'database' },
])
const techFilter = ref('all')
const techModal = reactive({ open: false, editing: false, editId: 0, form: { name: '', category: 'frontend' } })
const techFiltered = computed(() =>
  techFilter.value === 'all' ? technologies.value : technologies.value.filter(t => t.category === techFilter.value)
)
function catLabel(c: string) { return CATS.find(o => o.value === c)?.label ?? c }

function openTechCreate() { Object.assign(techModal, { open: true, editing: false, editId: 0, form: { name: '', category: 'frontend' } }) }
function openTechEdit(r: TechRow) { Object.assign(techModal, { open: true, editing: true, editId: r.id, form: { name: r.name, category: r.category } }) }
async function saveTech() {
  if (!techModal.form.name.trim()) return
  if (techModal.editing) {
    await settingsStore.editTechnology(techModal.editId, techModal.form)
    const idx = technologies.value.findIndex(t => t.id === techModal.editId)
    if (idx >= 0) Object.assign(technologies.value[idx]!, techModal.form)
    showToast('Đã cập nhật công nghệ.')
  } else {
    await settingsStore.createTechnology(techModal.form)
    technologies.value.push({ id: Date.now(), ...techModal.form })
    showToast('Đã thêm: ' + techModal.form.name)
  }
  techModal.open = false
}

// ── Holidays section ──
type HolidayRow = { id: number; date: string; name: string }
const MONTH_VI = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
const holidays = ref<HolidayRow[]>([
  { id: 1, date: '2026-01-01', name: 'Tết Dương Lịch' },
  { id: 2, date: '2026-02-17', name: 'Tết Nguyên Đán (nghỉ bù)' }, { id: 3, date: '2026-02-18', name: 'Mùng 1 Tết' },
  { id: 4, date: '2026-02-19', name: 'Mùng 2 Tết' }, { id: 5, date: '2026-02-20', name: 'Mùng 3 Tết' },
  { id: 6, date: '2026-02-21', name: 'Mùng 4 Tết' }, { id: 7, date: '2026-02-22', name: 'Mùng 5 Tết' },
  { id: 8, date: '2026-04-07', name: 'Giỗ Tổ Hùng Vương' },
  { id: 9, date: '2026-04-30', name: 'Giải phóng miền Nam' }, { id: 10, date: '2026-05-01', name: 'Quốc tế Lao động' },
  { id: 11, date: '2026-09-02', name: 'Quốc khánh' }, { id: 12, date: '2026-09-03', name: 'Quốc khánh (nghỉ bù)' },
])
const holidayYear = ref('2026')
const YEAR_OPTS = ['2025', '2026', '2027', '2028'].map(y => ({ value: y, label: y }))
const holidayModal = reactive({ open: false, form: { name: '', date: '' } })

const yearHolidays = computed(() => holidays.value.filter(h => h.date.startsWith(holidayYear.value)))
const groupedHolidays = computed(() => {
  const g: Record<number, Array<HolidayRow & { day: number }>> = {}
  for (const h of yearHolidays.value) {
    const m = parseInt(h.date.split('-')[1] ?? '1')
    if (!g[m]) g[m] = []
    g[m].push({ ...h, day: parseInt(h.date.split('-')[2] ?? '1') })
  }
  return Object.entries(g).sort((a, b) => Number(a[0]) - Number(b[0]))
})

async function addHoliday() {
  if (!holidayModal.form.name || !holidayModal.form.date) return
  await settingsStore.createHoliday(holidayModal.form)
  holidays.value.push({ id: Date.now(), ...holidayModal.form })
  showToast('Đã thêm: ' + holidayModal.form.name)
  Object.assign(holidayModal.form, { name: '', date: '' })
  holidayModal.open = false
}

// Sync local refs from store when data loads
watch(() => settingsStore.branches, (data) => {
  if (data.length > 0) branches.value = data.map(b => ({ id: b.id, name: b.name, address: '', phone: '' }))
}, { immediate: true })
watch(() => settingsStore.jobTitles, (data) => {
  if (data.length > 0) jobTitles.value = data.map(j => ({ id: j.id, name: j.name }))
}, { immediate: true })
watch(() => settingsStore.technologies, (data) => {
  if (data.length > 0) technologies.value = data.map(t => ({ id: t.id, name: t.name, category: t.category ?? 'other' }))
}, { immediate: true })
watch(() => settingsStore.holidays, (data) => {
  if (data.length > 0) holidays.value = data.map(h => ({ id: h.id, name: h.name, date: h.date }))
}, { immediate: true })

// ── Overtime section ──
const otSettings = reactive({ max_day: 4, max_month: 40, mult_wd: 1.5, mult_we: 2.0, mult_hol: 3.0, req_approval: true })
function saveOT() { showToast('Đã lưu cài đặt tăng ca.') }

// ── Permission section ──
const PERM_GROUPS = [
  { module: 'Nhân sự', icon: UserPlus, items: [
    { key: 'member_list', label: 'Danh sách thành viên' },
    { key: 'member_edit_profile', label: 'Sửa hồ sơ' },
    { key: 'member_profile', label: 'Hồ sơ thành viên' },
    { key: 'member_manage_request', label: 'Quản lí yêu cầu' },
    { key: 'member_edit_account', label: 'Sửa tài khoản' },
  ]},
  { module: 'Nghỉ phép', icon: Calendar, items: [
    { key: 'leave_create', label: 'Tạo yêu cầu xin nghỉ' },
    { key: 'leave_add_history', label: 'Lịch sử thêm ngày phép' },
    { key: 'leave_manage', label: 'Quản lý nghỉ phép' },
    { key: 'leave_info', label: 'Thông tin nghỉ phép' },
    { key: 'leave_manage_request', label: 'Quản lí yêu cầu xin nghỉ' },
    { key: 'leave_create_other', label: 'Tạo yêu cầu xin nghỉ cho người khác' },
  ]},
  { module: 'Tài sản', icon: Briefcase, items: [
    { key: 'asset_history', label: 'Lịch sử sử dụng tài sản' },
    { key: 'asset_list', label: 'Danh sách tài sản' },
    { key: 'asset_borrow', label: 'Yêu cầu mượn tài sản' },
    { key: 'asset_add', label: 'Thêm tài sản mới' },
  ]},
  { module: 'Hợp đồng', icon: FileText, items: [
    { key: 'contract_labor', label: 'Hợp đồng lao động' },
    { key: 'contract_view', label: 'Xem hợp đồng lao động của nhân viên' },
    { key: 'contract_type', label: 'Loại hợp đồng lao động' },
  ]},
  { module: 'Chấm công', icon: Timer, items: [
    { key: 'timekeeping_manage', label: 'Quản lí chấm công' },
    { key: 'timekeeping', label: 'Chấm công' },
  ]},
]

const TOTAL_PERMS = PERM_GROUPS.reduce((a, g) => a + g.items.length, 0)

type PermMember = { id: number; name: string; email: string; role: string; perms: string[] }
const permMembers = ref<PermMember[]>([
  { id: 1, name: 'Nguyễn Văn An',  email: 'an.nv@vnlab.com.vn',     role: 'Tech Lead',       perms: ['member_list','member_profile','leave_create','leave_info','timekeeping','asset_list','asset_borrow'] },
  { id: 2, name: 'Trần Thị Bích',  email: 'bich.tt@vnlab.com.vn',   role: 'HR Manager',      perms: ['member_list','member_edit_profile','member_profile','member_manage_request','member_edit_account','leave_create','leave_add_history','leave_manage','leave_info','leave_manage_request','leave_create_other','timekeeping','timekeeping_manage'] },
  { id: 3, name: 'Lê Minh Tuấn',   email: 'tuan.lm@vnlab.com.vn',   role: 'Senior Engineer', perms: ['member_list','member_profile','leave_create','leave_info','timekeeping','contract_labor','contract_view','asset_list'] },
  { id: 4, name: 'Phạm Thu Hương', email: 'huong.pt@vnlab.com.vn',  role: 'Engineer',        perms: ['member_profile','leave_create','leave_info','timekeeping'] },
  { id: 5, name: 'Hoàng Đức Long', email: 'long.hd@vnlab.com.vn',   role: 'PM',              perms: ['member_list','member_profile','member_manage_request','leave_create','leave_info','leave_manage_request','leave_create_other','timekeeping','timekeeping_manage','asset_list','asset_borrow','asset_add'] },
  { id: 6, name: 'Vũ Thị Lan',     email: 'lan.vt@vnlab.com.vn',    role: 'Engineer',        perms: ['member_profile','leave_create','leave_info','timekeeping'] },
  { id: 7, name: 'Đỗ Minh Quân',   email: 'quan.dm@vnlab.com.vn',   role: 'Recruiter',       perms: ['member_list','member_profile','leave_create','leave_info','timekeeping'] },
  { id: 8, name: 'Bùi Thanh Sơn',  email: 'son.bt@vnlab.com.vn',    role: 'Asset Manager',   perms: ['member_profile','leave_create','leave_info','timekeeping','asset_history','asset_list','asset_borrow','asset_add','contract_labor','contract_type'] },
  { id: 9, name: 'Ngô Quỳnh Anh',  email: 'anh.nq@vnlab.com.vn',    role: 'Engineer',        perms: ['member_profile','leave_create','leave_info','timekeeping'] },
  { id: 10, name: 'Sample User',   email: 'sample.user@vnlab.com.vn', role: 'Intern',         perms: ['member_profile','leave_create'] },
])
const permSelectedId = ref(1)
const permQuery = ref('')
const permSaved = ref(0)

const permFiltered = computed(() => {
  const q = permQuery.value.trim().toLowerCase()
  return q ? permMembers.value.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)) : permMembers.value
})
const permSelected = computed(() => permMembers.value.find(m => m.id === permSelectedId.value) ?? null)
const permSel = computed(() => permSelected.value!)

function togglePerm(key: string, checked: boolean) {
  const m = permMembers.value.find(m => m.id === permSelectedId.value)
  if (!m) return
  m.perms = checked ? [...m.perms, key] : m.perms.filter(k => k !== key)
}

function toggleGroup(groupKeys: string[], checkAll: boolean) {
  const m = permMembers.value.find(m => m.id === permSelectedId.value)
  if (!m) return
  const without = m.perms.filter(k => !groupKeys.includes(k))
  m.perms = checkAll ? [...without, ...groupKeys] : without
}

function savePerm() {
  if (!permSelected.value) return
  permSaved.value = permSelected.value.id
  setTimeout(() => { permSaved.value = 0 }, 1800)
  showToast(`Đã lưu quyền cho ${permSelected.value.name}.`)
}
</script>

<template>
<div>
  <PageHeader eyebrow="Cài đặt hệ thống" title="Cài đặt hệ thống" />

  <div class="flex gap-6 rise" style="animation-delay: 60ms">
    <!-- Left nav -->
    <aside class="w-[196px] shrink-0">
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

      <!-- ═══ Email org ═══ -->
      <div v-if="activeSection === 'email'">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="font-heading font-bold text-[20px] text-foreground leading-tight">Email tổ chức</h2>
            <p class="text-[13px] text-muted-foreground mt-1 max-w-xl">Địa chỉ email hệ thống dùng để gửi thông báo tự động cho nhân viên.</p>
          </div>
        </div>
        <div class="card-surface p-6 max-w-[520px] space-y-4">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Email gửi <span class="text-red-400">*</span></label>
            <input v-model="emailAddr" type="email" placeholder="noreply@company.com"
              class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/50" />
            <p class="text-[11.5px] text-muted-foreground/70">Hệ thống sẽ dùng địa chỉ này làm người gửi cho mọi email thông báo.</p>
          </div>
          <div class="pt-5 border-t border-border/60 flex items-center gap-2">
            <Btn variant="outline" size="sm" @click="emailTest">{{ emailTesting ? 'Đang gửi…' : 'Gửi email test' }}</Btn>
            <Btn variant="primary" size="sm" @click="emailSave">Lưu cài đặt</Btn>
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
                <th class="px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Địa chỉ</th>
                <th class="px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground w-36">Điện thoại</th>
                <th class="px-4 py-2.5 w-28" />
              </tr>
            </thead>
            <tbody>
              <tr v-if="branches.length === 0"><td colspan="4" class="px-4 py-10 text-center text-muted-foreground">Chưa có dữ liệu</td></tr>
              <tr
                v-for="r in branches" :key="r.id"
                class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td class="px-4 py-3 font-medium text-foreground">{{ r.name }}</td>
                <td class="px-4 py-3 text-muted-foreground">{{ r.address }}</td>
                <td class="px-4 py-3 font-mono text-[12px] text-muted-foreground">{{ r.phone }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 justify-end">
                    <Btn variant="ghost" size="xs" @click="openBranchEdit(r)">Sửa</Btn>
                    <button
                      class="h-7 px-2.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      @click="openDelModal(r.name, () => { branches = branches.filter(b => b.id !== r.id); showToast('Đã xoá chi nhánh.') })"
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
        <div class="card-surface p-6 max-w-[520px] space-y-4">
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
              <tr v-if="jobTitles.length === 0"><td colspan="2" class="px-4 py-10 text-center text-muted-foreground">Chưa có dữ liệu</td></tr>
              <tr
                v-for="r in jobTitles" :key="r.id"
                class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td class="px-4 py-3 font-medium text-foreground">{{ r.name }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 justify-end">
                    <Btn variant="ghost" size="xs" @click="openJobEdit(r)">Sửa</Btn>
                    <button
                      class="h-7 px-2.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      @click="openDelModal(r.name, () => { jobTitles = jobTitles.filter(j => j.id !== r.id); showToast('Đã xoá chức danh.') })"
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
        <div class="flex items-center gap-2 flex-wrap mb-4">
          <button
            v-for="o in CATS" :key="o.value"
            class="h-7 px-3 rounded-full text-[12px] font-medium transition-all"
            :class="techFilter === o.value ? 'text-white' : 'border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'"
            :style="techFilter === o.value ? { background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' } : {}"
            @click="techFilter = o.value"
          >{{ o.label }}</button>
        </div>
        <div class="card-surface overflow-hidden">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="thead-primary border-b border-border/70">
                <th class="px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Tên công nghệ / kỹ năng</th>
                <th class="px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground w-40">Danh mục</th>
                <th class="px-4 py-2.5 w-28" />
              </tr>
            </thead>
            <tbody>
              <tr v-if="techFiltered.length === 0"><td colspan="3" class="px-4 py-10 text-center text-muted-foreground">Chưa có dữ liệu</td></tr>
              <tr
                v-for="r in techFiltered" :key="r.id"
                class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td class="px-4 py-3 font-medium text-foreground">{{ r.name }}</td>
                <td class="px-4 py-3">
                  <Badge :variant="CAT_BADGE[r.category] ?? 'gray'">{{ catLabel(r.category) }}</Badge>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 justify-end">
                    <Btn variant="ghost" size="xs" @click="openTechEdit(r)">Sửa</Btn>
                    <button
                      class="h-7 px-2.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      @click="openDelModal(r.name, () => { technologies = technologies.filter(t => t.id !== r.id); showToast('Đã xoá.') })"
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
          <Badge variant="primary">{{ yearHolidays.length }} ngày nghỉ lễ · {{ holidayYear }}</Badge>
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
                  <p class="text-[13.5px] font-medium text-foreground">{{ h.name }}</p>
                  <p class="text-[11.5px] text-muted-foreground font-mono">{{ h.date }}</p>
                </div>
              </div>
              <button
                class="h-7 px-2.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                @click="holidays = holidays.filter(x => x.id !== h.id); showToast('Đã xoá ' + h.name + '.')"
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
            <p class="text-[13px] text-muted-foreground mt-1 max-w-xl">Thiết lập giới hạn giờ OT và hệ số lương cho từng loại ngày.</p>
          </div>
        </div>
        <div class="card-surface p-6 max-w-[520px] space-y-6">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3">Giới hạn giờ OT</p>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Tối đa / ngày</label>
                <div class="flex items-center gap-2">
                  <input v-model.number="otSettings.max_day" type="number" min="1"
                    class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
                  <span class="text-[12px] text-muted-foreground shrink-0">giờ</span>
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Tối đa / tháng</label>
                <div class="flex items-center gap-2">
                  <input v-model.number="otSettings.max_month" type="number" min="1"
                    class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
                  <span class="text-[12px] text-muted-foreground shrink-0">giờ</span>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-border/60 pt-5">
            <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3">Hệ số lương tăng ca</p>
            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-1.5">
                <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Ngày thường</label>
                <input v-model.number="otSettings.mult_wd" type="number" min="1" step="0.1"
                  class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Cuối tuần</label>
                <input v-model.number="otSettings.mult_we" type="number" min="1" step="0.1"
                  class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Ngày lễ</label>
                <input v-model.number="otSettings.mult_hol" type="number" min="1" step="0.1"
                  class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
              </div>
            </div>
            <p class="text-[11.5px] text-muted-foreground/70 mt-2">Lương tăng ca = lương cơ bản × hệ số × số giờ OT</p>
          </div>

          <div class="border-t border-border/60 pt-5">
            <label class="flex items-start gap-3 cursor-pointer select-none group">
              <input v-model="otSettings.req_approval" type="checkbox"
                class="h-4 w-4 rounded mt-0.5 accent-primary cursor-pointer shrink-0" />
              <div>
                <p class="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">Yêu cầu phê duyệt trước khi ghi nhận OT</p>
                <p class="text-[12px] text-muted-foreground mt-0.5">Nhân viên cần gửi đề xuất và chờ quản lý duyệt trước khi tăng ca có hiệu lực.</p>
              </div>
            </label>
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
          <div class="w-[260px] shrink-0 card-surface overflow-hidden flex flex-col" style="max-height: 620px">
            <div class="p-3 border-b border-border/70">
              <div class="relative">
                <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input v-model="permQuery" placeholder="Tìm tên / email…"
                  class="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/50" />
                <button v-if="permQuery" class="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                  @click="permQuery = ''"><X :size="11" /></button>
              </div>
              <p class="text-[11px] text-muted-foreground mt-2 tabular-nums px-0.5">{{ permFiltered.length }}/{{ permMembers.length }} nhân viên</p>
            </div>
            <div class="overflow-y-auto scrollbar-thin flex-1 p-1.5">
              <div v-if="permFiltered.length === 0" class="py-10 text-center text-muted-foreground">
                <Search :size="26" class="mx-auto mb-2 opacity-30" />
                <p class="text-[12px] px-3">Không khớp "<span class="text-foreground font-medium">{{ permQuery }}</span>"</p>
              </div>
              <button
                v-for="m in permFiltered" :key="m.id"
                class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors mb-0.5"
                :class="m.id === permSelectedId ? 'bg-primary/10' : 'hover:bg-muted/50'"
                :style="m.id === permSelectedId ? { boxShadow: 'inset 2px 0 0 hsl(var(--primary))' } : {}"
                @click="permSelectedId = m.id"
              >
                <Avatar :name="m.name" :size="32" />
                <div class="min-w-0 flex-1">
                  <p class="text-[13px] font-medium truncate" :class="m.id === permSelectedId ? 'text-primary' : 'text-foreground'">{{ m.name }}</p>
                  <p class="text-[11px] text-muted-foreground font-mono truncate">{{ m.email }}</p>
                </div>
                <span class="text-[10.5px] font-mono text-muted-foreground tabular-nums shrink-0">{{ m.perms.length }}</span>
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
                  <Avatar :name="permSel.name" :size="40" />
                  <div>
                    <p class="font-semibold text-[15px] text-foreground">{{ permSel.name }}</p>
                    <p class="text-[12px] text-muted-foreground">{{ permSel.role }} · <span class="font-mono">{{ permSel.email }}</span></p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <Badge variant="primary">{{ permSel.perms.length }}/{{ TOTAL_PERMS }} quyền</Badge>
                  <Btn :variant="permSaved === permSel.id ? 'success' : 'primary'" size="sm" @click="savePerm">
                    <template v-if="permSaved === permSel.id"><Check :size="12" /> Đã lưu</template>
                    <template v-else>Lưu quyền</template>
                  </Btn>
                </div>
              </div>

              <!-- Permission groups -->
              <div class="space-y-3">
                <div v-for="group in PERM_GROUPS" :key="group.module" class="card-surface overflow-hidden">
                  <div class="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/60">
                    <div class="flex items-center gap-2.5">
                      <component :is="group.icon" :size="14" class="text-muted-foreground" />
                      <span class="text-[12px] font-semibold uppercase tracking-wide text-foreground">{{ group.module }}</span>
                      <span class="text-[11px] font-mono text-muted-foreground tabular-nums">
                        {{ group.items.filter(i => permSel.perms.includes(i.key)).length }}/{{ group.items.length }}
                      </span>
                    </div>
                    <label class="flex items-center gap-1.5 cursor-pointer select-none text-[11.5px] text-muted-foreground hover:text-foreground transition-colors">
                      <input
                        type="checkbox"
                        :checked="group.items.every(i => permSel.perms.includes(i.key))"
                        v-indeterminate="group.items.some(i => permSel.perms.includes(i.key)) && !group.items.every(i => permSel.perms.includes(i.key))"
                        class="h-3.5 w-3.5 rounded accent-primary cursor-pointer"
                        @change="(e: Event) => toggleGroup(group.items.map(i => i.key), (e.target as HTMLInputElement).checked)"
                      />
                      Chọn tất cả
                    </label>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-0.5 p-3">
                    <label
                      v-for="item in group.items" :key="item.key"
                      class="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer select-none group hover:bg-muted/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        :checked="permSel.perms.includes(item.key)"
                        class="h-3.5 w-3.5 rounded accent-primary cursor-pointer shrink-0"
                        @change="(e: Event) => togglePerm(item.key, (e.target as HTMLInputElement).checked)"
                      />
                      <span class="text-[12.5px] transition-colors"
                        :class="permSel.perms.includes(item.key) ? 'text-foreground' : 'text-foreground/65 group-hover:text-foreground'">
                        {{ item.label }}
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
      <div class="relative card-surface rise w-full overflow-hidden" style="max-width: 460px; border-radius: 18px; animation-duration: .18s">
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 class="font-heading font-bold text-[15px] text-foreground">{{ branchModal.editing ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh' }}</h3>
          <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="branchModal.open = false"><X :size="14" /></button>
        </div>
        <div class="p-5 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Tên chi nhánh <span class="text-red-400">*</span></label>
            <input v-model="branchModal.form.name" placeholder="VD: Hà Nội, TP.HCM…" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
          </div>
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Địa chỉ</label>
            <input v-model="branchModal.form.address" placeholder="Số nhà, đường, quận/huyện…" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
          </div>
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Điện thoại</label>
            <input v-model="branchModal.form.phone" placeholder="024 xxxx xxxx" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
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
        <div class="p-5 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Tên <span class="text-red-400">*</span></label>
            <input v-model="techModal.form.name" placeholder="VD: ReactJS, Python, AWS…" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
          </div>
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Danh mục</label>
            <Select v-model="techModal.form.category" :options="CAT_OPTS" style="width: 100%" />
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
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Tên ngày lễ <span class="text-red-400">*</span></label>
            <input v-model="holidayModal.form.name" placeholder="VD: Tết Nguyên Đán" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
          </div>
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">Ngày <span class="text-red-400">*</span></label>
            <input v-model="holidayModal.form.date" type="date" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
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
