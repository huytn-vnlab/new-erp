<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <div v-if="$slots.prefix" class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <slot name="prefix" />
      </div>
      <input
        :id="inputId"
        v-bind="$attrs"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'form-input',
          $slots.prefix  && 'pl-9',
          $slots.suffix  && 'pr-9',
          error          && 'border-red-400 focus:border-red-400 focus:ring-red-400',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
      />
      <div v-if="$slots.suffix" class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <slot name="suffix" />
      </div>
    </div>
    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-xs text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue?: string | number | null
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  id?: string
}>(), {
  type: 'text',
  disabled: false,
  required: false,
})

defineEmits<{
  'update:modelValue': [value: string]
  'blur': [e: FocusEvent]
}>()

const inputId = computed(() => props.id ?? `input-${Math.random().toString(36).slice(2, 8)}`)
</script>
