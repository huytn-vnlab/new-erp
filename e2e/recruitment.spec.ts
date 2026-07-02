import { test, expect, type Page } from '@playwright/test'
import { mockAuth } from './helpers/auth'
import { mockApi, mockApiError, MOCK_JOB_ROW, MOCK_PAGINATION } from './helpers/fixtures'

const ROUTES = {
  jobs: '**/api/recruitment/get-jobs',
  cvs: '**/api/recruitment/get-cvs',
}

const MOCK_CV = { id: 1, job_id: 1, full_name: 'Ứng viên A', email: 'uv@test.com', status: 1, applied_at: '2026-06-01' }

async function setup(page: Page, empty = false) {
  await mockAuth(page)
  await mockApi(page, ROUTES.jobs, { jobs: empty ? [] : [MOCK_JOB_ROW], pagination: MOCK_PAGINATION })
  await mockApi(page, ROUTES.cvs, { cvs: empty ? [] : [MOCK_CV], pagination: MOCK_PAGINATION })
}

test.describe('Recruitment — data loading', () => {
  test('renders job row', async ({ page }) => {
    await setup(page)
    await page.goto('/recruitment')
    await expect(page.getByText('Senior Developer')).toBeVisible()
  })
})

test.describe('Recruitment — empty state', () => {
  test('shows empty state when no jobs', async ({ page }) => {
    await setup(page, true)
    await page.goto('/recruitment')
    await expect(page.locator('[data-test="empty-state"]')).toBeVisible()
  })
})

test.describe('Recruitment — error state', () => {
  test('shows error banner on failure', async ({ page }) => {
    await mockAuth(page)
    await mockApiError(page, ROUTES.jobs)
    await mockApi(page, ROUTES.cvs, { cvs: [], pagination: MOCK_PAGINATION })
    await page.goto('/recruitment')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()
  })
})

test.describe('Recruitment — tab switch', () => {
  test('switching to CVs tab shows CV data', async ({ page }) => {
    await setup(page)
    await page.goto('/recruitment')
    await page.getByRole('button', { name: /cv.*ứng viên/i }).click()
    await expect(page.getByText('Ứng viên A')).toBeVisible()
  })
})
