// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { isValidEmail } from '../../app/utils/email'
import InviteModal from '../../app/components/member/InviteModal.vue'

afterEach(() => { document.body.innerHTML = '' })

describe('isValidEmail', () => {
  it('valida email hợp lệ', () => {
    expect(isValidEmail('a@b.com')).toBe(true)
    expect(isValidEmail('user.name+tag@example.co.vn')).toBe(true)
  })
  it('từ chối email không hợp lệ', () => {
    expect(isValidEmail('notanemail')).toBe(false)
    expect(isValidEmail('@no-local.com')).toBe(false)
    expect(isValidEmail('missing@dot')).toBe(false)
  })
})

describe('InviteModal', () => {
  it('render khi open=true (qua portal vào body)', async () => {
    mount(InviteModal, { props: { open: true }, attachTo: document.body })
    await new Promise(r => setTimeout(r, 10))
    expect(document.body.textContent).toContain('Mời thành viên')
  })
  it('không render nội dung khi open=false', () => {
    mount(InviteModal, { props: { open: false }, attachTo: document.body })
    expect(document.body.textContent).not.toContain('Mời thành viên')
  })
})
