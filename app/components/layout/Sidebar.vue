<script setup lang="ts">
import { LayoutDashboard, Users, Star, Folder, UserPlus, Timer, SlidersHorizontal } from 'lucide-vue-next'
import SidebarCollapsible from './SidebarCollapsible.vue'

const props = defineProps<{ activeRoute: string }>()
const emit = defineEmits<{ navigate: [string] }>()

const ICONS: Record<string, any> = { Dashboard: LayoutDashboard, Users, Star, Folder, UserPlus, Timer, Sliders: SlidersHorizontal }

const NAV = {
  overview: [{ key: 'dashboard', label: 'Tổng quan', icon: 'Dashboard', to: '/home-admin' }],
  module: [
    { key: 'hrm', label: 'Nhân sự (HRM)', icon: 'Users', children: [
      { key: 'member', label: 'Quản lý nhân viên', to: '/hrm/member' },
      { key: 'leave', label: 'Đơn nghỉ phép', to: '/hrm/leave' },
      { key: 'assets', label: 'Tài sản công ty', to: '/hrm/asset' },
      { key: 'contract', label: 'Hợp đồng', to: '/hrm/contract' },
      { key: 'timekeeping', label: 'Chấm công', to: '/hrm/timekeeping' },
    ] },
    { key: 'evaluation', label: 'Đánh giá nhân sự', icon: 'Star', to: '/evaluation' },
    { key: 'workflow', label: 'Workflow', icon: 'Folder', children: [{ key: 'project', label: 'Dự án', to: '/workflow/project' }] },
    { key: 'recruitment', label: 'Tuyển dụng', icon: 'UserPlus', children: [{ key: 'manage-recruitment', label: 'Quản lý tin tuyển dụng', to: '/recruitment' }] },
    { key: 'request', label: 'Yêu cầu', icon: 'Timer', children: [{ key: 'overtime', label: 'Tăng ca', to: '/request/overtime' }] },
  ],
  system: [{ key: 'setting', label: 'Cài đặt hệ thống', icon: 'Sliders', to: '/settings' }],
} as const

const logoSrc = '/logo.png'
const isActive = (to: string) => props.activeRoute === to
const activeChildKey = (item: any) => item.children?.find((c: any) => isActive(c.to))?.key
</script>

<template>
  <aside class="sidebar-bg w-[260px] shrink-0 h-svh sticky top-0 border-r border-border/60 flex flex-col">
    <div class="h-14 px-5 flex items-center justify-center border-b border-border/60">
      <img :src="logoSrc" alt="VNLab" class="h-7 w-auto select-none" draggable="false" >
    </div>
    <nav class="flex-1 overflow-y-auto scrollbar-thin px-2 pb-6">
      <!-- Overview -->
      <div class="px-3 pt-4 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/70 font-heading">Tổng quan</div>
      <div class="space-y-0.5">
        <button v-for="item in NAV.overview" :key="item.key" :data-to="item.to"
                :class="'nav-item w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium ' + (isActive(item.to) ? 'sidebar-item-active' : '')"
                @click="emit('navigate', item.to)">
          <span class="nav-ico"><component :is="ICONS[item.icon]" :size="16" /></span>
          <span class="flex-1 text-left truncate">{{ item.label }}</span>
        </button>
      </div>

      <!-- Module -->
      <div class="px-3 pt-4 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/70 font-heading">Module</div>
      <div class="space-y-0.5">
        <template v-for="item in NAV.module" :key="item.key">
          <SidebarCollapsible v-if="item.children" :item="item" :icon="ICONS[item.icon]"
                              :active-child="activeChildKey(item)" @child="emit('navigate', $event)" />
          <button v-else :data-to="item.to"
                  :class="'nav-item w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium ' + (isActive(item.to) ? 'sidebar-item-active' : '')"
                  @click="emit('navigate', item.to)">
            <span class="nav-ico"><component :is="ICONS[item.icon]" :size="16" /></span>
            <span class="flex-1 text-left truncate">{{ item.label }}</span>
          </button>
        </template>
      </div>

      <!-- System -->
      <div class="px-3 pt-4 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/70 font-heading">Hệ thống</div>
      <div class="space-y-0.5">
        <button v-for="item in NAV.system" :key="item.key" :data-to="item.to"
                :class="'nav-item w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium ' + (isActive(item.to) ? 'sidebar-item-active' : '')"
                @click="emit('navigate', item.to)">
          <span class="nav-ico"><component :is="ICONS[item.icon]" :size="16" /></span>
          <span class="flex-1 text-left truncate">{{ item.label }}</span>
        </button>
      </div>
    </nav>

    <div class="mx-3 mb-3 rounded-xl border border-border/70 bg-card/60 backdrop-blur p-3">
      <div class="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span class="relative inline-flex h-1.5 w-1.5"><span class="absolute inset-0 rounded-full bg-emerald-500 live-dot" /></span>
        <span>Tất cả hệ thống hoạt động</span>
      </div>
      <div class="mt-1.5 text-[10.5px] font-mono text-muted-foreground/70">v4.0.0 · build 1</div>
    </div>
  </aside>
</template>
