import { defineStore } from 'pinia'
import type { Branch } from '~/types'
export const useSettingStore = defineStore('setting', () => {
  const branches = ref<Branch[]>([])
  const jobTitles = ref<any[]>([])
  const technologies = ref<any[]>([])
  const { post } = useApi()
  async function fetchBranches(orgId: number) {
    const res = await post<{ branches: Branch[] }>('/setting/get-branches', { org_id: orgId })
    branches.value = res.data?.branches ?? []
  }
  return { branches, jobTitles, technologies, fetchBranches }
})
