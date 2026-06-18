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

export const TK_STATUS_META: Record<TKStatus, { label: string; color: string; bg: string }> = {
  full:    { label: 'Đủ công',    color: 'hsl(160 60% 50%)', bg: 'hsl(160 60% 88%)' },
  late:    { label: 'Đi muộn',   color: 'hsl(38 92% 50%)',  bg: 'hsl(38 92% 92%)' },
  short:   { label: 'Thiếu giờ', color: 'hsl(0 65% 60%)',   bg: 'hsl(0 65% 94%)' },
  leave:   { label: 'Nghỉ',      color: 'hsl(265 55% 60%)', bg: 'hsl(265 55% 95%)' },
  weekend: { label: 'Cuối tuần', color: 'hsl(220 14% 75%)', bg: 'hsl(220 14% 95%)' },
  empty:   { label: '—',         color: 'hsl(220 14% 75%)', bg: 'hsl(220 14% 97%)' },
}

// Static history for May 2026 (22 days)
export const TIMEKEEPING_HISTORY: TimekeepingDay[] = [
  { date: '01/05/2026', weekday: 5, status: 'full',    in: '08:32', out: '18:05', hours: 8.8, late: 0 },
  { date: '04/05/2026', weekday: 1, status: 'full',    in: '08:41', out: '18:12', hours: 8.6, late: 0 },
  { date: '05/05/2026', weekday: 2, status: 'leave',   note: 'Phép năm' },
  { date: '06/05/2026', weekday: 3, status: 'full',    in: '08:38', out: '18:08', hours: 8.5, late: 0 },
  { date: '07/05/2026', weekday: 4, status: 'short',   in: '08:55', out: '17:18', hours: 7.4, late: 0 },
  { date: '08/05/2026', weekday: 5, status: 'full',    in: '08:33', out: '18:11', hours: 8.6, late: 0 },
  { date: '09/05/2026', weekday: 6, status: 'weekend' },
  { date: '10/05/2026', weekday: 0, status: 'weekend' },
  { date: '11/05/2026', weekday: 1, status: 'full',    in: '08:30', out: '18:15', hours: 9.0, late: 0 },
  { date: '12/05/2026', weekday: 2, status: 'leave',   note: 'Nghỉ ốm' },
  { date: '13/05/2026', weekday: 3, status: 'full',    in: '08:35', out: '18:20', hours: 8.7, late: 0 },
  { date: '14/05/2026', weekday: 4, status: 'full',    in: '08:40', out: '18:05', hours: 8.4, late: 0 },
  { date: '15/05/2026', weekday: 5, status: 'full',    in: '08:37', out: '18:10', hours: 8.5, late: 0 },
  { date: '16/05/2026', weekday: 6, status: 'weekend' },
  { date: '17/05/2026', weekday: 0, status: 'weekend' },
  { date: '18/05/2026', weekday: 1, status: 'full',    in: '08:31', out: '18:22', hours: 9.1, late: 0 },
  { date: '19/05/2026', weekday: 2, status: 'late',    in: '09:42', out: '18:30', hours: 8.0, late: 42 },
  { date: '20/05/2026', weekday: 3, status: 'full',    in: '08:44', out: '18:09', hours: 8.4, late: 0 },
  { date: '21/05/2026', weekday: 4, status: 'full',    in: '08:36', out: '18:18', hours: 8.7, late: 0 },
  { date: '22/05/2026', weekday: 5, status: 'full',    in: '08:42', out: '18:15', hours: 8.5, late: 0 },
  { date: '23/05/2026', weekday: 6, status: 'weekend' },
  { date: '24/05/2026', weekday: 0, status: 'weekend' },
]

export const MONTH_OPTIONS = [
  { value: '2026-05', label: 'Tháng 5/2026' },
  { value: '2026-04', label: 'Tháng 4/2026' },
  { value: '2026-03', label: 'Tháng 3/2026' },
]
