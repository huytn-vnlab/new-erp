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

  const isUnread = computed(() => (n: NotificationItem) => n.status === 0)

  async function fetchNotifications(page = 1) {
    const userId = auth.user.value?.id
    if (!userId) return
    loading.value = true
    try {
      const res = await api.post<NotificationData>('/api/notification/get-notifications', {
        receiver: userId,
        current_page: page,
        row_per_page: 10,
      })
      if (res.status === 1 && res.data) {
        notifications.value = res.data.notifications ?? []
      }
    } catch { /* ignore */ }
    finally { loading.value = false }
  }

  async function fetchUnreadCount() {
    const loc = 'Asia/Ho_Chi_Minh'
    const clientTime = new Date().toLocaleDateString('vi-VN', {
      timeZone: loc, day: '2-digit', month: '2-digit', year: 'numeric',
    }).replace(/\//g, '/')
    try {
      const res = await api.post<number>('/api/notification/get-total-notifications-unread', {
        client_time: clientTime,
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
      await api.post<ApiResponse<null>>('/api/notification/edit-notification-status-read', {
        receiver: userId,
      })
      notifications.value = notifications.value.map(n => ({ ...n, status: 1 }))
      unreadCount.value = 0
    } catch { /* ignore */ }
  }

  return { notifications, unreadCount, loading, isUnread, fetchNotifications, fetchUnreadCount, markAllRead }
})
