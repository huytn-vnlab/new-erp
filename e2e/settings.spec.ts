import { test, expect, type Page } from '@playwright/test'
import { mockAuth } from './helpers/auth'
import { mockApi, mockApiError } from './helpers/fixtures'

const ROUTES = {
  orgSetting:    '**/api/setting/get-organization-setting',
  branches:      '**/api/setting/branch/get-branches',
  jobTitles:     '**/api/setting/job-title/get-job-titles',
  technologies:  '**/api/setting/technology/get-technologies',
  holidays:      '**/api/holiday/get-holidays',
  createBranch:  '**/api/setting/branch/create-branch',
  editBranch:    '**/api/setting/branch/edit-branch',
  deleteBranch:  '**/api/setting/branch/remove-branch',
  createJob:     '**/api/setting/job-title/create-job-title',
  deleteJob:     '**/api/setting/job-title/remove-job-title',
  createHoliday: '**/api/holiday/create-holiday',
  deleteHoliday: '**/api/holiday/remove-holiday',
}

const MOCK_BRANCH_ITEM = { id: 1, name: 'Hà Nội', created_at: '2026-01-01' }
const MOCK_JOB_ITEM   = { id: 1, name: 'Developer', created_at: '2026-01-01' }
const MOCK_HOLIDAY    = { id: 1, name: 'Tết Nguyên Đán', date: '2026-01-29' }

async function setup(page: Page) {
  await mockAuth(page)
  await mockApi(page, ROUTES.orgSetting,   { org_name: 'VNLab' })
  await mockApi(page, ROUTES.branches,     { branches: [MOCK_BRANCH_ITEM] })
  await mockApi(page, ROUTES.jobTitles,    { job_titles: [MOCK_JOB_ITEM] })
  await mockApi(page, ROUTES.technologies, { technologies: [] })
  await mockApi(page, ROUTES.holidays,     { holidays: [MOCK_HOLIDAY] })
}

test.describe('Settings — load all sections', () => {
  test('renders branch, job title, holiday data', async ({ page }) => {
    await setup(page)
    await page.goto('/settings')
    // Navigate to each section — default is 'email'
    await page.getByRole('button', { name: 'Chi nhánh' }).click()
    await expect(page.getByText('Hà Nội').first()).toBeVisible()
    await page.getByRole('button', { name: 'Chức danh' }).click()
    await expect(page.getByText('Developer')).toBeVisible()
    await page.getByRole('button', { name: 'Ngày nghỉ lễ' }).click()
    await expect(page.getByText('Tết Nguyên Đán')).toBeVisible()
  })
})

test.describe('Settings — error state', () => {
  test('shows error banner when settings fail to load', async ({ page }) => {
    await mockAuth(page)
    await mockApiError(page, ROUTES.branches)
    await mockApiError(page, ROUTES.jobTitles)
    await mockApiError(page, ROUTES.technologies)
    await mockApiError(page, ROUTES.holidays)
    await mockApi(page, ROUTES.orgSetting, null)
    await page.goto('/settings')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()
  })
})

test.describe('Settings — CRUD branch', () => {
  test('create branch shows success toast', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.createBranch, {})
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Chi nhánh' }).click()
    await page.getByRole('button', { name: 'Thêm chi nhánh' }).click()
    // Modal has 3 textboxes: name (first), address, phone
    await page.getByRole('textbox').first().fill('Chi nhánh mới')
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByText('Đã thêm chi nhánh mới.')).toBeVisible()
  })

  test('create branch with empty name shows validation', async ({ page }) => {
    await setup(page)
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Chi nhánh' }).click()
    await page.getByRole('button', { name: 'Thêm chi nhánh' }).click()
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.locator('.text-red-500').first()).toBeVisible()
  })

  test('delete branch shows success toast', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.deleteBranch, {})
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Chi nhánh' }).click()
    // Click "Xoá" on the branch row → opens confirm modal
    await page.getByRole('button', { name: 'Xoá' }).first().click()
    // Click "Xoá" in the confirm modal
    await page.getByRole('button', { name: 'Xoá' }).last().click()
    await expect(page.getByText(/Đã xoá chi nhánh/)).toBeVisible()
  })
})

test.describe('Settings — CRUD job title', () => {
  test('create job title shows success toast', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.createJob, {})
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Chức danh' }).click()
    await page.getByRole('button', { name: 'Thêm chức danh' }).click()
    // Modal has 1 textbox (job name)
    await page.getByRole('textbox').fill('Product Manager')
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByText('Đã thêm chức danh mới.')).toBeVisible()
  })
})

test.describe('Settings — CRUD holiday', () => {
  test('create holiday shows success toast', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.createHoliday, {})
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Ngày nghỉ lễ' }).click()
    await page.getByRole('button', { name: 'Thêm ngày lễ' }).click()
    await page.getByPlaceholder('VD: Tết Nguyên Đán').fill('Ngày nghỉ mới')
    await page.locator('input[type="date"]').fill('2026-12-25')
    // Modal save button is "Thêm" (exact, distinct from "Thêm ngày lễ")
    await page.getByRole('button', { name: 'Thêm', exact: true }).click()
    await expect(page.getByText('Đã thêm: Ngày nghỉ mới')).toBeVisible()
  })

  test('delete holiday shows success toast', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.deleteHoliday, {})
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Ngày nghỉ lễ' }).click()
    // Holiday delete is direct (no confirm modal)
    await page.getByRole('button', { name: 'Xoá' }).click()
    await expect(page.getByText(/Đã xoá/)).toBeVisible()
  })
})
