import { test, expect, type Page } from '@playwright/test'
import { mockAuth, MOCK_USER } from './helpers/auth'
import {
  mockApi, mockApiError, MOCK_PROJECT_ROW, MOCK_PROJECT_USERS,
  MOCK_PROJECT_DETAIL, MOCK_PROJECT_MEMBERS, MOCK_PAGINATION,
} from './helpers/fixtures'

const ROUTES = {
  list: '**/project/get-project-list',
  details: '**/project/get-project-details',
  create: '**/project/add-project',
  update: '**/project/update-project',
  delete: '**/project/delete-project',
  joined: '**/user-project/get-projects-user-join',
  members: '**/user-project/get-user-project',
  addMember: '**/user-project/create-user-project',
}

async function setup(page: Page, empty = false) {
  await mockAuth(page)
  await mockApi(page, ROUTES.list, {
    projects: empty ? [] : [MOCK_PROJECT_ROW],
    pagination: MOCK_PAGINATION,
    users: MOCK_PROJECT_USERS,
  })
  await mockApi(page, ROUTES.joined, [])
  // The card grid's member-avatar footer fetches this for every visible row on
  // mount (see fetchCardMembers in project.vue) — left unmocked, it falls
  // through to the real backend with the fake token and 401s, which trips
  // useApi's auto-redirect and silently bounces the whole test off the page.
  await mockApi(page, ROUTES.members, MOCK_PROJECT_MEMBERS)
}

// Create/edit/delete are Manager/GeneralManager-only in the UI (mirroring the
// backend's CheckAllManager gate) — MOCK_USER's default role_name doesn't
// qualify, so these tests need an override to actually see the buttons.
async function setupAsManager(page: Page, empty = false) {
  await setup(page, empty)
  await page.route('**/user/getuser', route =>
    route.fulfill({ json: { status: 1, message: 'ok', data: { ...MOCK_USER, role_name: 'Manager' } } }),
  )
}

test.describe('Project — data loading', () => {
  test('renders project row', async ({ page }) => {
    await setup(page)
    await page.goto('/workflow/project')
    await expect(page.getByText('Dự án Alpha')).toBeVisible()
  })
})

test.describe('Project — empty state', () => {
  test('shows empty state when no projects', async ({ page }) => {
    await setup(page, true)
    await page.goto('/workflow/project')
    await expect(page.locator('[data-test="empty-state"]')).toBeVisible()
  })
})

test.describe('Project — error state', () => {
  test('shows error banner on failure', async ({ page }) => {
    await mockAuth(page)
    await mockApiError(page, ROUTES.list)
    await mockApi(page, ROUTES.joined, [])
    await page.goto('/workflow/project')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()
  })
})

test.describe('Project — create', () => {
  test('create project success shows toast', async ({ page }) => {
    await setupAsManager(page)
    await mockApi(page, ROUTES.create, { project_id: 2 })
    await page.goto('/workflow/project')
    await page.getByRole('button', { name: /tạo dự án/i }).click()
    await page.getByLabel(/tên dự án/i).fill('Dự án Beta')
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByText(/đã tạo/i)).toBeVisible()
  })

  test('create with empty name shows validation error', async ({ page }) => {
    await setupAsManager(page)
    await page.goto('/workflow/project')
    await page.getByRole('button', { name: /tạo dự án/i }).click()
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.locator('.text-red-500, [class*="error"]').first()).toBeVisible()
  })
})

// Sửa/Xóa live in the detail drawer footer, not directly on the card — the
// card itself is click-through only (opens the drawer).
test.describe('Project — edit', () => {
  test('edit project success shows toast', async ({ page }) => {
    await setupAsManager(page)
    await mockApi(page, ROUTES.details, MOCK_PROJECT_DETAIL)
    await mockApi(page, ROUTES.members, MOCK_PROJECT_MEMBERS)
    await mockApi(page, ROUTES.update, {})
    await page.goto('/workflow/project')
    await page.getByText('Dự án Alpha').click()
    await page.getByRole('button', { name: 'Chỉnh sửa' }).click()
    await expect(page.getByRole('button', { name: 'Lưu' })).toBeEnabled()
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByText(/đã cập nhật/i)).toBeVisible()
  })
})

test.describe('Project — delete', () => {
  test('delete shows confirm then success toast', async ({ page }) => {
    await setupAsManager(page)
    await mockApi(page, ROUTES.details, MOCK_PROJECT_DETAIL)
    await mockApi(page, ROUTES.delete, {})
    await page.goto('/workflow/project')
    await page.getByText('Dự án Alpha').click()
    await page.getByRole('button', { name: 'Xóa' }).click()
    await expect(page.getByText('Xác nhận xóa')).toBeVisible()
    await page.getByRole('button', { name: 'Xác nhận' }).click()
    await expect(page.getByText(/đã xóa/i)).toBeVisible()
  })
})
