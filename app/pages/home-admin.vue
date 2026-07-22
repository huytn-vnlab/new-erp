<script setup lang="ts">
import { ref, computed } from 'vue'
import Banner from '~/components/home/Banner.vue'
import StatCard from '~/components/home/StatCard.vue'
import Tabs from '~/components/base/Tabs.vue'
import CompanyTab from '~/components/home/CompanyTab.vue'
import PersonalTab from '~/components/home/PersonalTab.vue'
import ProjectTab from '~/components/home/ProjectTab.vue'
import { dashboardStats } from '~/mocks/dashboard'
import type { StatCardData } from '~/types'
import { useDashboardStore } from '~/stores/dashboard'
import { useNotificationStore } from '~/stores/notification'
import { useLeaveStore } from '~/stores/leave'
import { useProjectStore } from '~/stores/project'
import { useEvaluationStore } from '~/stores/evaluation'

definePageMeta({ layout: 'admin', middleware: 'auth' })
const { t } = useI18n()
const activeTab = ref('company')
const dashStore = useDashboardStore()
const notiStore = useNotificationStore()
const leaveStore = useLeaveStore()
const projectStore = useProjectStore()
const evalStore = useEvaluationStore()
const auth = useAuth()

// Same "submitted" bucketing evaluation.vue uses for its rank distribution —
// 2 (Đã tạo) and 6 (Đã duyệt) count as done, everything else is still pending.
const SUBMITTED_STATUSES = [2, 6]
const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1
const currentYear = new Date().getFullYear()
const evalPeriodStats = ref<{ done: number; total: number } | null>(null)

async function loadEvalPeriodStats() {
  const rows = await evalStore.fetchAllEvaluations({ quarter: currentQuarter, year: currentYear })
  evalPeriodStats.value = { done: rows.filter(r => SUBMITTED_STATUSES.includes(r.status)).length, total: rows.length }
}

onMounted(async () => {
  // Ensure user is loaded (layout may not have finished fetchUser yet)
  if (!auth.user.value) await auth.fetchUser()
  const userId = auth.user.value?.id
  dashStore.fetchStat()
  dashStore.fetchReminders()
  notiStore.fetchNotifications()
  notiStore.fetchUnreadCount()
  if (userId) leaveStore.fetchLeaveInfo(userId)
  projectStore.fetchProjects()
  if (userId) projectStore.fetchMyProjects(userId)
  projectStore.fetchAllProjectsForStats()
  loadEvalPeriodStats()
})

const homeTabs = computed(() => [
  { value: 'company', label: t('home.tabs.company') },
  { value: 'personal', label: t('home.tabs.personal') },
  { value: 'project', label: t('home.tabs.project') },
])

const statCards = computed<StatCardData[]>(() => {
  const s = dashStore.stat
  if (!s) return dashboardStats
  const evalStats = evalPeriodStats.value
  return [
    {
      label: t('home.stat.totalEmployees'),
      icon: 'Users',
      value: s.total.users,
      sublabel: t('home.stat.activeCount', { n: s.total.users }),
      breakdown: (() => {
        const branches = s.number_people_branch ?? []
        const branchSum = branches.reduce((a, b) => a + b.amount, 0)
        const unassigned = s.total.users - branchSum
        const rows = branches.slice(0, 3).map(b => ({ label: b.branch, value: b.amount }))
        if (unassigned > 0) rows.push({ label: t('home.stat.unassigned'), value: unassigned })
        return rows
      })(),
    },
    {
      label: t('home.stat.projects'),
      icon: 'Folder',
      value: projectStore.pagination.total_row || s.total.projects,
      sublabel: t('home.stat.allProjects'),
      breakdown: (() => {
        // ProjectStatus is only 1 (active) or 2 (ended) on the backend — no
        // third "pending" state exists, unlike the old design mock.
        const all = projectStore.allProjects
        if (!all.length) return undefined
        const active = all.filter(p => p.status === 1).length
        return [
          { label: t('home.stat.projectActive'), value: active },
          { label: t('home.stat.projectEnded'), value: all.length - active },
        ]
      })(),
    },
    {
      label: t('home.stat.evalPeriod'),
      icon: 'Star',
      value: `Q${currentQuarter}/${String(currentYear).slice(2)}`,
      sublabel: evalStats ? t('home.stat.evalSubmitted', { done: evalStats.done, total: evalStats.total }) : '',
      breakdown: evalStats ? [{ label: t('home.stat.evalDone'), value: `${evalStats.done} / ${evalStats.total}` }] : undefined,
    },
  ]
})
</script>

<template>
  <div class="space-y-6">
    <Banner />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard v-for="(s, i) in statCards" :key="i" v-bind="s" :delay="80 + i * 60" />
    </div>
    <Tabs v-model="activeTab" :items="homeTabs" />
    <CompanyTab v-if="activeTab === 'company'" />
    <PersonalTab v-else-if="activeTab === 'personal'" />
    <ProjectTab v-else />
  </div>
</template>
