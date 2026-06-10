import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import LineChart from '../../app/components/charts/LineChart.vue'

describe('LineChart', () => {
  it('mount với data, render container (Unovis stubbed)', () => {
    const w = shallowMount(LineChart, { props: { data: [{ label: 'Q1', value: 3 }, { label: 'Q2', value: 2 }] } })
    expect(w.find('.erp-linechart').exists()).toBe(true)
    expect(w.find('.erp-linechart').attributes('style')).toContain('220px')
  })
})
