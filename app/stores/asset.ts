import { defineStore } from 'pinia'
import type { AssetRow, AssetType, AssetRequestRow, AssetLogRow, Pagination } from '~/types'

const ROW_PER_PAGE = 15 // matches old ERP SPA's hardcoded page size for asset lists

interface AssetListResponse {
  asset_list: AssetRow[] | null
  pagination: Pagination
  users: Record<string, string>
  branches: Record<string, string>
  asset_status: Record<string, string>
  asset_request_status: Record<string, string>
}

interface AssetRequestListResponse {
  asset_requests: AssetRequestRow[] | null
  pagination: Pagination
  users: Record<string, string>
  branches: Record<string, string>
}

interface AssetLogListResponse {
  asset_histories: AssetLogRow[] | null
  pagination: Pagination
  users: Record<string, string>
  branches: Record<string, string>
}

export interface AssetFormPayload {
  asset_name: string; asset_code: string; asset_type_id: number
  branch_id: number; managed_by: number; status: number
  user_id?: number; description?: string; purchase_price?: number
  date_of_purchase?: string; license_end_date?: string; date_started_use?: string
  depreciation_period?: number
}

export const useAssetStore = defineStore('asset', () => {
  const { post } = useApi()

  const assets = ref<AssetRow[]>([])
  const assetTypes = ref<AssetType[]>([])
  const users = ref<Record<string, string>>({})
  const branches = ref<Record<string, string>>({})
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: ROW_PER_PAGE })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Separate state for "my assets" so it doesn't clobber the "all assets" list/pagination
  // when both tabs hit the same /get-assets-list endpoint.
  const mineAssets = ref<AssetRow[]>([])
  const minePagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: ROW_PER_PAGE })
  const mineLoading = ref(false)

  const requests = ref<AssetRequestRow[]>([])
  const requestUsers = ref<Record<string, string>>({})
  const requestPagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: ROW_PER_PAGE })
  const requestsLoading = ref(false)

  const assetLogs = ref<AssetLogRow[]>([])
  const assetLogPagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: ROW_PER_PAGE })
  const assetLogsLoading = ref(false)

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
      const res = await post<AssetListResponse>('/asset/get-assets-list', {
        asset_name: params.asset_name ?? '',
        asset_code: params.asset_code ?? '',
        branch_id: params.branch_id ?? null,
        user_name: params.user_name ?? '',
        status: params.status ?? null,
        asset_type_id: params.asset_type_id ?? null,
        current_page: params.current_page ?? 1,
        row_per_page: ROW_PER_PAGE,
      })
      if (res.status === 1 && res.data) {
        assets.value = res.data.asset_list ?? []
        pagination.value = res.data.pagination ?? pagination.value
        users.value = { ...users.value, ...(res.data.users ?? {}) }
        branches.value = { ...branches.value, ...(res.data.branches ?? {}) }
      } else {
        error.value = res.message || 'Không thể tải dữ liệu tài sản.'
      }
    } catch {
      error.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
    } finally {
      loading.value = false
    }
  }

  async function fetchMineAssets(params: {
    user_name?: string
    current_page?: number
  } = {}) {
    mineLoading.value = true
    try {
      const res = await post<AssetListResponse>('/asset/get-assets-list', {
        asset_name: '',
        asset_code: '',
        branch_id: null,
        user_name: params.user_name ?? '',
        status: null,
        asset_type_id: null,
        current_page: params.current_page ?? 1,
        row_per_page: ROW_PER_PAGE,
      })
      if (res.status === 1 && res.data) {
        mineAssets.value = res.data.asset_list ?? []
        minePagination.value = res.data.pagination ?? minePagination.value
        users.value = { ...users.value, ...(res.data.users ?? {}) }
        branches.value = { ...branches.value, ...(res.data.branches ?? {}) }
      }
    } finally {
      mineLoading.value = false
    }
  }

  async function fetchAssetTypes() {
    const res = await post<AssetType[]>('/asset/get-asset-type-list', {})
    if (res.status === 1 && res.data) assetTypes.value = res.data
  }

  async function fetchAssetRequests(params: {
    asset_type?: number
    branch_id?: number
    user_name?: string
    current_page?: number
  } = {}) {
    requestsLoading.value = true
    try {
      const res = await post<AssetRequestListResponse>('/asset/get-user-requests-asset', {
        asset_type: params.asset_type ?? 0,
        branch_id: params.branch_id ?? 0,
        user_name: params.user_name ?? '',
        current_page: params.current_page ?? 1,
        row_per_page: ROW_PER_PAGE,
      })
      if (res.status === 1 && res.data) {
        requests.value = res.data.asset_requests ?? []
        requestPagination.value = res.data.pagination ?? requestPagination.value
        requestUsers.value = res.data.users ?? {}
      }
    } finally {
      requestsLoading.value = false
    }
  }

  async function fetchAssetLogs(params: {
    asset_name?: string
    asset_code?: string
    asset_type_id?: number
    branch_id?: number
    user_name?: string
    current_page?: number
  } = {}) {
    assetLogsLoading.value = true
    try {
      const res = await post<AssetLogListResponse>('/asset/get-assets-log', {
        asset_name: params.asset_name ?? '',
        asset_code: params.asset_code ?? '',
        asset_type_id: params.asset_type_id ?? 0,
        branch_id: params.branch_id ?? 0,
        user_name: params.user_name ?? '',
        current_page: params.current_page ?? 1,
        row_per_page: ROW_PER_PAGE,
      })
      if (res.status === 1 && res.data) {
        assetLogs.value = res.data.asset_histories ?? []
        assetLogPagination.value = res.data.pagination ?? assetLogPagination.value
        // Same org-wide user/branch maps as the other asset endpoints — merge in
        // rather than overwrite so switching tabs doesn't blank out either cache.
        users.value = { ...users.value, ...(res.data.users ?? {}) }
        branches.value = { ...branches.value, ...(res.data.branches ?? {}) }
      }
    } finally {
      assetLogsLoading.value = false
    }
  }

  async function createAsset(payload: AssetFormPayload) {
    const res = await post('/asset/create-asset', { ...payload })
    return { ok: res.status === 1, message: res.message }
  }

  async function updateAsset(payload: AssetFormPayload & { id: number }) {
    const res = await post('/asset/update-asset', { ...payload })
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteAsset(id: number) {
    const res = await post('/asset/delete-asset-by-id', { id })
    return { ok: res.status === 1, message: res.message }
  }

  // cf.AcceptRequestBorrowAsset=1 / DenyRequestBorrow=5 — the only two request
  // states reachable from this UI (only borrow requests can be created here;
  // there's no "request return" flow yet). Accept flips the asset to In Use
  // (status 2) and assigns the requester; Deny deletes the pending row and
  // leaves the asset's own status untouched (server no-ops back to Free).
  async function editAssetRequest(payload: { id: number; user_id: number; asset_id: number; status: 1 | 5 }) {
    const res = await post('/asset/edit-user-requests-asset', payload)
    return { ok: res.status === 1, message: res.message }
  }

  async function createAssetRequest(payload: { asset_id: number; user_id: number }) {
    // `status` here is NOT a no-op field — the backend applies it directly to the
    // target asset's own status column as an immediate side effect of the request
    // (see AssetController.CreateRequestAsset -> UpdateAssetUser). Only assets
    // already Free (1) are offered as requestable, so re-asserting Free here is a
    // no-op against the asset's real state rather than corrupting it. `status_req`
    // (3 = Pending, per cf.RequestAssetStatus) is the request's own approval state.
    const res = await post('/asset/create-user-request-asset', {
      asset_id: payload.asset_id,
      user_id: payload.user_id,
      status: 1,
      status_req: 3,
    })
    return { ok: res.status === 1, message: res.message }
  }

  return {
    assets, assetTypes, users, branches, pagination, loading, error,
    mineAssets, minePagination, mineLoading,
    requests, requestUsers, requestPagination, requestsLoading,
    assetLogs, assetLogPagination, assetLogsLoading,
    fetchAssets, fetchMineAssets, fetchAssetTypes, fetchAssetRequests, fetchAssetLogs,
    createAsset, updateAsset, deleteAsset, createAssetRequest, editAssetRequest,
  }
})
