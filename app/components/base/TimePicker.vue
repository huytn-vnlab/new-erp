<script setup lang="ts">
import { computed } from 'vue'
import Select from '~/components/base/Select.vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  error?: boolean
}>(), { error: false })

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const { t } = useI18n()

const hourOpts = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, '0'),
  label: String(i).padStart(2, '0'),
}))

const minuteOpts = ['00', '15', '30', '45'].map(m => ({ value: m, label: m }))

const hh = computed(() => props.modelValue?.split(':')?.[0] ?? '')
const mm = computed(() => props.modelValue?.split(':')?.[1] ?? '00')

function setH(h: string | number) {
  emit('update:modelValue', `${String(h).padStart(2, '0')}:${mm.value}`)
}
function setM(m: string | number) {
  emit('update:modelValue', `${hh.value || '00'}:${String(m).padStart(2, '0')}`)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Select
      :model-value="hh"
      :options="hourOpts"
      :placeholder="t('common.hour')"
      :width="'1fr'"
      :class="error && !hh ? 'ring-1 ring-red-400 rounded-md' : ''"
      style="flex: 1"
      @update:model-value="setH"
    />
    <span class="text-muted-foreground text-[13px] font-mono font-bold">:</span>
    <Select
      :model-value="mm"
      :options="minuteOpts"
      :placeholder="t('common.minute')"
      width="80"
      @update:model-value="setM"
    />
  </div>
</template>
