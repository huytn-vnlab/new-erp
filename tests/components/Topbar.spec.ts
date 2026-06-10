import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Topbar from '../../app/components/layout/Topbar.vue'

const crumbs = [{ label: 'Trang chủ' }, { label: 'Tổng quan' }]

describe('Topbar', () => {
  it('render breadcrumb + badge unread', () => {
    const w = mount(Topbar, { props: { crumbs, isDark: false, locale: 'vi', unread: 3 } })
    expect(w.text()).toContain('Tổng quan')
    expect(w.text()).toContain('3')
  })
  it('toggle theme phát event', async () => {
    const w = mount(Topbar, { props: { crumbs, isDark: false, locale: 'vi', unread: 0 } })
    await w.find('[data-test="theme-toggle"]').trigger('click')
    expect(w.emitted('toggleTheme')).toHaveLength(1)
  })
})
