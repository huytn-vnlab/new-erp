// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript types — Micro ERP SPA v3
// All pages and composables should import from here instead of using `any`.
// ─────────────────────────────────────────────────────────────────────────────

// ── Generic API shapes ────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  status:  number    // 1 = success, 0 = fail
  message: string
  data?:   T
}

export interface PaginatedData<T> {
  items:       T[]
  total:       number
  page:        number
  limit:       number
  total_pages: number
}

export interface Pagination {
  page:  number
  limit: number
  total: number
}

/** Pagination shape returned by the Go backend APIs */
export interface BackendPage {
  current_page: number
  total_row:    number
  row_per_page: number
}

// ── Auth / Token ──────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email:           string
  password:        string
  organization_id: number
}

export interface TokenPair {
  token:         string
  refresh_token: string
}

export interface RefreshRequest {
  refresh_token: string
}

// ── User ──────────────────────────────────────────────────────────────────────

/**
 * Normalized user shape stored in shared state after /api/user/getuser.
 * Backend returns first_name + last_name + role_id; we normalize here.
 */
export interface AuthUser {
  id:               number
  email:            string
  full_name:        string        // built from first_name + ' ' + last_name
  first_name?:      string
  last_name?:       string
  avatar?:          string | null
  role_id:          number        // 1=user · 2=manager · 3=generalManager
  is_admin:         boolean       // role_id >= 2
  organization_id:  number
  organization_name?: string
  language_id?:     number
  branch?:          number | null
  func_permission?: Record<number, any>  // module permission map from backend
  setting_step?:    number
}

// ── User profile sub-types ────────────────────────────────────────────────────

export interface ProfileSkill {
  title: string
  years_of_experience: number | null
}

export interface ProfileLanguage {
  language_id: number | null
  level_id:    number | null
  certificate: string
}

export interface ProfileEducation {
  title?:          string
  description:     string
  university:      string
  achievement:     string
  academic_level:  string
  major:           string
  specialize:      string
  rank:            string
  start_date:      string | null
  end_date:        string | null
}

export interface ProfileAward {
  title:       string
  description: string
}

export interface ProfileProject {
  start_date:   string
  end_date:     string
  position:     string
  description:  string
  technology?:  string
}

export interface ProfileExperience {
  company:  string
  projects: ProfileProject[]
}

export interface ProfileInterestTechnology {
  id?:              number | null
  technology_name:  string
}

/** Full profile returned by /api/user/get-user-info */
export interface UserProfile {
  // Core identity
  id?:              number
  user_id?:         number
  email:            string
  full_name:        string
  first_name?:      string
  last_name?:       string
  avatar?:          string | null

  // Auth / role
  role_id?:         number
  role_name?:       string
  organization_id?: number

  // Work info (left panel)
  employee_id?:         string
  department?:          string
  job_title?:           string | number
  job_title_name?:      string
  job_position?:        string
  work_place?:          string
  rank?:                string | number
  rank_name?:           string
  branch?:              number | null
  branch_id?:           number | null
  branch_name?:         string
  company_joined_date?: string
  start_date?:          string
  status?:              number
  date_severance?:      string
  reasons_severance?:   string

  // Personal / contact
  phone?:               string
  phone_number?:        string
  birthday?:            string
  date_of_birth?:       string
  address?:             string
  personal_email?:      string
  marital_status?:      string
  gender?:              number

  // Identity document
  identity_card?:         string
  id_type?:               number
  date_of_identity_card?: string
  place_of_issue?:        string
  user_birth_place?:      string
  place_of_birth?:        string

  // Tax / insurance / bank
  tax_code?:            string
  account_number_vcb?:  string
  book_number_bhxh?:    string

  // Address
  permanent_residence?: string
  current_address?:     string

  // Nationality
  country?:  string
  nation?:   string
  religion?: string

  // Emergency contact
  name_of_emergency?:             string
  relationships_of_emergency?:    string
  address_of_emergency?:          string
  license_plates?:                string

  // Profile sections (arrays)
  skill?:               ProfileSkill[]
  language?:            ProfileLanguage[]
  education?:           ProfileEducation[]
  award?:               ProfileAward[]
  experience?:          ProfileExperience[]
  interest_technology?: ProfileInterestTechnology[]
  introduce?:           string
  bio?:                 string
  joined_at?:           string

