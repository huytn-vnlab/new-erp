/**
 * Auth store — thin reactive wrapper so components can watch auth state.
 * The real auth logic lives in composables/useAuth.ts.
 *
 * useCookie / useState refs are null-prototype objects that Pinia cannot
 * SSR-serialize. Wrap them with skipHydrate() so Pinia leaves them alone and
 * lets Nuxt's own cookie/state hydration handle them instead.
 */
import { defineStore, skipHydrate } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const { user, loggedIn, token, login, logout, fetchCurrentUser } = useAuth()

  return {
    user:             skipHydrate(user),
    token:            skipHydrate(token),
    loggedIn,           // computed — serialisable
    login,
    logout,
    fetchCurrentUser,
  }
})
