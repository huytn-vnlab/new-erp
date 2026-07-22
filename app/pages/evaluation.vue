<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import type { Directive } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { FileText, Plus, X, Check, ChevronDown, ChevronRight, Trash2, ClipboardList, Download } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import Select from '~/components/base/Select.vue'
import FilterBar from '~/components/base/FilterBar.vue'
import FieldInput from '~/components/base/FieldInput.vue'
import SectionCard from '~/components/home/SectionCard.vue'
import LineChart from '~/components/charts/LineChart.vue'
import SkeletonRow from '~/components/base/SkeletonRow.vue'
import EmptyState from '~/components/base/EmptyState.vue'
import ErrorBanner from '~/components/base/ErrorBanner.vue'
import Pagination from '~/components/base/Pagination.vue'
import { useEvaluationStore } from '~/stores/evaluation'
import { EVAL_STATUS_CANONICAL, EVAL_STATUS_META, RANK_LETTER, RANK_COLOR } from '~/mocks/evaluation'
import type { EvalContent, EvaluationDetail, EvaluationRow } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const auth = useAuth()
const evalStore = useEvaluationStore()
const { show } = useToast()
const { t } = useI18n()

// EVAL_STATUS_META's labels are static VI strings — this wraps them with i18n
// labels while keeping the same variant/bucketing (see mocks/evaluation.ts).
const EVAL_STATUS_LABEL_KEY: Record<number, string> = { 1: 'creating', 2: 'created', 3: 'creating', 4: 'created', 5: 'created', 6: 'approved' }
const evalStatusMeta = (status: number) => {
  const base = EVAL_STATUS_META[status]
  return base ? { label: t(`evaluation.status.${EVAL_STATUS_LABEL_KEY[status]}`), variant: base.variant } : undefined
}

// ── List state — declared BEFORE onMounted/watch to avoid TDZ errors ──
const today = new Date()
const currentQuarter = Math.floor(today.getMonth() / 3) + 1
const year = ref(String(today.getFullYear()))
const quarter = ref(String(currentQuarter))
// A quarter that hasn't started yet has no evaluation to browse or submit —
// disable it in both the list filter banner and the create-form period picker.
function isFutureQuarter(q: string, y: string): boolean {
  const yy = parseInt(y)
  return yy > today.getFullYear() || (yy === today.getFullYear() && parseInt(q) > currentQuarter)
}
const tab = ref<'manage' | 'mine' | 'reports'>('manage')
const search = ref('')
const statusF = ref(0)
const rankF = ref(0)
const branchF = ref(0)
const projectF = ref(0)
const openEval = ref<EvaluationRow | null>(null)
const showCreate = ref(false)
const selectedIds = ref<number[]>([])
// True while switching Kỳ (year/quarter) — that one change fans out into table +
// summary cards + rank distribution + trend chart fetches all at once, so the
// stale numbers flash otherwise; a full-screen overlay covers that gap.
const periodLoading = ref(false)

const roleName = computed(() => auth.user.value?.role_name?.toLowerCase() ?? '')
const isGM = computed(() => roleName.value === 'general manager')
const isManagerOrGM = computed(() => roleName.value === 'manager' || roleName.value === 'general manager')

// GeneralManager sees everyone (empty user_ids); Manager is narrowed to (self +
// managed users); a plain employee's managed list is empty so this naturally
// collapses to [self] — matching old ERP's userIDParam getter.
const managedUserIds = ref<number[]>([])
async function loadManagedUserIds() {
  if (isGM.value) return
  managedUserIds.value = await evalStore.fetchManagedUserIds()
}

const scopedUserIds = computed<number[]>(() => {
  if (isGM.value) return []
  const self = auth.user.value?.id
  const ids = [...managedUserIds.value]
  if (self && !ids.includes(self)) ids.push(self)
  return ids
})
const mineUserIds = computed<number[]>(() => {
  const self = auth.user.value?.id
  return self ? [self] : []
})

function currentFilterParams() {
  // "Phiếu của tôi" shows the user's full history — each user only ever has one
  // form per quarter, so filtering that list by the selected Kỳ just hides rows
  // instead of narrowing anything useful.
  const isMine = tab.value === 'mine'
  return {
    name: search.value.trim() || undefined,
    year: isMine ? undefined : parseInt(year.value),
    quarter: isMine ? undefined : parseInt(quarter.value),
    status: statusF.value || undefined,
    rank: rankF.value || undefined,
    branch: branchF.value || undefined,
    project_id: projectF.value || undefined,
    user_ids: isMine ? mineUserIds.value : scopedUserIds.value,
  }
}

function fetchList(page = 1) {
  return evalStore.fetchEvaluations({ ...currentFilterParams(), current_page: page })
}

// Kỳ change fans out into the table, the summary cards, rank distribution/top
// performers, and the trend chart — run them together behind periodLoading so
// the page doesn't flash stale numbers from the old quarter while they resolve.
async function reloadPeriod() {
  selectedIds.value = []
  periodLoading.value = true
  try {
    await Promise.all([fetchList(1), fetchReportRows(), fetchTrend()])
  } finally {
    periodLoading.value = false
  }
}

onMounted(async () => {
  // Cold page load can race auth's own profile fetch — role_name/id must be
  // loaded before we compute isGM/scopedUserIds, or a GeneralManager briefly
  // looks like a plain user and gets wrongly scoped to self-only.
  if (!auth.user.value && auth.token.value) await auth.fetchUser()
  await loadManagedUserIds()
  await reloadPeriod()
})

watch([year, quarter], reloadPeriod)
watch([statusF, rankF, branchF, projectF, tab], () => {
  selectedIds.value = []
  fetchList(1)
})
watchDebounced(search, () => fetchList(1), { debounce: 300 })

// ── Form state — mirrors the backend's real Content jsonb shape ───────────
// (Common single object / Individual+Project+Challenge lists / Comment / Result).
// String-typed fields are number inputs bound as strings, coerced on submit.
type IndividualForm = { weight: string; item: string; goal: string; actual_eval: string }
type ProjectGoalForm = { id: number | ''; self_assessment: string; superior_eval: string; weight: string }
type ChallengeForm = { name: string; actions: string; self_assessment: string; superior_eval: string; weight: string }

const editingId = ref<number | null>(null)
const formOwnerId = ref<number | null>(null)
const formOwnerName = ref('')
const formStatus = ref(2)
const formYear = ref(year.value)
const formQuarter = ref(quarter.value)
const formLoading = ref(false)
const formSaving = ref(false)
const sectionCollapsed = ref<Record<string, boolean>>({ common: false, individual: false, project: false, challenge: false })

const common = reactive({ value: '', numeric: '', weight: '', actual_eval: '' })
const individuals = ref<IndividualForm[]>([])
const projectGoals = ref<ProjectGoalForm[]>([])
const challenges = ref<ChallengeForm[]>([])
const commentSelf = ref('')
const commentSup = ref('')

// Owner-decided mode (per user's design call): no manual self/supervisor toggle —
// a brand-new form is always self; an existing form is self-editable only for its
// owner, and supervisor-editable only for a non-owner (manager/GM) viewing it.
const isFormOwner = computed(() => editingId.value === null || formOwnerId.value === auth.user.value?.id)

// Form number fields are plain text inputs (not type="number") so the browser's
// up/down spinner never shows — this keeps only digits and a single decimal
// point, so a negative sign, letters, or "e" can never end up in the value.
function sanitizeNumeric(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const firstDot = cleaned.indexOf('.')
  if (firstDot === -1) return cleaned
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
}
function onNumericInput(e: Event, setter: (v: string) => void) {
  const el = e.target as HTMLInputElement
  const cleaned = sanitizeNumeric(el.value)
  if (el.value !== cleaned) el.value = cleaned
  setter(cleaned)
}

// Goal/description fields grow with the user's line breaks instead of scrolling
// inside a fixed-height box — reset to 'auto' before reading scrollHeight so the
// textarea shrinks back down too when lines are removed, not just grows.
function resizeTextarea(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  // Elements are box-sizing:border-box (Tailwind preflight) but scrollHeight
  // excludes border — add it back, or the JS-set height ends up ~border-width
  // short of a same-padding sibling <input>'s natural border-box height, so a
  // single-line textarea would render a hair shorter than the inputs beside it.
  const borderY = el.offsetHeight - el.clientHeight
  el.style.height = `${el.scrollHeight + borderY}px`
}
const vAutoResize: Directive<HTMLTextAreaElement> = {
  mounted: resizeTextarea,
  updated: resizeTextarea,
}

function calcPoints(weight: string | number, rate: string | number): number {
  const w = Number(weight) || 0
  const r = Number(rate) || 0
  return +(w * r / 100).toFixed(2)
}
function individualRate(row: IndividualForm): number {
  const goal = Number(row.goal) || 0
  const actual = Number(row.actual_eval) || 0
  return goal ? +(actual / goal * 100).toFixed(2) : 0
}

function blankIndividual(): IndividualForm { return { weight: '', item: '', goal: '', actual_eval: '' } }
function blankProjectGoal(): ProjectGoalForm { return { id: '', self_assessment: '', superior_eval: '', weight: '' } }
function blankChallenge(): ChallengeForm { return { name: '', actions: '', self_assessment: '', superior_eval: '', weight: '' } }

