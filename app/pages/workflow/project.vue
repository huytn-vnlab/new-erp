<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { FileText, Plus, X, Folder, Target, Search, FolderOpen } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import Select from '~/components/base/Select.vue'
import FilterBar from '~/components/base/FilterBar.vue'
import FieldInput from '~/components/base/FieldInput.vue'
import EmptyState from '~/components/base/EmptyState.vue'
import ErrorBanner from '~/components/base/ErrorBanner.vue'
import Modal from '~/components/base/Modal.vue'
import Pagination from '~/components/base/Pagination.vue'
import { useProjectStore } from '~/stores/project'
import type { ProjectRow, ProjectStatus, ProjectTarget } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const auth = useAuth()
const projectStore = useProjectStore()
const { show } = useToast()
const { t } = useI18n()

// create/update/delete are Manager/GeneralManager-only on the backend
// (CheckAllManager middleware) — everyone can view the list/detail.
const roleName = computed(() => auth.user.value?.role_name?.toLowerCase() ?? '')
const isManagerOrGM = computed(() => roleName.value === 'manager' || roleName.value === 'general manager')

const today = new Date()
const currentQuarter = Math.floor(today.getMonth() / 3) + 1
const currentYear = today.getFullYear()

// cf.ProjectStatusActive/ProjectStatusEnded on the backend.
const PROJECT_STATUS_META = computed<Record<ProjectStatus, { label: string; variant: 'green' | 'gray' }>>(() => ({
  1: { label: t('project.status.active'), variant: 'green' },
  2: { label: t('project.status.ended'), variant: 'gray' },
}))
const STATUS_OPTS = computed<{ value: string; label: string }[]>(() => [
  { value: '0', label: t('project.status.all') },
  { value: '1', label: t('project.status.active') },
  { value: '2', label: t('project.status.ended') },
])

function userName(id: number | null | undefined): string {
  if (!id) return '—'
  return projectStore.users[String(id)] ?? `#${id}`
}
// Falls back to "active" for any row a not-yet-updated query forgot to select
// status on — degrades gracefully instead of crashing the Badge render.
function statusMeta(status: ProjectStatus | number | null | undefined) {
  return PROJECT_STATUS_META.value[status as ProjectStatus] ?? PROJECT_STATUS_META.value[1]
}
function hasCurrentQuarterTarget(p: ProjectRow): boolean {
  return (p.project_targets ?? []).some(t => t.year === currentYear && t.quarter === currentQuarter)
}

// ── Card footer member avatars — the list endpoint has no per-project member
// data (only get-user-project, per project), so this is a bounded fan-out over
// whatever's currently loaded, cached by id and chunked like the evaluation
// module's category-averages fetch, to avoid firing dozens of requests at once.
// Chunk size is small (3) and this only ever runs AFTER the critical stats/list
// fetches below have already landed — this app's local dev backend runs behind
// Docker Desktop's port-forwarding, which chokes on many simultaneous new
// connections and starts dropping requests (surfaced by the browser as
// nonsensical CORS errors) once several fetches race at once on page load. ──
const CARD_MEMBERS_FETCH_CAP = 40
const cardMembers = ref<Record<number, { userId: number; name: string }[]>>({})
function invalidateCardMembers(id: number) {
  const { [id]: _omit, ...rest } = cardMembers.value
  cardMembers.value = rest
}
// getUserProject resolves to null both when a project genuinely can't be
// loaded AND when the connection just got dropped by the burst above — a
// dropped request used to get cached as a permanent "no members" result with
// no way to recover for the rest of the session. Retry failed ids once (after
// a short pause) before giving up, so a transient drop doesn't read as "this
// project has no members" forever.
async function fetchCardMembers(rows: ProjectRow[], isRetry = false) {
  const ids = [...new Set(rows.map(r => r.project_id))]
    .filter(id => !(id in cardMembers.value))
    .slice(0, CARD_MEMBERS_FETCH_CAP)
  if (ids.length === 0) return
  const CHUNK_SIZE = 2
  const failedIds: number[] = []
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE)
    const results = await Promise.all(chunk.map(id => projectStore.getUserProject(id)))
    chunk.forEach((id, idx) => {
      const res = results[idx]
      if (res) {
        cardMembers.value[id] = res.user_projects.filter(up => !up.is_deleted).map(up => ({ userId: up.user_id, name: res.user_box[String(up.user_id)] ?? `#${up.user_id}` }))
      } else {
        failedIds.push(id)
      }
    })
  }
  if (failedIds.length === 0) return
  if (isRetry) {
    failedIds.forEach(id => { cardMembers.value[id] = [] })
    return
  }
  await new Promise(resolve => setTimeout(resolve, 500))
  await fetchCardMembers(rows.filter(r => failedIds.includes(r.project_id)), true)
}

