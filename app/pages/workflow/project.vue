<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { FileText, Plus, X, Check, Folder, Target, Search } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import Select from '~/components/base/Select.vue'
import FilterBar from '~/components/base/FilterBar.vue'
import FieldInput from '~/components/base/FieldInput.vue'
import { PROJECTS_INIT, PROJECT_STATUS_META, ALL_MEMBERS, ALL_TECH, type Project, type ProjectStatus, type ProjectTarget } from '~/mocks/project'
import { useProjectStore } from '~/stores/project'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const auth = useAuth()
const projectStore = useProjectStore()
onMounted(() => projectStore.fetchProjects())

const ME_MANAGER = computed(() => auth.user.value?.name ?? 'Hoàng Đức Thành')

// ── List state ──
const projects = ref<Project[]>(PROJECTS_INIT.map(p => ({ ...p, targets: [...p.targets] })))

// Populate from store when data loads
watch(() => projectStore.projects, (rows) => {
  if (rows.length > 0) {
    projects.value = rows.map(r => ({
      id: r.project_id,
      name: r.project_name,
      desc: r.project_description ?? '',
      status: 'active' as ProjectStatus,
      manager: ME_MANAGER.value,
      branch: '',
      start: r.created_at ? r.created_at.slice(0, 10).split('-').reverse().join('/') : '',
      end: '—',
      members: 0,
      tech: [],
      targets: (r.project_targets ?? []).map((t, i) => ({
        id: i + 1,
        year: t.year ?? new Date().getFullYear(),
        quarter: t.quarter ?? 1,
        weight: 5,
        content: t.content ?? '',
      })),
    }))
  }
}, { immediate: true })
const tab = ref<'all' | 'mine' | 'active' | 'ended'>('all')
const search = ref('')
const statusF = ref('all')
const openProject = ref<Project | null>(null)
const detailTab = ref<'overview' | 'targets' | 'members'>('overview')
const modalOpen = ref(false)
const modalEditing = ref<Project | null>(null)
const toast = ref('')

// ── Modal form state ──
const form = reactive({ name: '', manager: ME_MANAGER.value, start: '', end: '', desc: '', status: 'pending' as ProjectStatus })
const modalMembers = ref<string[]>([])
const modalTechs = ref<string[]>([])
const modalTargets = ref<ProjectTarget[]>([])
const memberSearch = ref('')
const techSearch = ref('')
const formErrors = reactive({ name: '', start: '' })
// Target draft
const draftTarget = ref<{ id?: number; year: string; quarter: string; weight: string; content: string } | null>(null)
const BLANK_DRAFT = { year: '2026', quarter: '3', weight: '5', content: '' }
const YEAR_OPTS = ['2024','2025','2026','2027','2028'].map(y => ({ value: y, label: y }))
const QUARTER_OPTS = [1,2,3,4].map(q => ({ value: String(q), label: `Quý ${q}` }))

const statusOpts = [
  { value: 'all', label: 'Tất cả trạng thái' },
  ...Object.entries(PROJECT_STATUS_META).map(([k, v]) => ({ value: k, label: v.label })),
]

const memberManagerOpts = ALL_MEMBERS.map(m => ({ value: m, label: m }))
const modalStatusOpts = Object.entries(PROJECT_STATUS_META).map(([k, v]) => ({ value: k, label: v.label }))

// ── Computed: list ──
const filtered = computed(() =>
  projects.value.filter(p => {
    if (tab.value === 'mine' && p.manager !== ME_MANAGER.value) return false
    if (tab.value === 'active' && p.status !== 'active') return false
    if (tab.value === 'ended' && p.status !== 'ended') return false
    if (search.value && !p.name.toLowerCase().includes(search.value.toLowerCase())) return false
    if (statusF.value !== 'all' && p.status !== statusF.value) return false
    return true
  })
)

