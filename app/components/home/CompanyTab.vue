<script setup lang="ts">
import { computed, ref } from 'vue'
import { Cake, Gift, Briefcase } from 'lucide-vue-next'
import SectionCard from './SectionCard.vue'
import BarRow from '~/components/charts/BarRow.vue'
import Sparkline from '~/components/charts/Sparkline.vue'
import { useDashboardStore } from '~/stores/dashboard'
import { useNotificationStore, type NotificationItem } from '~/stores/notification'
import { mapNotificationRoute } from '~/utils/notificationRoute'

const { t } = useI18n()
const { translateContent, timeSince } = useNotification()
const dashStore = useDashboardStore()
const notiStore = useNotificationStore()

async function openNotification(n: NotificationItem) {
  await notiStore.markOneRead(n.id)
  const route = mapNotificationRoute(n.redirect_url)
  if (route) await navigateTo(route)
}

const notifPageSize = ref(10)
function viewAllNotifications() {
  notifPageSize.value = 50
  notiStore.fetchNotifications(1, notifPageSize.value)
}

// ── Reminders ─────────────────────────────────────────────────────────────
const reminders = computed(() => {
  const r = dashStore.reminders
  const all: { type: string; text: string; sub: string; date: string; color: string }[] = []
  for (const b of r.birthdays)
    all.push({ type: 'birthday', text: t('home.company.birthday', { name: b.fullname }), sub: b.birthday, date: b.birthday, color: 'amber' })
  for (const a of r.anniversaries)
    all.push({ type: 'anniversary', text: t('home.company.anniversary', { name: a.fullname }), sub: a.company_joined_date, date: a.company_joined_date, color: 'sky' })
  for (const c of r.contracts)
    all.push({ type: 'contract', text: t('home.company.contract', { name: c.fullname }), sub: c.contract_expiration_date, date: c.contract_expiration_date, color: 'emerald' })
  return all
})

const hasReminders = computed(() => reminders.value.length > 0)

// ── Notifications ─────────────────────────────────────────────────────────
const notifs = computed(() => notiStore.notifications)
const unread = computed(() => notiStore.unreadCount)

// ── Job titles ─────────────────────────────────────────────────────────────
const MOCK_JOB_TITLES = [
  { label: 'Lập trình viên', value: 98 }, { label: 'Tester / QA', value: 32 },
  { label: 'BrSE', value: 28 }, { label: 'Designer', value: 18 },
  { label: 'PM / Trưởng nhóm', value: 14 }, { label: 'DevOps', value: 8 },
]
const jobTitles = computed(() => {
  const data = dashStore.stat?.number_people_job_title
  if (!data?.length) return MOCK_JOB_TITLES
  const merged = new Map<string, number>()
  for (const item of data) {
    const key = item.job_title.trim()
    merged.set(key, (merged.get(key) ?? 0) + item.amount)
  }
  return [...merged.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }))
})
const maxJob = computed(() => Math.max(...jobTitles.value.map(j => j.value), 1))

// ── JP levels ──────────────────────────────────────────────────────────────
const MOCK_JP = [
  { lv: 'N1', count: 12 }, { lv: 'N2', count: 38 }, { lv: 'N3', count: 65 },
  { lv: 'N4', count: 42 }, { lv: 'N5', count: 30 }, { lv: 'Chưa thi', count: 61 },
]
const jpLevels = computed(() => {
  const data = dashStore.stat?.number_people_japanese_level
  if (!data?.length) return MOCK_JP
  const merged = new Map<string, number>()
  for (const item of data) {
    const lv = item.certificate.replace(/^JLPT[-\s]?/i, '').trim()
    merged.set(lv, (merged.get(lv) ?? 0) + item.amount)
  }
  return [...merged.entries()].map(([lv, count]) => ({ lv, count }))
})
const maxJp = computed(() => Math.max(...jpLevels.value.map(j => j.count), 1))
const jpTotal = computed(() => jpLevels.value.reduce((s, j) => s + j.count, 0))

