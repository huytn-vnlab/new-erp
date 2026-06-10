import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Sparkline from '../../app/components/charts/Sparkline.vue'

describe('Sparkline', () => {
  it('vẽ path line + area + end dot', () => {
    const w = mount(Sparkline, { props: { data: [1, 3, 2, 5] } })
    expect(w.findAll('path')).toHaveLength(2) // area + line
    expect(w.find('circle').exists()).toBe(true)
  })
  it('rỗng khi không có data', () => {
    const w = mount(Sparkline, { props: { data: [] } })
    expect(w.find('svg').exists()).toBe(false)
  })
})
