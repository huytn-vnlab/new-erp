// Numeric leave_request_type_id (1-9) — the stable key. Never key styling/lookups
// by the translated label since it changes with locale.
export type LeaveType = number

export type LeaveStatus = 'pending' | 'approved' | 'rejected'

// i18n key (not literal text) per leave_request_type_id — resolve with t() at display time.
export const LEAVE_TYPE_ID_MAP: Record<number, string> = {
  1: 'hrm.leave.type.fullDay',
  2: 'hrm.leave.type.morningOff',
  3: 'hrm.leave.type.afternoonOff',
  4: 'hrm.leave.type.late',
  5: 'hrm.leave.type.early',
  6: 'hrm.leave.type.goOut',
  7: 'hrm.leave.type.workAtHome',
  8: 'hrm.leave.type.businessTrip',
  9: 'hrm.leave.type.other',
}

// i18n key (not literal text) per leave_bonus_type_id — resolve with t() at display time.
export const BONUS_TYPE_ID_MAP: Record<number, string> = {
  1: 'hrm.leave.bonusType.annual',
  2: 'hrm.leave.bonusType.seniority',
  3: 'hrm.leave.bonusType.sick',
  4: 'hrm.leave.bonusType.wedding',
  5: 'hrm.leave.bonusType.maternity',
  6: 'hrm.leave.bonusType.funeral',
  7: 'hrm.leave.bonusType.payout',
  8: 'hrm.leave.bonusType.overtime',
}

export type LeaveMember = { id: number; name: string; branch: string }

export type LeaveEntry = {
  id: number
  memberId: number
  type: LeaveType
  from: string
  to: string
  status: LeaveStatus
  reason: string
  half: boolean
}

export type LeaveInfoRow = {
  name: string
  email: string
  branch: string
  used: number
  curr: number
  prev: number
  active: boolean
}

export type LeaveHistoryRow = {
  date: string
  name: string
  amount: string
  reason: string
  by: string
}

export const LEAVE_MEMBERS: LeaveMember[] = [
  { id: 1,  name: 'Nguyễn Tấn Nam',      branch: 'Hà Nội' },
  { id: 2,  name: 'default user',         branch: 'Hà Nội' },
  { id: 3,  name: 'Đặng Đình Nhân',       branch: 'Đà Nẵng' },
  { id: 4,  name: 'Đỗ Thị Hương Lan',     branch: 'Hà Nội' },
  { id: 5,  name: 'Lương Minh Thiệu',     branch: 'Hồ Chí Minh' },
  { id: 6,  name: 'Nam Vo',               branch: 'Đà Nẵng' },
  { id: 7,  name: 'Tiến Lê Đức',          branch: 'Hà Nội' },
  { id: 8,  name: 'Vũ Thị Bích Diệp',     branch: 'Hà Nội' },
  { id: 9,  name: 'Trần Cao Quý',         branch: 'Hồ Chí Minh' },
  { id: 10, name: 'Nguyễn Thị Kim Ngân',  branch: 'Đà Nẵng' },
]

type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

export const LEAVE_TYPE_META: Record<LeaveType, { variant: BadgeVariant; color: string; bg: string }> = {
  1: { variant: 'primary', color: 'hsl(var(--primary))',          bg: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.12)' }, // Nghỉ cả ngày
  2: { variant: 'sky',     color: 'hsl(199 89% 45%)',             bg: 'hsl(199 89% 48% / 0.13)' },                           // Nghỉ buổi sáng
  3: { variant: 'violet',  color: 'hsl(265 60% 52%)',             bg: 'hsl(265 60% 55% / 0.13)' },                           // Nghỉ buổi chiều
  4: { variant: 'amber',   color: 'hsl(38 92% 42%)',              bg: 'hsl(38 92% 50% / 0.14)' },                            // Đi muộn
  5: { variant: 'amber',   color: 'hsl(25 90% 48%)',              bg: 'hsl(25 90% 52% / 0.14)' },                            // Về sớm
  6: { variant: 'sky',     color: 'hsl(180 60% 36%)',             bg: 'hsl(180 60% 42% / 0.14)' },                           // Ra ngoài
  7: { variant: 'green',   color: 'hsl(160 60% 38%)',             bg: 'hsl(160 60% 45% / 0.13)' },                           // Làm ở nhà
  8: { variant: 'violet',  color: 'hsl(231 60% 52%)',             bg: 'hsl(231 60% 55% / 0.13)' },                           // Công tác
  9: { variant: 'gray',    color: 'hsl(var(--muted-foreground))', bg: 'hsl(var(--muted-foreground) / 0.12)' },               // Khác
}

export const LEAVE_TYPES: LeaveType[] = Object.keys(LEAVE_TYPE_META).map(Number)

