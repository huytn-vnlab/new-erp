type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

export type JobStatus = 'open' | 'closed' | 'draft'
export type ApplicantStage = 'review' | 'screened' | 'interview' | 'offer' | 'accepted' | 'rejected'

export type Job = {
  id: number
  title: string
  branch: string
  dept: string
  count: number
  applied: number
  interviewed: number
  offered: number
  status: JobStatus
  start: string   // dd/MM/yyyy
  end: string     // dd/MM/yyyy
  jp: string      // JLPT level or '—'
  salary: string
  owner: string
  desc: string
}

export type Applicant = {
  name: string
  src: string
  applied: string
  stage: ApplicantStage
  note?: string
}

export const STAGE_META: Record<ApplicantStage, { label: string; variant: BadgeVariant; step: number }> = {
  review:    { label: 'Xem hồ sơ',  variant: 'gray',   step: 1 },
  screened:  { label: 'Đã screen',  variant: 'sky',    step: 2 },
  interview: { label: 'Phỏng vấn',  variant: 'amber',  step: 3 },
  offer:     { label: 'Gửi offer',  variant: 'violet', step: 4 },
  accepted:  { label: 'Đã nhận',    variant: 'green',  step: 5 },
  rejected:  { label: 'Từ chối',    variant: 'red',    step: 0 },
}

export const JOB_STATUS_META: Record<JobStatus, { label: string; variant: BadgeVariant }> = {
  open:   { label: 'Đang tuyển', variant: 'green' },
  closed: { label: 'Đã đóng',   variant: 'gray'  },
  draft:  { label: 'Nháp',      variant: 'amber' },
}

export const SRC_COLOR: Record<string, string> = {
  LinkedIn:  '#0a66c2',
  JobStreet: '#e15a2b',
  Referral:  '#7c3aed',
  Website:   '#22c55e',
}

export const JOBS: Job[] = [
  { id: 1, title: 'Senior Frontend Engineer',   branch: 'Hà Nội',  dept: 'Engineering',    count: 3, applied: 12, interviewed: 4, offered: 1, status: 'open',   start: '01/05/2026', end: '31/05/2026', jp: 'N3', salary: '40-55M', owner: 'Hoàng Đức Thành', desc: 'Tuyển kỹ sư Frontend giàu kinh nghiệm Vue.js/React. Có kinh nghiệm làm việc với team Nhật là lợi thế.' },
  { id: 2, title: 'BrSE (Bridge SE)',            branch: 'Hà Nội',  dept: 'Engineering',    count: 2, applied:  8, interviewed: 3, offered: 0, status: 'open',   start: '15/04/2026', end: '15/06/2026', jp: 'N2', salary: '55-75M', owner: 'Lê Quang Huy',    desc: 'Cầu nối kỹ thuật giữa team Việt Nam và khách hàng Nhật Bản. Yêu cầu JLPT N2 hoặc tương đương.' },
  { id: 3, title: 'DevOps Engineer',             branch: 'Đà Nẵng', dept: 'Infrastructure', count: 1, applied:  5, interviewed: 2, offered: 1, status: 'open',   start: '10/05/2026', end: '10/06/2026', jp: '—',  salary: '45-60M', owner: 'Bùi Đức Thành',   desc: 'Quản trị hạ tầng Kubernetes, CI/CD, observability (Grafana, Prometheus). AWS hoặc GCP experience bắt buộc.' },
  { id: 4, title: 'QA Automation Engineer',      branch: 'Hà Nội',  dept: 'Quality',        count: 2, applied:  9, interviewed: 5, offered: 2, status: 'open',   start: '20/04/2026', end: '20/05/2026', jp: 'N3', salary: '30-42M', owner: 'Trần Thị Mai',    desc: 'Xây dựng automation test framework (Playwright, Cypress). Kinh nghiệm API testing và CI integration.' },
  { id: 5, title: 'Product Manager',             branch: 'Đà Nẵng', dept: 'Product',        count: 1, applied:  6, interviewed: 2, offered: 0, status: 'open',   start: '05/05/2026', end: '05/07/2026', jp: 'N3', salary: '50-70M', owner: 'Phạm Thu Hà',     desc: 'PM cho sản phẩm ERP cloud B2B. 3+ năm kinh nghiệm, có khả năng giao tiếp tiếng Nhật tốt.' },
  { id: 6, title: 'Junior Backend Developer',    branch: 'HCM',     dept: 'Engineering',    count: 3, applied: 22, interviewed: 8, offered: 3, status: 'open',   start: '01/04/2026', end: '30/04/2026', jp: '—',  salary: '18-28M', owner: 'Lê Quang Huy',    desc: 'Java Spring Boot / Go developer. Fresh hoặc 1 năm kinh nghiệm. Môi trường mentoring tốt.' },
  { id: 7, title: 'UI/UX Designer',              branch: 'Hà Nội',  dept: 'Design',         count: 1, applied: 14, interviewed: 4, offered: 1, status: 'closed', start: '01/03/2026', end: '31/03/2026', jp: '—',  salary: '25-38M', owner: 'Vũ Thị Lan',      desc: 'Thiết kế giao diện web/app B2B. Proficient Figma, có portfolio solid.' },
  { id: 8, title: 'Data Analyst',                branch: 'HCM',     dept: 'Data & BI',      count: 2, applied:  7, interviewed: 1, offered: 0, status: 'draft',  start: '01/06/2026', end: '31/07/2026', jp: 'N3', salary: '35-50M', owner: 'Hoàng Đức Thành',  desc: 'Phân tích dữ liệu sản phẩm và business. Python, SQL, Tableau/Redash.' },
]

export const APPLICANTS: Partial<Record<number, Applicant[]>> = {
  1: [
    { name: 'Nguyễn Minh Khoa', src: 'LinkedIn',  applied: '18/05/2026', stage: 'interview', note: '3Y exp Vue.js, portfolio tốt. Cần check JP level.' },
    { name: 'Trần Văn Phong',   src: 'JobStreet', applied: '15/05/2026', stage: 'review',    note: '4Y React, không có JP. Kinh nghiệm fintech.' },
    { name: 'Phạm Thu Linh',    src: 'Referral',  applied: '10/05/2026', stage: 'offer',     note: 'Ex-Tiki, 5Y, N3. Đề xuất offer 52M.' },
    { name: 'Lê Đức Anh',       src: 'LinkedIn',  applied: '08/05/2026', stage: 'screened',  note: 'Fresh grad + internship 1Y. Potential cao.' },
    { name: 'Hoàng Thị Tâm',    src: 'Website',   applied: '05/05/2026', stage: 'rejected',  note: 'Không pass technical test round 1.' },
  ],
}

export const FALLBACK_APPLICANTS: Applicant[] = [
  { name: 'Nguyễn Minh Khoa', src: 'LinkedIn',  applied: '18/05/2026', stage: 'interview', note: '3Y exp, portfolio tốt.' },
  { name: 'Trần Văn Phong',   src: 'JobStreet', applied: '15/05/2026', stage: 'review',    note: '4Y kinh nghiệm, không có JP.' },
  { name: 'Phạm Thu Linh',    src: 'Referral',  applied: '10/05/2026', stage: 'offer',     note: '5Y, N3. Đề xuất 52M.' },
  { name: 'Lê Đức Anh',       src: 'LinkedIn',  applied: '08/05/2026', stage: 'screened',  note: 'Fresh + intern 1Y.' },
  { name: 'Hoàng Thị Tâm',    src: 'Website',   applied: '05/05/2026', stage: 'rejected',  note: 'Không pass test R1.' },
]