function resetFormState() {
  editingId.value = null
  formOwnerId.value = auth.user.value?.id ?? null
  formOwnerName.value = auth.user.value?.name ?? ''
  formStatus.value = 2
  formQuarter.value = quarter.value
  formYear.value = year.value
  common.value = ''; common.numeric = ''; common.weight = ''; common.actual_eval = ''
  individuals.value = [blankIndividual(), blankIndividual()]
  projectGoals.value = [blankProjectGoal()]
  challenges.value = [blankChallenge()]
  commentSelf.value = ''
  commentSup.value = ''
}

function populateFormFromDetail(detail: EvaluationDetail) {
  editingId.value = detail.id
  formOwnerId.value = detail.user_id
  formOwnerName.value = evalStore.users[String(detail.user_id)] ?? ''
  formStatus.value = detail.status
  formQuarter.value = String(detail.quarter)
  formYear.value = String(detail.year)
  const c = detail.content?.common
  common.value = c?.value ?? ''
  common.numeric = c?.numeric ? String(c.numeric) : ''
  common.weight = c?.weight ? String(c.weight) : ''
  common.actual_eval = c?.actual_eval ? String(c.actual_eval) : ''
  individuals.value = (detail.content?.individuals ?? []).map(i => ({
    weight: i.weight ? String(i.weight) : '',
    item: i.item ?? '',
    goal: i.goal ? String(i.goal) : '',
    actual_eval: i.actual_eval ? String(i.actual_eval) : '',
  }))
  if (individuals.value.length === 0) individuals.value = [blankIndividual()]
  projectGoals.value = (detail.content?.projects ?? []).map(p => ({
    id: p.id || '',
    self_assessment: p.self_assessment ? String(p.self_assessment) : '',
    superior_eval: p.superior_eval ? String(p.superior_eval) : '',
    weight: p.weight ? String(p.weight) : '',
  }))
  if (projectGoals.value.length === 0) projectGoals.value = [blankProjectGoal()]
  challenges.value = (detail.content?.challenges ?? []).map(c2 => ({
    name: c2.name ?? '',
    actions: c2.actions ?? '',
    self_assessment: c2.self_assessment ? String(c2.self_assessment) : '',
    superior_eval: c2.superior_eval ? String(c2.superior_eval) : '',
    weight: c2.weight ? String(c2.weight) : '',
  }))
  if (challenges.value.length === 0) challenges.value = [blankChallenge()]
  commentSelf.value = detail.content?.comment?.self_cmt ?? ''
  commentSup.value = detail.content?.comment?.superior_cmt ?? ''
}

function addIndividual() { individuals.value.push(blankIndividual()) }
function removeIndividual(i: number) { if (individuals.value.length > 1) individuals.value.splice(i, 1) }
function addProjectGoal() { projectGoals.value.push(blankProjectGoal()) }
function removeProjectGoal(i: number) { if (projectGoals.value.length > 1) projectGoals.value.splice(i, 1) }
function addChallenge() { challenges.value.push(blankChallenge()) }
function removeChallenge(i: number) { if (challenges.value.length > 1) challenges.value.splice(i, 1) }

async function openCreateForm() {
  resetFormState()
  showCreate.value = true
  formLoading.value = true
  const existing = await evalStore.checkExists(parseInt(formQuarter.value), parseInt(formYear.value))
  formLoading.value = false
  if (existing) {
    populateFormFromDetail(existing)
    show(t('evaluation.toast.alreadyExists'))
  }
}

async function openEditForm(id: number) {
  showCreate.value = true
  formLoading.value = true
  const detail = await evalStore.getEvaluation(id)
  formLoading.value = false
  if (detail) {
    populateFormFromDetail(detail)
    openEval.value = null
  } else {
    showCreate.value = false
    show(t('evaluation.toast.loadFailed'))
  }
}

// Re-check for an existing form when the (still-uncreated) form's period changes.
watch([formQuarter, formYear], async () => {
  if (editingId.value !== null) return
  const existing = await evalStore.checkExists(parseInt(formQuarter.value), parseInt(formYear.value))
  if (existing) {
    populateFormFromDetail(existing)
    show(t('evaluation.toast.alreadyExists'))
  }
})

async function duplicateAndOpen(id: number) {
  const res = await evalStore.duplicateEvaluation(id)
  if (res.ok && res.id) {
    show(t('evaluation.toast.duplicated'))
    openEval.value = null
    fetchList(evalStore.pagination.current_page)
    fetchReportRows()
    await openEditForm(res.id)
  } else {
    show(res.message || t('evaluation.toast.duplicateFailed'))
  }
}

async function submitForm(status: number, requireFullWeight: boolean) {
  if (requireFullWeight && totalWeight.value !== 100) {
    show(t('evaluation.toast.weightRequired'))
    return
  }
  if (hasIncompleteChallenge.value) {
    show(t('evaluation.toast.challengeIncomplete'))
    return
  }
  formSaving.value = true
  const content = buildContentPayload()
  if (editingId.value === null) {
    const res = await evalStore.createEvaluation({ content, quarter: parseInt(formQuarter.value), year: parseInt(formYear.value) })
    formSaving.value = false
    if (res.ok && res.id) {
      show(t('evaluation.toast.created'))
      editingId.value = res.id
      formOwnerId.value = auth.user.value?.id ?? null
      fetchList(1)
      fetchReportRows()
    } else if ((res.message ?? '').toLowerCase().includes('already exist')) {
      const existing = await evalStore.checkExists(parseInt(formQuarter.value), parseInt(formYear.value))
      if (existing) populateFormFromDetail(existing)
      show(t('evaluation.toast.alreadyExists'))
    } else {
      show(res.message || t('evaluation.toast.createFailed'))
    }
  } else {
    const res = await evalStore.updateEvaluation({
      eval_form_id: editingId.value, content, status,
      quarter: parseInt(formQuarter.value), year: parseInt(formYear.value),
    })
    formSaving.value = false
    if (res.ok) {
      formStatus.value = status
      show(t('evaluation.toast.updated'))
      showCreate.value = false
      fetchList(evalStore.pagination.current_page)
      fetchReportRows()
    } else {
      show(res.message || t('evaluation.toast.updateFailed'))
    }
  }
}

// ── Computed: list ──
// Next year through 3 years back — matches old ERP's getYears getter, computed
// from the real current year instead of a hardcoded list that would go stale.
const yearOpts = Array.from({ length: 5 }, (_, i) => String(today.getFullYear() + 1 - i))
  .map(y => ({ value: y, label: y }))
const statusOpts = computed(() => [
  { value: 0, label: t('evaluation.filters.allStatus') },
  ...EVAL_STATUS_CANONICAL.map(k => ({ value: k, label: evalStatusMeta(k)!.label })),
])
const rankOpts = computed(() => [
  { value: 0, label: t('evaluation.filters.allRank') },
  ...Object.entries(evalStore.ranks).map(([k, v]) => ({ value: Number(k), label: t('evaluation.filters.rankOpt', { n: v }) })),
])
const branchOpts = computed(() => [
  { value: 0, label: t('evaluation.filters.allBranch') },
  ...Object.entries(evalStore.branches).map(([k, v]) => ({ value: Number(k), label: v })),
])
const projectOpts = computed(() => [
  { value: 0, label: t('evaluation.filters.allProject') },
  ...Object.entries(evalStore.projects).map(([k, v]) => ({ value: Number(k), label: v })),
])

const rows = computed(() => evalStore.evaluations)

// Rows treated as "submitted" for stats/reports purposes — anything past the
// explicit draft state (1 Đang tạo): created (2 Đã tạo) or approved (6 Đã duyệt).
const SUBMITTED_STATUSES = [2, 6]

// D(1) < C(4) < B(3) < A(2) < S(5) — cf.EvaluationRankList's numeric ids are NOT
// ordered by grade quality, so map to an explicit best→worst ordinal for sorting.
const RANK_ORDER: Record<number, number> = { 5: 5, 2: 4, 3: 3, 4: 2, 1: 1 }

// Fetched separately (row_per_page:0 = all matching rows) so stats/reports reflect
// the whole period, not just the current page of the browsable table below.
// Always scoped to the "manage" user set (self + managed, or everyone for GM) —
// the summary cards describe the team's period, not whichever tab/table is open,
// so switching to "Phiếu của tôi" must not narrow them down to self-only.
const reportRows = ref<EvaluationRow[]>([])
async function fetchReportRows() {
  reportRows.value = await evalStore.fetchAllEvaluations({
    year: parseInt(year.value),
    quarter: parseInt(quarter.value),
    user_ids: scopedUserIds.value,
  })
}

const stats = computed(() => {
  const total = reportRows.value.length
  const submitted = reportRows.value.filter(e => SUBMITTED_STATUSES.includes(e.status))
  const submittedCount = submitted.length
  const completionPct = Math.round((submittedCount / Math.max(total, 1)) * 100)
  const rankSCount = submitted.filter(e => e.rank === 5).length
  const rankACount = submitted.filter(e => e.rank === 2).length
  const needNudge = total - submittedCount
  return { submittedCount, completionPct, rankSCount, rankACount, needNudge, total }
})

const rankDist = computed(() => {
  const dist: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 }
  reportRows.value.filter(e => SUBMITTED_STATUSES.includes(e.status)).forEach(e => {
    const letter = RANK_LETTER[e.rank]
    if (letter) dist[letter] = (dist[letter] ?? 0) + 1
  })
  return dist
})
const maxRankDist = computed(() => Math.max(...Object.values(rankDist.value), 1))

