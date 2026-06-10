import { defineStore } from 'pinia'
import type { BackendPage } from '~/types'
export const useContractStore = defineStore('contract', () => {
  const contracts = ref<any[]>([])
  const loading   = ref(false)
  const pagination = ref<BackendPage>({ current_page: 1, total_row: 0, row_per_page: 10 })
  const { post } = useApi()

  async function fetchContracts(page = 1) {
    loading.value = true
    try {
      const res = await post<{ contract_list: any[]; pagination: BackendPage }>('/contract/get-contract-current-list', { current_page: page, row_per_page: 10 })
      // Normalize API field names to what the page template expects
      contracts.value = (res.data?.contract_list ?? []).map((c: any) => ({
        ...c,
        employee_name:  `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim(),
        contract_type:  c.contract_type_name,
        start_date:     c.contract_start_date,
        end_date:       c.contract_end_date,
        // Derive status: no end_date → active (1), past end_date → expired (2), future start → pending (0)
        status: !c.contract_end_date
          ? 1
          : new Date(c.contract_end_date) < new Date() ? 2 : 1,
      }))
      pagination.value = res.data?.pagination ?? pagination.value
    } finally { loading.value = false }
  }

  return { contracts, loading, pagination, fetchContracts }
})
