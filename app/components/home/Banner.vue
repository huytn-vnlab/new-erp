<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar, LogIn, LogOut, Check, FileText, Timer, Clock, Users, Folder } from 'lucide-vue-next'

const checkinState = ref<'none' | 'in' | 'out'>('none')
const now = new Date()
const greet = computed(() => { const h = now.getHours(); return h < 12 ? 'Chào buổi sáng' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối' })
const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const QUICK = [
  { l: 'Tạo đơn nghỉ', i: FileText }, { l: 'Yêu cầu tăng ca', i: Timer },
  { l: 'Xem lịch chấm công', i: Clock }, { l: 'Hồ sơ nhân viên', i: Users }, { l: 'Tạo dự án', i: Folder },
]
function toggleCheckin() { checkinState.value = checkinState.value === 'none' ? 'in' : checkinState.value === 'in' ? 'out' : 'none' }
</script>

<template>
  <div class="relative overflow-hidden card-surface rise">
    <div class="absolute inset-y-0 right-0 w-1/2 pointer-events-none opacity-90"
         :style="{ background: 'linear-gradient(115deg, transparent 25%, hsl(var(--primary-h) var(--primary-s) 60% / 0.10) 60%, hsl(var(--primary-h) var(--primary-s) 50% / 0.18) 100%)' }" />
    <div class="absolute -right-12 -bottom-12 w-56 h-56 rounded-full pointer-events-none"
         :style="{ background: 'radial-gradient(circle, hsl(var(--primary-h) var(--primary-s) 60% / 0.22), transparent 65%)' }" />

    <div class="relative p-6 flex items-stretch justify-between gap-6 flex-wrap">
      <div class="min-w-0">
        <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ greet }},</p>
        <h1 class="font-display mt-1.5 leading-[1.05] text-foreground" style="font-size:36px;font-weight:500;letter-spacing:-0.025em">
          Nguyễn <span style="font-style:italic;font-weight:400;color:hsl(var(--primary-h) var(--primary-s) 47%)">Văn An</span>
        </h1>
        <div class="mt-3 flex items-center gap-3 text-[12.5px] text-muted-foreground">
          <span class="inline-flex items-center gap-1.5"><Calendar :size="13" />{{ dateStr }}</span>
          <span class="text-border">•</span>
          <span class="inline-flex items-center gap-1.5 font-mono"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot" />08:42</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden sm:block text-right">
          <p class="text-[12px] text-muted-foreground uppercase tracking-wider font-medium">Trạng thái hôm nay</p>
          <p v-if="checkinState === 'in'" class="text-[13px] text-foreground mt-1">Đã chấm công vào lúc <span class="font-semibold tabular-nums">08:42</span></p>
          <p v-else-if="checkinState === 'out'" class="text-[13px] text-foreground mt-1">Đã hoàn tất chấm công <span class="text-emerald-600 font-semibold">✓</span></p>
          <p v-else class="text-[13px] text-foreground mt-1">Bạn chưa chấm công vào</p>
        </div>
        <button v-if="checkinState === 'none'" class="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold text-white shadow-card-hover transition-all hover:scale-[1.02]"
                :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }" @click="toggleCheckin">
          <LogIn :size="15" />Chấm công vào
        </button>
        <button v-else-if="checkinState === 'in'" class="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold border border-border bg-card text-foreground hover:border-primary transition-colors" @click="toggleCheckin">
          <LogOut :size="15" />Chấm công ra
        </button>
        <button v-else class="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold border border-border bg-muted/50 text-muted-foreground cursor-default">
          <Check :size="15" />Đã hoàn tất
        </button>
      </div>
    </div>

    <div class="relative border-t border-border/70 px-6 py-3 flex items-center gap-1 flex-wrap text-[12.5px]">
      <span class="text-muted-foreground mr-2 font-medium">Truy cập nhanh:</span>
      <button v-for="(a, i) in QUICK" :key="i" class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-foreground/80 hover:bg-muted hover:text-primary transition-colors">
        <component :is="a.i" :size="13" />{{ a.l }}
      </button>
    </div>
  </div>
</template>
