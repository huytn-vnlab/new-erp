import { defineStore } from 'pinia'
import type { LeaveInfo, LeaveRequest, LeaveBonusRow, AllUserLeaveInfo, Pagination } from '~/types'

interface LeaveRequestListResponse {
  leaves: LeaveRequest[]
  pagination: Pagination
}

interface LeaveBonusListResponse {
  leave_bonuses: LeaveBonusRow[]
  total_row: number
}

interface AllUserLeaveInfoResponse {
  users: AllUserLeaveInfo[]
}

export const useLeaveStore = defineStore('leave', () => {
  const { post, get } = useApi()

  const leaveInfo = ref<LeaveInfo | null>(null)
  const requests = ref<LeaveRequest[]>([])
  const bonuses = ref<LeaveBonusRow[]>([])
  const allUsersLeaveInfo = ref<AllUserLeaveInfo[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLeaveInfo(userId?: number) {
    try {
      const res = await post<LeaveInfo>('/api/leave/get-leave-info', { user_id: userId })
      if (res.status === 1 && res.data) leaveInfo.value = res.data
    } catch { /* non-critical */ }
  }

  async function fetchLeaveRequests(params: {
    user_name?: string
    leave_request_type_id?: number
    branch?: number
    current_page?: number
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await post<LeaveRequestListResponse>('/api/leave/get-leave-requests', {
        user_name: params.user_name ?? '',
        leave_request_type_id: params.leave_request_type_id ?? 0,
        branch: params.branch ?? 0,
        current_page: params.current_page ?? 1,
      })
      if (res.status === 1 && res.data) {
        requests.value = res.data.leaves ?? []
        pagination.value = res.data.pagination ?? pagination.value
      } else {
        error.value = res.message || 'Không thể tải danh sách xin nghỉ.'
      }
    } catch {
      error.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
    } finally {
      loading.value = false
    }
  }

  async function fetchBonuses(params: { current_page?: number } = {}) {
    try {
      const res = await post<LeaveBonusListResponse>('/api/leave/get-leave-bonuses', {
        current_page: params.current_page ?? 1,
        row_per_page: 20,
      })
      if (res.status === 1 && res.data) bonuses.value = res.data.leave_bonuses ?? []
    } catch { /* non-critical */ }
  }

  async function fetchLeaveInfoAll() {
    try {
      const res = await post<AllUserLeaveInfoResponse>('/api/leave/get-leave-info-all-user', {})
      if (res.status === 1 && res.data) allUsersLeaveInfo.value = res.data.users ?? []
    } catch { /* non-critical */ }
  }

  async function createLeave(payload: {
    user_id?: number
    leave_request_type: string
    datetime_leave_from: string
    datetime_leave_to: string
    reason: string
    half_day?: boolean
  }) {
    const res = await post('/api/leave/create-leave', payload)
    return { ok: res.status === 1, message: res.message }
  }

  async function updateStatus(id: number, status: number, reason?: string) {
    const res = await post('/api/leave/update-leave-request-status', { leave_request_id: id, status, reason: reason ?? '' })
    return { ok: res.status === 1, message: res.message }
  }

  async function removeLeave(id: number) {
    const res = await post('/api/leave/remove-leave', { leave_request_id: id })
    return { ok: res.status === 1, message: res.message }
  }

  async function addLeaveBonus(payload: {
    user_id: number
    leave_bonus_type: string
    hour: number
    year: number
    reason: string
  }) {
    const res = await post('/api/leave/create-leave-bonus', { leave_bonus: payload })
    return { ok: res.status === 1, message: res.message }
  }

  async function exportExcel() {
    return get('/api/leave/export-excel')
  }

  return {
    leaveInfo, requests, bonuses, allUsersLeaveInfo, pagination, loading, error,
    fetchLeaveInfo, fetchLeaveRequests, fetchBonuses, fetchLeaveInfoAll,
    createLeave, updateStatus, removeLeave, addLeaveBonus, exportExcel,
  }
})
