<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Lock, Check } from 'lucide-vue-next'
import Modal from '~/components/base/Modal.vue'
import Button from '~/components/base/Button.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const api = useApi()

const cur = ref('')
const next = ref('')
const confirm = ref('')
const showCur = ref(false)
const showNext = ref(false)
const showConfirm = ref(false)
const done = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const RULES = [
  { k: 'len', label: 'Tối thiểu 8 ký tự', test: (v: string) => v.length >= 8 },
  { k: 'case', label: 'Có chữ hoa và chữ thường', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { k: 'num', label: 'Có ít nhất 1 chữ số', test: (v: string) => /[0-9]/.test(v) },
  { k: 'sym', label: 'Có ký tự đặc biệt', test: (v: string) => /[^A-Za-z0-9\s]/.test(v) },
]
const rules = computed(() => RULES.map(r => ({ ...r, ok: r.test(next.value) })))
const passed = computed(() => rules.value.filter(r => r.ok).length)
const STRENGTH_LABELS = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh']
const STRENGTH_COLORS = ['hsl(var(--border))', 'hsl(0 72% 55%)', 'hsl(35 90% 50%)', 'hsl(203 89% 48%)', 'hsl(160 60% 40%)']
const strength = computed(() => STRENGTH_LABELS[passed.value])
const strengthColor = computed(() => STRENGTH_COLORS[passed.value])
const mismatch = computed(() => confirm.value.length > 0 && confirm.value !== next.value)
const valid = computed(() => cur.value.length > 0 && passed.value === rules.value.length && !mismatch.value && confirm.value.length > 0)

function reset() {
  cur.value = ''
  next.value = ''
  confirm.value = ''
  showCur.value = false
  showNext.value = false
  showConfirm.value = false
  done.value = false
  loading.value = false
  errorMsg.value = ''
}

// Wipe form state once the close animation would be done, not immediately —
// an instant reset would flash the fields empty while the modal is still
// visibly closing.
watch(() => props.modelValue, open => { if (!open) reset() })

function close() { emit('update:modelValue', false) }

async function submit() {
  if (!valid.value || loading.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await api.post('/api/user/changepassword', {
      current_password: cur.value,
      new_password: next.value,
      repeat_new_password: confirm.value,
    })
    if (res.status === 1) done.value = true
    else errorMsg.value = res.message || 'Có lỗi xảy ra.'
  } catch {
    errorMsg.value = 'Có lỗi xảy ra.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Modal :open="modelValue" :max-width="480" @update:open="emit('update:modelValue', $event)">
    <template #header>
      <div class="flex items-center gap-3 min-w-0">
        <span class="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary shrink-0"><Lock :size="18" /></span>
        <div class="min-w-0">
          <h3 class="text-[17px] font-bold font-heading leading-tight">Đổi mật khẩu</h3>
          <p class="text-[12px] text-muted-foreground">Đổi mật khẩu đăng nhập của bạn</p>
        </div>
      </div>
    </template>

    <div v-if="done" class="p-8 text-center">
      <span class="mx-auto h-12 w-12 rounded-full flex items-center justify-center" style="background: hsl(160 60% 94%); color: hsl(160 60% 34%)"><Check :size="22" /></span>
      <p class="mt-3 text-[14px] font-semibold font-heading">Đã đổi mật khẩu thành công</p>
      <p class="mt-1 text-[12.5px] text-muted-foreground">Bạn sẽ cần đăng nhập lại trên các thiết bị khác.</p>
      <Button class="mt-5" @click="close">Đóng</Button>
    </div>

    <div v-else class="p-5 space-y-4">
      <p v-if="errorMsg" class="text-[12.5px] rounded-lg px-3 py-2" style="background: hsl(0 80% 96%); color: hsl(0 70% 45%)">{{ errorMsg }}</p>

        <label class="block">
          <span class="text-[12.5px] font-medium text-foreground">Mật khẩu hiện tại</span>
          <span class="mt-1.5 flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 focus-within:border-primary transition-colors">
            <input v-model="cur" :type="showCur ? 'text' : 'password'" placeholder="••••••••" class="flex-1 bg-transparent py-2 text-[13px] outline-none">
            <button type="button" class="text-[11px] text-muted-foreground hover:text-foreground px-1" @click="showCur = !showCur">{{ showCur ? 'Ẩn' : 'Hiện' }}</button>
          </span>
        </label>

        <div>
          <label class="block">
            <span class="text-[12.5px] font-medium text-foreground">Mật khẩu mới</span>
            <span class="mt-1.5 flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 focus-within:border-primary transition-colors">
              <input v-model="next" :type="showNext ? 'text' : 'password'" placeholder="••••••••" class="flex-1 bg-transparent py-2 text-[13px] outline-none">
              <button type="button" class="text-[11px] text-muted-foreground hover:text-foreground px-1" @click="showNext = !showNext">{{ showNext ? 'Ẩn' : 'Hiện' }}</button>
            </span>
          </label>
          <div v-if="next.length > 0" class="mt-2">
            <div class="flex items-center gap-2">
              <span class="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <span class="block h-full rounded-full transition-all" :style="{ width: (passed / 4 * 100) + '%', background: strengthColor }" />
              </span>
              <span class="text-[11.5px] font-medium" :style="{ color: strengthColor }">{{ strength }}</span>
            </div>
            <ul class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              <li v-for="r in rules" :key="r.k" :class="'flex items-center gap-1.5 text-[11.5px] ' + (r.ok ? 'text-foreground' : 'text-muted-foreground')">
                <span :class="'h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ' + (r.ok ? 'bg-emerald-500 text-white' : 'border border-border')">
                  <Check v-if="r.ok" :size="9" />
                </span>
                {{ r.label }}
              </li>
            </ul>
          </div>
        </div>

        <label class="block">
          <span class="text-[12.5px] font-medium text-foreground">Xác nhận mật khẩu mới</span>
          <span
            class="mt-1.5 flex items-center gap-1 rounded-lg border bg-background px-2.5 focus-within:border-primary transition-colors"
            :style="{ borderColor: mismatch ? 'hsl(0 72% 55%)' : 'hsl(var(--border))' }"
          >
            <input v-model="confirm" :type="showConfirm ? 'text' : 'password'" placeholder="••••••••" class="flex-1 bg-transparent py-2 text-[13px] outline-none">
            <button type="button" class="text-[11px] text-muted-foreground hover:text-foreground px-1" @click="showConfirm = !showConfirm">{{ showConfirm ? 'Ẩn' : 'Hiện' }}</button>
          </span>
          <span v-if="mismatch" class="block mt-1 text-[11.5px] text-red-600">Mật khẩu xác nhận chưa khớp.</span>
        </label>
    </div>

    <template v-if="!done" #footer>
      <Button variant="outline" size="sm" @click="close">Huỷ</Button>
      <Button size="sm" :disabled="!valid || loading" @click="submit">Cập nhật mật khẩu</Button>
    </template>
  </Modal>
</template>
