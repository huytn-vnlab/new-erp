<template>
  <div class="relative inline-block text-left" ref="containerRef">
    <!-- Trigger -->
    <div @click="toggle">
      <slot name="trigger">
        <AppButton size="sm" variant="secondary">
          {{ label }}
          <svg class="ml-1 h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </AppButton>
      </slot>
    </div>

    <!-- Dropdown panel -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute z-50 mt-1 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        :class="[widthClass, alignClass]"
      >
        <div class="py-1">
          <slot :close="close">
            <template v-for="item in items" :key="item.value ?? item.label">
              <hr v-if="item.divider" class="my-1 border-gray-100" />
              <button
                v-else
                type="button"
                class="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors"
                :class="item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50'"
                :disabled="item.disabled"
                @click="select(item)"
              >
                <span v-if="item.icon" v-html="item.icon" class="h-4 w-4 shrink-0" />
                {{ item.label }}
              </button>
            </template>
          </slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
export interface DropdownItem {
  label:    string
  value?:   string | number
  icon?:    string
  danger?:  boolean
  disabled?: boolean
  divider?: boolean
}

const props = withDefaults(defineProps<{
  label?:      string
  items?:      DropdownItem[]
  align?:      'left' | 'right'
  width?:      'sm' | 'md' | 'lg'
}>(), {
  label:  'Menu',
  items:  () => [],
  align:  'left',
  width:  'md',
})

const emit = defineEmits<{
  select: [item: DropdownItem]
}>()

const open         = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const alignClass = computed(() => props.align === 'right' ? 'right-0' : 'left-0')
const widthClass = computed(() => ({ sm: 'w-36', md: 'w-48', lg: 'w-64' }[props.width]))

function toggle() { open.value = !open.value }
function close()  { open.value = false }

function select(item: DropdownItem) {
  if (item.disabled || item.divider) return
  emit('select', item)
  close()
}

// Close on outside click
function onOutsideClick(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => document.addEventListener('click', onOutsideClick, true))
onBeforeUnmount(() => document.removeEventListener('click', onOutsideClick, true))
</script>
