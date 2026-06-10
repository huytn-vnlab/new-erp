/**
 * leave store. Replaces: store/modules/dayleave.ts
 *
 * userId / orgId are resolved internally from useAuth() so callers don't
 * need to thread those IDs through every call site.
 *
 * Leave info fields (from /leave/get-leave-info):
 *   day_remaining, day_used, day_bonus, day_remaining_previous, holidays, user_info, etc.
 *
 * Leave requests (from /leave/get-leave-requests):
 *   items: { id, user_id, leave_request_type_id, full_name, reason,
 *            datetime_leave_from, datetime_leave_to, email_title, email_content }
 *   plus: leave_request_types map (int → string name)
 */
import { defineStore } from 'pinia'
import type { BackendPage } from '~/types'

export const useLeaveStore = defineStore('leave', () => {
  const leaveInfo          = ref<Record<string, any> | null>(null)
  const leaveRequests      = ref<any[]>([])
  const leaveRequestTypes  = ref<Record<number, string>>({})   // id → name
  const loading            = ref(false)
  const pagination         = ref<BackendPage>({ current_page: 1, total_row: 0, row_per_page: 10 })

  const { post } = useApi()

  function getIds() {
    const { user } = useAuth()
    return {
      userId: user.value?.id ?? 0,
      orgId:  user.value?.organization_id ?? 0,
      year:   new Date().getFullYear(),
    }
  }

  async function fetchLeaveInfo() {
    const { userId, orgId, year } = getIds()
    if (!userId || !orgId) return
    loading.value = true
    try {
      const res = await post<{ leave_request_types?: Record<number, string>; [key: string]: any }>('/leave/get-leave-info', { user_id: userId, year, organization_id: orgId })
      leaveInfo.value = res.data ?? null
      if (res.data?.leave_request_types) {
        leaveRequestTypes.value = res.data.leave_request_types
      }
    } catch { /* backend may return 500 if no leave data configured for user */ } finally {
      loading.value = false
    }
  }

  async function fetchLeaveRequests(page = 1, rowPerPage = 10) {
    loading.value = true
    try {
      const res = await post<{
        leave_requests:      any[]
        pagination:          BackendPage
        leave_request_types: Record<number, string>
      }>('/leave/get-leave-requests', {
        current_page: page,
        row_per_page: rowPerPage,
      })
      leaveRequests.value     = res.data?.leave_requests      ?? []
      pagination.value        = res.data?.pagination          ?? pagination.value
      if (res.data?.leave_request_types) {
        leaveRequestTypes.value = res.data.leave_request_types
      }
    } catch { /* backend may return 500 if no leave data */ } finally {
      loading.value = false
    }
  }

  return {
    leaveInfo,
    leaveRequests,
    leaveRequestTypes,
    loading,
    pagination,
    fetchLeaveInfo,
    fetchLeaveRequests,
  }
})
