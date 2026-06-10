// Firebase Cloud Messaging notification composable
// Registration and foreground message handling is done here;
// background handler is in public/firebase-messaging-sw.js

import type { Notification as AppNotification } from '~/types'

export function useNotification() {
  const { post } = useApi()
  const { user } = useAuth()

  const fcmToken          = ref<string | null>(null)
  const notificationCount = useState<number>('notification_count', () => 0)

  /** Register the FCM token with the backend */
  async function registerFcmToken(token: string) {
    if (!user.value?.id) return
    try {
      await post('/notification/create-fcm-token', {
        user_id: user.value.id,
        token,
      })
      fcmToken.value = token
    } catch {
      // Silently fail — notifications are non-critical
    }
  }

  /** Fetch unread notification count */
  async function fetchUnreadCount() {
    if (!user.value?.id) return
    try {
      // Backend expects client_time as "YYYY-MM-DD HH:mm:ss"
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const client_time = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      const res = await post<number>('/notification/get-total-notifications-unread', {
        client_time,
      })
      notificationCount.value = (res.data as unknown as number) ?? 0
    } catch { /* silent */ }
  }

  /** Fetch paginated notification list */
  async function fetchNotifications(page = 1, limit = 20): Promise<AppNotification[]> {
    if (!user.value?.id) return []
    try {
      const res = await post<{
        notifications: AppNotification[]
        pagination?: { current_page: number; total_row: number; row_per_page: number }
      }>('/notification/get-notifications', {
        receiver:     user.value.id,
        current_page: page,
        row_per_page: limit,
      })
      return res.data?.notifications ?? []
    } catch { return [] }
  }

  /** Fetch event reminders (birthdays, join dates, contracts) */
  async function fetchEventReminders() {
    try {
      const res = await post<any>('/notification/notification-event-remind', {})
      return res.data
    } catch {
      return null
    }
  }

  /** Mark a single notification as read (status → 2) */
  async function markAsRead(notificationId: number) {
    if (!user.value?.id) return
    try {
      await post('/notification/edit-notification-status', {
        id:       notificationId,
        status:   2,            // 1=Unread · 2=Read · 3=Seen
        receiver: user.value.id,
      })
      if (notificationCount.value > 0) notificationCount.value--
    } catch { /* silent */ }
  }

  /** Mark all notifications as read for the current user */
  async function markAllRead() {
    if (!user.value?.id) return
    try {
      await post('/notification/edit-notification-status-read', {
        receiver: user.value.id,
      })
      notificationCount.value = 0
    } catch { /* silent */ }
  }

  /** Initialize FCM — request permission and get token */
  async function initFcm() {
    if (typeof window === 'undefined') return
    try {
      const { initializeApp, getApps } = await import('firebase/app')
      const { getMessaging, getToken, onMessage } = await import('firebase/messaging')

      const firebaseConfig = useRuntimeConfig().public.firebase as Record<string, string>
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
      const messaging = getMessaging(app)

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const vapidKey = useRuntimeConfig().public.vapidKey as string
      const token = await getToken(messaging, { vapidKey })
      if (token) await registerFcmToken(token)

      // Handle foreground messages
      onMessage(messaging, (payload) => {
        notificationCount.value++
        // Show a native browser notification as fallback
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title ?? 'Thông báo mới', {
            body: payload.notification?.body ?? '',
            icon: '/logo.svg',
          })
        }
      })
    } catch {
      // FCM setup is best-effort
    }
  }

  return {
    fcmToken,
    notificationCount,
    initFcm,
    registerFcmToken,
    fetchUnreadCount,
    fetchNotifications,
    fetchEventReminders,
    markAsRead,
    markAllRead,
  }
}
