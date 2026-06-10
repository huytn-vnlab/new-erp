import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from '../../app/components/base/Badge.vue'

describe('Badge', () => {
  it('render text + dot khi dot=true', () => {
    const w = mount(Badge, { props: { variant: 'green', dot: true }, slots: { default: 'Active' } })
    expect(w.text()).toContain('Active')
    expect(w.find('[data-dot]').exists()).toBe(true)
  })
  it('không có dot mặc định', () => {
    const w = mount(Badge, { slots: { default: 'X' } })
    expect(w.find('[data-dot]').exists()).toBe(false)
  })
})