// ── List state ──
// "Tất cả" is server-paginated + server-filtered (search/status become real
// query params, see fetchList) since the org's full project list can be large.
// "Của tôi" comes back from the backend already unpaginated (GetProjectsUserJoin
// has no row cap), so it's small enough to filter client-side instead.
const tab = ref<'all' | 'mine'>('all')
const search = ref('')
const statusF = ref('0')

// Card-avatar fetches are decorative and deliberately NOT awaited here — they
// must not delay/compete with the data the rest of the page depends on.
async function fetchList(page = 1) {
  await projectStore.fetchProjects({
    keyword: search.value.trim() || undefined,
    status: statusF.value === '0' ? undefined : Number(statusF.value),
    current_page: page,
  })
}

onMounted(async () => {
  // Cold load can race auth's own profile fetch — role_name/id must be ready
  // before gating the create/edit/delete buttons or fetching "my projects".
  if (!auth.user.value && auth.token.value) await auth.fetchUser()
  // These three matter for correctness (list, "của tôi", summary totals) — run
  // them one at a time so they don't contend with each other for connections.
  await fetchList(1)
  if (auth.user.value?.id) await projectStore.fetchMyProjects(auth.user.value.id)
  await projectStore.fetchAllProjectsForStats()
  // Only once the numbers above are secured, fetch the decorative avatars —
  // chained (not fired concurrently) to halve the peak connection burst that
  // was causing dropped requests / permanently-empty avatar rows, without
  // blocking onMounted or anything else on these decorative fetches.
  fetchCardMembers(projectStore.projects).then(() => fetchCardMembers(projectStore.myProjects))
})

// Filter/status changes only refetch the "Tất cả" tab (server-driven); "Của
// tôi" re-filters its already-fully-loaded client array via `filtered` below.
// Switching tabs alone doesn't need a refetch — "Tất cả"'s data doesn't go
// stale just from viewing "Của tôi" for a moment.
async function refetchAllTab(page = 1) {
  await fetchList(page)
  fetchCardMembers(projectStore.projects)
}
watch(statusF, () => { if (tab.value === 'all') refetchAllTab(1) })
watchDebounced(search, () => { if (tab.value === 'all') refetchAllTab(1) }, { debounce: 300 })

const filtered = computed(() => {
  if (tab.value === 'all') return projectStore.projects
  const q = search.value.trim().toLowerCase()
  return projectStore.myProjects.filter(p =>
    (!q || p.project_name.toLowerCase().includes(q))
    && (statusF.value === '0' || String(p.status) === statusF.value),
  )
})

const stats = computed(() => {
  const total = projectStore.allProjects.length
  // A project that's "Đã kết thúc" (status 2) isn't being worked on anymore, so
  // it shouldn't count toward "needs a target update" — only active projects do.
  const activeProjects = projectStore.allProjects.filter(p => p.status === 1)
  const withTarget = activeProjects.filter(hasCurrentQuarterTarget).length
  return {
    total,
    mine: projectStore.myProjects.length,
    withTarget,
    missingTarget: activeProjects.length - withTarget,
  }
})

// ── Detail slide-over — always re-fetched fresh from the authoritative
// get-project-details + get-user-project endpoints, since the list row only
// carries enough for the card (no member list, and targets/desc can be stale
// vs. a concurrent edit by someone else). ──
const openProjectId = ref<number | null>(null)
const detailTab = ref<'overview' | 'targets' | 'members'>('overview')
const detailLoading = ref(false)
const detailProject = ref<{ id: number; name: string; desc: string; managedBy: number; status: ProjectStatus; targets: ProjectTarget[]; createdAt: string } | null>(null)
const detailMembers = ref<{ userId: number; name: string; branch: string; joinedAt: string }[]>([])

async function openDetail(row: ProjectRow) {
  openProjectId.value = row.project_id
  detailTab.value = 'overview'
  detailLoading.value = true
  detailProject.value = null
  detailMembers.value = []
  const [detail, membersRes] = await Promise.all([
    projectStore.getProjectDetails(row.project_id),
    projectStore.getUserProject(row.project_id),
  ])
  detailLoading.value = false
  if (detail) {
    detailProject.value = {
      id: detail.project_id,
      name: detail.name,
      desc: detail.description,
      managedBy: detail.managed_by,
      status: detail.status ?? row.status,
      targets: detail.targets ?? [],
      createdAt: row.created_at ?? '',
    }
  }
  if (membersRes) {
    detailMembers.value = membersRes.user_projects
      .filter(up => !up.is_deleted)
      .map(up => ({
        userId: up.user_id,
        name: membersRes.user_box[String(up.user_id)] ?? `#${up.user_id}`,
        branch: membersRes.branch_box[String(up.branch)] ?? '',
        joinedAt: up.date_joined,
      }))
  }
}
function closeDetail() {
  openProjectId.value = null
  detailProject.value = null
  detailMembers.value = []
}
const detailSortedTargets = computed(() =>
  detailProject.value ? [...detailProject.value.targets].sort((a, b) => b.year - a.year || b.quarter - a.quarter) : [],
)

