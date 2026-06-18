type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

export type EvalStatus = 'pending' | 'draft' | 'submitted'
export type EvalSectionKey = 'common' | 'personal' | 'project' | 'other'

export type Evaluation = {
  id: number
  user: string
  branch: string
  role: string
  reviewer: string
  period: string
  year: number
  q: number
  pct: Record<EvalSectionKey, number>
  status: EvalStatus
  updated: string
  comment: string
}

export type GoalRow = {
  id: string
  weight: number | ''
  name: string
  actual: number | ''
  result: number | ''
  target?: string
  detail?: string
  project?: string
}

export const EVAL_SECTIONS: Array<{ key: EvalSectionKey; label: string; desc: string; weight: number; accent: string }> = [
  { key: 'common',   label: 'Mục tiêu chung',   desc: 'Áp dụng cho toàn bộ nhân viên',   weight: 15, accent: 'hsl(var(--primary))' },
  { key: 'personal', label: 'Mục tiêu cá nhân', desc: 'Phát triển cá nhân trong kỳ',     weight: 25, accent: 'hsl(265 60% 55%)' },
  { key: 'project',  label: 'Mục tiêu dự án',   desc: 'Đóng góp vào các dự án cụ thể',   weight: 55, accent: 'hsl(160 60% 45%)' },
  { key: 'other',    label: 'Mục tiêu khác',    desc: 'Đóng góp ngoài kế hoạch',         weight: 5,  accent: 'hsl(38 92% 50%)' },
]

export const EVAL_STATUS_META: Record<EvalStatus, { label: string; variant: BadgeVariant; dot: boolean }> = {
  pending:   { label: 'Chưa bắt đầu', variant: 'gray',  dot: true },
  draft:     { label: 'Nháp',          variant: 'amber', dot: true },
  submitted: { label: 'Đã gửi',        variant: 'green', dot: true },
}

export const RANK_COLOR: Record<string, string> = {
  S: '#0ea5e9', A: '#22c55e', B: '#a3a3a3', C: '#eab308', D: '#f97316', E: '#ef4444',
}

export function rankFromScore(s: number): string {
  return s >= 9 ? 'S' : s >= 8 ? 'A' : s >= 6.5 ? 'B' : s >= 5 ? 'C' : s >= 3.5 ? 'D' : 'E'
}

export function weightedTotal(e: Evaluation): number {
  return +EVAL_SECTIONS.reduce((a, s) => a + s.weight * (e.pct[s.key] || 0) / 100, 0).toFixed(1)
}

export function totalScore(e: Evaluation): number {
  return +(weightedTotal(e) / 10).toFixed(1)
}

