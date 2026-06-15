// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Drawer from '../../app/components/base/Drawer.vue'

describe('Drawer', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('render slot khi open=true', async () => {
    mount(Drawer, { props: { open: true, title: 'Hồ sơ' }, slots: { default: 'CHI TIẾT' }, attachTo: document.body })
    await new Promise(r => setTimeout(r, 10))
    expect(document.body.textContent).toContain('CHI TIẾT')
  })
})
