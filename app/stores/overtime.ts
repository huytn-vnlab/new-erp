import { defineStore } from 'pinia'
import type { OvertimeRow, Pagination } from '~/types'

interface OtListResponse {
  overtime_requests: OvertimeRow[]
  pagination: Pagination
}

export const useOvertimeStore = defineStore('overtime', () => {
  const { post } = useApi()

  const rows = ref<OvertimeRow[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const loading = ref(false)

  async function fetchOvertimes(params: {
    branch?: number
    overtime_type?: number
    status?: number
    current_page?: number
  } = {}) {
    loading.value = true
    try {
      const res = await post<OtListResponse>('/api/overtime/get-overtime-requests', {
        branch: params.branch ?? 0,
        overtime_type: params.overtime_type ?? 0,
        status: params.status ?? null,
        current_page: params.current_page ?? 1,
        row_per_page: 20,
        users_id: [],
        project_id: null,
        id: null,
        date_from: '',
        date_to: '',
      })
      if (res.status === 1 && res.data) {
        rows.value = res.data.overtime_requests ?? []
        pagination.value = res.data.pagination ?? pagination.value
      }
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id: number, status: number) {
    return post('/api/overtime/update-overtime-request-status', { id, status })
  }

  return {
    rows, pagination, loading,
    fetchOvertimes, updateStatus,
  }
})
