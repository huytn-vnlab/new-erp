import { defineStore } from 'pinia'
import type { Holiday } from '~/types'
export const useHolidayStore = defineStore('holiday', () => {
  const holidays = ref<Holiday[]>([])
  const { post } = useApi()
  async function fetchHolidays(orgId: number, year: number) {
    const res = await post<{ holidays: Holiday[] }>('/holiday/get-holidays', { org_id: orgId, year })
    holidays.value = res.data?.holidays ?? []
  }
  return { holidays, fetchHolidays }
})