// ── Create / Edit modal ──
const YEAR_OPTS = Array.from({ length: 5 }, (_, i) => String(currentYear + 1 - i)).map(y => ({ value: y, label: y }))
const QUARTER_OPTS = computed(() => [1, 2, 3, 4].map(q => ({ value: String(q), label: t('project.form.quarterOpt', { n: q }) })))

const modalOpen = ref(false)
const modalLoading = ref(false)
const modalSaving = ref(false)
const modalEditingId = ref<number | null>(null)
const form = reactive({ name: '', managerId: '' as string, desc: '', status: '1' as string })
const formErrors = reactive({ name: '', managerId: '' })

type TargetDraftRow = { key: number; year: number; quarter: number; content: string }
const modalTargets = ref<TargetDraftRow[]>([])
let targetKeySeq = 0
const draftTarget = ref<{ key: number | null; year: string; quarter: string; content: string } | null>(null)
const sortedTargets = computed(() => [...modalTargets.value].sort((a, b) => b.year - a.year || b.quarter - a.quarter))

// Members: userProjectId is null for a member added this session (not yet
// persisted) vs. the real join-row id for a member already on the project.
type MemberDraft = { userId: number; userProjectId: number | null }
const modalMembers = ref<MemberDraft[]>([])
const removedUserProjectIds = ref<number[]>([])
const memberSearch = ref('')

const managerOpts = computed(() => Object.entries(projectStore.users).map(([id, name]) => ({ value: id, label: name })))
const memberResults = computed(() => {
  const q = memberSearch.value.trim().toLowerCase()
  const selected = new Set(modalMembers.value.map(m => m.userId))
  return Object.entries(projectStore.users)
    .filter(([id, name]) => !selected.has(Number(id)) && (!q || name.toLowerCase().includes(q)))
    .map(([id, name]) => ({ id: Number(id), name }))
})

function openCreateModal() {
  modalEditingId.value = null
  form.name = ''
  form.managerId = auth.user.value?.id ? String(auth.user.value.id) : ''
  form.desc = ''
  form.status = '1'
  formErrors.name = ''; formErrors.managerId = ''
  modalTargets.value = []
  modalMembers.value = []
  removedUserProjectIds.value = []
  memberSearch.value = ''
  draftTarget.value = null
  modalOpen.value = true
}

async function openEditModal(row: ProjectRow) {
  closeDetail()
  modalEditingId.value = row.project_id
  formErrors.name = ''; formErrors.managerId = ''
  memberSearch.value = ''
  draftTarget.value = null
  removedUserProjectIds.value = []
  modalOpen.value = true
  modalLoading.value = true
  const [detail, membersRes] = await Promise.all([
    projectStore.getProjectDetails(row.project_id),
    projectStore.getUserProject(row.project_id),
  ])
  modalLoading.value = false
  form.name = detail?.name ?? row.project_name
  form.managerId = String(detail?.managed_by ?? row.managed_by ?? '')
  form.desc = detail?.description ?? row.project_description ?? ''
  form.status = String(detail?.status ?? row.status ?? 1)
  modalTargets.value = (detail?.targets ?? row.project_targets ?? []).map(t => ({ key: ++targetKeySeq, ...t }))
  modalMembers.value = membersRes
    ? membersRes.user_projects.filter(up => !up.is_deleted).map(up => ({ userId: up.user_id, userProjectId: up.id }))
    : []
}

function addMember(id: number) {
  modalMembers.value.push({ userId: id, userProjectId: null })
  memberSearch.value = ''
}
function removeMember(m: MemberDraft) {
  if (m.userProjectId != null) removedUserProjectIds.value.push(m.userProjectId)
  modalMembers.value = modalMembers.value.filter(x => x.userId !== m.userId)
}

function openNewTargetDraft() {
  draftTarget.value = { key: null, year: String(currentYear), quarter: String(currentQuarter), content: '' }
}
function openEditTargetDraft(t: TargetDraftRow) {
  draftTarget.value = { key: t.key, year: String(t.year), quarter: String(t.quarter), content: t.content }
}
function commitTargetDraft() {
  if (!draftTarget.value || !draftTarget.value.content.trim()) return
  const rec: TargetDraftRow = {
    key: draftTarget.value.key ?? ++targetKeySeq,
    year: Number(draftTarget.value.year),
    quarter: Number(draftTarget.value.quarter),
    content: draftTarget.value.content,
  }
  if (draftTarget.value.key != null) {
    const idx = modalTargets.value.findIndex(t => t.key === draftTarget.value!.key)
    if (idx >= 0) modalTargets.value[idx] = rec
  } else {
    modalTargets.value.push(rec)
  }
  draftTarget.value = null
}
function removeTarget(key: number) {
  modalTargets.value = modalTargets.value.filter(t => t.key !== key)
}

