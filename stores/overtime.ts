import { defineStore } from 'pinia'
import type { OvertimeRequest, BackendPage } from '~/types'
export const useOvertimeStore = defineStore('overtime', () => {
  const requests      = ref<any[]>([])
  const loading       = ref(false)
  const pagination    = ref<BackendPage>({ current_page: 1, total_row: 0, row_per_page: 10 })
  const overtimeTypes = ref<Record<number, string>>({})
  const projects      = ref<Record<number, string>>({})
  const { post } = useApi()

  async function fetchRequests(page = 1, rowPerPage = 10) {
    loading.value = true
    try {
      const res = await post<{
        ot_requests:          OvertimeRequest[]
        pagination:           BackendPage
        overtime_types:       Record<number, string>
        projects:             Record<number, string>
      }>('/overtime/get-overtime-requests', { current_page: page, row_per_page: rowPerPage })
      requests.value   = res.data?.ot_requests ?? []
      pagination.value = res.data?.pagination ?? pagination.value
      if (res.data?.overtime_types) overtimeTypes.value = res.data.overtime_types
      if (res.data?.projects)       projects.value      = res.data.projects
    } finally { loading.value = false }
  }

  return { requests, loading, pagination, overtimeTypes, projects, fetchRequests }
})
