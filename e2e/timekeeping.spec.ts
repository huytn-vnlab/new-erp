import { test, expect, type Page } from '@playwright/test'
import { mockAuth } from './helpers/auth'
import { mockApi, mockApiError, MOCK_TK_ROW, MOCK_TK_TODAY, MOCK_PAGINATION } from './helpers/fixtures'

const ROUTES = {
  today: '**/api/timekeeping/get-timekeeping-today',
  all: '**/api/timekeeping/get-all-timekeeping',
  mine: '**/api/timekeeping/get-all-timekeeping-user',
  checkIn: '**/api/timekeeping/check-in',
  checkOut: '**/api/timekeeping/check-out',
}

async function setup(page: Page, empty = false) {
  await mockAuth(page)
  await mockApi(page, ROUTES.today, MOCK_TK_TODAY)
  await mockApi(page, ROUTES.all, { timekeepings: empty ? [] : [MOCK_TK_ROW], pagination: MOCK_PAGINATION })
  await mockApi(page, ROUTES.mine, { timekeepings: empty ? [] : [MOCK_TK_ROW], pagination: MOCK_PAGINATION })
}

test.describe('Timekeeping — data loading', () => {
  // MOCK_TK_ROW.full_name is 'Test Admin'. The default tab is 'mine' which shows
  // per-date history, not names. Switch to team tab to see per-person rows.
  // Use table-scoped locator because 'Test Admin' also appears in the topbar.
  test('renders timekeeping row', async ({ page }) => {
    await setup(page)
    await page.goto('/hrm/timekeeping')
    await page.getByText('Cả phòng ban').click()
    await expect(page.getByRole('table').getByText('Test Admin')).toBeVisible()
  })
})

test.describe('Timekeeping — empty state', () => {
  test('shows empty state when no records', async ({ page }) => {
    await setup(page, true)
    await page.goto('/hrm/timekeeping')
    await expect(page.locator('[data-test="empty-state"]')).toBeVisible()
  })
})

test.describe('Timekeeping — error state', () => {
  test('shows error banner on fetch failure', async ({ page }) => {
    await mockAuth(page)
    await mockApi(page, ROUTES.today, MOCK_TK_TODAY)
    await mockApiError(page, ROUTES.all)
    await mockApiError(page, ROUTES.mine)
    await page.goto('/hrm/timekeeping')
    await expect(page.locator('[data-test="error-banner"]')).toBeVisible()
  })
})

test.describe('Timekeeping — check-in', () => {
  // Register the post-click today response AFTER page.goto so the initial fetchToday
  // uses MOCK_TK_TODAY (no check-in), and the subsequent call after clicking gets
  // the updated state (LIFO route handler ordering in Playwright).
  test('check-in changes button state', async ({ page }) => {
    await setup(page)
    await mockApi(page, ROUTES.checkIn, {})
    await page.goto('/hrm/timekeeping')
    const btn = page.getByRole('button', { name: /chấm công vào/i })
    await expect(btn).toBeVisible()
    // Register updated today response so the post-click fetchToday returns checked-in state
    await mockApi(page, ROUTES.today, { check_in_time: '2026-06-30 09:00 AM', check_out_time: '', time_server: '2026-06-30 09:00:00' })
    await btn.click()
    await expect(page.getByRole('button', { name: /chấm công ra/i })).toBeVisible()
  })
})

test.describe('Timekeeping — month switch', () => {
  // The month selector is a reka-ui combobox (not a native <select>).
  // Interact via role="combobox" trigger + role="option" items.
  // Page must have watch(selectedMonth, ...) to trigger re-fetch.
  test('changing month triggers re-fetch', async ({ page }) => {
    await setup(page)
    let fetchCount = 0
    await page.route(ROUTES.all, async route => {
      fetchCount++
      await route.fulfill({ json: { status: 1, message: 'ok', data: { timekeepings: [], pagination: MOCK_PAGINATION } } })
    })
    await page.goto('/hrm/timekeeping')
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Tháng 4/2026' }).click()
    expect(fetchCount).toBeGreaterThan(1)
  })
})
