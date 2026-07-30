<script setup lang="ts">
import { ref, computed } from 'vue'
import { Target, Plus, ChevronRight, X } from 'lucide-vue-next'
import SectionCard from './SectionCard.vue'
import StackedBar from '~/components/charts/StackedBar.vue'
import { useProjectStore } from '~/stores/project'
import { useDashboardStore } from '~/stores/dashboard'
import type { ProjectRow } from '~/types'

const { t } = useI18n()
const projectStore = useProjectStore()
const dashStore = useDashboardStore()

onMounted(() => {
  dashStore.fetchStat()
  projectStore.fetchProjects()
})

const projects = computed(() => projectStore.projects)

const PROJ_STATUS: Record<string, { dot: string; cls: string }> = {
  1: { dot: '#22c55e', cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
  2: { dot: '#f59e0b', cls: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
  3: { dot: '#a3a3a3', cls: 'text-muted-foreground bg-muted' },
}
const statusFor = (p: ProjectRow) => PROJ_STATUS[p.status] ?? PROJ_STATUS[1]!

const totalTargets = computed(() => projects.value.reduce((a, p) => a + (p.project_targets?.length ?? 0), 0))

const summary = computed(() => {
  const total = projectStore.pagination.total_row || projects.value.length
  return [
    { l: t('home.project.total'), v: total, sub: t('home.project.allProjects') },
    { l: t('home.project.quarterTarget'), v: totalTargets.value, sub: t('home.project.tracking') },
    { l: t('home.project.totalEmployees'), v: dashStore.stat?.total.users ?? '—', sub: t('home.project.allCompany') },
    { l: t('home.project.branches'), v: dashStore.stat?.number_people_branch?.length ?? '—', sub: t('home.project.activeBranches') },
  ]
})

// Branch distribution from statistic/general
const BRANCH_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary-h) 70% 70%)',
  'hsl(38 92% 60%)',
  'hsl(160 60% 50%)',
  'hsl(280 70% 65%)',
]
const branchDist = computed(() => {
  const data = dashStore.stat?.number_people_branch
  if (!data?.length) return []
  return data.map((b, i) => ({
    label: b.branch,
    color: BRANCH_COLORS[i % BRANCH_COLORS.length]!,
    value: b.amount,
  }))
})

