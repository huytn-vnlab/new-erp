const CONTENT_KEY_MAP: Record<string, string> = {
  'has just created a leave request':    'notification.content.createLeave',
  'has just created a overtime request': 'notification.content.createOT',
  'has just accepted a overtime request':'notification.content.acceptOT',
  'has just rejected a overtime request':'notification.content.rejectOT',
  'Your request for leave has been accepted': 'notification.content.acceptLeave',
  'Your request for leave has been denied':   'notification.content.rejectLeave',
  'has just created a new project':      'notification.content.createProject',
}

export function useNotification() {
  const { t } = useI18n()

  function translateContent(content: string): string {
    const key = CONTENT_KEY_MAP[content]
    return key ? t(key) : content
  }

  // Calendar-day bucketing (not a rolling 24h window) — an item from
  // "yesterday" still lands in the "this week" bucket, matching the design's
  // Hôm nay / Tuần này / Cũ hơn grouping in the notification center modal.
  function groupKey(dateStr: string): 'today' | 'week' | 'older' {
    const created = new Date(dateStr)
    const now = new Date()
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const diffDays = Math.floor((startOfDay(now) - startOfDay(created)) / 86400000)
    if (diffDays <= 0) return 'today'
    if (diffDays < 7) return 'week'
    return 'older'
  }

  function timeSince(dateStr: string): string {
    const ms = Date.now() - new Date(dateStr).getTime()
    const s = Math.floor(ms / 1000)
    if (s < 60)   return t('notification.time.justNow')
    const m = Math.floor(s / 60)
    if (m < 60)   return t('notification.time.minutesAgo', { n: m })
    const h = Math.floor(s / 3600)
    if (h < 24)   return t('notification.time.hoursAgo', { n: h })
    const d = Math.floor(s / 86400)
    if (d < 7)    return t('notification.time.daysAgo', { n: d })
    const w = Math.floor(s / 604800)
    if (w < 4)    return t('notification.time.weeksAgo', { n: w })
    return t('notification.time.monthsAgo', { n: Math.floor(s / 2592000) })
  }

  return { translateContent, timeSince, groupKey }
}
