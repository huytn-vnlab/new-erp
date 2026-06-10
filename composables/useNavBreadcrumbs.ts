/**
 * Auto-generates breadcrumbs from the current route by matching against
 * the same nav structure used in AppSidebar.
 */
export function useNavBreadcrumbs() {
  const route = useRoute()
  const { t } = useI18n()

  type Crumb = { label: string; to?: string }

  // Flat map: route prefix → [parent label, child label]
  // Must be ordered longest-prefix first so more specific paths match first.
  const routeMap: { prefix: string; crumbs: Crumb[] }[] = [
    // Overview
    { prefix: '/home-admin', crumbs: [{ label: () => t('nav.section.overview') }, { label: () => t('nav.dashboard') }] },

    // HRM children
    { prefix: '/hrm/member',      crumbs: [{ label: () => t('nav.hrm'), to: '#' }, { label: () => t('nav.manageMember') }] },
    { prefix: '/hrm/leave',       crumbs: [{ label: () => t('nav.hrm'), to: '#' }, { label: () => t('nav.leave') }] },
    { prefix: '/hrm/asset',       crumbs: [{ label: () => t('nav.hrm'), to: '#' }, { label: () => t('nav.assets') }] },
    { prefix: '/hrm/contract',    crumbs: [{ label: () => t('nav.hrm'), to: '#' }, { label: () => t('nav.contract') }] },
    { prefix: '/hrm/timekeeping', crumbs: [{ label: () => t('nav.hrm'), to: '#' }, { label: () => t('nav.timekeeping') }] },

    // Evaluation
    { prefix: '/evaluation', crumbs: [{ label: () => t('nav.evaluation') }] },

    // Workflow
    { prefix: '/workflow', crumbs: [{ label: () => t('nav.workflow'), to: '#' }, { label: () => t('nav.project') }] },

    // Recruitment
    { prefix: '/recruitment', crumbs: [{ label: () => t('nav.recruitment'), to: '#' }, { label: () => t('nav.manageRecruitment') }] },

    // Request
    { prefix: '/request', crumbs: [{ label: () => t('nav.request'), to: '#' }, { label: () => t('nav.overtime') }] },

    // Settings
    { prefix: '/settings', crumbs: [{ label: () => t('nav.setting') }] },

    // Profile
    { prefix: '/profile', crumbs: [{ label: () => t('nav.section.overview') }, { label: () => t('common.profile') || 'Hồ sơ' }] },
  ]

  const breadcrumbs = computed((): Crumb[] => {
    const path = route.path
    const match = routeMap.find(r => path === r.prefix || path.startsWith(r.prefix + '/'))
    if (!match) return [{ label: path }]
    return match.crumbs.map(c => ({
      label: typeof c.label === 'function' ? (c.label as () => string)() : c.label,
      to: c.to,
    }))
  })

  return { breadcrumbs }
}
