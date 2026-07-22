import { defineStore } from 'pinia'
import type { EvalContent, EvaluationDetail, EvaluationRow, Pagination } from '~/types'

interface EvalListResponse {
  pagination: Pagination
  branch_select_box: Record<string, string>
  rank_select_box: Record<string, string>
  quarter_select_box: number[]
  status_select_box: Record<string, string>
  evaluations: EvaluationRow[]
  users: Record<string, string>
  projects: Record<string, string>
}

const ROW_PER_PAGE = 20

export const useEvaluationStore = defineStore('evaluation', () => {
  const { get, post } = useApi()

  const evaluations = ref<EvaluationRow[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: ROW_PER_PAGE })
  const branches = ref<Record<string, string>>({})
  const ranks = ref<Record<string, string>>({})
  const statuses = ref<Record<string, string>>({})
  const users = ref<Record<string, string>>({})
  const projects = ref<Record<string, string>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchEvaluations(params: {
    name?: string
    quarter?: number
    year?: number
    branch?: number
    status?: number
    rank?: number
    project_id?: number
    user_ids?: number[]
    current_page?: number
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await post<EvalListResponse>('/evaluation/search-evaluation-list', {
        name: params.name ?? '',
        quarter: params.quarter ?? 0,
        year: params.year ?? 0,
        branch: params.branch ?? 0,
        status: params.status ?? 0,
        rank: params.rank ?? 0,
        project_id: params.project_id ?? 0,
        user_ids: params.user_ids ?? [],
        current_page: params.current_page ?? 1,
        row_per_page: ROW_PER_PAGE,
      })
      if (res.status === 1 && res.data) {
        evaluations.value = res.data.evaluations ?? []
        pagination.value = res.data.pagination ?? pagination.value
        branches.value = res.data.branch_select_box ?? {}
        ranks.value = res.data.rank_select_box ?? {}
        statuses.value = res.data.status_select_box ?? {}
        users.value = res.data.users ?? {}
        projects.value = res.data.projects ?? {}
      } else {
        error.value = res.message || 'Không thể tải dữ liệu đánh giá.'
      }
    } catch {
      error.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
    } finally {
      loading.value = false
    }
  }

  // row_per_page:0 makes the backend return every matching row (used for reports —
  // rank distribution/top performers need the whole filtered set, not one page).
  async function fetchAllEvaluations(params: {
    name?: string
    quarter?: number
    year?: number
    branch?: number
    status?: number
    rank?: number
    project_id?: number
    user_ids?: number[]
  } = {}): Promise<EvaluationRow[]> {
    const res = await post<EvalListResponse>('/evaluation/search-evaluation-list', {
      name: params.name ?? '',
      quarter: params.quarter ?? 0,
      year: params.year ?? 0,
      branch: params.branch ?? 0,
      status: params.status ?? 0,
      rank: params.rank ?? 0,
      project_id: params.project_id ?? 0,
      user_ids: params.user_ids ?? [],
      current_page: 1,
      row_per_page: 0,
    })
    return res.status === 1 && res.data ? res.data.evaluations ?? [] : []
  }

  // Old ERP narrows the "manage" view to (self + users this manager manages) for
  // Manager-role callers; GeneralManager sees everyone (empty user_ids = no filter).
  async function fetchManagedUserIds(): Promise<number[]> {
    const res = await post<number[]>('/user-project/get-user-ids-managed-by-manager', {})
    return res.status === 1 && res.data ? res.data : []
  }

  async function deleteEvaluation(id: number) {
    const res = await post('/evaluation/delete-evaluation', { evaluation_id: id })
    return { ok: res.status === 1, message: res.message }
  }

  // Per-evaluation detailed export (one xlsx per id) — backend runs these
  // concurrently and returns each as a base64 buffer + filename (not a direct blob).
  async function exportSelected(ids: number[]) {
    const res = await get<{ buf: string; file_name: string }[]>('/evaluation/export-excel', {
      evaluation_ids: JSON.stringify(ids),
    })
    return res.status === 1 && res.data ? res.data : []
  }

  // Bulk filtered summary export — a single real xlsx blob download (unlike exportSelected).
  async function exportFiltered(params: {
    user_ids?: number[]
    quarter?: number
    year?: number
    branch?: number
    rank?: number
    name?: string
    current_page?: number
  }) {
    const config = useRuntimeConfig()
    const token = useCookie<string | null>('auth_token')
    const base = config.public.apiBase as string
    const query = new URLSearchParams()
    query.set('user_ids', JSON.stringify(params.user_ids ?? []))
    if (params.quarter) query.set('quarter', String(params.quarter))
    if (params.year) query.set('year', String(params.year))
    if (params.branch) query.set('branch', String(params.branch))
    if (params.rank) query.set('rank', String(params.rank))
    if (params.name) query.set('name', params.name)
    query.set('current_page', String(params.current_page ?? 1))
    const res = await fetch(`${base}/evaluation/export-evaluation-list?${query.toString()}`, {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    })
    if (!res.ok) return { ok: false }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'evaluations.xlsx'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    return { ok: true }
  }

  // Self-service only — backend forces user_id/organization_id/status to the
  // caller regardless of what's sent. 406 with an "already exist" message means
  // a form for that quarter/year already exists (see checkExists below).
  async function createEvaluation(payload: { content: EvalContent; quarter: number; year: number }) {
    const res = await post<{ id: number }>('/evaluation/create-evaluation', payload)
    return { ok: res.status === 1, message: res.message, id: res.data?.id }
  }

  async function getEvaluation(evalFormId: number) {
    const res = await post<EvaluationDetail>('/evaluation/get-evaluation', { eval_form_id: evalFormId })
    return res.status === 1 ? res.data : null
  }

  // Owner-or-managed-by-caller-or-GeneralManager gate is enforced backend-side;
  // plain employees may only set status to 1/2/4 (their own draft states).
  async function updateEvaluation(payload: {
    eval_form_id: number
    content: EvalContent
    status: number
    quarter: number
    year: number
  }) {
    const res = await post('/evaluation/update-evaluation', payload)
    return { ok: res.status === 1, message: res.message }
  }

  // Doubles as a getter — on success the backend returns the caller's own full
  // existing form for that quarter/year (not just a boolean).
  async function checkExists(quarter: number, year: number): Promise<EvaluationDetail | null> {
    const res = await post<EvaluationDetail>('/evaluation/check-evaluation-existed', { quarter, year })
    return res.status === 1 && res.data ? res.data : null
  }

  // Copies an existing form's content into a brand-new form for the CURRENT
  // quarter/year (not the source's) — matches backend's DuplicateEvaluationForm.
  async function duplicateEvaluation(evalFormId: number) {
    const res = await post<{ id: number }>('/evaluation/duplicate-evaluation', { eval_form_id: evalFormId })
    return { ok: res.status === 1, message: res.message, id: res.data?.id }
  }

  return {
    evaluations, pagination, branches, ranks, statuses, users, projects, loading, error,
    fetchEvaluations, fetchAllEvaluations, fetchManagedUserIds, deleteEvaluation, exportSelected, exportFiltered,
    createEvaluation, getEvaluation, updateEvaluation, checkExists, duplicateEvaluation,
  }
})
