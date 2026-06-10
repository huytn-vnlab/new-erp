<template>
  <button
    v-bind="$attrs"
    :type="type"
    :disabled="disabled || loading"
    :class="[baseClass, variantClass, sizeClass, (disabled || loading) && 'opacity-60 cursor-not-allowed']"
    @click="$emit('click', $event)"
  >
    <AppSpinner v-if="loading" size="sm" color="text-current" class="mr-2" />
    <slot />
  </button>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
})

defineEmits<{ click: [e: MouseEvent] }>()

const baseClass = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

const variantClass = computed(() => ({
  primary:   'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost:     'text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
  outline:   'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
}[props.variant]))

const sizeClass = computed(() => ({
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}[props.size]))
</script>
