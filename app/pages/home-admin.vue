<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Banner from '~/components/home/Banner.vue'
import StatCard from '~/components/home/StatCard.vue'
import Tabs from '~/components/base/Tabs.vue'
import CompanyTab from '~/components/home/CompanyTab.vue'
import PersonalTab from '~/components/home/PersonalTab.vue'
import ProjectTab from '~/components/home/ProjectTab.vue'
import { dashboardStats, homeTabs } from '~/mocks/dashboard'
import type { StatCardData } from '~/types'
import { useDashboardStore } from '~/stores/dashboard'

definePageMeta({ layout: 'admin', middleware: 'auth' })
const activeTab = ref('company')
const dashStore = useDashboardStore()
onMounted(() => dashStore.fetchStat())

const statCards = computed<StatCardData[]>(() => {
  const s = dashStore.stat
  if (!s) return dashboardStats
  return [
    {
      label: 'Tổng nhân viên',
      icon: 'Users',
      value: s.total_members,
      trend: { dir: 'up', value: `+${s.new_members_this_month}` },
      sublabel: `${s.total_active} đang hoạt động`,
      sparkData: dashboardStats[0]!.sparkData,
      breakdown: s.members_by_branch.slice(0, 4).map(b => ({ label: b.branch, value: b.amount })),
    },
    {
      label: 'Dự án',
      icon: 'Folder',
      value: s.total_projects,
      sublabel: `${s.total_leave_today} nghỉ phép hôm nay`,
      sparkData: dashboardStats[1]!.sparkData,
      breakdown: dashboardStats[1]!.breakdown,
    },
    dashboardStats[2]!,
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
