<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <NuxtLink :to="`/workflow/view-project/${projectId}`">
          <AppButton variant="secondary" size="sm">← Dự án</AppButton>
        </NuxtLink>
        <h2 class="text-base font-semibold text-gray-800">
          {{ project?.name ?? 'Bảng Kanban' }}
        </h2>
      </div>
      <AppButton size="sm" @click="openCreateTask">+ Thêm task</AppButton>
    </div>

    <div v-if="loading" class="flex justify-center py-16"><AppSpinner /></div>

    <!-- Kanban columns -->
    <div v-else class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="col in columns"
        :key="col.status"
        class="shrink-0 w-72"
        @dragover.prevent
        @drop="onDrop($event, col.status)"
      >
        <!-- Column header -->
        <div class="flex items-center justify-between mb-3 px-1">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full" :class="col.dot" />
            <span class="text-sm font-semibold text-gray-700">{{ col.label }}</span>
          </div>
          <span class="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {{ tasksByStatus(col.status).length }}
          </span>
        </div>

        <!-- Task cards -->
        <div class="space-y-2 min-h-24 rounded-lg bg-gray-50 p-2">
          <div
            v-for="task in tasksByStatus(col.status)"
            :key="task.id"
            draggable="true"
            class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
            @dragstart="onDragStart($event, task)"
            @click="openTaskDetail(task)"
          >
            <p class="text-sm font-medium text-gray-900 mb-1.5 line-clamp-2">{{ task.title }}</p>

            <div v-if="task.description" class="text-xs text-gray-400 mb-2 line-clamp-1">
              {{ task.description }}
            </div>

            <div class="flex items-center justify-between">
              <span
                class="text-xs px-2 py-0.5 rounded-full"
                :class="priorityClass(task.priority)"
              >
                {{ priorityLabel(task.priority) }}
              </span>
              <div v-if="task.assignee_name" class="flex items-center gap-1">
                <div class="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center">
                  <span class="text-[10px] font-bold text-primary-700">{{ getInitials(task.assignee_name) }}</span>
                </div>
                <span class="text-xs text-gray-500">{{ task.assignee_name.split(' ').pop() }}</span>
              </div>
            </div>

            <div v-if="task.due_date" class="mt-2 text-xs text-gray-400">
              📅 {{ formatDate(task.due_date) }}
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="tasksByStatus(col.status).length === 0" class="text-center py-6 text-xs text-gray-300">
            Kéo task vào đây
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Task Modal -->
    <AppModal v-model="showTaskModal" :title="editingTask ? 'Sửa task' : 'Thêm task mới'" size="md">
      <div class="space-y-4">
        <AppInput v-model="taskForm.title" label="Tiêu đề" required placeholder="Mô tả ngắn task..." />
        <div>
          <label class="form-label">Mô tả</label>
          <textarea v-model="taskForm.description" rows="3" class="form-input resize-none" placeholder="Chi tiết task..." />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <AppSelect
            v-model="taskForm.assignee_id"
            :options="members"
            value-key="user_id"
            label-key="full_name"
            label="Người thực hiện"
            placeholder="Chọn..."
          />
          <AppSelect
            v-model.number="taskForm.priority"
            :options="priorityOptions"
            value-key="value"
            label-key="label"
            label="Ưu tiên"
          />
        </div>
        <DatePicker v-model="taskForm.due_date" label="Hạn hoàn thành" />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showTaskModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton
          v-if="editingTask"
          variant="danger"
          :loading="deletingTask"
          @click="deleteTask"
        >
          Xóa
        </AppButton>
        <AppButton :loading="savingTask" :disabled="!taskForm.title" @click="saveTask">
          {{ $t('common.save') }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { getInitials } from '~/utils/format'
import { formatDate } from '~/utils/date'
import { handleApiError } from '~/utils/error-handler'
import type { Project, Task } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'project' } })
useHead({ title: 'Kanban — Micro ERP' })

const route = useRoute()
const toast = useToast()
const { post } = useApi()

const projectId  = computed(() => Number(route.params.id))
const loading    = ref(true)
const project    = ref<any>(null)
const tasks      = ref<any[]>([])
const members    = ref<any[]>([])
const draggedTask = ref<any>(null)

const showTaskModal = ref(false)
const editingTask   = ref<any>(null)
const savingTask    = ref(false)
const deletingTask  = ref(false)

const taskForm = reactive({
  title:       '',
  description: '',
  assignee_id: '',
  priority:    1,
  due_date:    '',
  status:      0,
})

