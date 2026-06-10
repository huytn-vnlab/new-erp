/**
 * auth middleware — redirect unauthenticated users to login.
 * Replaces: middleware/auth.js (Nuxt 2 @nuxtjs/auth global middleware)
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, token, fetchCurrentUser, user } = useAuth()

  // Restore user if token exists but state is empty (e.g. SSR mismatch)
  if (token.value && !user.value) {
    await fetchCurrentUser()
  }

  if (!loggedIn.value) {
    return navigateTo(`/user/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
