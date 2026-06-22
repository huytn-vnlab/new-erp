import { defineStore } from 'pinia'
import type { MemberRow, MemberDetail, BranchItem, JobTitleItem, Pagination } from '~/types'
import type { Member, MemberStatus } from '~/mocks/members'

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
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
    phone: '—',
    jp: '—',
    rank: '—',
    join: formatDate(row.company_joined_date),
    status: mapStatus(row.status),
  }
}

export const useMemberStore = defineStore('member', () => {
  const { post } = useApi()

  const _raw = ref<MemberRow[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const branches = ref<BranchItem[]>([])
  const jobTitles = ref<JobTitleItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const members = computed<Member[]>(() => _raw.value.map(toDisplay))

  async function fetchMembers(params: {
    name?: string
    email?: string
    branch?: number
    job_title?: number
    status?: number
    current_page?: number
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await post<{ profiles: MemberRow[]; pagination: Pagination }>(
        '/api/user/get-list-item-profile',
        {
          name: params.name ?? '',
          email: params.email ?? '',
          branch: params.branch ?? 0,
          job_title: params.job_title ?? 0,
          status: params.status,
          current_page: params.current_page ?? 1,
        },
      )
      if (res.status === 1 && res.data) {
        _raw.value = res.data.profiles ?? []
        pagination.value = res.data.pagination ?? pagination.value
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchBranches() {
    try {
      const res = await post<{ branches: BranchItem[] }>('/api/setting/branch/get-branches', {})
      if (res.status === 1 && res.data) branches.value = res.data.branches ?? []
    } catch { /* ignore */ }
  }

  async function fetchJobTitles() {
    try {
      const res = await post<{ job_titles: JobTitleItem[] }>('/api/setting/job-title/get-job-titles', {})
      if (res.status === 1 && res.data) jobTitles.value = res.data.job_titles ?? []
    } catch { /* ignore */ }
  }

  async function fetchMemberDetail(userId: number): Promise<MemberDetail | null> {
    const res = await post<MemberDetail>('/api/user/get-user-info', { user_id: userId })
    return res.data
  }

  async function inviteUser(payload: { email: string; branch_id: number; role_id: number }) {
    return post('/api/register/inviteUser', payload)
  }

  async function deleteUser(userId: number) {
    return post('/api/user/delete-user', { user_id: userId })
  }

  return {
    members, pagination, branches, jobTitles, loading, error,
    fetchMembers, fetchBranches, fetchJobTitles, fetchMemberDetail, inviteUser, deleteUser,
  }
})
