import { handleApiError } from '~/utils/error-handler'

export function useContract() {
  const { post } = useApi()
  const toast    = useToast()

  /**
   * Create a new contract.
   * Backend: POST /contract/create-contract
   * Field names differ from the generic payload — mapped explicitly here.
   */
  async function createContract(payload: {
    user_id:                 number
    contract_type_id:        number
    labor_contract_number?:  string   // contract number
    insurance_salary?:       number   // insured salary portion
    total_salary?:           string   // total salary (stored as string in backend)
    contract_start_date:     string   // "YYYY-MM-DD"
    contract_end_date?:      string   // "YYYY-MM-DD"
    currency_unit?:          number
    contract_creation_date?: string
    file_content?:           string
    file_name?:              string
  }) {
    try {
      await post('/contract/create-contract', payload)
      toast.success('Đã tạo hợp đồng')
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  /**
   * Delete a contract.
   * Backend: POST /contract/delete-contract  { contract_id }
   * Note: the backend param is `contract_id`, NOT `id`.
   */
  async function deleteContract(contractId: number) {
    try {
      await post('/contract/delete-contract', { contract_id: contractId })
      toast.success('Đã xóa hợp đồng')
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  // NOTE: The backend has no update-contract or terminate-contract endpoint.
  // Contract editing is not currently supported by the API.
  // These stubs are kept so pages that reference them compile without error.

  async function updateContract(_id: number, _payload: Record<string, any>) {
    toast.error('Tính năng cập nhật hợp đồng chưa được hỗ trợ')
  }

  async function terminateContract(_id: number, _reason?: string) {
    toast.error('Tính năng chấm dứt hợp đồng chưa được hỗ trợ')
  }

  return { createContract, updateContract, deleteContract, terminateContract }
}
