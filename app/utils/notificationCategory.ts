import type { Component } from 'vue'
import { Calendar, Timer, Folder, Package, UserPlus, Clock, Bell } from 'lucide-vue-next'

export interface NotifCategoryMeta {
  key: string
  labelKey: string
  icon: Component
  bg: string
  fg: string
}

// Mirrors the real notification sources (grepped from micro-erp-api's
// leave/overtime/kanbantask/asset/recruitment/timekeeping pgrepository.go —
// there is no "eval" or generic "system" source today, unlike the design
// prototype's fictional taxonomy), keyed off the same redirect_url prefixes
// `notificationRoute.ts` already maps for legacy-route translation.
const CATEGORY_META: Record<string, NotifCategoryMeta> = {
  leave: { key: 'leave', labelKey: 'notification.category.leave', icon: Calendar, bg: 'hsl(38 92% 95%)', fg: 'hsl(35 90% 42%)' },
  overtime: { key: 'overtime', labelKey: 'notification.category.overtime', icon: Timer, bg: 'hsl(160 60% 94%)', fg: 'hsl(160 60% 34%)' },
  project: { key: 'project', labelKey: 'notification.category.project', icon: Folder, bg: 'hsl(203 89% 95%)', fg: 'hsl(203 89% 42%)' },
  asset: { key: 'asset', labelKey: 'notification.category.asset', icon: Package, bg: 'hsl(262 70% 95%)', fg: 'hsl(262 60% 48%)' },
  recruitment: { key: 'recruitment', labelKey: 'notification.category.recruitment', icon: UserPlus, bg: 'hsl(340 75% 95%)', fg: 'hsl(340 70% 45%)' },
  timekeeping: { key: 'timekeeping', labelKey: 'notification.category.timekeeping', icon: Clock, bg: 'hsl(190 80% 94%)', fg: 'hsl(190 70% 36%)' },
  system: { key: 'system', labelKey: 'notification.category.system', icon: Bell, bg: 'hsl(226 30% 94%)', fg: 'hsl(226 30% 40%)' },
}

const PREFIX_CATEGORY: [RegExp, string][] = [
  [/^\/hrm\/asset\/manage-asset-request/, 'asset'],
  [/^\/workflow\/project-board/, 'project'],
  [/^\/hrm\/leave\//, 'leave'],
  [/^\/request\/manage-overtime/, 'overtime'],
  [/^\/recruitment\//, 'recruitment'],
  [/^\/hrm\/timekeeping\//, 'timekeeping'],
]

export const NOTIF_CATEGORIES = Object.values(CATEGORY_META)

export function categorizeNotification(redirectUrl: string | null | undefined): NotifCategoryMeta {
  const path = redirectUrl?.split('?')[0] ?? ''
  for (const [pattern, key] of PREFIX_CATEGORY) {
    if (pattern.test(path)) return CATEGORY_META[key]!
  }
  return CATEGORY_META.system!
}
