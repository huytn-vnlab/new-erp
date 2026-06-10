<template>
  <div>
    <div v-if="loading" class="flex justify-center py-20"><AppSpinner size="lg" /></div>
    <AppAlert v-else-if="error" variant="error">{{ error }}</AppAlert>

    <template v-else-if="project">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <AppBadge :variant="statusVariant(project.status)">{{ statusLabel(project.status) }}</AppBadge>
          </div>
          <h2 class="text-xl font-bold text-gray-900">{{ project.name }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ formatDate(project.start_date) }} → {{ project.end_date ? formatDate(project.end_date) : 'Chưa xác định' }}</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <NuxtLink :to="`/workflow/boards?project_id=${project.id}`">
            <AppButton size="sm" variant="secondary">Kanban Board</AppButton>
          </NuxtLink>
          <NuxtLink :to="`/workflow/edit-project/${project.id}`">
            <AppButton size="sm">{{ $t('common.edit') }}</AppButton>
          </NuxtLink>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-4 border-b border-gray-200">
        <nav class="flex gap-6">
          <button v-for="tab in tabs" :key="tab.key"
            :class="['pb-3 text-sm font-medium border-b-2 transition-colors', activeTab === tab.key ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
            @click="activeTab = tab.key">
            {{ tab.label }}
            <span v-if="tab.count != null" class="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{{ tab.count }}</span>
          </button>
        </nav>
      </div>

      <!-- Overview tab -->
      <div v-if="activeTab === 'overview'" class="space-y-4">
        <div class="card">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Mô tả</h3>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ project.description || 'Chưa có mô tả' }}</p>
        </div>

        <!-- Progress -->
        <div class="card">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Tiến độ</h3>
          <div class="flex items-center gap-3">
            <div class="flex-1 bg-gray-200 rounded-full h-2">
              <div class="bg-primary-500 h-2 rounded-full transition-all" :style="`width:${progress}%`" />
            </div>
            <span class="text-sm font-semibold text-gray-700 w-12 text-right">{{ progress }}%</span>
          </div>
          <div class="grid grid-cols-3 gap-3 mt-4 text-center">
            <div><p class="text-2xl font-bold text-gray-700">{{ taskStats.total }}</p><p class="text-xs text-gray-400">Tổng tasks</p></div>
            <div><p class="text-2xl font-bold text-green-600">{{ taskStats.done }}</p><p class="text-xs text-gray-400">Hoàn thành</p></div>
            <div><p class="text-2xl font-bold text-orange-500">{{ taskStats.inProgress }}</p><p class="text-xs text-gray-400">Đang làm</p></div>
          </div>
        </div>
      </div>

      <!-- Members tab -->
      <div v-else-if="activeTab === 'members'" class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-700">Thành viên ({{ (project.members || []).length }})</h3>
        </div>
        <ul class="divide-y divide-gray-100">
          <li v-for="m in project.members" :key="m.id" class="py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <span class="text-sm font-bold text-primary-700">{{ getInitials(m.full_name, 1) }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ m.full_name }}</p>
                <p class="text-xs text-gray-500">{{ m.email }}</p>
              </div>
            </div>
            <NuxtLink :to="`/hrm/member/view-profile/${m.id}`">
              <AppButton size="xs" variant="ghost">Hồ sơ</AppButton>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Tasks tab -->
      <div v-else-if="activeTab === 'tasks'">
        <div class="flex justify-between mb-3">
          <AppInput v-model="taskSearch" placeholder="Tìm task..." class="w-56" />
          <NuxtLink :to="`/workflow/boards?project_id=${project.id}`">
            <AppButton size="sm" variant="secondary">Xem Kanban</AppButton>
          </NuxtLink>
        </div>
        <AppTable :columns="taskColumns" :rows="filteredTasks" empty-text="Chưa có task">
          <template #cell-status="{ value }">
            <AppBadge :variant="taskStatusVariant(value)">{{ taskStatusLabel(value) }}</AppBadge>
          </template>
          <template #cell-assignee="{ row }">
            <span class="text-sm text-gray-700">{{ row.assignee_name || '—' }}</span>
          </template>
          <template #cell-due_date="{ value }">{{ value ? formatDate(value) : '—' }}</template>
        </AppTable>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useProject } from '~/composables/useProject'
import { formatDate } from '~/utils/date'
import { getInitials } from '~/utils/format'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'project' } })

const route  = useRoute()
const router = useRouter()
const { fetchProjectDetail, currentProject } = useProject()

const project    = ref<any>(null)
const loading    = ref(true)
const error      = ref('')
const activeTab  = ref('overview')
const taskSearch = ref('')

useHead(computed(() => ({ title: project.value?.name ? `${project.value.name} — Micro ERP` : 'Dự án' })))

const tabs = computed(() => [
  { key: 'overview', label: 'Tổng quan',  count: null },
  { key: 'members',  label: 'Thành viên', count: (project.value?.members || []).length },
  { key: 'tasks',    label: 'Tasks',       count: (project.value?.tasks || []).length },
])

const taskStats = computed(() => {
  const tasks = project.value?.tasks ?? []
  return {
    total:      tasks.length,
    done:       tasks.filter((t: any) => t.status === 3).length,
    inProgress: tasks.filter((t: any) => t.status === 2).length,
  }
})

const progress = computed(() => {
  const { total, done } = taskStats.value
  return total ? Math.round((done / total) * 100) : 0
})

const filteredTasks = computed(() =>
  (project.value?.tasks ?? []).filter((t: any) =>
    !taskSearch.value || t.name?.toLowerCase().includes(taskSearch.value.toLowerCase())
  )
)

const taskColumns = [
  { key: 'name',     label: 'Task' },
  { key: 'assignee', label: 'Người phụ trách' },
  { key: 'due_date', label: 'Hạn' },
  { key: 'status',   label: 'Trạng thái' },
]

const statusVariant = (s: number) => (['gray', 'blue', 'green', 'red'] as const)[s] ?? 'gray'
const statusLabel   = (s: number) => (['Chờ', 'Đang làm', 'Hoàn thành', 'Tạm dừng'])[s] ?? '—'
const taskStatusVariant = (s: number) => (['gray', 'yellow', 'blue', 'green'] as const)[s] ?? 'gray'
const taskStatusLabel   = (s: number) => (['Backlog', 'Todo', 'Đang làm', 'Xong'])[s] ?? '—'

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) { router.replace('/workflow/project-list'); return }
  try {
    await fetchProjectDetail(id)
    project.value = currentProject.value
    if (!project.value) router.replace('/workflow/project-list')
  } catch (err: any) {
    error.value = err?.message ?? 'Không thể tải dự án.'
  } finally {
    loading.value = false
  }
})
</script>
