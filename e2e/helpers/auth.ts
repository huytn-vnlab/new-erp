// e2e/helpers/auth.ts
import type { Page } from '@playwright/test'

export const MOCK_USER = {
  id: 1,
  name: 'Test Admin',
  email: 'admin@test.com',
  role_id: 1,
  role_name: 'Admin',
  branch: 1,
  branch_name: 'Hà Nội',
  avatar: null,
}

export async function mockAuth(page: Page): Promise<void> {
  await page.context().addCookies([
    { name: 'auth_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' },
    { name: 'refresh_token', value: 'mock-refresh', domain: 'localhost', path: '/' },
  ])
  await page.route('**/api/user/getuser', route =>
    route.fulfill({ json: { status: 1, message: 'ok', data: MOCK_USER } }),
  )
}
