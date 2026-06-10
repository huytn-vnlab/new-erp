/**
 * layout store — sidebar open/close, breadcrumbs, page title.
 * Replaces: store/modules/layout-admin.ts
 */
import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', () => {
  const sidebarOpen = ref(true)
  const pageTitle = ref('')
  const breadcrumbs = ref<{ label: string; to?: string }[]>([])

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setPageTitle(title: string) {
    pageTitle.value = title
  }

  function setBreadcrumbs(items: { label: string; to?: string }[]) {
    breadcrumbs.value = items
  }

  return { sidebarOpen, pageTitle, breadcrumbs, toggleSidebar, setPageTitle, setBreadcrumbs }
})