const stats = computed(() => ({
  total: projects.value.length,
  active: projects.value.filter(p => p.status === 'active').length,
  pending: projects.value.filter(p => p.status === 'pending').length,
  ended: projects.value.filter(p => p.status === 'ended').length,
  mine: projects.value.filter(p => p.manager === ME_MANAGER.value).length,
}))

const tabCounts = computed(() => ({
  all: projects.value.length,
  mine: stats.value.mine,
  active: stats.value.active,
  ended: stats.value.ended,
}))

const memberResults = computed(() =>
  ALL_MEMBERS.filter(m => !modalMembers.value.includes(m) && m.toLowerCase().includes(memberSearch.value.toLowerCase()))
)

const techResults = computed(() =>
  ALL_TECH.filter(t => !modalTechs.value.includes(t) && t.toLowerCase().includes(techSearch.value.toLowerCase()))
)

const sortedTargets = computed(() =>
  [...modalTargets.value].sort((a, b) => b.year - a.year || b.quarter - a.quarter)
)

const detailSortedTargets = computed(() =>
  openProject.value ? [...openProject.value.targets].sort((a, b) => b.year - a.year || b.quarter - a.quarter) : []
)

const detailMembers = computed(() => {
  if (!openProject.value) return []
  const base = [
    { n: 'Nguyễn Văn An', r: 'Tech Lead', b: 'Hà Nội', join: '15/01/2025' },
    { n: 'Trần Thị Mai', r: 'QA Engineer', b: 'Đà Nẵng', join: '22/01/2025' },
    { n: 'Lê Quang Huy', r: 'BrSE', b: 'HCM', join: '15/01/2025' },
    { n: 'Phạm Thu Hà', r: 'PM', b: 'Đà Nẵng', join: '15/01/2025' },
    { n: 'Đỗ Minh Tuấn', r: 'Backend', b: 'Hà Nội', join: '01/03/2025' },
    { n: 'Bùi Đức Thành', r: 'DevOps', b: 'Osaka', join: '10/11/2024' },
    { n: 'Vũ Thị Lan', r: 'Designer', b: 'Hà Nội', join: '15/01/2025' },
  ]
  return base.slice(0, Math.min(openProject.value.members, 7))
})

// ── Functions ──
function toDateInput(d: string): string {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(d ?? '') ? d.split('/').reverse().join('-') : ''
}

function formatDate(d: string): string {
  return d ? d.split('-').reverse().join('/') : '—'
}

function openCreateModal() {
  modalEditing.value = null
  Object.assign(form, { name: '', manager: ME_MANAGER.value, start: '', end: '', desc: '', status: 'pending' })
  modalMembers.value = []
  modalTechs.value = []
  modalTargets.value = []
  memberSearch.value = ''
  techSearch.value = ''
  draftTarget.value = null
  formErrors.name = ''
  formErrors.start = ''
  modalOpen.value = true
}

function openEditModal(p: Project) {
  modalEditing.value = p
  Object.assign(form, {
    name: p.name, manager: p.manager,
    start: toDateInput(p.start), end: toDateInput(p.end),
    desc: p.desc, status: p.status,
  })
  modalMembers.value = []
  modalTechs.value = [...p.tech]
  modalTargets.value = p.targets.map(t => ({ ...t }))
  memberSearch.value = ''
  techSearch.value = ''
  draftTarget.value = null
  formErrors.name = ''
  formErrors.start = ''
  openProject.value = null
  modalOpen.value = true
}

