import { defineStore } from 'pinia'

interface GeneralStat {
  total_members: number
  total_active: number
  total_leave_today: number
  total_projects: number
  members_by_branch: { branch: string; amount: number }[]
  members_by_job_title: { job_title: string; amount: number }[]
  new_members_this_month: number
  new_members_this_year: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const { post } = useApi()

  const stat = ref<GeneralStat | null>(null)
  const loading = ref(false)

  async function fetchStat() {
    loading.value = true
    try {
      const res = await post<GeneralStat>('/api/statistic/general', {})
      if (res.status === 1 && res.data) stat.value = res.data
    } finally {
      loading.value = false
    }
  }

  return { stat, loading, fetchStat }
})
