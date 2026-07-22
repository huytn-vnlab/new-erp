<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  ChevronLeft, Building2, Calendar, Briefcase,
  Award, Phone, FileText, User, Pencil, Trash2,
} from 'lucide-vue-next'
import Badge from '~/components/base/Badge.vue'
import Btn from '~/components/base/Button.vue'
import Select from '~/components/base/Select.vue'
import MemberEditDrawer from '~/components/member/MemberEditDrawer.vue'
import { useMemberStore } from '~/stores/member'
import type { MemberDetail } from '~/types'
import { formatDateDisplay } from '~/utils/date'

const props = withDefaults(defineProps<{
  userId: number
  backLabel?: string
}>(), {
  backLabel: undefined,
})

const { t } = useI18n()
const router = useRouter()
const store = useMemberStore()
const auth = useAuth()
const { show } = useToast()

const detail = ref<MemberDetail | null>(null)
const loading = ref(true)
const tab = ref('overview')
const editOpen = ref(false)

const resolvedBackLabel = computed(() => props.backLabel ?? t('hrm.member.adminPage.backToList'))

// Self-edit is always allowed server-side (SaveProfile permits editor.ID ===
// target.ID regardless of role) — the manager/GM check only gates editing
// someone else's profile.
const canEdit = computed(() => {
  const role = auth.user.value?.role_name?.toLowerCase() ?? ''
  const isSelf = auth.user.value?.id === props.userId
  return isSelf || role === 'manager' || role === 'general manager'
})

async function refetchDetail() {
  if (!props.userId) return
  detail.value = await store.fetchMemberDetail(props.userId)
}

async function loadDetail() {
  if (!props.userId) return
  loading.value = true
  await refetchDetail()
  loading.value = false
}

onMounted(async () => {
  await Promise.all([
    store.fetchBranches(),
    store.fetchJobTitles(),
    store.fetchProfileLists(),
  ])
  await loadDetail()
})

// userId may not be known yet at mount time (e.g. the logged-in user's own id
// is still being fetched by the layout) — reload once it resolves.
watch(() => props.userId, (v) => { if (v) loadDetail() })

const fullName = computed(() =>
  detail.value ? `${detail.value.first_name} ${detail.value.last_name}`.trim() : '…'
)
const initials = computed(() =>
  fullName.value.split(' ').map(s => s[0]).filter(Boolean).slice(-2).join('').toUpperCase()
)
const empId = computed(() =>
  detail.value?.employee_id || String(props.userId).padStart(4, '0')
)
const avatarHue = computed(() =>
  fullName.value.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0)
)

const RANK_COLOR: Record<string, string> = {
  S: '#0ea5e9', A: '#22c55e', B: '#a3a3a3', C: '#eab308', D: '#f97316', E: '#ef4444',
}

type BV = 'green' | 'amber' | 'gray' | 'sky' | 'violet' | 'primary' | 'red'
const STATUS_META: Record<number, { labelKey: string; variant: BV }> = {
  1: { labelKey: 'hrm.member.status.active',     variant: 'green' },
  2: { labelKey: 'hrm.member.status.onboarding', variant: 'amber' },
  3: { labelKey: 'hrm.member.status.leave',      variant: 'sky' },
}
function statusMeta(n?: number) {
  return (n !== undefined ? STATUS_META[n] : undefined) ?? { labelKey: 'hrm.member.status.inactive', variant: 'gray' as BV }
}

function formatDate(s: string | null | undefined) {
  return s ? (formatDateDisplay(s) || s) : '—'
}

const TABS = computed(() => [
  { k: 'overview',    l: t('hrm.member.adminPage.tab.overview') },
  { k: 'education',   l: t('hrm.member.adminPage.tab.education') },
  { k: 'experience',  l: t('hrm.member.adminPage.tab.experience') },
  { k: 'skills',      l: t('hrm.member.adminPage.tab.skills') },
  { k: 'awards',      l: t('hrm.member.adminPage.tab.awards') },
])

interface SkillItem { title: string; years_of_experience: number | null }
interface EduItem {
  achievement: string; university: string
  academic_level?: string; major?: string; specialize?: string; rank?: string
  start_date?: string; end_date?: string; description?: string
}
// JoinedProject on the backend has no `technology` field — only `description`.
interface ExpProject { position: string; start_date?: string; end_date?: string; description?: string }
interface ExpItem { company: string; projects: ExpProject[] }
// EditLanguage/the stored language jsonb use numeric ids, not free-text names —
// resolved for display via memberStore.languageList/levelLanguageList.
interface LangItem { language_id?: number; level_id?: number; certificate?: string }
interface AwardItem { title: string; description?: string }

const education  = computed(() => (detail.value?.education  ?? []) as EduItem[])
const experience = computed(() => (detail.value?.experience ?? []) as ExpItem[])
const languages  = computed(() => (detail.value?.language   ?? []) as LangItem[])
const awards     = computed(() => (detail.value?.award      ?? []) as AwardItem[])
const skills     = computed(() => detail.value?.skill ?? [])
const maxYears   = computed(() => Math.max(...skills.value.map(s => s.years_of_experience), 1))

function str(v: unknown): string { return v != null ? String(v) : '' }

function langName(id: number | undefined): string {
  return id != null ? (store.languageList[String(id)] ?? '') : ''
}
function levelName(id: number | undefined): string {
  return id != null ? (store.levelLanguageList[String(id)] ?? '') : ''
}
const languageOptions = computed(() => Object.entries(store.languageList).map(([value, label]) => ({ value: Number(value), label })))
const levelOptions = computed(() => Object.entries(store.levelLanguageList).map(([value, label]) => ({ value: Number(value), label })))

