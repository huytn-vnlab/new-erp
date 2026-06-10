import { defineStore } from 'pinia'
import type { UserProfile } from '~/types'

export const useUserProfileStore = defineStore('userProfile', () => {
  const profile    = ref<UserProfile | null>(null)
  const loading    = ref(false)
  const listItems  = ref<Record<string, any> | null>(null)
  const { post }   = useApi()

  /** Resolve language name from id using listItems.language_list */
  function languageName(id: number | null | undefined): string {
    if (!id || !listItems.value?.language_list) return ''
    return listItems.value.language_list[id.toString()] ?? ''
  }

  /** Resolve language level name from id using listItems.level_language_list */
  function levelLanguageName(id: number | null | undefined): string {
    if (!id || !listItems.value?.level_language_list) return ''
    return listItems.value.level_language_list[id.toString()] ?? ''
  }

  async function fetchProfile(userId: number) {
    loading.value = true
    try {
      const res = await post<any>('/api/user/get-user-info', { user_id: userId })
      if (res.data) {
        const d = res.data
        profile.value = {
          ...d,
          id:        d.user_id ?? d.id,
          user_id:   d.user_id ?? d.id,
          full_name: `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() || d.email,
          phone:     d.phone_number ?? d.phone ?? null,
        } as UserProfile
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchListItems() {
    try {
      const res = await post<any>('/api/user/get-list-item-profile', {})
      if (res.data) listItems.value = res.data
    } catch {
      // non-critical — lookups degrade gracefully
    }
  }

  async function updateProfile(data: Record<string, unknown>) {
    loading.value = true
    try {
      const res = await post<{ profile: UserProfile }>('/api/user/update-profile', data)
      if (res.data?.profile) profile.value = res.data.profile
    } finally {
      loading.value = false
    }
  }

  function resetProfile() {
    profile.value   = null
    listItems.value = null
  }

  return { profile, loading, listItems, fetchProfile, fetchListItems, updateProfile, resetProfile, languageName, levelLanguageName }
})
