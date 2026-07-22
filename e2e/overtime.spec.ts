import { test, expect, type Page } from '@playwright/test'
import { mockAuth, MOCK_USER } from './helpers/auth'
import { mockApi, mockApiError, MOCK_OVERTIME_ROW, MOCK_PAGINATION } from './helpers/fixtures'

const ROUTES = {
  list: '**/overtime/get-overtime-requests',
  updateStatus: '**/overtime/update-overtime-request-status',
}

async function setup(page: Page, empty = false) {
  await mockAuth(page)
  await mockApi(page, ROUTES.list, {
    ot_requests: empty ? [] : [MOCK_OVERTIME_ROW],
    pagination: MOCK_PAGINATION,
    users: {},
    projects: { 1: 'Dự án X' },
    branches: { 1: 'Hà Nội' },
    project_managers: [],
  })
}

// Approve/reject is gated to General Manager only (backend's CheckGeneralManager
// middleware) — MOCK_USER's default role_name doesn't qualify, matching the
// pattern already used in project.spec.ts for its Manager-gated actions.
async function setupAsGM(page: Page, empty = false) {
  await setup(page, empty)
  await page.route('**/user/getuser', route =>
    route.fulfill({ json: { status: 1, message: 'ok', data: { ...MOCK_USER, role_name: 'General Manager' } } }),
  )
}

test.describe('Overtime — data loading', () => {
  test('renders overtime row', async ({ page }) => {
    await setup(page)
    await page.goto('/request/overtime')
    await expect(page.getByRole('table').getByText('Test Admin')).toBeVisible()
  })
})

test.describe('Overtime — empty state', () => {
  test('shows empty state when no overtime', async ({ page }) => {
    await setup(page, true)
    await page.goto('/request/overtime')
    await expect(page.locator('[data-test="empty-state"]')).toBeVisible()
  })
})

test.describe('Overtime — error state', () => {
  test('shows error banner on failure', async ({ page }) => {
    await mockAuth(page)
    await mockApiError(page, ROUTES.list)
    await page.goto('/request/overtime')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()
  })
})

test.describe('Overtime — approve & reject', () => {
  test('approve shows success toast', async ({ page }) => {
    await setupAsGM(page)
    await mockApi(page, ROUTES.updateStatus, {})
    await page.goto('/request/overtime')
    await page.getByRole('button', { name: 'Duyệt' }).first().click()
    await expect(page.getByText('Đã duyệt thành công!')).toBeVisible()
  })

  test('reject shows confirm modal then toast', async ({ page }) => {
    await setupAsGM(page)
    await mockApi(page, ROUTES.updateStatus, {})
    await page.goto('/request/overtime')
    await page.getByRole('button', { name: 'Từ chối', exact: true }).first().click()
    await expect(page.getByRole('heading', { name: /từ chối/i })).toBeVisible()
    await page.getByRole('button', { name: 'Xác nhận từ chối' }).click()
    await expect(page.getByText(/đã từ chối/i)).toBeVisible()
  })
})
