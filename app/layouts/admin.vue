<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Sidebar from '~/components/layout/Sidebar.vue'
import Topbar from '~/components/layout/Topbar.vue'
import TweaksPanel from '~/components/layout/TweaksPanel.vue'
import ToastHost from '~/components/base/ToastHost.vue'
import { useNotificationStore } from '~/stores/notification'

const route = useRoute()
const { tweaks, setTweak } = useTweaks()
const { locale, setLocale } = useI18n()
const auth = useAuth()
const notiStore = useNotificationStore()

// Restore user state after page refresh (token in cookie but useState resets)
onMounted(async () => {
  if (auth.token.value && !auth.user.value) await auth.fetchUser()
  notiStore.fetchUnreadCount()
})

const CRUMBS: Record<string, { label: string }[]> = {
  '/home-admin': [{ label: 'Trang chủ' }, { label: 'Tổng quan' }],
  '/hrm/member': [{ label: 'Trang chủ' }, { label: 'HRM' }, { label: 'Quản lý nhân viên' }],
  '/hrm/member/profile': [{ label: 'Trang chủ' }, { label: 'HRM' }, { label: 'Quản lý nhân viên' }, { label: 'Hồ sơ cá nhân' }],
  '/hrm/leave': [{ label: 'Trang chủ' }, { label: 'HRM' }, { label: 'Đơn nghỉ phép' }],
  '/hrm/asset': [{ label: 'Trang chủ' }, { label: 'HRM' }, { label: 'Tài sản' }],
  '/hrm/contract': [{ label: 'Trang chủ' }, { label: 'HRM' }, { label: 'Hợp đồng' }],
  '/hrm/timekeeping': [{ label: 'Trang chủ' }, { label: 'HRM' }, { label: 'Chấm công' }],
  '/evaluation': [{ label: 'Trang chủ' }, { label: 'Đánh giá nhân sự' }],
  '/workflow/project': [{ label: 'Trang chủ' }, { label: 'Workflow' }, { label: 'Dự án' }],
  '/recruitment': [{ label: 'Trang chủ' }, { label: 'Tuyển dụng' }],
  '/request/overtime': [{ label: 'Trang chủ' }, { label: 'Yêu cầu' }, { label: 'Tăng ca' }],
  '/settings': [{ label: 'Trang chủ' }, { label: 'Cài đặt hệ thống' }],
}
const crumbs = computed(() => CRUMBS[route.path] ?? [{ label: 'Trang chủ' }])
const isDark = computed(() => tweaks.value.theme === 'dark')
const density = computed(() => tweaks.value.density)

function navigate(to: string) { navigateTo(to) }
function toggleTheme() { setTweak('theme', isDark.value ? 'light' : 'dark') }
</script>

<template>
  <div class="flex min-h-svh">
    <Sidebar :active-route="route.path" @navigate="navigate" />
    <div class="flex-1 min-w-0 flex flex-col">
      <Topbar
        :crumbs="crumbs" :is-dark="isDark" :locale="locale" :unread="notiStore.unreadCount"
        @toggle-theme="toggleTheme" @update:locale="(l) => setLocale(l as any)"
      />
      <main class="app-canvas flex-1 overflow-y-auto scrollbar-thin">
        <div :key="route.path" :class="'mx-auto max-w-[1400px] flex flex-col min-h-full ' + (density === 'compact' ? 'p-4' : 'p-6')">
          <div :class="'flex-1 ' + (density === 'compact' ? 'space-y-4' : 'space-y-6')">
            <slot />
          </div>
          <footer class="pt-4 pb-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/70 mt-10">
            <span>© 2026 GMO-Z.com Vietnam Lab Center · VNLab Internal</span>
            <span class="font-mono">Cập nhật lần cuối · {{ new Date().toLocaleString('vi-VN') }}</span>
          </footer>
        </div>
      </main>
    </div>
    <TweaksPanel />
    <ToastHost />
  </div>
</template>