function fmtDateRange(start?: string, end?: string): string {
  const fmt = (s?: string) => {
    if (!s) return ''
    const sep = s.includes('-') ? '-' : '/'
    const p = s.split(sep)
    return p.length === 3 && p[0]!.length === 4 ? `${p[2]}/${p[1]}/${p[0]}` : s
  }
  if (!start && !end) return ''
  return `${fmt(start) || '?'} – ${fmt(end) || t('hrm.member.adminPage.present')}`
}

// ── Section editing ──────────────────────────────────────────────────────────
const editingSection  = ref<string | null>(null)
const sectionSaving   = ref(false)
const editSkills      = ref<SkillItem[]>([])
const editEducation   = ref<EduItem[]>([])
const editExperience  = ref<ExpItem[]>([])
const editLanguages   = ref<LangItem[]>([])
const editAwards      = ref<AwardItem[]>([])
const editIntroduce   = ref('')

function startEdit(section: string) {
  if (!detail.value) return
  const d = detail.value
  editingSection.value = section
  if (section === 'education') {
    editEducation.value = (d.education as EduItem[]).map(e => ({ ...e }))
    if (!editEducation.value.length) editEducation.value.push({ achievement: '', university: '' })
  } else if (section === 'experience') {
    editExperience.value = (d.experience as ExpItem[]).map(e => ({
      company: String(e.company ?? ''),
      projects: (e.projects || []).map((p: ExpProject) => ({ ...p })),
    }))
    if (!editExperience.value.length)
      editExperience.value.push({ company: '', projects: [{ position: '', start_date: '', end_date: '', description: '' }] })
  } else if (section === 'skills') {
    editSkills.value    = d.skill.map(s => ({ ...s }))
    editLanguages.value = (d.language as LangItem[]).map(l => ({ ...l }))
    editIntroduce.value = d.introduce ?? ''
  } else if (section === 'awards') {
    editAwards.value = (d.award as AwardItem[]).map(a => ({ ...a }))
    if (!editAwards.value.length) editAwards.value.push({ title: '', description: '' })
  }
}

async function saveSection() {
  if (!editingSection.value || !detail.value) return
  const section = editingSection.value

  // Client-side validation
  if (section === 'education') {
    const invalid = editEducation.value.some(e => !e.achievement?.trim() || !e.university?.trim())
    if (invalid) { show(t('hrm.member.adminPage.toast.eduRequired')); return }
  }
  if (section === 'experience') {
    const invalid = editExperience.value.some(e => !e.company?.trim())
    if (invalid) { show(t('hrm.member.adminPage.toast.expRequired')); return }
  }
  if (section === 'awards') {
    const invalid = editAwards.value.some(a => !a.title?.trim())
    if (invalid) { show(t('hrm.member.adminPage.toast.awardRequired')); return }
  }

  sectionSaving.value = true
  const d = detail.value
  const payload: Record<string, unknown> = {
    user_id: d.user_id,
    first_name: d.first_name,
    last_name: d.last_name,
    phone_number: d.phone_number,
    birthday: d.birthday,
    role_id: d.role_id,
    job_title: d.job_title,
    rank: d.rank,
    company_joined_date: d.company_joined_date,
    branch: d.branch,
    employee_id: d.employee_id,
    department: d.department,
    job_position: d.job_position,
    work_place: d.work_place,
    flag_edit_basic_profile: false,
    flag_edit_skill: false,
    flag_edit_language: false,
    flag_edit_education: false,
    flag_edit_award: false,
    flag_edit_experience: false,
    flag_edit_introduce: false,
  }
  if (section === 'education') {
    payload.education = editEducation.value
    payload.flag_edit_education = true
  }
  if (section === 'experience') {
    payload.experience = editExperience.value
    payload.flag_edit_experience = true
  }
  if (section === 'skills') {
    payload.skill = editSkills.value
    payload.language = editLanguages.value
    payload.introduce = editIntroduce.value
    payload.flag_edit_skill = true
    payload.flag_edit_language = true
    payload.flag_edit_introduce = true
  }
  if (section === 'awards') {
    payload.award = editAwards.value
    payload.flag_edit_award = true
  }

  const result = await store.updateMemberDetail(payload as Parameters<typeof store.updateMemberDetail>[0])
  sectionSaving.value = false
  if (result.ok) {
    if (section === 'education')  detail.value = { ...detail.value, education: editEducation.value }
    if (section === 'experience') detail.value = { ...detail.value, experience: editExperience.value }
    if (section === 'skills') {
      detail.value = { ...detail.value,
        skill: editSkills.value as typeof detail.value.skill,
        language: editLanguages.value,
        introduce: editIntroduce.value,
      }
    }
    if (section === 'awards') detail.value = { ...detail.value, award: editAwards.value }
    editingSection.value = null
    show(t('hrm.member.adminPage.toast.saveSuccess'))
  } else {
    show(result.message || t('hrm.member.adminPage.toast.saveFail'))
  }
}

function exportPdf() { window.print() }

// Item helpers
const addEdu    = () => editEducation.value.push({ achievement: '', university: '' })
const removeEdu = (i: number) => editEducation.value.splice(i, 1)

const addExp    = () => editExperience.value.push({ company: '', projects: [{ position: '', start_date: '', end_date: '', description: '' }] })
const removeExp = (i: number) => editExperience.value.splice(i, 1)
const addProject    = (ei: number) => editExperience.value[ei]?.projects.push({ position: '', start_date: '', end_date: '', description: '' })
const removeProject = (ei: number, pi: number) => editExperience.value[ei]?.projects.splice(pi, 1)

