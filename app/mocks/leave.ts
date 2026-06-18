export type LeaveType =
  | 'Nghỉ cả ngày'
  | 'Nghỉ buổi sáng'
  | 'Nghỉ buổi chiều'
  | 'Đi muộn'
  | 'Về sớm'
  | 'Ra ngoài'
  | 'Làm ở nhà'
  | 'Công tác'
  | 'Khác'

export type LeaveStatus = 'pending' | 'approved' | 'rejected'

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
  'Nghỉ cả ngày':    { variant: 'primary', color: 'hsl(var(--primary))',          bg: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.12)' },
  'Nghỉ buổi sáng':  { variant: 'sky',     color: 'hsl(199 89% 45%)',             bg: 'hsl(199 89% 48% / 0.13)' },
  'Nghỉ buổi chiều': { variant: 'violet',  color: 'hsl(265 60% 52%)',             bg: 'hsl(265 60% 55% / 0.13)' },
  'Đi muộn':         { variant: 'amber',   color: 'hsl(38 92% 42%)',              bg: 'hsl(38 92% 50% / 0.14)' },
  'Về sớm':          { variant: 'amber',   color: 'hsl(25 90% 48%)',              bg: 'hsl(25 90% 52% / 0.14)' },
  'Ra ngoài':        { variant: 'sky',     color: 'hsl(180 60% 36%)',             bg: 'hsl(180 60% 42% / 0.14)' },
  'Làm ở nhà':       { variant: 'green',   color: 'hsl(160 60% 38%)',             bg: 'hsl(160 60% 45% / 0.13)' },
  'Công tác':        { variant: 'violet',  color: 'hsl(231 60% 52%)',             bg: 'hsl(231 60% 55% / 0.13)' },
  'Khác':            { variant: 'gray',    color: 'hsl(var(--muted-foreground))', bg: 'hsl(var(--muted-foreground) / 0.12)' },
}

export const LEAVE_TYPES: LeaveType[] = Object.keys(LEAVE_TYPE_META) as LeaveType[]

export const LEAVE_STATUS_META: Record<LeaveStatus, { label: string; variant: BadgeVariant }> = {
  pending:  { label: 'Chờ duyệt', variant: 'amber' },
  approved: { label: 'Đã duyệt',  variant: 'green' },
  rejected: { label: 'Từ chối',   variant: 'red' },
}

export const LEAVE_ENTRIES: LeaveEntry[] = [
  { id: 1, memberId: 4,  type: 'Nghỉ cả ngày',    from: '2026-06-02', to: '2026-06-03', status: 'approved', reason: 'Du lịch gia đình',           half: false },
  { id: 2, memberId: 6,  type: 'Nghỉ buổi sáng',  from: '2026-06-01', to: '2026-06-01', status: 'pending',  reason: 'Khám bệnh buổi sáng',        half: true  },
  { id: 3, memberId: 9,  type: 'Công tác',         from: '2026-06-04', to: '2026-06-05', status: 'approved', reason: 'Công tác khách hàng Osaka',   half: false },
  { id: 4, memberId: 1,  type: 'Đi muộn',          from: '2026-06-05', to: '2026-06-05', status: 'pending',  reason: 'Kẹt xe / việc gia đình',      half: true  },
  { id: 5, memberId: 8,  type: 'Làm ở nhà',        from: '2026-06-03', to: '2026-06-06', status: 'approved', reason: 'Work from home',              half: false },
  { id: 6, memberId: 3,  type: 'Về sớm',           from: '2026-06-04', to: '2026-06-04', status: 'approved', reason: 'Đón con',                     half: true  },
  { id: 7, memberId: 10, type: 'Ra ngoài',          from: '2026-06-06', to: '2026-06-07', status: 'pending',  reason: 'Việc cá nhân',               half: false },
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
