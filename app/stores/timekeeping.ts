import { defineStore } from 'pinia'
import type { TimekeepingRow, Pagination } from '~/types'

interface TkListResponse {
  timekeepings: TimekeepingRow[]
  pagination: Pagination
}

interface TkToday {
  check_in_time: string   // "yyyy/MM/dd hh:mm AM" or ""
  check_out_time: string  // "yyyy/MM/dd hh:mm AM" or ""
  time_server: string     // "yyyy/MM/dd HH:mm:ss"
}

export const useTimekeepingStore = defineStore('timekeeping', () => {
  const { post } = useApi()

  const rows = ref<TimekeepingRow[]>([])
  const today = ref<TkToday | null>(null)
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 31 })
  const loading = ref(false)

  async function fetchToday() {
    const res = await post<TkToday>('/api/timekeeping/get-timekeeping-today', {})
    if (res.status === 1 && res.data) today.value = res.data
  }

  async function fetchAll(params: {
    month?: string
    branch?: number
    user_name?: string
    current_page?: number
  } = {}) {
    loading.value = true
    try {
      const res = await post<TkListResponse>('/api/timekeeping/get-all-timekeeping', {
        month: params.month,
        branch: params.branch ?? 0,
        user_name: params.user_name ?? '',
        current_page: params.current_page ?? 1,
        row_per_page: 31,
      })
      if (res.status === 1 && res.data) {
        rows.value = res.data.timekeepings ?? []
        pagination.value = res.data.pagination ?? pagination.value
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchMine(params: { month?: string; current_page?: number } = {}) {
    loading.value = true
    try {
      const res = await post<TkListResponse>('/api/timekeeping/get-all-timekeeping-user', {
        month: params.month,
        current_page: params.current_page ?? 1,
      })
      if (res.status === 1 && res.data) {
        rows.value = res.data.timekeepings ?? []
        pagination.value = res.data.pagination ?? pagination.value
      }
    } finally {
      loading.value = false
    }
  }

  async function checkIn() {
    return post('/api/timekeeping/check-in', {})
  }

  async function checkOut() {
    return post('/api/timekeeping/check-out', {})
  }

  return {
    rows, today, pagination, loading,
    fetchToday, fetchAll, fetchMine, checkIn, checkOut,
  }
})
