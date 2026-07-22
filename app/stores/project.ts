import { defineStore } from 'pinia'
import type { Pagination, ProjectDetail, ProjectMembersResponse, ProjectRow, ProjectStatus } from '~/types'

interface ProjectListResponse {
  projects: ProjectRow[]
  pagination: Pagination
  users: Record<string, string>
}

export const useProjectStore = defineStore('project', () => {
  const { post } = useApi()

  const projects = ref<ProjectRow[]>([])
  const myProjects = ref<ProjectRow[]>([])
  // Full, unpaginated org project list — fetched separately (row_per_page:0)
  // so the summary MiniStat cards reflect the true totals instead of just
  // whatever page happens to be loaded in `projects`.
  const allProjects = ref<ProjectRow[]>([])
  // id→name map of every org user — comes bundled with search-project-list's
  // response, reused as the source for the manager/member pickers instead of a
  // separate fetch or (previously) a hardcoded fake name list.
  const users = ref<Record<string, string>>({})
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)

  async function fetchProjects(params: {
    keyword?: string
    status?: number
    current_page?: number
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await post<ProjectListResponse>('/project/get-project-list', {
        keyword: params.keyword ?? '',
        status: params.status ?? 0,
        current_page: params.current_page ?? 1,
        row_per_page: 20,
      })
      if (res.status === 1 && res.data) {
        projects.value = res.data.projects ?? []
        pagination.value = res.data.pagination ?? pagination.value
        users.value = res.data.users ?? {}
      } else {
        error.value = res.message || 'Không thể tải danh sách dự án.'
      }
    } catch {
      error.value = 'Không thể tải danh sách dự án.'
    } finally {
      loading.value = false
    }
  }

  // Infinite-scroll append used by the Home dashboard's ProjectTab widget —
  // distinct from fetchList's page-replace pagination on the /workflow/project
  // page itself, which is why both coexist.
  async function loadMoreProjects() {
    if (loadingMore.value) return
    const nextPage = pagination.value.current_page + 1
    loadingMore.value = true
    try {
      const res = await post<ProjectListResponse>('/project/get-project-list', {
        keyword: '',
        current_page: nextPage,
        row_per_page: 20,
      })
      if (res.status === 1 && res.data) {
        projects.value = [...projects.value, ...(res.data.projects ?? [])]
        pagination.value = res.data.pagination ?? pagination.value
        users.value = { ...users.value, ...(res.data.users ?? {}) }
      }
    } catch { /* non-critical */ }
    finally {
      loadingMore.value = false
    }
  }

  // row_per_page:0 makes the backend return every matching row (same convention
  // as the evaluation module's reports fetch) — used only to compute accurate
  // totals for the summary cards, never rendered as a browsable list.
  async function fetchAllProjectsForStats() {
    try {
      const res = await post<ProjectListResponse>('/project/get-project-list', {
        keyword: '', status: 0, current_page: 1, row_per_page: 0,
      })
      if (res.status === 1 && res.data) {
        allProjects.value = res.data.projects ?? []
        users.value = { ...users.value, ...(res.data.users ?? {}) }
      }
    } catch { /* non-critical — stats just stay at their previous value */ }
  }

  // "Của tôi" tab — projects the given user is a member of. user_id is required
  // by the backend (GetProjectsUserJoin takes an explicit target user, not
  // necessarily the caller) — the page passes the current auth user's id.
  async function fetchMyProjects(userId: number) {
    try {
      const res = await post<ProjectRow[]>('/user-project/get-projects-user-join', { user_id: userId })
      myProjects.value = res.status === 1 && res.data ? res.data : []
    } catch { /* non-critical */ }
  }

  // Callers (openDetail/openEditModal in the page) await this alongside
  // getUserProject in a Promise.all — catch here so one failed request degrades
  // to null instead of rejecting the whole pair and leaving a loading spinner
  // stuck forever with no error surfaced.
  async function getProjectDetails(projectId: number): Promise<ProjectDetail | null> {
    try {
      const res = await post<ProjectDetail>('/project/get-project-details', { project_id: projectId })
      return res.status === 1 && res.data ? res.data : null
    } catch {
      return null
    }
  }

  // status omitted/0 defaults to ProjectStatusActive server-side.
  async function createProject(payload: { project_name: string; managed_by: number; project_description: string; status?: ProjectStatus }) {
    const res = await post<{ project_id: number }>('/project/add-project', payload)
    return { ok: res.status === 1, message: res.message, id: res.data?.project_id }
  }

  // Manager/GM only (backend-enforced). `targets` replaces the project's whole
  // target array — always send the full current list, not a diff. status
  // omitted/0 keeps the project's current status server-side.
  async function updateProject(payload: {
    project_id: number
    name: string
    description: string
    managed_by: number
    targets: { year: number; quarter: number; content: string }[]
    status?: ProjectStatus
  }) {
    const res = await post('/project/update-project', payload)
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteProject(projectId: number) {
    const res = await post('/project/delete-project', { project_id: projectId })
    return { ok: res.status === 1, message: res.message }
  }

  // Real project membership — id/name/branch resolved via the response's own
  // user_box/branch_box maps. `user_projects[].id` (the join-row id) is what
  // /remove-user-from-project needs, not the user_id.
  async function getUserProject(projectId: number): Promise<ProjectMembersResponse | null> {
    try {
      const res = await post<ProjectMembersResponse>('/user-project/get-user-project', { project_id: projectId })
      return res.status === 1 && res.data ? res.data : null
    } catch {
      return null
    }
  }

  async function addUserToProject(userId: number, projectId: number) {
    const res = await post('/user-project/create-user-project', { user_id: userId, project_id: projectId })
    return { ok: res.status === 1, message: res.message }
  }

  // userProjectId is the user_projects join-row id (from getUserProject), not a user id.
  async function removeUserFromProject(userProjectId: number) {
    const res = await post('/user-project/remove-user-from-project', { id: userProjectId })
    return { ok: res.status === 1, message: res.message }
  }

  return {
    projects, myProjects, allProjects, users, pagination, loading, loadingMore, error,
    fetchProjects, loadMoreProjects, fetchAllProjectsForStats, fetchMyProjects, getProjectDetails,
    createProject, updateProject, deleteProject,
    getUserProject, addUserToProject, removeUserFromProject,
  }
})
