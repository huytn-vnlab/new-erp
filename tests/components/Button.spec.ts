import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../../app/components/base/Button.vue'

describe('Button', () => {
  it('render slot + phát click', async () => {
    const wrapper = mount(Button, { slots: { default: 'Lưu' } })
    expect(wrapper.text()).toContain('Lưu')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  // Lưu ý: happy-dom không parse inline-style chứa hsl(var(--x)) nên không assert style attr;
  // phân biệt variant qua class (gradient render thật verify bằng screenshot ở Task 20).
  it('variant primary dùng text trắng, không viền', () => {
    const wrapper = mount(Button, { props: { variant: 'primary' } })
    expect(wrapper.classes()).toContain('text-white')
    expect(wrapper.classes()).not.toContain('border-border')
  })

  it('variant outline có viền border', () => {
    const wrapper = mount(Button, { props: { variant: 'outline' } })
    expect(wrapper.classes()).toContain('border-border')
  })
})
