import { defineStore } from 'pinia'
export const useTargetStore = defineStore('target', () => {
  const targets = ref<any[]>([])
  const loading = ref(false)
  const { post } = useApi()
  async function fetchTargets(orgId: number, year: number) {
    loading.value = true
    try {
      const res = await post<{ targets: any[] }>('/target/get-targets', { org_id: orgId, year })
      targets.value = res.data?.targets ?? []
    } finally { loading.value = false }
  }
  return { targets, loading, fetchTargets }
})
