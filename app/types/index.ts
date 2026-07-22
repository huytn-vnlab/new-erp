export type Trend = { dir: 'up' | 'down'; value: string }
export type StatCardData = {
  label: string; icon: string; value: string | number
  trend?: Trend; sublabel?: string; sparkData?: number[]
  breakdown?: { label: string; value: string | number }[]
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

// /api/user/getuser has no `branch_name`/`job_title_name`/`rank_name` — only a
// numeric `branch` id resolved via `branch_list_box` (id→name map).
export interface AuthUser {
  id: number
  name: string
  email: string
  role_id?: number
  role_name?: string
  branch?: number
  branch_list_box?: Record<string, string>
  phone_number?: string
  birthday?: string
  avatar?: string | null
  user_rank_logs?: { rank: number; created_at: string }[] | null
  // Already resolved server-side (personal override if set, else org default).
  work_start_time?: string
  lunch_break_start_time?: string
  lunch_break_end_time?: string
  work_end_time?: string
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

// ── HRM: Member display types ─────────────────────────────────────────────
export type MemberStatus = 'active' | 'onboarding' | 'leave' | 'inactive'

export interface Member {
  id: number
  name: string
  email: string
  branch: string
  role: string
  phone: string
  jp: string
  rank: string
  join: string
  status: MemberStatus
  jobTitleId: number
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
  job_position?: string
  phone_number?: string
  company_join_date?: string
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
  skill: { title: string; years_of_experience: number }[]
  language: { language_name?: string; level?: string; certificate?: string }[]
  education: {
    achievement?: string; university?: string; academic_level?: string
    major?: string; specialize?: string; rank?: string
    start_date?: string; end_date?: string; description?: string
  }[]
  experience: {
    company: string
    projects: { position: string; start_date?: string; end_date?: string; technology?: string }[]
  }[]
  award: { title?: string; description?: string }[]
  current_address: string
  permanent_residence: string
  identity_card: string
  id_type: string
  date_of_identity_card: string
  place_of_issue: string
  tax_code: string
  country: string
  user_birth_place: string
  name_of_emergency: string
  relationships_of_emergency: string
  address_of_emergency: string
  // Personal work-hour override — empty string means "no override, uses the
  // organization default". `effective_*` is the already-resolved value
  // (override if set, else the org default) ready for direct display/use.
  work_start_time: string
  lunch_break_start_time: string
  lunch_break_end_time: string
  work_end_time: string
  effective_work_start_time: string
  effective_lunch_break_start_time: string
  effective_lunch_break_end_time: string
  effective_work_end_time: string
}

// GetBranches/GetJobTitles/GetTechnologies all return a raw array (`id`/`name`
// only) — no `category` on technology (the backend has no such column at all),
// no `priority` (write-only: required on create, never read back).
export interface BranchItem { id: number; name: string }
export interface JobTitleItem { id: number; name: string }
export interface TechItem { id: number; name: string }

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
  leave_request_type_id?: number
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
  leave_bonus_type_id: number
  leave_bonus_type: string
  created_at: string
}

export interface AllUserLeaveInfo {
  user_id: number
  full_name: string
  email: string
  branch_name: string
  day_used: number
  day_remaining: number
  day_remaining_previous: number
  status: number
}

// ── Timekeeping ───────────────────────────────────────────────────────────
// Wire shape of POST /timekeeping/get-all-timekeeping-user — one row per
// check-in/check-out event for the current user. check_in_time/check_out_time
// are full display strings formatted "yyyy/MM/dd hh:mm AM" (cf.FormatDisplayTimekeeping).
// `status`/`reason`/`edit_*` describe the EDIT-REQUEST approval state for this
// record (0 none, 1 accepted, 2 rejected, 3 pending) — not attendance quality.
export interface TimekeepingMineRow {
  id: number
  check_in_time: string
  check_out_time: string
  status: number
  reason: string
  edit_check_in_time: string
  edit_check_out_time: string
}

// Wire shape of POST /timekeeping/get-all-timekeeping — one row per employee
// per day (min check-in / max check-out that day). check_in_time/check_out_time
// are formatted "yyyy-MM-dd HH:mm" (cf.FormatDateNoSec) — different from the
// "mine" endpoint's format above.
export interface TimekeepingTeamRow {
  id: number
  updated_by: number
  user_name: string
  branch: string
  check_in_time: string
  check_out_time: string
  status: number
}

// ── Asset ─────────────────────────────────────────────────────────────────
// Wire shape of /asset/get-assets-list's `asset_list[]` items. Note: no
// branch_name/user_name/asset_type_name — resolve via the response's
// `branches`/`users` ID→name maps, and `asset_type` (not asset_type_name).
export interface AssetRow {
  asset_id: number
  asset_code: string
  asset_name: string
  asset_type_id: number | null
  asset_type?: string
  branch_id: number | null
  user_id: number | null
  managed_by: number | null
  status: number | null
  status_req: number
  purchase_price: number
  date_of_purchase: string
  date_started_use: string
  license_end_date: string
  depreciation_period: number
  description: string
  created_at: string
}

export interface AssetType { id: number; name: string }

export interface AssetRequestRow {
  id: number
  asset_id: number
  asset_name: string
  asset_code: string
  asset_type: string
  description: string
  created_by: number
  branch: string
  status: number
  managed_by: number
}

// Wire shape of /asset/get-assets-log's `asset_histories[]` items.
export interface AssetLogRow {
  asset_id: number
  asset_name: string
  asset_code: string
  asset_type_name: string
  branch_id: number
  user_id: number
  first_name: string
  last_name: string
  status: number
  date_started_use: string
  start_day_using: string
  end_day_using: string
}

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
  company_joined_date: string | null
}