// ── Technology ─────────────────────────────────────────────────────────────
const MOCK_TECH = [
  { n: 'Vue.js', c: 64 }, { n: 'React', c: 58 }, { n: 'Node.js', c: 52 },
  { n: 'Python', c: 41 }, { n: 'TypeScript', c: 38 }, { n: 'Docker', c: 29 },
]
const tech = computed(() => {
  const data = dashStore.stat?.number_people_interest_technology
  if (!data?.length) return MOCK_TECH
  return [...data]
    .sort((a, b) => b.amount - a.amount)
    .map(t => ({ n: t.technology, c: t.amount }))
})

// ── Eval rank ──────────────────────────────────────────────────────────────
const RANK_ORDER = ['S', 'A', 'B', 'C', 'D', 'E']
const rankColors = ['#0ea5e9', '#22c55e', '#a3a3a3', '#eab308', '#f97316', '#ef4444']
const DEFAULT_QUARTERS = ['Q3/25', 'Q4/25', 'Q1/26', 'Q2/26']

const evalRankData = computed(() => {
  const er = dashStore.stat?.evaluation_rank
  if (!er) return null
  const quarters = er.datetime?.length ? er.datetime : DEFAULT_QUARTERS
  const datasetMap = new Map(er.datasets.map(d => [d.rank, d.data]))
  const rows = RANK_ORDER.map(r => ({
    rank: r,
    data: datasetMap.get(r) ?? Array(quarters.length).fill(0),
  }))
  return { quarters, rows }
})

const reminderIcon = (type: string) => type === 'birthday' ? Cake : type === 'anniversary' ? Gift : Briefcase
const reminderBg = (c: string) => c === 'amber' ? 'hsl(38 92% 95%)' : c === 'sky' ? 'hsl(203 89% 95%)' : 'hsl(160 60% 94%)'
const reminderFg = (c: string) => c === 'amber' ? 'hsl(35 90% 45%)' : c === 'sky' ? 'hsl(203 89% 45%)' : 'hsl(160 60% 38%)'
</script>

