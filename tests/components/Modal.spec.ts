// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from '../../app/components/base/Modal.vue'

describe('Modal', () => {
  // Clean up portal content between tests to avoid bleed-over
  afterEach(() => { document.body.innerHTML = '' })

  it('render title + slot khi open=true (qua portal vào body)', async () => {
    mount(Modal, { props: { open: true, title: 'Mời thành viên' }, slots: { default: 'NỘI DUNG' }, attachTo: document.body })
    await new Promise(r => setTimeout(r, 10))
    expect(document.body.textContent).toContain('Mời thành viên')
    expect(document.body.textContent).toContain('NỘI DUNG')
  })
  it('không render nội dung khi open=false', () => {
    mount(Modal, { props: { open: false, title: 'X' }, slots: { default: 'NỘI DUNG' }, attachTo: document.body })
    expect(document.body.textContent).not.toContain('NỘI DUNG')
  })
})