export interface ContractByUserRow {
  id: number
  contract_type_id: number
  contract_type_name: string | null
  contract_file_name: string
  contract_start_date: string | null
  contract_end_date: string | null
  insurance_salary: string
  subsidies_salary: number | null
  total_salary: string
  currency_unit: string
  labor_contract_number: string
  contract_creation_date: string
  file_path: string
}

export interface ContractType {
  contract_type_id: number
  name: string
  file_template_name: string
  file_template_content?: string
  created_at: string
  updated_at?: string
}

// ── Evaluation ────────────────────────────────────────────────────────────
// Wire shape of POST /evaluation/search-evaluation-list's `evaluations[]` items.
// `rank` is the raw backend enum (1=D,2=A,3=B,4=C,5=S via cf.EvaluationRankList).
// `point` is the weighted total score (Content.Result.Points), same value the
// employee/reviewer sees on the form — 0 until the form has been saved once.
export interface EvaluationRow {
  id: number
  name: string
  updated_by_name: string
  quarter: number
  year: number
  branch: number
  rank: number
  point: number
  status: number
  last_updated: string
  updated_by: number
  avatar: string | null
}

// Wire shape of the `content` jsonb column (m.Content on the backend) — used by
// get/create/update-evaluation. Common is a single goal (not a list); Individual/
// Projects/Challenges carry their own weight+self/superior split; Result is the
// computed summary the frontend must derive and send (backend does not compute it).
export interface EvalCommon {
  value: string
  numeric: number
  actual_eval: number
  completion_rate: number
  points: number
  weight: number
}
export interface EvalIndividual {
  weight: number
  item: string
  goal: number
  actual_eval: number
  completion_rate: number
  points: number
}
export interface EvalProject {
  id: number
  self_assessment: number
  superior_eval: number
  points: number
  weight: number
}
export interface EvalChallenge {
  name: string
  actions: string
  self_assessment: number
  superior_eval: number
  points: number
  weight: number
}
export interface EvalComment {
  self_cmt: string
  superior_cmt: string
  jiken_cmt: string
}
export interface EvalResult {
  total_actual_eval: number
  completion_rate: number
  points: number
  weight: number
  rank: number
}
export interface EvalContent {
  common: EvalCommon
  individuals: EvalIndividual[]
  projects: EvalProject[]
  challenges: EvalChallenge[]
  comment: EvalComment
  result: EvalResult
}

// Wire shape of POST /evaluation/get-evaluation's `data`.
export interface EvaluationDetail {
  id: number
  user_id: number
  status: number
  content: EvalContent
  updated_by: number
  quarter: number
  year: number
  jp_lang_level: Record<string, string>
}

// ── Project ───────────────────────────────────────────────────────────────
// Backend's Target model (m.Target) — no `id` and no `weight`, just these 3
// fields; a target list is a plain unordered JSON array with no server-side identity.
export interface ProjectTarget {
  year: number
  quarter: number
  content: string
}

// cf.ProjectStatusActive / cf.ProjectStatusEnded — added after the module
// originally shipped with no status concept; a DB migration backfilled every
// existing row to 1 (active), and 0/omitted on create or update also defaults
// to active server-side.
export type ProjectStatus = 1 | 2

// Wire shape shared by /project/get-project-list's `projects[]` items and
// /user-project/get-projects-user-join's items. `managed_by` is always the raw
// user ID (resolve the display name via the response's `users` id→name map).
export interface ProjectRow {
  project_id: number
  project_name: string
  managed_by: number
  status: ProjectStatus
  project_description?: string
  project_targets?: ProjectTarget[]
  created_at?: string
  updated_at?: string
}

