<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-base font-semibold text-gray-800">Dự án tôi tham gia</h2>
    </div>

    <div v-if="loading" class="flex justify-center py-12"><AppSpinner /></div>

    <div v-else-if="projects.length === 0" class="card text-center py-12 text-sm text-gray-400">
      Bạn chưa tham gia dự án nào
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="project in projects"
        :key="project.id"
        :to="`/workflow/view-project/${project.id}`"
        class="card hover:shadow-md transition-shadow group"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{{ project.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ project.code }}</p>
          </div>
          <span
            class="badge ml-2 shrink-0"
            :class="{
              'badge-warning': project.status === 0,
              'badge-success': project.status === 1,
              'badge-primary': project.status === 2,
              'badge-error':   project.status === 3,
            }"
          >
            {{ projectStatusLabel(project.status) }}
          </span>
        </div>

        <p v-if="project.description" class="text-sm text-gray-500 line-clamp-2 mb-3">{{ project.description }}</p>

        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>{{ project.member_count ?? 0 }} thành viên</span>
          <span>{{ project.task_count ?? 0 }} task</span>
        </div>

        <div v-if="project.end_date" class="mt-2 text-xs text-gray-400">
          Kết thúc: {{ formatDate(project.end_date) }}
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/date'
import type { Project } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'project' } })
useHead({ title: 'Dự án của tôi — Micro ERP' })

const { post } = useApi()
const { user } = useAuth()
const loading  = ref(true)
const projects = ref<any[]>([])

function projectStatusLabel(s: number) {
  return ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành', 'Tạm dừng'][s] ?? 'N/A'
}

onMounted(async () => {
  try {
    const res = await post<{ projects: Project[] }>('/project/get-user-projects', { user_id: user.value?.id })
    projects.value = res.data?.projects ?? []
  } finally { loading.value = false }
})
</script>
