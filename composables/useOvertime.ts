import { useOvertimeStore } from '~/stores/overtime'
import { handleApiError } from '~/utils/error-handler'

export const useOvertime = () => {
  const store   = useOvertimeStore()
  const toast   = useToast()
  const { post } = useApi()

  /**
   * Create an overtime request.
   * Backend: POST /overtime/create-overtime-request
   *   Required: datetime_overtime_from, datetime_overtime_to, reason
   *   Optional: project_id, overtime_type, work_at_noon, email_title, email_content,
   *             send_to[], send_cc[], users_id_notification[]
   */
  async function createOvertimeRequest(payload: {
    datetime_overtime_from: string
    datetime_overtime_to:   string
    reason:                 string
    project_id?:            number
    overtime_type?:         number
    email_title?:           string
    email_content?:         string
  }) {
    try {
      await post('/overtime/create-overtime-request', {
        user_id: useAuth().user.value?.id,
        status:  1,  // pending
        ...payload,
      })
      toast.success('Gửi yêu cầu làm thêm giờ thành công')
      await store.fetchRequests()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  /**
   * Approve an overtime request.
   * Backend: POST /overtime/update-overtime-request-status
   *   { request_id, status_request: 1, email? }
   */
  async function approveOvertime(overtimeId: number) {
    try {
      await post('/overtime/update-overtime-request-status', {
        request_id:     overtimeId,
        status_request: 1,
      })
      toast.success('Đã duyệt yêu cầu OT')
      await store.fetchRequests()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  /**
   * Reject an overtime request.
   * Backend: POST /overtime/update-overtime-request-status
   *   { request_id, status_request: 2, email? }
   */
  async function rejectOvertime(overtimeId: number, _reason?: string) {
    try {
      await post('/overtime/update-overtime-request-status', {
        request_id:     overtimeId,
        status_request: 2,
      })
      toast.success('Đã từ chối yêu cầu OT')
      await store.fetchRequests()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  /**
   * Cancel/edit an overtime request.
   * Backend has no delete endpoint — use edit-overtime-request to update it.
   * If the backend adds a delete route later, replace this.
   */
  async function deleteOvertimeRequest(overtimeId: number) {
    try {
      // There is no delete-overtime-request route in the backend.
      // Attempt a status update to cancelled (status 3) if supported,
      // otherwise gracefully inform the user.
      await post('/overtime/update-overtime-request-status', {
        request_id:     overtimeId,
        status_request: 3,  // treated as cancelled on backend side
      })
      toast.success('Đã hủy yêu cầu OT')
      await store.fetchRequests()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  return {
    ...store,
    createOvertimeRequest,
    approveOvertime,
    rejectOvertime,
    deleteOvertimeRequest,
  }
}
