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
  it('với nhiều trang, cửa sổ căn quanh trang hiện tại (có nút trang hiện tại)', () => {
    // 200 mục / 10 = 20 trang, đang ở trang 7 → cửa sổ [5,6,7,8,9]
    const w = mount(Pagination, { props: { page: 7, total: 200, perPage: 10 } })
    const labels = w.findAll('button').map(b => b.text())
    expect(labels).toContain('7') // trang hiện tại luôn có nút
    expect(labels).not.toContain('1') // trang 1 nằm ngoài cửa sổ
    expect(w.text()).toContain('…') // có dấu ellipsis
  })
})
