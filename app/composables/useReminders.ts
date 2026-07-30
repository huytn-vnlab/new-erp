import { computed, type ComputedRef, type Ref } from 'vue'
import type { EventReminders } from '~/stores/dashboard'

export interface ReminderEvent {
  type: 'birthday' | 'anniversary' | 'contract'
  name: string
  text: string
  sub: string
  date: string // raw YYYY-MM-DD from backend — actual birth/join/expiry date, not projected to current year
  color: 'amber' | 'sky' | 'emerald'
}

// Shared by CompanyTab's inline preview list and ReminderCalendarModal's
// month grid — both render the same underlying dashStore.reminders data.
export function useReminders(reminders: Ref<EventReminders> | ComputedRef<EventReminders>) {
  const { t } = useI18n()

  const events = computed<ReminderEvent[]>(() => {
    const r = reminders.value
    const all: ReminderEvent[] = []
    for (const b of r.birthdays)
      all.push({ type: 'birthday', name: b.fullname, text: t('home.company.birthday', { name: b.fullname }), sub: b.birthday, date: b.birthday, color: 'amber' })
    for (const a of r.anniversaries)
      all.push({ type: 'anniversary', name: a.fullname, text: t('home.company.anniversary', { name: a.fullname }), sub: a.company_joined_date, date: a.company_joined_date, color: 'sky' })
    for (const c of r.contracts)
      all.push({ type: 'contract', name: c.fullname, text: t('home.company.contract', { name: c.fullname }), sub: c.contract_expiration_date, date: c.contract_expiration_date, color: 'emerald' })
    return all
  })

  return { events }
}

// Birthdays/anniversaries recur every year — project the stored month/day
// onto whichever calendar year is being displayed. Contract expirations are
// a one-off absolute date, so they're returned as-is.
export function reminderCellKey(e: Pick<ReminderEvent, 'type' | 'date'>, displayYear: number): string {
  if (e.type === 'contract') return e.date.slice(0, 10)
  const [, m, d] = e.date.split('-')
  return `${displayYear}-${m}-${d}`
}
