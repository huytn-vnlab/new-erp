// Backend response date fields already come formatted "YYYY/MM/DD"
// (cf.FormatDateDisplay) — this accepts that, "YYYY-MM-DD" (wire format sent
// to create/edit endpoints), and full ISO datetimes so every screen can
// normalize to the same Japan-style display without re-deriving it locally.
export function formatDateDisplay(value: Date | string | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value.replace(/\//g, '-'))
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

// Inverse of formatDateDisplay — for request payloads the backend parses with
// cf.FormatDateDatabase ("2006-01-02", dash-separated), e.g. EditProfileParams'
// Birthday/CompanyJoinedDate/IssueDate fields.
export function toDbDate(value: Date | string | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value.replace(/\//g, '-'))
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDateTimeDisplay(value: Date | string | null | undefined, withSeconds = false): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value.replace(/\//g, '-'))
  if (Number.isNaN(date.getTime())) return ''
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const sec = withSeconds ? `:${String(date.getSeconds()).padStart(2, '0')}` : ''
  return `${formatDateDisplay(date)} ${h}:${min}${sec}`
}
