/**
 * timekeeping store. Replaces: store/modules/timekeeping.ts
 */
import { defineStore } from 'pinia'
import type { TimekeepingRecord, BackendPage } from '~/types'

// Matches the /timekeeping/get-timekeeping-today response
type TodayRecord = { check_in_time: string; check_out_time: string; time_server: string }

export const useTimekeepingStore = defineStore('timekeeping', () => {
  const todayRecord = ref<TodayRecord | null>(null)
  const records = ref<TimekeepingRecord[]>([])
  const loading = ref(false)
  const pagination = ref<BackendPage>({ current_page: 1, total_row: 0, row_per_page: 10 })

  const { post } = useApi()

  async function fetchToday() {
    try {
      const res = await post<TodayRecord>('/timekeeping/get-timekeeping-today', {})
      todayRecord.value = res.data ?? null
    } catch { /* silent — card shows '—' */ }
  }

  async function fetchAll(page = 1, rowPerPage = 10, month?: number, year?: number) {
    loading.value = true
    const now = new Date()
    try {
      const res = await post<{ timekeepings: TimekeepingRecord[]; pagination: BackendPage }>('/timekeeping/get-all-timekeeping-user', {
        month:        month ?? now.getMonth() + 1,
        year:         year  ?? now.getFullYear(),
        current_page: page,
        row_per_page: rowPerPage,
      })
      records.value = res.data?.timekeepings ?? []
      pagination.value = res.data?.pagination ?? pagination.value
    } finally {
      loading.value = false
    }
  }

  async function checkIn() {
    return post('/timekeeping/check-in', {})
  }

  async function checkOut() {
    return post('/timekeeping/check-out', {})
  }

  return { todayRecord, records, loading, pagination, fetchToday, fetchAll, checkIn, checkOut }
})
