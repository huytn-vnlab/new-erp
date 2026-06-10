import type { Project } from '~/types'
import { useProjectStore } from '~/stores/project'
import { handleApiError } from '~/utils/error-handler'

export const useProject = () => {
  const store  = useProjectStore()
  const toast  = useToast()
  const { post } = useApi()

  async function createProject(payload: Record<string, any>) {
    try {
      await post('/project/create-project', payload)
      toast.success('Tạo dự án thành công')
      await store.fetchProjects()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function updateProject(id: number, payload: Record<string, any>) {
    try {
      await post('/project/update-project', { id, ...payload })
      toast.success('Cập nhật dự án thành công')
      await store.fetchProjects()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function deleteProject(id: number) {
    try {
      await post('/project/delete-project', { id })
      toast.success('Đã xóa dự án')
      await store.fetchProjects()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function fetchProjectDetail(id: number) {
    try {
      const res = await post<{ project: Project }>('/project/get-project', { id })
      store.currentProject = res.data?.project ?? null
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  return { ...store, createProject, updateProject, deleteProject, fetchProjectDetail }
}
