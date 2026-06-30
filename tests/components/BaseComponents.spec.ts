import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { AlertCircle } from 'lucide-vue-next'
import SkeletonRow from '~/components/base/SkeletonRow.vue'
import EmptyState from '~/components/base/EmptyState.vue'
import ErrorBanner from '~/components/base/ErrorBanner.vue'

describe('SkeletonRow', () => {
  it('renders correct number of rows and cells', () => {
    const wrapper = mount(SkeletonRow, { props: { cols: 4, rows: 3 } })
    const rows = wrapper.findAll('tr')
    expect(rows).toHaveLength(3)
    expect(rows[0].findAll('td')).toHaveLength(4)
  })

  it('defaults to 5 rows', () => {
    const wrapper = mount(SkeletonRow, { props: { cols: 3 } })
    expect(wrapper.findAll('tr')).toHaveLength(5)
  })
})

describe('EmptyState', () => {
  it('renders title and description', () => {
    const wrapper = mount(EmptyState, {
      props: { icon: AlertCircle, title: 'Không có dữ liệu', description: 'Thêm mục mới' },
    })
    expect(wrapper.text()).toContain('Không có dữ liệu')
    expect(wrapper.text()).toContain('Thêm mục mới')
  })

  it('renders slot content', () => {
    const wrapper = mount(EmptyState, {
      props: { icon: AlertCircle, title: 'Empty' },
      slots: { action: '<button>Add</button>' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('has data-test attribute', () => {
    const wrapper = mount(EmptyState, { props: { icon: AlertCircle, title: 'T' } })
    expect(wrapper.find('[data-test="empty-state"]').exists()).toBe(true)
  })
})

describe('ErrorBanner', () => {
  it('renders message', () => {
    const wrapper = mount(ErrorBanner, { props: { message: 'Lỗi kết nối' } })
    expect(wrapper.text()).toContain('Lỗi kết nối')
  })

  it('emits retry when button clicked', async () => {
    const wrapper = mount(ErrorBanner, { props: { message: 'Lỗi' } })
    await wrapper.find('[data-test="retry-btn"]').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('has data-test attribute', () => {
    const wrapper = mount(ErrorBanner, { props: { message: 'Lỗi' } })
    expect(wrapper.find('[data-test="error-banner"]').exists()).toBe(true)
  })
})