const columns = [
  { status: 0, label: 'Cần làm',       dot: 'bg-gray-400' },
  { status: 1, label: 'Đang làm',      dot: 'bg-blue-500' },
  { status: 2, label: 'Đang review',   dot: 'bg-yellow-500' },
  { status: 3, label: 'Hoàn thành',    dot: 'bg-green-500' },
]

const priorityOptions = [
  { value: 0, label: 'Thấp' },
  { value: 1, label: 'Trung bình' },
  { value: 2, label: 'Cao' },
  { value: 3, label: 'Khẩn cấp' },
]

function tasksByStatus(status: number) {
  return tasks.value.filter(t => t.status === status)
}

function priorityLabel(p: number) {
  return ['Thấp', 'TB', 'Cao', 'Khẩn'][p] ?? ''
}

function priorityClass(p: number) {
  return [
    'bg-gray-100 text-gray-600',
    'bg-blue-100 text-blue-700',
    'bg-orange-100 text-orange-700',
    'bg-red-100 text-red-700',
  ][p] ?? ''
}

function onDragStart(e: DragEvent, task: any) {
  draggedTask.value = task
  e.dataTransfer!.effectAllowed = 'move'
}

async function onDrop(e: DragEvent, newStatus: number) {
  if (!draggedTask.value || draggedTask.value.status === newStatus) return
  const task = draggedTask.value
  const oldStatus = task.status
  task.status = newStatus          // Optimistic update
  try {
    await post('/project/update-task-status', { id: task.id, status: newStatus })
  } catch (err) {
    task.status = oldStatus        // Rollback
    toast.error(handleApiError(err))
  } finally {
    draggedTask.value = null
  }
}

function openCreateTask() {
  editingTask.value = null
  Object.assign(taskForm, { title: '', description: '', assignee_id: '', priority: 1, due_date: '', status: 0 })
  showTaskModal.value = true
}

function openTaskDetail(task: any) {
  editingTask.value = task
  Object.assign(taskForm, {
    title:       task.title,
    description: task.description ?? '',
    assignee_id: task.assignee_id ?? '',
    priority:    task.priority ?? 1,
    due_date:    task.due_date?.substring(0, 10) ?? '',
    status:      task.status,
  })
  showTaskModal.value = true
}

async function saveTask() {
  savingTask.value = true
  try {
    const payload = {
      ...taskForm,
      project_id: projectId.value,
      assignee_id: taskForm.assignee_id || undefined,
    }
    if (editingTask.value) {
      await post('/project/update-task', { id: editingTask.value.id, ...payload })
      const idx = tasks.value.findIndex(t => t.id === editingTask.value.id)
      if (idx !== -1) {
        tasks.value[idx] = {
          ...tasks.value[idx],
          ...payload,
          assignee_name: members.value.find(m => m.user_id === Number(taskForm.assignee_id))?.full_name ?? tasks.value[idx].assignee_name,
        }
      }
      toast.success('Đã cập nhật task')
    } else {
      const res = await post<{ task: Task }>('/project/create-task', payload)
      const newTask = (res.data?.task ?? { ...payload, id: Date.now() }) as Task
      newTask.assignee_name = members.value.find(m => m.user_id === Number(taskForm.assignee_id))?.full_name ?? ''
      tasks.value.push(newTask)
      toast.success('Đã tạo task')
    }
    showTaskModal.value = false
  } catch (err) { toast.error(handleApiError(err)) }
  finally { savingTask.value = false }
}

async function deleteTask() {
  if (!editingTask.value) return
  deletingTask.value = true
  try {
    await post('/project/delete-task', { id: editingTask.value.id })
    tasks.value = tasks.value.filter(t => t.id !== editingTask.value.id)
    showTaskModal.value = false
    toast.success('Đã xóa task')
  } catch (err) { toast.error(handleApiError(err)) }
  finally { deletingTask.value = false }
}

onMounted(async () => {
  try {
    const [projRes, tasksRes] = await Promise.all([
      post<{ project: Project }>('/project/get-project-detail', { id: projectId.value }),
      post<{ tasks: Task[] }>('/project/get-project-tasks',  { project_id: projectId.value }),
    ])
    project.value = projRes.data?.project ?? null
    tasks.value   = tasksRes.data?.tasks ?? []
    members.value = projRes.data?.project?.members ?? []
  } finally { loading.value = false }
})
</script>
