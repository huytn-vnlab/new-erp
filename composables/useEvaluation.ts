import type { Evaluation } from '~/types'
import { handleApiError } from '~/utils/error-handler'

export function useEvaluation() {
  const { post } = useApi()
  const toast    = useToast()

  async function createEvaluation(payload: {
    user_id:     number
    period:      string
    year:        number
    quarter?:    number
    scores:      Record<string, number>
    total_score: number
    comment?:    string
    status:      number
  }) {
    try {
      const res = await post<{ evaluation: Evaluation }>('/evaluation/create-evaluation', payload)
      if (payload.status === 1) toast.success('Đã tạo phiếu đánh giá')
      else toast.success('Đã lưu nháp')
      return res.data?.evaluation ?? null
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function updateEvaluation(id: number, payload: Partial<{
    period:      string
    year:        number
    quarter:     number
    scores:      Record<string, number>
    total_score: number
    comment:     string
  }>) {
    try {
      const res = await post<{ evaluation: Evaluation }>('/evaluation/update-evaluation', { id, ...payload })
      toast.success('Đã cập nhật phiếu đánh giá')
      return res.data?.evaluation ?? null
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function deleteEvaluation(id: number) {
    try {
      await post('/evaluation/delete-evaluation', { id })
      toast.success('Đã xóa phiếu đánh giá')
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function getEvaluationDetail(id: number) {
    const res = await post<{ evaluation: Evaluation }>('/evaluation/get-evaluation-detail', { id })
    return res.data?.evaluation ?? null
  }

  return { createEvaluation, updateEvaluation, deleteEvaluation, getEvaluationDetail }
}
