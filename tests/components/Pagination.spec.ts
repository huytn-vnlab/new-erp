import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '../../app/components/base/Pagination.vue'

describe('Pagination', () => {
  it('hiển thị khoảng và phát change khi bấm trang', async () => {
    const w = mount(Pagination, { props: { page: 1, total: 25, perPage: 10 } })
    expect(w.text()).toContain('1-10')
    expect(w.text()).toContain('25')
    // bấm nút trang số 2
    await w.findAll('button').find(b => b.text() === '2')!.trigger('click')
    expect(w.emitted('change')![0]).toEqual([2])
  })
  it('nút Trước bị disable ở trang 1', () => {
    const w = mount(Pagination, { props: { page: 1, total: 25, perPage: 10 } })
    const prev = w.findAll('button').find(b => b.text().includes('Trước'))!
    expect(prev.attributes('disabled')).toBeDefined()
  })
})