async function submitModal() {
  formErrors.name = ''; formErrors.managerId = ''
  if (!form.name.trim()) formErrors.name = t('project.form.nameRequired')
  if (!form.managerId) formErrors.managerId = t('project.form.managerRequired')
  if (formErrors.name || formErrors.managerId) return

  modalSaving.value = true
  const managedBy = Number(form.managerId)
  const status = Number(form.status) as ProjectStatus
  const targetsPayload = modalTargets.value.map(({ year, quarter, content }) => ({ year, quarter, content }))

  if (modalEditingId.value === null) {
    const res = await projectStore.createProject({ project_name: form.name, managed_by: managedBy, project_description: form.desc, status })
    if (!res.ok || !res.id) {
      modalSaving.value = false
      show(res.message || t('project.toast.createFailed'), 'error')
      return
    }
    const newId = res.id
    // create-project has no targets field — the project must exist first, then
    // a follow-up update persists any targets drafted in the same modal.
    if (targetsPayload.length > 0) {
      await projectStore.updateProject({ project_id: newId, name: form.name, description: form.desc, managed_by: managedBy, targets: targetsPayload, status })
    }
    // The manager is auto-added as a member server-side on creation — skip re-adding them.
    await Promise.all(
      modalMembers.value.filter(m => m.userId !== managedBy).map(m => projectStore.addUserToProject(m.userId, newId)),
    )
    show(t('project.toast.created', { name: form.name }))
  } else {
    const id = modalEditingId.value
    const res = await projectStore.updateProject({ project_id: id, name: form.name, description: form.desc, managed_by: managedBy, targets: targetsPayload, status })
    if (!res.ok) {
      modalSaving.value = false
      show(res.message || t('project.toast.updateFailed'), 'error')
      return
    }
    await Promise.all([
      ...modalMembers.value.filter(m => m.userProjectId === null).map(m => projectStore.addUserToProject(m.userId, id)),
      ...removedUserProjectIds.value.map(rid => projectStore.removeUserFromProject(rid)),
    ])
    show(t('project.toast.updated', { name: form.name }))
  }
  modalSaving.value = false
  modalOpen.value = false
  // Membership just changed on an existing project — its cached avatar list is
  // now stale (a brand-new project has no stale entry to invalidate).
  if (modalEditingId.value !== null) invalidateCardMembers(modalEditingId.value)
  // A new project always lands on whatever page it sorts to (created_at DESC —
  // page 1); an edit stays on the page the user was already looking at.
  await Promise.all([
    fetchList(modalEditingId.value === null ? 1 : projectStore.pagination.current_page),
    auth.user.value?.id ? projectStore.fetchMyProjects(auth.user.value.id) : Promise.resolve(),
    projectStore.fetchAllProjectsForStats(),
  ])
  fetchCardMembers(projectStore.projects).then(() => fetchCardMembers(projectStore.myProjects))
}

// ── Delete confirm ──
const deleteConfirmOpen = ref(false)
const deletingId = ref<number | null>(null)
function openDeleteConfirm(id: number) {
  deletingId.value = id
  deleteConfirmOpen.value = true
}
async function confirmDelete() {
  if (deletingId.value == null) return
  const res = await projectStore.deleteProject(deletingId.value)
  if (res.ok) {
    if (openProjectId.value === deletingId.value) closeDetail()
    invalidateCardMembers(deletingId.value)
    // Deleting the last row on a page (other than page 1) would otherwise leave
    // the grid stuck showing an empty page — step back a page when that happens.
    const total = projectStore.pagination.total_row - 1
    const lastPage = Math.max(1, Math.ceil(total / projectStore.pagination.row_per_page))
    const page = Math.min(projectStore.pagination.current_page, lastPage)
    await Promise.all([
      fetchList(page),
      auth.user.value?.id ? projectStore.fetchMyProjects(auth.user.value.id) : Promise.resolve(),
      projectStore.fetchAllProjectsForStats(),
    ])
    fetchCardMembers(projectStore.projects).then(() => fetchCardMembers(projectStore.myProjects))
    show(t('project.toast.deleted'))
  } else {
    show(res.message || t('project.toast.deleteFailed'), 'error')
  }
  deleteConfirmOpen.value = false
  deletingId.value = null
}
</script>

