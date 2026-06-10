/**
 * useAsync — wraps any async function with loading / error / data state.
 *
 * Usage:
 *   const { data, loading, error, execute } = useAsync(() => leaveStore.fetchLeaves())
 *   onMounted(execute)
 */
import { handleApiError } from '~/utils/error-handler'

export const useAsync = <T>(fn: () => Promise<T>) => {
  const data    = ref<T | null>(null)
  const loading = ref(false)
  const error   = ref<string | null>(null)

  const execute = async (): Promise<void> => {
    loading.value = true
    error.value   = null
    try {
      data.value = await fn()
    } catch (err) {
      error.value = handleApiError(err)
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