const topPerformers = computed(() =>
  [...reportRows.value.filter(e => SUBMITTED_STATUSES.includes(e.status) && RANK_LETTER[e.rank])]
    .sort((a, b) => (RANK_ORDER[b.rank] ?? 0) - (RANK_ORDER[a.rank] ?? 0))
    .slice(0, 5)
)

// ── Trend: average total points over the last 4 quarters ──────────────────
function prevQuarter(q: number, y: number): [number, number] {
  return q === 1 ? [4, y - 1] : [q - 1, y]
}
const trendData = ref<{ label: string; value: number }[]>([])
async function fetchTrend() {
  const periods: [number, number][] = []
  let q = parseInt(quarter.value)
  let y = parseInt(year.value)
  for (let i = 0; i < 4; i++) {
    periods.unshift([q, y])
    ;[q, y] = prevQuarter(q, y)
  }
  const results = await Promise.all(
    periods.map(([qq, yy]) => evalStore.fetchAllEvaluations({ year: yy, quarter: qq, user_ids: scopedUserIds.value })),
  )
  trendData.value = periods.map(([qq, yy], i) => {
    const scored = results[i]!.filter(e => SUBMITTED_STATUSES.includes(e.status) && e.point > 0)
    const avg = scored.length ? scored.reduce((a, e) => a + e.point, 0) / scored.length : 0
    return { label: `Q${qq}/${String(yy).slice(2)}`, value: +avg.toFixed(1) }
  })
}

// ── Category averages: needs each row's full Content (list endpoint only has
// the overall rank/point), so this is a bounded fan-out over the current
// period's rows — capped to keep it from ballooning on a very large team. ──
const CATEGORY_META = computed<Array<{ key: 'common' | 'individual' | 'project' | 'challenge'; label: string; accent: string }>>(() => [
  { key: 'common', label: t('evaluation.form.commonTitle'), accent: 'hsl(var(--primary))' },
  { key: 'individual', label: t('evaluation.form.individualTitle'), accent: 'hsl(265 60% 55%)' },
  { key: 'project', label: t('evaluation.form.projectTitle'), accent: 'hsl(160 60% 45%)' },
  { key: 'challenge', label: t('evaluation.form.challengeTitle'), accent: 'hsl(38 92% 50%)' },
])
const categoryAverages = ref<Record<'common' | 'individual' | 'project' | 'challenge', number>>({ common: 0, individual: 0, project: 0, challenge: 0 })
const categoryAveragesLoading = ref(false)
const CATEGORY_FETCH_CAP = 40
async function fetchCategoryAverages() {
  const candidates = reportRows.value.filter(e => SUBMITTED_STATUSES.includes(e.status)).slice(0, CATEGORY_FETCH_CAP)
  if (candidates.length === 0) {
    categoryAverages.value = { common: 0, individual: 0, project: 0, challenge: 0 }
    return
  }
  categoryAveragesLoading.value = true
  try {
    // A handful of the (up to CATEGORY_FETCH_CAP) requests failing shouldn't blank the
    // whole section — isolate each fetch so one bad/dropped request doesn't reject the
    // batch. Fetch in small concurrent chunks rather than all at once — firing 40
    // parallel POSTs in one go was itself causing some to drop ("Failed to fetch").
    const CHUNK_SIZE = 8
    const details: (EvaluationDetail | null)[] = []
    for (let i = 0; i < candidates.length; i += CHUNK_SIZE) {
      const chunk = candidates.slice(i, i + CHUNK_SIZE)
      const chunkResults = await Promise.all(chunk.map(e => evalStore.getEvaluation(e.id).catch(() => null)))
      details.push(...chunkResults)
    }
    const sums = { common: 0, individual: 0, project: 0, challenge: 0 }
    const counts = { common: 0, individual: 0, project: 0, challenge: 0 }
    for (const d of details) {
      const c = d?.content
      if (!c) continue
      if (c.common?.weight) { sums.common += c.common.completion_rate ?? c.common.actual_eval ?? 0; counts.common++ }
      if (c.individuals?.length) {
        const avg = c.individuals.reduce((a, r) => a + (r.completion_rate ?? 0), 0) / c.individuals.length
        sums.individual += avg; counts.individual++
      }
      if (c.projects?.length) {
        const avg = c.projects.reduce((a, r) => a + (r.superior_eval ?? 0), 0) / c.projects.length
        sums.project += avg; counts.project++
      }
      if (c.challenges?.length) {
        const avg = c.challenges.reduce((a, r) => a + (r.superior_eval ?? 0), 0) / c.challenges.length
        sums.challenge += avg; counts.challenge++
      }
    }
    categoryAverages.value = {
      common: counts.common ? Math.round(sums.common / counts.common) : 0,
      individual: counts.individual ? Math.round(sums.individual / counts.individual) : 0,
      project: counts.project ? Math.round(sums.project / counts.project) : 0,
      challenge: counts.challenge ? Math.round(sums.challenge / counts.challenge) : 0,
    }
  } finally {
    categoryAveragesLoading.value = false
  }
}
watch(reportRows, fetchCategoryAverages)

// ── Computed: form totals — matches old ERP's calculatePoints/rank formulas ──
const totalWeight = computed(() =>
  (Number(common.weight) || 0)
  + individuals.value.reduce((a, r) => a + (Number(r.weight) || 0), 0)
  + projectGoals.value.reduce((a, r) => a + (Number(r.weight) || 0), 0)
  + challenges.value.reduce((a, r) => a + (Number(r.weight) || 0), 0)
)
const totalPoints = computed(() => +(
  calcPoints(common.weight, common.actual_eval)
  + individuals.value.reduce((a, r) => a + calcPoints(r.weight, individualRate(r)), 0)
  + projectGoals.value.reduce((a, r) => a + calcPoints(r.weight, r.superior_eval), 0)
  + challenges.value.reduce((a, r) => a + calcPoints(r.weight, r.superior_eval), 0)
).toFixed(2))

// Rank thresholds are on the raw points total (can exceed 100 for overachievement),
// not a 0-10 scale — ported verbatim from old ERP's takeCurrentRank getter.
function rankFromPoints(points: number): number {
  if (points === 0) return 0
  if (points < 85) return 1 // D
  if (points < 95) return 4 // C
  if (points < 100) return 3 // B
  if (points < 110) return 2 // A
  return 5 // S
}
const formRank = computed(() => rankFromPoints(totalPoints.value))
const formRankLetter = computed(() => RANK_LETTER[formRank.value] ?? '—')
const weightDeficit = computed(() => 100 - totalWeight.value)

// Backend's Challenge model requires name+actions+weight all non-empty (unlike
// Individual/Project, which have no required fields) — a row with only some of
// those filled would now be kept (see buildContentPayload) but rejected outright
// by the backend with an opaque "Invalid field value". Catch it here instead with
// a message that says exactly what's missing.
const hasIncompleteChallenge = computed(() =>
  challenges.value.some(r =>
    (r.weight || r.name || r.actions || r.self_assessment || r.superior_eval)
    && !(r.weight && r.name && r.actions),
  ),
)

function buildContentPayload(): EvalContent {
  return {
    common: {
      value: common.value,
      // Backend requires this non-zero (govalidator's `required` rejects float 0)
      // even though it's purely decorative — old ERP never uses it in any calc.
      numeric: Number(common.numeric) || 100,
      actual_eval: Number(common.actual_eval) || 0,
      completion_rate: Number(common.actual_eval) || 0,
      points: calcPoints(common.weight, common.actual_eval),
      weight: Number(common.weight) || 0,
    },
    // A row is only dropped when it's genuinely untouched (matches the blank
    // placeholder rows resetFormState seeds new sections with) — requiring EVERY
    // field to be filled before keeping a row used to silently discard the whole
    // row the moment a user left just one field blank, with no warning that it
    // wouldn't be saved. Any field filled in is enough to keep the row.
    individuals: individuals.value.filter(r => r.weight || r.item || r.goal || r.actual_eval).map(r => ({
      weight: Number(r.weight) || 0,
      item: r.item,
      goal: Number(r.goal) || 0,
      actual_eval: Number(r.actual_eval) || 0,
      completion_rate: individualRate(r),
      points: calcPoints(r.weight, individualRate(r)),
    })),
    projects: projectGoals.value.filter(r => r.weight || r.id || r.self_assessment || r.superior_eval).map(r => ({
      id: Number(r.id) || 0,
      self_assessment: Number(r.self_assessment) || 0,
      superior_eval: Number(r.superior_eval) || 0,
      points: calcPoints(r.weight, r.superior_eval),
      weight: Number(r.weight) || 0,
    })),
    challenges: challenges.value.filter(r => r.weight || r.name || r.actions || r.self_assessment || r.superior_eval).map(r => ({
      name: r.name,
      actions: r.actions,
      self_assessment: Number(r.self_assessment) || 0,
      superior_eval: Number(r.superior_eval) || 0,
      points: calcPoints(r.weight, r.superior_eval),
      weight: Number(r.weight) || 0,
    })),
    comment: { self_cmt: commentSelf.value, superior_cmt: commentSup.value, jiken_cmt: '' },
    result: {
      total_actual_eval: totalPoints.value,
      completion_rate: totalWeight.value ? +(totalPoints.value / totalWeight.value * 100).toFixed(2) : 0,
      points: totalPoints.value,
      weight: totalWeight.value,
      rank: formRank.value,
    },
  }
}

// EvalDetail helpers — real fields only (list endpoint has no score/content, so
// no donut/section-breakdown/comment/history preview until the form rewrite pass)
const detailRankLetter = computed(() => openEval.value ? RANK_LETTER[openEval.value.rank] : undefined)

