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

definePageMeta({ layout: 'admin', middleware: 'auth' })
const { t } = useI18n()
const activeTab = ref('company')
const dashStore = useDashboardStore()
const auth = useAuth()

onMounted(async () => {
  // Ensure user is loaded (layout may not have finished fetchUser yet)
  if (!auth.user.value) await auth.fetchUser()
  dashStore.fetchHomeSummary()
})

const homeTabs = computed(() => [
  { value: 'company', label: t('home.tabs.company') },
  { value: 'personal', label: t('home.tabs.personal') },
  { value: 'project', label: t('home.tabs.project') },
])

const statCards = computed<StatCardData[]>(() => {
  const s = dashStore.homeSummary
  if (!s) return dashboardStats
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
      value: s.total.projects,
      sublabel: t('home.stat.allProjects'),
      breakdown: [
        { label: t('home.stat.projectActive'), value: s.project_status.active },
        { label: t('home.stat.projectEnded'), value: s.project_status.ended },
      ],
    },
    {
      label: t('home.stat.evalPeriod'),
      icon: 'Star',
      value: `Q${s.eval_period.quarter}/${String(s.eval_period.year).slice(2)}`,
      sublabel: t('home.stat.evalSubmitted', { done: s.eval_period.done, total: s.eval_period.total }),
      breakdown: [{ label: t('home.stat.evalDone'), value: `${s.eval_period.done} / ${s.eval_period.total}` }],
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