export const LEAVE_STATUS_META: Record<LeaveStatus, { labelKey: string; variant: BadgeVariant }> = {
  pending:  { labelKey: 'hrm.leave.status.pending',  variant: 'amber' },
  approved: { labelKey: 'hrm.leave.status.approved', variant: 'green' },
  rejected: { labelKey: 'hrm.leave.status.rejected', variant: 'red' },
}

export const LEAVE_ENTRIES: LeaveEntry[] = [
  { id: 1, memberId: 4,  type: 1, from: '2026-06-02', to: '2026-06-03', status: 'approved', reason: 'Du lịch gia đình',           half: false },
  { id: 2, memberId: 6,  type: 2, from: '2026-06-01', to: '2026-06-01', status: 'pending',  reason: 'Khám bệnh buổi sáng',        half: true  },
  { id: 3, memberId: 9,  type: 8, from: '2026-06-04', to: '2026-06-05', status: 'approved', reason: 'Công tác khách hàng Osaka',   half: false },
  { id: 4, memberId: 1,  type: 4, from: '2026-06-05', to: '2026-06-05', status: 'pending',  reason: 'Kẹt xe / việc gia đình',      half: true  },
  { id: 5, memberId: 8,  type: 7, from: '2026-06-03', to: '2026-06-06', status: 'approved', reason: 'Work from home',              half: false },
  { id: 6, memberId: 3,  type: 5, from: '2026-06-04', to: '2026-06-04', status: 'approved', reason: 'Đón con',                     half: true  },
  { id: 7, memberId: 10, type: 6, from: '2026-06-06', to: '2026-06-07', status: 'pending',  reason: 'Việc cá nhân',               half: false },
]

export const LEAVE_INFO_ROWS: LeaveInfoRow[] = [
  { name: 'default user',        email: 'bladeandsoul3337@yopmail.com', branch: '—',        used: 0,   curr: 12,   prev: 0,  active: true  },
  { name: 'Trần Cao Quý',        email: 'quytc@yopmail.com',            branch: 'Hà Nội',   used: 4,   curr: 10,   prev: 2,  active: true  },
  { name: 'Tiến Lê Đức',         email: 'tienld@yopmail.com',           branch: 'Hà Nội',   used: 6,   curr: 8,    prev: 0,  active: true  },
  { name: 'Đỗ Thị Hương Lan',    email: 'landth@yopmail.com',           branch: 'Hà Nội',   used: 2.5, curr: 11.5, prev: 1,  active: true  },
  { name: 'Nguyễn Tấn Nam',      email: 'namnt@yopmail.com',            branch: 'Đà Nẵng',  used: 9,   curr: 5,    prev: 0,  active: true  },
  { name: 'Lê Minh Long',        email: 'longlm@yopmail.com',           branch: 'Hà Nội',   used: 1,   curr: 13,   prev: 3,  active: true  },
  { name: 'Phạm Văn Hậu',        email: 'haupv@yopmail.com',            branch: 'Hà Nội',   used: 7,   curr: 7,    prev: 0,  active: false },
  { name: 'Đặng Đình Nhân',      email: 'nhandd@yopmail.com',           branch: 'Đà Nẵng',  used: 3,   curr: 11,   prev: 0,  active: true  },
  { name: 'Lương Minh Thiệu',    email: 'luongminhthieu@yopmail.com',   branch: 'Hà Nội',   used: 12,  curr: 4,    prev: 2,  active: true  },
  { name: 'Trịnh Ngọc Tuấn',     email: 'tuantn@yopmail.com',           branch: 'Đà Nẵng',  used: 0,   curr: 14,   prev: 0,  active: false },
]

export const LEAVE_HISTORY_ROWS: LeaveHistoryRow[] = [
  { date: '01/01/2026', name: 'Nguyễn Tấn Nam',   amount: '+14', reason: 'Cấp phép năm 2026',     by: 'Hệ thống' },
  { date: '01/01/2026', name: 'Đỗ Thị Hương Lan', amount: '+14', reason: 'Cấp phép năm 2026',     by: 'Hệ thống' },
  { date: '15/03/2026', name: 'Trần Cao Quý',      amount: '+2',  reason: 'Thưởng phép dự án XYZ', by: 'Hoàng Đức Thành' },
  { date: '02/04/2026', name: 'Nam Vo',             amount: '+1',  reason: 'Bù ngày lễ làm việc',  by: 'Phạm Thu Hà' },
  { date: '20/04/2026', name: 'Lương Minh Thiệu',  amount: '-1',  reason: 'Điều chỉnh sai sót',   by: 'Phạm Thu Hà' },
]

export const LEAVE_ADD_TYPES = [
  'Nghỉ thường niên', 'Nghỉ thâm niên', 'Nghỉ ốm', 'Nghỉ cưới',
  'Nghỉ thai sản', 'Nghỉ tang lễ', 'Xóa phép', 'Phép OT',
]
