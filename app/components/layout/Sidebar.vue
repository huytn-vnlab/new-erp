<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { LayoutDashboard, Users, Star, Folder, UserPlus, Timer, SlidersHorizontal } from 'lucide-vue-next'
import SidebarCollapsible from './SidebarCollapsible.vue'

const props = defineProps<{ activeRoute: string }>()
const emit = defineEmits<{ navigate: [string] }>()

const { t } = useI18n()

const ICONS: Record<string, Component> = { Dashboard: LayoutDashboard, Users, Star, Folder, UserPlus, Timer, Sliders: SlidersHorizontal }

type NavChild = { key: string; label: string; to: string }
type NavItem = { key: string; label: string; icon: string; to?: string; children?: NavChild[] }

const NAV = computed<{ overview: NavItem[]; module: NavItem[]; system: NavItem[] }>(() => ({
  overview: [{ key: 'dashboard', label: t('nav.dashboard'), icon: 'Dashboard', to: '/home-admin' }],
  module: [
    { key: 'hrm', label: t('nav.hrm'), icon: 'Users', children: [
      { key: 'member', label: t('nav.manageMember'), to: '/hrm/member' },
      { key: 'leave', label: t('nav.leave'), to: '/hrm/leave' },
      { key: 'assets', label: t('nav.assets'), to: '/hrm/asset' },
      { key: 'contract', label: t('nav.contract'), to: '/hrm/contract' },
      { key: 'timekeeping', label: t('nav.timekeeping'), to: '/hrm/timekeeping' },
    ] },
    { key: 'evaluation', label: t('nav.evaluation'), icon: 'Star', to: '/evaluation' },
    { key: 'workflow', label: t('nav.workflow'), icon: 'Folder', children: [{ key: 'project', label: t('nav.project'), to: '/workflow/project' }] },
    { key: 'recruitment', label: t('nav.recruitment'), icon: 'UserPlus', children: [{ key: 'manage-recruitment', label: t('nav.manageRecruitment'), to: '/recruitment' }] },
    { key: 'request', label: t('nav.request'), icon: 'Timer', children: [{ key: 'overtime', label: t('nav.overtime'), to: '/request/overtime' }] },
  ],
  system: [{ key: 'setting', label: t('nav.setting'), icon: 'Sliders', to: '/settings' }],
}))

const logoSrc = '/logo.png'
const isActive = (to?: string) => props.activeRoute === to
const activeChildKey = (item: NavItem) => item.children?.find(c => isActive(c.to))?.key
</script>

<template>
  <aside class="sidebar-bg w-[260px] shrink-0 h-svh sticky top-0 border-r border-border/60 flex flex-col">
    <div class="h-14 px-5 flex items-center justify-center border-b border-border/60">
      <img :src="logoSrc" alt="VNLab" class="h-7 w-auto select-none" draggable="false" >
    </div>
    <nav class="flex-1 overflow-y-auto scrollbar-thin px-2 pb-6">
      <div class="px-3 pt-4 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/70 font-heading">{{ t('nav.section.overview') }}</div>
      <div class="space-y-0.5">
        <button
          v-for="item in NAV.overview" :key="item.key" :data-to="item.to"
          :class="'nav-item w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium ' + (isActive(item.to) ? 'sidebar-item-active' : '')"
          @click="emit('navigate', item.to!)">
          <span class="nav-ico"><component :is="ICONS[item.icon]" :size="16" /></span>
          <span class="flex-1 text-left truncate">{{ item.label }}</span>
        </button>
      </div>

      <div class="px-3 pt-4 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/70 font-heading">{{ t('nav.section.module') }}</div>
      <div class="space-y-0.5">
        <template v-for="item in NAV.module" :key="item.key">
          <SidebarCollapsible
            v-if="item.children" :item="item" :icon="ICONS[item.icon]!"
            :active-child="activeChildKey(item)" @child="emit('navigate', $event)" />
          <button
            v-else :data-to="item.to"
            :class="'nav-item w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium ' + (isActive(item.to) ? 'sidebar-item-active' : '')"
            @click="emit('navigate', item.to!)">
            <span class="nav-ico"><component :is="ICONS[item.icon]" :size="16" /></span>
            <span class="flex-1 text-left truncate">{{ item.label }}</span>
          </button>
        </template>
      </div>

      <div class="px-3 pt-4 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/70 font-heading">{{ t('nav.section.system') }}</div>
      <div class="space-y-0.5">
        <button
          v-for="item in NAV.system" :key="item.key" :data-to="item.to"
          :class="'nav-item w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium ' + (isActive(item.to) ? 'sidebar-item-active' : '')"
          @click="emit('navigate', item.to!)">
          <span class="nav-ico"><component :is="ICONS[item.icon]" :size="16" /></span>
          <span class="flex-1 text-left truncate">{{ item.label }}</span>
        </button>
      </div>
    </nav>

    <div class="mx-3 mb-3 rounded-xl border border-border/70 bg-card/60 backdrop-blur p-3">
      <div class="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span class="relative inline-flex h-1.5 w-1.5"><span class="absolute inset-0 rounded-full bg-emerald-500 live-dot" /></span>
        <span>{{ t('nav.systemStatus') }}</span>
      </div>
      <div class="mt-1.5 text-[10.5px] font-mono text-muted-foreground/70">v4.0.0 · build 1</div>
    </div>
  </aside>
</template>
