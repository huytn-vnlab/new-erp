// The backend still generates `redirect_url` values pointing at the legacy
// SPA's route scheme (see micro-erp-api's asset/leave/overtime/recruitment/
// timekeeping/kanbantask pgrepository.go — all hardcode old-SPA paths). This
// maps each known prefix to its new-erp equivalent; query params referencing
// old-SPA-only concepts (e.g. a specific leave-history row id) are dropped
// since the destination page has no matching deep-link target.
const PREFIX_MAP: [RegExp, string][] = [
  [/^\/hrm\/asset\/manage-asset-request/, '/hrm/asset'],
  [/^\/workflow\/project-board/, '/workflow/project'],
  [/^\/hrm\/leave\//, '/hrm/leave'],
  [/^\/request\/manage-overtime/, '/request/overtime'],
  [/^\/recruitment\//, '/recruitment'],
  [/^\/hrm\/timekeeping\//, '/hrm/timekeeping'],
]

export function mapNotificationRoute(oldUrl: string | null | undefined): string | null {
  if (!oldUrl) return null
  const path = oldUrl.split('?')[0] ?? oldUrl
  for (const [pattern, target] of PREFIX_MAP) {
    if (pattern.test(path)) return target
  }
  return null
}
