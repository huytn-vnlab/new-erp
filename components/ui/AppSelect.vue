<template>
  <div class="w-full">
    <label v-if="label" :for="selectId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <select
      :id="selectId"
      v-bind="$attrs"
      :value="modelValue"
      :disabled="disabled"
      :class="['form-input', error && 'border-red-400 focus:border-red-400 focus:ring-red-400']"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled :selected="!modelValue">{{ placeholder }}</option>
      <option
        v-for="opt in options"
        :key="String(opt[valueKey])"
        :value="opt[valueKey]"
      >{{ opt[labelKey] }}</option>
    </select>
    <p v-if="error" class="form-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue?: string | number | null
  options: Record<string, any>[]
  valueKey?: string
  labelKey?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  id?: string
}>(), {
  valueKey: 'value',
  labelKey: 'label',
  disabled: false,
  required: false,
})

defineEmits<{ 'update:modelValue': [value: string] }>()

const selectId = computed(() => props.id ?? `select-${Math.random().toString(36).slice(2, 8)}`)
</script>