const addSkillItem    = () => editSkills.value.push({ title: '', years_of_experience: null })
const removeSkillItem = (i: number) => editSkills.value.splice(i, 1)
const addLang         = () => editLanguages.value.push({ language_id: undefined, level_id: undefined, certificate: '' })
const removeLang      = (i: number) => editLanguages.value.splice(i, 1)

const addAward    = () => editAwards.value.push({ title: '', description: '' })
const removeAward = (i: number) => editAwards.value.splice(i, 1)
</script>

<template>
  <div class="space-y-6">

    <!-- ── Loading ── -->
    <template v-if="loading">
      <div class="card-surface h-44 animate-pulse" />
      <div class="card-surface h-72 animate-pulse" />
    </template>

    <template v-else-if="detail">
      <!-- ── Hero ── -->
      <div class="card-surface overflow-hidden rise relative" style="animation-delay:0ms">
        <div class="absolute inset-0 pointer-events-none"
          :style="`background-image:radial-gradient(115% 130% at 100% 0%, hsl(${avatarHue} 58% 56% / 0.12), transparent 55%)`" />
        <div class="absolute left-0 top-0 bottom-0 w-1.5"
          :style="`background:linear-gradient(180deg, hsl(${avatarHue} 72% 60%), hsl(${avatarHue} 72% 44%))`" />

        <div class="px-7 py-6 relative z-10">
          <div class="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <!-- Avatar + Name -->
            <div class="flex items-center gap-5">
              <div
                class="h-20 w-20 rounded-2xl shadow-lg ring-4 ring-card flex items-center justify-center text-[26px] font-bold text-white font-heading shrink-0"
                :style="`background:linear-gradient(135deg, hsl(${avatarHue} 70% 62%), hsl(${avatarHue} 70% 42%))`"
              >{{ initials }}</div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="font-heading font-bold text-[22px] text-foreground leading-tight">{{ fullName }}</h1>
                  <Badge variant="gray">#{{ empId }}</Badge>
                </div>
                <p class="text-[13.5px] text-muted-foreground mt-0.5">
                  {{ detail.job_title_name || detail.role_name || '—' }}
                  <template v-if="detail.department"> · {{ detail.department }}</template>
                  <template v-else-if="detail.branch_name"> · {{ detail.branch_name }}</template>
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                class="h-8 px-3 rounded-md text-[12.5px] font-medium text-muted-foreground hover:bg-muted border border-border transition-colors inline-flex items-center gap-1.5"
                @click="router.back()"
              >
                <ChevronLeft :size="12" /> {{ resolvedBackLabel }}
              </button>
              <Btn variant="outline" size="sm" @click="exportPdf"><FileText :size="13" class="shrink-0" /> {{ t('hrm.member.adminPage.exportPdf') }}</Btn>
              <Btn v-if="canEdit" variant="primary" size="sm" @click="editOpen = true">
                <Pencil :size="13" class="shrink-0" /> {{ t('hrm.member.adminPage.edit') }}
              </Btn>
            </div>
          </div>

          <!-- Quick stats -->
          <div class="flex flex-wrap items-center gap-4 pt-4 border-t border-border/60">
            <Badge :variant="statusMeta(detail.status).variant" dot>{{ t(statusMeta(detail.status).labelKey) }}</Badge>
            <span v-if="detail.branch_name" class="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/80">
              <Building2 :size="13" class="text-muted-foreground" /> {{ detail.branch_name }}
            </span>
            <span v-if="detail.company_joined_date" class="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/80">
              <Calendar :size="13" class="text-muted-foreground" /> {{ t('hrm.member.adminPage.joined') }} {{ formatDate(detail.company_joined_date) }}
            </span>
            <span v-if="detail.rank_name" class="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/80">
              <span
                class="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold text-white"
                :style="`background:${RANK_COLOR[detail.rank_name] ?? '#a3a3a3'}`"
              >{{ detail.rank_name }}</span>
              {{ t('hrm.member.adminPage.rank') }} {{ detail.rank_name }}
            </span>
            <span v-if="detail.role_name" class="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/80">
              <Badge variant="primary">{{ detail.role_name }}</Badge>
            </span>
          </div>
        </div>
      </div>

      <!-- ── Tab strip ── -->
      <div class="border-b border-border/70">
        <div class="flex gap-6 flex-wrap">
          <button
            v-for="tabItem in TABS" :key="tabItem.k"
            :data-active="tab === tabItem.k"
            class="tab-trigger text-[13.5px]"
            @click="tab = tabItem.k"
          >{{ tabItem.l }}</button>
        </div>
      </div>

      <!-- ══ Tab: overview ══ -->
      <div v-if="tab === 'overview'" class="space-y-5 rise" style="animation-duration:.3s">

        <!-- Contact & Work -->
        <div class="card-surface p-6">
          <h3 class="section-title mb-5">{{ t('hrm.member.adminPage.overview.contactWork') }}</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6 text-[13px]">
            <div>
              <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.emailWork') }}</p>
              <p class="text-foreground">{{ detail.email || '—' }}</p>
            </div>
            <div>
              <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.emailPersonal') }}</p>
              <p class="text-foreground">{{ detail.personal_email || '—' }}</p>
            </div>
            <div>
              <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.phone') }}</p>
              <p class="text-foreground font-mono">{{ detail.phone_number || '—' }}</p>
            </div>
            <div>
              <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.department') }}</p>
              <p class="text-foreground">{{ detail.department || '—' }}</p>
            </div>
            <div>
              <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.jobTitle') }}</p>
              <p class="text-foreground">{{ detail.job_title_name || '—' }}</p>
            </div>
            <div>
              <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.jobPosition') }}</p>
              <p class="text-foreground">{{ detail.job_position || '—' }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.workPlace') }}</p>
              <p class="text-foreground">{{ detail.work_place || '—' }}</p>
            </div>
          </div>

          <!-- Personal info -->
          <div class="mt-6 pt-5 border-t border-dashed border-border/70">
            <h3 class="section-title mb-5">{{ t('hrm.member.adminPage.overview.personalInfo') }}</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6 text-[13px]">
              <div>
                <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.birthday') }}</p>
                <p class="text-foreground">{{ formatDate(detail.birthday) }}</p>
              </div>
              <div>
                <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.identityCard') }}</p>
                <p class="text-foreground font-mono">{{ detail.identity_card || '—' }}</p>
              </div>
              <div>
                <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.identityDate') }}</p>
                <p class="text-foreground">{{ formatDate(detail.date_of_identity_card) }}</p>
              </div>
              <div>
                <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.taxCode') }}</p>
                <p class="text-foreground font-mono">{{ detail.tax_code || '—' }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.permanentResidence') }}</p>
                <p class="text-foreground">{{ detail.permanent_residence || '—' }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.currentAddress') }}</p>
                <p class="text-foreground">{{ detail.current_address || '—' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Emergency contact -->
        <div class="card-surface p-6">
          <h3 class="section-title mb-4">{{ t('hrm.member.adminPage.overview.emergency') }}</h3>
          <div class="flex items-start gap-5">
            <div class="h-11 w-11 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
              <Phone :size="16" class="text-red-500" />
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 flex-1 text-[13px]">
              <div>
                <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.emergencyName') }}</p>
                <p class="text-foreground">{{ detail.name_of_emergency || '—' }}</p>
              </div>
              <div>
                <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.emergencyRelation') }}</p>
                <p class="text-foreground">{{ detail.relationships_of_emergency || '—' }}</p>
              </div>
              <div class="col-span-2 md:col-span-1">
                <p class="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{{ t('hrm.member.adminPage.overview.emergencyAddress') }}</p>
                <p class="text-foreground">{{ detail.address_of_emergency || '—' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Self intro -->
        <div v-if="detail.introduce" class="card-surface p-6">
          <h3 class="section-title mb-3">{{ t('hrm.member.adminPage.overview.introduce') }}</h3>
          <p class="text-[13px] text-foreground/85 leading-relaxed italic whitespace-pre-line">"{{ detail.introduce }}"</p>
        </div>
      </div>

      <!-- ══ Tab: education ══ -->
      <div v-if="tab === 'education'" class="space-y-4 rise" style="animation-duration:.3s">

        <!-- Section header -->
        <div v-if="editingSection !== 'education'" class="flex justify-end">
          <Btn v-if="canEdit" variant="outline" size="sm" @click="startEdit('education')">
            <Pencil :size="13" class="shrink-0" /> {{ t('hrm.member.adminPage.form.edit') }}
          </Btn>
        </div>

        <!-- View mode -->
        <template v-if="editingSection !== 'education'">
          <div v-if="!education.length" class="card-surface py-16 text-center text-muted-foreground">
            <Award :size="36" class="mx-auto mb-2 opacity-30" />
            <p class="text-[13px]">{{ t('hrm.member.adminPage.education.empty') }}</p>
          </div>
          <div v-for="(ed, i) in education" :key="i" class="card-surface p-6 flex gap-5">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style="background:hsl(var(--primary-h) var(--primary-s) 57% / 0.1);color:hsl(var(--primary))">
              <Award :size="18" />
            </div>
            <div class="flex-1">
              <div class="flex items-start justify-between gap-4 flex-wrap mb-2">
                <div>
                  <h4 class="font-semibold text-[15px] text-foreground">{{ str(ed.university) || t('hrm.member.adminPage.education.school') }}</h4>
                  <p class="text-[13px] text-muted-foreground">{{ str(ed.major) }}</p>
                </div>
                <div class="text-right shrink-0">
                  <p v-if="ed.start_date || ed.end_date" class="text-[12px] font-mono text-muted-foreground">
                    {{ fmtDateRange(str(ed.start_date) || undefined, str(ed.end_date) || undefined) }}
                  </p>
                  <Badge v-if="ed.academic_level" variant="primary" class="mt-1">{{ str(ed.academic_level) }}</Badge>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4 text-[13px] mt-3">
                <div v-if="ed.achievement">
                  <p class="field-label">{{ t('hrm.member.adminPage.education.achievement') }}</p>
                  <p class="text-foreground">{{ str(ed.achievement) }}</p>
                </div>
                <div v-if="ed.specialize">
                  <p class="field-label">{{ t('hrm.member.adminPage.education.specialize') }}</p>
                  <p class="text-foreground">{{ str(ed.specialize) }}</p>
                </div>
                <div v-if="ed.rank">
                  <p class="field-label">{{ t('hrm.member.adminPage.education.rank') }}</p>
                  <p class="text-foreground">{{ str(ed.rank) }}</p>
                </div>
                <div v-if="ed.description" class="col-span-2">
                  <p class="field-label">{{ t('hrm.member.adminPage.form.description') }}</p>
                  <p class="text-foreground">{{ str(ed.description) }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Edit mode -->
        <div v-else class="card-surface p-6">
          <p class="section-title mb-5">{{ t('hrm.member.adminPage.education.editTitle') }}</p>

          <div v-for="(ed, i) in editEducation" :key="i"
            class="edit-item" :class="{ 'border-t border-dashed border-border/70 pt-5 mt-5': i > 0 }">
            <div class="flex items-center justify-between mb-3">
              <p class="text-[12px] font-semibold text-muted-foreground">{{ t('hrm.member.adminPage.form.item') }} {{ i + 1 }}</p>
              <button class="del-btn" @click="removeEdu(i)"><Trash2 :size="11" />{{ t('hrm.member.adminPage.form.delete') }}</button>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="edit-label">{{ t('hrm.member.adminPage.education.achievement') }} <span class="text-red-400">*</span></label>
                <input v-model="ed.achievement" class="field-input" :placeholder="t('hrm.member.adminPage.education.achievementPh')" />
              </div>
              <div class="space-y-1.5">
                <label class="edit-label">{{ t('hrm.member.adminPage.education.school') }} <span class="text-red-400">*</span></label>
                <input v-model="ed.university" class="field-input" :placeholder="t('hrm.member.adminPage.education.schoolPh')" />
              </div>
              <div class="space-y-1.5">
                <label class="edit-label">{{ t('hrm.member.adminPage.education.academicLevel') }}</label>
                <input v-model="ed.academic_level" class="field-input" :placeholder="t('hrm.member.adminPage.education.academicLevelPh')" />
              </div>
              <div class="space-y-1.5">
                <label class="edit-label">{{ t('hrm.member.adminPage.education.major') }}</label>
                <input v-model="ed.major" class="field-input" :placeholder="t('hrm.member.adminPage.education.majorPh')" />
              </div>
              <div class="space-y-1.5">
                <label class="edit-label">{{ t('hrm.member.adminPage.education.specialize') }}</label>
                <input v-model="ed.specialize" class="field-input" :placeholder="t('hrm.member.adminPage.education.specializePh')" />
              </div>
              <div class="space-y-1.5">
                <label class="edit-label">{{ t('hrm.member.adminPage.education.rank') }}</label>
                <input v-model="ed.rank" class="field-input" :placeholder="t('hrm.member.adminPage.education.rankPh')" />
              </div>
              <div class="space-y-1.5">
                <label class="edit-label">{{ t('hrm.member.adminPage.form.startDate') }}</label>
                <input v-model="ed.start_date" class="field-input" placeholder="YYYY-MM-DD" />
              </div>
              <div class="space-y-1.5">
                <label class="edit-label">{{ t('hrm.member.adminPage.form.endDate') }}</label>
                <input v-model="ed.end_date" class="field-input" placeholder="YYYY-MM-DD" />
              </div>
              <div class="col-span-2 space-y-1.5">
                <label class="edit-label">{{ t('hrm.member.adminPage.form.description') }}</label>
                <textarea v-model="ed.description" class="field-input" style="height:72px;resize:none" :placeholder="t('hrm.member.adminPage.form.descriptionPh')" />
              </div>
            </div>
          </div>

          <button class="mt-5 text-[12.5px] text-primary hover:underline inline-flex items-center gap-1" @click="addEdu">
            + {{ t('hrm.member.adminPage.form.addItem') }}
          </button>

          <div class="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border/60">
            <Btn variant="ghost" size="sm" :disabled="sectionSaving" @click="editingSection = null">{{ t('hrm.member.adminPage.form.cancel') }}</Btn>
            <Btn variant="primary" size="sm" :disabled="sectionSaving" @click="saveSection">
              <span v-if="sectionSaving" class="flex items-center gap-1.5">
                <span class="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {{ t('hrm.member.adminPage.form.saving') }}
              </span>
              <span v-else>{{ t('hrm.member.adminPage.form.save') }}</span>
            </Btn>
          </div>
        </div>
      </div>

      <!-- ══ Tab: experience ══ -->
      <div v-if="tab === 'experience'" class="space-y-5 rise" style="animation-duration:.3s">

        <!-- Section header -->
        <div v-if="editingSection !== 'experience'" class="flex justify-end">
          <Btn v-if="canEdit" variant="outline" size="sm" @click="startEdit('experience')">
            <Pencil :size="13" class="shrink-0" /> {{ t('hrm.member.adminPage.form.edit') }}
          </Btn>
        </div>

        <!-- View mode -->
        <template v-if="editingSection !== 'experience'">
          <div v-if="!experience.length" class="card-surface py-16 text-center text-muted-foreground">
            <Briefcase :size="36" class="mx-auto mb-2 opacity-30" />
            <p class="text-[13px]">{{ t('hrm.member.adminPage.experience.empty') }}</p>
          </div>
          <div v-for="(exp, i) in experience" :key="i" class="card-surface overflow-hidden">
            <div class="flex items-center gap-3 px-5 py-3.5 border-b border-border/70"
              style="background:linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 57% / 0.05), transparent)">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                :style="`background:linear-gradient(135deg, hsl(${(i * 80 + 160) % 360} 65% 60%), hsl(${(i * 80 + 160) % 360} 65% 42%))`">
                <Building2 :size="14" class="text-white" />
              </div>
              <h4 class="font-semibold text-[14px] text-foreground">{{ exp.company || t('hrm.member.adminPage.experience.company') }}</h4>
            </div>
            <template v-if="exp.projects?.length">
              <table class="w-full text-[13px]">
                <thead>
                  <tr class="thead-primary border-b border-border/60 text-[10.5px] uppercase tracking-wider font-semibold">
                    <th class="text-left py-2.5 px-5">{{ t('hrm.member.adminPage.experience.position') }}</th>
                    <th class="text-left py-2.5 px-3">{{ t('hrm.member.adminPage.experience.duration') }}</th>
                    <th class="text-left py-2.5 px-3">{{ t('hrm.member.adminPage.experience.technology') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(proj, j) in exp.projects" :key="j"
                    class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                    <td class="py-3 px-5 font-medium text-foreground">{{ proj.position }}</td>
                    <td class="py-3 px-3 font-mono text-muted-foreground text-[12px]">
                      {{ fmtDateRange(proj.start_date, proj.end_date) }}
                    </td>
                    <td class="py-3 px-3 text-muted-foreground text-[12.5px]">{{ proj.description || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </template>
          </div>
        </template>

        <!-- Edit mode -->
        <div v-else class="card-surface p-6">
          <p class="section-title mb-5">{{ t('hrm.member.adminPage.experience.editTitle') }}</p>

          <div v-for="(exp, ei) in editExperience" :key="ei"
            class="rounded-xl border border-border/60 p-4 mb-4">
            <div class="flex items-center justify-between mb-3">
              <p class="text-[12px] font-semibold text-muted-foreground">{{ t('hrm.member.adminPage.experience.company') }} {{ ei + 1 }}</p>
              <button class="del-btn" @click="removeExp(ei)"><Trash2 :size="11" />{{ t('hrm.member.adminPage.experience.deleteCompany') }}</button>
            </div>
            <div class="space-y-1.5 mb-4">
              <label class="edit-label">{{ t('hrm.member.adminPage.experience.companyName') }} <span class="text-red-400">*</span></label>
              <input v-model="exp.company" class="field-input" :placeholder="t('hrm.member.adminPage.experience.companyPh')" />
            </div>

            <!-- Projects -->
            <div v-for="(proj, pi) in exp.projects" :key="pi"
              class="rounded-lg border border-border/40 bg-muted/20 p-3 mb-2">
              <div class="flex items-center justify-between mb-2">
                <p class="text-[11px] font-semibold text-muted-foreground">{{ t('hrm.member.adminPage.experience.projectRole') }} {{ pi + 1 }}</p>
                <button class="del-btn" @click="removeProject(ei, pi)"><Trash2 :size="11" />{{ t('hrm.member.adminPage.form.delete') }}</button>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="col-span-2 space-y-1">
                  <label class="edit-label">{{ t('hrm.member.adminPage.experience.position') }}</label>
                  <input v-model="proj.position" class="field-input" :placeholder="t('hrm.member.adminPage.experience.positionPh')" />
                </div>
                <div class="space-y-1">
                  <label class="edit-label">{{ t('hrm.member.adminPage.form.startDate') }}</label>
                  <input v-model="proj.start_date" class="field-input" placeholder="YYYY-MM-DD" />
                </div>
                <div class="space-y-1">
                  <label class="edit-label">{{ t('hrm.member.adminPage.form.endDate') }}</label>
                  <input v-model="proj.end_date" class="field-input" placeholder="YYYY-MM-DD" />
                </div>
                <div class="col-span-2 space-y-1">
                  <label class="edit-label">{{ t('hrm.member.adminPage.experience.technologyPh') }}</label>
                  <input v-model="proj.description" class="field-input" :placeholder="t('hrm.member.adminPage.experience.technologyInputPh')" />
                </div>
              </div>
            </div>
            <button class="text-[11.5px] text-primary hover:underline" @click="addProject(ei)">+ {{ t('hrm.member.adminPage.experience.addProject') }}</button>
          </div>

          <button class="text-[12.5px] text-primary hover:underline inline-flex items-center gap-1" @click="addExp">
            + {{ t('hrm.member.adminPage.experience.addCompany') }}
          </button>

          <div class="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border/60">
            <Btn variant="ghost" size="sm" :disabled="sectionSaving" @click="editingSection = null">{{ t('hrm.member.adminPage.form.cancel') }}</Btn>
            <Btn variant="primary" size="sm" :disabled="sectionSaving" @click="saveSection">
              <span v-if="sectionSaving" class="flex items-center gap-1.5">
                <span class="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {{ t('hrm.member.adminPage.form.saving') }}
              </span>
              <span v-else>{{ t('hrm.member.adminPage.form.save') }}</span>
            </Btn>
          </div>
        </div>
      </div>

      <!-- ══ Tab: skills ══ -->
      <div v-if="tab === 'skills'" class="space-y-5 rise" style="animation-duration:.3s">

        <!-- Section header -->
        <div v-if="editingSection !== 'skills'" class="flex justify-end">
          <Btn v-if="canEdit" variant="outline" size="sm" @click="startEdit('skills')">
            <Pencil :size="13" class="shrink-0" /> {{ t('hrm.member.adminPage.form.edit') }}
          </Btn>
        </div>

        <!-- View mode -->
        <template v-if="editingSection !== 'skills'">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <!-- Languages -->
            <div class="card-surface p-5">
              <h3 class="section-title mb-4">{{ t('hrm.member.adminPage.skills.languages') }}</h3>
              <p v-if="!languages.length" class="text-[13px] text-muted-foreground">{{ t('hrm.member.adminPage.skills.noData') }}</p>
              <div v-else class="space-y-3">
                <div v-for="(lang, i) in languages" :key="i"
                  class="flex items-start gap-3 p-3 rounded-xl border border-border/60">
                  <div class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[12px] font-mono">
                    {{ (langName(lang.language_id) || '??').slice(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-semibold text-[13.5px] text-foreground">{{ langName(lang.language_id) || t('hrm.member.adminPage.skills.language') }}</p>
                    <p v-if="levelName(lang.level_id)" class="text-[12px] text-muted-foreground">{{ levelName(lang.level_id) }}</p>
                    <p v-if="lang.certificate" class="text-[11.5px] font-mono text-primary mt-0.5">{{ lang.certificate }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Technical skills -->
            <div class="card-surface p-5">
              <h3 class="section-title mb-4">{{ t('hrm.member.adminPage.skills.technical') }}</h3>
              <p v-if="!skills.length" class="text-[13px] text-muted-foreground">{{ t('hrm.member.adminPage.skills.noData') }}</p>
              <div v-else class="space-y-4">
                <div v-for="sk in skills" :key="sk.title">
                  <div class="flex items-center justify-between text-[12.5px] mb-1.5">
                    <span class="font-medium text-foreground">{{ sk.title }}</span>
                    <span class="font-mono text-muted-foreground">{{ sk.years_of_experience }} {{ t('hrm.member.adminPage.skills.years') }}</span>
                  </div>
                  <div class="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div class="h-full rounded-full transition-all"
                      :style="`width:${sk.years_of_experience / maxYears * 100}%;background:linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 65%), hsl(var(--primary-h) var(--primary-s) 45%))`" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Introduce -->
            <div class="card-surface p-5">
              <h3 class="section-title mb-4">{{ t('hrm.member.adminPage.overview.introduce') }}</h3>
              <p v-if="detail.introduce" class="text-[13px] text-foreground/85 leading-relaxed italic">"{{ detail.introduce }}"</p>
              <p v-else class="text-[13px] text-muted-foreground">{{ t('hrm.member.adminPage.skills.noData') }}</p>
            </div>
          </div>
        </template>

        <!-- Edit mode -->
        <div v-else class="space-y-5">

          <!-- Edit skills -->
          <div class="card-surface p-6">
            <p class="section-title mb-4">{{ t('hrm.member.adminPage.skills.technical') }}</p>
            <div v-for="(sk, i) in editSkills" :key="i"
              class="grid grid-cols-[1fr_auto_auto] gap-3 items-end mb-3">
              <div class="space-y-1.5">
                <label v-if="i === 0" class="edit-label">{{ t('hrm.member.adminPage.skills.skillName') }}</label>
                <input v-model="sk.title" class="field-input" :placeholder="t('hrm.member.adminPage.skills.skillNamePh')" />
              </div>
              <div class="space-y-1.5">
                <label v-if="i === 0" class="edit-label">{{ t('hrm.member.adminPage.skills.yearsLabel') }}</label>
                <input v-model.number="sk.years_of_experience" type="number" min="0" step="0.5"
                  class="field-input w-24" placeholder="0" />
              </div>
              <button class="del-btn" @click="removeSkillItem(i)"><Trash2 :size="11" />{{ t('hrm.member.adminPage.form.delete') }}</button>
            </div>
            <button class="text-[12.5px] text-primary hover:underline mt-1" @click="addSkillItem">+ {{ t('hrm.member.adminPage.skills.addSkill') }}</button>
          </div>

          <!-- Edit languages -->
          <div class="card-surface p-6">
            <p class="section-title mb-4">{{ t('hrm.member.adminPage.skills.languages') }}</p>
            <div v-for="(lang, i) in editLanguages" :key="i"
              class="edit-item" :class="{ 'border-t border-dashed border-border/70 pt-4 mt-4': i > 0 }">
              <div class="flex items-center justify-between mb-2">
                <p class="text-[11px] font-semibold text-muted-foreground">{{ t('hrm.member.adminPage.skills.language') }} {{ i + 1 }}</p>
                <button class="del-btn" @click="removeLang(i)"><Trash2 :size="11" />{{ t('hrm.member.adminPage.form.delete') }}</button>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="edit-label">{{ t('hrm.member.adminPage.skills.language') }}</label>
                  <Select v-model="lang.language_id" :options="languageOptions" :width="'100%'" />
                </div>
                <div class="space-y-1.5">
                  <label class="edit-label">{{ t('hrm.member.adminPage.skills.level') }}</label>
                  <Select v-model="lang.level_id" :options="levelOptions" :width="'100%'" />
                </div>
                <div class="col-span-2 space-y-1.5">
                  <label class="edit-label">{{ t('hrm.member.adminPage.skills.certificate') }}</label>
                  <input v-model="lang.certificate" class="field-input" :placeholder="t('hrm.member.adminPage.skills.certificatePh')" />
                </div>
              </div>
            </div>
            <button class="text-[12.5px] text-primary hover:underline mt-3" @click="addLang">+ {{ t('hrm.member.adminPage.skills.addLanguage') }}</button>
          </div>

          <!-- Edit introduce -->
          <div class="card-surface p-6">
            <p class="section-title mb-4">{{ t('hrm.member.adminPage.overview.introduce') }}</p>
            <textarea v-model="editIntroduce" class="field-input w-full" style="height:120px;resize:none"
              :placeholder="t('hrm.member.adminPage.skills.introducePh')" />
          </div>

          <div class="flex items-center justify-end gap-2">
            <Btn variant="ghost" size="sm" :disabled="sectionSaving" @click="editingSection = null">{{ t('hrm.member.adminPage.form.cancel') }}</Btn>
            <Btn variant="primary" size="sm" :disabled="sectionSaving" @click="saveSection">
              <span v-if="sectionSaving" class="flex items-center gap-1.5">
                <span class="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {{ t('hrm.member.adminPage.form.saving') }}
              </span>
              <span v-else>{{ t('hrm.member.adminPage.form.save') }}</span>
            </Btn>
          </div>
        </div>
      </div>

      <!-- ══ Tab: awards ══ -->
      <div v-if="tab === 'awards'" class="space-y-4 rise" style="animation-duration:.3s">

        <!-- Section header -->
        <div v-if="editingSection !== 'awards'" class="flex justify-end">
          <Btn v-if="canEdit" variant="outline" size="sm" @click="startEdit('awards')">
            <Pencil :size="13" class="shrink-0" /> {{ t('hrm.member.adminPage.form.edit') }}
          </Btn>
        </div>

        <!-- View mode -->
        <template v-if="editingSection !== 'awards'">
          <div v-if="!awards.length" class="card-surface py-16 text-center text-muted-foreground">
            <Award :size="36" class="mx-auto mb-2 opacity-30" />
            <p class="text-[13px]">{{ t('hrm.member.adminPage.awards.empty') }}</p>
          </div>
          <div v-for="(aw, i) in awards" :key="i" class="card-surface p-6 flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style="background:hsl(38 92% 50% / 0.12);color:hsl(38 92% 45%)">
              <Award :size="18" />
            </div>
            <div>
              <h4 class="font-semibold text-[15px] text-foreground">{{ aw.title || t('hrm.member.adminPage.awards.award') }}</h4>
              <p v-if="aw.description" class="text-[13px] text-muted-foreground mt-1">{{ aw.description }}</p>
            </div>
          </div>
        </template>

        <!-- Edit mode -->
        <div v-else class="card-surface p-6">
          <p class="section-title mb-5">{{ t('hrm.member.adminPage.awards.editTitle') }}</p>

          <div v-for="(aw, i) in editAwards" :key="i"
            class="edit-item" :class="{ 'border-t border-dashed border-border/70 pt-5 mt-5': i > 0 }">
            <div class="flex items-center justify-between mb-3">
              <p class="text-[12px] font-semibold text-muted-foreground">{{ t('hrm.member.adminPage.form.item') }} {{ i + 1 }}</p>
              <button class="del-btn" @click="removeAward(i)"><Trash2 :size="11" />{{ t('hrm.member.adminPage.form.delete') }}</button>
            </div>
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-1.5">
                <label class="edit-label">{{ t('hrm.member.adminPage.awards.awardName') }} <span class="text-red-400">*</span></label>
                <input v-model="aw.title" class="field-input" :placeholder="t('hrm.member.adminPage.awards.awardNamePh')" />
              </div>
              <div class="space-y-1.5">
                <label class="edit-label">{{ t('hrm.member.adminPage.form.description') }}</label>
                <textarea v-model="aw.description" class="field-input" style="height:72px;resize:none"
                  :placeholder="t('hrm.member.adminPage.awards.descriptionPh')" />
              </div>
            </div>
          </div>

          <button class="mt-5 text-[12.5px] text-primary hover:underline inline-flex items-center gap-1" @click="addAward">
            + {{ t('hrm.member.adminPage.awards.addAward') }}
          </button>

          <div class="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border/60">
            <Btn variant="ghost" size="sm" :disabled="sectionSaving" @click="editingSection = null">{{ t('hrm.member.adminPage.form.cancel') }}</Btn>
            <Btn variant="primary" size="sm" :disabled="sectionSaving" @click="saveSection">
              <span v-if="sectionSaving" class="flex items-center gap-1.5">
                <span class="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {{ t('hrm.member.adminPage.form.saving') }}
              </span>
              <span v-else>{{ t('hrm.member.adminPage.form.save') }}</span>
            </Btn>
          </div>
        </div>
      </div>

    </template>

    <!-- ── Error state ── -->
    <div v-else class="card-surface py-16 text-center text-muted-foreground">
      <User :size="36" class="mx-auto mb-2 opacity-30" />
      <p class="text-[13px]">{{ t('hrm.member.adminPage.errorNotFound') }}</p>
      <button class="mt-3 text-[12.5px] text-primary underline" @click="router.back()">{{ resolvedBackLabel }}</button>
    </div>

  </div>

  <!-- Edit Drawer (overview info) -->
  <MemberEditDrawer
    v-if="detail && canEdit"
    v-model:open="editOpen"
    :detail="detail"
    :branches="store.branches"
    :job-titles="store.jobTitles"
    @saved="refetchDetail"
  />
</template>

<style scoped>
.field-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  margin-bottom: 0.25rem;
}
.edit-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: hsl(var(--muted-foreground));
}
.field-input {
  width: 100%;
  height: 2.25rem;
  padding: 0 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--card));
  font-size: 13px;
  color: hsl(var(--foreground));
  outline: none;
  transition: border-color .15s;
}
.field-input:focus {
  border-color: hsl(var(--primary) / 0.6);
}
.field-input::placeholder {
  color: hsl(var(--muted-foreground) / 0.4);
}
textarea.field-input {
  height: auto;
  padding: 0.5rem 0.75rem;
  resize: vertical;
}
.del-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 500;
  color: hsl(var(--destructive, 0 72% 51%));
  border: 1px solid hsl(var(--destructive, 0 72% 51%) / 0.35);
  border-radius: 6px;
  padding: 3px 8px;
  line-height: 1.4;
  transition: background .15s, border-color .15s;
}
.del-btn:hover {
  background: hsl(0 72% 51% / 0.06);
  border-color: hsl(0 72% 51% / 0.6);
}
</style>
