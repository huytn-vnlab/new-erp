<template>
  <header class="flex items-center h-14 shrink-0 px-6 gap-4 bg-background border-b border-border sticky top-0 z-10">
    <!-- Sidebar toggle -->
    <SidebarTrigger class="text-muted-foreground hover:text-foreground" />

    <!-- Breadcrumb -->
    <Breadcrumb class="ml-2">
      <BreadcrumbList>
        <template v-for="(crumb, i) in breadcrumbs" :key="i">
          <BreadcrumbItem>
            <BreadcrumbLink v-if="crumb.to && i < breadcrumbs.length - 1" :href="crumb.to">
              {{ crumb.label }}
            </BreadcrumbLink>
            <BreadcrumbPage v-else>{{ crumb.label }}</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator v-if="i < breadcrumbs.length - 1" />
        </template>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Flex spacer -->
    <div class="flex-1" />

    <!-- Language Switcher -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button class="flex items-center gap-1.5 p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" :title="$t('common.language') || 'Ngôn ngữ'">
          <img :src="getFlag(locale)" class="h-4 w-5 rounded-[2px] object-cover" alt="" />
          <span class="text-xs font-medium uppercase w-5 text-center">{{ locale }}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          v-for="l in locales"
          :key="l.code"
          :class="['cursor-pointer gap-2', { 'bg-muted font-medium': locale === l.code }]"
          @click="setLocale(l.code)"
        >
          <img :src="getFlag(l.code)" class="h-4 w-5 rounded-[2px] object-cover" alt="" />
          <span>{{ l.name }}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- Dark mode toggle -->
    <button
      class="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors dark:hover:bg-gray-700"
      :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleTheme"
    >
      <Moon v-if="isDark" class="h-5 w-5" />
      <Sun v-else class="h-5 w-5" />
    </button>

    <!-- Notification bell -->
    <AppNotificationBell />

    <!-- Divider -->
    <div class="w-px h-5 bg-border" />

    <!-- User button with dropdown -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors group">
          <Avatar size="sm">
            <AvatarFallback class="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {{ userInitials }}
            </AvatarFallback>
          </Avatar>
          <span class="text-sm font-medium text-foreground hidden sm:inline">{{ user?.full_name }}</span>
          <ChevronDown class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent class="w-56" align="end">
        <DropdownMenuLabel class="font-normal">
          <div class="flex items-center gap-3 py-1">
            <Avatar size="md">
              <AvatarFallback class="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {{ userInitials }}
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-foreground truncate">{{ user?.full_name }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ user?.email }}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem @click="navigateTo('/profile')">
          <User class="mr-2 h-4 w-4" />
          <span>{{ $t('common.profile') || 'Hồ sơ cá nhân' }}</span>
        </DropdownMenuItem>

        <DropdownMenuItem @click="navigateTo('/profile/change-password')">
          <Key class="mr-2 h-4 w-4" />
          <span>{{ $t('common.changePassword') || 'Đổi mật khẩu' }}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem @click="handleLogout" class="text-red-600 focus:text-red-600 focus:bg-red-50">
          <LogOut class="mr-2 h-4 w-4" />
          <span>{{ $t('auth.logout') || 'Đăng xuất' }}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>

<script setup lang="ts">
import {
  Moon,
  Sun,
  ChevronDown,
  User,
  Key,
  LogOut,
} from 'lucide-vue-next'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
import Avatar from '~/components/ui/Avatar.vue'
import DropdownMenu from '~/components/ui/DropdownMenu.vue'
import DropdownMenuItem from '~/components/ui/DropdownMenuItem.vue'
import DropdownMenuLabel from '~/components/ui/DropdownMenuLabel.vue'
import DropdownMenuSeparator from '~/components/ui/DropdownMenuSeparator.vue'
import vnFlag from '~/assets/images/flags/vn.svg'
import enFlag from '~/assets/images/flags/us.svg'
import jaFlag from '~/assets/images/flags/jp.svg'

const { user, logout } = useAuth()
const { breadcrumbs } = useNavBreadcrumbs()
const router = useRouter()
const { isDark, toggle: toggleTheme } = useTheme()
const { locale, locales, setLocale } = useI18n()

const getFlag = (code: string) => {
  switch (code) {
    case 'vi': return vnFlag
    case 'en': return enFlag
    case 'ja': return jaFlag
    default: return vnFlag
  }
}

const userInitials = computed(() => {
  const name = user.value?.full_name ?? ''
  return name
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
})

async function handleLogout() {
  await logout()
  router.push('/user/login')
}
</script>
