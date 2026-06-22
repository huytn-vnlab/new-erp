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
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchAssetTypes() {
    const res = await post<{ asset_types: AssetType[] }>('/api/asset/get-asset-type-list', {})
    if (res.status === 1 && res.data) assetTypes.value = res.data.asset_types ?? []
  }

  return {
    assets, assetTypes, pagination, loading,
    fetchAssets, fetchAssetTypes,
  }
})
