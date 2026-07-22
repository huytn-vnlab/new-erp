import { defineStore } from 'pinia'
import type { ContractRow, ContractByUserRow, ContractType, Pagination, BranchItem } from '~/types'

const ROW_PER_PAGE = 15 // matches old ERP SPA's hardcoded page size for contract lists

interface ContractListResponse {
  pagination: Pagination
  contract_list: ContractRow[]
}

interface ContractByUserResponse {
  pagination: Pagination
  contract_list: ContractByUserRow[]
}

interface ContractTypeListResponse {
  pagination: Pagination
  contract_types: ContractType[]
}

export interface CreateContractPayload {
  user_id: number
  contract_type_id: number
  contract_start_date: string
  contract_end_date?: string
  insurance_salary?: number
  subsidies_salary?: number
  total_salary?: string
  currency_unit?: number
  labor_contract_number?: string
  contract_creation_date?: string
  // Optional signed-contract attachment — CreateContractParams.ContractContent
  // (base64) / FileName. The backend has no server-side docx-template-merge
  // step; this is a plain file upload for an already-prepared document.
  file_content?: string
  file_name?: string
}

export interface ContractTypeFormPayload {
  name: string
  template_file: string // file name incl. extension
  file_content: string // base64
}

export const useContractStore = defineStore('contract', () => {
  const { post } = useApi()

  const contracts = ref<ContractRow[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: ROW_PER_PAGE })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const contractsByUser = ref<ContractByUserRow[]>([])
  const contractsByUserLoading = ref(false)

  const contractTypes = ref<ContractType[]>([])
  const contractTypePagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: ROW_PER_PAGE })
  const contractTypesLoading = ref(false)

  const branches = ref<BranchItem[]>([])

  // get-contract-type-list (and its mutations) require organization_id in the body —
  // unlike most other endpoints, which derive it from the JWT server-side. auth.user
  // is populated asynchronously by the admin layout, so a cold page load can race it.
  async function resolveOrganizationId(): Promise<number> {
    const auth = useAuth()
    if (!auth.user.value && auth.token.value) await auth.fetchUser()
    return (auth.user.value?.organization_id as number | undefined) ?? 0
  }

  async function fetchContracts(params: {
    user_name?: string
    contract_type_id?: number
    branch_id?: number
    current_page?: number
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await post<ContractListResponse>('/contract/get-contract-current-list', {
        user_name: params.user_name ?? '',
        contract_type_id: params.contract_type_id ?? 0,
        branch_id: params.branch_id ?? 0,
        current_page: params.current_page ?? 1,
        row_per_page: ROW_PER_PAGE,
      })
      if (res.status === 1 && res.data) {
        contracts.value = res.data.contract_list ?? []
        pagination.value = res.data.pagination ?? pagination.value
      } else {
        error.value = res.message || 'Không thể tải dữ liệu hợp đồng.'
      }
    } catch {
      error.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
    } finally {
      loading.value = false
    }
  }

  async function fetchContractsByUser(userId: number) {
    contractsByUserLoading.value = true
    try {
      const res = await post<ContractByUserResponse>('/contract/get-contract-by-user', {
        user_id: userId,
        current_page: 1,
        row_per_page: ROW_PER_PAGE,
      })
      if (res.status === 1 && res.data) contractsByUser.value = res.data.contract_list ?? []
      else contractsByUser.value = []
    } finally {
      contractsByUserLoading.value = false
    }
  }

  async function fetchContractTypes(params: { contract_type_name?: string; current_page?: number } = {}) {
    const organizationId = await resolveOrganizationId()
    contractTypesLoading.value = true
    try {
      const res = await post<ContractTypeListResponse>('/contract/get-contract-type-list', {
        organization_id: organizationId,
        contract_type_name: params.contract_type_name ?? '',
        current_page: params.current_page ?? 1,
        row_per_page: ROW_PER_PAGE,
      })
      if (res.status === 1 && res.data) {
        contractTypes.value = res.data.contract_types ?? []
        contractTypePagination.value = res.data.pagination ?? contractTypePagination.value
      }
    } finally {
      contractTypesLoading.value = false
    }
  }

  async function fetchBranches() {
    try {
      const res = await post<BranchItem[]>('/setting/branch/get-branches', {})
      if (res.status === 1 && Array.isArray(res.data)) branches.value = res.data
    } catch { /* ignore */ }
  }

  async function createContract(payload: CreateContractPayload) {
    const res = await post('/contract/create-contract', payload as unknown as Record<string, unknown>)
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteContract(contractId: number) {
    const res = await post('/contract/delete-contract', { contract_id: contractId })
    return { ok: res.status === 1, message: res.message }
  }

  async function createContractType(payload: ContractTypeFormPayload) {
    const organizationId = await resolveOrganizationId()
    const res = await post('/contract/create-contract-type', {
      contract_type_params: [{
        name: payload.name,
        organization_id: organizationId,
        template_file: payload.template_file,
        file_content: payload.file_content,
      }],
    })
    return { ok: res.status === 1, message: res.message }
  }

  async function editContractType(payload: { contract_type_id: number; name: string; template_file?: string }) {
    const organizationId = await resolveOrganizationId()
    const res = await post('/contract/edit-contract-type', {
      contract_type_id: payload.contract_type_id,
      name: payload.name,
      organization_id: organizationId,
      template_file: payload.template_file ?? '',
    })
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteContractTypes(ids: number[]) {
    const res = await post('/contract/delete-contract-type', { id: ids })
    return { ok: res.status === 1, message: res.message }
  }

  return {
    contracts, pagination, loading, error,
    contractsByUser, contractsByUserLoading,
    contractTypes, contractTypePagination, contractTypesLoading,
    branches,
    fetchContracts, fetchContractsByUser, fetchContractTypes, fetchBranches,
    createContract, deleteContract, createContractType, editContractType, deleteContractTypes,
  }
})
