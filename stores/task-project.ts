import { defineStore } from 'pinia'
import type { Task } from '~/types'
export const useTaskProjectStore = defineStore('taskProject', () => {
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const loading = ref(false)
  const { post } = useApi()
  async function fetchTasks(projectId: number) {
    loading.value = true
    try {
      const res = await post<{ tasks: Task[] }>('/task-project/get-tasks', { project_id: projectId })
      tasks.value = res.data?.tasks ?? []
    } finally { loading.value = false }
  }
  return { tasks, currentTask, loading, fetchTasks }
})
