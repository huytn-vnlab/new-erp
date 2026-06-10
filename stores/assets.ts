import { defineStore } from 'pinia'
import type { Asset, BackendPage } from '~/types'
export const useAssetsStore = defineStore('assets', () => {
  const assets   = ref<any[]>([])
  const users    = ref<Record<number, string>>({})
  const loading  = ref(false)
  const pagination = ref<BackendPage>({ current_page: 1, total_row: 0, row_per_page: 10 })
  const { post } = useApi()

  async function fetchAssets(page = 1) {
    loading.value = true
    try {
      const res = await post<{ asset_list: Asset[]; pagination: BackendPage; users: Record<number, string> }>('/asset/get-assets-list', { current_page: page, row_per_page: 10 })
      assets.value     = res.data?.asset_list ?? []
      pagination.value = res.data?.pagination ?? pagination.value
      if (res.data?.users) users.value = res.data.users
    } finally { loading.value = false }
  }
  return { assets, users, loading, pagination, fetchAssets }
})
