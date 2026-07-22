import { defineStore } from 'pinia'
import type { TimekeepingMineRow, TimekeepingTeamRow, Pagination } from '~/types'

interface TkToday {
  check_in_time: string   // "yyyy/MM/dd hh:mm AM" or ""
  check_out_time: string  // "yyyy/MM/dd hh:mm AM" or ""
  time_server: string     // "yyyy/MM/dd HH:mm:ss"
}

interface MineListResponse {
  timekeepings: TimekeepingMineRow[]
  pagination: Pagination
}

interface TeamListResponse {
  timekeepings: TimekeepingTeamRow[]
  pagination: Pagination
  users_select_box: Record<string, string>
  branch_select_box: Record<string, string>
}

const ROW_PER_PAGE = 20

export const useTimekeepingStore = defineStore('timekeeping', () => {
  const { post } = useApi()

  const today = ref<TkToday | null>(null)

  const mineRows = ref<TimekeepingMineRow[]>([])
  const minePagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: ROW_PER_PAGE })
  const mineLoading = ref(false)
  const mineError = ref<string | null>(null)

  const teamRows = ref<TimekeepingTeamRow[]>([])
  const teamPagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: ROW_PER_PAGE })
  const teamLoading = ref(false)
  const teamError = ref<string | null>(null)
  const teamUsers = ref<Record<string, string>>({})
  const teamBranches = ref<Record<string, string>>({})

  async function fetchToday() {
    const res = await post<TkToday>('/timekeeping/get-timekeeping-today', {})
    if (res.status === 1 && res.data) today.value = res.data
  }

  async function checkIn() {
    return post('/timekeeping/check-in', {})
  }

  async function checkOut() {
    return post('/timekeeping/check-out', {})
  }

  async function fetchMine(params: { date_from?: string; date_to?: string; current_page?: number } = {}) {
    mineLoading.value = true
    mineError.value = null
    try {
      const res = await post<MineListResponse>('/timekeeping/get-all-timekeeping-user', {
        date_from: params.date_from ?? '',
        date_to: params.date_to ?? '',
        current_page: params.current_page ?? 1,
        row_per_page: ROW_PER_PAGE,
      })
      if (res.status === 1 && res.data) {
        mineRows.value = res.data.timekeepings ?? []
        minePagination.value = res.data.pagination ?? minePagination.value
      } else {
        mineError.value = res.message || 'Không thể tải dữ liệu chấm công.'
      }
    } catch {
      mineError.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
    } finally {
      mineLoading.value = false
    }
  }

  async function fetchTeam(params: {
    date_from?: string
    date_to?: string
    user_name?: string
    branch_id?: number
    current_page?: number
  } = {}) {
    teamLoading.value = true
    teamError.value = null
    try {
      const res = await post<TeamListResponse>('/timekeeping/get-all-timekeeping', {
        date_from: params.date_from ?? '',
        date_to: params.date_to ?? '',
        user_name: params.user_name ?? '',
        branch_id: params.branch_id ?? 0,
        current_page: params.current_page ?? 1,
        row_per_page: ROW_PER_PAGE,
      })
      if (res.status === 1 && res.data) {
        teamRows.value = res.data.timekeepings ?? []
        teamPagination.value = res.data.pagination ?? teamPagination.value
        teamUsers.value = res.data.users_select_box ?? {}
        teamBranches.value = res.data.branch_select_box ?? {}
      } else {
        teamError.value = res.message || 'Không thể tải dữ liệu chấm công.'
      }
    } catch {
      teamError.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
    } finally {
      teamLoading.value = false
    }
  }

  // The backend replies 406 with this exact message when a record already
  // exists for the target date — callers should re-submit with risky_update:true
  // to force it through (matches old ERP's "risky update" confirm dance).
  function isRiskyConflict(message: string): boolean {
    return message.toLowerCase().includes('already exists')
  }

  async function requestEditTimekeeping(payload: {
    id: number
    user_id: number
    check_in_time: string
    check_out_time?: string
    risky_update?: boolean
  }) {
    const res = await post('/timekeeping/request-edit-timekeeping', {
      id: payload.id,
      user_id: payload.user_id,
      check_in_time: payload.check_in_time,
      check_out_time: payload.check_out_time ?? '',
      risky_update: payload.risky_update ?? false,
    })
    return { ok: res.status === 1, message: res.message, risky: !res.status && isRiskyConflict(res.message ?? '') }
  }

  async function getUserEditTkRequest(id: number) {
    const res = await post<{ check_in_time: string; check_out_time: string; status: number }>(
      '/timekeeping/get-user-edit-tk-request',
      { id },
    )
    return res.status === 1 ? res.data : null
  }

  async function updateRequestEditTkStatus(payload: { id: number; user_id: number; status_id: number; reason?: string }) {
    const res = await post('/timekeeping/update-request-edit-tk-status', {
      id: payload.id,
      user_id: payload.user_id,
      status_id: payload.status_id,
      reason: payload.reason ?? '',
    })
    return { ok: res.status === 1, message: res.message }
  }

  async function addTimekeeping(payload: {
    user_id: number
    user_name: string
    check_in_time: string
    check_out_time?: string
    risky_update?: boolean
  }) {
    const res = await post('/timekeeping/add-timekeeping', {
      user_id: payload.user_id,
      user_name: payload.user_name,
      check_in_time: payload.check_in_time,
      check_out_time: payload.check_out_time ?? '',
      risky_update: payload.risky_update ?? false,
    })
    return { ok: res.status === 1, message: res.message, risky: !res.status && isRiskyConflict(res.message ?? '') }
  }

  async function editTimekeeping(payload: {
    id: number
    user_name: string
    branch?: string
    check_in_time: string
    check_out_time?: string
    risky_update?: boolean
  }) {
    const res = await post('/timekeeping/edit-timekeeping', {
      id: payload.id,
      user_name: payload.user_name,
      branch: payload.branch ?? '',
      check_in_time: payload.check_in_time,
      check_out_time: payload.check_out_time ?? '',
      risky_update: payload.risky_update ?? false,
    })
    return { ok: res.status === 1, message: res.message, risky: !res.status && isRiskyConflict(res.message ?? '') }
  }

  async function exportExcel(params: { date_from?: string; date_to?: string }) {
    const config = useRuntimeConfig()
    const token = useCookie<string | null>('auth_token')
    const base = config.public.apiBase as string
    const query = new URLSearchParams()
    if (params.date_from) query.set('date_from', params.date_from)
    if (params.date_to) query.set('date_to', params.date_to)
    const res = await fetch(`${base}/timekeeping/export-excel?${query.toString()}`, {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    })
    if (!res.ok) return { ok: false }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'timekeeping.xlsx'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    return { ok: true }
  }

  return {
    today, fetchToday, checkIn, checkOut,
    mineRows, minePagination, mineLoading, mineError, fetchMine,
    teamRows, teamPagination, teamLoading, teamError, teamUsers, teamBranches, fetchTeam,
    requestEditTimekeeping, getUserEditTkRequest, updateRequestEditTkStatus,
    addTimekeeping, editTimekeeping, exportExcel,
  }
})