<template>
<div class="space-y-6">
  <PageHeader
    :eyebrow="t('project.eyebrow')"
    :title="t('project.title')"
    :description="t('project.description')"
  >
    <template #actions>
      <Btn v-if="isManagerOrGM" variant="primary" @click="openCreateModal"><Plus :size="14" />{{ t('project.newProject') }}</Btn>
    </template>
  </PageHeader>

  <!-- MiniStats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <MiniStat :label="t('project.stats.total')" :value="stats.total" :sublabel="t('project.stats.totalSub')" accent="primary" :delay="40" />
    <MiniStat :label="t('project.stats.mine')" :value="stats.mine" :sublabel="t('project.stats.mineSub')" accent="violet" :delay="80" />
    <MiniStat :label="t('project.stats.withTarget')" :value="stats.withTarget" :sublabel="`Q${currentQuarter}/${currentYear}`" accent="green" :delay="120" />
    <MiniStat :label="t('project.stats.missingTarget')" :value="stats.missingTarget" :sublabel="t('project.stats.missingTargetSub')" :accent="stats.missingTarget > 0 ? 'amber' : 'green'" :delay="160" />
  </div>

  <!-- Tab strip -->
  <div class="border-b border-border/70">
    <div class="flex gap-7">
      <button
        v-for="[k, l] in [['all', t('project.tabAll')], ['mine', t('project.tabMine')]]"
        :key="k"
        :data-active="tab === k"
        class="tab-trigger inline-flex items-center gap-2"
        @click="tab = k as typeof tab"
      >
        {{ l }}
        <span
          class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums"
          :class="tab === k ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'"
        >{{ k === 'mine' ? stats.mine : stats.total }}</span>
      </button>
    </div>
  </div>

  <!-- Filter bar -->
  <FilterBar>
    <FieldInput v-model="search" :placeholder="t('project.searchPlaceholder')" :width="240" />
    <Select v-model="statusF" :options="STATUS_OPTS" style="min-width: 170px" />
    <div class="flex-1" />
    <span class="text-[12px] text-muted-foreground">{{ t('project.count', { n: tab === 'all' ? projectStore.pagination.total_row : filtered.length }) }}</span>
  </FilterBar>

  <!-- Error banner -->
  <ErrorBanner v-if="projectStore.error" :message="projectStore.error" @retry="refetchAllTab(projectStore.pagination.current_page)" />

  <!-- Project card grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    <template v-if="projectStore.loading">
      <div v-for="i in 6" :key="i" class="card-surface p-5 h-40 animate-pulse" />
    </template>

    <template v-else>
      <div
        v-for="(p, i) in filtered" :key="p.project_id"
        class="card-surface interactive p-5 flex flex-col gap-4 cursor-pointer rise"
        :class="p.status === 2 ? 'opacity-75' : ''"
        :style="{ animationDelay: `${40 + i * 30}ms` }"
        @click="openDetail(p)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <Badge :variant="statusMeta(p.status).variant" dot>{{ statusMeta(p.status).label }}</Badge>
            <h3 class="font-semibold text-foreground line-clamp-2 leading-snug mt-2">{{ p.project_name }}</h3>
            <p class="text-[11.5px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
              <Avatar :name="userName(p.managed_by)" :size="16" />
              {{ userName(p.managed_by) }}
            </p>
          </div>
        </div>

        <p class="text-[12.5px] text-muted-foreground line-clamp-2">{{ p.project_description || t('project.noDescription') }}</p>

        <div v-if="(p.project_targets?.length ?? 0) > 0" class="flex items-center gap-2 flex-wrap">
          <span class="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
            <Target :size="11" /> {{ t('project.targetCount', { n: p.project_targets!.length }) }}
          </span>
          <Badge v-if="hasCurrentQuarterTarget(p)" variant="primary">Q{{ currentQuarter }}/{{ currentYear }}</Badge>
        </div>

        <div class="mt-auto flex items-center justify-between pt-3 border-t border-border/60 text-[12px]">
          <div class="flex -space-x-2">
            <Avatar
              v-for="m in (cardMembers[p.project_id] ?? []).slice(0, 5)" :key="m.userId"
              :name="m.name" :size="24" class="border-2 border-card"
            />
            <div v-if="(cardMembers[p.project_id]?.length ?? 0) > 5" class="h-6 w-6 rounded-lg border-2 border-card bg-muted flex items-center justify-center text-[9.5px] font-semibold text-muted-foreground">
              +{{ cardMembers[p.project_id]!.length - 5 }}
            </div>
          </div>
          <span class="font-mono text-muted-foreground text-[11px]">{{ p.created_at || '—' }}</span>
        </div>
      </div>

      <div v-if="filtered.length === 0" class="col-span-full">
        <EmptyState :icon="FolderOpen" :title="t('project.noProjects')" />
      </div>
    </template>
  </div>

  <!-- Pagination — "Của tôi" comes back unpaginated from the backend, so
       there's nothing to page through there. -->
  <div v-if="tab === 'all' && projectStore.pagination.total_row > 0" class="card-surface overflow-hidden">
    <Pagination
      :page="projectStore.pagination.current_page"
      :total="projectStore.pagination.total_row"
      :per-page="projectStore.pagination.row_per_page"
      @change="refetchAllTab"
    />
  </div>

  <!-- ── Project detail slide-over ── -->
  <Teleport to="body">
    <div v-if="openProjectId !== null" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="closeDetail" />
      <div class="relative bg-background border-l border-border w-full max-w-2xl h-full flex flex-col rise" style="animation-duration: .3s">
        <template v-if="detailLoading">
          <div class="flex-1 flex items-center justify-center">
            <span class="h-8 w-8 rounded-full border-[3px] border-primary/25 border-t-primary animate-spin" />
          </div>
        </template>
        <template v-else-if="!detailProject">
          <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <p class="text-[13.5px] text-muted-foreground">{{ t('project.loadFailed') }}</p>
            <Btn variant="outline" size="sm" @click="closeDetail">{{ t('common.close') }}</Btn>
          </div>
        </template>
        <template v-else>
          <!-- Header -->
          <div class="p-5 border-b border-border/70" style="background: linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 57% / 0.04), transparent 60%)">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="mb-1.5">
                  <Badge :variant="statusMeta(detailProject.status).variant" dot>{{ statusMeta(detailProject.status).label }}</Badge>
                </div>
                <h2 class="font-bold text-[20px] font-heading text-foreground">{{ detailProject.name }}</h2>
                <div class="flex items-center gap-3 mt-2 text-[12px] text-muted-foreground flex-wrap">
                  <span class="inline-flex items-center gap-1.5">
                    <Avatar :name="userName(detailProject.managedBy)" :size="16" />
                    {{ userName(detailProject.managedBy) }}
                  </span>
                  <span>·</span>
                  <span class="font-mono">{{ t('project.createdAt', { date: detailProject.createdAt || '—' }) }}</span>
                </div>
              </div>
              <button class="p-2 rounded-md hover:bg-muted text-muted-foreground shrink-0" @click="closeDetail"><X :size="16" /></button>
            </div>
          </div>

          <!-- Sub-tabs -->
          <div class="border-b border-border/70 px-5 flex gap-5 shrink-0">
            <button
              v-for="[k, l] in [['overview', t('project.detail.overview')], ['targets', t('project.detail.targetsTab', { n: detailProject.targets.length })], ['members', t('project.detail.membersTab', { n: detailMembers.length })]]"
              :key="k"
              :data-active="detailTab === k"
              class="tab-trigger text-[13px]"
              @click="detailTab = k as typeof detailTab"
            >{{ l }}</button>
          </div>

          <!-- Tab content -->
          <div class="flex-1 overflow-y-auto overscroll-contain scrollbar-thin p-5 space-y-5">
            <!-- Overview -->
            <template v-if="detailTab === 'overview'">
              <div class="card-surface p-5">
                <h3 class="section-title mb-2">{{ t('project.detail.description') }}</h3>
                <p class="text-[13.5px] text-foreground/85 leading-relaxed whitespace-pre-wrap">{{ detailProject.desc || t('project.noDescription') }}</p>
              </div>
              <div class="card-surface p-4">
                <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">{{ t('project.detail.manager') }}</p>
                <div class="flex items-center gap-2 mt-1"><Avatar :name="userName(detailProject.managedBy)" :size="24" /><p class="font-medium text-foreground text-[13.5px]">{{ userName(detailProject.managedBy) }}</p></div>
              </div>
              <div v-if="detailSortedTargets.length > 0" class="card-surface p-5">
                <h3 class="section-title mb-3">{{ t('project.detail.latestTarget', { quarter: detailSortedTargets[0]!.quarter, year: detailSortedTargets[0]!.year }) }}</h3>
                <p class="text-[13px] text-foreground/85 whitespace-pre-wrap leading-relaxed">{{ detailSortedTargets[0]!.content }}</p>
              </div>
            </template>

            <!-- Targets -->
            <template v-else-if="detailTab === 'targets'">
              <div v-if="detailSortedTargets.length === 0" class="card-surface py-16 text-center text-muted-foreground">
                <Target :size="36" class="mx-auto mb-2 opacity-30" />
                <p>{{ t('project.detail.noTargets') }}</p>
              </div>
              <div v-else class="space-y-3">
                <div v-for="(t, ti) in detailSortedTargets" :key="ti" class="card-surface overflow-hidden">
                  <div
