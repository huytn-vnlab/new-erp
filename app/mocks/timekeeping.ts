export type TKStatus = 'full' | 'late' | 'short' | 'leave' | 'weekend' | 'empty'

export type TimekeepingDay = {
  date: string
  weekday: number
  status: TKStatus
  in?: string
  out?: string
  hours?: number
  late?: number
  note?: string
}

export const TK_STATUS_META: Record<TKStatus, { labelKey: string; color: string; bg: string }> = {
  full:    { labelKey: 'hrm.timekeeping.status.full',    color: 'hsl(160 60% 50%)', bg: 'hsl(160 60% 88%)' },
  late:    { labelKey: 'hrm.timekeeping.status.late',    color: 'hsl(38 92% 50%)',  bg: 'hsl(38 92% 92%)' },
  short:   { labelKey: 'hrm.timekeeping.status.short',   color: 'hsl(0 65% 60%)',   bg: 'hsl(0 65% 94%)' },
  leave:   { labelKey: 'hrm.timekeeping.status.leave',   color: 'hsl(265 55% 60%)', bg: 'hsl(265 55% 95%)' },
  weekend: { labelKey: 'hrm.timekeeping.status.weekend', color: 'hsl(220 14% 75%)', bg: 'hsl(220 14% 95%)' },
  empty:   { labelKey: 'hrm.timekeeping.status.empty',   color: 'hsl(220 14% 75%)', bg: 'hsl(220 14% 97%)' },
}

// Edit-request approval status (cf.PendingStatus etc. on the backend) — this is
// NOT attendance quality, it's whether a correction request on that record is
// pending/accepted/rejected. 0 = no request exists for this record.
export type RQStatus = 0 | 1 | 2 | 3
export const RQ_STATUS_META: Record<RQStatus, { labelKey: string; variant: 'gray' | 'green' | 'red' | 'amber' }> = {
  0: { labelKey: 'hrm.timekeeping.rqStatus.none', variant: 'gray' },
  1: { labelKey: 'hrm.timekeeping.rqStatus.approved', variant: 'green' },
  2: { labelKey: 'hrm.timekeeping.rqStatus.rejected', variant: 'red' },
  3: { labelKey: 'hrm.timekeeping.rqStatus.pending', variant: 'amber' },
}

// Last `count` months including the current real month — replaces a previously
// hardcoded 3-month list that didn't track the real calendar. `monthLabel`
// lets the caller supply a locale-aware month name (defaults to vi-VN, which
// matches the design's "Tháng N" format).
export function recentMonthOptions(
  count = 12,
  from = new Date(),
  monthLabel: (date: Date) => string = d => d.toLocaleDateString('vi-VN', { month: 'short' }),
): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = d.getMonth()
    opts.push({ value: `${y}-${String(m + 1).padStart(2, '0')}`, label: `${monthLabel(d)}/${y}` })
  }
  return opts
}
