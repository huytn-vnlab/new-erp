<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, TrendingUp, Mail, Phone, Calendar, Building2, Users } from 'lucide-vue-next'
import SectionCard from './SectionCard.vue'
import Donut from '~/components/charts/Donut.vue'
import LineChart from '~/components/charts/LineChart.vue'
import { useLeaveStore } from '~/stores/leave'
import { useProjectStore } from '~/stores/project'
import { useDashboardStore } from '~/stores/dashboard'
import { formatDateDisplay } from '~/utils/date'
import { RANK_LETTER, RANK_COLOR } from '~/mocks/evaluation'

const { t } = useI18n()
const auth = useAuth()
const leaveStore = useLeaveStore()
const projectStore = useProjectStore()
const dashStore = useDashboardStore()

// ── Personal info ──────────────────────────────────────────────────────────
const user = computed(() => auth.user.value)
const fullName = computed(() => user.value?.name ?? user.value?.email ?? 'Người dùng')
const initials = computed(() => fullName.value.trim().split(/\s+/).map((s: string) => s[0]).slice(-2).join('').toUpperCase())

const formatDate = (d: string | null | undefined) => {
  return d ? (formatDateDisplay(d) || d) : '—'
}

// getuser has no `branch_name` — only a numeric `branch` id plus a
// `branch_list_box` id→name map (same pattern as settings' permission modules).
const branchName = computed(() => {
  const u = user.value
  return u?.branch_list_box?.[String(u.branch)] ?? '—'
})

const fields = computed(() => [
  { icon: Mail, label: t('home.personal.email'), value: user.value?.email ?? '—' },
  { icon: Phone, label: t('home.personal.phone'), value: user.value?.phone_number ?? '—' },
  { icon: Calendar, label: t('home.personal.birthday'), value: formatDate(user.value?.birthday) },
  { icon: Building2, label: t('home.personal.branch'), value: branchName.value },
])

// ── Leave info ─────────────────────────────────────────────────────────────
const leaveInfo = computed(() => leaveStore.leaveInfo)
const leaveUsed = computed(() => leaveInfo.value?.day_used ?? 0)
const leaveRemaining = computed(() => leaveInfo.value?.day_remaining ?? 0)
const leaveBonus = computed(() => leaveInfo.value?.day_bonus ?? 0)
const leavePrevious = computed(() => leaveInfo.value?.day_remaining_previous ?? 0)
const leaveTotal = computed(() => leaveUsed.value + leaveRemaining.value)
const leaveYear = new Date().getFullYear()

// ── Rank growth ────────────────────────────────────────────────────────────
// cf.EvaluationRankList ids aren't ordered by grade quality (D=1,A=2,B=3,C=4,S=5) —
// same explicit best→worst ordinal used in evaluation.vue's RANK_ORDER, so the
// line trends up as the employee's rank genuinely improves.
const RANK_ORDER: Record<number, number> = { 5: 5, 2: 4, 3: 3, 4: 2, 1: 1 }

function quarterLabel(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const q = Math.floor(d.getMonth() / 3) + 1
  return `Q${q}/${String(d.getFullYear()).slice(2)}`
}

const sortedRankLogs = computed(() => {
  const logs = dashStore.stat?.user_rank_logs
  return logs?.length ? [...logs].sort((a, b) => a.created_at < b.created_at ? -1 : 1) : []
})
const rankGrowth = computed(() =>
  sortedRankLogs.value.map(l => ({ label: quarterLabel(l.created_at), value: RANK_ORDER[l.rank] ?? 0 })),
)
const latestRankLetter = computed(() => {
  const latest = sortedRankLogs.value.at(-1)
  return latest ? RANK_LETTER[latest.rank] : undefined
})

// ── My projects ────────────────────────────────────────────────────────────
const PROJ_COLORS = ['sky', 'emerald', 'amber', 'violet']
const myProjects = computed(() => projectStore.myProjects)

const projGradient = (c: string) => c === 'sky' ? 'linear-gradient(135deg,#67d4ff,#0e7eb5)'
  : c === 'emerald' ? 'linear-gradient(135deg,#6ee7b7,#047857)'
  : c === 'amber' ? 'linear-gradient(135deg,#fcd34d,#b45309)'
  : 'linear-gradient(135deg,#c4b5fd,#5b21b6)'
</script>

