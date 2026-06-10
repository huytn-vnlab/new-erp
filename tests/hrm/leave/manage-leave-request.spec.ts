import { test, expect } from '@playwright/test'

test.describe('Manage Leave Requests (admin only)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hrm/leave/manage-leave-request')
    await page.waitForLoadState('networkidle')
  })

  test('page loads and shows the leave request table', async ({ page }) => {
    await expect(page).toHaveURL('/hrm/leave/manage-leave-request')
    // Table or empty state must be visible
    const tableOrEmpty = page.locator('table, [role="table"]').or(
      page.locator('td, p').filter({ hasText: /không có dữ liệu|no data/i })
    )
    await expect(tableOrEmpty.first()).toBeVisible()
  })

  test('filter bar has status select and name input', async ({ page }) => {
    // Status combobox (Select trigger)
    await expect(page.getByRole('combobox')).toBeVisible()
    // Name filter input
    await expect(page.locator('input[type="text"], input:not([type])')).toBeVisible()
  })

  test('filtering by name narrows the results', async ({ page }) => {
    const nameInput = page.locator('input').first()
    await nameInput.fill('zzz_no_match_employee_9999')
    await page.waitForTimeout(500)
    // Either shows empty state or 0 rows
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    // If empty row is shown, count is 1 (the empty state row)
    // If no rows at all, count is 0
    expect(count).toBeLessThanOrEqual(1)
  })

  test('table has correct columns', async ({ page }) => {
    const headers = page.locator('thead th, [role="columnheader"]')
    const headCount = await headers.count()
    // Must have at least 5 columns: employee, type, from, to, status
    expect(headCount).toBeGreaterThanOrEqual(5)
  })

  test('approve action works for pending requests', async ({ page }) => {
    // Find the first approve button (only present for pending rows)
    const approveBtn = page.getByRole('button', { name: /duyệt/i }).first()
    const count = await approveBtn.count()
    if (count === 0) {
      test.skip() // No pending requests in test data
      return
    }
    await approveBtn.click()
    await page.waitForTimeout(1000)
    // Button should disappear (row status changed) or toast appears
    await expect(page.locator('body')).not.toContainText('error')
  })

  test('reject button opens a dialog with reason input', async ({ page }) => {
    const rejectBtn = page.getByRole('button', { name: /từ chối/i }).first()
    const count = await rejectBtn.count()
    if (count === 0) {
      test.skip() // No pending requests
      return
    }
    await rejectBtn.click()
    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible()
    // Reason textarea in dialog
    await expect(page.getByRole('dialog').locator('textarea')).toBeVisible()
  })

  test('reject dialog can be cancelled', async ({ page }) => {
    const rejectBtn = page.getByRole('button', { name: /từ chối/i }).first()
    const count = await rejectBtn.count()
    if (count === 0) {
      test.skip()
      return
    }
    await rejectBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: /hủy/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('shows error state on API failure', async ({ page }) => {
    await page.route('**/leave/get-leave-requests', route =>
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    )
    await page.goto('/hrm/leave/manage-leave-request')
    await page.waitForTimeout(2000)
    await expect(page.locator('body')).not.toContainText('undefined')
    await expect(page.locator('body')).toBeVisible()
  })
})