  // Legacy v3 simplified fields
  skills?:        Array<{ id: number; name: string }>
  technologies?:  Array<{ id: number; name: string }>
}

/** Slim member shape used in dropdowns / lists */
export interface Member {
  id:        number
  full_name: string
  email?:    string
  avatar?:   string | null
}

// ── Organization ──────────────────────────────────────────────────────────────

export interface Organization {
  id:        number
  name:      string
  code:      string
  email:     string
  logo?:     string
  phone?:    string
  address?:  string
  created_at?: string
}

// ── Branch / Job title ────────────────────────────────────────────────────────

export interface Branch {
  id:       number
  name:     string
  address?: string
  phone?:   string
}

export interface JobTitle {
  id:   number
  name: string
}

// ── Leave ─────────────────────────────────────────────────────────────────────

/** 0 = pending · 1 = approved · 2 = rejected */
export type LeaveStatus = 0 | 1 | 2

export interface LeaveType {
  id:   number
  name: string
}

export interface LeaveRequest {
  id:             number
  user_id:        number
  full_name?:     string
  leave_type_id:  number
  leave_type?:    string
  start_date:     string
  end_date:       string
  days:           number
  reason?:        string
  status:         LeaveStatus
  reject_reason?: string
  created_at:     string
}

export interface LeaveBalance {
  total_days:     number
  used_days:      number
  remaining_days: number
  year:           number
}

export interface DayLeave {
  id:             number
  user_id:        number
  full_name?:     string
  year:           number
  total_days:     number
  used_days:      number
  remaining_days: number
  note?:          string
  created_at?:    string
}

// ── Timekeeping ───────────────────────────────────────────────────────────────

/**
 * Backend returns check_in_time / check_out_time as formatted strings
 * e.g. "2024/05/07 09:00 AM"  (format: YYYY/MM/DD hh:mm A)
 * status is an integer (0=none, 1=accepted, 2=rejected, 3=pending)
 */
export interface TimekeepingRecord {
  id:                   number
  user_id?:             number
  full_name?:           string
  check_in_time:        string        // "2024/05/07 09:00 AM" or ""
  check_out_time:       string        // "2024/05/07 06:00 PM" or ""
  status:               number        // 0=none,1=accepted,2=rejected,3=pending
  reason?:              string
  edit_check_in_time?:  string
  edit_check_out_time?: string
  risky_update?:        boolean
}

// ── Overtime ──────────────────────────────────────────────────────────────────

/**
 * Overtime request shape returned by /overtime/get-overtime-requests.
 * The backend stores from/to as datetime strings (ISO) plus separate hour/minute fields.
 * status: 1=pending · 2=approved · 3=rejected (backend convention)
 */
export interface OvertimeRequest {
  id:                     number
  employee_id?:           string
  full_name?:             string
  branch?:                string
  project_name?:          string
  status:                 number   // 1=pending · 2=approved · 3=rejected
  overtime_type?:         number
  work_at_noon?:          number
  datetime_overtime_from: string   // ISO datetime string
  datetime_overtime_to:   string   // ISO datetime string
  hour_from?:             number
  minute_from?:           number
  hour_to?:               number
  minute_to?:             number
}

// ── Recruitment ───────────────────────────────────────────────────────────────

/** 0 = open · 1 = interviewing · 2 = closed · 3 = cancelled */
export type RecruitmentStatus = 0 | 1 | 2 | 3

export interface Recruitment {
  id:           number
  title:        string
  position?:    string
  description?: string
  quantity:     number
  deadline?:    string
  salary_range?: string
  status:       RecruitmentStatus
  created_by?:  number
  created_at:   string
}

export interface Candidate {
  id:             number
  recruitment_id: number
  full_name:      string
  email:          string
  phone?:         string
  cv_url?:        string
  note?:          string
  status:         number
  created_at:     string
}

// ── Project ───────────────────────────────────────────────────────────────────

/** 0 = not started · 1 = in progress · 2 = done · 3 = paused */
export type ProjectStatus = 0 | 1 | 2 | 3

