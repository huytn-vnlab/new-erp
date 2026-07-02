import { defineStore } from 'pinia'
import type { BranchItem, JobTitleItem, TechItem, HolidayRow, OrgSetting } from '~/types'

export const useSettingsStore = defineStore('settings', () => {
  const { post } = useApi()

  const orgSetting = ref<OrgSetting | null>(null)
  const branches = ref<BranchItem[]>([])
  const jobTitles = ref<JobTitleItem[]>([])
  const technologies = ref<TechItem[]>([])
  const holidays = ref<HolidayRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOrgSetting() {
    const res = await post<OrgSetting>('/api/setting/get-organization-setting', {})
    if (res.status === 1 && res.data) orgSetting.value = res.data
  }

  async function fetchBranches() {
    const res = await post<{ branches: BranchItem[] }>('/api/setting/branch/get-branches', {})
    if (res.status === 1 && res.data) branches.value = res.data.branches ?? []
  }

  async function fetchJobTitles() {
    const res = await post<{ job_titles: JobTitleItem[] }>('/api/setting/job-title/get-job-titles', {})
    if (res.status === 1 && res.data) jobTitles.value = res.data.job_titles ?? []
  }

  async function fetchTechnologies() {
    const res = await post<{ technologies: TechItem[] }>('/api/setting/technology/get-technologies', {})
    if (res.status === 1 && res.data) technologies.value = res.data.technologies ?? []
  }

  async function fetchHolidays() {
    const res = await post<{ holidays: HolidayRow[] }>('/api/holiday/get-holidays', {})
    if (res.status === 1 && res.data) holidays.value = res.data.holidays ?? []
  }

  async function createBranch(name: string) {
    const res = await post('/api/setting/branch/create-branch', { name })
    if (res.status === 1) await fetchBranches()
    return { ok: res.status === 1, message: res.message }
  }

  async function editBranch(id: number, name: string) {
    const res = await post('/api/setting/branch/edit-branch', { id, name })
    if (res.status === 1) await fetchBranches()
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteBranch(id: number) {
    const res = await post('/api/setting/branch/remove-branch', { id })
    if (res.status === 1) await fetchBranches()
    return { ok: res.status === 1, message: res.message }
  }

  async function createJobTitle(name: string) {
    const res = await post('/api/setting/job-title/create-job-title', { name })
    if (res.status === 1) await fetchJobTitles()
    return { ok: res.status === 1, message: res.message }
  }

  async function editJobTitle(id: number, name: string) {
    const res = await post('/api/setting/job-title/edit-job-title', { id, name })
    if (res.status === 1) await fetchJobTitles()
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteJobTitle(id: number) {
    const res = await post('/api/setting/job-title/remove-job-title', { id })
    if (res.status === 1) await fetchJobTitles()
    return { ok: res.status === 1, message: res.message }
  }

  async function createTechnology(payload: { name: string; category?: string }) {
    const res = await post('/api/setting/technology/create-technology', payload)
    if (res.status === 1) await fetchTechnologies()
    return { ok: res.status === 1, message: res.message }
  }

  async function editTechnology(id: number, payload: { name?: string; category?: string }) {
    const res = await post('/api/setting/technology/edit-technology', { id, ...payload })
    if (res.status === 1) await fetchTechnologies()
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteTechnology(id: number) {
    const res = await post('/api/setting/technology/remove-technology', { id })
    if (res.status === 1) await fetchTechnologies()
    return { ok: res.status === 1, message: res.message }
  }

  async function createHoliday(payload: { name: string; date: string }) {
    const res = await post('/api/holiday/create-holiday', payload)
    if (res.status === 1) await fetchHolidays()
    return { ok: res.status === 1, message: res.message }
  }

  async function editHoliday(id: number, payload: { name?: string; date?: string }) {
    const res = await post('/api/holiday/edit-holiday', { id, ...payload })
    if (res.status === 1) await fetchHolidays()
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteHoliday(id: number) {
    const res = await post('/api/holiday/remove-holiday', { id })
    if (res.status === 1) await fetchHolidays()
    return { ok: res.status === 1, message: res.message }
  }

  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      await Promise.all([fetchOrgSetting(), fetchBranches(), fetchJobTitles(), fetchTechnologies(), fetchHolidays()])
    } catch {
      error.value = 'Không thể tải cài đặt. Vui lòng thử lại.'
    } finally {
      loading.value = false
    }
  }

  return {
    orgSetting, branches, jobTitles, technologies, holidays, loading, error,
    fetchOrgSetting, fetchBranches, fetchJobTitles, fetchTechnologies, fetchHolidays,
    createBranch, editBranch, deleteBranch,
    createJobTitle, editJobTitle, deleteJobTitle,
    createTechnology, editTechnology, deleteTechnology,
    createHoliday, editHoliday, deleteHoliday,
    loadAll,
  }
})
