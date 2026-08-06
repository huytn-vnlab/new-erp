<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { ArrowLeft, Shield, Users, Clock } from 'lucide-vue-next'
import AuthSteps from './AuthSteps.vue'

withDefaults(defineProps<{
  eyebrow?: string
  title: string
  sub?: string
  step?: number
  wide?: boolean
  backLabel?: string
  backTo?: RouteLocationRaw
}>(), {
  wide: false,
})

const TRUST = [
  { icon: Shield, t: 'Dữ liệu lưu tại Việt Nam' },
  { icon: Users, t: '240+ tổ chức đang dùng' },
  { icon: Clock, t: 'Triển khai trong 1 ngày' },
]
</script>

<template>
  <div class="w-full" :class="wide ? 'max-w-[560px]' : 'max-w-[452px]'">
    <NuxtLink
      v-if="backLabel && backTo"
      :to="backTo"
      class="mb-3.5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/70 hover:text-white transition-colors"
    >
      <ArrowLeft :size="14" />{{ backLabel }}
    </NuxtLink>

    <div class="auth-stagger auth-card">
      <div v-if="typeof step === 'number'" class="mb-6"><AuthSteps :current="step" /></div>
      <div>
        <p v-if="eyebrow" class="section-eyebrow">{{ eyebrow }}</p>
        <h1 class="mt-3 font-heading text-[26px] leading-[1.2] font-extrabold tracking-[-0.02em] text-ink">{{ title }}</h1>
        <p v-if="sub" class="mt-2 text-[13.5px] leading-relaxed text-slate-600">{{ sub }}</p>
      </div>
      <div class="mt-6"><slot /></div>
      <div v-if="$slots.footer" class="mt-6 border-t border-border pt-5 text-[13px] text-slate-500"><slot name="footer" /></div>
    </div>

    <ul class="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      <li v-for="t in TRUST" :key="t.t" class="inline-flex items-center gap-1.5 text-[11.5px] text-white/65">
        <span class="text-[#64dfdf]"><component :is="t.icon" :size="13" /></span>{{ t.t }}
      </li>
    </ul>
  </div>
</template>
