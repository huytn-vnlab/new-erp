import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Tabs from '../../app/components/base/Tabs.vue'

const items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]

describe('Tabs', () => {
  it('đánh dấu active theo modelValue', () => {
    const w = mount(Tabs, { props: { modelValue: 'a', items } })
    const btns = w.findAll('button')
    expect(btns[0].attributes('data-active')).toBe('true')
    expect(btns[1].attributes('data-active')).toBe('false')
  })
  it('click phát update:modelValue', async () => {
    const w = mount(Tabs, { props: { modelValue: 'a', items } })
    await w.findAll('button')[1].trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual(['b'])
  })
})
