/**
 * utils/permission.ts — role / module permission helpers
 * Stateless — accepts the user object directly so they remain testable.
 */
import type { AuthUser } from '~/types'

/** True if the user has admin access (role_id >= 2, normalized to is_admin by useAuth) */
export const isAdmin = (user: AuthUser | null | undefined): boolean =>
  user?.is_admin === true

/** True if the user's organization has the module enabled */
export const hasModuleAccess = (
  modules: string[],
  moduleName: string,
): boolean => modules.includes(moduleName)

/** True if user is admin or owns the resource (same user_id) */
export const canEdit = (
  user: AuthUser | null | undefined,
  resourceUserId: number,
): boolean => isAdmin(user) || user?.id === resourceUserId

/** Resolve the user's display name (full_name or email fallback) */
export const displayName = (user: AuthUser | null | undefined): string =>
  user?.full_name || user?.email || 'Unknown'
