import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MiniStat from '../../app/components/base/MiniStat.vue'

describe('MiniStat', () => {
  it('hiển thị label, value, sublabel', () => {
    const w = mount(MiniStat, { props: { label: 'Tổng', value: 248, sublabel: '4 chi nhánh' } })
    expect(w.text()).toContain('Tổng')
    expect(w.text()).toContain('248')
    expect(w.text()).toContain('4 chi nhánh')
  })
  it('trend up hiển thị mũi tên lên', () => {
    const w = mount(MiniStat, { props: { label: 'X', value: 1, trend: { dir: 'up', value: '+2' } } })
    expect(w.text()).toContain('↑')
    expect(w.text()).toContain('+2')
  })
})
