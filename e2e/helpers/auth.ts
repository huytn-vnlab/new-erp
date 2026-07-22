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
  await page.route('**/user/getuser', route =>
    route.fulfill({ json: { status: 1, message: 'ok', data: MOCK_USER } }),
  )
  // Every page under the `admin` layout fires this in onMounted (unread
  // notification badge) regardless of which page-level test is running. Left
  // unmocked, this hits the real backend with the fake token above, gets a
  // real 401, and useApi's auto-refresh-then-redirect kicks in — silently
  // bouncing every e2e test to /organization/find-organization before it can
  // assert anything, with no error to explain why.
  await page.route('**/notification/get-total-notifications-unread', route =>
    route.fulfill({ json: { status: 1, message: 'ok', data: 0 } }),
  )
}
