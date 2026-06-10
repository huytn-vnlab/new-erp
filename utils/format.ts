/**
 * utils/format.ts — display formatting helpers
 * Pure functions, no Vue/Nuxt dependencies.
 */

/** Format a number as Vietnamese currency: 1,500,000 ₫ */
export const formatCurrency = (amount: number | null | undefined, symbol = '₫'): string => {
  if (amount == null) return '—'
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + symbol
}

/** Format a phone number: 0901234567 → 090 123 4567 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return phone
}

/** Human-readable file size: 1024 → "1 KB" */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/** Truncate a string to maxLength and append ellipsis */
export const truncate = (str: string | null | undefined, maxLength = 50): string => {
  if (!str) return ''
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str
}

/** Convert snake_case or kebab-case to Title Case */
export const toTitleCase = (str: string): string =>
  str.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

/** Initials from a full name: "Nguyen Van A" → "NA" */
export const getInitials = (name: string | null | undefined, maxChars = 2): string => {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, maxChars)
    .join('')
    .toUpperCase()
}

/** Leave request status → display label + Tailwind badge variant */
export const leaveStatusMeta = (status: number): { label: string; variant: 'green' | 'red' | 'yellow' | 'gray' } => {
  switch (status) {
    case 1:  return { label: 'Đã duyệt', variant: 'green' }
    case 2:  return { label: 'Từ chối',  variant: 'red' }
    case 0:  return { label: 'Chờ duyệt', variant: 'yellow' }
    default: return { label: 'Không xác định', variant: 'gray' }
  }
}

/**
 * Overtime request status.
 * Backend codes differ from leave: 1=pending · 2=approved · 3=rejected
 */
export const overtimeStatusMeta = (status: number): { label: string; variant: 'green' | 'red' | 'yellow' | 'gray' } => {
  switch (status) {
    case 1:  return { label: 'Chờ duyệt',       variant: 'yellow' }
    case 2:  return { label: 'Đã duyệt',         variant: 'green' }
    case 3:  return { label: 'Từ chối',           variant: 'red' }
    default: return { label: 'Không xác định',   variant: 'gray' }
  }
}

/** Recruitment status */
export const recruitmentStatusMeta = (status: number): { label: string; variant: 'green' | 'red' | 'yellow' | 'gray' | 'blue' } => {
  switch (status) {
    case 1:  return { label: 'Đang tuyển',   variant: 'blue' }
    case 2:  return { label: 'Đã tuyển đủ',  variant: 'green' }
    case 0:  return { label: 'Tạm dừng',      variant: 'gray' }
    default: return { label: 'Không xác định', variant: 'gray' }
  }
}
