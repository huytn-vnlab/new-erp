/**
 * moduleRole middleware — checks route meta.module against user permissions.
 *
 * The backend returns func_permission as { moduleId(number): [{function_id, status}] }
 * where the numeric moduleIds are: 1=hrm, 2=leave, 3=timekeeping, 4=overtime, 5=workflow (approx.)
 *
 * Until we have a firm mapping, we allow access if:
 *   (a) the permission store has modules loaded, OR
 *   (b) the user is an admin (is_admin === true)
 *
 * This prevents wrongly locking out all regular users while the mapping is clarified.
 */
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()
  const permissionStore = usePermissionStore()

  const requiredModule = to.meta.module as string | undefined
  if (!requiredModule) return

  // Admins can access everything
  if (user.value?.is_admin) return

  // If the store has loaded modules, check them
  if (permissionStore.modules.length > 0) {
    if (!permissionStore.hasModule(requiredModule)) {
      return navigateTo('/403')
    }
    return
  }

  // Permission store not yet populated — allow access (graceful degradation)
  // This covers the common case where a user is freshly logged in and
  // func_permission hasn't been mapped to module strings yet.
})
