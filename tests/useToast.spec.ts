import { describe, it, expect, beforeEach } from 'vitest'
import { useToast } from '../app/composables/useToast'

describe('useToast', () => {
  beforeEach(() => { useToast().clear() })
  it('show thêm toast và dismiss xoá theo id', () => {
    const { toasts, show, dismiss } = useToast()
    const id = show('Đã gửi!', 'success', 0)
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]!.message).toBe('Đã gửi!')
    dismiss(id)
    expect(toasts.value).toHaveLength(0)
  })
})
