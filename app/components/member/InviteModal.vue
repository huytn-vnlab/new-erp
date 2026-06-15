<script setup lang="ts">
import { ref } from 'vue'
import { DialogTitle } from 'reka-ui'
import { UserPlus, Mail, X } from 'lucide-vue-next'
import Modal from '~/components/base/Modal.vue'
import Btn from '~/components/base/Button.vue'
import { isValidEmail } from '~/utils/email'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean]; sent: [{ email: string; sent: string; by: string; status: 'pending' }] }>()

const emails = ref<string[]>([])
const input = ref('')
const error = ref('')
const sending = ref(false)

function addEmail(val: string) {
  const v = val.trim()
  if (!v) return
  if (!isValidEmail(v)) { error.value = 'Email không hợp lệ: ' + v; return }
  if (emails.value.includes(v)) { error.value = 'Email đã được thêm'; return }
  emails.value = [...emails.value, v]; input.value = ''; error.value = ''
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEmail(input.value) }
  else if (e.key === 'Backspace' && !input.value && emails.value.length) emails.value = emails.value.slice(0, -1)
}
function removeEmail(em: string) { emails.value = emails.value.filter(x => x !== em) }
function close() { emails.value = []; input.value = ''; error.value = ''; emit('update:open', false) }
function send() {
  const pending = input.value.trim()
  const all = pending && isValidEmail(pending) ? [...emails.value, pending] : emails.value
  if (all.length === 0) { error.value = 'Nhập ít nhất một địa chỉ email'; return }
  if (pending && !isValidEmail(pending)) { error.value = 'Email không hợp lệ: ' + pending; return }
  sending.value = true
  setTimeout(() => {
    all.forEach(em => emit('sent', { email: em, sent: new Date().toLocaleDateString('vi-VN'), by: 'Hoàng Đức Thành', status: 'pending' }))
    sending.value = false; close()
  }, 600)
}
</script>

<template>
  <Modal :open="open" :max-width="480" @update:open="(v) => !v && close()">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center" :style="{ background: 'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 65%),hsl(var(--primary-h) var(--primary-s) 45%))' }">
          <UserPlus :size="14" class="text-white" />
        </div>
        <div>
          <DialogTitle class="font-heading font-bold text-[15px] text-foreground">Mời thành viên</DialogTitle>
          <p class="text-[11.5px] text-muted-foreground mt-0.5">Nhấn Enter để thêm nhiều email</p>
        </div>
      </div>
    </template>

    <div class="p-6">
      <div
        :class="'min-h-[80px] flex flex-wrap gap-1.5 p-3 rounded-xl border cursor-text transition-colors ' + (error ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-border bg-card focus-within:border-primary/60')"
      >
        <span v-for="em in emails" :key="em" class="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-[12.5px] font-medium" :style="{ background: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.1)', color: 'hsl(var(--primary))' }">
          <Mail :size="11" />{{ em }}
          <button class="h-4 w-4 rounded flex items-center justify-center hover:bg-primary/20 transition-colors ml-0.5" @click="removeEmail(em)"><X :size="9" /></button>
        </span>
        <input
          type="email" :value="input" :placeholder="emails.length === 0 ? 'ten@congty.com, nhấn Enter để thêm tiếp…' : ''"
          class="flex-1 min-w-[180px] bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/50 py-0.5"
          @input="input = ($event.target as HTMLInputElement).value; error = ''"
          @keydown="onKeydown"
          @blur="input.trim() && addEmail(input)"
        >
      </div>
      <p v-if="error" class="text-[11.5px] text-red-400 mt-1.5">{{ error }}</p>
      <p v-else class="text-[11.5px] text-muted-foreground mt-2">
        <template v-if="emails.length > 0"><span class="font-semibold text-foreground">{{ emails.length }}</span> email · Link có hiệu lực <strong>7 ngày</strong></template>
        <template v-else>Nhập email rồi nhấn Enter. Có thể mời nhiều người cùng lúc.</template>
      </p>
    </div>

    <template #footer>
      <Btn variant="outline" size="sm" @click="close">Huỷ</Btn>
      <Btn variant="primary" size="sm" @click="send">
        <span v-if="sending" class="flex items-center gap-2"><span class="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Đang gửi…</span>
        <span v-else>{{ emails.length > 1 ? `Gửi ${emails.length} lời mời` : 'Gửi lời mời' }}</span>
      </Btn>
    </template>
  </Modal>
</template>
