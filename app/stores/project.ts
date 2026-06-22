import { defineStore } from 'pinia'
import type { ProjectRow, MemberRow, Pagination } from '~/types'

interface ProjectListResponse {
  projects: ProjectRow[]
  pagination: Pagination
}

export const useProjectStore = defineStore('project', () => {
  const { post } = useApi()

  const projects = ref<ProjectRow[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const loading = ref(false)

  async function fetchProjects(params: {
    keyword?: string
    current_page?: number
  } = {}) {
    loading.value = true
    try {
      const res = await post<ProjectListResponse>('/api/project/get-project-list', {
        keyword: params.keyword ?? '',
        current_page: params.current_page ?? 1,
        row_per_page: 20,
      })
      if (res.status === 1 && res.data) {
        projects.value = res.data.projects ?? []
        pagination.value = res.data.pagination ?? pagination.value
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchMyProjects() {
    const res = await post<{ projects: ProjectRow[] }>('/api/project/get-projects-assigned', {})
    return res.data?.projects ?? []
  }

  async function createProject(payload: { project_name: string; managed_by: number; project_description: string }) {
    return post('/api/project/add-project', payload)
  }

  async function updateProject(payload: { project_id: number; project_name?: string; project_description?: string }) {
    return post('/api/project/update-project', payload)
  }

  async function deleteProject(projectId: number) {
    return post('/api/project/delete-project', { project_id: projectId })
  }

  async function fetchProjectMembers(projectId: number) {
    const res = await post<{ users: MemberRow[] }>('/api/userproject/get-user-project', { project_id: projectId })
    return res.data?.users ?? []
  }

  return {
    projects, pagination, loading,
    fetchProjects, fetchMyProjects, createProject, updateProject, deleteProject, fetchProjectMembers,
  }
})