async function exportOne(id: number) {
  const files = await evalStore.exportSelected([id])
  downloadBase64Files(files)
}

// ── List actions ──
function branchName(id: number): string {
  return evalStore.branches[String(id)] ?? '—'
}

function rankLetter(rank: number): string | undefined {
  return RANK_LETTER[rank]
}
function rankColor(rank: number): string {
  const letter = RANK_LETTER[rank]
  return (letter ? RANK_COLOR[letter] : undefined) ?? '#a3a3a3'
}

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const allSelectedOnPage = computed(() =>
  rows.value.length > 0 && rows.value.every(r => selectedIds.value.includes(r.id))
)
function toggleSelectAll() {
  if (allSelectedOnPage.value) {
    selectedIds.value = selectedIds.value.filter(id => !rows.value.some(r => r.id === id))
  } else {
    selectedIds.value = [...new Set([...selectedIds.value, ...rows.value.map(r => r.id)])]
  }
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function downloadBase64Files(files: { buf: string; file_name: string }[]) {
  for (const f of files) {
    const blob = new Blob([base64ToBytes(f.buf) as BlobPart], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${f.file_name.replace(/\s/g, '')}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
}

async function exportSelectedRows() {
  if (selectedIds.value.length === 0) return
  const files = await evalStore.exportSelected(selectedIds.value)
  downloadBase64Files(files)
}

async function exportAllFiltered() {
  await evalStore.exportFiltered({
    ...currentFilterParams(),
    user_ids: tab.value === 'mine' ? mineUserIds.value : scopedUserIds.value,
  })
}

const deleteConfirmId = ref<number | null>(null)
async function confirmDelete(id: number) {
  const res = await evalStore.deleteEvaluation(id)
  deleteConfirmId.value = null
  if (res.ok) {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
    if (openEval.value?.id === id) openEval.value = null
    fetchList(evalStore.pagination.current_page)
    fetchReportRows()
  }
}

// ── Functions ──
function accentOpacity(accent: string, opacity: number): string {
  if (accent.includes('var(--primary)') && !accent.includes('var(--primary-h)')) {
    return `hsl(var(--primary-h) var(--primary-s) 55% / ${opacity})`
  }
  return accent.replace(')', ` / ${opacity})`)
}
</script>

<template>
<div>
  <!-- ============================================================ FORM MODE -->
  <div v-if="showCreate" class="space-y-6">
    <PageHeader
      :eyebrow="undefined"
      :title="undefined"
    >
      <template #eyebrow>
        <span class="inline-flex items-center gap-2 text-[12px]">
          <button class="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" @click="showCreate = false">
            <ChevronRight :size="11" class="rotate-180" /> {{ t('evaluation.eyebrow') }}
          </button>
          <span class="text-border">/</span>
          <span class="text-foreground font-semibold">{{ editingId === null ? t('evaluation.form.createCrumb') : t('evaluation.form.editCrumb') }}</span>
        </span>
      </template>
      <template #title>
        {{ t('evaluation.form.titlePrefix') }} <em class="font-display not-italic text-primary">Q{{ formQuarter }}/{{ formYear }}</em>
      </template>
      <template #actions>
        <Btn variant="ghost" @click="showCreate = false">{{ t('common.cancel') }}</Btn>
        <template v-if="editingId === null">
          <Btn variant="primary" :disabled="formSaving" @click="submitForm(2, false)"><Check :size="14" />{{ t('evaluation.form.createBtn') }}</Btn>
        </template>
        <template v-else-if="isFormOwner">
          <Btn variant="outline" :disabled="formSaving" @click="submitForm(1, false)"><FileText :size="14" />{{ t('evaluation.form.saveDraftBtn') }}</Btn>
          <Btn variant="primary" :disabled="formSaving" @click="submitForm(2, true)"><Check :size="14" />{{ t('evaluation.form.submitBtn') }}</Btn>
        </template>
        <template v-else>
          <Btn variant="outline" :disabled="formSaving" @click="submitForm(2, false)"><FileText :size="14" />{{ t('evaluation.form.saveDraftBtn') }}</Btn>
          <Btn variant="primary" :disabled="formSaving" @click="submitForm(6, true)"><Check :size="14" />{{ t('evaluation.form.approveBtn') }}</Btn>
        </template>
      </template>
    </PageHeader>

    <!-- Hero summary card -->
    <div class="card-surface overflow-hidden rise" style="animation-delay: 40ms">
      <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-0">
        <div class="p-5 relative overflow-hidden">
          <div class="absolute -right-12 -top-12 w-44 h-44 rounded-full pointer-events-none"
            style="background: radial-gradient(circle, hsl(var(--primary-h) var(--primary-s) 60% / 0.16), transparent 65%)" />
          <div class="relative flex items-start gap-4">
            <Avatar :name="formOwnerName || 'N/A'" :size="56" />
            <div class="min-w-0 flex-1">
              <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">{{ t('evaluation.form.employeeLabel') }}</p>
              <h2 class="text-[20px] font-bold font-heading text-foreground mt-0.5 leading-tight">{{ formOwnerName || '—' }}</h2>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <Badge :variant="evalStatusMeta(formStatus)?.variant ?? 'gray'" dot>{{ evalStatusMeta(formStatus)?.label ?? '—' }}</Badge>
                <Badge variant="gray">{{ isFormOwner ? t('evaluation.form.selfEvalBadge') : t('evaluation.form.supervisorEvalBadge') }}</Badge>
              </div>
            </div>
          </div>
          <div class="mt-5 pt-5 border-t border-border/70">
            <label class="text-[10.5px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5 block">{{ t('evaluation.periodLabel') }}</label>
            <div class="flex items-center gap-2">
              <div class="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
                <button
                  v-for="q in ['1','2','3','4']" :key="q"
                  :disabled="editingId !== null || isFutureQuarter(q, formYear)"
                  class="h-7 px-2.5 rounded-[5px] text-[11.5px] font-semibold tabular-nums disabled:opacity-60 disabled:pointer-events-none"
                  :class="formQuarter === q ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click="formQuarter = q"
                >Q{{ q }}</button>
              </div>
              <Select v-model="formYear" :disabled="editingId !== null" :options="yearOpts" style="min-width: 90px" />
            </div>
          </div>
        </div>
        <div class="border-l border-border/70 bg-muted/20 p-5 grid grid-cols-3 gap-4 items-center">
          <div class="text-center">
            <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">{{ t('evaluation.form.totalWeight') }}</p>
            <p class="text-[28px] font-bold font-heading tabular-nums mt-1"
              :class="totalWeight === 100 ? 'text-emerald-600' : totalWeight > 100 ? 'text-red-500' : 'text-foreground'">
              {{ totalWeight }}<span class="text-muted-foreground text-[14px] font-normal">/100</span>
            </p>
            <p v-if="totalWeight !== 100" class="text-[10.5px] mt-0.5" :class="weightDeficit > 0 ? 'text-amber-600' : 'text-red-500'">
              {{ weightDeficit > 0 ? t('evaluation.form.weightShort', { n: weightDeficit }) : t('evaluation.form.weightOver', { n: -weightDeficit }) }}
            </p>
            <p v-else class="text-[10.5px] mt-0.5 text-emerald-600">{{ t('evaluation.form.weightComplete') }}</p>
          </div>
          <div class="text-center">
            <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">{{ t('evaluation.form.totalPoints') }}</p>
            <p class="text-[28px] font-bold font-heading tabular-nums mt-1 text-primary">
              {{ totalPoints.toFixed(1) }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">{{ t('evaluation.form.rankLabel') }}</p>
            <div class="mt-1.5 inline-flex flex-col items-center gap-0.5">
              <span v-if="formRank" class="inline-flex items-center justify-center w-12 h-12 rounded-xl text-[22px] font-bold text-white font-heading"
                :style="{ background: RANK_COLOR[formRankLetter] }">{{ formRankLetter }}</span>
              <span v-else class="inline-flex items-center justify-center w-12 h-12 rounded-xl text-[22px] font-bold text-muted-foreground font-heading bg-muted">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Common goal (single row, not a list) -->
    <div class="card-surface rise overflow-hidden" style="animation-delay: 80ms; background: color-mix(in srgb, hsl(var(--primary)) 5%, hsl(var(--card)))">
      <div class="px-5 py-3 border-b flex items-center gap-3" style="background: color-mix(in srgb, hsl(var(--primary)) 12%, hsl(var(--card)))">
        <span class="h-7 w-1 rounded-full" style="background: hsl(var(--primary))" />
        <button class="inline-flex items-center gap-2" @click="sectionCollapsed.common = !sectionCollapsed.common">
          <ChevronDown :size="14" class="text-muted-foreground transition-transform" :class="sectionCollapsed.common ? '-rotate-90' : ''" />
          <h3 class="section-title">{{ t('evaluation.form.commonTitle') }}</h3>
        </button>
        <p class="text-[11.5px] text-muted-foreground hidden md:block">{{ t('evaluation.form.commonSubtitle') }}</p>
        <div class="flex-1" />
        <span class="px-2 py-0.5 rounded-full font-mono text-[11.5px]" style="background: hsl(var(--primary) / 0.14); color: hsl(var(--primary))">
          {{ t('evaluation.form.scorePrefix') }} <strong class="tabular-nums">{{ calcPoints(common.weight, common.actual_eval).toFixed(1) }}</strong>
        </span>
      </div>
      <div v-if="!sectionCollapsed.common" class="p-5 grid grid-cols-1 md:grid-cols-[80px_1fr_110px_110px] gap-3 items-start">
        <div>
          <label class="block text-[11px] text-muted-foreground mb-1">{{ t('evaluation.form.weightPctLabel') }}</label>
          <input :value="common.weight" @input="onNumericInput($event, v => common.weight = v)" inputmode="decimal" :readonly="!isFormOwner" class="w-full px-2.5 py-1.5 rounded-md text-[13px] text-right outline-none border"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-muted/20 text-foreground/70 cursor-default'">
        </div>
        <div>
          <label class="block text-[11px] text-muted-foreground mb-1">{{ t('evaluation.form.goalNameLabel') }}</label>
          <textarea v-model="common.value" v-auto-resize :readonly="!isFormOwner" :placeholder="t('evaluation.form.commonGoalNamePlaceholder')" rows="1"
            class="w-full px-2.5 py-1.5 rounded-md text-[13px] outline-none border resize-none overflow-hidden"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-muted/20 text-foreground/70 cursor-default'"
            @input="resizeTextarea($event.target as HTMLTextAreaElement)" />
        </div>
        <div>
          <label class="block text-[11px] text-muted-foreground mb-1 text-right">{{ t('evaluation.form.targetLabel') }}</label>
          <input :value="common.numeric" @input="onNumericInput($event, v => common.numeric = v)" inputmode="decimal" :readonly="!isFormOwner" class="w-full px-2.5 py-1.5 rounded-md text-[13px] text-right outline-none border"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-muted/20 text-foreground/70 cursor-default'">
        </div>
        <div>
          <label class="block text-[11px] text-muted-foreground mb-1 text-right">
            {{ t('evaluation.form.actualPctLabel') }}
          </label>
          <!-- Unlike Trọng số/Chỉ tiêu (owner sets these when creating the goal), Thực
               tế is the actual completion result — old ERP restricts this to the
               supervisor only, never the self-reporting owner (see isAllowedUserEval
               in micro-erp-spa's TargetEvaluationForm). -->
          <input :value="common.actual_eval" @input="onNumericInput($event, v => common.actual_eval = v)" inputmode="decimal" :readonly="isFormOwner" class="w-full px-2.5 py-1.5 rounded-md text-[13px] text-right outline-none border"
            :class="!isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-muted/20 text-foreground/70 cursor-default'"
            :style="!isFormOwner && common.actual_eval ? { color: 'hsl(265 60% 55%)' } : {}">
        </div>
      </div>
    </div>

    <!-- Individual goals -->
    <div class="card-surface rise overflow-hidden" style="animation-delay: 140ms; background: color-mix(in srgb, hsl(265 60% 55%) 5%, hsl(var(--card)))">
      <div class="px-5 py-3 border-b flex items-center gap-3" style="background: color-mix(in srgb, hsl(265 60% 55%) 12%, hsl(var(--card)))">
        <span class="h-7 w-1 rounded-full" style="background: hsl(265 60% 55%)" />
        <button class="inline-flex items-center gap-2" @click="sectionCollapsed.individual = !sectionCollapsed.individual">
          <ChevronDown :size="14" class="text-muted-foreground transition-transform" :class="sectionCollapsed.individual ? '-rotate-90' : ''" />
          <h3 class="section-title">{{ t('evaluation.form.individualTitle') }}</h3>
        </button>
        <p class="text-[11.5px] text-muted-foreground hidden md:block">{{ t('evaluation.form.individualSubtitle') }}</p>
        <div class="flex-1" />
        <span class="px-2 py-0.5 rounded-full font-mono text-[11.5px]" style="background: hsl(265 60% 55% / 0.14); color: hsl(265 60% 55%)">
          {{ t('evaluation.form.scorePrefix') }} <strong class="tabular-nums">{{ individuals.reduce((a, r) => a + calcPoints(r.weight, individualRate(r)), 0).toFixed(1) }}</strong>
        </span>
      </div>
      <div v-if="!sectionCollapsed.individual" class="divide-y divide-border/60">
        <div class="px-5 py-2 bg-muted/30 grid items-center gap-3 text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground"
          style="grid-template-columns: 70px 1.4fr 90px 90px 90px 80px 28px">
          <span>{{ t('evaluation.form.colWeight') }}</span><span>{{ t('evaluation.form.colGoalName') }}</span><span class="text-right">{{ t('evaluation.form.colTarget') }}</span>
          <span class="text-right">{{ t('evaluation.form.colActual') }}</span><span class="text-right">{{ t('evaluation.form.colRate') }}</span><span class="text-right">{{ t('evaluation.form.colPoints') }}</span><span />
        </div>
        <div v-for="(row, i) in individuals" :key="i" class="px-5 py-2.5 grid items-center gap-3 hover:bg-muted/15 transition-colors group"
          style="grid-template-columns: 70px 1.4fr 90px 90px 90px 80px 28px">
          <input :value="row.weight" @input="onNumericInput($event, v => row.weight = v)" inputmode="decimal" :readonly="!isFormOwner" class="w-full px-2 py-1.5 rounded-md text-[13px] text-right outline-none border"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent text-foreground/70 cursor-default'">
          <input v-model="row.item" :readonly="!isFormOwner" :placeholder="t('evaluation.form.goalNamePlaceholder')" class="w-full px-2.5 py-1.5 rounded-md text-[13px] outline-none border"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent text-foreground/70 cursor-default'">
          <input :value="row.goal" @input="onNumericInput($event, v => row.goal = v)" inputmode="decimal" :readonly="!isFormOwner" class="w-full px-2 py-1.5 rounded-md text-[13px] text-right outline-none border"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent text-foreground/70 cursor-default'">
          <input :value="row.actual_eval" @input="onNumericInput($event, v => row.actual_eval = v)" inputmode="decimal" :readonly="!isFormOwner" class="w-full px-2 py-1.5 rounded-md text-[13px] text-right outline-none border"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60 text-primary' : 'border-transparent bg-transparent text-foreground/70 cursor-default'">
          <div class="text-right font-mono text-[13px] text-muted-foreground">{{ individualRate(row).toFixed(0) }}%</div>
          <div class="rounded-md py-1.5 px-2 text-right font-bold tabular-nums text-[14px]"
            :style="calcPoints(row.weight, individualRate(row)) > 0 ? { background: 'hsl(265 60% 55% / 0.1)', color: 'hsl(265 60% 55%)' } : {}">
            {{ calcPoints(row.weight, individualRate(row)) > 0 ? calcPoints(row.weight, individualRate(row)).toFixed(1) : '—' }}
          </div>
          <button v-if="isFormOwner" class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
            @click="removeIndividual(i)"><Trash2 :size="13" /></button>
        </div>
        <div v-if="isFormOwner" class="px-5 py-2.5 bg-muted/15">
          <button class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:bg-primary/10 px-2 py-1.5 rounded-md transition-colors" @click="addIndividual">
            <Plus :size="12" /> {{ t('evaluation.form.addGoal') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Project goals -->
    <div class="card-surface rise overflow-hidden" style="animation-delay: 200ms; background: color-mix(in srgb, hsl(160 60% 45%) 5%, hsl(var(--card)))">
      <div class="px-5 py-3 border-b flex items-center gap-3" style="background: color-mix(in srgb, hsl(160 60% 45%) 12%, hsl(var(--card)))">
        <span class="h-7 w-1 rounded-full" style="background: hsl(160 60% 45%)" />
        <button class="inline-flex items-center gap-2" @click="sectionCollapsed.project = !sectionCollapsed.project">
          <ChevronDown :size="14" class="text-muted-foreground transition-transform" :class="sectionCollapsed.project ? '-rotate-90' : ''" />
          <h3 class="section-title">{{ t('evaluation.form.projectTitle') }}</h3>
        </button>
        <p class="text-[11.5px] text-muted-foreground hidden md:block">{{ t('evaluation.form.projectSubtitle') }}</p>
        <div class="flex-1" />
        <span class="px-2 py-0.5 rounded-full font-mono text-[11.5px]" style="background: hsl(160 60% 45% / 0.14); color: hsl(160 60% 45%)">
          {{ t('evaluation.form.scorePrefix') }} <strong class="tabular-nums">{{ projectGoals.reduce((a, r) => a + calcPoints(r.weight, r.superior_eval), 0).toFixed(1) }}</strong>
        </span>
      </div>
      <div v-if="!sectionCollapsed.project" class="divide-y divide-border/60">
        <div class="px-5 py-2 bg-muted/30 grid items-center gap-3 text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground"
          style="grid-template-columns: 70px 1.6fr 110px 110px 80px 28px">
          <span>{{ t('evaluation.form.colWeight') }}</span><span>{{ t('evaluation.form.colProject') }}</span>
          <span class="text-right">{{ t('evaluation.form.colSelfEval') }}</span>
          <span class="text-right" style="color: hsl(265 60% 55%)">{{ t('evaluation.form.colSupEval') }}</span>
          <span class="text-right">{{ t('evaluation.form.colPoints') }}</span><span />
        </div>
        <div v-for="(row, i) in projectGoals" :key="i" class="px-5 py-2.5 grid items-center gap-3 hover:bg-muted/15 transition-colors group"
          style="grid-template-columns: 70px 1.6fr 110px 110px 80px 28px">
          <input :value="row.weight" @input="onNumericInput($event, v => row.weight = v)" inputmode="decimal" :readonly="!isFormOwner" class="w-full px-2 py-1.5 rounded-md text-[13px] text-right outline-none border"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent text-foreground/70 cursor-default'">
          <Select v-model="row.id" :disabled="!isFormOwner" :options="projectOpts.filter(p => p.value !== 0)" :placeholder="t('evaluation.form.selectProjectPlaceholder')" style="width: 100%" />
          <input :value="row.self_assessment" @input="onNumericInput($event, v => row.self_assessment = v)" inputmode="decimal" :readonly="!isFormOwner" class="w-full px-2 py-1.5 rounded-md text-[13px] text-right outline-none border"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60 text-primary' : 'border-transparent bg-transparent text-foreground/70 cursor-default'">
          <input :value="row.superior_eval" @input="onNumericInput($event, v => row.superior_eval = v)" inputmode="decimal" :readonly="isFormOwner" class="w-full px-2 py-1.5 rounded-md text-[13px] text-right outline-none border"
            :class="!isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent text-foreground/70 cursor-default'"
            :style="!isFormOwner && row.superior_eval ? { color: 'hsl(265 60% 55%)' } : {}">
          <div class="rounded-md py-1.5 px-2 text-right font-bold tabular-nums text-[14px]"
            :style="calcPoints(row.weight, row.superior_eval) > 0 ? { background: 'hsl(160 60% 45% / 0.1)', color: 'hsl(160 60% 45%)' } : {}">
            {{ calcPoints(row.weight, row.superior_eval) > 0 ? calcPoints(row.weight, row.superior_eval).toFixed(1) : '—' }}
          </div>
          <button v-if="isFormOwner" class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
            @click="removeProjectGoal(i)"><Trash2 :size="13" /></button>
        </div>
        <div v-if="isFormOwner" class="px-5 py-2.5 bg-muted/15">
          <button class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:bg-primary/10 px-2 py-1.5 rounded-md transition-colors" @click="addProjectGoal">
            <Plus :size="12" /> {{ t('evaluation.form.addProject') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Other contributions (challenges) -->
    <div class="card-surface rise overflow-hidden" style="animation-delay: 260ms; background: color-mix(in srgb, hsl(38 92% 50%) 5%, hsl(var(--card)))">
      <div class="px-5 py-3 border-b flex items-center gap-3" style="background: color-mix(in srgb, hsl(38 92% 50%) 12%, hsl(var(--card)))">
        <span class="h-7 w-1 rounded-full" style="background: hsl(38 92% 50%)" />
        <button class="inline-flex items-center gap-2" @click="sectionCollapsed.challenge = !sectionCollapsed.challenge">
          <ChevronDown :size="14" class="text-muted-foreground transition-transform" :class="sectionCollapsed.challenge ? '-rotate-90' : ''" />
          <h3 class="section-title">{{ t('evaluation.form.challengeTitle') }}</h3>
        </button>
        <p class="text-[11.5px] text-muted-foreground hidden md:block">{{ t('evaluation.form.challengeSubtitle') }}</p>
        <div class="flex-1" />
        <span class="px-2 py-0.5 rounded-full font-mono text-[11.5px]" style="background: hsl(38 92% 50% / 0.14); color: hsl(38 92% 40%)">
          {{ t('evaluation.form.scorePrefix') }} <strong class="tabular-nums">{{ challenges.reduce((a, r) => a + calcPoints(r.weight, r.superior_eval), 0).toFixed(1) }}</strong>
        </span>
      </div>
      <div v-if="!sectionCollapsed.challenge" class="divide-y divide-border/60">
        <div class="px-5 py-2 bg-muted/30 grid items-center gap-3 text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground"
          style="grid-template-columns: 70px 1fr 1.2fr 110px 110px 80px 28px">
          <span>{{ t('evaluation.form.colWeight') }}</span><span>{{ t('evaluation.form.colName') }}</span><span>{{ t('evaluation.form.colDetail') }}</span>
          <span class="text-right">{{ t('evaluation.form.colSelfEval') }}</span>
          <span class="text-right" style="color: hsl(265 60% 55%)">{{ t('evaluation.form.colSupEval') }}</span>
          <span class="text-right">{{ t('evaluation.form.colPoints') }}</span><span />
        </div>
        <div v-for="(row, i) in challenges" :key="i" class="px-5 py-2.5 grid items-center gap-3 hover:bg-muted/15 transition-colors group"
          style="grid-template-columns: 70px 1fr 1.2fr 110px 110px 80px 28px">
          <input :value="row.weight" @input="onNumericInput($event, v => row.weight = v)" inputmode="decimal" :readonly="!isFormOwner" class="w-full px-2 py-1.5 rounded-md text-[13px] text-right outline-none border"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent text-foreground/70 cursor-default'">
          <input v-model="row.name" :readonly="!isFormOwner" :placeholder="t('evaluation.form.namePlaceholder')" class="w-full px-2.5 py-1.5 rounded-md text-[13px] outline-none border"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent text-foreground/70 cursor-default'">
          <input v-model="row.actions" :readonly="!isFormOwner" :placeholder="t('evaluation.form.detailPlaceholder')" class="w-full px-2.5 py-1.5 rounded-md text-[13px] outline-none border"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent text-foreground/70 cursor-default'">
          <input :value="row.self_assessment" @input="onNumericInput($event, v => row.self_assessment = v)" inputmode="decimal" :readonly="!isFormOwner" class="w-full px-2 py-1.5 rounded-md text-[13px] text-right outline-none border"
            :class="isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60 text-primary' : 'border-transparent bg-transparent text-foreground/70 cursor-default'">
          <input :value="row.superior_eval" @input="onNumericInput($event, v => row.superior_eval = v)" inputmode="decimal" :readonly="isFormOwner" class="w-full px-2 py-1.5 rounded-md text-[13px] text-right outline-none border"
            :class="!isFormOwner ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent text-foreground/70 cursor-default'"
            :style="!isFormOwner && row.superior_eval ? { color: 'hsl(265 60% 55%)' } : {}">
          <div class="rounded-md py-1.5 px-2 text-right font-bold tabular-nums text-[14px]"
            :style="calcPoints(row.weight, row.superior_eval) > 0 ? { background: 'hsl(38 92% 50% / 0.12)', color: 'hsl(38 92% 40%)' } : {}">
            {{ calcPoints(row.weight, row.superior_eval) > 0 ? calcPoints(row.weight, row.superior_eval).toFixed(1) : '—' }}
          </div>
          <button v-if="isFormOwner" class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
            @click="removeChallenge(i)"><Trash2 :size="13" /></button>
        </div>
        <div v-if="isFormOwner" class="px-5 py-2.5 bg-muted/15">
          <button class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:bg-primary/10 px-2 py-1.5 rounded-md transition-colors" @click="addChallenge">
            <Plus :size="12" /> {{ t('evaluation.form.addGoal') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Comments -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 rise" style="animation-delay: 380ms">
      <!-- Self comment -->
      <div class="card-surface overflow-hidden">
        <div class="px-4 py-3 border-b border-border/70 flex items-center gap-3"
          style="background: linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 50% / 0.08) 0%, transparent 60%)">
          <Avatar :name="formOwnerName || 'N/A'" :size="32" />
          <div class="min-w-0 flex-1">
            <p class="section-title">{{ t('evaluation.form.selfCommentTitle') }}</p>
            <p class="text-[11px] text-muted-foreground truncate">{{ t('evaluation.form.selfCommentSub', { name: formOwnerName }) }}</p>
          </div>
          <Badge v-if="!isFormOwner" variant="gray">{{ t('evaluation.form.readOnly') }}</Badge>
        </div>
        <textarea v-model="commentSelf" :readonly="!isFormOwner"
          :placeholder="t('evaluation.form.selfCommentPlaceholder')" rows="20"
          class="w-full px-4 py-3 text-[13px] outline-none resize-none"
          :class="!isFormOwner ? 'bg-muted/20 text-foreground/70 cursor-default' : 'bg-transparent focus:bg-muted/10'" />
      </div>
      <!-- Supervisor comment -->
      <div class="card-surface overflow-hidden">
        <div class="px-4 py-3 border-b border-border/70 flex items-center gap-3"
          style="background: linear-gradient(90deg, hsl(265 60% 55% / 0.08) 0%, transparent 60%)">
          <Avatar :name="isFormOwner ? '' : (auth.user.value?.name ?? '')" :size="32" />
          <div class="min-w-0 flex-1">
            <p class="section-title">{{ t('evaluation.form.supCommentTitle') }}</p>
            <p class="text-[11px] text-muted-foreground truncate">{{ isFormOwner ? t('evaluation.form.supCommentPending') : (auth.user.value?.name ?? '') }}</p>
          </div>
          <Badge v-if="isFormOwner" variant="gray">{{ t('evaluation.form.readOnly') }}</Badge>
        </div>
        <textarea v-model="commentSup" :readonly="isFormOwner"
          :placeholder="t('evaluation.form.supCommentPlaceholder')" rows="20"
          class="w-full px-4 py-3 text-[13px] outline-none resize-none"
          :class="isFormOwner ? 'bg-muted/20 text-foreground/70 cursor-default' : 'bg-transparent focus:bg-muted/10'" />
      </div>
    </div>

    <!-- Sticky footer -->
    <div class="sticky bottom-0 -mx-6 px-6 py-3 bg-background/85 backdrop-blur-md border-t border-border/70 flex items-center gap-3 z-10">
      <div class="flex items-center gap-3 flex-1 text-[12.5px]">
        <span v-if="totalWeight === 100" class="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
          <Check :size="13" /> {{ t('evaluation.form.weightValid') }}
        </span>
        <span v-else class="inline-flex items-center gap-1.5 text-amber-600 font-semibold">
          {{ t('evaluation.form.weightInvalid') }}
        </span>
      </div>
      <Btn variant="ghost" @click="showCreate = false">{{ t('common.cancel') }}</Btn>
      <template v-if="editingId === null">
        <Btn variant="primary" :disabled="formSaving" @click="submitForm(2, false)"><Check :size="13" />{{ t('evaluation.form.createBtn') }}</Btn>
      </template>
      <template v-else-if="isFormOwner">
        <Btn variant="outline" :disabled="formSaving" @click="submitForm(1, false)"><FileText :size="13" />{{ t('evaluation.form.saveDraftBtn') }}</Btn>
        <Btn variant="primary" :disabled="formSaving" @click="submitForm(2, true)"><Check :size="13" />{{ t('evaluation.form.submitBtn') }}</Btn>
      </template>
      <template v-else>
        <Btn variant="outline" :disabled="formSaving" @click="submitForm(2, false)"><FileText :size="13" />{{ t('evaluation.form.saveDraftBtn') }}</Btn>
        <Btn variant="primary" :disabled="formSaving" @click="submitForm(6, true)"><Check :size="13" />{{ t('evaluation.form.approveBtn') }}</Btn>
      </template>
    </div>
  </div>

  <!-- ============================================================ LIST MODE -->
  <div v-else class="space-y-6">
    <!-- Kỳ switch overlay — changing year/quarter fans out into several fetches
         (table + summary cards + rank distribution + trend), so cover the whole
         content pane (everything right of the sidebar, below the topbar) rather
         than just this section's own box, so stale numbers never flash through
         and short-content quarters don't leave the bottom uncovered. -->
    <div v-if="periodLoading" class="fixed z-30 top-14 left-[260px] right-0 bottom-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-3">
        <span class="h-9 w-9 rounded-full border-[3px] border-primary/25 border-t-primary animate-spin" />
        <p class="text-[12.5px] font-medium text-muted-foreground">{{ t('evaluation.list.periodLoading') }}</p>
      </div>
    </div>

    <PageHeader
      :eyebrow="t('evaluation.eyebrow')"
      :description="t('evaluation.list.description')"
    >
      <template #title>
        {{ t('evaluation.list.titlePrefix') }} <em class="font-display not-italic text-primary" style="letter-spacing: -0.025em">Q{{ quarter }}/{{ year }}</em>
      </template>
      <template #actions>
        <Btn v-if="isManagerOrGM" variant="outline" @click="exportAllFiltered"><Download :size="14" />{{ t('evaluation.list.exportAll') }}</Btn>
        <Btn v-if="isManagerOrGM" variant="outline" :disabled="selectedIds.length === 0" @click="exportSelectedRows"><FileText :size="14" />{{ t('evaluation.list.exportSelected', { n: selectedIds.length }) }}</Btn>
        <Btn variant="primary" @click="openCreateForm"><Plus :size="14" />{{ t('evaluation.list.newForm') }}</Btn>
      </template>
    </PageHeader>

    <!-- Period switcher banner -->
    <div class="card-surface p-4 rise flex flex-wrap items-center gap-4" style="animation-delay: 40ms">
      <div class="flex items-center gap-2">
        <span class="text-[11.5px] uppercase tracking-wider font-semibold text-muted-foreground">{{ t('evaluation.list.periodLabelShort') }}</span>
        <div class="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
          <button
            v-for="q in ['1','2','3','4']" :key="q"
            :disabled="isFutureQuarter(q, year)"
            class="h-7 px-3 rounded-[5px] text-[12px] font-semibold tabular-nums disabled:opacity-50 disabled:pointer-events-none"
            :class="quarter === q ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
            @click="quarter = q"
          >Q{{ q }}</button>
        </div>
        <Select v-model="year" :options="yearOpts" style="min-width: 100px" />
      </div>
      <div class="h-6 w-px bg-border" />
      <div class="flex items-center gap-3 flex-1 min-w-[260px]">
        <span class="text-[12px] text-muted-foreground">{{ t('evaluation.list.progressLabel') }}</span>
        <div class="flex-1 h-2 rounded-full bg-muted overflow-hidden max-w-[280px]">
          <div class="h-full rounded-full" :style="{ width: `${stats.completionPct}%`, background: 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 65%), hsl(var(--primary-h) var(--primary-s) 45%))' }" />
        </div>
        <span class="text-[12px] font-semibold tabular-nums">{{ stats.completionPct }}%</span>
        <span class="text-[11.5px] text-muted-foreground">{{ t('evaluation.list.progressCount', { submitted: stats.submittedCount, total: stats.total }) }}</span>
      </div>
    </div>

    <!-- MiniStats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MiniStat :label="t('evaluation.stats.submitted')" :value="stats.submittedCount" :sublabel="t('evaluation.stats.submittedSub', { n: stats.total })" accent="green" :delay="80" />
      <MiniStat :label="t('evaluation.stats.rankS')" :value="stats.rankSCount" :sublabel="t('evaluation.stats.rankSub', { pct: Math.round(stats.rankSCount / Math.max(stats.submittedCount,1) * 100) })" accent="violet" :delay="120" />
      <MiniStat :label="t('evaluation.stats.rankA')" :value="stats.rankACount" :sublabel="t('evaluation.stats.rankSub', { pct: Math.round(stats.rankACount / Math.max(stats.submittedCount,1) * 100) })" accent="primary" :delay="160" />
      <MiniStat :label="t('evaluation.stats.needNudge')" :value="stats.needNudge" :sublabel="t('evaluation.stats.needNudgeSub')" :accent="stats.needNudge > 0 ? 'amber' : 'green'" :delay="200" />
    </div>

    <!-- Tab strip -->
    <div class="border-b border-border/70">
      <div class="flex gap-7">
        <button
          v-for="[k, l] in [['manage', t('evaluation.tabs.manage')], ['mine', t('evaluation.tabs.mine')], ['reports', t('evaluation.tabs.reports')]]"
          :key="(k as string)"
          :data-active="tab === k"
          class="tab-trigger inline-flex items-center gap-2"
          @click="tab = k as typeof tab"
        >{{ l }}</button>
      </div>
    </div>

    <!-- List tabs -->
    <template v-if="tab !== 'reports'">
      <FilterBar>
        <FieldInput v-model="search" :placeholder="t('evaluation.list.searchPlaceholder')" :width="220" />
        <Select v-model="statusF" :options="statusOpts" style="min-width: 160px" />
        <Select v-model="rankF" :options="rankOpts" style="min-width: 130px" />
        <Select v-if="isManagerOrGM" v-model="branchF" :options="branchOpts" style="min-width: 160px" />
        <Select v-if="isManagerOrGM" v-model="projectF" :options="projectOpts" style="min-width: 160px" />
        <div class="flex-1" />
        <span class="text-[12px] text-muted-foreground">{{ t('evaluation.list.count', { n: evalStore.pagination.total_row }) }}</span>
      </FilterBar>

      <!-- Error banner -->
      <ErrorBanner v-if="evalStore.error" :message="evalStore.error" @retry="fetchList(evalStore.pagination.current_page)" />

      <div class="card-surface overflow-hidden rise" style="animation-delay: 240ms">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 820px">
            <thead>
              <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th v-if="isManagerOrGM" class="text-center py-3 px-5 w-10">
                  <input type="checkbox" :checked="allSelectedOnPage" @click.stop="toggleSelectAll" @change.stop>
                </th>
                <th class="text-left py-3 px-5">{{ t('evaluation.table.colEmployee') }}</th>
                <th class="text-left py-3 px-3">{{ t('evaluation.table.colBranch') }}</th>
                <th class="text-left py-3 px-3">{{ t('evaluation.table.colUpdater') }}</th>
                <th class="text-center py-3 px-3">{{ t('evaluation.table.colPeriod') }}</th>
                <th class="text-center py-3 px-3">{{ t('evaluation.table.colRank') }}</th>
                <th class="text-center py-3 px-3">{{ t('evaluation.table.colStatus') }}</th>
                <th class="text-right py-3 px-3">{{ t('evaluation.table.colUpdated') }}</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRow v-if="evalStore.loading" :cols="isManagerOrGM ? 7 : 6" :rows="5" />
              <tr v-else-if="rows.length === 0">
                <td :colspan="isManagerOrGM ? 7 : 6" class="p-0">
                  <EmptyState :icon="ClipboardList" :title="t('evaluation.list.emptyTitle')" :description="t('evaluation.list.emptyDesc')" />
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="e in rows" :key="e.id"
                  class="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  @click="openEval = e"
                >
                  <td v-if="isManagerOrGM" class="py-3 px-5 text-center" @click.stop>
                    <input type="checkbox" :checked="selectedIds.includes(e.id)" @change="toggleSelect(e.id)">
                  </td>
                  <td class="py-3 px-5">
                    <div class="flex items-center gap-3">
                      <Avatar :name="e.name" :size="32" />
                      <p class="font-semibold text-foreground">{{ e.name }}</p>
                    </div>
                  </td>
                  <td class="py-3 px-3 text-foreground/85">{{ branchName(e.branch) }}</td>
                  <td class="py-3 px-3 text-foreground/85">{{ evalStore.users[String(e.updated_by)] ?? '' }}</td>
                  <td class="py-3 px-3 text-center tabular-nums">Q{{ e.quarter }}/{{ e.year }}</td>
                  <td class="py-3 px-3 text-center">
                    <span v-if="rankLetter(e.rank)"
                      class="inline-flex items-center justify-center w-7 h-7 rounded-md text-[12px] font-bold text-white tabular-nums"
                      :style="{ background: rankColor(e.rank) }">
                      {{ rankLetter(e.rank) }}
                    </span>
                    <span v-else class="text-muted-foreground">—</span>
                  </td>
                  <td class="py-3 px-3 text-center">
                    <Badge :variant="evalStatusMeta(e.status)?.variant ?? 'gray'" dot>{{ evalStatusMeta(e.status)?.label ?? '—' }}</Badge>
                  </td>
                  <td class="py-3 px-3 text-right text-muted-foreground text-[12px]">{{ e.last_updated }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="evalStore.pagination.total_row > 0"
          :page="evalStore.pagination.current_page"
          :total="evalStore.pagination.total_row"
          :per-page="evalStore.pagination.row_per_page"
          @change="fetchList"
        />
      </div>
    </template>

    <!-- Reports tab -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Rank distribution -->
      <SectionCard :delay="120" class="lg:col-span-3" :title="t('evaluation.reports.rankDistTitle')">
        <div class="flex items-end gap-6 h-48 px-4 pt-4">
          <div v-for="[r, n] in Object.entries(rankDist)" :key="r" class="flex-1 flex flex-col items-center gap-2">
            <span class="text-[13px] font-bold tabular-nums text-foreground">{{ n }}</span>
            <div class="w-full rounded-md transition-all relative overflow-hidden"
              :style="{ height: `${(Number(n) / maxRankDist) * 100}%`, minHeight: '4px', background: `linear-gradient(180deg, ${RANK_COLOR[r]} 0%, ${RANK_COLOR[r]}aa 100%)` }">
              <div class="absolute inset-x-0 top-0 h-px bg-white/30" />
            </div>
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-md text-[12px] font-bold text-white"
              :style="{ background: RANK_COLOR[r] }">{{ r }}</span>
          </div>
        </div>
        <p class="text-[11.5px] text-muted-foreground mt-4 pt-3 border-t border-border/60">
          {{ t('evaluation.reports.rankDistPrefix') }} <strong class="text-foreground">{{ stats.rankSCount + stats.rankACount }}/{{ stats.submittedCount }}</strong> {{ t('evaluation.reports.rankDistSuffix') }}
        </p>
      </SectionCard>

      <!-- Top 5 performers -->
      <SectionCard :delay="180" class="lg:col-span-2" :title="t('evaluation.reports.topPerformersTitle')">
        <ol v-if="topPerformers.length" class="space-y-2.5">
          <li
            v-for="(e, i) in topPerformers" :key="e.id"
            class="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
            @click="openEval = e"
          >
            <span class="w-6 text-center text-[12px] font-bold tabular-nums text-muted-foreground">#{{ i + 1 }}</span>
            <Avatar :name="e.name" :size="32" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-foreground truncate">{{ e.name }}</p>
              <p class="text-[11.5px] text-muted-foreground">{{ branchName(e.branch) }}</p>
            </div>
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-md text-[11px] font-bold text-white"
              :style="{ background: rankColor(e.rank) }">{{ rankLetter(e.rank) }}</span>
          </li>
        </ol>
        <p v-else class="text-[12.5px] text-muted-foreground py-6 text-center">{{ t('evaluation.reports.noCompletedForms') }}</p>
      </SectionCard>

      <!-- Category averages -->
      <SectionCard :delay="240" class="lg:col-span-2" :title="t('evaluation.reports.categoryAvgTitle')">
        <div v-if="categoryAveragesLoading" class="py-8 text-center text-[12.5px] text-muted-foreground">{{ t('evaluation.reports.calculating') }}</div>
        <div v-else-if="reportRows.filter(e => SUBMITTED_STATUSES.includes(e.status)).length === 0" class="py-8 text-center text-[12.5px] text-muted-foreground">
          {{ t('evaluation.reports.noCompletedForms') }}
        </div>
        <div v-else class="space-y-3.5">
          <div v-for="s in CATEGORY_META" :key="s.key">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[12.5px] text-foreground/85">{{ s.label }}</span>
              <span class="font-bold tabular-nums text-foreground">{{ categoryAverages[s.key] }}<span class="text-muted-foreground font-normal text-[10.5px]">%</span></span>
            </div>
            <div class="h-2 rounded-full bg-muted overflow-hidden">
              <div class="h-full rounded-full" :style="{ width: `${Math.min(categoryAverages[s.key], 100)}%`, background: s.accent }" />
            </div>
          </div>
        </div>
        <p class="text-[10.5px] text-muted-foreground mt-4 pt-3 border-t border-border/60">
          {{ t('evaluation.reports.categoryAvgFooter', { n: CATEGORY_FETCH_CAP }) }}
        </p>
      </SectionCard>

      <!-- Trend over quarters -->
      <SectionCard :delay="300" class="lg:col-span-3" :title="t('evaluation.reports.trendTitle')">
        <div class="h-44">
          <LineChart :data="trendData" :height="176" />
        </div>
        <p class="text-[11.5px] text-muted-foreground mt-2 italic">{{ t('evaluation.reports.trendFooter') }}</p>
      </SectionCard>
    </div>
  </div>

  <!-- ============================================================ EVAL DETAIL slide-over -->
  <Teleport to="body">
    <div v-if="openEval" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="openEval = null" />
      <div class="relative bg-background border-l border-border w-full max-w-xl h-full flex flex-col rise" style="animation-duration: .4s">
        <!-- Header -->
        <div class="p-5 border-b border-border/70 flex items-start justify-between gap-4 shrink-0">
          <div class="flex items-center gap-4 min-w-0">
            <Avatar :name="openEval.name" :size="52" />
            <div class="min-w-0">
              <h3 class="font-bold text-[18px] text-foreground font-heading truncate">{{ openEval.name }}</h3>
              <p class="text-[12.5px] text-muted-foreground truncate">{{ branchName(openEval.branch) }}</p>
              <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge variant="primary">Q{{ openEval.quarter }}/{{ openEval.year }}</Badge>
                <Badge :variant="evalStatusMeta(openEval.status)?.variant ?? 'gray'" dot>{{ evalStatusMeta(openEval.status)?.label ?? '—' }}</Badge>
              </div>
            </div>
          </div>
          <button class="p-2 rounded-md hover:bg-muted text-muted-foreground shrink-0" @click="openEval = null"><X :size="16" /></button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto overscroll-contain scrollbar-thin">
          <!-- Rank hero -->
          <div class="p-5 border-b border-border/70 flex items-center gap-6">
            <div class="flex-1">
              <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{{ t('evaluation.detail.rankLabel') }}</p>
              <div class="flex items-baseline gap-2 mt-1">
                <span v-if="detailRankLetter" class="inline-flex items-center justify-center w-12 h-12 rounded-xl text-[20px] font-bold text-white font-heading"
                  :style="{ background: rankColor(openEval.rank) }">{{ detailRankLetter }}</span>
                <span v-else class="inline-flex items-center justify-center w-12 h-12 rounded-xl text-[20px] font-bold text-muted-foreground font-heading bg-muted">—</span>
              </div>
              <p class="text-[11.5px] text-muted-foreground mt-2">{{ t('evaluation.detail.updatedByPrefix') }} <strong class="text-foreground">{{ evalStore.users[String(openEval.updated_by)] ?? '—' }}</strong> · {{ openEval.last_updated }}</p>
            </div>
            <Btn variant="outline" size="sm" @click="exportOne(openEval.id)"><Download :size="13" />{{ t('evaluation.detail.exportExcel') }}</Btn>
          </div>

          <div class="p-5">
            <p class="text-[12.5px] text-muted-foreground">
              {{ t('evaluation.detail.hint') }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-border/70 flex items-center gap-2 shrink-0">
          <Btn variant="ghost" size="sm" @click="openEval = null">{{ t('common.close') }}</Btn>
          <div class="flex-1" />
          <Btn variant="outline" size="sm" @click="duplicateAndOpen(openEval.id)">{{ t('evaluation.detail.duplicate') }}</Btn>
          <Btn v-if="isGM" variant="danger" size="sm" @click="deleteConfirmId = openEval.id"><Trash2 :size="13" />{{ t('evaluation.detail.deleteForm') }}</Btn>
          <Btn variant="primary" size="sm" @click="openEditForm(openEval.id)"><FileText :size="13" />{{ t('evaluation.detail.viewEdit') }}</Btn>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ============================================================ DELETE CONFIRM -->
  <Teleport to="body">
    <div v-if="deleteConfirmId" class="fixed inset-0 z-[60] flex items-center justify-center">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="deleteConfirmId = null" />
      <div class="relative card-surface w-full max-w-sm p-5">
        <h4 class="font-bold text-[15px] text-foreground mb-1.5">{{ t('evaluation.deleteConfirm.title') }}</h4>
        <p class="text-[13px] text-muted-foreground mb-4">{{ t('evaluation.deleteConfirm.body') }}</p>
        <div class="flex justify-end gap-2">
          <Btn variant="outline" size="sm" @click="deleteConfirmId = null">{{ t('common.cancel') }}</Btn>
          <Btn variant="danger" size="sm" @click="confirmDelete(deleteConfirmId)">{{ t('common.delete') }}</Btn>
        </div>
      </div>
    </div>
  </Teleport>
</div>
</template>