<template>
  <div class="space-y-6">
    <!-- Row 1: contact + leave -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <SectionCard :delay="50" class="lg:col-span-3" :title="t('home.personal.info')">
        <template #action>
          <button class="text-[12px] text-primary hover:underline inline-flex items-center gap-1">
            {{ t('common.edit') }} <ArrowRight :size="11" />
          </button>
        </template>
        <div class="flex items-start gap-5">
          <span
            class="w-16 h-16 rounded-xl inline-flex items-center justify-center text-[20px] font-bold text-white font-heading shrink-0"
            :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 38%))' }">
            {{ initials }}
          </span>
          <div class="min-w-0 flex-1">
            <h4 class="text-[18px] font-bold text-foreground font-heading">{{ fullName }}</h4>
            <p class="text-[12.5px] text-muted-foreground mt-0.5">
              {{ user?.role_name ?? '' }}
              {{ branchName !== '—' ? '· ' + branchName : '' }}
            </p>
            <div class="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
              <span v-if="latestRankLetter" class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Rank {{ latestRankLetter }}</span>
            </div>
          </div>
        </div>
        <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5 pt-5 border-t border-border/70">
          <div v-for="f in fields" :key="f.label" class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-primary/[0.08] text-primary flex items-center justify-center shrink-0">
              <component :is="f.icon" :size="14" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] text-muted-foreground uppercase tracking-wider">{{ f.label }}</p>
              <p class="text-[13.5px] text-foreground font-medium truncate">{{ f.value }}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard :delay="100" class="lg:col-span-2" :title="t('home.personal.leave', { year: leaveYear })">
        <template #action><button class="text-[12px] text-primary hover:underline">{{ t('home.personal.createLeave') }}</button></template>
        <div class="flex items-center gap-5">
          <Donut :used="leaveUsed" :total="leaveTotal || 14" :label="`${leaveRemaining}`" :sublabel="t('home.personal.daysOf', { total: leaveTotal || 14 })" />
          <div class="flex-1 space-y-2.5 text-[13px]">
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-2 text-muted-foreground">
                <span class="h-2 w-2 rounded-full" :style="{ background: 'hsl(var(--primary))' }" />{{ t('home.personal.leaveUsed') }}
              </span>
              <span class="font-semibold tabular-nums">{{ leaveUsed }} {{ t('home.personal.days') }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-2 text-muted-foreground">
                <span class="h-2 w-2 rounded-full bg-muted-foreground/30" />{{ t('home.personal.leaveRemaining') }}
              </span>
              <span class="font-semibold tabular-nums text-emerald-600">{{ leaveRemaining }} {{ t('home.personal.days') }}</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-border/70">
              <span class="text-muted-foreground">{{ t('home.personal.leaveBonus') }}</span>
              <span class="font-semibold tabular-nums">+{{ leaveBonus }} {{ t('home.personal.days') }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t('home.personal.leavePrevious') }}</span>
              <span class="font-semibold tabular-nums">{{ leavePrevious }} {{ t('home.personal.days') }}</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- Row 2: rank growth line -->
    <SectionCard :delay="150" :title="t('home.personal.rankGrowth')">
      <template #action>
        <div class="flex items-center gap-3 text-[12px]">
          <span class="text-muted-foreground">{{ t('home.personal.currentTerm') }}</span>
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold"
            :style="{ background: (latestRankLetter ? RANK_COLOR[latestRankLetter] : undefined) + '1a', color: latestRankLetter ? RANK_COLOR[latestRankLetter] : undefined }"
          >
            {{ latestRankLetter ? 'Rank ' + latestRankLetter : '—' }} <TrendingUp :size="11" />
          </span>
        </div>
      </template>
      <div v-if="rankGrowth.length > 0" class="h-[240px]">
        <LineChart :data="rankGrowth" :height="240" />
      </div>
      <div v-else class="h-[240px] flex items-center justify-center text-[13px] text-muted-foreground">{{ t('home.personal.noRankHistory') }}</div>
      <p class="text-[11.5px] text-muted-foreground mt-2 italic">{{ t('home.personal.rankNote') }}</p>
    </SectionCard>

    <!-- Row 3: projects -->
    <SectionCard :delay="200" :title="t('home.personal.myProjects')">
      <template #action>
        <span class="text-[11.5px] text-muted-foreground">{{ t('home.personal.projectCount', { n: myProjects.length }) }}</span>
      </template>
      <div v-if="myProjects.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          v-for="(p, i) in myProjects" :key="p.project_id"
          class="card-surface interactive p-4 text-left flex flex-col gap-3" style="border-radius:12px">
          <div class="flex items-start gap-2.5">
            <div
              class="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-[13px] font-heading"
              :style="{ background: projGradient(PROJ_COLORS[i % 4]!) }">
              {{ p.project_name.slice(0, 1) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[13px] font-semibold text-foreground truncate">{{ p.project_name }}</p>
              <p v-if="p.project_description" class="text-[11px] text-muted-foreground truncate">{{ p.project_description }}</p>
            </div>
          </div>
          <div class="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/70 pt-2.5">
            <span class="inline-flex items-center gap-1"><Users :size="11" />{{ t('home.project.colProject') }}</span>
            <span v-if="p.created_at" class="font-mono">{{ p.created_at?.slice(0, 10) }}</span>
          </div>
        </button>
      </div>
      <div v-else class="text-center py-8 text-muted-foreground text-[13px]">{{ t('home.personal.noProjects') }}</div>
    </SectionCard>
  </div>
</template>
