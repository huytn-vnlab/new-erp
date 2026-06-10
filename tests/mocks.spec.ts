import { describe, it, expect } from 'vitest'
import { dashboardStats, homeTabs } from '../app/mocks/dashboard'

describe('mocks/dashboard', () => {
  it('có 3 stat card với sparkData', () => {
    expect(dashboardStats).toHaveLength(3)
    expect(dashboardStats[0]!.sparkData.length).toBeGreaterThan(0)
  })
  it('có 3 tab', () => {
    expect(homeTabs.map(t => t.value)).toEqual(['company', 'personal', 'project'])
  })
})
