import { test, expect, type Page, type Locator } from '@playwright/test'
import { mockAuth } from './helpers/auth'
import {
  mockApi, mockApiError,
  MOCK_BRANCH, MOCK_JOB_TITLE, MOCK_TECH, MOCK_HOLIDAY, MOCK_ORG_SETTING,
  MOCK_OVERTIME_WEIGHT, MOCK_MODULES, MOCK_PERM_USERS_PAGE, MOCK_USER_PERMISSIONS,
} from './helpers/fixtures'

const ROUTES = {
  orgSetting: '**/setting/get-organization-setting',
  branches: '**/setting/branch/get-branches',
  createBranch: '**/setting/branch/create-branch',
  editBranch: '**/setting/branch/edit-branch',
  removeBranch: '**/setting/branch/remove-branch',
  jobTitles: '**/setting/job-title/get-job-titles',
  createJobTitle: '**/setting/job-title/create-job-title',
  technologies: '**/setting/technology/get-technologies',
  createTechnology: '**/setting/technology/create-technology',
  holidays: '**/holiday/get-holidays',
  createHoliday: '**/holiday/create-holiday',
  modules: '**/admin/get-moudles',
  overtimeWeight: '**/overtime/get-overtime-weight',
  editOvertimeWeight: '**/overtime/edit-overtime-weight',
  permUsers: '**/user-permission/get-user-permissions',
  permissions: '**/user-permission/get-permissions',
  editPermission: '**/user-permission/edit-permission',
  editEmail: '**/setting/edit-organization-email',
}

async function setup(page: Page) {
  await mockAuth(page)
  await mockApi(page, ROUTES.orgSetting, MOCK_ORG_SETTING)
  await mockApi(page, ROUTES.branches, [MOCK_BRANCH])
  await mockApi(page, ROUTES.jobTitles, [MOCK_JOB_TITLE])
  await mockApi(page, ROUTES.technologies, [MOCK_TECH])
  await mockApi(page, ROUTES.holidays, { holidays: [MOCK_HOLIDAY] })
  await mockApi(page, ROUTES.modules, MOCK_MODULES)
  await mockApi(page, ROUTES.overtimeWeight, MOCK_OVERTIME_WEIGHT)
  await mockApi(page, ROUTES.permUsers, MOCK_PERM_USERS_PAGE)
  await mockApi(page, ROUTES.permissions, MOCK_USER_PERMISSIONS)
}

// The settings page's own section nav and the app's global sidebar both use
// plain <button> nav items with overlapping labels (e.g. "Tăng ca") — scope
// to the settings page's local nav (data-test="settings-nav") to disambiguate.
function settingsNav(page: Page): Locator {
  return page.locator('[data-test="settings-nav"]')
}
async function goToSection(page: Page, label: string) {
  await settingsNav(page).getByRole('button', { name: label }).click()
}

test.describe('Settings — data loading', () => {
  test('renders branch/job-title/technology rows from raw-array responses', async ({ page }) => {
    await setup(page)
    await page.goto('/settings')
    await goToSection(page, 'Chi nhánh')
    await expect(page.getByRole('cell', { name: 'Hà Nội' })).toBeVisible()

    await goToSection(page, 'Chức danh')
    await expect(page.getByRole('cell', { name: 'Software Engineer' })).toBeVisible()

    await goToSection(page, 'Công nghệ & Kỹ năng')
    await expect(page.getByRole('cell', { name: 'ReactJS' })).toBeVisible()
  })

  test('shows error banner when a section fails to load', async ({ page }) => {
    await setup(page)
    await mockApiError(page, ROUTES.branches)
    await page.goto('/settings')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()
  })
})

test.describe('Settings — email', () => {
  test('shows server-controlled email read-only and sends test email', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.editEmail, {})
    await page.goto('/settings')
    await expect(page.getByText('vnlab@vietnamlab.vn')).toBeVisible()
    await page.getByPlaceholder('you@company.com').fill('qa@vietnamlab.vn')
    await page.getByRole('button', { name: 'Gửi email test' }).click()
    await expect(page.getByText(/đã được gửi/i)).toBeVisible()
  })
})

