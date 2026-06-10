import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Sidebar from '../../app/components/layout/Sidebar.vue'

describe('Sidebar', () => {
  it('đánh dấu route active', () => {
    const w = mount(Sidebar, { props: { activeRoute: '/home-admin' } })
    expect(w.find('.sidebar-item-active').exists()).toBe(true)
  })
  it('click nav phát navigate', async () => {
    const w = mount(Sidebar, { props: { activeRoute: '/home-admin' } })
    await w.find('[data-to="/home-admin"]').trigger('click')
    expect(w.emitted('navigate')![0]).toEqual(['/home-admin'])
  })
})
