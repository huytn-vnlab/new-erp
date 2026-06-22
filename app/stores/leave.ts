import { defineStore } from 'pinia'
import type { LeaveInfo, LeaveRequest, LeaveBonusRow, Pagination } from '~/types'

interface LeaveRequestListResponse {
  leaves: LeaveRequest[]
  pagination: Pagination
}

interface LeaveBonusListResponse {
  leave_bonuses: LeaveBonusRow[]
  total_row: number
}

export const useLeaveStore = defineStore('leave', () => {
  const { post, get } = useApi()

  const leaveInfo = ref<LeaveInfo | null>(null)
  const requests = ref<LeaveRequest[]>([])
  const bonuses = ref<LeaveBonusRow[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const loading = ref(false)

  async function fetchLeaveInfo(userId?: number) {
    loading.value = true
    try {
      const res = await post<LeaveInfo>('/api/leave/get-leave-info', { user_id: userId })
      if (res.status === 1 && res.data) leaveInfo.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchLeaveRequests(params: {
    user_name?: string
    leave_request_type_id?: number
    branch?: number
    current_page?: number
  } = {}) {
    loading.value = true
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
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchBonuses(params: { current_page?: number } = {}) {
    const res = await post<LeaveBonusListResponse>('/api/leave/get-leave-bonuses', {
      current_page: params.current_page ?? 1,
      row_per_page: 20,
    })
    if (res.status === 1 && res.data) {
      bonuses.value = res.data.leave_bonuses ?? []
    }
  }

  async function createLeave(payload: {
    user_id?: number
    leave_request_type: string
    datetime_leave_from: string
    datetime_leave_to: string
    reason: string
    half_day?: boolean
  }) {
    return post('/api/leave/create-leave', payload)
  }

  async function updateStatus(id: number, status: number, reason?: string) {
    return post('/api/leave/update-leave-request-status', { leave_request_id: id, status, reason: reason ?? '' })
  }

  async function removeLeave(id: number) {
    return post('/api/leave/remove-leave', { leave_request_id: id })
  }

  async function exportExcel() {
    return get('/api/leave/export-excel')
  }

  return {
    leaveInfo, requests, bonuses, pagination, loading,
    fetchLeaveInfo, fetchLeaveRequests, fetchBonuses,
    createLeave, updateStatus, removeLeave, exportExcel,
  }
})
