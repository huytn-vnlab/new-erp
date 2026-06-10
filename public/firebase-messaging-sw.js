// Firebase Messaging Service Worker — handles background push notifications.
// This file MUST stay in /public so it is served at /firebase-messaging-sw.js
// The config values here must match nuxt.config.ts runtimeConfig.public.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

// Config is injected at runtime via the SW registration in plugins/firebase.client.ts.
// We read it from the URL query string that the plugin passes when registering.
// Fallback: hard-code your dev values here so SW works without query-string injection.
const params = new URL(location.href).searchParams

firebase.initializeApp({
  apiKey:            params.get('apiKey')            || '',
  authDomain:        params.get('authDomain')        || '',
  projectId:         params.get('projectId')         || '',
  storageBucket:     params.get('storageBucket')     || '',
  messagingSenderId: params.get('messagingSenderId') || '',
  appId:             params.get('appId')             || '',
})

const messaging = firebase.messaging()

// Background message handler
messaging.onBackgroundMessage((payload) => {
  const { title = 'Micro ERP', body = '' } = payload.notification ?? {}
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data,
  })
})

// Notification click — open or focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const existing = windowClients.find((c) => c.url.includes(self.location.origin) && 'focus' in c)
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
