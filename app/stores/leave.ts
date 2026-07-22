import { defineStore } from 'pinia'
import type { LeaveInfo, LeaveRequest, LeaveBonusRow, AllUserLeaveInfo, Pagination } from '~/types'

interface LeaveRequestListResponse {
  leaves: LeaveRequest[]
  pagination: Pagination
}

interface LeaveBonusListResponse {
  leave_bonuses: LeaveBonusRow[]
  pagination: { total_row: number }
}

interface AllUserLeaveInfoResponse {
  users: AllUserLeaveInfo[]
}

export const useLeaveStore = defineStore('leave', () => {
  const { post, get } = useApi()

  const leaveInfo = ref<LeaveInfo | null>(null)
  const requests = ref<LeaveRequest[]>([])
  const bonuses = ref<LeaveBonusRow[]>([])
  const bonusPagination = ref({ total_row: 0, current_page: 1, row_per_page: 20 })
  const allUsersLeaveInfo = ref<AllUserLeaveInfo[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLeaveInfo(userId?: number) {
    try {
      const body: Record<string, unknown> = { year: new Date().getFullYear() }
      if (userId) body.user_id = userId
      const res = await post<LeaveInfo>('/leave/get-leave-info', body)
      if (res.status === 1 && res.data) leaveInfo.value = res.data
    } catch { /* non-critical */ }
  }

  async function fetchLeaveRequests(params: {
    user_name?: string
    leave_request_type_id?: number
    branch?: number
    current_page?: number
    row_per_page?: number
    datetime_leave_from?: string
    datetime_leave_to?: string
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await post<LeaveRequestListResponse>('/leave/get-leave-requests', {
        user_name: params.user_name ?? '',
        leave_request_type_id: params.leave_request_type_id ?? 0,
        branch: params.branch ?? 0,
        current_page: params.current_page ?? 1,
        row_per_page: params.row_per_page ?? 200,
        datetime_leave_from: params.datetime_leave_from ?? '',
        datetime_leave_to: params.datetime_leave_to ?? '',
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

  async function fetchBonuses(params: {
    current_page?: number
    row_per_page?: number
    full_name?: string
    leave_bonus_type_id?: number
    year?: number
  } = {}) {
    const rpp = params.row_per_page ?? 20
    try {
      const res = await post<LeaveBonusListResponse>('/leave/get-leave-bonuses', {
        current_page: params.current_page ?? 1,
        row_per_page: rpp,
        full_name: params.full_name ?? '',
        leave_bonus_type_id: params.leave_bonus_type_id ?? 0,
        year: params.year ?? 0,
      })
      if (res.status === 1 && res.data) {
        bonuses.value = res.data.leave_bonuses ?? []
        bonusPagination.value = {
          total_row: res.data.pagination?.total_row ?? 0,
          current_page: params.current_page ?? 1,
          row_per_page: rpp,
        }
      }
    } catch { /* non-critical */ }
  }

  async function fetchLeaveInfoAll() {
    try {
      const res = await post<AllUserLeaveInfoResponse>('/leave/get-leave-info-all-user', {
        current_page: 1,
        row_per_page: 500,
      })
      if (res.status === 1 && res.data) allUsersLeaveInfo.value = res.data.users ?? []
    } catch { /* non-critical */ }
  }

  async function createLeave(payload: {
    user_id?: number
    leave_request_type: string
    datetime_leave_from: string
    datetime_leave_to: string
    reason: string
    email_title: string
    email_content: string
    subtract_day_off_type_id?: number
  }) {
    const { user } = useAuth()
    const typeId = parseInt(payload.leave_request_type) || 1
    const dateFrom = payload.datetime_leave_from
    const dateTo = payload.datetime_leave_to || dateFrom
    const res = await post('/leave/create-leave', {
      leave_request: [{
        user_id: payload.user_id || user.value?.id || 0,
        leave_request_type_id: typeId,
        datetime_leave_from: dateFrom,
        datetime_leave_to: dateTo,
        reason: payload.reason,
        email_title: payload.email_title,
        email_content: payload.email_content,
        subtract_day_off_type_id: payload.subtract_day_off_type_id ?? 1,
      }],
    })
    return { ok: res.status === 1, message: res.message }
  }

  async function updateStatus(id: number, status: number, reason?: string) {
    const res = await post('/leave/update-leave-request-status', { leave_request_id: id, status, reason: reason ?? '' })
    return { ok: res.status === 1, message: res.message }
  }

  async function removeLeave(id: number) {
    const res = await post('/leave/remove-leave', { leave_id: id })
    return { ok: res.status === 1, message: res.message }
  }

  async function addLeaveBonus(payload: {
    user_id: number
    leave_bonus_type_id: number
    hour: number
    year_belong: number
    reason: string
  }) {
    const { user } = useAuth()
    const res = await post('/leave/create-leave-bonus', {
      leave_bonus: [{
        user_id: payload.user_id || user.value?.id || 0,
        leave_bonus_type_id: payload.leave_bonus_type_id,
        hour: payload.hour,
        year_belong: payload.year_belong,
        reason: payload.reason,
      }],
    })
    return { ok: res.status === 1, message: res.message }
  }

  async function exportExcel() {
    return get('/leave/export-excel')
  }

  return {
    leaveInfo, requests, bonuses, bonusPagination, allUsersLeaveInfo, pagination, loading, error,
    fetchLeaveInfo, fetchLeaveRequests, fetchBonuses, fetchLeaveInfoAll,
    createLeave, updateStatus, removeLeave, addLeaveBonus, exportExcel,
  }
})
