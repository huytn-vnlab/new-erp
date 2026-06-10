<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { Menu, Bell, Moon, Sun, ChevronDown, Check } from 'lucide-vue-next'
import Breadcrumb from './Breadcrumb.vue'

defineProps<{ crumbs: { label: string }[]; isDark: boolean; locale: string; unread: number }>()
const emit = defineEmits<{ toggleTheme: []; 'update:locale': [string]; toggleSidebar: [] }>()

const FLAGS: Record<string, string> = { vi: '/flags/vn.svg', en: '/flags/us.svg', ja: '/flags/jp.svg' }
const LOCALE_NAMES: Record<string, string> = { vi: 'Tiếng Việt', en: 'English', ja: '日本語' }
const NOTIS = [
  { t: 'Đơn nghỉ phép của Trần Thị Mai đang chờ duyệt', s: 'HR Admin', a: '5 phút', u: true },
  { t: 'Bạn được thêm vào dự án "Cổng thanh toán XYZ"', s: 'Hoàng Đức Thành', a: '1 giờ', u: true },
  { t: 'Báo cáo đánh giá Q1/2026 đã sẵn sàng', s: 'Evaluation Bot', a: '2 giờ', u: true },
  { t: 'Hợp đồng của Lê Quang Huy sắp hết hạn (15 ngày)', s: 'Contract Bot', a: 'Hôm qua', u: false },
  { t: 'Lương tháng 4 đã được phát', s: 'Finance', a: '3 ngày', u: false },
]

const root = ref<HTMLElement>()
const langOpen = ref(false), bellOpen = ref(false), userOpen = ref(false)
const closeAll = () => { langOpen.value = bellOpen.value = userOpen.value = false }
onClickOutside(root, closeAll)
</script>

<template>
  <header ref="root" class="h-14 shrink-0 px-5 flex items-center gap-3 border-b border-border/70 bg-background/80 backdrop-blur-md sticky top-0 z-20">
    <button class="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Đóng / mở sidebar" @click="emit('toggleSidebar')">
      <Menu :size="18" />
    </button>
    <Breadcrumb :crumbs="crumbs" />
    <div class="flex-1" />

    <!-- Language -->
    <div class="relative">
      <button
class="flex items-center gap-1.5 p-1.5 px-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              @click="closeAll(); langOpen = !langOpen">
        <img :src="FLAGS[locale]" alt="" class="h-4 w-5 rounded-[2px] object-cover" >
        <span class="text-[11px] font-semibold uppercase">{{ locale }}</span>
      </button>
      <div v-if="langOpen" class="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-popover shadow-popover py-1 z-50">
        <button
v-for="l in ['vi', 'en', 'ja']" :key="l"
                :class="'w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-muted transition-colors ' + (locale === l ? 'bg-muted/60 font-medium' : '')"
                @click="emit('update:locale', l); langOpen = false">
          <img :src="FLAGS[l]" alt="" class="h-4 w-5 rounded-[2px] object-cover" >
          <span class="flex-1 text-left">{{ LOCALE_NAMES[l] }}</span>
          <Check v-if="locale === l" :size="14" class="text-primary" />
        </button>
      </div>
    </div>

    <!-- Theme -->
    <button data-test="theme-toggle" class="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" @click="emit('toggleTheme')">
      <Sun v-if="isDark" :size="16" />
      <Moon v-else :size="16" />
    </button>

    <!-- Bell -->
    <div class="relative">
      <button class="relative p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" @click="closeAll(); bellOpen = !bellOpen">
        <Bell :size="16" />
        <span
v-if="unread > 0" class="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
              :style="{ background: 'linear-gradient(135deg, hsl(0 80% 60%), hsl(355 75% 50%))' }">{{ unread }}</span>
      </button>
      <div v-if="bellOpen" class="absolute right-0 top-full mt-1 w-[340px] rounded-lg border border-border bg-popover shadow-popover z-50 overflow-hidden">
        <div class="px-4 py-3 border-b border-border flex items-center justify-between">
          <h4 class="text-sm font-semibold text-foreground">Thông báo</h4>
          <button class="text-[11px] text-primary hover:underline">Đánh dấu đã đọc</button>
        </div>
        <ul class="max-h-[320px] overflow-y-auto scrollbar-thin divide-y divide-border">
          <li v-for="(n, i) in NOTIS" :key="i" class="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3">
            <span :class="'mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ' + (n.u ? 'bg-primary' : 'bg-muted-foreground/40')" />
            <div class="min-w-0 flex-1">
              <p class="text-[13px] text-foreground leading-snug">{{ n.t }}</p>
              <p class="text-[11px] text-muted-foreground mt-0.5">{{ n.s }} · {{ n.a }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="w-px h-5 bg-border" />

    <!-- User -->
    <div class="relative">
      <button class="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-muted transition-colors" @click="closeAll(); userOpen = !userOpen">
        <span
class="inline-flex items-center justify-center w-8 h-8 rounded-md text-[11.5px] font-semibold text-white"
              :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 40%))' }">NA</span>
        <span class="text-[13px] font-medium text-foreground hidden lg:inline">Nguyễn Văn An</span>
        <ChevronDown :size="14" class="text-muted-foreground/80 hidden lg:inline" />
      </button>
      <div v-if="userOpen" class="absolute right-0 top-full mt-1 w-60 rounded-lg border border-border bg-popover shadow-popover z-50 overflow-hidden">
        <div class="px-3 py-3 flex items-center gap-3 border-b border-border">
          <span
class="inline-flex items-center justify-center w-10 h-10 rounded-lg text-[13px] font-semibold text-white"
                :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 40%))' }">NA</span>
          <div class="min-w-0">
            <p class="text-[13px] font-semibold text-foreground truncate">Nguyễn Văn An</p>
            <p class="text-[11px] text-muted-foreground truncate">an.nguyen@vnlab.vn</p>
          </div>
        </div>
        <div class="py-1 text-[13px]">
          <button class="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-foreground/90">Hồ sơ cá nhân</button>
          <button class="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-foreground/90">Đổi mật khẩu</button>
          <div class="my-1 border-t border-border" />
          <button class="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition-colors">Đăng xuất</button>
        </div>
      </div>
    </div>
  </header>
</template>
