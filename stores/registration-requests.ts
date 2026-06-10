import { defineStore } from 'pinia'
import type { BackendPage } from '~/types'
export const useRegistrationRequestsStore = defineStore('registrationRequests', () => {
  const requests = ref<any[]>([])
  const loading = ref(false)
  const pagination = ref<BackendPage>({ current_page: 1, total_row: 0, row_per_page: 10 })
  const { post } = useApi()
  async function fetchRequests(page = 1) {
    loading.value = true
    try {
      const res = await post<{ list_request: any[]; pagination: { current_page: number; total_row: number; row_perpage: number } }>('/request/searchListRequest', { current_page: page, row_per_page: 10 })
      requests.value = res.data?.list_request ?? []
      const p = res.data?.pagination
      if (p) pagination.value = { current_page: p.current_page, total_row: p.total_row, row_per_page: p.row_perpage }
    } finally { loading.value = false }
  }
  return { requests, loading, pagination, fetchRequests }
})
