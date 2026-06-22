export type Trend = { dir: 'up' | 'down'; value: string }
export type StatCardData = {
  label: string; icon: string; value: string | number
  trend?: Trend; sublabel?: string; sparkData: number[]
  breakdown: { label: string; value: string | number }[]
}
export type TabItem = { value: string; label: string }

// ── API response envelope ──────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  status: number
  message: string
  data: T | null
}

// ── Auth ──────────────────────────────────────────────────────────────────
export interface Organization {
  id: number
  name: string
  code: string
  email: string
  logo?: string
  phone?: string
  address?: string
  created_at?: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  role_id?: number
  role_name?: string
  branch?: number
  branch_name?: string
  avatar?: string | null
  [key: string]: unknown
}

export interface LoginCredentials {
  email: string
  password: string
  organization_id?: number
}

// ── Pagination ────────────────────────────────────────────────────────────
export interface Pagination {
  current_page: number
  total_row: number
  row_per_page: number
}

// ── HRM: Member ───────────────────────────────────────────────────────────
export interface MemberRow {
  id: number
  first_name: string
  last_name: string
  email: string
  branch: string
  role: string
  job_title?: number
  company_joined_date: string
  avatar: string | null
  status: number
}

export interface MemberDetail {
  user_id: number
  first_name: string
  last_name: string
  email: string
  personal_email: string | null
  phone_number: string
  birthday: string | null
  role_id: number
  role_name: string
  job_title: number
  job_title_name: string
  rank: number
  rank_name: string
  department: string
  job_position: string
  work_place: string
  company_joined_date: string | null
  employee_id: string
  avatar: string
  branch: number
  branch_name: string
  introduce: string
  status: number
  skill: unknown[]
  language: unknown[]
  education: unknown[]
  experience: unknown[]
  award: unknown[]
  current_address: string
  permanent_residence: string
  identity_card: string
  date_of_identity_card: string
  tax_code: string
  name_of_emergency: string
  relationships_of_emergency: string
  address_of_emergency: string
}

export interface BranchItem { id: number; name: string }
export interface JobTitleItem { id: number; name: string }
export interface TechItem { id: number; name: string; category?: string }

// ── Leave ─────────────────────────────────────────────────────────────────
export interface LeaveInfo {
  day_bonus: number
  day_remaining: number
  day_remaining_previous: number
  day_used: number
  holidays: string[]
  leave_bonus_types: Record<string, string> | null
  leave_request_types: Record<string, string> | null
  user_info: { email: string; phone_number: string; full_name: string; avatar: string | null }
}

export interface LeaveRequest {
  id: number
  user_id: number
  full_name: string
  avatar: string | null
  branch: string
  leave_request_type: string
  datetime_leave_from: string
  datetime_leave_to: string
  reason: string
  status: number
  created_at: string
}

export interface LeaveBonusRow {
  id: number
  user_id: number
  full_name: string
  created_by: string
  reason: string
  year: number
  hour: number
  leave_bonus_type: string
  created_at: string
}

// ── Timekeeping ───────────────────────────────────────────────────────────
export interface TimekeepingRow {
  id: number
  user_id: number
  full_name: string
  avatar: string | null
  date: string
  check_in: string | null
  check_out: string | null
  total_time: number
  note: string
  branch: string
}

// ── Asset ─────────────────────────────────────────────────────────────────
export interface AssetRow {
  id: number
  asset_code: string
  asset_name: string
  asset_type_id: number | null
  asset_type_name?: string
  branch_id: number | null
  branch_name?: string
  user_id: number | null
  user_name?: string
  status: number | null
  purchase_price: number
  date_of_purchase: string
  description: string
  created_at: string
}

export interface AssetType { id: number; name: string }

// ── Contract ──────────────────────────────────────────────────────────────
export interface ContractRow {
  id: number
  user_id: number
  first_name: string
  last_name: string
  avatar: string | null
  branch_id: number
  branch_name?: string
  contract_type_id: number
  contract_type_name: string | null
  contract_start_date: string | null
  contract_end_date: string | null
  total_salary: string
  currency_unit: number
}

export interface ContractType {
  contract_type_id: number
  name: string
  file_template_name: string
  created_at: string
}

// ── Evaluation ────────────────────────────────────────────────────────────
export interface EvaluationRow {
  id: number
  name: string
  updated_by_name: string
  quarter: string
  year: string
  branch: number
  status: number
  last_updated: number
  updated_by: number
  avatar: string
}

// ── Project ───────────────────────────────────────────────────────────────
export interface ProjectRow {
  project_id: number
  project_name: string
  managed_by: number
  project_description?: string
  project_targets?: { year: number | null; quarter: number | null; content: string | null }[]
  created_at?: string
}

// ── Overtime ──────────────────────────────────────────────────────────────
export interface OvertimeRow {
  id: number
  user_id: number
  full_name?: string
  avatar?: string | null
  project_id: number
  project_name?: string
  datetime_overtime_from: string
  datetime_overtime_to: string
  reason: string
  status: number
  overtime_type: number
  created_at?: string
}

// ── Recruitment ──────────────────────────────────────────────────────────
export interface JobRow {
  id: number
  title: string
  description: string
  status: number
  created_at: string
  branch: string
  quantity: number
  tech_requirements?: string
}

export interface CvRow {
  id: number
  full_name: string
  email: string
  phone: string
  job_id: number
  job_title?: string
  status: number
  cv_file?: string
  created_at: string
}

// ── Settings ─────────────────────────────────────────────────────────────
export interface HolidayRow {
  id: number
  name: string
  date: string
  organization_id: number
}

export interface OrgSetting {
  organization_id: number
  name: string
  email: string
  phone?: string
  address?: string
  logo?: string
  day_remaining_annual_leave_reset: number
}
