import { defineStore } from 'pinia'

export interface GeneralStat {
  total: { projects: number; users: number }
  number_people_branch: { branch: string; amount: number }[] | null
  number_people_job_title: { job_title: string; amount: number }[] | null
  number_people_japanese_level: { certificate: string; amount: number }[] | null
  number_people_interest_technology: { technology: string; amount: number }[] | null
  evaluation_rank: { datetime: string[] | null; datasets: { rank: string; data: number[] }[] } | null
  user_rank_logs: { rank: number; created_at: string }[] | null
  day_off_info: { day_remaining: number; day_used: number }
}

export interface EventReminders {
  birthdays: { fullname: string; birthday: string }[]
  anniversaries: { fullname: string; company_joined_date: string }[]
  contracts: { fullname: string; contract_expiration_date: string }[]
}

export const useDashboardStore = defineStore('dashboard', () => {
  const { post } = useApi()

  const stat = ref<GeneralStat | null>(null)
  const reminders = ref<EventReminders>({ birthdays: [], anniversaries: [], contracts: [] })
  const loading = ref(false)

  async function fetchStat() {
    loading.value = true
    try {
      const res = await post<GeneralStat>('/statistic/general', {})
      if (res.status === 1 && res.data) stat.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchReminders() {
    try {
      const res = await post<{
        bithday_list: { fullname: string; birthday: string }[] | null
        company_join_date_list: { fullname: string; company_joined_date: string }[] | null
        contract_remind_list: { fullname: string; contract_expiration_date: string }[] | null
      }>('/notification/notification-event-remind', {})
      if (res.status === 1 && res.data) {
        reminders.value = {
          birthdays: res.data.bithday_list ?? [],
          anniversaries: res.data.company_join_date_list ?? [],
          contracts: res.data.contract_remind_list ?? [],
        }
      }
    } catch { /* non-critical */ }
  }

  return { stat, reminders, loading, fetchStat, fetchReminders }
})
