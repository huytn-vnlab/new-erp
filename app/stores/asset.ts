import { defineStore } from 'pinia'
import type { AssetRow, AssetType, Pagination } from '~/types'

interface AssetListResponse {
  assets: AssetRow[]
  pagination: Pagination
}

export const useAssetStore = defineStore('asset', () => {
  const { post } = useApi()

  const assets = ref<AssetRow[]>([])
  const assetTypes = ref<AssetType[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAssets(params: {
    asset_name?: string
    asset_code?: string
    branch_id?: number
    user_name?: string
    status?: number
    asset_type_id?: number
    current_page?: number
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await post<AssetListResponse>('/api/asset/get-assets-list', {
        asset_name: params.asset_name ?? '',
        asset_code: params.asset_code ?? '',
        branch_id: params.branch_id ?? null,
        user_name: params.user_name ?? '',
        status: params.status ?? null,
        asset_type_id: params.asset_type_id ?? null,
        current_page: params.current_page ?? 1,
        row_per_page: 20,
      })
      if (res.status === 1 && res.data) {
        assets.value = res.data.assets ?? []
        pagination.value = res.data.pagination ?? pagination.value
      } else {
        error.value = res.message || 'Không thể tải dữ liệu tài sản.'
      }
    } catch {
      error.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
    } finally {
      loading.value = false
    }
  }

  async function fetchAssetTypes() {
    const res = await post<{ asset_types: AssetType[] }>('/api/asset/get-asset-type-list', {})
    if (res.status === 1 && res.data) assetTypes.value = res.data.asset_types ?? []
  }

  async function createAsset(payload: {
    asset_name: string; asset_code: string; asset_type_id: number
    branch_id: number; user_name?: string; status?: number
  }) {
    const res = await post('/api/asset/create-asset', payload)
    return { ok: res.status === 1, message: res.message }
  }

  async function updateAsset(payload: { id: number; asset_name?: string; status?: number; user_name?: string }) {
    const res = await post('/api/asset/update-asset', payload)
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteAsset(id: number) {
    const res = await post('/api/asset/delete-asset-by-id', { id })
    return { ok: res.status === 1, message: res.message }
  }

  return {
    assets, assetTypes, pagination, loading, error,
    fetchAssets, fetchAssetTypes, createAsset, updateAsset, deleteAsset,
  }
})
