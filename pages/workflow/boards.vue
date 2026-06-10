<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h2 class="text-lg font-semibold text-gray-800">{{ project?.name ?? 'Kanban Board' }}</h2>
        <p class="text-sm text-gray-500 mt-0.5">Kéo thả tasks giữa các cột để cập nhật trạng thái</p>
      </div>
      <div class="flex gap-2">
        <AppButton size="sm" @click="showAddTask = true">+ Thêm task</AppButton>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20"><AppSpinner size="lg" /></div>

    <!-- Board columns -->
    <div v-else class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="col in columns"
        :key="col.key"
        class="flex-shrink-0 w-72 flex flex-col"
      >
        <!-- Column header -->
        <div :class="['flex items-center justify-between px-3 py-2 rounded-t-lg font-semibold text-sm', col.headerClass]">
          <span>{{ col.label }}</span>
          <span class="text-xs bg-white/40 rounded-full px-2 py-0.5">{{ getColumnTasks(col.key).length }}</span>
        </div>

        <!-- Task cards -->
        <div
          :class="['flex-1 min-h-[200px] rounded-b-lg p-2 space-y-2', col.bodyClass]"
          @dragover.prevent
          @drop="onDrop($event, col.key)"
        >
          <div
            v-for="task in getColumnTasks(col.key)"
            :key="task.id"
            draggable="true"
            class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
            @dragstart="onDragStart($event, task)"
          >
            <p class="text-sm font-medium text-gray-800 mb-2 line-clamp-2">{{ task.name }}</p>
            <div class="flex items-center justify-between">
              <div v-if="task.assignee_name" class="flex items-center gap-1.5">
                <div class="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <span class="text-xs font-bold text-primary-700">{{ getInitials(task.assignee_name, 1) }}</span>
                </div>
                <span class="text-xs text-gray-500 truncate max-w-[80px]">{{ task.assignee_name }}</span>
              </div>
              <span v-if="task.due_date" class="text-xs text-gray-400">{{ formatDate(task.due_date) }}</span>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="getColumnTasks(col.key).length === 0"
            class="flex items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded-lg">
            <p class="text-xs text-gray-400">Kéo task vào đây</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add task modal -->
    <AppModal v-model="showAddTask" title="Thêm task mới" size="md">
      <div class="space-y-3">
        <AppInput v-model="newTask.name" label="Tên task" placeholder="Nhập tên task..." required />
        <DatePicker v-model="newTask.due_date" label="Hạn hoàn thành" />
        <AppSelect
          v-model="newTask.assignee_id"
          label="Người phụ trách"
          :options="members"
          value-key="id"
          label-key="full_name"
          placeholder="Chọn thành viên..."
        />
        <div>
          <label class="form-label">Mô tả</label>
          <textarea v-model="newTask.description" rows="3" class="form-input resize-none" placeholder="Mô tả task..." />
        </div>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showAddTask = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" :disabled="!newTask.name" @click="addTask">Thêm task</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/date'
import { getInitials } from '~/utils/format'
import { handleApiError } from '~/utils/error-handler'
import type { Project, Task } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'project' } })
useHead({ title: 'Kanban Board — Micro ERP' })

const route   = useRoute()
const toast   = useToast()
const { post } = useApi()

const projectId = computed(() => Number(route.query.project_id) || 0)

const project  = ref<any>(null)
const tasks    = ref<any[]>([])
const members  = ref<any[]>([])
const loading  = ref(true)
const saving   = ref(false)
const showAddTask = ref(false)
const draggedTask = ref<any>(null)

const newTask = ref({ name: '', due_date: '', assignee_id: '', description: '' })

const columns = [
  { key: 0, label: 'Backlog',    headerClass: 'bg-gray-200 text-gray-700',    bodyClass: 'bg-gray-50' },
  { key: 1, label: 'To Do',      headerClass: 'bg-yellow-200 text-yellow-800', bodyClass: 'bg-yellow-50' },
  { key: 2, label: 'Đang làm',   headerClass: 'bg-blue-200 text-blue-800',    bodyClass: 'bg-blue-50' },
  { key: 3, label: 'Hoàn thành', headerClass: 'bg-green-200 text-green-800',  bodyClass: 'bg-green-50' },
]

const getColumnTasks = (status: number) => tasks.value.filter(t => t.status === status)

function onDragStart(e: DragEvent, task: any) {
  draggedTask.value = task
  e.dataTransfer?.setData('task_id', String(task.id))
}

async function onDrop(e: DragEvent, newStatus: number) {
  const task = draggedTask.value
  if (!task || task.status === newStatus) return
  const oldStatus = task.status
  // Optimistic update
  task.status = newStatus
  try {
    await post('/task-project/update-task-status', { id: task.id, status: newStatus })
  } catch (err) {
    task.status = oldStatus
    toast.error(handleApiError(err))
  }
}

async function addTask() {
  if (!newTask.value.name) return
  saving.value = true
  try {
    const res = await post<{ task: Task }>('/task-project/create-task', {
      project_id:  projectId.value,
      name:        newTask.value.name,
      due_date:    newTask.value.due_date || null,
      assignee_id: newTask.value.assignee_id ? Number(newTask.value.assignee_id) : null,
      description: newTask.value.description,
      status:      0,
    })
    tasks.value.push(res.data?.task ?? { ...newTask.value, id: Date.now(), status: 0 })
    toast.success('Đã thêm task')
    showAddTask.value = false
    newTask.value = { name: '', due_date: '', assignee_id: '', description: '' }
  } catch (err) {
    toast.error(handleApiError(err))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!projectId.value) { loading.value = false; return }
  try {
    const [projRes, taskRes] = await Promise.all([
      post<{ project: Project }>('/project/get-project', { id: projectId.value }),
      post<{ tasks: Task[] }>('/task-project/get-tasks', { project_id: projectId.value }),
    ])
    project.value = projRes.data?.project
    tasks.value   = taskRes.data?.tasks ?? []
    members.value = project.value?.members ?? []
  } catch (err) {
    toast.error(handleApiError(err))
  } finally {
    loading.value = false
  }
})
</script>
