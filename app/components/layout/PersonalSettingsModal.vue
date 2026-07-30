<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import { Sliders, Sun, Moon, Users, Check } from 'lucide-vue-next'
import Modal from '~/components/base/Modal.vue'
import Button from '~/components/base/Button.vue'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean]; 'open-change-password': [] }>()

const { tweaks, setTweak } = useTweaks()
const { locale, setLocale } = useI18n()
const auth = useAuth()
const accents = useAppConfig().accents

const tab = ref<'appearance' | 'account'>('appearance')
const TABS: [ 'appearance' | 'account', string, Component][] = [
  ['appearance', 'Giao diện', Sun],
  ['account', 'Tài khoản', Users],
]

const THEME_OPTIONS: [ 'light' | 'dark', string, Component][] = [
  ['light', 'Sáng', Sun],
  ['dark', 'Tối', Moon],
]
const LOCALE_OPTIONS: [string, string][] = [
  ['vi', 'Tiếng Việt'],
  ['en', 'English'],
  ['ja', '日本語'],
]

const userName = computed(() => auth.user.value?.name ?? 'Người dùng')
const userEmail = computed(() => auth.user.value?.email ?? '')

function close() { emit('update:modelValue', false) }
</script>

<template>
  <Modal :open="modelValue" :max-width="720" @update:open="emit('update:modelValue', $event)">
    <template #header>
      <div class="flex items-center gap-3 min-w-0">
        <span class="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary shrink-0"><Sliders :size="18" /></span>
        <div class="min-w-0">
          <h3 class="text-[17px] font-bold font-heading leading-tight">Cài đặt cá nhân</h3>
          <p class="text-[12px] text-muted-foreground truncate">{{ userName }} · {{ userEmail }}</p>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-[190px_1fr] min-h-[360px]">
      <nav class="border-r border-border/70 p-2.5 flex flex-col gap-0.5">
        <button
          v-for="[k, label, Ic] in TABS" :key="k"
          :class="'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] text-left transition-colors ' + (tab === k ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60')"
          @click="tab = k"
        >
          <component :is="Ic" :size="15" />{{ label }}
        </button>
      </nav>

      <div class="p-5">
        <div v-if="tab === 'appearance'">
          <div class="flex items-start justify-between gap-6 py-3.5 border-b border-border/70">
            <div class="min-w-0">
              <p class="text-[13px] font-medium text-foreground">Chế độ hiển thị</p>
              <p class="text-[11.5px] text-muted-foreground mt-0.5">Áp dụng cho toàn bộ giao diện của bạn.</p>
            </div>
            <div class="shrink-0 inline-flex rounded-lg border border-border/70 p-0.5 bg-muted/40">
              <button
                v-for="[v, label, Ic] in THEME_OPTIONS" :key="v"
                :class="'px-3 py-1.5 rounded-md text-[12.5px] transition-colors flex items-center gap-1.5 ' + (tweaks.theme === v ? 'bg-background shadow-sm font-medium text-foreground' : 'text-muted-foreground hover:text-foreground')"
                @click="setTweak('theme', v)"
              >
                <component :is="Ic" :size="13" />{{ label }}
              </button>
            </div>
          </div>

          <div class="flex items-start justify-between gap-6 py-3.5 border-b border-border/70">
            <div class="min-w-0">
              <p class="text-[13px] font-medium text-foreground">Màu chủ đạo</p>
              <p class="text-[11.5px] text-muted-foreground mt-0.5">Màu nhấn cho nút, biểu đồ và trạng thái.</p>
            </div>
            <div class="shrink-0 flex items-center gap-1.5">
              <button
                v-for="(p, k) in accents" :key="k" :title="p.label"
                class="h-7 w-7 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105"
                :style="{
                  background: `linear-gradient(135deg, hsl(${p.h} ${p.s}% 65%), hsl(${p.h} ${p.s}% 42%))`,
                  boxShadow: tweaks.accent === k ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(${p.h} ${p.s}% 50%)` : 'none',
                }"
                @click="setTweak('accent', String(k))"
              >
                <Check v-if="tweaks.accent === k" :size="12" />
              </button>
            </div>
          </div>

          <div class="flex items-start justify-between gap-6 py-3.5 last:border-0">
            <div class="min-w-0">
              <p class="text-[13px] font-medium text-foreground">Ngôn ngữ</p>
              <p class="text-[11.5px] text-muted-foreground mt-0.5">Ngôn ngữ hiển thị của hệ thống.</p>
            </div>
            <div class="shrink-0 inline-flex rounded-lg border border-border/70 p-0.5 bg-muted/40">
              <button
                v-for="[v, label] in LOCALE_OPTIONS" :key="v"
                :class="'px-3 py-1.5 rounded-md text-[12.5px] transition-colors ' + (locale === v ? 'bg-background shadow-sm font-medium text-foreground' : 'text-muted-foreground hover:text-foreground')"
                @click="setLocale(v as any)"
              >{{ label }}</button>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="flex items-start justify-between gap-6 py-3.5 border-b border-border/70">
            <div class="min-w-0">
              <p class="text-[13px] font-medium text-foreground">Múi giờ</p>
              <p class="text-[11.5px] text-muted-foreground mt-0.5">Dùng cho chấm công và lịch nhắc nhở.</p>
            </div>
            <span class="shrink-0 text-[12.5px] text-muted-foreground">(GMT+7) Hồ Chí Minh</span>
          </div>
          <div class="flex items-start justify-between gap-6 py-3.5 last:border-0">
            <div class="min-w-0">
              <p class="text-[13px] font-medium text-foreground">Mật khẩu</p>
            </div>
            <Button variant="outline" size="sm" class="shrink-0" @click="$emit('open-change-password')">Đổi mật khẩu</Button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" size="sm" @click="close">Huỷ</Button>
      <Button size="sm" @click="close">Lưu thay đổi</Button>
    </template>
  </Modal>
</template>
