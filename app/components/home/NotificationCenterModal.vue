<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Bell } from 'lucide-vue-next'
import Modal from '~/components/base/Modal.vue'
import Button from '~/components/base/Button.vue'
import { useNotificationStore, type NotificationItem } from '~/stores/notification'
import { mapNotificationRoute } from '~/utils/notificationRoute'
import { categorizeNotification, NOTIF_CATEGORIES } from '~/utils/notificationCategory'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const { t } = useI18n()
const notiStore = useNotificationStore()
const { translateContent, timeSince, groupKey } = useNotification()

const tab = ref<'all' | 'unread' | string>('all')

watch(() => props.modelValue, open => {
  if (open) notiStore.fetchNotifications(1, 100)
})

function close() { emit('update:modelValue', false) }

async function openNotification(n: NotificationItem) {
  await notiStore.markOneRead(n.id)
  const route = mapNotificationRoute(n.redirect_url)
  close()
  if (route) await navigateTo(route)
}

const GROUP_ORDER = ['today', 'week', 'older'] as const
const GROUP_LABEL_KEY: Record<(typeof GROUP_ORDER)[number], string> = {
  today: 'notification.group.today',
  week: 'notification.group.week',
  older: 'notification.group.older',
}

const filtered = computed(() => notiStore.notifications.filter(n => {
  if (tab.value === 'all') return true
  if (tab.value === 'unread') return notiStore.isUnread(n)
  return categorizeNotification(n.redirect_url).key === tab.value
}))

const groups = computed(() => GROUP_ORDER
  .map(g => [g, filtered.value.filter(n => groupKey(n.created_at) === g)] as const)
  .filter(([, items]) => items.length > 0))

const tabs = computed(() => [
  { key: 'all', label: t('notification.tabAll') },
  { key: 'unread', label: notiStore.unreadCount > 0 ? t('notification.tabUnreadCount', { n: notiStore.unreadCount }) : t('notification.tabUnread') },
  ...NOTIF_CATEGORIES.map(c => ({ key: c.key, label: t(c.labelKey) })),
])
</script>

<template>
  <Modal :open="modelValue" :max-width="672" @update:open="emit('update:modelValue', $event)">
    <template #header>
      <div class="flex-1 flex items-center justify-between gap-3 min-w-0">
        <div class="flex items-center gap-3 min-w-0">
          <span class="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary shrink-0"><Bell :size="18" /></span>
          <div class="min-w-0">
            <h3 class="text-[17px] font-bold font-heading leading-tight">{{ t('notification.title') }}</h3>
            <p class="text-[12px] text-muted-foreground">{{ t('notification.subtitle', { unread: notiStore.unreadCount, total: notiStore.pagination.total_row }) }}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" class="shrink-0" @click="notiStore.markAllRead">{{ t('notification.markAll') }}</Button>
      </div>
    </template>

    <div class="px-5 py-2.5 border-b border-border/70 flex items-center gap-1.5 flex-wrap overflow-y-auto scrollbar-thin">
      <button
        v-for="tb in tabs" :key="tb.key"
        :class="'text-[12px] px-2.5 py-1 rounded-full border transition-colors ' + (tab === tb.key ? 'border-transparent bg-primary text-primary-foreground font-medium' : 'border-border/70 text-muted-foreground hover:bg-muted/50')"
        @click="tab = tb.key"
      >{{ tb.label }}</button>
    </div>

    <div class="overflow-y-auto scrollbar-thin" style="max-height: 55vh">
      <p v-if="groups.length === 0" class="p-8 text-center text-[12.5px] text-muted-foreground italic">{{ t('notification.empty') }}</p>
      <div v-for="[g, items] in groups" :key="g">
        <p class="px-5 py-1.5 text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted/40 sticky top-0">{{ t(GROUP_LABEL_KEY[g]) }}</p>
        <ul class="divide-y divide-border/70">
          <li
            v-for="n in items" :key="n.id"
            class="px-5 py-3 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
            @click="openNotification(n)"
          >
            <span
              class="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
              :style="{ background: categorizeNotification(n.redirect_url).bg, color: categorizeNotification(n.redirect_url).fg }"
            >
              <component :is="categorizeNotification(n.redirect_url).icon" :size="15" />
            </span>
            <div class="min-w-0 flex-1">
              <p :class="'text-[13px] leading-snug ' + (notiStore.isUnread(n) ? 'font-medium text-foreground' : 'text-muted-foreground')">{{ n.sender }} {{ translateContent(n.content) }}</p>
              <p class="text-[11px] text-muted-foreground mt-0.5">{{ t(categorizeNotification(n.redirect_url).labelKey) }} · {{ timeSince(n.created_at) }}</p>
            </div>
            <span v-if="notiStore.isUnread(n)" class="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          </li>
        </ul>
      </div>
    </div>
  </Modal>
</template>
