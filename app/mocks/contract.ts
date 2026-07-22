export const CONTRACT_DURATIONS: { value: string; labelKey: string }[] = [
  { value: 'unspecified', labelKey: 'hrm.contract.duration.unspecified' },
  { value: 'y1', labelKey: 'hrm.contract.duration.y1' },
  { value: 'y2', labelKey: 'hrm.contract.duration.y2' },
  { value: 'y3', labelKey: 'hrm.contract.duration.y3' },
  { value: 'probation2m', labelKey: 'hrm.contract.duration.probation2m' },
]

// Currency codes are universal — not locale-dependent, kept as plain strings.
export const CURRENCY_UNITS = ['VND', 'USD', 'JPY']
