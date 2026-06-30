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

export const MOCK_LEAVE_REQUEST = {
  id: 1, user_id: 1, full_name: 'Nguyễn Văn A', avatar: null,
  branch: 'Hà Nội', leave_request_type: 'Nghỉ cả ngày',
  datetime_leave_from: '2026-06-01', datetime_leave_to: '2026-06-01',
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

export const MOCK_OVERTIME_ROW = {
  id: 1, user_id: 1, full_name: 'Test Admin', branch: 'Hà Nội',
  overtime_type: 1, date: '2026-06-01', hours: 2, reason: 'Dự án X', status: 1,
}

export const MOCK_PROJECT_ROW = {
  id: 1, project_name: 'Dự án Alpha', managed_by: 1, manager_name: 'Test Admin',
  project_description: 'Mô tả dự án', status: 1, created_at: '2026-01-01',
}

export const MOCK_EVALUATION_ROW = {
  id: 1, user_id: 1, full_name: 'Test Admin', quarter: 1, year: 2026,
  branch: 'Hà Nội', status: 1, score: 85,
}

export const MOCK_JOB_ROW = {
  id: 1, title: 'Senior Developer', description: 'Mô tả', status: 1,
  created_at: '2026-01-01', application_count: 3,
}
