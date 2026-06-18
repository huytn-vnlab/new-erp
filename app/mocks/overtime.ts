type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

export type OTStatus = 'pending' | 'approved' | 'rejected'

export type OTRequest = {
  id: number
  user: string
  branch: string
  project: string
  date: string   // dd/MM/yyyy
  start: string  // HH:mm
  end: string    // HH:mm
  hours: number
  reason: string
  status: OTStatus
  approver: string | null
  approved: string | null
  submitted: string
  rejectReason?: string
}

export const OT_STATUS_META: Record<OTStatus, { label: string; variant: BadgeVariant; dot: boolean }> = {
  pending:  { label: 'Chờ duyệt', variant: 'amber', dot: true },
  approved: { label: 'Đã duyệt',  variant: 'green', dot: true },
  rejected: { label: 'Từ chối',   variant: 'red',   dot: true },
}

export const OT_REQUESTS: OTRequest[] = [
  { id: 1,  user: 'Nguyễn Văn An',   branch: 'Hà Nội',  project: 'Cổng thanh toán XYZ',   date: '20/05/2026', start: '18:00', end: '22:00', hours: 4, reason: 'Hoàn thành module checkout trước deadline Q2',     status: 'approved', approver: 'Hoàng Đức Thành', approved: '21/05/2026', submitted: '19/05/2026' },
  { id: 2,  user: 'Lê Quang Huy',    branch: 'HCM',     project: 'App giao đồ ăn FoodGo', date: '21/05/2026', start: '19:00', end: '23:00', hours: 4, reason: 'Fix critical bug login flow trước release',         status: 'approved', approver: 'Phạm Thu Hà',     approved: '21/05/2026', submitted: '21/05/2026' },
  { id: 3,  user: 'Trần Thị Mai',    branch: 'Đà Nẵng', project: 'Hệ thống CRM nội bộ',  date: '22/05/2026', start: '17:30', end: '20:30', hours: 3, reason: 'Viết test case sprint review hôm nay',             status: 'pending',  approver: null,              approved: null,          submitted: '22/05/2026' },
  { id: 4,  user: 'Phạm Thu Hà',     branch: 'Đà Nẵng', project: 'Quản lý kho ABC v2',    date: '23/05/2026', start: '18:00', end: '21:00', hours: 3, reason: 'Họp planning sprint với khách hàng Tokyo',         status: 'pending',  approver: null,              approved: null,          submitted: '22/05/2026' },
  { id: 5,  user: 'Đỗ Minh Tuấn',    branch: 'Hà Nội',  project: 'Cổng thanh toán XYZ',   date: '18/05/2026', start: '18:00', end: '23:00', hours: 5, reason: 'Deploy hotfix patch production',                  status: 'approved', approver: 'Hoàng Đức Thành', approved: '18/05/2026', submitted: '18/05/2026' },
  { id: 6,  user: 'Vũ Thị Lan',      branch: 'Hà Nội',  project: 'Mobile companion app',  date: '17/05/2026', start: '19:00', end: '22:00', hours: 3, reason: 'Finalize mockup cho sprint demo Nhật Bản',         status: 'rejected', approver: 'Hoàng Đức Thành', approved: '18/05/2026', submitted: '17/05/2026', rejectReason: 'Có thể làm trong giờ hành chính.' },
  { id: 7,  user: 'Bùi Đức Thành',   branch: 'Osaka',   project: 'Cổng tích hợp API v3',  date: '15/05/2026', start: '17:00', end: '20:00', hours: 3, reason: 'Support khách hàng Osaka bị issue production',     status: 'approved', approver: 'Phạm Thu Hà',     approved: '15/05/2026', submitted: '15/05/2026' },
  { id: 8,  user: 'Hoàng Đức Thành', branch: 'Hà Nội',  project: 'Module báo cáo BI',     date: '14/05/2026', start: '20:00', end: '23:00', hours: 3, reason: 'Chuẩn bị slide báo cáo Q2 cho board meeting',      status: 'approved', approver: 'CEO',             approved: '14/05/2026', submitted: '14/05/2026' },
  { id: 9,  user: 'Nguyễn Văn An',   branch: 'Hà Nội',  project: 'Cổng thanh toán XYZ',   date: '10/05/2026', start: '18:00', end: '22:00', hours: 4, reason: 'Integration testing với đối tác VNPay',           status: 'approved', approver: 'Hoàng Đức Thành', approved: '10/05/2026', submitted: '10/05/2026' },
  { id: 10, user: 'Lý Quỳnh Anh',    branch: 'Hà Nội',  project: 'Cổng tích hợp API v3',  date: '25/05/2026', start: '18:00', end: '21:00', hours: 3, reason: 'Code review PR backlog trước sprint close',        status: 'pending',  approver: null,              approved: null,          submitted: '22/05/2026' },
]

export const OT_PROJECTS = [
  'Cổng thanh toán XYZ',
  'Hệ thống CRM nội bộ',
  'App giao đồ ăn FoodGo',
  'Module báo cáo BI',
  'Quản lý kho ABC v2',
  'Mobile companion app',
  'Cổng tích hợp API v3',
]
