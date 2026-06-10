/**
 * notification store — in-app notifications list + unread count.
 * Replaces: store/modules/notifications.ts
 *
 * org_id and user_id are read from useAuth() so callers don't need to pass them.
 */
import { defineStore } from 'pinia'
import type { Notification } from '~/types'

export const useNotificationStore = defineStore('notification', () => {
  const items       = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading     = ref(false)

  const { post } = useApi()

  /** Resolve org/user IDs from the current session — returns null if not logged in. */
  function getIds() {
    const { user } = useAuth()
    const orgId  = user.value?.organization_id ?? 0
    const userId = user.value?.id ?? 0
    return { orgId, userId }
  }

  async function fetchNotifications(page = 1) {
    const { orgId } = getIds()
    if (!orgId) return
    loading.value = true
    try {
      const res = await post<{ notifications: Notification[]; total: number }>(
        '/notification/get-notifications',
        { organization_id: orgId, current_page: page, row_per_page: 10 },
      )
      items.value = res.data?.notifications ?? []
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    const { orgId, userId } = getIds()
    if (!orgId || !userId) return
    const res = await post<{ count: number }>('/notification/count-notifications-unread', {
      organization_id: orgId,
      receiver: userId,
    })
    unreadCount.value = res.data?.count ?? 0
  }

  async function markAllRead() {
    const { orgId, userId } = getIds()
    if (!orgId || !userId) return
    await post('/notification/update-notification-status-read', {
      organization_id: orgId,
      receiver: userId,
    })
    unreadCount.value = 0
    items.value = items.value.map(n => ({ ...n, status: 1 }))
  }

  return { items, unreadCount, loading, fetchNotifications, fetchUnreadCount, markAllRead }
})