async function submitModal() {
  formErrors.name = ''
  formErrors.start = ''
  if (!form.name.trim()) { formErrors.name = 'Vui lòng nhập tên dự án'; return }
  if (!form.start) { formErrors.start = 'Chọn ngày bắt đầu'; return }

  const data: Partial<Project> = {
    name: form.name, desc: form.desc, manager: form.manager,
    status: form.status as ProjectStatus,
    start: formatDate(form.start),
    end: form.end ? formatDate(form.end) : '—',
    tech: modalTechs.value.slice(0, 4),
    targets: modalTargets.value.map(t => ({ ...t })),
  }

  if (modalEditing.value) {
    await projectStore.updateProject({ project_id: modalEditing.value.id, project_name: form.name, project_description: form.desc })
    const idx = projects.value.findIndex(p => p.id === modalEditing.value!.id)
    if (idx >= 0) projects.value[idx] = { ...projects.value[idx]!, ...data } as Project
    showToast('Đã cập nhật dự án: ' + form.name)
  } else {
    const res = await projectStore.createProject({ project_name: form.name, managed_by: auth.user.value?.id ?? 0, project_description: form.desc })
    const newId = res?.data?.project_id ?? Date.now()
    projects.value.unshift({ ...data, id: newId, branch: 'Hà Nội', members: modalMembers.value.length || 1 } as Project)
    showToast('Đã tạo dự án: ' + form.name)
  }
  modalOpen.value = false
}

function addMember(m: string) {
  modalMembers.value.push(m)
  memberSearch.value = ''
}

function addTech(t: string) {
  modalTechs.value.push(t)
  techSearch.value = ''
}

function commitDraft() {
  if (!draftTarget.value || !draftTarget.value.content.trim()) return
  const rec: ProjectTarget = {
    id: draftTarget.value.id || Date.now(),
    year: Number(draftTarget.value.year),
    quarter: Number(draftTarget.value.quarter),
    weight: Number(draftTarget.value.weight) || 0,
    content: draftTarget.value.content,
  }
  if (draftTarget.value.id) {
    const idx = modalTargets.value.findIndex(t => t.id === draftTarget.value!.id)
    if (idx >= 0) modalTargets.value[idx] = rec
  } else {
    modalTargets.value.push(rec)
  }
  draftTarget.value = null
}

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

function memberAvatarBg(i: number): string {
  const h = (i * 60 + 180) % 360
  return `linear-gradient(135deg, hsl(${h} 70% 62%), hsl(${h} 70% 42%))`
}
</script>

