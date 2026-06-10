import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatCard from '../../app/components/home/StatCard.vue'

describe('StatCard', () => {
  it('hiển thị value, sublabel, sparkline, breakdown', () => {
    const w = mount(StatCard, { props: {
      label: 'Tổng', icon: 'Users', value: 248, sublabel: 'x',
      sparkData: [1, 2, 3], breakdown: [{ label: 'HN', value: 142 }],
    } })
    expect(w.text()).toContain('248')
    expect(w.find('svg').exists()).toBe(true)
    expect(w.text()).toContain('142')
  })
})
