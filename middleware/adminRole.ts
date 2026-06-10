/**
 * adminRole middleware — restricts access to admin-only pages.
 * Replaces: middleware/AdminRole.ts (Nuxt 2)
 */
export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()
  // role_id === 1 is admin in the existing system
  // role: 0 = employee · 1 = admin · 2 = super-admin
  if (!user.value || !user.value.is_admin) {
    return navigateTo('/403')
  }
})
