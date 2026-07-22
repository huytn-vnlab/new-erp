// e2e/helpers/fixtures.ts
import type { Page } from '@playwright/test'

export async function mockApi(page: Page, urlPattern: string, data: unknown): Promise<void> {
  await page.route(urlPattern, route =>
    route.fulfill({ json: { status: 1, message: 'ok', data } }),
  )
}

export async function mockApiEmpty(page: Page, urlPattern: string, data: unknown): Promise<void> {
  await page.route(urlPattern, route =>
    route.fulfill({ json: { status: 1, message: 'ok', data } }),
  )
}

export async function mockApiError(page: Page, urlPattern: string): Promise<void> {
  await page.route(urlPattern, route =>
    route.fulfill({ status: 500, json: { status: 0, message: 'Lỗi máy chủ', data: null } }),
  )
}

// ── Shared mock fixtures ──────────────────────────────────────────────────

export const MOCK_PAGINATION = { current_page: 1, total_row: 1, row_per_page: 20 }

// Use the current week's Monday so the entry always appears in the LeaveGrid calendar view
const _today = new Date()
const _dayOfWeek = (_today.getDay() + 6) % 7
const _monday = new Date(_today)
_monday.setDate(_today.getDate() - _dayOfWeek)
const _mondayISO = _monday.toISOString().slice(0, 10)

export const MOCK_LEAVE_REQUEST = {
  id: 1, user_id: 1, full_name: 'Nguyễn Văn A', avatar: null,
  branch: 'Hà Nội', leave_request_type: 'Nghỉ cả ngày',
  datetime_leave_from: _mondayISO, datetime_leave_to: _mondayISO,
  reason: 'Cá nhân', status: 1, created_at: '2026-05-30',
}

export const MOCK_LEAVE_INFO = {
  day_bonus: 12, day_remaining: 8, day_remaining_previous: 2, day_used: 4,
  holidays: [], leave_bonus_types: { 'Nghỉ thường niên': 'Nghỉ thường niên' },
  leave_request_types: { 'Nghỉ cả ngày': 'Nghỉ cả ngày' },
  user_info: { email: 'admin@test.com', phone_number: '0901234567', full_name: 'Test Admin', avatar: null },
}

export const MOCK_MEMBER_ROW = {
  id: 1, first_name: 'Văn', last_name: 'A', email: 'a@test.com',
  branch: 'Hà Nội', role: 'Developer', job_title: 1,
  company_joined_date: '2024-01-01', avatar: null, status: 1,
}

export const MOCK_BRANCH = { id: 1, name: 'Hà Nội' }

export const MOCK_TK_ROW = {
  id: 1, user_id: 1, full_name: 'Test Admin', avatar: null,
  date: '2026-06-01', check_in: '08:30', check_out: '17:30',
}

export const MOCK_TK_TODAY = {
  check_in_time: '', check_out_time: '', time_server: '2026-06-30 09:00:00',
}

export const MOCK_ASSET_ROW = {
  id: 1, asset_name: 'Laptop Dell XPS', asset_code: 'ASSET-001',
  asset_type_id: 1, asset_type_name: 'Laptop', branch_id: 1, branch_name: 'Hà Nội',
  user_name: 'Test Admin', status: 1, created_at: '2026-01-01',
}

export const MOCK_CONTRACT_ROW = {
  id: 1, user_id: 1, full_name: 'Test Admin', branch_name: 'Hà Nội',
  contract_type_name: 'Hợp đồng thử việc', start_date: '2026-01-01',
  end_date: '2026-06-30', status: 1,
}

// Matches POST /overtime/get-overtime-requests' `ot_requests[]` row shape — a
// hand-built response where status/overtime_type are pre-translated English
// strings ("Pending"/"Deny"/"Accepted", "Take Day Off"/"Take Money"), not ints.
export const MOCK_OVERTIME_ROW = {
  id: 1, full_name: 'Test Admin', branch: 'Hà Nội', project_name: 'Dự án X',
  status: 'Pending', overtime_type: 'Take Day Off',
  date_overtime: '2026/06/01', time_overtime: '18:00-20:00',
  week_day: 'Monday', working_time: 2,
}

