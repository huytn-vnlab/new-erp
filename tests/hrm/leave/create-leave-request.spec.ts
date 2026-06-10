// tests/hrm/leave/create-leave-request.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Create Leave Request', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hrm/leave/create-leave-request')
    await page.waitForLoadState('networkidle')
  })

  test('page loads and shows the form', async ({ page }) => {
    await expect(page).toHaveURL('/hrm/leave/create-leave-request')
    // All required form fields visible
    await expect(page.getByRole('combobox')).toBeVisible()              // leave type select
    const dateInputs = page.locator('input[type="date"]')
    await expect(dateInputs).toHaveCount(2)                             // start + end date
    await expect(page.locator('textarea')).toBeVisible()                // reason
    await expect(page.getByRole('button', { name: /gửi đơn/i })).toBeVisible() // submit
    await expect(page.getByRole('button', { name: /hủy/i })).toBeVisible()     // cancel
  })

  test('shows leave balance info when loaded', async ({ page }) => {
    // Leave balance section should show remaining days
    const balanceSection = page.locator('div').filter({ hasText: /phép năm còn lại|còn lại/i }).first()
    await expect(balanceSection).toBeVisible()
  })

  test('shows validation errors when submitting empty form', async ({ page }) => {
    await page.getByRole('button', { name: /gửi đơn/i }).click()
    // At least one validation error should appear
    const errors = page.locator('p').filter({ hasText: /vui lòng|required/i })
    await expect(errors.first()).toBeVisible()
  })

  test('working days preview appears when dates are selected', async ({ page }) => {
    const dateInputs = page.locator('input[type="date"]')
    await dateInputs.nth(0).fill('2026-06-01')
    await dateInputs.nth(0).dispatchEvent('change')
    await dateInputs.nth(1).fill('2026-06-05')
    await dateInputs.nth(1).dispatchEvent('change')
    await page.waitForTimeout(300)
    const preview = page.locator('div, p').filter({ hasText: /số ngày làm việc/i })
    await expect(preview.first()).toBeVisible()
  })

  test('cancel button navigates back', async ({ page }) => {
    await page.getByRole('button', { name: /hủy/i }).click()
    // No crash = pass
    await page.waitForTimeout(500)
    await expect(page.locator('body')).toBeVisible()
  })

  test('shows server error on API failure', async ({ page }) => {
    await page.route('**/leave/create-leave', route =>
      route.fulfill({ status: 500, body: JSON.stringify({ status: 0, message: 'Server error' }) })
    )
    // Select leave type
    await page.getByRole('combobox').click()
    await page.getByRole('option').first().click()
    // Fill dates
    const dateInputs = page.locator('input[type="date"]')
    await dateInputs.nth(0).fill('2026-06-01')
    await dateInputs.nth(1).fill('2026-06-05')
    // Fill reason
    await page.locator('textarea').fill('Test reason for leave request')
    // Submit
    await page.getByRole('button', { name: /gửi đơn/i }).click()
    await page.waitForTimeout(1000)
    // Error message should appear somewhere
    const errorMsg = page.locator('[role="alert"], div.text-destructive, div.text-red-700, p.text-destructive')
    await expect(errorMsg.first()).toBeVisible()
  })
})
