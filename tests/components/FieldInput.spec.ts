import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FieldInput from '../../app/components/base/FieldInput.vue'

describe('FieldInput', () => {
  it('hiển thị placeholder và phát update:modelValue khi gõ', async () => {
    const w = mount(FieldInput, { props: { modelValue: '', placeholder: 'Tìm…' } })
    const input = w.find('input')
    expect(input.attributes('placeholder')).toBe('Tìm…')
    await input.setValue('an')
    expect(w.emitted('update:modelValue')![0]).toEqual(['an'])
  })
})