test.describe('Settings — branch CRUD', () => {
  test('create branch sends required priority field', async ({ page }) => {
    await setup(page)
    let sentBody: Record<string, unknown> = {}
    await page.route(ROUTES.createBranch, async (route) => {
      sentBody = route.request().postDataJSON()
      await route.fulfill({ json: { status: 1, message: 'ok', data: null } })
    })
    await page.goto('/settings')
    await goToSection(page, 'Chi nhánh')
    await page.getByRole('button', { name: 'Thêm chi nhánh' }).click()
    await page.getByPlaceholder('VD: Hà Nội, TP.HCM…').fill('Đà Nẵng')
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByText('Đã thêm chi nhánh mới.')).toBeVisible()
    expect(sentBody).toMatchObject({ name: 'Đà Nẵng', priority: 2 })
  })

  test('delete branch calls remove-branch', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.removeBranch, {})
    await page.goto('/settings')
    await goToSection(page, 'Chi nhánh')
    await page.getByRole('button', { name: 'Xoá' }).first().click()
    await page.getByRole('button', { name: 'Xoá', exact: true }).last().click()
    await expect(page.getByText('Đã xoá chi nhánh.')).toBeVisible()
  })
})

test.describe('Settings — holidays', () => {
  test('shows holiday with real description/holiday_date fields', async ({ page }) => {
    await setup(page)
    await page.goto('/settings')
    await goToSection(page, 'Ngày nghỉ lễ')
    await expect(page.getByText('Tết Dương Lịch')).toBeVisible()
    await expect(page.getByText('2026/01/01')).toBeVisible()
  })

  test('create holiday sends holiday_date in YYYY-MM-DD', async ({ page }) => {
    await setup(page)
    let sentBody: Record<string, unknown> = {}
    await page.route(ROUTES.createHoliday, async (route) => {
      sentBody = route.request().postDataJSON()
      await route.fulfill({ json: { status: 1, message: 'ok', data: null } })
    })
    await page.goto('/settings')
    await goToSection(page, 'Ngày nghỉ lễ')
    await page.getByRole('button', { name: 'Thêm ngày lễ' }).click()
    await page.getByRole('button', { name: 'yyyy/mm/dd' }).click()
    await page.getByRole('button', { name: 'Hôm nay' }).click()
    await page.getByPlaceholder('VD: Tết Nguyên Đán').fill('Ngày test')
    await page.getByRole('button', { name: 'Thêm', exact: true }).click()
    await expect(page.getByText('Đã thêm ngày nghỉ lễ.')).toBeVisible()
    expect(sentBody.description).toBe('Ngày test')
    expect(String(sentBody.holiday_date)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

test.describe('Settings — overtime weight', () => {
  test('loads real weights and saves via edit endpoint (row already exists)', async ({ page }) => {
    await setup(page)
    let editCalled = false
    await page.route(ROUTES.editOvertimeWeight, async (route) => {
      editCalled = true
      await route.fulfill({ json: { status: 1, message: 'ok', data: null } })
    })
    await page.goto('/settings')
    await goToSection(page, 'Tăng ca')
    await expect(page.locator('input[type="number"]').nth(1)).toHaveValue('1.5')
    await page.getByRole('button', { name: 'Lưu cài đặt' }).click()
    await expect(page.getByText('Đã lưu cài đặt tăng ca.')).toBeVisible()
    expect(editCalled).toBe(true)
  })
})

test.describe('Settings — permission matrix', () => {
  test('auto-selects first user and renders real function names grouped by module', async ({ page }) => {
    await setup(page)
    await page.goto('/settings')
    await goToSection(page, 'Phân quyền')
    await expect(page.getByText('Trần Cao Quý').first()).toBeVisible()
    await expect(page.getByText('Profile list')).toBeVisible()
    await expect(page.getByText('Base HRM')).toBeVisible()
  })

  test('toggling a function calls edit-permission with the real function_id', async ({ page }) => {
    await setup(page)
    let sentBody: Record<string, unknown> = {}
    await page.route(ROUTES.editPermission, async (route) => {
      sentBody = route.request().postDataJSON()
      await route.fulfill({ json: { status: 1, message: 'ok', data: null } })
    })
    await page.goto('/settings')
    await goToSection(page, 'Phân quyền')
    await expect(page.getByText('Edit profile')).toBeVisible()
    await page.getByText('Edit profile').click()
    expect(sentBody).toMatchObject({ user_id: 2, function_id: 2, status: 1 })
  })
})