// Matches the real backend shape (m.Project via projects.GetProjectList) —
// `project_id` (not `id`), `managed_by` as a raw user id (resolved to a display
// name client-side via the accompanying `users` id→name map), a real
// `project_targets` array ({year,quarter,content}, no `weight`/`id` — those
// don't exist in the backend's Target model), and `status` (1=active,
// 2=ended — added via migration, existing rows default to 1).
export const MOCK_PROJECT_ROW = {
  project_id: 1, project_name: 'Dự án Alpha', managed_by: 1, status: 1,
  project_description: 'Mô tả dự án', created_at: '2026-01-01',
  project_targets: [{ year: 2026, quarter: 3, content: 'Hoàn thiện module báo cáo.' }],
}
export const MOCK_PROJECT_USERS = { '1': 'Test Admin', '2': 'Trần Ngọc Huy' }
export const MOCK_PROJECT_DETAIL = {
  project_id: 1, name: 'Dự án Alpha', description: 'Mô tả dự án', managed_by: 1, status: 1,
  targets: [{ year: 2026, quarter: 3, content: 'Hoàn thiện module báo cáo.' }],
  users: MOCK_PROJECT_USERS, users_id_join_project: [1],
}
export const MOCK_PROJECT_MEMBERS = {
  user_box: MOCK_PROJECT_USERS, branch_box: { '1': 'Hà Nội' },
  user_branch_list: [{ user_id: 1, branch: 1 }],
  user_projects: [{ id: 10, user_id: 1, date_joined: '2026-01-01', branch: 1, is_deleted: false }],
}

export const MOCK_EVALUATION_ROW = {
  id: 1, user_id: 1, full_name: 'Test Admin', quarter: 1, year: 2026,
  branch: 'Hà Nội', status: 1, score: 85,
}

export const MOCK_JOB_ROW = {
  id: 1, job_name: 'Senior Developer', start_date: '2026-01-01', expiry_date: '2099-12-31',
  branch_ids: [24], assignees: [1],
}
export const MOCK_JOB_BRANCHES = { 24: 'Hà Nội', 25: 'Hồ Chí Minh' }
export const MOCK_JOB_USERS = { 1: 'Test Admin' }

// ── Settings ──────────────────────────────────────────────────────────────
// GetBranches/GetJobTitles/GetTechnologies all return a raw array as `data`
// (no `{branches:[...]}` wrapper, no `category`/`priority` on read).
export const MOCK_JOB_TITLE = { id: 1, name: 'Software Engineer' }
export const MOCK_TECH = { id: 1, name: 'ReactJS' }

// GetHolidays wraps as `{holidays:[...]}`; fields are `description`/
// `holiday_date` (not `name`/`date`), holiday_date formatted "YYYY/MM/DD".
export const MOCK_HOLIDAY = { id: 1, description: 'Tết Dương Lịch', holiday_date: '2026/01/01', organization_id: 1 }

export const MOCK_ORG_SETTING = { email: 'vnlab@vietnamlab.vn', expiration_reset_day_off: 3 }

export const MOCK_OVERTIME_WEIGHT = { id: 1, normal_day_weight: 1, weekend_weight: 1.5, holiday_weight: 3 }

export const MOCK_MODULES = [
  { id: 1, name: 'Base HRM' }, { id: 2, name: 'Base Goal' }, { id: 3, name: 'Base Work' },
  { id: 4, name: 'Base E-Hiring' }, { id: 5, name: 'Base Request' },
  { id: 6, name: 'Base Asset' }, { id: 7, name: 'Base Asset' },
]

export const MOCK_PERM_USER = {
  id: 2, email: 'quytc@yopmail.com', first_name: 'Trần', last_name: 'Cao Quý', roleId: 4, avatar: '', has_custom: 39,
}
export const MOCK_PERM_USERS_PAGE = { pagination: { current_page: 1, total_row: 1, row_per_page: 20 }, user_permissions: [MOCK_PERM_USER] }

// GetPermissions groups by module_id key (1-5); status is boolean (cf.PermissionStatus map).
export const MOCK_USER_PERMISSIONS = {
  1: [{ function_id: 1, name: 'Profile list', status: true }, { function_id: 2, name: 'Edit profile', status: false }],
  2: [{ function_id: 21, name: 'Create evaluation user', status: true }],
  3: [{ function_id: 25, name: 'Board', status: true }],
  4: [{ function_id: 32, name: 'Create recruitment', status: false }],
  5: [{ function_id: 37, name: 'Create overtime', status: true }],
}
