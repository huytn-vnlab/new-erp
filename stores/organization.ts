/**
 * organization store. Replaces: store/modules/organization.ts
 */
import { defineStore } from 'pinia'
import type { Organization } from '~/types'

export const useOrganizationStore = defineStore('organization', () => {
  const current = ref<Organization | null>(null)
  const loading = ref(false)

  const { post } = useApi()

  async function fetchOrganization(orgId: number) {
    loading.value = true
    try {
      const res = await post<Organization>('/api/organization/get-organization', { org_id: orgId })
      current.value = res.data ?? null
    } finally {
      loading.value = false
    }
  }

  return { current, loading, fetchOrganization }
})
