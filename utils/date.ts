import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

/** Format a date string / Date for display: DD/MM/YYYY */
export const formatDate = (d: string | Date | null | undefined): string =>
  d ? dayjs(d).format('DD/MM/YYYY') : '—'

/** Format datetime: DD/MM/YYYY HH:mm */
export const formatDateTime = (d: string | Date | null | undefined): string =>
  d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—'

/** Format for API payload: YYYY-MM-DD */
export const toApiDate = (d: string | Date | null | undefined): string =>
  d ? dayjs(d).format('YYYY-MM-DD') : ''

/** Format time only: HH:mm */
export const formatTime = (d: string | Date | null | undefined): string =>
  d ? dayjs(d).format('HH:mm') : '—'

/** Return true if date falls on a Saturday or Sunday */
export const isWeekend = (d: string | Date): boolean => {
  const day = dayjs(d).day()
  return day === 0 || day === 6
}

/**
 * Count working days between two dates (inclusive), excluding weekends
 * and optional holiday strings in 'YYYY-MM-DD' format.
 */
export const getWorkingDays = (
  start: string | Date,
  end: string | Date,
  holidays: string[] = [],
): number => {
  const holidaySet = new Set(holidays)
  let count = 0
  let current = dayjs(start)
  const last = dayjs(end)
  while (current.isSameOrBefore(last, 'day')) {
    const dateStr = current.format('YYYY-MM-DD')
    if (!isWeekend(dateStr) && !holidaySet.has(dateStr)) count++
    current = current.add(1, 'day')
  }
  return count
}

/** Return the current year */
export const currentYear = (): number => new Date().getFullYear()

/** Return the current month (1-based) */
export const currentMonth = (): number => new Date().getMonth() + 1

/** ISO week number of a date */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const weekNumber = (d: string | Date): number => (dayjs(d) as any).isoWeek?.() ?? 0

/** Friendly relative label: "2 hours ago", "in 3 days", etc. */
export const fromNow = (d: string | Date | null | undefined): string =>
  d ? dayjs(d).fromNow() : ''

/** True if d is today */
export const isToday = (d: string | Date): boolean =>
  dayjs(d).isSame(dayjs(), 'day')

/** True if d1 <= d2 (date only comparison) */
export const isBeforeOrEqual = (d1: string, d2: string): boolean =>
  dayjs(d1).isSameOrBefore(dayjs(d2), 'day')
