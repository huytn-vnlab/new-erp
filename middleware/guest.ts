/**
 * guest middleware — redirect already-logged-in users away from auth pages.
 * Use on login, registration pages.
 */
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useAuth()
  if (loggedIn.value) {
    return navigateTo('/home-admin')
  }
})
