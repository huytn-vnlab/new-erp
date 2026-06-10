import { defineStore } from 'pinia'
import type { Project } from '~/types'
export const useProjectStore = defineStore('project', () => {
  const projects = ref<any[]>([])
  const currentProject = ref<any | null>(null)
  const loading = ref(false)
  const { post } = useApi()
  async function fetchProjects() {
    loading.value = true
    try {
      const res = await post<{ projects: Project[] }>('/project/get-projects', {})
      projects.value = res.data?.projects ?? []
    } finally { loading.value = false }
  }
  return { projects, currentProject, loading, fetchProjects }
})
