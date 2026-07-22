import { test, expect, type Page } from '@playwright/test'
import { mockAuth } from './helpers/auth'
import { mockApi, mockApiEmpty, mockApiError, MOCK_MEMBER_ROW, MOCK_BRANCH, MOCK_PAGINATION } from './helpers/fixtures'

const ROUTES = {
  members: '**/user/get-list-item-profile',
  branches: '**/setting/branch/get-branches',
  invite: '**/register/inviteUser',
  delete: '**/user/delete-user',
}

async function setupMember(page: Page, empty = false) {
  await mockAuth(page)
  await mockApi(page, ROUTES.members, { profiles: empty ? [] : [MOCK_MEMBER_ROW], pagination: MOCK_PAGINATION })
  await mockApi(page, ROUTES.branches, { branches: [MOCK_BRANCH] })
}

test.describe('Member — data loading', () => {
  test('renders member row after loading', async ({ page }) => {
    await setupMember(page)
    await page.goto('/hrm/member')
    await expect(page.getByText('Văn A')).toBeVisible()
    await expect(page.getByText('a@test.com')).toBeVisible()
  })
})

test.describe('Member — empty state', () => {
  test('shows empty state when no members', async ({ page }) => {
    await setupMember(page, true)
    await page.goto('/hrm/member')
    await expect(page.locator('[data-test="empty-state"]')).toBeVisible()
  })
})

test.describe('Member — error state', () => {
  test('shows error banner on API failure', async ({ page }) => {
    await mockAuth(page)
    await mockApiError(page, ROUTES.members)
    await mockApi(page, ROUTES.branches, { branches: [] })
    await page.goto('/hrm/member')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()
  })
})

test.describe('Member — search & filter', () => {
  test('search filters member list client-side', async ({ page }) => {
    await setupMember(page)
    await page.goto('/hrm/member')
    await page.getByPlaceholder(/tên, email/i).fill('xyz-no-match')
    await expect(page.getByText('Văn A')).not.toBeVisible()
  })
})

test.describe('Member — pagination', () => {
  test('renders pagination when total_row > row_per_page', async ({ page }) => {
    await mockAuth(page)
    await mockApi(page, ROUTES.members, { profiles: [MOCK_MEMBER_ROW], pagination: { current_page: 1, total_row: 25, row_per_page: 10 } })
    await mockApi(page, ROUTES.branches, { branches: [MOCK_BRANCH] })
    await page.goto('/hrm/member')
    await expect(page.locator('[data-test="pagination"], nav[aria-label*="pagination"]').first()).toBeVisible()
  })
})

test.describe('Member — invite modal', () => {
  test('invite success shows toast', async ({ page }) => {
    await setupMember(page)
    await mockApi(page, ROUTES.invite, {})
    await page.goto('/hrm/member')
    await page.getByRole('button', { name: /mời thành viên/i }).first().click()
    await page.getByLabel(/email/i).fill('new@test.com')
    await page.getByRole('button', { name: /gửi/i }).click()
    await expect(page.getByText(/lời mời đã được gửi/i)).toBeVisible()
  })

  test('invite with empty email shows validation error', async ({ page }) => {
    await setupMember(page)
    await page.goto('/hrm/member')
    await page.getByRole('button', { name: /mời thành viên/i }).first().click()
    await page.getByRole('button', { name: /gửi/i }).click()
    await expect(page.locator('.text-red-500, [class*="error"], [class*="invalid"]').first()).toBeVisible()
  })
})

test.describe('Member — delete', () => {
  test('delete member shows toast', async ({ page }) => {
    await setupMember(page)
    await mockApi(page, ROUTES.delete, {})
    await page.goto('/hrm/member')
    await page.getByRole('button', { name: /xóa/i }).first().click()
    await expect(page.getByText(/đã xóa/i)).toBeVisible()
  })
})
