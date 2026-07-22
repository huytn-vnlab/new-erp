import { defineStore } from 'pinia'
import type { OvertimeRow, Pagination } from '~/types'

interface OtListResponse {
  ot_requests: OvertimeRow[]
  pagination: Pagination
  users: Record<string, string>
  projects: Record<string, string>
  branches: Record<string, string>
  project_managers: number[]
}

export const useOvertimeStore = defineStore('overtime', () => {
  const { post } = useApi()

  const rows = ref<OvertimeRow[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const myRows = ref<OvertimeRow[]>([])
  const myPagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const myLoading = ref(false)
  const myError = ref<string | null>(null)

  // Unpaginated, scoped to a single month — backs the calendar heatmap,
  // project-distribution bars and top-OT leaderboard. RowPerPage has no
  // govalidator `required` tag on this endpoint (unlike recruitment's
  // GetJobsParam), so 0 ("fetch all") is accepted.
  const periodRows = ref<OvertimeRow[]>([])
  const periodLoading = ref(false)

  // id→name maps bundled with get-overtime-requests — reused as the source
  // for the project/branch filters and the create-request project picker.
  const users = ref<Record<string, string>>({})
  const projects = ref<Record<string, string>>({})
  const branches = ref<Record<string, string>>({})
  const projectManagers = ref<number[]>([])

  type FetchParams = {
    keyword?: string
    branch?: number
    project_id?: number
    overtime_type?: number
    status?: number
    date_from?: string
    date_to?: string
    users_id?: number[]
    current_page?: number
    row_per_page?: number
  }

  function buildPayload(params: FetchParams) {
    return {
      branch: params.branch ?? 0,
      project_id: params.project_id ?? 0,
      overtime_type: params.overtime_type ?? 0,
      status: params.status ?? 0,
      date_from: params.date_from ?? '',
      date_to: params.date_to ?? '',
      users_id: params.users_id ?? [],
      current_page: params.current_page ?? 1,
      row_per_page: params.row_per_page ?? 20,
    }
  }

  async function fetchOvertimes(params: FetchParams = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await post<OtListResponse>('/overtime/get-overtime-requests', buildPayload(params))
      if (res.status === 1 && res.data) {
        rows.value = res.data.ot_requests ?? []
        pagination.value = res.data.pagination ?? pagination.value
        users.value = res.data.users ?? {}
        projects.value = { ...projects.value, ...res.data.projects }
        branches.value = res.data.branches ?? {}
        projectManagers.value = res.data.project_managers ?? []
      } else {
        error.value = res.message || 'Không thể tải danh sách yêu cầu OT.'
      }
    } catch {
      error.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
    } finally {
      loading.value = false
    }
  }

  // "Đơn của tôi" — always explicitly scoped via users_id:[self], since a
  // plain employee is rejected by the backend (400) unless they pass this,
  // and the list row has no user_id field to filter by client-side anyway.
  // Uses its own myError (not the shared `error`) — a plain employee's tab
  // defaults to "mine" with no "manage" fetch running at all, and sharing one
  // ref between both tabs would let one tab's success silently clear the
  // other tab's genuine failure.
  async function fetchMyOvertimes(userId: number, params: FetchParams = {}) {
    myLoading.value = true
    myError.value = null
    try {
      const res = await post<OtListResponse>('/overtime/get-overtime-requests', buildPayload({ ...params, users_id: [userId] }))
      if (res.status === 1 && res.data) {
        myRows.value = res.data.ot_requests ?? []
        myPagination.value = res.data.pagination ?? myPagination.value
        projects.value = { ...projects.value, ...res.data.projects }
      } else {
        myError.value = res.message || 'Không thể tải danh sách yêu cầu OT.'
      }
    } catch {
      myError.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
    } finally {
      myLoading.value = false
    }
  }

  // scopedUserId: pass the caller's own id for a plain employee (only ever
  // allowed to see their own), or undefined for GM/Manager (org-wide).
  async function fetchPeriodOvertimes(dateFrom: string, dateTo: string, scopedUserId?: number) {
    periodLoading.value = true
    try {
      const res = await post<OtListResponse>('/overtime/get-overtime-requests', buildPayload({
        date_from: dateFrom, date_to: dateTo, row_per_page: 0,
        users_id: scopedUserId ? [scopedUserId] : [],
      }))
      periodRows.value = res.status === 1 && res.data ? (res.data.ot_requests ?? []) : []
    } catch { /* non-critical — charts just stay at their previous value */ }
    finally {
      periodLoading.value = false
    }
  }

  // Always self-scoped, regardless of role — periodRows above is org-wide for
  // a GM/Manager, and list rows carry no user_id to filter "just mine" back
  // out of it client-side, so the "OT của tôi" stat needs its own fetch.
  const myPeriodRows = ref<OvertimeRow[]>([])
  async function fetchMyPeriodOvertimes(userId: number, dateFrom: string, dateTo: string) {
    try {
      const res = await post<OtListResponse>('/overtime/get-overtime-requests', buildPayload({
        date_from: dateFrom, date_to: dateTo, row_per_page: 0, users_id: [userId],
      }))
      myPeriodRows.value = res.status === 1 && res.data ? (res.data.ot_requests ?? []) : []
    } catch { /* non-critical */ }
  }

  type CreatePayload = {
    user_id: number
    project_id: number
    datetime_overtime_from: string // "YYYY-MM-DD HH:mm"
    datetime_overtime_to: string
    overtime_type: number // 1=day off, 2=money
    work_at_noon: number // 1=yes, 2=no
    reason: string
  }

  async function createOvertime(payload: CreatePayload) {
    // Backend binds this as a JSON array (bulk-create shape), even though the
    // create modal only ever submits one request at a time.
    const res = await post('/overtime/create-overtime-request', [{
      ...payload,
      status: 1,
      email_title: '',
      email_content: '',
      send_to: [],
      send_cc: [],
      users_id_notification: [],
    }] as unknown as Record<string, unknown>)
    return { ok: res.status === 1, message: res.message }
  }

  // cf.AcceptRequestStatus=3 / cf.DenyRequestStatus=2 — NOT 2=approve/3=reject
  // as an earlier version of this store assumed. GM-only on the backend
  // (CheckGeneralManager middleware) — a Manager's call 403s.
  async function updateStatus(requestId: number, status: 2 | 3) {
    const res = await post('/overtime/update-overtime-request-status', { request_id: requestId, status_request: status })
    return { ok: res.status === 1, message: res.message }
  }

  return {
    rows, pagination, loading, error,
    myRows, myPagination, myLoading, myError,
    periodRows, periodLoading, myPeriodRows,
    users, projects, branches, projectManagers,
    fetchOvertimes, fetchMyOvertimes, fetchPeriodOvertimes, fetchMyPeriodOvertimes, createOvertime, updateStatus,
  }
})
