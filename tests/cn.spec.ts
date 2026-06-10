import { describe, it, expect } from 'vitest'
import { cn } from '../app/utils/cn'

describe('cn', () => {
  it('gộp & dedupe class tailwind', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-sm', false && 'hidden', 'font-bold')).toBe('text-sm font-bold')
  })
})
