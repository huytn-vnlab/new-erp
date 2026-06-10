import type { UserProfile } from '~/types'
import { useUserProfileStore } from '~/stores/user-profile'
import { handleApiError } from '~/utils/error-handler'

export const useUserProfile = () => {
  const store  = useUserProfileStore()
  const toast  = useToast()
  const { post } = useApi()

  async function loadProfile(userId: number) {
    try {
      await store.fetchProfile(userId)
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function saveProfile(data: Record<string, any>) {
    try {
      await store.updateProfile(data)
      toast.success('Cập nhật hồ sơ thành công')
    } catch (err) {
      toast.error(handleApiError(err))
      throw err
    }
  }

  async function fetchMemberList(params: Record<string, any> = {}) {
    try {
      const res = await post<any>('/api/user/search-user-profile', {
        name:         '',
        email:        '',
        date_from:    null,
        date_to:      null,
        rank:         0,
        branch:       0,
        status:       0,
        job_title:    0,
        current_page: 1,
        ...params,
      })
      return res.data ?? null
    } catch {
      return null
    }
  }

  async function fetchProfileSelectBoxData() {
    try {
      const res = await post<any>('/api/user/get-list-item-profile', {})
      return res.data ?? null
    } catch {
      return null
    }
  }

  return { ...store, loadProfile, saveProfile, fetchMemberList, fetchProfileSelectBoxData }
}
