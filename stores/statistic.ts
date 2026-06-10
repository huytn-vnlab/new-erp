import { defineStore } from 'pinia'
export const useStatisticStore = defineStore('statistic', () => {
  const overview = ref<any | null>(null)
  const loading = ref(false)
  const { post } = useApi()
  async function fetchOverview(params: { org_id: number; year: number; month: number }) {
    loading.value = true
    try {
      const res = await post<{ overview: Record<string, unknown> | null }>('/statistic/get-overview', params)
      overview.value = res.data?.overview ?? null
    } finally { loading.value = false }
  }
  return { overview, loading, fetchOverview }
})
