import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Select from '../../app/components/base/Select.vue'

describe('Select', () => {
  it('hiển thị label của option đang chọn', () => {
    const w = mount(Select, { props: {
      modelValue: 'hn', options: [{ value: 'hn', label: 'Hà Nội' }, { value: 'dn', label: 'Đà Nẵng' }],
    } })
    expect(w.text()).toContain('Hà Nội')
  })
  it('hiển thị placeholder khi chưa chọn', () => {
    const w = mount(Select, { props: { modelValue: undefined, options: [], placeholder: 'Tất cả' } })
    expect(w.text()).toContain('Tất cả')
  })
})
