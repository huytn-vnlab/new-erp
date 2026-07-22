import { defineStore } from 'pinia'
import type { BranchItem, JobTitleItem, TechItem, HolidayRow, OrgSetting, OvertimeWeight, PermissionModule, PermissionFunction, PermissionUserRow, Pagination } from '~/types'

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
    const res = await post<OrgSetting>('/setting/get-organization-setting', {})
    if (res.status === 1 && res.data) orgSetting.value = res.data
    else error.value = res.message || 'Không thể tải cài đặt tổ chức.'
  }

  // GetBranches/GetJobTitles/GetTechnologies all return a raw array directly
  // as `data` (not wrapped in `{branches:[...]}` etc.) — every one of these
  // three list fetches previously always resolved to an empty array against
  // the real backend, despite reading `res.status === 1` successfully.
  async function fetchBranches() {
    const res = await post<BranchItem[]>('/setting/branch/get-branches', {})
    if (res.status === 1) branches.value = res.data ?? []
    else error.value = res.message || 'Không thể tải danh sách chi nhánh.'
  }

  async function fetchJobTitles() {
    const res = await post<JobTitleItem[]>('/setting/job-title/get-job-titles', {})
    if (res.status === 1) jobTitles.value = res.data ?? []
    else error.value = res.message || 'Không thể tải danh sách chức danh.'
  }

  async function fetchTechnologies() {
    const res = await post<TechItem[]>('/setting/technology/get-technologies', {})
    if (res.status === 1) technologies.value = res.data ?? []
    else error.value = res.message || 'Không thể tải danh sách công nghệ.'
  }

  // GetHolidaysParams.Year is govalidator `required` — the old fetchHolidays()
  // sent no year at all and always 400'd, so this section never loaded either.
  async function fetchHolidays(year: number) {
    const res = await post<{ holidays: HolidayRow[] }>('/holiday/get-holidays', { year })
    if (res.status === 1 && res.data) holidays.value = res.data.holidays ?? []
    else error.value = res.message || 'Không thể tải danh sách ngày nghỉ lễ.'
  }

  // CreateBranchParam/CreateJobTitleParam/CreateTechnologyParam.Priority is
  // govalidator `required` — every create call here previously 400'd since
  // nothing was ever sent for it. The list endpoints don't return priority,
  // so there's no way to read back the real ordering — appending at the
  // current list length is a reasonable "goes to the end" default.
  async function createBranch(name: string) {
    const res = await post('/setting/branch/create-branch', { name, priority: branches.value.length + 1 })
    if (res.status === 1) await fetchBranches()
    return { ok: res.status === 1, message: res.message }
  }

  async function editBranch(id: number, name: string) {
    const res = await post('/setting/branch/edit-branch', { id, name })
    if (res.status === 1) await fetchBranches()
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteBranch(id: number) {
    const res = await post('/setting/branch/remove-branch', { id })
    if (res.status === 1) await fetchBranches()
    return { ok: res.status === 1, message: res.message }
  }

  async function createJobTitle(name: string) {
    const res = await post('/setting/job-title/create-job-title', { name, priority: jobTitles.value.length + 1 })
    if (res.status === 1) await fetchJobTitles()
    return { ok: res.status === 1, message: res.message }
  }

  async function editJobTitle(id: number, name: string) {
    const res = await post('/setting/job-title/edit-job-title', { id, name })
    if (res.status === 1) await fetchJobTitles()
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteJobTitle(id: number) {
    const res = await post('/setting/job-title/remove-job-title', { id })
    if (res.status === 1) await fetchJobTitles()
    return { ok: res.status === 1, message: res.message }
  }

  // No `category` field exists on the backend at all (CreateTechnologyParam
  // only has name+priority) — technology has no category concept server-side.
  async function createTechnology(name: string) {
    const res = await post('/setting/technology/create-technology', { name, priority: technologies.value.length + 1 })
    if (res.status === 1) await fetchTechnologies()
    return { ok: res.status === 1, message: res.message }
  }

  async function editTechnology(id: number, name: string) {
    const res = await post('/setting/technology/edit-technology', { id, name })
    if (res.status === 1) await fetchTechnologies()
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteTechnology(id: number) {
    const res = await post('/setting/technology/remove-technology', { id })
    if (res.status === 1) await fetchTechnologies()
    return { ok: res.status === 1, message: res.message }
  }

  async function createHoliday(payload: { description: string; holiday_date: string }, year: number) {
    const res = await post('/holiday/create-holiday', payload)
    if (res.status === 1) await fetchHolidays(year)
    return { ok: res.status === 1, message: res.message }
  }

  async function editHoliday(id: number, payload: { description?: string; holiday_date?: string }, year: number) {
    const res = await post('/holiday/edit-holiday', { id, ...payload })
    if (res.status === 1) await fetchHolidays(year)
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteHoliday(id: number, year: number) {
    const res = await post('/holiday/remove-holiday', { id })
    if (res.status === 1) await fetchHolidays(year)
    return { ok: res.status === 1, message: res.message }
  }

  // edit-organization-email only ever accepts a test-recipient address — it
  // does NOT let the org set a custom "from" address (the repo always writes
  // the server's own MAIL_ADDRESS/MAIL_PASSWORD env vars regardless of what's
  // sent). All three /setting/... write endpoints below are GM-only.
  async function sendTestEmail(emailTest: string) {
    const res = await post('/setting/edit-organization-email', { email_test: emailTest })
    return { ok: res.status === 1, message: res.message }
  }

  // month is 1-12 (human) — converted to the backend's 0-indexed convention here.
  async function editLeaveResetMonth(month: number) {
    const res = await post('/setting/edit-expiration-reset-day-off', { expiration: month - 1 })
    if (res.status === 1) await fetchOrgSetting()
    return { ok: res.status === 1, message: res.message }
  }

  async function editWorkHours(payload: { work_start_time: string; lunch_break_start_time: string; lunch_break_end_time: string; work_end_time: string }) {
    const res = await post('/setting/edit-work-hours', payload)
    if (res.status === 1) await fetchOrgSetting()
    return { ok: res.status === 1, message: res.message }
  }

  // ── Overtime weight (salary multipliers) — one row per org; GM-only. ──
  const overtimeWeight = ref<OvertimeWeight | null>(null)
  async function fetchOvertimeWeight() {
    const res = await post<OvertimeWeight>('/overtime/get-overtime-weight', {})
    overtimeWeight.value = res.status === 1 && res.data ? res.data : null
  }
  type WeightPayload = { normal_day_weight: number; weekend_weight: number; holiday_weight: number }
  async function saveOvertimeWeight(payload: WeightPayload) {
    const res = overtimeWeight.value
      ? await post('/overtime/edit-overtime-weight', { id: overtimeWeight.value.id, ...payload })
      : await post('/overtime/create-overtime-weight', payload)
    if (res.status === 1) await fetchOvertimeWeight()
    return { ok: res.status === 1, message: res.message }
  }

  // ── Permission matrix — GM-only. get-permissions itself isn't GM-gated,
  // but get-user-permissions (the picker) and edit-permission are, so the
  // whole workflow is effectively GM-only. ──
  const modules = ref<PermissionModule[]>([])
  async function fetchModules() {
    const res = await post<PermissionModule[]>('/admin/get-moudles', {})
    // The permission matrix only ever groups by module_id 1..5 (cf.TOTALMODULE)
    // even though the org may have more modules (e.g. 6/7 "Base Asset") enabled.
    modules.value = res.status === 1 && res.data ? res.data.filter(m => m.id <= 5) : []
  }

  const permUsers = ref<PermissionUserRow[]>([])
  const permUsersLoading = ref(false)
  // row_per_page has no server-side cap — request a page large enough to
  // cover the whole org in one call so the picker needs no pagination UI.
  async function fetchPermissionUsers(name: string) {
    permUsersLoading.value = true
    try {
      const res = await post<{ pagination: Pagination; user_permissions: PermissionUserRow[] }>(
        '/user-permission/get-user-permissions',
        { name, current_page: 1, row_per_page: 500 },
      )
      if (res.status === 1 && res.data) permUsers.value = res.data.user_permissions ?? []
    } catch { /* non-critical */ }
    finally {
      permUsersLoading.value = false
    }
  }

  // Keyed by module_id (1-5) — matches what /admin/get-moudles + this both use.
  const userPermissions = ref<Record<number, PermissionFunction[]>>({})
  const userPermissionsLoading = ref(false)
  async function fetchUserPermissions(userId: number) {
    userPermissionsLoading.value = true
    try {
      const res = await post<Record<string, PermissionFunction[]>>('/user-permission/get-permissions', { user_id: userId })
      const raw = res.status === 1 && res.data ? res.data : {}
      const mapped: Record<number, PermissionFunction[]> = {}
      Object.entries(raw).forEach(([moduleId, fns]) => { mapped[Number(moduleId)] = fns })
      userPermissions.value = mapped
    } catch { userPermissions.value = {} }
    finally {
      userPermissionsLoading.value = false
    }
  }

  // status: true=grant(1) / false=revoke(2) — cf.ACCESSFUNC/NOTACCESSFUNC.
  // No bulk endpoint — one call per function toggle.
  async function editPermission(userId: number, functionId: number, status: boolean) {
    const res = await post('/user-permission/edit-permission', { user_id: userId, function_id: functionId, status: status ? 1 : 2 })
    return { ok: res.status === 1, message: res.message }
  }

  async function loadAll() {
    loading.value = true
    error.value = null
    const thisYear = new Date().getFullYear()
    try {
      await Promise.all([fetchOrgSetting(), fetchBranches(), fetchJobTitles(), fetchTechnologies(), fetchHolidays(thisYear)])
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
    sendTestEmail, editLeaveResetMonth, editWorkHours,
    overtimeWeight, fetchOvertimeWeight, saveOvertimeWeight,
    modules, fetchModules,
    permUsers, permUsersLoading, fetchPermissionUsers,
    userPermissions, userPermissionsLoading, fetchUserPermissions, editPermission,
    loadAll,
  }
})
