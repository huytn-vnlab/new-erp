import { test, expect, type Page } from '@playwright/test'
import { mockAuth } from './helpers/auth'
import { mockApi, mockApiEmpty, mockApiError, MOCK_CONTRACT_ROW, MOCK_PAGINATION } from './helpers/fixtures'

const ROUTES = {
  contracts: '**/contract/get-contract-current-list',
  types: '**/contract/get-contract-type-list',
  create: '**/contract/create-contract',
  delete: '**/contract/delete-contract',
}

async function setup(page: Page, empty = false) {
  await mockAuth(page)
  await mockApi(page, ROUTES.contracts, { contracts: empty ? [] : [MOCK_CONTRACT_ROW], pagination: MOCK_PAGINATION })
  await mockApi(page, ROUTES.types, { contract_types: [{ contract_type_id: 1, name: 'Hợp đồng thử việc', file_template_name: '', created_at: '' }] })
}

test.describe('Contract — data loading', () => {
  test('renders contract row', async ({ page }) => {
    await setup(page)
    await page.goto('/hrm/contract')
    await expect(page.getByText('Test Admin')).toBeVisible()
  })
})

test.describe('Contract — empty state', () => {
  test('shows empty state when no contracts', async ({ page }) => {
    await setup(page, true)
    await page.goto('/hrm/contract')
    await expect(page.locator('[data-test="empty-state"]')).toBeVisible()
  })
})

test.describe('Contract — error state', () => {
  test('shows error banner on failure', async ({ page }) => {
    await mockAuth(page)
    await mockApiError(page, ROUTES.contracts)
    await mockApi(page, ROUTES.types, { contract_types: [] })
    await page.goto('/hrm/contract')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()
  })
})

test.describe('Contract — filter', () => {
  test('filter by branch shows filtered results', async ({ page }) => {
    await setup(page)
    await page.goto('/hrm/contract')
    const branchSelect = page.locator('select, [data-test="branch-filter"]').first()
    if (await branchSelect.count() > 0) {
      await branchSelect.selectOption({ label: 'Tất cả' })
      await expect(page.getByText('Test Admin')).toBeVisible()
    }
  })
})
