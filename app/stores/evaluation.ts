import { defineStore } from 'pinia'
import type { EvaluationRow, Pagination } from '~/types'

interface EvalListResponse {
  evaluations: EvaluationRow[]
  pagination: Pagination
}

export const useEvaluationStore = defineStore('evaluation', () => {
  const { post, get } = useApi()

  const evaluations = ref<EvaluationRow[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const loading = ref(false)

  async function fetchEvaluations(params: {
    name?: string
    quarter?: number
    year?: number
    branch?: number
    status?: number
    current_page?: number
  } = {}) {
    loading.value = true
    try {
      const res = await post<EvalListResponse>('/api/targeteval/search-evaluation-list', {
        name: params.name ?? '',
        quarter: params.quarter ?? 0,
        year: params.year ?? 0,
        branch: params.branch ?? 0,
        status: params.status ?? 0,
        current_page: params.current_page ?? 1,
        user_ids: [],
        rank: 0,
        project_id: 0,
      })
      if (res.status === 1 && res.data) {
        evaluations.value = res.data.evaluations ?? []
        pagination.value = res.data.pagination ?? pagination.value
      }
    } finally {
      loading.value = false
    }
  }

  async function exportExcel() {
    return get('/api/targeteval/export-excel')
  }

  return {
    evaluations, pagination, loading,
    fetchEvaluations, exportExcel,
  }
})
