import { defineStore } from 'pinia'
import type { BackendPage } from '~/types'
export const useRegistrationStore = defineStore('registration', () => {
  const registrations = ref<any[]>([])
  const loading = ref(false)
  const pagination = ref<BackendPage>({ current_page: 1, total_row: 0, row_per_page: 10 })
  const { post } = useApi()
  async function fetchRegistrations(page = 1) {
    loading.value = true
    try {
      const res = await post<{ registrations: any[]; pagination: BackendPage }>('/registration/get-registrations', { current_page: page, row_per_page: 10 })
      registrations.value = res.data?.registrations ?? []
      pagination.value = res.data?.pagination ?? pagination.value
    } finally { loading.value = false }
  }
  return { registrations, loading, pagination, fetchRegistrations }
})
