// tests/hrm/auth.setup.ts
import { test as setup, expect } from '@playwright/test'
import path from 'path'

const adminAuthFile = path.join('playwright', '.auth', 'admin.json')
const userAuthFile  = path.join('playwright', '.auth', 'user.json')

// Reusable login helper
async function loginAs(page: any, email: string, password: string) {
  // Step 1: Find organization
  await page.goto('/organization/find-organization')
  await page.getByPlaceholder('Tên tổ chức').fill(process.env.PLAYWRIGHT_ORG_NAME ?? 'demo')
  await page.getByRole('button', { name: /tiếp tục/i }).click()

  // Step 2: Org result appears inline — click its "Đăng nhập" button to go to login page
  await page.getByRole('button', { name: /đăng nhập/i }).click()

  // Step 3: Now on login page — fill credentials (URL may have query params like ?org=...)
  await page.waitForURL(/\/user\/login/)
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: /đăng nhập/i }).click()

  // Step 4: Verify logged in
  await page.waitForURL('**/home-admin')
}

setup('authenticate as admin', async ({ page }) => {
  await loginAs(
    page,
    process.env.PLAYWRIGHT_ADMIN_EMAIL    ?? 'admin@demo.com',
    process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? 'password123',
  )
  await page.context().storageState({ path: adminAuthFile })
})

setup('authenticate as user', async ({ page }) => {
  await loginAs(
    page,
    process.env.PLAYWRIGHT_USER_EMAIL    ?? 'user@demo.com',
    process.env.PLAYWRIGHT_USER_PASSWORD ?? 'password123',
  )
  await page.context().storageState({ path: userAuthFile })
})
