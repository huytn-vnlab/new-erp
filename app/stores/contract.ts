import { defineStore } from 'pinia'
import type { ContractRow, ContractType, Pagination } from '~/types'

interface ContractListResponse {
  contracts: ContractRow[]
  pagination: Pagination
}

export const useContractStore = defineStore('contract', () => {
  const { post } = useApi()

  const contracts = ref<ContractRow[]>([])
  const contractTypes = ref<ContractType[]>([])
  const pagination = ref<Pagination>({ current_page: 1, total_row: 0, row_per_page: 20 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchContracts(params: {
    user_name?: string
    contract_type_id?: number
    branch_id?: number
    current_page?: number
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await post<ContractListResponse>('/api/contract/get-contract-current-list', {
        user_name: params.user_name ?? '',
        contract_type_id: params.contract_type_id ?? 0,
        branch_id: params.branch_id ?? 0,
        current_page: params.current_page ?? 1,
        row_per_page: 20,
      })
      if (res.status === 1 && res.data) {
        contracts.value = res.data.contracts ?? []
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

  async function fetchContractTypes() {
    const res = await post<{ contract_types: ContractType[] }>('/api/contract/get-contract-type-list', {})
    if (res.status === 1 && res.data) contractTypes.value = res.data.contract_types ?? []
  }

  async function createContract(payload: { user_id: number; contract_type_id: number; start_date: string; end_date: string; note?: string }) {
    const res = await post('/api/contract/create-contract', payload as Record<string, unknown>)
    return { ok: res.status === 1, message: res.message }
  }

  async function deleteContract(contractId: number) {
    const res = await post('/api/contract/delete-contract', { contract_id: contractId })
    return { ok: res.status === 1, message: res.message }
  }

  return {
    contracts, contractTypes, pagination, loading, error,
    fetchContracts, fetchContractTypes, createContract, deleteContract,
  }
})
