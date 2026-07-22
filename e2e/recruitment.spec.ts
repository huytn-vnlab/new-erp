import { test, expect, type Page } from '@playwright/test'
import { mockAuth } from './helpers/auth'
import { mockApi, mockApiError, MOCK_JOB_ROW, MOCK_JOB_BRANCHES, MOCK_JOB_USERS, MOCK_PAGINATION } from './helpers/fixtures'

const ROUTES = {
  jobs: '**/recruitment/get-jobs',
  cvs: '**/recruitment/get-cvs',
  detailJob: '**/recruitment/get-detail-job',
}

const MOCK_CV = { id: 1, full_name: 'Ứng viên A', date_receipt_cv: '2026/06/01', media_id: 3, media_id_other: '', updated_at: '2026/06/01', status: 1, file_content: null }

async function setup(page: Page, empty = false) {
  await mockAuth(page)
  await mockApi(page, ROUTES.jobs, {
    recruitments: empty ? [] : [MOCK_JOB_ROW],
    branches: MOCK_JOB_BRANCHES,
    users: MOCK_JOB_USERS,
    pagination: MOCK_PAGINATION,
  })
  await mockApi(page, ROUTES.cvs, { cvs: empty ? [] : [MOCK_CV], pagination: MOCK_PAGINATION })
  await mockApi(page, ROUTES.detailJob, { detail_job: null })
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
    await page.goto('/recruitment')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()
  })
})

test.describe('Recruitment — job detail', () => {
  test('opening a job row shows its CV list', async ({ page }) => {
    await setup(page)
    await page.route('**/recruitment/get-job', route =>
      route.fulfill({ json: { status: 1, message: 'ok', data: { recruitment: MOCK_JOB_ROW, branches: MOCK_JOB_BRANCHES, users: MOCK_JOB_USERS } } }),
    )
    await page.goto('/recruitment')
    await page.getByText('Senior Developer').click()
    await expect(page.getByText('Ứng viên A')).toBeVisible()
  })
})
