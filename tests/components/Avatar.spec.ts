import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Avatar from '../../app/components/base/Avatar.vue'

describe('Avatar', () => {
  it('lấy initials 2 ký tự cuối, viết hoa', () => {
    expect(mount(Avatar, { props: { name: 'Nguyễn Văn An' } }).text()).toBe('VA')
  })
  it('fallback ? khi không có tên', () => {
    expect(mount(Avatar, { props: { name: '' } }).text()).toBe('?')
  })
})
