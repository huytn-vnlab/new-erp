<script setup lang="ts">
import { Mail, Phone, Building2, Calendar, FileText, ExternalLink, X, ChevronRight } from 'lucide-vue-next'
import Drawer from '~/components/base/Drawer.vue'
import Avatar from '~/components/base/Avatar.vue'
import Btn from '~/components/base/Button.vue'
import type { Member } from '~/mocks/members'

const props = defineProps<{ open: boolean; member: Member | null }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()
const RANK_BG: Record<string, string> = { S: '#0ea5e9', A: '#22c55e' }
const projects = ['Cổng thanh toán XYZ', 'Hệ thống CRM nội bộ', 'Module báo cáo BI']
const skills = ['Vue.js', 'TypeScript', 'Node.js', 'Tailwind', 'Figma', 'AWS']
</script>

<template>
  <Drawer :open="open" :title="member?.name" @update:open="emit('update:open', $event)">
    <template v-if="member">
      <div class="p-5 border-b border-border/70 flex items-start justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <Avatar :name="member.name" :size="48" />
          <div class="min-w-0">
            <h3 class="font-bold text-[16px] font-heading text-foreground truncate">{{ member.name }}</h3>
            <p class="text-[12px] text-muted-foreground truncate">{{ member.role }} · {{ member.branch }}</p>
          </div>
        </div>
        <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="emit('update:open', false)"><X :size="16" /></button>
      </div>
      <div class="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
        <div>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Thông tin liên hệ</p>
          <ul class="space-y-2 text-[13px]">
            <li class="flex items-center gap-2"><Mail :size="13" class="text-primary" /> {{ member.email }}</li>
            <li class="flex items-center gap-2"><Phone :size="13" class="text-primary" /> <span class="font-mono">{{ member.phone }}</span></li>
            <li class="flex items-center gap-2"><Building2 :size="13" class="text-primary" /> {{ member.branch }}</li>
            <li class="flex items-center gap-2"><Calendar :size="13" class="text-primary" /> Vào công ty <span class="font-mono">{{ member.join }}</span></li>
          </ul>
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Đánh giá</p>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-12 h-12 rounded-xl text-white text-[20px] font-bold font-heading" :style="{ background: RANK_BG[member.rank] ?? '#a3a3a3' }">{{ member.rank }}</span>
            <div class="flex-1">
              <p class="text-[13px] font-semibold">Kỳ hiện tại Q2/2026</p>
              <p class="text-[11.5px] text-muted-foreground">Tăng 1 hạng so với Q1</p>
            </div>
          </div>
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Dự án đang tham gia</p>
          <ul class="space-y-2">
            <li v-for="p in projects" :key="p" class="flex items-center justify-between text-[13px] p-2 -mx-2 rounded-md hover:bg-muted/40">
              <span>{{ p }}</span><ChevronRight :size="12" class="text-muted-foreground" />
            </li>
          </ul>
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Kỹ năng</p>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="s in skills" :key="s" class="px-2 py-0.5 rounded-full text-[11.5px] bg-muted text-foreground/80">{{ s }}</span>
          </div>
        </div>
      </div>
      <div class="p-4 border-t border-border/70 flex items-center gap-2">
        <Btn variant="outline" size="sm" class="flex-1"><ExternalLink :size="13" /> Xem hồ sơ đầy đủ</Btn>
        <Btn variant="primary" size="sm"><FileText :size="13" /> Chỉnh sửa</Btn>
      </div>
    </template>
  </Drawer>
</template>
