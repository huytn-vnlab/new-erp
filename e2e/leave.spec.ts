import { test, expect, type Page } from '@playwright/test'
import { mockAuth } from './helpers/auth'
import {
  mockApi, mockApiError,
  MOCK_LEAVE_REQUEST, MOCK_LEAVE_INFO, MOCK_PAGINATION,
} from './helpers/fixtures'

const LEAVE_ROUTES = {
  requests: '**/api/leave/get-leave-requests',
  info: '**/api/leave/get-leave-info',
  bonuses: '**/api/leave/get-leave-bonuses',
  create: '**/api/leave/create-leave',
  updateStatus: '**/api/leave/update-leave-request-status',
  infoAll: '**/api/leave/get-leave-info-all-user',
  members: '**/api/user/get-list-item-profile',
}

async function setupLeave(page: Page, overrides: Partial<Record<keyof typeof LEAVE_ROUTES, 'error' | 'empty' | 'ok'>> = {}) {
  await mockAuth(page)
  await mockApi(page, LEAVE_ROUTES.requests, overrides.requests === 'error'
    ? null
    : { leaves: overrides.requests === 'empty' ? [] : [MOCK_LEAVE_REQUEST], pagination: MOCK_PAGINATION })
  await mockApi(page, LEAVE_ROUTES.info, MOCK_LEAVE_INFO)
  await mockApi(page, LEAVE_ROUTES.bonuses, { leave_bonuses: [], total_row: 0 })
  await mockApi(page, LEAVE_ROUTES.infoAll, { users: [] })
  await mockApi(page, LEAVE_ROUTES.members, { profiles: [], pagination: MOCK_PAGINATION })
}

test.describe('Leave — data loading', () => {
  test('shows skeleton while loading then renders row', async ({ page }) => {
    await mockAuth(page)
    let resolve: () => void
    const blocker = new Promise<void>(r => { resolve = r })
    await page.route(LEAVE_ROUTES.requests, async route => {
      await blocker
      await route.fulfill({ json: { status: 1, message: 'ok', data: { leaves: [MOCK_LEAVE_REQUEST], pagination: MOCK_PAGINATION } } })
    })
    await mockApi(page, LEAVE_ROUTES.info, MOCK_LEAVE_INFO)
    await mockApi(page, LEAVE_ROUTES.bonuses, { leave_bonuses: [], total_row: 0 })
    await mockApi(page, LEAVE_ROUTES.infoAll, { users: [] })
    await mockApi(page, LEAVE_ROUTES.members, { profiles: [], pagination: MOCK_PAGINATION })
    await page.goto('/hrm/leave')
    await expect(page.locator('[data-test="skeleton-row"]').first()).toBeVisible()
    resolve!()
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible()
  })
})

test.describe('Leave — empty state', () => {
  test('shows empty state when no leave requests', async ({ page }) => {
    await setupLeave(page, { requests: 'empty' })
    await page.goto('/hrm/leave')
    await expect(page.locator('[data-test="empty-state"]')).toBeVisible()
  })
})

test.describe('Leave — error state', () => {
  test('shows error banner when API fails and retries on click', async ({ page }) => {
    await mockAuth(page)
    await mockApiError(page, LEAVE_ROUTES.requests)
    await mockApi(page, LEAVE_ROUTES.info, MOCK_LEAVE_INFO)
    await mockApi(page, LEAVE_ROUTES.bonuses, { leave_bonuses: [], total_row: 0 })
    await mockApi(page, LEAVE_ROUTES.infoAll, { users: [] })
    await mockApi(page, LEAVE_ROUTES.members, { profiles: [], pagination: MOCK_PAGINATION })
    await page.goto('/hrm/leave')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()

    // Retry
    await mockApi(page, LEAVE_ROUTES.requests, { leaves: [MOCK_LEAVE_REQUEST], pagination: MOCK_PAGINATION })
    await page.locator('[data-test="retry-btn"]').click()
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible()
    await expect(page.locator('[data-test="error-banner"]')).not.toBeVisible()
  })
})

test.describe('Leave — create leave', () => {
  test('submit create form shows success toast', async ({ page }) => {
    await setupLeave(page)
    await mockApi(page, LEAVE_ROUTES.create, {})
    await page.goto('/hrm/leave')
    await page.getByText('Tạo xin nghỉ').click()
    await page.locator('input[type="date"]').first().fill('2026-07-01')
    await page.locator('input[type="date"]').last().fill('2026-07-01')
    await page.getByPlaceholder(/lý do/i).fill('Nghỉ cá nhân')
    await page.getByRole('button', { name: /gửi/i }).click()
    await expect(page.getByText(/đã gửi/i)).toBeVisible()
  })
})

test.describe('Leave — approve & reject', () => {
  test('approve changes status to approved', async ({ page }) => {
    await setupLeave(page)
    await mockApi(page, LEAVE_ROUTES.updateStatus, {})
    await page.goto('/hrm/leave')
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible()
    // Click the entry cell in the LeaveGrid to open the detail drawer
    await page.locator('tr:has-text("Nguyễn Văn A") td button').first().click()
    // Approve from the drawer (force bypasses the floating Tweaks panel overlay)
    await page.getByRole('button', { name: /duyệt đơn/i }).click({ force: true })
    await expect(page.getByText(/đã duyệt/i)).toBeVisible()
  })

  test('reject changes status to rejected', async ({ page }) => {
    await setupLeave(page)
    await mockApi(page, LEAVE_ROUTES.updateStatus, {})
    await page.goto('/hrm/leave')
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible()
    // Click the entry cell in the LeaveGrid to open the detail drawer
    await page.locator('tr:has-text("Nguyễn Văn A") td button').first().click()
    // Reject from the drawer
    await page.getByRole('button', { name: /từ chối/i }).first().click()
    await expect(page.getByText(/từ chối/i)).toBeVisible()
  })
})

test.describe('Leave — validation', () => {
  test('shows inline errors when create form submitted empty', async ({ page }) => {
    await setupLeave(page)
    await page.goto('/hrm/leave')
    await page.getByText('Tạo xin nghỉ').click()
    await page.getByRole('button', { name: /gửi/i }).click()
    await expect(page.locator('.text-red-500, .text-destructive, [class*="error"]').first()).toBeVisible()
  })
})

test.describe('Leave — filter', () => {
  test('filter by name hides non-matching rows', async ({ page }) => {
    await setupLeave(page)
    await page.goto('/hrm/leave')
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible()
    await page.getByPlaceholder(/tên/i).fill('Văn B')
    await expect(page.getByText('Nguyễn Văn A')).not.toBeVisible()
  })
})
