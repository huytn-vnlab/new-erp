import { initializeApp } from 'firebase/app'
import { getMessaging, onMessage, getToken } from 'firebase/messaging'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
  }

  // Skip if config is missing (local dev without Firebase credentials)
  if (!firebaseConfig.apiKey) return

  const app = initializeApp(firebaseConfig)
  const messaging = getMessaging(app)

  // Listen for foreground messages
  onMessage(messaging, (payload) => {
    console.info('[FCM] foreground message:', payload)
    // TODO: dispatch to notification store
  })

  return {
    provide: {
      firebase: app,
      messaging,
      getFcmToken: () =>
        getToken(messaging, {
          vapidKey: config.public.firebaseMessagingSenderId,
        }),
    },
  }
})
