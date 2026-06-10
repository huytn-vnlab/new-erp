<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="relative p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <Bell class="h-5 w-5" />
        <span
          v-if="count > 0"
          class="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
        >
          {{ count > 99 ? '99+' : count }}
        </span>
      </button>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        align="end"
        :side-offset="8"
        class="w-80 rounded-xl border border-border bg-popover shadow-lg outline-none z-50 overflow-hidden
               data-[state=open]:animate-in data-[state=closed]:animate-out
               data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
               data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-border">
          <span class="text-sm font-semibold">Thông báo</span>
          <button
            v-if="notifications.length > 0"
            class="text-xs text-primary hover:underline"
            @click="markAll"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <!-- List -->
        <div class="max-h-72 overflow-y-auto divide-y divide-border">
          <div v-if="loadingList" class="flex justify-center py-6">
            <AppSpinner />
          </div>
          <div
            v-else-if="notifications.length === 0"
            class="text-center text-sm text-muted-foreground py-8"
          >
            Không có thông báo mới
          </div>
          <button
            v-else
            v-for="n in notifications"
            :key="n.id"
            type="button"
            class="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
            :class="n.status !== 1 ? 'opacity-60' : ''"
            @click="read(n)"
          >
            <p class="text-sm leading-snug line-clamp-2">{{ n.content }}</p>
            <p v-if="n.sender" class="text-xs text-muted-foreground mt-0.5">{{ n.sender }}</p>
            <p class="text-[11px] text-muted-foreground mt-1">{{ fromNow(n.created_at) }}</p>
          </button>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<script setup lang="ts">
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'reka-ui'
import { Bell } from 'lucide-vue-next'
import { fromNow } from '~/utils/date'
import AppSpinner from '~/components/ui/AppSpinner.vue'

const { fetchNotifications, fetchUnreadCount, markAsRead, markAllRead, notificationCount } = useNotification()

const open          = ref(false)
const loadingList   = ref(false)
const notifications = ref<any[]>([])
const count         = notificationCount

watch(open, async (val) => {
  if (val && notifications.value.length === 0) {
    loadingList.value = true
    notifications.value = await fetchNotifications()
    loadingList.value = false
  }
})

async function read(n: any) {
  if (n.status === 1) {
    n.status = 2
    await markAsRead(n.id)
  }
}

async function markAll() {
  await markAllRead()
  notifications.value.forEach(n => (n.status = 2))
}

onMounted(() => fetchUnreadCount())
</script>
