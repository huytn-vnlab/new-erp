import { test, expect, type Page } from '@playwright/test'
import { mockAuth } from './helpers/auth'
import { mockApi, mockApiError, MOCK_PROJECT_ROW, MOCK_PAGINATION } from './helpers/fixtures'

const ROUTES = {
  list: '**/api/project/get-project-list',
  create: '**/api/project/add-project',
  update: '**/api/project/update-project',
  delete: '**/api/project/delete-project',
  assigned: '**/api/project/get-projects-assigned',
}

async function setup(page: Page, empty = false) {
  await mockAuth(page)
  await mockApi(page, ROUTES.list, { projects: empty ? [] : [MOCK_PROJECT_ROW], pagination: MOCK_PAGINATION })
  await mockApi(page, ROUTES.assigned, { projects: [] })
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
    await mockApi(page, ROUTES.assigned, { projects: [] })
    await page.goto('/workflow/project')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()
  })
})

test.describe('Project — create', () => {
  test('create project success shows toast', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.create, { id: 2 })
    await page.goto('/workflow/project')
    await page.getByRole('button', { name: /tạo dự án|thêm mới/i }).click()
    await page.getByLabel(/tên dự án/i).fill('Dự án Beta')
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByText(/đã tạo|thành công/i)).toBeVisible()
  })

  test('create with empty name shows validation error', async ({ page }) => {
    await setup(page)
    await page.goto('/workflow/project')
    await page.getByRole('button', { name: /tạo dự án|thêm mới/i }).click()
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.locator('.text-red-500, [class*="error"]').first()).toBeVisible()
  })
})

test.describe('Project — edit', () => {
  test('edit project success shows toast', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.update, {})
    await page.goto('/workflow/project')
    await page.getByRole('button', { name: /chỉnh sửa|sửa/i }).first().click()
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByText(/đã cập nhật|thành công/i)).toBeVisible()
  })
})

test.describe('Project — delete', () => {
  test('delete shows confirm then success toast', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.delete, {})
    await page.goto('/workflow/project')
    await page.getByRole('button', { name: /xóa/i }).first().click()
    await page.getByRole('button', { name: /xác nhận|đồng ý/i }).click()
    await expect(page.getByText(/đã xóa/i)).toBeVisible()
  })
})
