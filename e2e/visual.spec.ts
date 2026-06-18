/**
 * Visual screenshot capture — Nuxt implementation.
 * Run: pnpm test:screenshots
 * Output: test-results/screenshots/actual/<slug>.png
 */
import { test } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PAGES = [
  { slug: 'home-admin',      route: '/home-admin' },
  { slug: 'hrm-member',      route: '/hrm/member' },
  { slug: 'hrm-leave',       route: '/hrm/leave' },
  { slug: 'hrm-asset',       route: '/hrm/asset' },
  { slug: 'hrm-contract',    route: '/hrm/contract' },
  { slug: 'hrm-timekeeping', route: '/hrm/timekeeping' },
  { slug: 'evaluation',      route: '/evaluation' },
  { slug: 'recruitment',     route: '/recruitment' },
  { slug: 'overtime',        route: '/request/overtime' },
  { slug: 'project',         route: '/workflow/project' },
  { slug: 'settings',        route: '/settings' },
]

const OUT_DIR = 'test-results/screenshots/actual'

test.beforeAll(async () => {
  await mkdir(OUT_DIR, { recursive: true })
})

for (const { slug, route } of PAGES) {
  test(`@visual impl:${slug}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`http://localhost:3000${route}`)
    await page.waitForTimeout(1200) // let CSS animations settle
    await page.screenshot({ path: join(OUT_DIR, `${slug}.png`), fullPage: true })
  })
}
