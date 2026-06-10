<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800">Dự án</h2>
      <NuxtLink to="/workflow/create-project">
        <AppButton size="sm">+ Tạo dự án</AppButton>
      </NuxtLink>
    </div>

    <!-- Tabs -->
    <div class="mb-4 border-b border-gray-200">
      <nav class="flex gap-6">
        <button v-for="tab in tabs" :key="tab.key"
          :class="['pb-3 text-sm font-medium border-b-2 transition-colors', activeTab === tab.key ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
          @click="activeTab = tab.key">
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <div v-if="projectStore.loading" class="flex justify-center py-20"><AppSpinner size="lg" /></div>

    <div v-else-if="filteredProjects.length === 0" class="card text-center py-10 text-sm text-gray-400">
      Chưa có dự án nào
    </div>

    <!-- Project cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="project in filteredProjects"
        :key="project.id"
        :to="`/workflow/view-project/${project.id}`"
        class="card flex flex-col gap-3 hover:shadow-md hover:border-primary-200 transition-shadow"
      >
        <!-- Status indicator -->
        <div class="flex items-center justify-between">
          <AppBadge :variant="projectStatusVariant(project.status)">{{ projectStatusLabel(project.status) }}</AppBadge>
          <span class="text-xs text-gray-400">{{ formatDate(project.start_date) }}</span>
        </div>

        <h3 class="font-semibold text-gray-900 line-clamp-2">{{ project.name }}</h3>
        <p class="text-xs text-gray-500 line-clamp-2">{{ project.description || '—' }}</p>

        <!-- Member avatars -->
        <div class="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <div class="flex -space-x-2">
            <div
              v-for="(member, i) in (project.members || []).slice(0, 4)"
              :key="member.id"
              class="h-6 w-6 rounded-full bg-primary-200 border-2 border-white flex items-center justify-center"
              :title="member.full_name"
            >
              <span class="text-xs font-bold text-primary-800">{{ getInitials(member.full_name, 1) }}</span>
            </div>
            <div v-if="(project.members || []).length > 4"
              class="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
              <span class="text-xs text-gray-500">+{{ project.members.length - 4 }}</span>
            </div>
          </div>
          <span class="text-xs text-gray-400">{{ (project.tasks || []).length }} tasks</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/stores/project'
import { formatDate } from '~/utils/date'
import { getInitials } from '~/utils/format'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'project' } })
useHead({ title: 'Dự án — Micro ERP' })

const projectStore = useProjectStore()
const activeTab    = ref('all')

const tabs = [
  { key: 'all',    label: 'Tất cả' },
  { key: 'mine',   label: 'Của tôi' },
  { key: 'active', label: 'Đang thực hiện' },
  { key: 'done',   label: 'Hoàn thành' },
]

const { user } = useAuth()

const filteredProjects = computed(() => {
  let list = projectStore.projects
  if (activeTab.value === 'mine')   list = list.filter(p => p.members?.some((m: any) => m.id === user.value?.id))
  if (activeTab.value === 'active') list = list.filter(p => p.status === 1)
  if (activeTab.value === 'done')   list = list.filter(p => p.status === 2)
  return list
})

const projectStatusVariant = (status: number) => (['gray', 'blue', 'green', 'red'] as const)[status] ?? 'gray'
const projectStatusLabel   = (status: number) => (['Chờ', 'Đang làm', 'Hoàn thành', 'Tạm dừng'])[status] ?? '—'

onMounted(() => projectStore.fetchProjects())
</script>