class="flex items-center gap-2 px-4 py-2.5 border-b border-border/60"
                    style="background: linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 57% / 0.06), transparent)">
                    <Badge variant="primary">{{ $t('project.quarterBadge', { quarter: t.quarter, year: t.year }) }}</Badge>
                  </div>
                  <p class="px-4 py-3 text-[13px] text-foreground/85 whitespace-pre-wrap leading-relaxed">{{ t.content }}</p>
                </div>
              </div>
            </template>

            <!-- Members -->
            <template v-else>
              <div v-if="detailMembers.length === 0" class="card-surface py-16 text-center text-muted-foreground">
                <p>{{ $t('project.detail.noMembers') }}</p>
              </div>
              <ul v-else class="space-y-2.5">
                <li
                  v-for="m in detailMembers" :key="m.userId"
                  class="flex items-center gap-3 p-3 card-surface"
                >
                  <Avatar :name="m.name" :size="36" />
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-foreground">{{ m.name }}</p>
                    <p v-if="m.branch" class="text-[12px] text-muted-foreground">{{ m.branch }}</p>
                  </div>
                  <span class="text-[11px] font-mono text-muted-foreground">{{ m.joinedAt }}</span>
                </li>
              </ul>
            </template>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-border/70 flex items-center gap-2 shrink-0">
            <Btn variant="ghost" size="sm" @click="closeDetail">{{ t('common.close') }}</Btn>
            <div class="flex-1" />
            <Btn v-if="isManagerOrGM" variant="outline" size="sm" @click="openDeleteConfirm(detailProject.id)">{{ t('common.delete') }}</Btn>
            <Btn v-if="isManagerOrGM" variant="primary" size="sm" @click="openEditModal({ project_id: detailProject.id, project_name: detailProject.name, managed_by: detailProject.managedBy, status: detailProject.status, project_description: detailProject.desc, project_targets: detailProject.targets, created_at: detailProject.createdAt })">
              <FileText :size="13" />{{ t('common.edit') }}
            </Btn>
          </div>
        </template>
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
            <div
