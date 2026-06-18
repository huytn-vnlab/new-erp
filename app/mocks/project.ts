type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

export type ProjectStatus = 'pending' | 'active' | 'ended'

export type ProjectTarget = {
  id: number
  year: number
  quarter: number
  weight: number
  content: string
}

export type Project = {
  id: number
  name: string
  desc: string
  status: ProjectStatus
  manager: string
  branch: string
  start: string   // dd/MM/yyyy
  end: string     // dd/MM/yyyy or '—'
  members: number
  tech: string[]
  targets: ProjectTarget[]
}

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Chờ khởi động',  variant: 'amber' },
  active:  { label: 'Đang hoạt động', variant: 'green' },
  ended:   { label: 'Đã kết thúc',    variant: 'gray'  },
}

export const PROJECTS_INIT: Project[] = [
  { id: 1, name: 'Cổng thanh toán XYZ',      desc: 'Tích hợp cổng thanh toán cho hệ thống thương mại điện tử khách hàng Nhật Bản.',      status: 'active',  manager: 'Hoàng Đức Thành', branch: 'Hà Nội',  start: '15/01/2025', end: '30/09/2026', members: 12, tech: ['Vue.js','Node.js','AWS'],
    targets: [
      { id: 11, year: 2026, quarter: 3, weight: 5, content: '1. Hoàn thiện tích hợp VNPay & Aeon installment.\n2. Đạt tỉ lệ giao dịch thành công ≥ 99.5%.\n3. Trình bày thành quả ở mục tự đánh giá cuối quý.' },
      { id: 12, year: 2026, quarter: 2, weight: 4, content: '1. Triển khai OAuth2 refresh token flow.\n2. Webhook retry với exponential backoff.' },
    ] },
  { id: 2, name: 'Hệ thống CRM nội bộ',       desc: 'Xây dựng CRM tích hợp cho team sales và support nội bộ VNLab.',                        status: 'active',  manager: 'Phạm Thu Hà',     branch: 'Đà Nẵng', start: '08/09/2024', end: '15/07/2026', members:  7, tech: ['React','PostgreSQL'],
    targets: [
      { id: 21, year: 2026, quarter: 3, weight: 5, content: '1. Hoàn thiện pipeline deal tracking.\n2. Báo cáo doanh thu monthly theo segment.' },
    ] },
  { id: 3, name: 'App giao đồ ăn FoodGo',     desc: 'Mobile app cho người dùng cuối và driver delivery. Flutter + FastAPI.',                status: 'active',  manager: 'Lê Quang Huy',    branch: 'HCM',     start: '22/11/2024', end: '12/12/2026', members: 18, tech: ['Flutter','Python','Docker'],
    targets: [
      { id: 31, year: 2026, quarter: 3, weight: 5, content: '1. Lựa chọn những task có khả năng KAIZEN thông qua AI, RPA.\n2. Trình bày về thành quả KAIZEN ở mục tự đánh giá cuối quý.' },
    ] },
  { id: 4, name: 'Quản lý kho ABC v2',         desc: 'Nâng cấp hệ thống quản lý kho hàng từ monolith sang microservices.',                   status: 'active',  manager: 'Trần Thị Mai',    branch: 'Hà Nội',  start: '04/03/2025', end: '20/08/2026', members:  9, tech: ['Java','Kubernetes'], targets: [] },
  { id: 5, name: 'Module báo cáo BI',          desc: 'Dashboard phân tích dữ liệu real-time cho ban lãnh đạo.',                              status: 'pending', manager: 'Vũ Thị Lan',      branch: 'Đà Nẵng', start: '01/10/2025', end: '01/10/2026', members:  4, tech: ['Python','Grafana','Redash'],
    targets: [
      { id: 51, year: 2026, quarter: 4, weight: 3, content: '1. Setting mục tiêu KAIZEN 15% theo phương châm của tập đoàn.\n2. Hoàn thiện dashboard real-time cho ban lãnh đạo.' },
    ] },
  { id: 6, name: 'Hệ thống tuyển dụng',        desc: 'Nội bộ hóa quy trình tuyển dụng — ATS tích hợp ERP.',                                  status: 'pending', manager: 'Đỗ Minh Tuấn',    branch: 'Hà Nội',  start: '15/09/2024', end: '—',          members:  6, tech: ['Vue.js','Go'], targets: [] },
  { id: 7, name: 'Mobile companion app',        desc: 'iOS/Android companion cho hệ thống ERP — check-in, xem slip lương, OT.',               status: 'active',  manager: 'Bùi Đức Thành',   branch: 'Osaka',   start: '10/11/2024', end: '28/02/2027', members: 11, tech: ['React Native','TypeScript','AWS'], targets: [] },
  { id: 8, name: 'Cổng tích hợp API v3',       desc: 'Refactor API gateway layer sang REST + gRPC với rate limiting và observability.',      status: 'active',  manager: 'Hoàng Đức Thành', branch: 'Hà Nội',  start: '01/02/2026', end: '15/06/2026', members:  8, tech: ['Go','Redis','Kafka'],
    targets: [
      { id: 81, year: 2026, quarter: 2, weight: 5, content: '1. Refactor sang REST + gRPC.\n2. Triển khai rate limiting + observability stack.' },
    ] },
  { id: 9, name: 'Security audit & hardening', desc: 'Kiểm toán bảo mật toàn diện trước ISO 27001.',                                        status: 'ended',   manager: 'Lê Quang Huy',    branch: 'HCM',     start: '01/12/2024', end: '28/02/2026', members:  5, tech: ['OWASP','Trivy'],
    targets: [
      { id: 91, year: 2025, quarter: 4, weight: 5, content: '1. Hoàn thành kiểm toán OWASP Top 10.\n2. Đạt chứng nhận ISO 27001.' },
    ] },
]

export const ALL_MEMBERS = [
  'Nguyễn Văn An', 'Trần Thị Mai', 'Lê Quang Huy', 'Phạm Thu Hà',
  'Đỗ Minh Tuấn', 'Hoàng Đức Thành', 'Vũ Thị Lan', 'Bùi Đức Thành',
  'Ngô Thanh Tùng', 'Đặng Thị Hồng', 'Lý Quỳnh Anh', 'Trần Ngọc Huy', 'Trần Cao Quý',
]

export const ALL_TECH = ['Vue.js','React','React Native','Angular','TypeScript','Node.js','Go','Python','Java','PHP','Flutter','AWS','Docker','Kubernetes','PostgreSQL','MongoDB','Redis','Kafka','GraphQL','gRPC']
