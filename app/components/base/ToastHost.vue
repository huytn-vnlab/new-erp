<script setup lang="ts">
import { Check, AlertCircle, Info } from 'lucide-vue-next'
const { toasts } = useToast()
const ICON = { success: Check, error: AlertCircle, info: Info }
const BG = { success: 'hsl(160 60% 40%)', error: 'hsl(0 70% 50%)', info: 'hsl(203 89% 45%)' }
</script>
<template>
  <div class="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
    <div v-for="t in toasts" :key="t.id"
         class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-white shadow-popover rise"
         :style="{ background: BG[t.type], animationDuration: '0.2s' }">
      <component :is="ICON[t.type]" :size="13" />
      {{ t.message }}
    </div>
  </div>
</template>
