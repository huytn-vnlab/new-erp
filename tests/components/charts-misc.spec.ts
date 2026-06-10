import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BarRow from '../../app/components/charts/BarRow.vue'
import Donut from '../../app/components/charts/Donut.vue'
import StackedBar from '../../app/components/charts/StackedBar.vue'

describe('charts misc', () => {
  it('BarRow tính % đúng và hiển thị label/value', () => {
    const w = mount(BarRow, { props: { label: 'FE', value: 5, max: 10 } })
    expect(w.text()).toContain('FE')
    expect(w.text()).toContain('5')
    expect(w.find('[data-pct]').attributes('data-pct')).toBe('50')
  })
  it('Donut render 2 vòng + label giữa', () => {
    const w = mount(Donut, { props: { used: 3, total: 4, label: '75%' } })
    expect(w.findAll('circle')).toHaveLength(2)
    expect(w.text()).toContain('75%')
  })
  it('StackedBar render đủ segments', () => {
    const w = mount(StackedBar, { props: { segments: [{ label: 'a', value: 1, color: '#000' }, { label: 'b', value: 1, color: '#fff' }] } })
    expect(w.findAll('div[title]')).toHaveLength(2)
  })
})
