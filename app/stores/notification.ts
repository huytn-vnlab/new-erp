import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ApiResponse } from '~/types'

export interface NotificationItem {
  id: number
  sender: string
  content: string
  status: number
  redirect_url: string
  created_at: string
  avatar_sender: string | null
}

interface NotificationData {
  notifications: NotificationItem[]
  pagination: { current_page: number; total_row: number; row_per_page: number }
}

export const useNotificationStore = defineStore('notification', () => {
  const api = useApi()
  const auth = useAuth()

  const notifications = ref<NotificationItem[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  // cf.NotificationStatusUnread=1 / Read=2 / Seen=3 on the backend.
  const isUnread = computed(() => (n: NotificationItem) => n.status === 1)

  async function fetchNotifications(page = 1, rowPerPage = 10) {
    const userId = auth.user.value?.id
    if (!userId) return
    loading.value = true
    try {
      const res = await api.post<NotificationData>('/notification/get-notifications', {
        receiver: userId,
        current_page: page,
        row_per_page: rowPerPage,
      })
      if (res.status === 1 && res.data) {
        notifications.value = res.data.notifications ?? []
      }
    } catch { /* ignore */ }
    finally { loading.value = false }
  }

  // Backend parses client_time with cf.FormatDate ("2006-01-02 15:04:05") and
  // panics (crashing the request) on any other shape — the previous
  // dd/mm/yyyy-only value here made every call fail silently via the catch.
  function clientTimeNow(): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).formatToParts(new Date())
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00'
    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
  }

  async function fetchUnreadCount() {
    try {
      const res = await api.post<number>('/notification/get-total-notifications-unread', {
        client_time: clientTimeNow(),
      })
      if (res.status === 1 && res.data !== null) {
        unreadCount.value = res.data as number
      }
    } catch { /* ignore */ }
  }

  async function markAllRead() {
    const userId = auth.user.value?.id
    if (!userId) return
    try {
      await api.post<ApiResponse<null>>('/notification/edit-notification-status-read', {
        receiver: userId,
      })
      // UpdateNotificationStatusRead sets status = cf.NotificationStatusRead (2).
      notifications.value = notifications.value.map(n => ({ ...n, status: 2 }))
      unreadCount.value = 0
    } catch { /* ignore */ }
  }

  async function markOneRead(id: number) {
    const userId = auth.user.value?.id
    if (!userId) return
    const item = notifications.value.find(n => n.id === id)
    if (!item || item.status !== 1) return
    try {
      await api.post<ApiResponse<null>>('/notification/edit-notification-status', {
        id, status: 2, receiver: userId,
      })
      item.status = 2
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch { /* ignore */ }
  }

  return { notifications, unreadCount, loading, isUnread, fetchNotifications, fetchUnreadCount, markAllRead, markOneRead }
})
