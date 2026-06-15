export type MemberStatus = 'active' | 'onboarding' | 'leave' | 'inactive'
export type Member = {
  id: number; name: string; branch: string; role: string; email: string
  phone: string; status: MemberStatus; jp: string; join: string; rank: string
}
export type Invitation = { email: string; role: string; branch: string; sent: string; by: string; status: 'pending' | 'expired' }

export const MEMBERS: Member[] = [
  { id: 1, name: 'Nguyễn Văn An', branch: 'Hà Nội', role: 'Senior Frontend', email: 'an.nguyen@vnlab.vn', phone: '0912 345 678', status: 'active', jp: 'N2', join: '15/01/2022', rank: 'S' },
  { id: 2, name: 'Trần Thị Mai', branch: 'Đà Nẵng', role: 'QA Engineer', email: 'mai.tran@vnlab.vn', phone: '0934 567 123', status: 'active', jp: 'N3', join: '08/06/2023', rank: 'A' },
  { id: 3, name: 'Lê Quang Huy', branch: 'Hồ Chí Minh', role: 'BrSE', email: 'huy.le@vnlab.vn', phone: '0987 654 321', status: 'active', jp: 'N1', join: '02/03/2021', rank: 'S' },
  { id: 4, name: 'Phạm Thu Hà', branch: 'Đà Nẵng', role: 'Tech Lead', email: 'ha.pham@vnlab.vn', phone: '0901 234 567', status: 'active', jp: 'N2', join: '17/09/2020', rank: 'S' },
  { id: 5, name: 'Đỗ Minh Tuấn', branch: 'Hà Nội', role: 'Backend Engineer', email: 'tuan.do@vnlab.vn', phone: '0945 678 901', status: 'active', jp: 'N3', join: '11/11/2022', rank: 'B' },
  { id: 6, name: 'Hoàng Đức Thành', branch: 'Hà Nội', role: 'PM Senior', email: 'thanh.hoang@vnlab.vn', phone: '0967 890 123', status: 'active', jp: 'N1', join: '04/05/2019', rank: 'S' },
  { id: 7, name: 'Vũ Thị Lan', branch: 'Hà Nội', role: 'Designer', email: 'lan.vu@vnlab.vn', phone: '0978 012 345', status: 'active', jp: 'N4', join: '23/07/2023', rank: 'A' },
  { id: 8, name: 'Bùi Đức Thành', branch: 'Osaka', role: 'DevOps', email: 'thanh.bui@vnlab.vn', phone: '+81 90 1234 5678', status: 'active', jp: 'N1', join: '12/10/2022', rank: 'A' },
  { id: 9, name: 'Ngô Thanh Tùng', branch: 'Hà Nội', role: 'Junior Developer', email: 'tung.ngo@vnlab.vn', phone: '0989 123 456', status: 'onboarding', jp: '—', join: '03/05/2026', rank: 'C' },
  { id: 10, name: 'Đặng Thị Hồng', branch: 'Đà Nẵng', role: 'Tester', email: 'hong.dang@vnlab.vn', phone: '0923 456 789', status: 'active', jp: 'N3', join: '20/04/2024', rank: 'B' },
  { id: 11, name: 'Nguyễn Hữu Phước', branch: 'Hồ Chí Minh', role: 'Backend Engineer', email: 'phuoc.nh@vnlab.vn', phone: '0956 789 012', status: 'leave', jp: 'N2', join: '15/02/2023', rank: 'A' },
  { id: 12, name: 'Lý Quỳnh Anh', branch: 'Hà Nội', role: 'BrSE', email: 'anh.ly@vnlab.vn', phone: '0901 567 890', status: 'active', jp: 'N1', join: '08/08/2021', rank: 'A' },
  { id: 13, name: 'Phan Văn Cường', branch: 'Đà Nẵng', role: 'DevOps', email: 'cuong.phan@vnlab.vn', phone: '0934 678 234', status: 'active', jp: 'N3', join: '19/11/2023', rank: 'B' },
  { id: 14, name: 'Tô Thị Kim Anh', branch: 'Hà Nội', role: 'Frontend Engineer', email: 'kimanh.to@vnlab.vn', phone: '0912 890 456', status: 'active', jp: 'N2', join: '07/03/2024', rank: 'B' },
  { id: 15, name: 'Hà Minh Quân', branch: 'Hồ Chí Minh', role: 'PM', email: 'quan.ha@vnlab.vn', phone: '0978 234 567', status: 'inactive', jp: '—', join: '12/06/2020', rank: '—' },
]

export const MEMBER_STATUS_META: Record<MemberStatus, { label: string; variant: 'green' | 'amber' | 'sky' | 'gray' }> = {
  active: { label: 'Đang làm việc', variant: 'green' },
  onboarding: { label: 'Đang onboard', variant: 'amber' },
  leave: { label: 'Nghỉ phép', variant: 'sky' },
  inactive: { label: 'Đã nghỉ việc', variant: 'gray' },
}

export const BRANCHES = ['Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh', 'Osaka']

export const INVITATIONS: Invitation[] = [
  { email: 'phong.le@example.com', role: 'Frontend Engineer', branch: 'Hà Nội', sent: '20/05/2026', by: 'Hoàng Đức Thành', status: 'pending' },
  { email: 'mai.t@example.com', role: 'QA', branch: 'Đà Nẵng', sent: '18/05/2026', by: 'Phạm Thu Hà', status: 'pending' },
  { email: 'duc.tran@example.com', role: 'BrSE', branch: 'Hà Nội', sent: '15/05/2026', by: 'Hoàng Đức Thành', status: 'expired' },
  { email: 'tuan.bui@example.com', role: 'PM', branch: 'HCM', sent: '12/05/2026', by: 'Lê Quang Huy', status: 'pending' },
]

export const RANK_COLOR: Record<string, string> = { S: '#0ea5e9', A: '#22c55e', B: '#a3a3a3', C: '#eab308' }
