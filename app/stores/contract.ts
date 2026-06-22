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

  async function fetchContracts(params: {
    user_name?: string
    contract_type_id?: number
    branch_id?: number
    current_page?: number
  } = {}) {
    loading.value = true
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
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchContractTypes() {
    const res = await post<{ contract_types: ContractType[] }>('/api/contract/get-contract-type-list', {})
    if (res.status === 1 && res.data) contractTypes.value = res.data.contract_types ?? []
  }

  return {
    contracts, contractTypes, pagination, loading,
    fetchContracts, fetchContractTypes,
  }
})