<template>
<div class="space-y-6">
  <PageHeader
    eyebrow="Workflow"
    title="Quản lý dự án"
    description="Theo dõi trạng thái, thành viên và mục tiêu hằng quý của tất cả dự án."
  >
    <template #actions>
      <Btn variant="outline"><FileText :size="14" />Báo cáo</Btn>
      <Btn variant="primary" @click="openCreateModal"><Plus :size="14" />Tạo dự án mới</Btn>
    </template>
  </PageHeader>

  <!-- MiniStats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <MiniStat label="Tổng dự án" :value="stats.total" sublabel="Tất cả trạng thái" accent="primary" :delay="40" />
    <MiniStat label="Đang hoạt động" :value="stats.active" :sublabel="`${stats.pending} chờ khởi động`" accent="green" :delay="80" />
    <MiniStat label="Đã kết thúc" :value="stats.ended" sublabel="Đã hoàn tất" accent="sky" :delay="120" />
    <MiniStat label="Dự án của tôi" :value="stats.mine" sublabel="Quản lý trực tiếp" accent="violet" :delay="160" />
  </div>

  <!-- Tab strip -->
  <div class="border-b border-border/70">
    <div class="flex gap-7">
      <button
        v-for="[k, l] in [['all','Tất cả'], ['mine','Của tôi'], ['active','Đang hoạt động'], ['ended','Đã kết thúc']]"
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

  <!-- Filter bar -->
  <FilterBar>
    <FieldInput v-model="search" placeholder="Tìm tên dự án…" :width="240" />
    <Select v-model="statusF" :options="statusOpts" style="min-width: 170px" />
    <div class="flex-1" />
    <span class="text-[12px] text-muted-foreground">{{ filtered.length }} dự án</span>
  </FilterBar>

  <!-- Project card grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    <div
      v-for="(p, i) in filtered" :key="p.id"
      class="card-surface interactive p-5 flex flex-col gap-4 cursor-pointer rise"
      :class="p.status === 'ended' ? 'opacity-75' : ''"
      :style="{ animationDelay: `${40 + i * 30}ms` }"
      @click="openProject = p; detailTab = 'overview'"
    >
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex-1">
          <Badge :variant="PROJECT_STATUS_META[p.status].variant" dot>{{ PROJECT_STATUS_META[p.status].label }}</Badge>
          <h3 class="font-semibold text-foreground line-clamp-2 leading-snug mt-2">{{ p.name }}</h3>
        </div>
        <Avatar :name="p.manager" :size="28" />
      </div>

      <p class="text-[12.5px] text-muted-foreground line-clamp-2">{{ p.desc }}</p>

      <div v-if="p.targets.length > 0" class="flex items-center gap-2 flex-wrap">
        <span class="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
          <Target :size="11" /> {{ p.targets.length }} mục tiêu quý
        </span>
        <span class="text-[11px] text-muted-foreground">· Tổng trọng số {{ p.targets.reduce((a, t) => a + t.weight, 0) }}</span>
      </div>

      <div class="flex flex-wrap gap-1">
        <span
          v-for="t in p.tech" :key="t"
          class="text-[10.5px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono"
        >{{ t }}</span>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-border/60 text-[12px]">
        <div class="flex -space-x-2">
          <div
            v-for="idx in Math.min(p.members, 5)" :key="idx"
            class="h-6 w-6 rounded-md border-2 border-card"
            :style="{ background: memberAvatarBg(idx - 1) }"
          />
          <div v-if="p.members > 5" class="h-6 w-6 rounded-md border-2 border-card bg-muted flex items-center justify-center text-[9.5px] font-semibold text-muted-foreground">
            +{{ p.members - 5 }}
          </div>
        </div>
        <span class="font-mono text-muted-foreground text-[11.5px]">{{ p.start }} → {{ p.end }}</span>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="col-span-full card-surface py-16 text-center text-muted-foreground">
      <Folder :size="40" class="mx-auto mb-3 opacity-30" />
      Không có dự án phù hợp
    </div>
  </div>

  <!-- ── Project detail slide-over ── -->
  <Teleport to="body">
    <div v-if="openProject" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="openProject = null" />
      <div class="relative bg-background border-l border-border w-full max-w-2xl h-full flex flex-col rise" style="animation-duration: .3s">
        <!-- Header -->
        <div class="p-5 border-b border-border/70" style="background: linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 57% / 0.04), transparent 60%)">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge :variant="PROJECT_STATUS_META[openProject.status].variant" dot>{{ PROJECT_STATUS_META[openProject.status].label }}</Badge>
                <span v-for="t in openProject.tech" :key="t" class="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{{ t }}</span>
              </div>
              <h2 class="font-bold text-[20px] font-heading text-foreground">{{ openProject.name }}</h2>
              <div class="flex items-center gap-3 mt-1 text-[12px] text-muted-foreground flex-wrap">
                <span class="inline-flex items-center gap-1.5">
                  <Avatar :name="openProject.manager" :size="16" />
                  {{ openProject.manager }}
                </span>
                <span>·</span>
                <span class="font-mono">{{ openProject.start }} → {{ openProject.end }}</span>
              </div>
            </div>
            <button class="p-2 rounded-md hover:bg-muted text-muted-foreground shrink-0" @click="openProject = null"><X :size="16" /></button>
          </div>
        </div>

        <!-- Sub-tabs -->
        <div class="border-b border-border/70 px-5 flex gap-5 shrink-0">
          <button
            v-for="[k, l] in [['overview','Tổng quan'], ['targets',`Mục tiêu quý (${openProject.targets.length})`], ['members',`Thành viên (${openProject.members})`]]"
            :key="k"
            :data-active="detailTab === k"
            class="tab-trigger text-[13px]"
            @click="detailTab = k as typeof detailTab"
          >{{ l }}</button>
        </div>

        <!-- Tab content -->
        <div class="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
          <!-- Overview -->
          <template v-if="detailTab === 'overview'">
            <div class="card-surface p-5">
              <h3 class="section-title mb-2">Mô tả</h3>
              <p class="text-[13.5px] text-foreground/85 leading-relaxed whitespace-pre-wrap">{{ openProject.desc || 'Chưa có mô tả' }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="card-surface p-4">
                <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Quản lý</p>
                <div class="flex items-center gap-2 mt-1"><Avatar :name="openProject.manager" :size="24" /><p class="font-medium text-foreground text-[13.5px]">{{ openProject.manager }}</p></div>
              </div>
              <div class="card-surface p-4">
                <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Chi nhánh</p>
                <p class="font-medium text-foreground text-[13.5px] mt-2">{{ openProject.branch }}</p>
              </div>
            </div>
            <div v-if="detailSortedTargets.length > 0" class="card-surface p-5">
              <h3 class="section-title mb-3">Mục tiêu gần nhất · Quý {{ detailSortedTargets[0]!.quarter }}/{{ detailSortedTargets[0]!.year }}</h3>
              <p class="text-[13px] text-foreground/85 whitespace-pre-wrap leading-relaxed">{{ detailSortedTargets[0]!.content }}</p>
            </div>
          </template>

          <!-- Targets -->
          <template v-else-if="detailTab === 'targets'">
            <div v-if="detailSortedTargets.length === 0" class="card-surface py-16 text-center text-muted-foreground">
              <Target :size="36" class="mx-auto mb-2 opacity-30" />
              <p>Chưa có mục tiêu quý nào</p>
            </div>
            <div v-else class="space-y-3">
              <div v-for="t in detailSortedTargets" :key="t.id" class="card-surface overflow-hidden">
                <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border/60"
                  style="background: linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 57% / 0.06), transparent)">
                  <Badge variant="primary">Quý {{ t.quarter }} · {{ t.year }}</Badge>
                  <span class="text-[11.5px] text-muted-foreground ml-1">Trọng số <strong class="text-foreground">{{ t.weight }}</strong></span>
                </div>
                <p class="px-4 py-3 text-[13px] text-foreground/85 whitespace-pre-wrap leading-relaxed">{{ t.content }}</p>
              </div>
            </div>
          </template>

          <!-- Members -->
          <template v-else>
            <ul class="space-y-2.5">
              <li
                v-for="(m, mi) in detailMembers" :key="mi"
                class="flex items-center gap-3 p-3 card-surface hover:border-primary/40 transition-colors cursor-pointer"
              >
                <Avatar :name="m.n" :size="36" />
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-foreground">{{ m.n }}</p>
                  <p class="text-[12px] text-muted-foreground">{{ m.r }} · {{ m.b }}</p>
                </div>
                <span class="text-[11px] font-mono text-muted-foreground">{{ m.join }}</span>
              </li>
            </ul>
          </template>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-border/70 flex items-center gap-2 shrink-0">
          <Btn variant="ghost" size="sm" @click="openProject = null">Đóng</Btn>
          <div class="flex-1" />
          <Btn variant="primary" size="sm" @click="openEditModal(openProject)"><FileText :size="13" />Chỉnh sửa</Btn>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── Create / Edit Modal ── -->
  <Teleport to="body">
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="modalOpen = false" />
      <div class="relative card-surface rise w-full flex flex-col" style="max-width: 560px; border-radius: 20px; overflow: hidden; animation-duration: .22s; max-height: 92vh">
        <!-- Modal header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center"
              style="background: linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 65%), hsl(var(--primary-h) var(--primary-s) 45%))">
              <Folder :size="14" class="text-white" />
            </div>
            <div>
              <h3 class="font-heading font-bold text-[15px] text-foreground">{{ modalEditing ? 'Sửa dự án' : 'Tạo dự án mới' }}</h3>
              <p class="text-[11.5px] text-muted-foreground">Thông tin chung và mục tiêu hằng quý</p>
            </div>
          </div>
          <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="modalOpen = false"><X :size="14" /></button>
        </div>

        <!-- Modal body -->
        <div class="overflow-y-auto scrollbar-thin flex-1 p-6 space-y-5">
          <!-- Name -->
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Tên dự án <span class="text-red-400">*</span></label>
            <input v-model="form.name" placeholder="VD: Setting mục tiêu KAIZEN 15% theo phương châm tập đoàn"
              class="w-full h-9 px-3 rounded-lg border text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/45 bg-card"
              :class="formErrors.name ? 'border-red-400' : 'border-border focus:border-primary/60'" />
            <p v-if="formErrors.name" class="text-[11.5px] text-red-400 mt-1">{{ formErrors.name }}</p>
          </div>

          <!-- Manager + Status -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Quản lý</label>
              <Select v-model="form.manager" :options="memberManagerOpts" style="width: 100%" />
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Trạng thái</label>
              <Select v-model="form.status" :options="modalStatusOpts" style="width: 100%" />
            </div>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Ngày bắt đầu <span class="text-red-400">*</span></label>
              <input v-model="form.start" type="date"
                class="w-full h-9 px-3 rounded-lg border text-[13px] text-foreground outline-none bg-card"
                :class="formErrors.start ? 'border-red-400' : 'border-border focus:border-primary/60'" />
              <p v-if="formErrors.start" class="text-[11.5px] text-red-400 mt-1">{{ formErrors.start }}</p>
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Ngày kết thúc dự kiến</label>
              <input v-model="form.end" type="date" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
            </div>
          </div>

          <!-- Member search -->
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Người phụ trách</label>
            <div v-if="modalMembers.length > 0" class="flex flex-wrap gap-1.5 mb-2">
              <span
                v-for="m in modalMembers" :key="m"
                class="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-full text-[12px] font-medium"
                style="background: hsl(var(--primary-h) var(--primary-s) 60% / 0.12); color: hsl(var(--primary-h) var(--primary-s) 42%)"
              >
                {{ m }}
                <button class="h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors" @click="modalMembers = modalMembers.filter(x => x !== m)">
                  <X :size="9" />
                </button>
              </span>
            </div>
            <div class="relative">
              <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input v-model="memberSearch" placeholder="Tìm và thêm nhân viên…"
                class="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground/45" />
            </div>
            <div v-if="memberSearch && memberResults.length > 0" class="card-surface border border-border shadow-sm rounded-xl overflow-hidden mt-1">
              <button
                v-for="m in memberResults.slice(0, 5)" :key="m"
                class="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/40 transition-colors text-left"
                @click="addMember(m)"
              >
                <Avatar :name="m" :size="24" /><span class="text-[13px] text-foreground">{{ m }}</span>
              </button>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Mô tả</label>
            <textarea v-model="form.desc" rows="3" placeholder="Mục tiêu, phạm vi, khách hàng…"
              class="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 resize-none placeholder:text-muted-foreground/45" />
          </div>

          <!-- Tech tags -->
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Công nghệ</label>
            <div v-if="modalTechs.length > 0" class="flex flex-wrap gap-1.5 mb-2">
              <span
                v-for="t in modalTechs" :key="t"
                class="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded bg-muted text-[11.5px] font-mono text-foreground/80"
              >
                {{ t }}
                <button class="h-4 w-4 flex items-center justify-center hover:text-red-500 transition-colors" @click="modalTechs = modalTechs.filter(x => x !== t)"><X :size="9" /></button>
              </span>
            </div>
            <input v-model="techSearch" placeholder="VD: React, Go, Docker…"
              class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground/45" />
            <div v-if="techSearch" class="flex flex-wrap gap-1.5 mt-1.5">
              <button
                v-for="t in techResults.slice(0, 8)" :key="t"
                class="h-7 px-2.5 rounded-md bg-muted hover:bg-primary/10 hover:text-primary text-[12px] font-mono text-muted-foreground transition-colors"
                @click="addTech(t)"
              >+ {{ t }}</button>
            </div>
          </div>

          <!-- Quarterly targets editor -->
          <div class="pt-1 border-t border-dashed border-border/70">
            <div class="flex items-center gap-2 mb-3 mt-4">
              <Target :size="14" class="text-primary" />
              <p class="text-[12.5px] font-semibold text-foreground">Mục tiêu hằng quý</p>
              <span v-if="modalTargets.length > 0" class="text-[11px] font-mono text-muted-foreground">({{ modalTargets.length }})</span>
            </div>

            <div class="space-y-2.5">
              <!-- Existing targets -->
              <div v-for="t in sortedTargets" :key="t.id" class="rounded-xl border border-border bg-muted/20 overflow-hidden">
                <div class="flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-muted/30">
                  <Badge variant="primary">Quý {{ t.quarter }} · {{ t.year }}</Badge>
                  <span class="text-[11.5px] text-muted-foreground">Trọng số <strong class="text-foreground">{{ t.weight }}</strong></span>
                  <div class="ml-auto flex items-center gap-1">
                    <button class="h-6 px-2 rounded text-[11.5px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      @click="draftTarget = { id: t.id, year: String(t.year), quarter: String(t.quarter), weight: String(t.weight), content: t.content }">
                      Chỉnh sửa
                    </button>
                    <button class="h-6 px-2 rounded text-[11.5px] font-medium text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
                      @click="modalTargets = modalTargets.filter(x => x.id !== t.id)">
                      Xóa
                    </button>
                  </div>
                </div>
                <p class="px-3 py-2 text-[12.5px] text-foreground/85 whitespace-pre-wrap leading-relaxed">{{ t.content }}</p>
              </div>

              <!-- Draft form -->
              <div v-if="draftTarget" class="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Năm</label>
                    <Select v-model="draftTarget.year" :options="YEAR_OPTS" style="width: 100%" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Quý</label>
                    <Select v-model="draftTarget.quarter" :options="QUARTER_OPTS" style="width: 100%" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Trọng số</label>
                    <input v-model="draftTarget.weight" type="number" min="0" max="10"
                      class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
                  </div>
                </div>
                <div>
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Mục tiêu <span class="text-red-400">*</span></label>
                  <textarea v-model="draftTarget.content" rows="4"
                    placeholder="1. Lựa chọn những task có khả năng KAIZEN…&#10;2. Trình bày về thành quả ở mục tự đánh giá cuối quý"
                    class="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 resize-none leading-relaxed placeholder:text-muted-foreground/45" />
                </div>
                <div class="flex items-center justify-end gap-2">
                  <Btn variant="ghost" size="xs" @click="draftTarget = null">Hủy</Btn>
                  <Btn variant="primary" size="xs" @click="commitDraft">{{ draftTarget.id ? 'Lưu mục tiêu' : 'Thêm mục tiêu' }}</Btn>
                </div>
              </div>

              <!-- Add button -->
              <button v-else
                class="w-full py-3 rounded-xl border-2 border-dashed border-border text-[13px] font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                @click="draftTarget = { ...BLANK_DRAFT }"
              >
                <Plus :size="14" /> Add target
              </button>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/70 bg-muted/20 shrink-0">
          <Btn variant="outline" size="sm" @click="modalOpen = false">Hủy</Btn>
          <Btn variant="primary" size="sm" @click="submitModal">
            <Plus v-if="!modalEditing" :size="13" />
            {{ modalEditing ? 'Submit All' : 'Tạo dự án' }}
          </Btn>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Toast -->
  <Teleport to="body">
    <div v-if="toast" class="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-white shadow-lg rise"
      style="background: hsl(160 60% 40%); animation-duration: .2s">
      <Check :size="13" /> {{ toast }}
    </div>
  </Teleport>
</div>
</template>
