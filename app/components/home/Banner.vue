<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Calendar, LogIn, LogOut, Check, FileText, Timer, Clock, Users, Folder } from 'lucide-vue-next'
import { useTimekeepingStore } from '~/stores/timekeeping'

const { t, locale } = useI18n()
const auth = useAuth()
const tkStore = useTimekeepingStore()

const userName = computed(() => auth.user.value?.name ?? 'Người dùng')

const checkinState = computed<'none' | 'in' | 'out'>(() => {
  if (!tkStore.today) return 'none'
  if (tkStore.today.check_out_time) return 'out'
  if (tkStore.today.check_in_time) return 'in'
  return 'none'
})
const checkinTimeDisplay = computed(() => {
  if (!tkStore.today?.check_in_time) return ''
  const parts = tkStore.today.check_in_time.split(' ')
  return parts.slice(1).join(' ')
})

const localeMap: Record<string, string> = { vi: 'vi-VN', en: 'en-US', ja: 'ja-JP' }
const dateLocale = computed(() => localeMap[locale.value] ?? 'vi-VN')

const now = new Date()
const serverTime = computed(() => tkStore.today?.time_server?.split(' ')[1]?.slice(0, 5) ?? now.toLocaleTimeString(dateLocale.value, { hour: '2-digit', minute: '2-digit' }))
const greet = computed(() => {
  const h = now.getHours()
  return h < 12 ? t('home.banner.greetMorning') : h < 18 ? t('home.banner.greetAfternoon') : t('home.banner.greetEvening')
})
const dateStr = computed(() => now.toLocaleDateString(dateLocale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

const QUICK = computed(() => [
  { l: t('home.banner.quickLeave'), i: FileText, to: '/hrm/leave' },
  { l: t('home.banner.quickOvertime'), i: Timer, to: '/request/overtime' },
  { l: t('home.banner.quickTimekeeping'), i: Clock, to: '/hrm/timekeeping' },
  { l: t('home.banner.quickProfile'), i: Users, to: '/hrm/member/profile' },
  { l: t('home.banner.quickProject'), i: Folder, to: '/workflow/project' },
])

async function handleCheckIn() {
  await tkStore.checkIn()
  await tkStore.fetchToday()
}

async function handleCheckOut() {
  await tkStore.checkOut()
  await tkStore.fetchToday()
}

onMounted(() => { tkStore.fetchToday() })
</script>

<template>
  <div class="relative overflow-hidden card-surface rise">
    <div
      class="absolute inset-y-0 right-0 w-1/2 pointer-events-none opacity-90"
      :style="{ background: 'linear-gradient(115deg, transparent 25%, hsl(var(--primary-h) var(--primary-s) 60% / 0.10) 60%, hsl(var(--primary-h) var(--primary-s) 50% / 0.18) 100%)' }"
    />
    <div
      class="absolute -right-12 -bottom-12 w-56 h-56 rounded-full pointer-events-none"
      :style="{ background: 'radial-gradient(circle, hsl(var(--primary-h) var(--primary-s) 60% / 0.22), transparent 65%)' }"
    />

    <div class="relative p-6 flex items-stretch justify-between gap-6 flex-wrap">
      <div class="min-w-0">
        <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ greet }},</p>
        <h1 class="font-display mt-1.5 leading-[1.05]" style="font-size:36px;font-weight:500;letter-spacing:-0.025em;color:hsl(var(--primary-h) var(--primary-s) 47%)">
          {{ userName }}
        </h1>
        <div class="mt-3 flex items-center gap-3 text-[12.5px] text-muted-foreground">
          <span class="inline-flex items-center gap-1.5"><Calendar :size="13" />{{ dateStr }}</span>
          <span class="text-border">•</span>
          <span class="inline-flex items-center gap-1.5 font-mono"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot" />{{ serverTime }}</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden sm:block text-right">
          <p class="text-[12px] text-muted-foreground uppercase tracking-wider font-medium">{{ t('home.banner.statusTitle') }}</p>
          <p v-if="checkinState === 'in'" class="text-[13px] text-foreground mt-1">{{ t('home.banner.checkedIn', { time: checkinTimeDisplay }) }}</p>
          <p v-else-if="checkinState === 'out'" class="text-[13px] text-foreground mt-1">{{ t('home.banner.checkedOut') }}</p>
          <p v-else class="text-[13px] text-foreground mt-1">{{ t('home.banner.notCheckedIn') }}</p>
        </div>
        <button
          v-if="checkinState === 'none'"
          class="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold text-white shadow-card-hover transition-all hover:scale-[1.02]"
          :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }"
          @click="handleCheckIn"
        >
          <LogIn :size="15" />{{ t('home.banner.checkIn') }}
        </button>
        <button v-else-if="checkinState === 'in'" class="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold border border-border bg-card text-foreground hover:border-primary transition-colors" @click="handleCheckOut">
          <LogOut :size="15" />{{ t('home.banner.checkOut') }}
        </button>
        <button v-else class="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold border border-border bg-muted/50 text-muted-foreground cursor-default">
          <Check :size="15" />{{ t('home.banner.done') }}
        </button>
      </div>
    </div>

    <div class="relative border-t border-border/70 px-6 py-3 flex items-center gap-1 flex-wrap text-[12.5px]">
      <span class="text-muted-foreground mr-2 font-medium">{{ t('home.banner.quickAccess') }}</span>
      <button v-for="(a, i) in QUICK" :key="i" class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-foreground/80 hover:bg-muted hover:text-primary transition-colors" @click="navigateTo(a.to)">
        <component :is="a.i" :size="13" />{{ a.l }}
      </button>
    </div>
  </div>
</template>
