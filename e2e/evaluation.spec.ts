import { test, expect, type Page } from '@playwright/test'
import { mockAuth } from './helpers/auth'
import { mockApi, mockApiError, MOCK_EVALUATION_ROW, MOCK_PAGINATION } from './helpers/fixtures'

const ROUTES = {
  list: '**/targeteval/search-evaluation-list',
  export: '**/targeteval/export-excel',
}

async function setup(page: Page, empty = false) {
  await mockAuth(page)
  await mockApi(page, ROUTES.list, { evaluations: empty ? [] : [MOCK_EVALUATION_ROW], pagination: MOCK_PAGINATION })
}

test.describe('Evaluation — data loading', () => {
  test('renders evaluation row', async ({ page }) => {
    await setup(page)
    await page.goto('/evaluation')
    await expect(page.getByRole('table').getByText('Test Admin')).toBeVisible()
  })
})

test.describe('Evaluation — empty state', () => {
  test('shows empty state when no evaluations', async ({ page }) => {
    await setup(page, true)
    await page.goto('/evaluation')
    await expect(page.locator('[data-test="empty-state"]')).toBeVisible()
  })
})

test.describe('Evaluation — error state', () => {
  test('shows error banner on failure', async ({ page }) => {
    await mockAuth(page)
    await mockApiError(page, ROUTES.list)
    await page.goto('/evaluation')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()
  })
})

test.describe('Evaluation — filter year/quarter', () => {
  test('changing year/quarter triggers re-fetch', async ({ page }) => {
    await setup(page)
    let fetchCount = 0
    await page.route(ROUTES.list, async route => {
      fetchCount++
      await route.fulfill({ json: { status: 1, message: 'ok', data: { evaluations: [], pagination: MOCK_PAGINATION } } })
    })
    await page.goto('/evaluation')
    // Click Q1 button (page defaults to Q2) to trigger watch → re-fetch
    await page.getByRole('button', { name: 'Q1' }).first().click()
    await expect.poll(() => fetchCount, { timeout: 5000 }).toBeGreaterThan(1)
  })
})