class="w-8 h-8 rounded-xl flex items-center justify-center"
              style="background: linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 65%), hsl(var(--primary-h) var(--primary-s) 45%))">
              <Folder :size="14" class="text-white" />
            </div>
            <div>
              <h3 class="font-heading font-bold text-[15px] text-foreground">{{ modalEditingId === null ? t('project.newProject') : t('project.editProject') }}</h3>
              <p class="text-[11.5px] text-muted-foreground">{{ t('project.modalSubtitle') }}</p>
            </div>
          </div>
          <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="modalOpen = false"><X :size="14" /></button>
        </div>

        <!-- Modal body -->
        <div v-if="modalLoading" class="flex-1 flex items-center justify-center p-10">
          <span class="h-7 w-7 rounded-full border-[3px] border-primary/25 border-t-primary animate-spin" />
        </div>
        <div v-else class="overflow-y-auto overscroll-contain scrollbar-thin flex-1 p-6 space-y-5">
          <!-- Name -->
          <div>
            <label for="modal-project-name" class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('project.form.nameLabel') }} <span class="text-red-400">*</span></label>
            <input
id="modal-project-name" v-model="form.name" :placeholder="t('project.form.namePlaceholder')"
              class="w-full h-9 px-3 rounded-lg border text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/45 bg-card"
              :class="formErrors.name ? 'border-red-400' : 'border-border focus:border-primary/60'" >
            <p v-if="formErrors.name" class="text-[11.5px] text-red-500 mt-1">{{ formErrors.name }}</p>
          </div>

          <!-- Manager + Status -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('project.form.managerLabel') }} <span class="text-red-400">*</span></label>
              <Select v-model="form.managerId" :options="managerOpts" :placeholder="t('project.form.managerPlaceholder')" style="width: 100%" />
              <p v-if="formErrors.managerId" class="text-[11.5px] text-red-500 mt-1">{{ formErrors.managerId }}</p>
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('common.status') }}</label>
              <Select v-model="form.status" :options="STATUS_OPTS.filter(o => o.value !== '0')" style="width: 100%" />
            </div>
          </div>

          <!-- Member search -->
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('project.form.membersLabel') }}</label>
            <div v-if="modalMembers.length > 0" class="flex flex-wrap gap-1.5 mb-2">
              <span
                v-for="m in modalMembers" :key="m.userId"
                class="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-full text-[12px] font-medium"
                style="background: hsl(var(--primary-h) var(--primary-s) 60% / 0.12); color: hsl(var(--primary-h) var(--primary-s) 42%)"
              >
                {{ userName(m.userId) }}
                <button class="h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors" @click="removeMember(m)">
                  <X :size="9" />
                </button>
              </span>
            </div>
            <div class="relative">
              <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
