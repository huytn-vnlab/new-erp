<script setup lang="ts">
import { ref } from 'vue'
import Banner from '~/components/home/Banner.vue'
import StatCard from '~/components/home/StatCard.vue'
import Tabs from '~/components/base/Tabs.vue'
import CompanyTab from '~/components/home/CompanyTab.vue'
import PersonalTab from '~/components/home/PersonalTab.vue'
import ProjectTab from '~/components/home/ProjectTab.vue'
import { dashboardStats, homeTabs } from '~/mocks/dashboard'

definePageMeta({ layout: 'admin' })
const activeTab = ref('company')
</script>

<template>
  <div class="space-y-6">
    <Banner />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard v-for="(s, i) in dashboardStats" :key="i" v-bind="s" :delay="80 + i * 60" />
    </div>
    <Tabs v-model="activeTab" :items="homeTabs" />
    <CompanyTab v-if="activeTab === 'company'" />
    <PersonalTab v-else-if="activeTab === 'personal'" />
    <ProjectTab v-else />
  </div>
</template>
