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

// Lean aggregate counts for the home dashboard's 3 top stat cards — distinct
// from GeneralStat, which carries the heavier per-tab breakdowns (job title,
// JP level, tech interest, eval rank trend, rank logs).
export interface HomeSummary {
  total: { users: number; projects: number }
  number_people_branch: { branch: string; amount: number }[] | null
  project_status: { active: number; ended: number }
  eval_period: { quarter: number; year: number; done: number; total: number }
}

export const useDashboardStore = defineStore('dashboard', () => {
  const { post } = useApi()

  const stat = ref<GeneralStat | null>(null)
  const reminders = ref<EventReminders>({ birthdays: [], anniversaries: [], contracts: [] })
  // Separate from `reminders` (the fixed near-term "upcoming" window used by
  // the dashboard preview card) — this holds whatever month the reminder
  // calendar modal is currently browsing.
  const calendarReminders = ref<EventReminders>({ birthdays: [], anniversaries: [], contracts: [] })
  const homeSummary = ref<HomeSummary | null>(null)
  const loading = ref(false)

  // /statistic/general is shared by all 3 home-admin tabs (job title/JP/tech/
  // eval-rank/rank-logs breakdowns) — each tab fetches on its own mount, so
  // guard against re-hitting the network every time the user switches back
  // to a previously-visited tab. `force` bypasses the cache for an explicit refresh.
  async function fetchStat(force = false) {
    if (stat.value && !force) return
    loading.value = true
    try {
      const res = await post<GeneralStat>('/statistic/general', {})
      if (res.status === 1 && res.data) stat.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchHomeSummary() {
    try {
      const res = await post<HomeSummary>('/statistic/home-summary', {})
      if (res.status === 1 && res.data) homeSummary.value = res.data
    } catch { /* non-critical — StatCards fall back to mock data */ }
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

  async function fetchRemindersForMonth(year: number, month: number) {
    try {
      const res = await post<{
        bithday_list: { fullname: string; birthday: string }[] | null
        company_join_date_list: { fullname: string; company_joined_date: string }[] | null
        contract_remind_list: { fullname: string; contract_expiration_date: string }[] | null
      }>('/notification/get-reminder-calendar', { year, month })
      if (res.status === 1 && res.data) {
        calendarReminders.value = {
          birthdays: res.data.bithday_list ?? [],
          anniversaries: res.data.company_join_date_list ?? [],
          contracts: res.data.contract_remind_list ?? [],
        }
      }
    } catch { /* non-critical */ }
  }

  return { stat, reminders, calendarReminders, homeSummary, loading, fetchStat, fetchReminders, fetchRemindersForMonth, fetchHomeSummary }
})
