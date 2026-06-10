import { test, expect } from '@playwright/test'

test('home dashboard render + theme toggle + nav', async ({ page }) => {
  await page.goto('/home-admin')
  // banner
  await expect(page.getByRole('heading', { name: /Văn An/ })).toBeVisible()
  // stat cards
  await expect(page.getByText('Tổng nhân viên')).toBeVisible()
  await expect(page.getByText('248', { exact: true })).toBeVisible()
  // theme toggle
  await page.locator('[data-test="theme-toggle"]').click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  // nav HRM → member
  await page.getByText('Nhân sự (HRM)').click()
  await page.getByText('Quản lý nhân viên').first().click()
  await expect(page).toHaveURL(/hrm\/member/)
  await page.screenshot({ path: 'e2e/__screenshots__/home.png', fullPage: true })
})
