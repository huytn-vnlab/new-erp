import { defineStore } from 'pinia'
import type { Evaluation, BackendPage } from '~/types'
export const useEvaluationStore = defineStore('evaluation', () => {
  const evaluations = ref<any[]>([])
  const loading     = ref(false)
  const pagination  = ref({ current_page: 1, total_row: 0, row_per_page: 10 })
  const { post }    = useApi()

  async function fetchEvaluations(page = 1) {
    loading.value = true
    try {
      const res = await post<{ evaluations: Evaluation[]; pagination: BackendPage }>('/evaluation/get-evaluations', { current_page: page, row_per_page: 10 })
      evaluations.value = res.data?.evaluations ?? []
      pagination.value  = res.data?.pagination ?? pagination.value
    } finally { loading.value = false }
  }

  return { evaluations, loading, pagination, fetchEvaluations }
})