<template>
  <div class="space-y-6">
    <!-- Row 1: reminders + notifications -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SectionCard :delay="50" :title="t('home.company.reminders')">
        <template #action><button class="text-[12px] text-primary hover:underline" @click="navigateTo('/hrm/leave')">{{ t('home.company.viewCalendar') }}</button></template>
        <div v-if="hasReminders">
          <ul class="space-y-3">
            <li v-for="(r, i) in reminders" :key="i" class="flex items-center gap-3">
              <div class="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" :style="{ background: reminderBg(r.color), color: reminderFg(r.color) }">
                <component :is="reminderIcon(r.type)" :size="15" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[13px] text-foreground font-medium truncate">{{ r.text }}</p>
                <p class="text-[11.5px] text-muted-foreground">{{ r.sub }}</p>
              </div>
              <span class="text-[11.5px] font-mono font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{{ r.date }}</span>
            </li>
          </ul>
        </div>
        <div v-else class="text-center py-8 text-muted-foreground text-[13px]">{{ t('home.company.noReminders') }}</div>
      </SectionCard>

      <SectionCard :delay="100" :title="t('home.company.notifications')">
        <template #action>
          <div class="flex items-center gap-2">
            <span v-if="unread > 0" class="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
              <span class="h-1.5 w-1.5 rounded-full bg-primary live-dot" /> {{ t('home.company.newCount', { n: unread }) }}
            </span>
            <button class="text-[12px] text-primary hover:underline" @click="viewAllNotifications">{{ t('home.company.viewAll') }}</button>
          </div>
        </template>
        <div v-if="notifs.length > 0">
          <ul class="divide-y divide-border/70 -my-2" :class="notifPageSize > 10 ? 'max-h-[400px] overflow-y-auto scrollbar-thin' : ''">
            <li v-for="n in notifs" :key="n.id" class="py-2.5 flex items-start gap-3 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors" @click="openNotification(n)">
              <span :class="'mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ' + (n.status === 1 ? 'bg-primary' : 'bg-muted-foreground/30')" />
              <div class="min-w-0 flex-1">
                <p class="text-[13px] text-foreground leading-snug">{{ n.sender }} {{ translateContent(n.content) }}</p>
                <p class="text-[11px] text-muted-foreground mt-0.5">{{ timeSince(n.created_at) }}</p>
              </div>
              <span v-if="n.status === 1" class="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{{ t('home.company.newBadge') }}</span>
            </li>
          </ul>
        </div>
        <div v-else class="text-center py-8 text-muted-foreground text-[13px]">{{ t('home.company.noNotifications') }}</div>
      </SectionCard>
    </div>

    <!-- Row 2: job titles + Japanese level -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <SectionCard :delay="150" class="lg:col-span-3" :title="t('home.company.jobTitles')">
        <template #action>
          <span class="inline-flex items-center h-7 px-2.5 rounded-md border border-border bg-muted/30 text-[12px] text-muted-foreground">
            {{ t('home.company.allCompany') }}
          </span>
        </template>
        <div class="space-y-3">
          <BarRow v-for="(j, i) in jobTitles" :key="i" :label="j.label" :value="j.value" :max="maxJob" :accent="i === 0" />
        </div>
      </SectionCard>

      <SectionCard :delay="200" class="lg:col-span-2" :title="t('home.company.jpLevel')">
        <template #action><span class="text-[11px] font-mono text-muted-foreground">{{ t('home.company.jpTotal', { n: jpTotal }) }}</span></template>
        <div class="grid grid-cols-3 gap-2.5">
          <div
            v-for="(j, i) in jpLevels" :key="j.lv"
            :class="'rounded-xl border p-3 flex flex-col items-center justify-center gap-0.5 ' + (i < 2 ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/30')">
            <span :class="'text-[20px] font-bold font-heading tabular-nums ' + (i < 2 ? 'text-primary' : 'text-foreground')">{{ j.count }}</span>
            <span class="text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground">{{ j.lv }}</span>
            <div class="w-full h-0.5 rounded-full bg-muted/70 mt-1.5 overflow-hidden">
              <div class="h-full" :style="{ width: (j.count / maxJp * 100) + '%', background: i < 2 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.5)' }" />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- Row 3: tech chips + eval rank -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <SectionCard :delay="250" class="lg:col-span-2" :title="t('home.company.tech')">
        <template #action><span class="text-[11px] text-muted-foreground">{{ t('home.company.techTop', { n: tech.length }) }}</span></template>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="(item, i) in tech" :key="item.n"
            :class="'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-medium border transition-colors hover:border-primary/50 ' + (i === 0 ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-muted/40 text-foreground/85')">
            {{ item.n }}
            <span :class="'text-[10.5px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full ' + (i === 0 ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground')">{{ item.c }}</span>
          </button>
        </div>
      </SectionCard>

      <SectionCard :delay="300" class="lg:col-span-3" :title="t('home.company.evalRank')">
        <template #action><button class="text-[12px] text-primary hover:underline" @click="navigateTo('/evaluation')">{{ t('home.company.evalDetail') }}</button></template>
        <div v-if="evalRankData">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="text-muted-foreground">
                <th class="text-left font-semibold pb-2 pr-3">{{ t('home.company.rankCol') }}</th>
                <th v-for="q in evalRankData.quarters" :key="q" class="text-center font-semibold pb-2 px-1 text-[12px] font-mono">{{ q }}</th>
                <th class="pl-3 pb-2 text-left text-[11px] font-semibold">{{ t('home.company.trendCol') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in evalRankData.rows" :key="row.rank" class="border-t border-border/60">
                <td class="py-2 pr-3">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold text-white tabular-nums" :style="{ background: rankColors[i] }">{{ row.rank }}</span>
                </td>
                <td v-for="(v, j) in row.data" :key="j" class="text-center font-medium tabular-nums py-2 px-1">{{ v }}</td>
                <td class="pl-3 py-2" :style="{ color: rankColors[i] }">
                  <Sparkline :data="row.data" :width="56" :height="20" stroke="currentColor" :filled="false" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  </div>
</template>