// Wire shape of POST /project/get-project-details's `data` — the authoritative
// single-project fetch used to populate the edit form and detail drawer (the
// list row's `project_targets`/`managed_by` are sufficient for display but this
// is the source used right before an edit, kept separate in case of future drift).
export interface ProjectDetail {
  project_id: number
  name: string
  description: string
  targets: ProjectTarget[]
  managed_by: number
  status: ProjectStatus
  users: Record<string, string>
  users_id_join_project: number[]
}

// One row of POST /user-project/get-user-project's `user_projects[]` — `id` is
// the user_projects join-table row id, required by /remove-user-from-project
// (which deletes by that id, not by user_id+project_id).
export interface ProjectMemberRow {
  id: number
  user_id: number
  date_joined: string
  branch: number
  is_deleted: boolean
}

export interface ProjectMembersResponse {
  user_box: Record<string, string>
  branch_box: Record<string, string>
  user_branch_list: { user_id: number; branch: number }[]
  user_projects: ProjectMemberRow[]
}

// ── Overtime ──────────────────────────────────────────────────────────────
// Matches POST /overtime/get-overtime-requests's `ot_requests[]` row shape —
// a hand-built response, not the raw DB record: status/overtime_type come
// back as pre-translated English strings ("Pending"/"Deny"/"Accepted",
// "Take Day Off"/"Take Money"), not ints, and there's no user_id/project_id/
// raw datetime/reason/created_at on the list row at all (only get-overtime-
// request, the single-record endpoint, returns those raw fields).
export interface OvertimeRow {
  id: number
  full_name: string
  branch: string
  project_name: string
  status: string
  overtime_type: string
  date_overtime: string // "YYYY/MM/DD"
  time_overtime: string // "HH:mm-HH:mm"
  week_day: string
  working_time: number
}

// ── Recruitment ──────────────────────────────────────────────────────────
// Matches POST /recruitment/get-jobs row shape — no stored "status" field;
// active/done is derived client-side from expiry_date vs today.
export interface JobRow {
  id: number
  job_name: string
  start_date: string // YYYY-MM-DD
  expiry_date: string // YYYY-MM-DD
  branch_ids: number[]
  assignees: number[]
}

export interface JobDetail {
  job_name: string
  start_date: string
  expiry_date: string
  branch_ids: number[]
  assignees: number[]
  detail_job_file_name: string
  detail_job_file_path: string
}

// POST /recruitment/create-detail-job|update-detail-job|get-detail-job — a 1:1
// "extra info" sub-record for a job posting, unrelated to detail_job_file_*
// (which is a separate single-file-attachment feature).
export interface DetailedJob {
  id: number
  recruitment_id: number
  amount: number
  address: string[]
  place: string[]
  role: number
  gender: number
  type_of_work: string
  experience: number
  salary_type: number
  salary_from: number
  salary_to: number
  profile_recipients: string
  email: string
  phone_number: string
  description: string
}

// List row from POST /recruitment/get-cvs — narrower than CvDetail (no
// phone/email; those only come back from get-cv-by-id).
export interface CvRow {
  id: number
  full_name: string
  date_receipt_cv: string // YYYY/MM/DD (display format)
  media_id: number
  media_id_other: string
  updated_at: string // YYYY/MM/DD
  status: number
  file_content: string | null
}

export interface CvDetail {
  recruitment_id: number
  full_name: string
  phone_number: string
  email: string
  salary: string
  date_receipt_cv: string // YYYY/MM/DD
  interview_method: number
  contact_link: string
  media_id: number
  media_id_other: string
  file_name: string
  file_content: string | null
  file_path: string
}

export interface CvStatusLog {
  datetime_update: string
  status: number
}

// ── Settings ─────────────────────────────────────────────────────────────
// GetHolidays response fields — `description` (not `name`), `holiday_date`
// (not `date`), formatted "YYYY/MM/DD" (FormatDateDisplay) by the backend.
export interface HolidayRow {
  id: number
  description: string
  holiday_date: string
  organization_id: number
}

// GetOrganizationSetting's actual fields — `email` always reflects the
// server's own MAIL_ADDRESS env var (not org-settable; see
// edit-organization-email, which only accepts a test-recipient address).
// `expiration_reset_day_off` is 0-indexed (0=January ... 11=December).
export interface OrgSetting {
  email: string
  expiration_reset_day_off: number
  work_start_time: string
  lunch_break_start_time: string
  lunch_break_end_time: string
  work_end_time: string
}

export interface OvertimeWeight {
  id: number
  normal_day_weight: number
  weekend_weight: number
  holiday_weight: number
}

export interface PermissionModule { id: number; name: string }
export interface PermissionFunction { function_id: number; name: string; status: boolean }
// GetUserPermissions' user-picker row — `has_custom` is a row COUNT (both
// granted and not-granted rows), not "number of permissions granted".
export interface PermissionUserRow {
  id: number
  email: string
  first_name: string
  last_name: string
  roleId: number
  avatar: string
  has_custom: number
}
