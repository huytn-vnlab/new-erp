/**
 * Visual screenshot capture — design prototype HTML.
 * Serves design/Admin Dashboard.html via scripts/design-server.mjs (port 3001).
 * Run: pnpm test:screenshots
 * Output: test-results/screenshots/design/<slug>.png
 */
import { test } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PAGES = [
  { slug: 'home-admin',      designRoute: '/home-admin' },
  { slug: 'hrm-member',      designRoute: '/hrm/member' },
  { slug: 'hrm-leave',       designRoute: '/hrm/leave' },
  { slug: 'hrm-asset',       designRoute: '/hrm/asset' },
  { slug: 'hrm-contract',    designRoute: '/hrm/contract' },
  { slug: 'hrm-timekeeping', designRoute: '/hrm/timekeeping' },
  { slug: 'evaluation',      designRoute: '/evaluation' },
  { slug: 'recruitment',     designRoute: '/recruitment' },
  { slug: 'overtime',        designRoute: '/request/overtime' },
  { slug: 'project',         designRoute: '/workflow/project' },
  { slug: 'settings',        designRoute: '/settings' },
]

const OUT_DIR = 'test-results/screenshots/design'
const DESIGN_URL = 'http://localhost:3001/Admin%20Dashboard.html'

test.beforeAll(async () => {
  await mkdir(OUT_DIR, { recursive: true })
})

for (const { slug, designRoute } of PAGES) {
  test(`@visual design:${slug}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(DESIGN_URL)

    // Wait for React + Babel + all JSX files to finish loading and mount
    await page.waitForFunction(
      () => typeof (window as { __erp_navigate?: unknown }).__erp_navigate === 'function',
      { timeout: 60_000 }
    )

    // Switch to the target page in the design app
    await page.evaluate((route: string) => {
      (window as { __erp_navigate: (r: string) => void }).__erp_navigate(route)
    }, designRoute)

    await page.waitForTimeout(1200) // let CSS animations settle
    await page.screenshot({ path: join(OUT_DIR, `${slug}.png`), fullPage: true })
  })
}
