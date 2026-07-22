<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Sidebar from '~/components/layout/Sidebar.vue'
import Topbar from '~/components/layout/Topbar.vue'
import TweaksPanel from '~/components/layout/TweaksPanel.vue'
import ToastHost from '~/components/base/ToastHost.vue'
import { useNotificationStore } from '~/stores/notification'
import { formatDateTimeDisplay } from '~/utils/date'

const route = useRoute()
const { tweaks, setTweak } = useTweaks()
const { t, locale, setLocale } = useI18n()
const auth = useAuth()
const notiStore = useNotificationStore()

// Restore user state after page refresh (token in cookie but useState resets)
onMounted(async () => {
  if (auth.token.value && !auth.user.value) await auth.fetchUser()
  notiStore.fetchUnreadCount()
})

const CRUMBS = computed<Record<string, { label: string }[]>>(() => ({
  '/home-admin':         [{ label: t('nav.home') }, { label: t('nav.dashboard') }],
  '/hrm/member':         [{ label: t('nav.home') }, { label: 'HRM' }, { label: t('nav.manageMember') }],
  '/hrm/member/profile': [{ label: t('nav.home') }, { label: 'HRM' }, { label: t('nav.manageMember') }, { label: t('nav.profile') }],
  '/hrm/leave':          [{ label: t('nav.home') }, { label: 'HRM' }, { label: t('nav.leave') }],
  '/hrm/asset':          [{ label: t('nav.home') }, { label: 'HRM' }, { label: t('nav.assets') }],
  '/hrm/contract':       [{ label: t('nav.home') }, { label: 'HRM' }, { label: t('nav.contract') }],
  '/hrm/timekeeping':    [{ label: t('nav.home') }, { label: 'HRM' }, { label: t('nav.timekeeping') }],
  '/evaluation':         [{ label: t('nav.home') }, { label: t('nav.evaluation') }],
  '/workflow/project':   [{ label: t('nav.home') }, { label: t('nav.workflow') }, { label: t('nav.project') }],
  '/recruitment':        [{ label: t('nav.home') }, { label: t('nav.recruitment') }],
  '/request/overtime':   [{ label: t('nav.home') }, { label: t('nav.request') }, { label: t('nav.overtime') }],
  '/settings':           [{ label: t('nav.home') }, { label: t('nav.setting') }],
}))
const crumbs = computed(() => {
  if (/^\/hrm\/member\/\d+$/.test(route.path))
    return [{ label: t('nav.home') }, { label: 'HRM' }, { label: t('nav.manageMember') }, { label: 'Hồ sơ nhân viên' }]
  return CRUMBS.value[route.path] ?? [{ label: t('nav.home') }]
})
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
            <span class="font-mono">{{ t('layout.lastUpdated') }} · {{ formatDateTimeDisplay(new Date(), true) }}</span>
          </footer>
        </div>
      </main>
    </div>
    <TweaksPanel />
    <ToastHost />
  </div>
</template>