export interface Project {
  id:            number
  name:          string
  code:          string
  description?:  string
  start_date?:   string
  end_date?:     string
  status:        ProjectStatus
  member_count?: number
  task_count?:   number
  members?:      ProjectMember[]
}

export interface ProjectMember {
  user_id:   number
  full_name: string
  email?:    string
  role?:     string
}

/** 0 = todo · 1 = in progress · 2 = review · 3 = done */
export type TaskStatus = 0 | 1 | 2 | 3

/** 0 = low · 1 = medium · 2 = high · 3 = urgent */
export type TaskPriority = 0 | 1 | 2 | 3

export interface Task {
  id:             number
  project_id:     number
  title:          string
  description?:   string
  status:         TaskStatus
  priority:       TaskPriority
  assignee_id?:   number
  assignee_name?: string
  due_date?:      string
  created_at:     string
}

// ── Evaluation ────────────────────────────────────────────────────────────────

/** 0 = draft · 1 = submitted */
export type EvalStatus = 0 | 1

export interface EvalScores {
  performance:   number
  quality:       number
  teamwork:      number
  communication: number
  initiative:    number
}

export interface Evaluation {
  id:          number
  user_id:     number
  full_name?:  string
  email?:      string
  period:      string
  year:        number
  quarter?:    number
  scores:      EvalScores
  total_score: number
  comment?:    string
  status:      EvalStatus
  created_at:  string
}

// ── Assets ────────────────────────────────────────────────────────────────────

/** 0 = in use · 1 = available · 2 = maintenance · 3 = broken */
export type AssetStatus = 0 | 1 | 2 | 3

export interface Asset {
  id:              number
  name:            string
  code:            string
  category?:       string
  value?:          number
  purchase_date?:  string
  status:          AssetStatus
  location?:       string
  description?:    string
  assigned_user?:  Member
}

/** 0 = pending · 1 = approved · 2 = rejected · 3 = returned */
export type AssetRequestStatus = 0 | 1 | 2 | 3

export interface AssetRequest {
  id:           number
  user_id:      number
  full_name?:   string
  asset_id:     number
  asset_name?:  string
  asset_code?:  string
  reason?:      string
  request_date: string
  return_date?: string
  approved_at?: string
  status:       AssetRequestStatus
}

// ── Contract ──────────────────────────────────────────────────────────────────

/** 0 = pending · 1 = active · 2 = expired · 3 = terminated */
export type ContractStatus = 0 | 1 | 2 | 3

export interface ContractType {
  id:               number
  name:             string
  duration_months?: number
  description?:     string
}

export interface Contract {
  id:                   number
  user_id:              number
  full_name?:           string
  contract_type_id:     number
  contract_type_name?:  string
  contract_number:      string
  salary?:              number
  start_date:           string
  end_date?:            string
  status:               ContractStatus
  note?:                string
  created_at:           string
}

// ── Notification ──────────────────────────────────────────────────────────────

/**
 * Notification shape returned by /notification/get-notifications.
 * status: 1 = Unread · 2 = Read · 3 = Seen
 */
export interface Notification {
  id:             number
  sender?:        string    // sender display name
  content:        string    // notification message
  status:         number    // 1=Unread · 2=Read · 3=Seen
  redirect_url?:  string
  created_at:     string    // "YYYY-MM-DD HH:MM"
  avatar_sender?: string    // base64-encoded avatar image
}

// ── Settings / misc ───────────────────────────────────────────────────────────

export interface Holiday {
  id:         number
  name:       string
  start_date: string
  end_date:   string
  year:       number
}

export interface Technology {
  id:        number
  name:      string
  category?: string
}

export interface UserPermission {
  user_id: number
  modules: string[]
}

export interface SmtpSettings {
  host:       string
  port:       number
  user:       string
  password?:  string
  from_name:  string
  from_email: string
  tls:        boolean
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface MonthlyPoint {
  month: string   // "2024-01"
  value: number
}

export interface DashboardStats {
  leave_remaining:       number
  timekeeping_today:     boolean
  unread_notifications:  number
  active_projects:       number
}

// ── Table column ─────────────────────────────────────────────────────────────

export interface TableColumn {
  key:     string
  label:   string
  width?:  string
  align?:  'left' | 'center' | 'right'
}

// ── Select option ─────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}
