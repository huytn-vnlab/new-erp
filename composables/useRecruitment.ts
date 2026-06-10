import { useRecruitmentStore } from '~/stores/recruitment'
import { handleApiError } from '~/utils/error-handler'

export const useRecruitment = () => {
  const store   = useRecruitmentStore()
  const toast   = useToast()
  const { post } = useApi()

  /**
   * Create a recruitment job posting.
   * Backend: POST /recruitment/create-job
   *   { job_name, start_date, expiry_date, branch_ids[], assignees[] }
   */
  async function createRecruitment(payload: Record<string, any>) {
    try {
      await post('/recruitment/create-job', payload)
      toast.success('Tạo tin tuyển dụng thành công')
      await store.fetchRecruitments()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  /**
   * Update a recruitment job posting.
   * Backend: POST /recruitment/edit-job
   *   { id, job_name, start_date, expiry_date, branch_ids[], assignees[] }
   */
  async function updateRecruitment(id: number, payload: Record<string, any>) {
    try {
      await post('/recruitment/edit-job', { id, ...payload })
      toast.success('Cập nhật tin tuyển dụng thành công')
      await store.fetchRecruitments()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  /**
   * Remove a recruitment job posting.
   * Backend: POST /recruitment/remove-job  { id }
   */
  async function deleteRecruitment(id: number) {
    try {
      await post('/recruitment/remove-job', { id })
      toast.success('Đã xóa tin tuyển dụng')
      await store.fetchRecruitments()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  return {
    ...store,
    createRecruitment,
    updateRecruitment,
    deleteRecruitment,
  }
}
