<script setup lang="ts">
import { ref } from 'vue'
import { SlidersHorizontal, X, Check } from 'lucide-vue-next'
const { tweaks, setTweak } = useTweaks()
const accents = useAppConfig().accents
const open = ref(false)
</script>

<template>
  <div class="fixed right-4 bottom-4 z-[2147483646]">
    <button
v-if="!open" class="h-11 w-11 rounded-full text-white shadow-popover flex items-center justify-center"
            :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }"
            title="Tweaks" @click="open = true">
      <SlidersHorizontal :size="18" />
    </button>

    <div v-else class="w-[280px] rounded-2xl border border-border bg-popover/95 backdrop-blur shadow-popover overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-border">
        <b class="text-[13px] font-heading">Tweaks</b>
        <button class="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="open = false"><X :size="14" /></button>
      </div>
      <div class="p-4 space-y-4">
        <!-- Theme -->
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Chế độ</p>
          <div class="grid grid-cols-2 gap-1.5">
            <button
v-for="o in [{ v: 'light', l: 'Sáng' }, { v: 'dark', l: 'Tối' }]" :key="o.v"
                    :class="'h-8 rounded-lg text-[12.5px] font-medium border ' + (tweaks.theme === o.v ? 'border-primary text-primary bg-primary/10' : 'border-border text-foreground/80 hover:bg-muted')"
                    @click="setTweak('theme', o.v as any)">{{ o.l }}</button>
          </div>
        </div>
        <!-- Density -->
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Mật độ</p>
          <div class="grid grid-cols-2 gap-1.5">
            <button
v-for="o in [{ v: 'comfortable', l: 'Thoáng' }, { v: 'compact', l: 'Đặc' }]" :key="o.v"
                    :class="'h-8 rounded-lg text-[12.5px] font-medium border ' + (tweaks.density === o.v ? 'border-primary text-primary bg-primary/10' : 'border-border text-foreground/80 hover:bg-muted')"
                    @click="setTweak('density', o.v as any)">{{ o.l }}</button>
          </div>
        </div>
        <!-- Accent -->
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Màu chủ đạo</p>
          <div class="grid grid-cols-5 gap-1.5">
            <button
v-for="(p, k) in accents" :key="k" :title="p.label"
                    class="aspect-square rounded-lg flex items-center justify-center text-white"
                    :style="{ border: tweaks.accent === k ? '2px solid #fff' : '1px solid rgba(0,0,0,0.06)', boxShadow: tweaks.accent === k ? `0 0 0 2px hsl(${p.h} ${p.s}% 50%)` : 'none', background: `linear-gradient(135deg, hsl(${p.h} ${p.s}% 65%), hsl(${p.h} ${p.s}% 42%))` }"
                    @click="setTweak('accent', k as string)">
              <Check v-if="tweaks.accent === k" :size="12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
