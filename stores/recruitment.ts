import { defineStore } from 'pinia'
import type { BackendPage } from '~/types'

export const useRecruitmentStore = defineStore('recruitment', () => {
  const recruitments = ref<any[]>([])
  const loading      = ref(false)
  const pagination   = ref<BackendPage>({ current_page: 1, total_row: 0, row_per_page: 10 })
  const { post } = useApi()

  /**
   * Fetch job postings list.
   * Backend: POST /recruitment/get-jobs
   * Response: { data: { jobs: [...], pagination: {...} } }
   */
  async function fetchRecruitments(page = 1) {
    loading.value = true
    try {
      const res = await post<{ recruitments: any[]; pagination: BackendPage }>('/recruitment/get-jobs', {
        current_page: page,
        row_per_page: 10,
      })
      const now = new Date()
      recruitments.value = (res.data?.recruitments ?? []).map((r: any) => ({
        ...r,
        // Derive status: 0=paused(no expiry), 1=active, 2=closed(past expiry)
        status: !r.expiry_date ? 0
          : new Date(r.expiry_date) >= now ? 1 : 2,
      }))
      pagination.value   = res.data?.pagination ?? pagination.value
    } finally { loading.value = false }
  }

  return { recruitments, loading, pagination, fetchRecruitments }
})
