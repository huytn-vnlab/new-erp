import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useTweaks } from '../app/composables/useTweaks'

describe('useTweaks', () => {
  beforeEach(() => localStorage.clear())

  it('mặc định light / sky / comfortable', () => {
    const { tweaks } = useTweaks()
    expect(tweaks.value).toEqual({ theme: 'light', accent: 'sky', density: 'comfortable' })
  })

  it('setTweak cập nhật và persist vào localStorage', async () => {
    const { tweaks, setTweak } = useTweaks()
    setTweak('theme', 'dark')
    expect(tweaks.value.theme).toBe('dark')
    await nextTick()
    expect(JSON.parse(localStorage.getItem('erp-tweaks')!).theme).toBe('dark')
  })
})
