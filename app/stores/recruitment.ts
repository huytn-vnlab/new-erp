import { defineStore } from 'pinia'
import type { CvDetail, CvRow, CvStatusLog, DetailedJob, JobDetail, JobRow, Pagination } from '~/types'

interface JobStats { total: number; active: number; done: number; total_cvs: number }

interface JobListResponse {
  recruitments: JobRow[]
  branches: Record<string, string>
  users: Record<string, string>
  pagination: Pagination
  // Both computed server-side (org-wide COUNTs / a single grouped query) —
  // replaces what used to be a client-side fetch-1000-rows-and-count pass
  // plus an N+1 fan-out of one get-cvs call per job.
  stats: JobStats
  cv_counts: Record<string, number>
}

interface JobDetailResponse {
  recruitment: JobDetail
  branches: Record<string, string>
  users: Record<string, string>
}

interface CvListResponse {
  cvs: CvRow[]
  pagination: Pagination
}

export const useRecruitmentStore = defineStore('recruitment', () => {
  const { post } = useApi()

  const jobs = ref<JobRow[]>([])
  // id→name maps bundled with get-jobs/get-job — reused as the source for the
  // branch/assignee pickers instead of a separate settings fetch.
  const branches = ref<Record<string, string>>({})
  const users = ref<Record<string, string>>({})
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const loading = ref(false)
  const error = ref<string | null>(null)
  // Org-wide (unfiltered) job counts and per-job applicant counts — both come
  // bundled with get-jobs now, computed server-side in a couple of cheap
  // COUNT queries. Previously the MiniStat cards required a second call
  // fetching up to 1000 full job rows just to count them, plus an N+1 fan-out
  // of one get-cvs call per job just to read back its applicant count.
  const stats = ref<JobStats>({ total: 0, active: 0, done: 0, total_cvs: 0 })
  const jobCvCounts = ref<Record<string, number>>({})

  async function fetchJobs(params: {
    keyword?: string
    status?: number
    branch_id?: number
    current_page?: number
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await post<JobListResponse>('/recruitment/get-jobs', {
        job_name: params.keyword ?? '',
        job_status: params.status ?? 0,
        branch_id: params.branch_id ?? 0,
        current_page: params.current_page ?? 1,
        row_per_page: 20,
      })
      if (res.status === 1 && res.data) {
        jobs.value = res.data.recruitments ?? []
        branches.value = res.data.branches ?? {}
        users.value = res.data.users ?? {}
        pagination.value = res.data.pagination ?? pagination.value
        stats.value = res.data.stats ?? stats.value
        jobCvCounts.value = { ...jobCvCounts.value, ...res.data.cv_counts }
      } else {
        error.value = res.message || 'Không thể tải danh sách tin tuyển dụng.'
      }
    } catch {
      error.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
    } finally {
      loading.value = false
    }
  }

  async function getJob(id: number): Promise<JobDetail | null> {
    try {
      const res = await post<JobDetailResponse>('/recruitment/get-job', { id })
      if (res.status === 1 && res.data) {
        branches.value = { ...branches.value, ...res.data.branches }
        users.value = { ...users.value, ...res.data.users }
        return res.data.recruitment
      }
      return null
    } catch {
      return null
    }
  }

  async function getDetailJob(recruitmentId: number): Promise<DetailedJob | null> {
    try {
      const res = await post<{ detail_job: DetailedJob | null }>('/recruitment/get-detail-job', { recruitment_id: recruitmentId })
      return res.status === 1 && res.data ? res.data.detail_job : null
    } catch {
      return null
    }
  }

  async function createJob(payload: { job_name: string; start_date: string; expiry_date: string; branch_ids: number[]; assignees: number[] }) {
    const res = await post<{ id: number }>('/recruitment/create-job', payload)
    return { ok: res.status === 1, message: res.message, id: res.data?.id }
  }

  async function editJob(payload: { id: number; job_name: string; start_date: string; expiry_date: string; branch_ids: number[]; assignees: number[] }) {
    const res = await post('/recruitment/edit-job', payload)
    return { ok: res.status === 1, message: res.message }
  }

  async function removeJob(id: number) {
    const res = await post('/recruitment/remove-job', { id })
    return { ok: res.status === 1, message: res.message }
  }

  type DetailJobPayload = {
    amount: number
    address: string[]
    place: string[]
    role: number
    gender: number
    type_of_work: number
    experience: number
    salary_type: number
    salary_from: number
    salary_to: number
    profile_recipients: string
    email: string
    phone_number: string
    description: string
  }

  async function createDetailJob(recruitmentId: number, payload: DetailJobPayload) {
    const res = await post('/recruitment/create-detail-job', { recruitment_id: recruitmentId, ...payload })
    return { ok: res.status === 1, message: res.message }
  }

  async function updateDetailJob(detailJobId: number, payload: DetailJobPayload) {
    const res = await post('/recruitment/update-detail-job', { id: detailJobId, ...payload })
    return { ok: res.status === 1, message: res.message }
  }

  // ── CVs — always scoped to one job; the backend has no cross-job CV list. ──
  const cvs = ref<CvRow[]>([])
  const cvsPagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const cvsLoading = ref(false)
  const cvsError = ref<string | null>(null)

  async function fetchCvs(params: { recruitment_id: number; keyword?: string; status?: number; current_page?: number }) {
    cvsLoading.value = true
    cvsError.value = null
    try {
      const res = await post<CvListResponse>('/recruitment/get-cvs', {
        recruitment_id: params.recruitment_id,
        name_applicant: params.keyword ?? '',
        status: params.status ?? 0,
        current_page: params.current_page ?? 1,
        row_per_page: 20,
      })
      if (res.status === 1 && res.data) {
        cvs.value = res.data.cvs ?? []
        cvsPagination.value = res.data.pagination ?? cvsPagination.value
      } else {
        cvsError.value = res.message || 'Không thể tải danh sách ứng viên.'
      }
    } catch {
      cvsError.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
    } finally {
      cvsLoading.value = false
    }
  }

  async function getCvById(id: number): Promise<CvDetail | null> {
    try {
      const res = await post<CvDetail>('/recruitment/get-cv-by-id', { id })
      return res.status === 1 && res.data ? res.data : null
    } catch {
      return null
    }
  }

  type CvPayload = {
    recruitment_id: number
    full_name: string
    phone_number: string
    email: string
    salary: string
    date_receipt_cv: string
    interview_method: number
    contact_link: string
    media_id: number
    media_id_other: string
    file_name: string
    file_content: string
    assignees: number[]
  }

  async function createCv(payload: CvPayload) {
    const res = await post('/recruitment/create-cv', payload)
    return { ok: res.status === 1, message: res.message }
  }

  async function updateCv(payload: Omit<CvPayload, 'assignees'> & { id: number; file_name?: string; file_content?: string }) {
    const res = await post('/recruitment/update-cv', payload)
    return { ok: res.status === 1, message: res.message }
  }

  async function removeCv(id: number) {
    const res = await post('/recruitment/remove-cv', { id })
    return { ok: res.status === 1, message: res.message }
  }

  // Appends to the CV's status history (log_cv_states) and, as a backend side
  // effect, also overwrites the CV's current status_cv — one call updates both.
  async function createLogCvStatus(payload: { cv_id: number; status: number; recruitment_id: number; assignees: number[] }) {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const updateDay = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    const res = await post('/recruitment/create-log-cv-status', { ...payload, update_day: updateDay })
    return { ok: res.status === 1, message: res.message }
  }

  async function getLogsCvStatus(cvId: number): Promise<CvStatusLog[]> {
    try {
      const res = await post<CvStatusLog[]>('/recruitment/get-logs-cv-status', { cv_id: cvId })
      return res.status === 1 && res.data ? res.data : []
    } catch {
      return []
    }
  }

  return {
    jobs, branches, users, pagination, loading, error, stats, jobCvCounts,
    fetchJobs, getJob, getDetailJob, createJob, editJob, removeJob,
    createDetailJob, updateDetailJob,
    cvs, cvsPagination, cvsLoading, cvsError,
    fetchCvs, getCvById, createCv, updateCv, removeCv, createLogCvStatus, getLogsCvStatus,
  }
})
