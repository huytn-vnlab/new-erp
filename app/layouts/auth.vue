<template>
  <div class="auth-root">
    <div class="hero-grid" />
    <div class="hero-orb hero-orb-1" />
    <div class="hero-orb hero-orb-2" />

    <header class="relative z-10">
      <div class="mx-auto max-w-[1160px] px-6 h-[66px] flex items-center justify-between">
        <NuxtLink to="/" class="shrink-0"><img :src="logoHeader" alt="Micro ERP" class="h-[30px] w-auto"></NuxtLink>
        <div class="flex items-center gap-1">
          <span class="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] text-white/70 px-3"><Globe :size="14" />VI</span>
          <a href="#" class="text-[13px] font-medium text-white/85 hover:bg-white/10 rounded-lg px-3 py-1.5 transition-colors">Hỗ trợ</a>
        </div>
      </div>
    </header>

    <main class="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
      <slot />
    </main>

    <footer class="relative z-10 px-6 py-4">
      <div class="mx-auto max-w-[1160px] flex items-center justify-between text-[11.5px] text-white/45">
        <span>© {{ currentYear }} GMO-Z.com VietNamLab JSC</span>
        <span class="flex items-center gap-4">
          <a href="#" class="text-inherit hover:text-white">Điều khoản</a>
          <a href="#" class="text-inherit hover:text-white">Bảo mật</a>
        </span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Globe } from 'lucide-vue-next'
import logoHeader from '~/assets/images/logoheader.png'

const currentYear = new Date().getFullYear()
</script>
