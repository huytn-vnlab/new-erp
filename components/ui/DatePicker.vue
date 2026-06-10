<template>
  <div class="w-full">
    <label v-if="label" class="form-label">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <PopoverRoot v-model:open="open">
      <PopoverTrigger as-child>
        <button
          type="button"
          :disabled="disabled"
          class="form-input flex items-center justify-between w-full h-10 text-left"
          :class="error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''"
        >
          <span :class="!modelValue ? 'text-muted-foreground' : ''">
            {{ modelValue ? formatDisplay(modelValue) : 'DD/MM/YYYY' }}
          </span>
          <CalendarIcon class="h-4 w-4 text-gray-400 shrink-0 ml-2" />
        </button>
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent
          :side-offset="4"
          class="z-50 rounded-md border border-border bg-white shadow-md outline-none"
        >
          <CalendarRoot
            :model-value="calendarValue"
            locale="vi"
            :week-starts-on="1"
            @update:model-value="onSelect"
          >
            <template #default="{ weekDays, grid }">
              <div class="p-3">
                <CalendarHeader class="flex items-center justify-between mb-3">
                  <CalendarPrev class="p-1.5 rounded hover:bg-muted transition-colors">
                    <ChevronLeft class="h-4 w-4" />
                  </CalendarPrev>
                  <CalendarHeading class="text-sm font-semibold" />
                  <CalendarNext class="p-1.5 rounded hover:bg-muted transition-colors">
                    <ChevronRight class="h-4 w-4" />
                  </CalendarNext>
                </CalendarHeader>

                <CalendarGrid v-for="month in grid" :key="month.value.toString()">
                  <CalendarGridHead>
                    <CalendarGridRow class="grid grid-cols-7 mb-1">
                      <CalendarHeadCell
                        v-for="day in weekDays"
                        :key="day"
                        class="text-xs text-muted-foreground text-center py-1 w-9"
                      >
                        {{ day }}
                      </CalendarHeadCell>
                    </CalendarGridRow>
                  </CalendarGridHead>
                  <CalendarGridBody>
                    <CalendarGridRow
                      v-for="(week, i) in month.rows"
                      :key="i"
                      class="grid grid-cols-7"
                    >
                      <CalendarCell
                        v-for="date in week"
                        :key="date.toString()"
                        :date="date"
                      >
                        <CalendarCellTrigger
                          :day="date"
                          :month="month.value"
                          class="h-9 w-9 mx-auto rounded-full text-sm flex items-center justify-center
                                 hover:bg-muted transition-colors
                                 data-[selected]:bg-primary data-[selected]:text-white
                                 data-[today]:font-semibold data-[today]:border data-[today]:border-primary
                                 data-[outside-visible-months]:opacity-30
                                 data-[disabled]:opacity-30 data-[disabled]:cursor-not-allowed"
                        />
                      </CalendarCell>
                    </CalendarGridRow>
                  </CalendarGridBody>
                </CalendarGrid>
              </div>
            </template>
          </CalendarRoot>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>

    <p v-if="error" class="form-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { parseDate, type DateValue } from '@internationalized/date'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
  CalendarRoot,
  CalendarHeader,
  CalendarPrev,
  CalendarHeading,
  CalendarNext,
  CalendarGrid,
  CalendarGridHead,
  CalendarGridRow,
  CalendarGridBody,
  CalendarHeadCell,
  CalendarCell,
  CalendarCellTrigger,
} from 'reka-ui'

const props = defineProps<{
  modelValue?: string | null
  label?: string
  error?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)

const calendarValue = computed<DateValue | undefined>(() => {
  if (!props.modelValue) return undefined
  try { return parseDate(props.modelValue) } catch { return undefined }
})

function formatDisplay(dateStr: string): string {
  try {
    const d = parseDate(dateStr)
    return `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}`
  } catch {
    return dateStr
  }
}

function onSelect(val: DateValue | undefined) {
  if (!val) return
  emit('update:modelValue', val.toString())
  open.value = false
}
</script>
