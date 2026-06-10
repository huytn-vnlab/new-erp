import type { Asset } from '~/types'
import { handleApiError } from '~/utils/error-handler'

export function useAsset() {
  const { post } = useApi()
  const { user } = useAuth()
  const toast    = useToast()

  async function createAsset(payload: {
    name:           string
    code:           string
    category?:      string
    value?:         number
    purchase_date?: string
    status?:        number
    location?:      string
    description?:   string
  }) {
    try {
      const res = await post<{ asset: Asset }>('/asset/create-asset', payload)
      toast.success('Đã thêm tài sản')
      return res.data?.asset ?? null
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function updateAsset(id: number, payload: Record<string, any>) {
    try {
      const res = await post<{ asset: Asset }>('/asset/update-asset', { id, ...payload })
      toast.success('Đã cập nhật tài sản')
      return res.data?.asset ?? null
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  /**
   * Delete an asset.
   * Backend: POST /asset/delete-asset-by-id  { id }
   */
  async function deleteAsset(id: number) {
    try {
      await post('/asset/delete-asset-by-id', { id })
      toast.success('Đã xóa tài sản')
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  /**
   * Submit a borrow request for an asset.
   * Backend: POST /asset/create-user-request-asset
   *   { asset_id, user_id, status, status_req }
   */
  async function requestBorrow(assetId: number, _reason?: string, _returnDate?: string) {
    try {
      await post('/asset/create-user-request-asset', {
        asset_id:   assetId,
        user_id:    user.value?.id,
        status:     1,   // asset status stays in-use
        status_req: 1,   // request status: pending
      })
      toast.success('Đã gửi yêu cầu mượn tài sản')
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  /**
   * Approve an asset borrow request.
   * Backend: POST /asset/edit-user-requests-asset
   *   { id, user_id, asset_id, status }
   */
  async function approveRequest(id: number, userId?: number, assetId?: number) {
    try {
      await post('/asset/edit-user-requests-asset', {
        id,
        user_id:  userId,
        asset_id: assetId,
        status:   2,   // approved
      })
      toast.success('Đã duyệt yêu cầu')
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  /**
   * Reject an asset borrow request.
   * Backend: POST /asset/edit-user-requests-asset
   *   { id, user_id, asset_id, status }
   */
  async function rejectRequest(id: number, userId?: number, assetId?: number) {
    try {
      await post('/asset/edit-user-requests-asset', {
        id,
        user_id:  userId,
        asset_id: assetId,
        status:   3,   // rejected
      })
      toast.success('Đã từ chối yêu cầu')
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  /**
   * Mark an asset as returned.
   * Backend: POST /asset/edit-user-requests-asset  { id, status: 4 }
   */
  async function returnAsset(id: number) {
    try {
      await post('/asset/edit-user-requests-asset', {
        id,
        status: 4,   // returned
      })
      toast.success('Đã cập nhật trả tài sản')
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  return { createAsset, updateAsset, deleteAsset, requestBorrow, approveRequest, rejectRequest, returnAsset }
}