// Top managers derived from project list — `managed_by` is always a raw user
// id (per types/index.ts), resolved via the store's id→name map (same one
// populated alongside the project list fetch).
const topManagers = computed(() => {
  const managerMap = new Map<number, { name: string; count: number }>()
  for (const p of projects.value) {
    if (!p.managed_by) continue
    const existing = managerMap.get(p.managed_by)
    if (existing) existing.count++
    else managerMap.set(p.managed_by, { name: projectStore.users[String(p.managed_by)] ?? String(p.managed_by), count: 1 })
  }
  return [...managerMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const initials = (n: string) => n.split(' ').map((s: string) => s[0]).slice(-2).join('')

const openProject = ref<ProjectRow | null>(null)
</script>

<template>
  <div class="space-y-6">
    <!-- Summary strip -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="(s, i) in summary" :key="i" class="card-surface p-4 rise" :style="{ animationDelay: i * 40 + 'ms' }">
        <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{{ s.l }}</p>
        <p class="text-[24px] font-bold font-heading text-foreground mt-0.5 tabular-nums">{{ s.v }}</p>
        <p class="text-[11px] text-muted-foreground mt-0.5">{{ s.sub }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Project list -->
      <SectionCard :delay="200" class="lg:col-span-3" :title="t('home.project.list')">
        <template #action>
          <div class="flex items-center gap-2">
            <button
              class="inline-flex items-center gap-1 text-[12px] font-semibold text-white px-2.5 py-1.5 rounded-md"
              :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }"
              @click="navigateTo('/workflow/project')">
              <Plus :size="12" /> {{ t('home.project.newProject') }}
            </button>
          </div>
        </template>
        <div v-if="projects.length > 0">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="thead-primary border-b border-border/70">
                <th class="text-left font-semibold py-2.5 px-5">{{ t('home.project.colProject') }}</th>
                <th class="text-right font-semibold py-2.5 px-2">{{ t('home.project.colTarget') }}</th>
                <th class="py-2.5 px-3" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in projects" :key="p.project_id"
                class="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                @click="openProject = p">
                <td class="py-3 px-5">
                  <div class="flex items-center gap-2.5">
                    <span class="h-2 w-2 rounded-full shrink-0" :style="{ background: statusFor(p).dot }" />
                    <div>
                      <p class="font-medium text-foreground">{{ p.project_name }}</p>
                      <p v-if="p.project_description" class="text-[11px] text-muted-foreground truncate max-w-[240px]">{{ p.project_description }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-2 text-center">
                  <span v-if="p.project_targets?.length" class="inline-flex items-center gap-1 text-[12px] font-medium text-primary">
                    <Target :size="11" />{{ p.project_targets.length }}
                  </span>
                  <span v-else class="text-muted-foreground/50">—</span>
                </td>
                <td class="py-3 px-3 text-right text-muted-foreground"><ChevronRight :size="14" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-8 text-muted-foreground text-[13px]">
          {{ projectStore.loading ? t('common.loading') : t('home.project.noProjects') }}
        </div>
        <div
          v-if="projects.length > 0 && projects.length < projectStore.pagination.total_row"
          class="border-t border-border/60 px-5 py-3 flex items-center justify-between text-[12.5px]">
          <span class="text-muted-foreground">
            {{ t('home.project.showing', { current: projects.length, total: projectStore.pagination.total_row }) }}
          </span>
          <button
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:bg-muted/50 text-foreground/80 font-medium transition-colors disabled:opacity-50"
            :disabled="projectStore.loadingMore"
            @click="projectStore.loadMoreProjects()">
            <span v-if="projectStore.loadingMore" class="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            {{ projectStore.loadingMore ? t('common.loading') : t('home.project.loadMore', { n: projectStore.pagination.total_row - projects.length }) }}
          </button>
        </div>
      </SectionCard>

      <!-- Right side -->
      <div class="lg:col-span-2 space-y-6">
        <SectionCard :delay="250" :title="t('home.project.branchDist')">
          <div v-if="branchDist.length > 0" class="space-y-3">
            <StackedBar :segments="branchDist" :height="10" />
            <ul class="grid grid-cols-2 gap-2 text-[12px]">
              <li v-for="b in branchDist" :key="b.label" class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: b.color }" />
                <span class="text-foreground/80 flex-1">{{ b.label }}</span>
                <span class="font-semibold tabular-nums">{{ b.value }}</span>
              </li>
            </ul>
          </div>
          <div v-else class="text-center py-6 text-muted-foreground text-[13px]">{{ t('home.project.noBranchData') }}</div>
        </SectionCard>

        <SectionCard :delay="300" :title="t('home.project.topManagers')">
          <div v-if="topManagers.length > 0">
            <ul class="space-y-3">
              <li v-for="(u, i) in topManagers" :key="i" class="flex items-center gap-3">
                <span
                  class="h-9 w-9 rounded-lg flex items-center justify-center text-[11px] font-semibold text-white"
                  :style="{ background: `linear-gradient(135deg, hsl(${(i * 60 + 200) % 360} 70% 65%), hsl(${(i * 60 + 200) % 360} 70% 45%))` }">
                  {{ initials(u.name) }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-[13px] font-medium text-foreground truncate">{{ u.name }}</p>
                </div>
                <span class="text-[11.5px] font-mono font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-full">{{ t('home.project.projectCount', { n: u.count }) }}</span>
              </li>
            </ul>
          </div>
          <div v-else class="text-center py-6 text-muted-foreground text-[13px]">{{ t('home.project.noManagerData') }}</div>
        </SectionCard>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="openProject" class="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="openProject = null" />
      <div class="relative card-surface w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rise">
        <div class="px-5 py-4 border-b border-border/70 flex items-center justify-between">
          <div>
            <h3 class="text-[16px] font-bold font-heading text-foreground">{{ openProject.project_name }}</h3>
            <p v-if="openProject.project_description" class="text-[12px] text-muted-foreground mt-0.5">{{ openProject.project_description }}</p>
          </div>
          <button class="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" @click="openProject = null">
            <X :size="16" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto overscroll-contain scrollbar-thin p-5">
          <div v-if="openProject.project_targets?.length" class="space-y-2">
            <p class="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">{{ t('home.project.targets') }}</p>
            <ul class="space-y-1.5">
              <li
                v-for="(target, i) in openProject.project_targets" :key="i"
                class="text-[13px] text-foreground border border-border/60 rounded-lg px-3 py-2">
                <span class="text-muted-foreground text-[11px]">{{ target.year ? `${target.year}` : '' }}{{ target.quarter ? ` Q${target.quarter}` : '' }} </span>
                {{ target.content ?? '—' }}
              </li>
            </ul>
          </div>
          <p v-else class="text-[13px] text-muted-foreground italic">{{ t('home.project.noTargets') }}</p>
        </div>
        <div class="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
          <button class="px-3 py-1.5 text-[13px] rounded-md hover:bg-muted text-foreground/80" @click="openProject = null">{{ t('common.close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
