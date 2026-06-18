import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1440, height: 900 },
  },
  webServer: [
    {
      command: 'corepack pnpm dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'node scripts/design-server.mjs',
      url: 'http://localhost:3001',
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
})
