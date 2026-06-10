<template>
  <Sidebar collapsible="offcanvas">
    <!-- Logo -->
    <SidebarHeader>
      <div class="flex items-center justify-center py-3 px-2">
        <NuxtLink to="/">
          <img :src="logo" :alt="$t('app.name')" class="h-8 w-auto" />
        </NuxtLink>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <!-- Overview -->
      <SidebarGroup>
        <SidebarGroupLabel>{{ $t('nav.section.overview') }}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in overviewItems" :key="item.to">
            <SidebarMenuButton as-child :is-active="isRouteActive(item.to!)">
              <NuxtLink :to="item.to!">
                <component :is="item.icon" />
                <span>{{ $t(item.labelKey) }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <!-- Module -->
      <SidebarGroup>
        <SidebarGroupLabel>{{ $t('nav.section.module') }}</SidebarGroupLabel>
        <SidebarMenu>
          <template v-for="item in moduleItems" :key="item.labelKey">

            <!-- Collapsible group -->
            <CollapsibleRoot
              v-if="item.children"
              as-child
              :default-open="isGroupActive(item)"
              class="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton :tooltip="$t(item.labelKey)">
                    <component :is="item.icon" />
                    <span>{{ $t(item.labelKey) }}</span>
                    <ChevronRight
                      class="ml-auto transition-transform duration-200
                             group-data-[state=open]/collapsible:rotate-90"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem
                      v-for="child in item.children"
                      :key="child.to"
                    >
                      <SidebarMenuSubButton
                        as-child
                        :is-active="isRouteActive(child.to)"
                      >
                        <NuxtLink :to="child.to">
                          <span>{{ $t(child.labelKey) }}</span>
                        </NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </CollapsibleRoot>

            <!-- Direct link -->
            <SidebarMenuItem v-else>
              <SidebarMenuButton as-child :is-active="isRouteActive(item.to!)">
                <NuxtLink :to="item.to!">
                  <component :is="item.icon" />
                  <span>{{ $t(item.labelKey) }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

          </template>
        </SidebarMenu>
      </SidebarGroup>

      <!-- Setting (admin only) -->
      <SidebarGroup v-if="settingItems.length">
        <SidebarGroupLabel>{{ $t('nav.section.system') }}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in settingItems" :key="item.to">
            <SidebarMenuButton as-child :is-active="isRouteActive(item.to!)">
              <NuxtLink :to="item.to!">
                <component :is="item.icon" />
                <span>{{ $t(item.labelKey) }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>

  </Sidebar>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import {
  LayoutDashboard,
  Users,
  Star,
  FolderKanban,
  UserPlus,
  Timer,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-vue-next'
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
} from 'reka-ui'
import { usePermissionStore } from '~/stores/permission'
import logo from '~/assets/images/new-logo.png'

const permissionStore = usePermissionStore()
const { user } = useAuth()
const route = useRoute()

type NavChild = {
  labelKey: string
  to: string
  module?: string
}

type NavItem = {
  labelKey: string
  icon: Component
  module?: string | null
  to?: string
  children?: NavChild[]
}

function canShow(module?: string | null): boolean {
  if (!module) return true
  return (
    !!user.value?.is_admin ||
    permissionStore.modules.length === 0 ||
    permissionStore.hasModule(module)
  )
}

function isRouteActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}

function isGroupActive(item: NavItem): boolean {
  return item.children?.some(c => isRouteActive(c.to)) ?? false
}

const overviewItems = computed((): NavItem[] =>
  [
    { labelKey: 'nav.dashboard', icon: LayoutDashboard, to: '/home-admin', module: null },
  ].filter(item => canShow(item.module))
)

const ALL_MODULE_ITEMS: NavItem[] = [
  {
    labelKey: 'nav.hrm',
    icon: Users,
    children: [
      { labelKey: 'nav.manageMember',      to: '/hrm/member/profile-list',        module: 'member' },
      { labelKey: 'nav.leave',       to: '/hrm/leave/history-user-leave',   module: 'leave' },
      { labelKey: 'nav.assets',      to: '/hrm/asset/asset-list',           module: 'assets' },
      { labelKey: 'nav.contract',    to: '/hrm/contract/manage-contract',   module: 'contract' },
      { labelKey: 'nav.timekeeping', to: '/hrm/timekeeping/user-timekeeping', module: 'timekeeping' },
    ],
  },
  {
    labelKey: 'nav.evaluation',
    icon: Star,
    to: '/evaluation/evaluation-list',
    module: 'evaluation',
  },
  {
    labelKey: 'nav.workflow',
    icon: FolderKanban,
    children: [
      { labelKey: 'nav.project', to: '/workflow/project-list', module: 'project' },
    ],
  },
  {
    labelKey: 'nav.recruitment',
    icon: UserPlus,
    children: [
      { labelKey: 'nav.manageRecruitment', to: '/recruitment/manage-recruitment', module: 'recruitment' },
    ],
  },
  {
    labelKey: 'nav.request',
    icon: Timer,
    children: [
      { labelKey: 'nav.overtime', to: '/request/manage-overtime', module: 'overtime' },
    ],
  },
]

const moduleItems = computed((): NavItem[] =>
  ALL_MODULE_ITEMS
    .map(item => {
      if (item.children) {
        const visible = item.children.filter(c => canShow(c.module))
        return visible.length ? { ...item, children: visible } : null
      }
      return canShow(item.module) ? item : null
    })
    .filter((item): item is NavItem => item !== null)
)

const settingItems = computed((): NavItem[] =>
  user.value?.is_admin
    ? [{ labelKey: 'nav.setting', icon: SlidersHorizontal, to: '/settings/job-title', module: null }]
    : []
)
</script>
