import { describe, it, expect } from 'vitest'
import { MEMBERS, MEMBER_STATUS_META, INVITATIONS } from '../app/mocks/members'

describe('mocks/members', () => {
  it('có 15 nhân viên, đủ field', () => {
    expect(MEMBERS).toHaveLength(15)
    expect(MEMBERS[0]).toHaveProperty('name')
    expect(MEMBERS[0]).toHaveProperty('branch')
    expect(MEMBERS[0]).toHaveProperty('status')
  })
  it('status meta map đủ 4 trạng thái', () => {
    expect(Object.keys(MEMBER_STATUS_META)).toEqual(['active', 'onboarding', 'leave', 'inactive'])
  })
  it('có lời mời seed', () => {
    expect(INVITATIONS.length).toBeGreaterThan(0)
  })
})