export const EVALUATIONS: Evaluation[] = [
  { id: 1,  user: 'Nguyễn Văn An',   branch: 'Hà Nội',  role: 'Senior Frontend',  reviewer: 'Hoàng Đức Thành', period: 'Q2/2026', year: 2026, q: 2, pct: { common: 95, personal: 90, project: 92, other: 100 }, status: 'submitted', updated: '2 giờ trước',   comment: 'An có sự tăng trưởng rõ rệt về kỹ năng lãnh đạo, đặc biệt là khả năng mentor cho team junior. Cần cải thiện thêm về khả năng giao tiếp với stakeholders Nhật.' },
  { id: 2,  user: 'Trần Thị Mai',    branch: 'Đà Nẵng', role: 'QA Engineer',      reviewer: 'Phạm Thu Hà',     period: 'Q2/2026', year: 2026, q: 2, pct: { common: 80, personal: 70, project: 82, other: 80  }, status: 'submitted', updated: '5 giờ trước',   comment: 'Mai làm việc kỹ lưỡng, ít miss bugs. Nên tham gia thêm hoạt động chia sẻ trong team.' },
  { id: 3,  user: 'Lê Quang Huy',    branch: 'HCM',     role: 'BrSE',             reviewer: 'Phạm Thu Hà',     period: 'Q2/2026', year: 2026, q: 2, pct: { common: 95, personal: 90, project: 96, other: 90  }, status: 'submitted', updated: 'Hôm qua',      comment: 'Huy duy trì performance ổn định ở mức rất cao. Là cầu nối tốt giữa team Việt Nam và Nhật.' },
  { id: 4,  user: 'Phạm Thu Hà',     branch: 'Đà Nẵng', role: 'Tech Lead',        reviewer: 'Hoàng Đức Thành', period: 'Q2/2026', year: 2026, q: 2, pct: { common: 90, personal: 88, project: 90, other: 95  }, status: 'submitted', updated: '2 ngày trước',  comment: 'Excellent leadership. Team Đà Nẵng đạt deadline tốt dưới sự dẫn dắt của Hà.' },
  { id: 5,  user: 'Đỗ Minh Tuấn',    branch: 'Hà Nội',  role: 'Backend Engineer', reviewer: 'Hoàng Đức Thành', period: 'Q2/2026', year: 2026, q: 2, pct: { common: 70, personal: 65, project: 72, other: 60  }, status: 'draft',     updated: '3 ngày trước',  comment: 'Cần bổ sung trước khi gửi.' },
  { id: 6,  user: 'Hoàng Đức Thành', branch: 'Hà Nội',  role: 'PM Senior',        reviewer: 'CEO',             period: 'Q2/2026', year: 2026, q: 2, pct: { common: 92, personal: 88, project: 93, other: 90  }, status: 'submitted', updated: '4 ngày trước',  comment: 'Tiếp tục là trụ cột của PM team.' },
  { id: 7,  user: 'Vũ Thị Lan',      branch: 'Hà Nội',  role: 'Designer',         reviewer: 'Hoàng Đức Thành', period: 'Q2/2026', year: 2026, q: 2, pct: { common: 85, personal: 82, project: 86, other: 80  }, status: 'submitted', updated: '5 ngày trước',  comment: 'Output design ổn định, có gout tốt.' },
  { id: 8,  user: 'Bùi Đức Thành',   branch: 'Osaka',   role: 'DevOps',           reviewer: 'Phạm Thu Hà',     period: 'Q2/2026', year: 2026, q: 2, pct: { common: 80, personal: 75, project: 82, other: 70  }, status: 'pending',   updated: '1 tuần trước',  comment: '' },
  { id: 9,  user: 'Ngô Thanh Tùng',  branch: 'Hà Nội',  role: 'Junior Developer', reviewer: 'Đỗ Minh Tuấn',   period: 'Q2/2026', year: 2026, q: 2, pct: { common: 60, personal: 62, project: 65, other: 55  }, status: 'draft',     updated: '2 ngày trước',  comment: '' },
  { id: 10, user: 'Đặng Thị Hồng',   branch: 'Đà Nẵng', role: 'Tester',           reviewer: 'Phạm Thu Hà',     period: 'Q2/2026', year: 2026, q: 2, pct: { common: 78, personal: 72, project: 80, other: 70  }, status: 'submitted', updated: '6 ngày trước',  comment: 'Hoàn thành tốt nhiệm vụ.' },
  { id: 11, user: 'Nguyễn Văn An',   branch: 'Hà Nội',  role: 'Senior Frontend',  reviewer: 'Hoàng Đức Thành', period: 'Q1/2026', year: 2026, q: 1, pct: { common: 82, personal: 80, project: 84, other: 80  }, status: 'submitted', updated: '3 tháng trước', comment: 'Kỳ Q1 ổn định.' },
  { id: 12, user: 'Trần Thị Mai',    branch: 'Đà Nẵng', role: 'QA Engineer',      reviewer: 'Phạm Thu Hà',     period: 'Q1/2026', year: 2026, q: 1, pct: { common: 72, personal: 68, project: 74, other: 65  }, status: 'submitted', updated: '3 tháng trước', comment: '' },
]

export const STARTER_GOALS: Record<string, GoalRow[]> = {
  common: [
    { id: 'c1', weight: 10, name: 'Hoàn thành mục tiêu OKR công ty Q2', target: 'Tham gia ít nhất 80% các OKR initiative được giao', actual: '', result: '' },
    { id: 'c2', weight: 5,  name: 'Đóng góp vào culture công ty', target: 'Tham dự đầy đủ All Hands + ít nhất 2 hoạt động team building', actual: '', result: '' },
  ],
  personal: [
    { id: 'p1', weight: 15, name: 'Viết blog kỹ thuật', target: '4 bài blog (≥1500 từ) trên Medium công ty trong quý', actual: '', result: '' },
    { id: 'p2', weight: 10, name: 'Học tiếng Nhật', target: 'Hoàn thành chương trình N2 và thi thử đạt ≥70%', actual: '', result: '' },
  ],
  project: [
    { id: 'pr1', weight: 25, project: 'Cổng thanh toán XYZ', name: 'Hoàn thành module checkout v2', actual: '', result: '' },
    { id: 'pr2', weight: 20, project: 'Hệ thống CRM nội bộ',  name: 'Mentor 2 junior dev và review ≥50 PR', actual: '', result: '' },
    { id: 'pr3', weight: 10, project: 'Module báo cáo BI',    name: 'Thiết kế kiến trúc data pipeline', actual: '', result: '' },
  ],
  other: [
    { id: 'o1', weight: 5, name: 'Phỏng vấn ứng viên', detail: 'Tham gia ≥5 buổi phỏng vấn kỹ thuật cho team Frontend', actual: '', result: '' },
  ],
}

export const EVAL_PROJECT_OPTIONS = [
  'Cổng thanh toán XYZ',
  'Hệ thống CRM nội bộ',
  'App giao đồ ăn FoodGo',
  'Quản lý kho ABC v2',
  'Module báo cáo BI',
  'Mobile companion app',
  'Cổng tích hợp API v3',
]
