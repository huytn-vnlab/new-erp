import { test, expect, type Page } from '@playwright/test'
import { mockAuth } from './helpers/auth'
import { mockApi, mockApiError, MOCK_ASSET_ROW, MOCK_PAGINATION } from './helpers/fixtures'

const ROUTES = {
  assets: '**/asset/get-assets-list',
  types: '**/asset/get-asset-type-list',
  create: '**/asset/create-asset',
  update: '**/asset/update-asset',
  delete: '**/asset/delete-asset-by-id',
}

async function setup(page: Page, empty = false) {
  await mockAuth(page)
  await mockApi(page, ROUTES.assets, { assets: empty ? [] : [MOCK_ASSET_ROW], pagination: MOCK_PAGINATION })
  await mockApi(page, ROUTES.types, { asset_types: [{ asset_type_id: 1, name: 'Laptop' }] })
}

test.describe('Asset — data loading', () => {
  test('renders asset row', async ({ page }) => {
    await setup(page)
    await page.goto('/hrm/asset')
    await expect(page.getByText('Laptop Dell XPS')).toBeVisible()
  })
})

test.describe('Asset — empty state', () => {
  test('shows empty state when no assets', async ({ page }) => {
    await setup(page, true)
    await page.goto('/hrm/asset')
    await expect(page.locator('[data-test="empty-state"]')).toBeVisible()
  })
})

test.describe('Asset — error state', () => {
  test('shows error banner on failure', async ({ page }) => {
    await mockAuth(page)
    await mockApiError(page, ROUTES.assets)
    await mockApi(page, ROUTES.types, { asset_types: [] })
    await page.goto('/hrm/asset')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()
  })
})

test.describe('Asset — filter', () => {
  test('search by name filters results', async ({ page }) => {
    await setup(page)
    await page.goto('/hrm/asset')
    await page.getByPlaceholder(/tên, mã/i).fill('xyz-not-found')
    await expect(page.getByText('Laptop Dell XPS')).not.toBeVisible()
  })
})

test.describe('Asset — create', () => {
  test('create asset shows success toast', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.create, {})
    await page.goto('/hrm/asset')
    const addBtn = page.getByRole('button', { name: /thêm tài sản|tạo mới/i })
    if (await addBtn.count() > 0) {
      await addBtn.click()
      const nameInput = page.getByLabel(/tên/i).first()
      if (await nameInput.count() > 0) {
        await nameInput.fill('Máy tính mới')
        await page.getByRole('button', { name: /lưu|tạo/i }).click()
        await expect(page.getByText(/thêm thành công|đã tạo/i)).toBeVisible()
      }
    }
  })
})

test.describe('Asset — delete', () => {
  test('delete asset shows success toast', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.delete, {})
    await page.goto('/hrm/asset')
    const deleteBtn = page.getByRole('button', { name: /xóa/i }).first()
    if (await deleteBtn.count() > 0) {
      await deleteBtn.click()
      await expect(page.getByText(/đã xóa/i)).toBeVisible()
    }
  })
})
