/**
 * useLeave — business logic for leave management.
 * API endpoint names and payload shapes match the Go backend exactly.
 *
 * Create leave: POST /leave/create-leave
 *   body: { leave_request: [{ user_id, leave_request_type_id, datetime_leave_from,
 *                              datetime_leave_to, email_title, email_content,
 *                              reason, subtract_day_off_type_id }] }
 *
 * Remove leave: POST /leave/remove-leave  { leave_id }
 */
import { useLeaveStore } from '~/stores/leave'
import { handleApiError } from '~/utils/error-handler'

export const useLeave = () => {
  const store  = useLeaveStore()
  const toast  = useToast()
  const { post } = useApi()
  const { user } = useAuth()

  async function createLeaveRequest(payload: {
    leave_request_type_id: number
    datetime_leave_from:   string
    datetime_leave_to:     string
    reason:                string
    subtract_day_off_type_id?: number
  }) {
    const userId = user.value?.id
    if (!userId) throw new Error('Not authenticated')

    const leaveItem = {
      user_id:                 userId,
      leave_request_type_id:   payload.leave_request_type_id,
      datetime_leave_from:     payload.datetime_leave_from,
      datetime_leave_to:       payload.datetime_leave_to,
      reason:                  payload.reason,
      subtract_day_off_type_id: payload.subtract_day_off_type_id ?? 0,
      email_title:   `Yêu cầu nghỉ phép từ ${new Date(payload.datetime_leave_from).toLocaleDateString('vi-VN')}`,
      email_content: payload.reason,
    }

    try {
      await post('/leave/create-leave', { leave_request: [leaveItem] })
      toast.success('Gửi đơn nghỉ phép thành công')
      await store.fetchLeaveRequests()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function deleteLeaveRequest(leaveId: number) {
    try {
      await post('/leave/remove-leave', { leave_id: leaveId })
      toast.success('Đã xóa đơn nghỉ phép')
      await store.fetchLeaveRequests()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function approveLeave(leaveId: number) {
    try {
      await post('/leave/accept-leave', { leave_id: leaveId })
      toast.success('Đã duyệt đơn nghỉ phép')
      await store.fetchLeaveRequests()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function rejectLeave(leaveId: number, reason: string) {
    try {
      await post('/leave/deny-leave', { leave_id: leaveId, reject_reason: reason })
      toast.success('Đã từ chối đơn nghỉ phép')
      await store.fetchLeaveRequests()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  return {
    ...store,
    createLeaveRequest,
    deleteLeaveRequest,
    approveLeave,
    rejectLeave,
  }
}
