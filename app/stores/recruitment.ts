import { defineStore } from 'pinia'
import type { JobRow, CvRow, Pagination } from '~/types'

interface JobListResponse {
  jobs: JobRow[]
  pagination: Pagination
}

interface CvListResponse {
  cvs: CvRow[]
  pagination: Pagination
}

export const useRecruitmentStore = defineStore('recruitment', () => {
  const { post } = useApi()

  const jobs = ref<JobRow[]>([])
  const cvs = ref<CvRow[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const loading = ref(false)

  async function fetchJobs(params: {
    keyword?: string
    status?: number
    current_page?: number
  } = {}) {
    loading.value = true
    try {
      const res = await post<JobListResponse>('/api/recruitment/get-jobs', {
        keyword: params.keyword ?? '',
        status: params.status ?? 0,
        current_page: params.current_page ?? 1,
        row_per_page: 20,
      })
      if (res.status === 1 && res.data) {
        jobs.value = res.data.jobs ?? []
        pagination.value = res.data.pagination ?? pagination.value
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchCvs(params: {
    keyword?: string
    job_id?: number
    status?: number
    current_page?: number
  } = {}) {
    loading.value = true
    try {
      const res = await post<CvListResponse>('/api/recruitment/get-cvs', {
        keyword: params.keyword ?? '',
        job_id: params.job_id ?? 0,
        status: params.status ?? 0,
        current_page: params.current_page ?? 1,
        row_per_page: 20,
      })
      if (res.status === 1 && res.data) {
        cvs.value = res.data.cvs ?? []
        pagination.value = res.data.pagination ?? pagination.value
      }
    } finally {
      loading.value = false
    }
  }

  return {
    jobs, cvs, pagination, loading,
    fetchJobs, fetchCvs,
  }
})
