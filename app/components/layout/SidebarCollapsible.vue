<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
const props = defineProps<{ item: any; icon: any; activeChild?: string }>()
const emit = defineEmits<{ child: [string] }>()
const open = ref(!!props.activeChild)
watch(() => props.activeChild, v => { if (v) open.value = true })
</script>
<template>
  <div>
    <button class="nav-item w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium" @click="open = !open">
      <span class="nav-ico"><component :is="icon" :size="16" /></span>
      <span class="flex-1 text-left truncate">{{ item.label }}</span>
      <ChevronRight :size="14" :class="'transition-transform duration-200 ' + (open ? 'rotate-90' : '')" />
    </button>
    <div class="overflow-hidden transition-[max-height] duration-300" :style="{ maxHeight: open ? item.children.length * 40 + 'px' : '0px' }">
      <div class="mt-1 ml-3 pl-3 border-l border-border/70 space-y-0.5">
        <button v-for="c in item.children" :key="c.key" :data-to="c.to"
                :class="'nav-item is-sub w-full flex items-center gap-2.5 text-left rounded-md px-2.5 py-1.5 text-[12.5px] ' + (activeChild === c.key ? 'sidebar-item-active' : '')"
                @click="emit('child', c.to)">
          <span class="nav-dot" />
          <span class="flex-1 truncate">{{ c.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
