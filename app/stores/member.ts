import { defineStore } from 'pinia'
import type { MemberRow, MemberDetail, BranchItem, JobTitleItem, Member, MemberStatus, Pagination } from '~/types'
import { formatDateDisplay } from '~/utils/date'

export interface InviteRow {
  id: number
  email: string
  type: number
  type_name: string
  status: number
  status_name: string
  message: string
  allow_resend: boolean
  time_request?: string
}

function formatDate(iso: string | null | undefined): string {
  return iso ? (formatDateDisplay(iso) || iso) : '—'
}

function mapStatus(n: number): MemberStatus {
  if (n === 1) return 'active'
  if (n === 2) return 'onboarding'
  if (n === 3) return 'leave'
  return 'inactive'
}

function toDisplay(row: MemberRow): Member {
  return {
    id: row.id,
    name: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email,
    branch: row.branch,
    role: row.role,
    phone: row.phone_number || '—',
    jp: '—',
    rank: '—',
    join: formatDate(row.company_join_date),
    status: mapStatus(row.status),
    jobTitleId: row.job_title ?? 0,
  }
}

export const useMemberStore = defineStore('member', () => {
  const { post, postBlob } = useApi()

  const _raw = ref<MemberRow[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const branches = ref<BranchItem[]>([])
  const jobTitles = ref<JobTitleItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const statsActive = ref(0)
  const statsOnboarding = ref(0)

  const members = computed<Member[]>(() => _raw.value.map(toDisplay))

  async function fetchMembers(params: {
    name?: string
    email?: string
    branch?: number
    job_title?: number
    status?: number
    rank?: number
    current_page?: number
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await post<{ profile_list: MemberRow[]; pagination: { current_page: number; total_row: number; row_perpage: number } }>(
        '/api/user/search-user-profile',
        {
          name: params.name ?? '',
          email: params.email ?? '',
          branch: params.branch ?? 0,
          job_title: params.job_title ?? 0,
          status: params.status ?? 0,
          rank: params.rank ?? 0,
          date_from: null,
          date_to: null,
          current_page: params.current_page ?? 1,
        },
      )
      if (res.status === 1 && res.data) {
        _raw.value = res.data.profile_list ?? []
        const p = res.data.pagination
        if (p) pagination.value = { current_page: p.current_page, total_row: p.total_row, row_per_page: p.row_perpage }
      }
    } catch {
      error.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
    } finally {
      loading.value = false
    }
  }

  type SearchResponse = { profile_list: MemberRow[]; pagination: { current_page: number; total_row: number; row_perpage: number } }
  const SEARCH_BASE = { name: '', email: '', branch: 0, job_title: 0, rank: 0, date_from: null, date_to: null, current_page: 1 }

  async function fetchStats() {
    try {
      const [activeRes, onboardRes] = await Promise.all([
        post<SearchResponse>('/api/user/search-user-profile', { ...SEARCH_BASE, status: 1 }),
        post<SearchResponse>('/api/user/search-user-profile', { ...SEARCH_BASE, status: 2 }),
      ])
      if (activeRes.status === 1 && activeRes.data)   statsActive.value = activeRes.data.pagination?.total_row ?? 0
      if (onboardRes.status === 1 && onboardRes.data) statsOnboarding.value = onboardRes.data.pagination?.total_row ?? 0
    } catch { /* ignore */ }
  }

  async function fetchBranches() {
    try {
      const res = await post<BranchItem[]>('/setting/branch/get-branches', {})
      if (res.status === 1 && Array.isArray(res.data)) branches.value = res.data
    } catch { /* ignore */ }
  }

  async function fetchJobTitles() {
    try {
      const res = await post<JobTitleItem[]>('/setting/job-title/get-job-titles', {})
      if (res.status === 1 && Array.isArray(res.data)) jobTitles.value = res.data
    } catch { /* ignore */ }
  }

  // Id→name maps for the profile-edit dropdowns (language/level/skill-level/
  // rank/technology) — GetListItemProfile is the only endpoint that exposes
  // these; the profile record itself only stores the numeric ids.
  const languageList = ref<Record<string, string>>({})
  const levelLanguageList = ref<Record<string, string>>({})
  async function fetchProfileLists() {
    try {
      const res = await post<{ language_list: Record<string, string>; level_language_list: Record<string, string> }>(
        '/api/user/get-list-item-profile', {},
      )
      if (res.status === 1 && res.data) {
        languageList.value = res.data.language_list ?? {}
        levelLanguageList.value = res.data.level_language_list ?? {}
      }
    } catch { /* ignore */ }
  }

  async function fetchMemberDetail(userId: number): Promise<MemberDetail | null> {
    const res = await post<MemberDetail>('/api/user/get-user-info', { user_id: userId })
    return res.data
  }

  async function updateMemberDetail(payload: Record<string, unknown> & { user_id: number }): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await post('/api/user/update-profile', payload)
      return { ok: res.status === 1, message: res.message ?? '' }
    } catch {
      return { ok: false, message: 'Lỗi kết nối' }
    }
  }

  async function inviteUser(payload: { email: string }) {
    try {
      const res = await post('/registration/inviteUser', { emailList: [payload.email] })
      return { ok: res.status === 1, message: res.message ?? '' }
    } catch {
      return { ok: false, message: 'Lỗi kết nối' }
    }
  }

  async function fetchInvitations(params: { email?: string; type?: number; status?: number; current_page?: number } = {}) {
    try {
      const res = await post<{ list_request: InviteRow[]; pagination: { current_page: number; total_row: number; row_perpage: number } }>(
        '/request/searchListRequest',
        { email: params.email ?? '', type: params.type ?? 0, status: params.status ?? 0, date_from: null, date_to: null, current_page: params.current_page ?? 1 },
      )
      if (res.status === 1 && res.data) {
        const p = res.data.pagination
        return {
          list: res.data.list_request ?? [],
          pagination: { current_page: p?.current_page ?? 1, total_row: p?.total_row ?? 0, row_per_page: p?.row_perpage ?? 10 },
        }
      }
      return { list: [], pagination: { current_page: 1, total_row: 0, row_per_page: 10 } }
    } catch {
      return { list: [], pagination: { current_page: 1, total_row: 0, row_per_page: 10 } }
    }
  }

  async function resendInvite(requestId: number) {
    try {
      const res = await post('/request/resendEmailRegister', { request_id: requestId })
      return { ok: res.status === 1, message: res.message ?? '' }
    } catch {
      return { ok: false, message: 'Lỗi kết nối' }
    }
  }

  async function cancelInvite(requestId: number) {
    try {
      const res = await post('/request/updateRequestStatus', { request_id: requestId, status_request: 2 })
      return { ok: res.status === 1, message: res.message ?? '' }
    } catch {
      return { ok: false, message: 'Lỗi kết nối' }
    }
  }

  async function deleteUser(userId: number) {
    const res = await post('/api/user/delete-user', { user_id: userId })
    return { ok: res.status === 1, message: res.message }
  }

  async function exportExcel(filters: { name?: string; branch?: number; job_title?: number; status?: number; rank?: number } = {}) {
    return postBlob('/api/user/export-excel', {
      name: filters.name ?? '', email: '', phone_number: '',
      status: filters.status ?? 0, job_title: filters.job_title ?? 0,
      rank: filters.rank ?? 0, branch: filters.branch ?? 0,
      current_page: 1, row_per_page: 0,
    })
  }

  return {
    members, pagination, branches, jobTitles, loading, error, statsActive, statsOnboarding,
    languageList, levelLanguageList,
    fetchMembers, fetchStats, fetchBranches, fetchJobTitles, fetchMemberDetail, updateMemberDetail,
    fetchProfileLists,
    inviteUser, fetchInvitations, resendInvite, cancelInvite, deleteUser, exportExcel,
  }
})
