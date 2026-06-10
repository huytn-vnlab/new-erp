<script setup lang="ts">
import { SelectRoot, type SelectRootProps, type SelectRootEmits } from 'reka-ui'
import { useForwardPropsEmits } from 'reka-ui'

const props = defineProps<SelectRootProps>()
const emits = defineEmits<SelectRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <SelectRoot v-bind="forwarded">
    <slot />
  </SelectRoot>
</template>
