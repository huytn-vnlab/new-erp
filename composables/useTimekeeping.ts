import { useTimekeepingStore } from '~/stores/timekeeping'
import { handleApiError } from '~/utils/error-handler'

export const useTimekeeping = () => {
  const store  = useTimekeepingStore()
  const toast  = useToast()

  async function doCheckIn() {
    try {
      await store.checkIn()
      toast.success('Chấm công vào thành công')
      await store.fetchToday()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function doCheckOut() {
    try {
      await store.checkOut()
      toast.success('Chấm công ra thành công')
      await store.fetchToday()
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  return {
    ...store,
    doCheckIn,
    doCheckOut,
  }
}