v-model="memberSearch" :placeholder="t('project.form.memberSearchPlaceholder')"
                class="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground/45" >
            </div>
            <div v-if="memberSearch && memberResults.length > 0" class="card-surface border border-border shadow-sm rounded-xl overflow-hidden mt-1">
              <button
                v-for="m in memberResults.slice(0, 5)" :key="m.id"
                class="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/40 transition-colors text-left"
                @click="addMember(m.id)"
              >
                <Avatar :name="m.name" :size="24" /><span class="text-[13px] text-foreground">{{ m.name }}</span>
              </button>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('project.form.descLabel') }}</label>
            <textarea
v-model="form.desc" rows="3" :placeholder="t('project.form.descPlaceholder')"
              class="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 resize-none placeholder:text-muted-foreground/45" />
          </div>

          <!-- Quarterly targets editor -->
          <div class="pt-1 border-t border-dashed border-border/70">
            <div class="flex items-center gap-2 mb-3 mt-4">
              <Target :size="14" class="text-primary" />
              <p class="text-[12.5px] font-semibold text-foreground">{{ t('project.form.targetsTitle') }}</p>
              <span v-if="modalTargets.length > 0" class="text-[11px] font-mono text-muted-foreground">({{ modalTargets.length }})</span>
            </div>

            <div class="space-y-2.5">
              <!-- Existing targets -->
              <div v-for="t in sortedTargets" :key="t.key" class="rounded-xl border border-border bg-muted/20 overflow-hidden">
                <div class="flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-muted/30">
                  <Badge variant="primary">{{ $t('project.quarterBadge', { quarter: t.quarter, year: t.year }) }}</Badge>
                  <div class="ml-auto flex items-center gap-1">
                    <button
class="h-6 px-2 rounded text-[11.5px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      @click="openEditTargetDraft(t)">
                      {{ $t('common.edit') }}
                    </button>
                    <button
class="h-6 px-2 rounded text-[11.5px] font-medium text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
                      @click="removeTarget(t.key)">
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </div>
                <p class="px-3 py-2 text-[12.5px] text-foreground/85 whitespace-pre-wrap leading-relaxed">{{ t.content }}</p>
              </div>

              <!-- Draft form -->
              <div v-if="draftTarget" class="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('project.form.yearLabel') }}</label>
                    <Select v-model="draftTarget.year" :options="YEAR_OPTS" style="width: 100%" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('project.form.quarterLabel') }}</label>
                    <Select v-model="draftTarget.quarter" :options="QUARTER_OPTS" style="width: 100%" />
                  </div>
                </div>
                <div>
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('project.form.targetContentLabel') }} <span class="text-red-400">*</span></label>
                  <textarea
v-model="draftTarget.content" rows="4"
                    :placeholder="t('project.form.targetContentPlaceholder')"
                    class="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 resize-none leading-relaxed placeholder:text-muted-foreground/45" />
                </div>
                <div class="flex items-center justify-end gap-2">
                  <Btn variant="ghost" size="xs" @click="draftTarget = null">{{ t('common.cancel') }}</Btn>
                  <Btn variant="primary" size="xs" @click="commitTargetDraft">{{ draftTarget.key != null ? t('project.form.saveTarget') : t('project.form.addTarget') }}</Btn>
                </div>
              </div>

              <!-- Add button -->
              <button
v-else
                class="w-full py-3 rounded-xl border-2 border-dashed border-border text-[13px] font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                @click="openNewTargetDraft"
              >
                <Plus :size="14" /> {{ t('project.form.addTarget') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/70 bg-muted/20 shrink-0">
          <Btn variant="outline" size="sm" @click="modalOpen = false">{{ t('common.cancel') }}</Btn>
          <Btn variant="primary" size="sm" :disabled="modalSaving || modalLoading" @click="submitModal">
            <Plus v-if="modalEditingId === null" :size="13" />
            {{ t('common.save') }}
          </Btn>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── Delete Confirm Modal ── -->
  <Modal v-model:open="deleteConfirmOpen" :title="t('project.deleteConfirm.title')" :max-width="400">
    <div class="px-6 py-4">
      <p class="text-[13.5px] text-foreground/85">{{ t('project.deleteConfirm.body') }}</p>
    </div>
    <template #footer>
      <Btn variant="ghost" size="sm" @click="deleteConfirmOpen = false">{{ t('common.cancel') }}</Btn>
      <Btn variant="danger" size="sm" @click="confirmDelete">{{ t('common.confirm') }}</Btn>
    </template>
  </Modal>
</div>
</template>
