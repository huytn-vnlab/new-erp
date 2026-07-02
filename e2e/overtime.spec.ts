import { test, expect, type Page } from '@playwright/test'
import { mockAuth } from './helpers/auth'
import { mockApi, mockApiError, MOCK_OVERTIME_ROW, MOCK_PAGINATION } from './helpers/fixtures'

const ROUTES = {
  list: '**/api/overtime/get-overtime-requests',
  updateStatus: '**/api/overtime/update-overtime-request-status',
}

async function setup(page: Page, empty = false) {
  await mockAuth(page)
  await mockApi(page, ROUTES.list, { overtime_requests: empty ? [] : [MOCK_OVERTIME_ROW], pagination: MOCK_PAGINATION })
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
    await setup(page)
    await mockApi(page, ROUTES.updateStatus, {})
    await page.goto('/request/overtime')
    await page.getByRole('button', { name: /duyệt/i }).first().click()
    await expect(page.getByText(/đã duyệt/i)).toBeVisible()
  })

  test('reject shows toast', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.updateStatus, {})
    await page.goto('/request/overtime')
    await page.getByRole('button', { name: /từ chối/i }).first().click()
    await expect(page.getByRole('heading', { name: /từ chối/i })).toBeVisible()
  })
})
