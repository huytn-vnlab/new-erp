# DatePicker — Replace All `type="date"` Inputs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all `type="date"` native inputs across the codebase with a reusable `DatePicker` Vue component built on reka-ui primitives.

**Architecture:** Create `components/ui/DatePicker.vue` using reka-ui's `DatePickerRoot` + calendar primitives. The component accepts/emits YYYY-MM-DD strings (identical format to `<input type="date">`) so no composable or store changes are needed. For vee-validate `<Field>` usages, change slot destructuring from `{ field }` to `{ componentField }` since custom components need `modelValue`/`onUpdate:modelValue` bindings.

**Tech Stack:** reka-ui v2.9.7 (already installed), `@internationalized/date` (new dep), lucide-vue-next, vee-validate 4

---

## File Map

| Action | File |
|--------|------|
| **Create** | `components/ui/DatePicker.vue` |
| **Modify** | `pages/hrm/leave/history-user-leave.vue` |
| **Modify** | `pages/hrm/leave/create-leave-request.vue` |
| **Modify** | `pages/hrm/leave/leave-for-someone/[id].vue` |
| **Modify** | `pages/hrm/member/view-profile/[id].vue` |
| **Modify** | `pages/hrm/member/edit-profile/[id].vue` |
| **Modify** | `pages/hrm/contract/manage-contract.vue` |
| **Modify** | `pages/hrm/contract/add-contract.vue` |
| **Modify** | `pages/hrm/asset/create-asset.vue` |
| **Modify** | `pages/hrm/asset/edit-asset/[id].vue` |
| **Modify** | `pages/hrm/asset/asset-list.vue` |
| **Modify** | `pages/workflow/create-project.vue` |
| **Modify** | `pages/workflow/edit-project/[id].vue` |
| **Modify** | `pages/workflow/boards.vue` |
| **Modify** | `pages/workflow/project-board/[id].vue` |
| **Modify** | `pages/recruitment/create-recruitment.vue` |
| **Modify** | `pages/recruitment/edit-recruitment/[id].vue` |
| **Modify** | `pages/settings/holidays/index.vue` |

---

### Task 1: Install `@internationalized/date`

- [ ] **Step 1: Install dependency**

```bash
cd micro-erp-spa-v3
npm install @internationalized/date
```

Expected output: package added to `node_modules` and `package.json`.

---

### Task 2: Create `components/ui/DatePicker.vue`

**Files:**
- Create: `micro-erp-spa-v3/components/ui/DatePicker.vue`

- [ ] **Step 1: Create the component**

```vue
<template>
  <div class="w-full">
    <label v-if="label" class="form-label">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <DatePickerRoot
      :model-value="calendarValue"
      :disabled="disabled"
      @update:model-value="onSelect"
    >
      <DatePickerField
        class="form-input flex items-center h-10 gap-0.5"
        :class="error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''"
      >
        <DatePickerInput part="month" class="tabular-nums focus:outline-none focus:bg-primary/10 rounded px-0.5 w-6 text-center" />
        <span aria-hidden class="text-gray-400">/</span>
        <DatePickerInput part="day" class="tabular-nums focus:outline-none focus:bg-primary/10 rounded px-0.5 w-6 text-center" />
        <span aria-hidden class="text-gray-400">/</span>
        <DatePickerInput part="year" class="tabular-nums focus:outline-none focus:bg-primary/10 rounded px-0.5 w-12 text-center" />
        <div class="ml-auto">
          <DatePickerTrigger class="p-1 hover:bg-muted rounded transition-colors">
            <CalendarIcon class="h-4 w-4 text-gray-400" />
          </DatePickerTrigger>
        </div>
      </DatePickerField>

      <DatePickerContent
        :side-offset="4"
        class="z-50 rounded-md border border-border bg-white p-3 shadow-md outline-none"
      >
        <DatePickerCalendar v-slot="{ weekDays, grid }">
          <DatePickerHeader class="flex items-center justify-between mb-3">
            <DatePickerPrev class="p-1.5 rounded hover:bg-muted transition-colors">
              <ChevronLeft class="h-4 w-4" />
            </DatePickerPrev>
            <DatePickerHeading class="text-sm font-semibold" />
            <DatePickerNext class="p-1.5 rounded hover:bg-muted transition-colors">
              <ChevronRight class="h-4 w-4" />
            </DatePickerNext>
          </DatePickerHeader>

          <DatePickerGrid v-for="month in grid" :key="month.value.month">
            <DatePickerGridHead>
              <DatePickerGridRow class="grid grid-cols-7 mb-1">
                <DatePickerHeadCell
                  v-for="day in weekDays"
                  :key="day"
                  class="text-xs text-muted-foreground text-center py-1 w-9"
                >
                  {{ day }}
                </DatePickerHeadCell>
              </DatePickerGridRow>
            </DatePickerGridHead>
            <DatePickerGridBody>
              <DatePickerGridRow
                v-for="(week, i) in month.rows"
                :key="i"
                class="grid grid-cols-7"
              >
                <DatePickerCell
                  v-for="day in week"
                  :key="day.date.toString()"
                  :value="day.date"
                >
                  <DatePickerCellTrigger
                    :day="day"
                    :month="month.value"
                    class="h-9 w-9 mx-auto rounded-full text-sm flex items-center justify-center
                           hover:bg-muted transition-colors
                           data-[selected]:bg-primary data-[selected]:text-white
                           data-[today]:font-semibold data-[today]:border data-[today]:border-primary
                           data-[outside-visible-months]:opacity-30
                           data-[disabled]:opacity-30 data-[disabled]:cursor-not-allowed"
                  />
                </DatePickerCell>
              </DatePickerGridRow>
            </DatePickerGridBody>
          </DatePickerGrid>
        </DatePickerCalendar>
      </DatePickerContent>
    </DatePickerRoot>

    <p v-if="error" class="form-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { parseDate, type DateValue } from '@internationalized/date'
import {
  DatePickerRoot,
  DatePickerField,
  DatePickerInput,
  DatePickerTrigger,
  DatePickerContent,
  DatePickerCalendar,
  DatePickerHeader,
  DatePickerPrev,
  DatePickerHeading,
  DatePickerNext,
  DatePickerGrid,
  DatePickerGridHead,
  DatePickerGridRow,
  DatePickerGridBody,
  DatePickerHeadCell,
  DatePickerCell,
  DatePickerCellTrigger,
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

const calendarValue = computed<DateValue | undefined>(() => {
  if (!props.modelValue) return undefined
  try { return parseDate(props.modelValue) } catch { return undefined }
})

function onSelect(val: DateValue | undefined) {
  emit('update:modelValue', val?.toString() ?? '')
}
</script>
```

---

### Task 3: `history-user-leave.vue` — 2 simple `<Input v-model type="date">`

**Files:**
- Modify: `micro-erp-spa-v3/pages/hrm/leave/history-user-leave.vue`

- [ ] **Step 1: Add DatePicker import at the top of the script section**

Add this line to the imports in `<script setup>`:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace the two date inputs in the template**

Find and replace:
```html
          <!-- Date from -->
          <div>
            <label class="text-sm font-medium block mb-1">{{ $t('common.from') }}</label>
            <Input v-model="dateFrom" type="date" />
          </div>

          <!-- Date to -->
          <div>
            <label class="text-sm font-medium block mb-1">{{ $t('common.to') }}</label>
            <Input v-model="dateTo" type="date" />
          </div>
```

Replace with:
```html
          <!-- Date from -->
          <DatePicker v-model="dateFrom" :label="$t('common.from')" />

          <!-- Date to -->
          <DatePicker v-model="dateTo" :label="$t('common.to')" />
```

- [ ] **Step 3: Remove unused `Input` import if it's no longer used elsewhere in the file**

Check if `Input` is still used in the template. It is not (only the two date inputs used it). Remove:
```ts
import { Input } from '~/components/ui/input'
```

---

### Task 4: `create-leave-request.vue` — 2 vee-validate Fields with `<Input v-bind="field">`

**Files:**
- Modify: `micro-erp-spa-v3/pages/hrm/leave/create-leave-request.vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace the two date Fields in the template**

Find:
```html
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <!-- Start date -->
            <Field name="datetime_leave_from" v-slot="{ field, errors }">
              <div>
                <label class="text-sm font-medium block mb-1">
                  {{ $t('leave.startDate') }} <span class="text-destructive">*</span>
                </label>
                <Input
                  v-bind="field"
                  type="date"
                  :class="errors[0] ? 'border-destructive' : ''"
                  @change="startDate = ($event.target as HTMLInputElement).value"
                />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </div>
            </Field>

            <!-- End date -->
            <Field name="datetime_leave_to" v-slot="{ field, errors }">
              <div>
                <label class="text-sm font-medium block mb-1">
                  {{ $t('leave.endDate') }} <span class="text-destructive">*</span>
                </label>
                <Input
                  v-bind="field"
                  type="date"
                  :class="errors[0] ? 'border-destructive' : ''"
                  @change="endDate = ($event.target as HTMLInputElement).value"
                />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </div>
            </Field>
          </div>
```

Replace with:
```html
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <!-- Start date -->
            <Field name="datetime_leave_from" v-slot="{ componentField, errors }">
              <DatePicker
                v-bind="componentField"
                :label="$t('leave.startDate')"
                :error="errors[0]"
                required
                @update:model-value="startDate = $event"
              />
            </Field>

            <!-- End date -->
            <Field name="datetime_leave_to" v-slot="{ componentField, errors }">
              <DatePicker
                v-bind="componentField"
                :label="$t('leave.endDate')"
                :error="errors[0]"
                required
                @update:model-value="endDate = $event"
              />
            </Field>
          </div>
```

- [ ] **Step 3: Remove unused `Input` import**

Remove from script imports:
```ts
import { Input } from '~/components/ui/input'
```

---

### Task 5: `leave-for-someone/[id].vue` — 2 vee-validate Fields with `<AppInput v-bind="field">`

**Files:**
- Modify: `micro-erp-spa-v3/pages/hrm/leave/leave-for-someone/[id].vue`

- [ ] **Step 1: Add DatePicker import**

Add to script (no existing imports block — add after `definePageMeta`):
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace the two date Fields in the template**

Find:
```html
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field name="start_date" v-slot="{ field, errors }">
              <AppInput v-bind="field" type="date" label="Ngày bắt đầu" :error="errors[0]" required />
            </Field>
            <Field name="end_date" v-slot="{ field, errors }">
              <AppInput v-bind="field" type="date" label="Ngày kết thúc" :error="errors[0]" required />
            </Field>
          </div>
```

Replace with:
```html
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field name="start_date" v-slot="{ componentField, errors }">
              <DatePicker
                v-bind="componentField"
                label="Ngày bắt đầu"
                :error="errors[0]"
                required
                @update:model-value="startDate = $event"
              />
            </Field>
            <Field name="end_date" v-slot="{ componentField, errors }">
              <DatePicker
                v-bind="componentField"
                label="Ngày kết thúc"
                :error="errors[0]"
                required
                @update:model-value="endDate = $event"
              />
            </Field>
          </div>
```

---

### Task 6: `view-profile/[id].vue` — 3 raw `<input type="date" class="field-input">`

**Files:**
- Modify: `micro-erp-spa-v3/pages/hrm/member/view-profile/[id].vue`

- [ ] **Step 1: Add DatePicker import to script**

Find the `<script setup lang="ts">` opening and add import. Check imports section — add:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace birthday input (line ~140)**

Find:
```html
                <FormField label="Ngày sinh">
                  <input v-model="editForm.birthday" type="date" class="field-input" />
                </FormField>
```

Replace with:
```html
                <FormField label="Ngày sinh">
                  <DatePicker v-model="editForm.birthday" />
                </FormField>
```

- [ ] **Step 3: Replace company_joined_date input (line ~150)**

Find:
```html
                <FormField label="Ngày vào công ty">
                  <input v-model="editForm.company_joined_date" type="date" class="field-input" />
                </FormField>
```

Replace with:
```html
                <FormField label="Ngày vào công ty">
                  <DatePicker v-model="editForm.company_joined_date" />
                </FormField>
```

- [ ] **Step 4: Replace date_of_identity_card input (line ~196)**

Find:
```html
                <FormField label="Ngày cấp">
                  <input v-model="editForm.date_of_identity_card" type="date" class="field-input" />
                </FormField>
```

Replace with:
```html
                <FormField label="Ngày cấp">
                  <DatePicker v-model="editForm.date_of_identity_card" />
                </FormField>
```

---

### Task 7: `edit-profile/[id].vue` — 1 `<Input v-model type="date">`

**Files:**
- Modify: `micro-erp-spa-v3/pages/hrm/member/edit-profile/[id].vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace the date input in template**

Find:
```html
            <div class="space-y-1.5">
              <label class="text-sm font-medium leading-none">Ngày sinh</label>
              <Input v-model="form.date_of_birth" type="date" />
            </div>
```

Replace with:
```html
            <div class="space-y-1.5">
              <DatePicker v-model="form.date_of_birth" label="Ngày sinh" />
            </div>
```

- [ ] **Step 3: Remove `Input` import if unused elsewhere**

Check whether `Input` is used elsewhere in the file. If not, remove:
```ts
import { Input } from '~/components/ui/input'
```

---

### Task 8: `manage-contract.vue` — 2 `<AppInput v-model type="date">`

**Files:**
- Modify: `micro-erp-spa-v3/pages/hrm/contract/manage-contract.vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace the two date inputs in template**

Find:
```html
        <AppInput v-model="form.start_date" type="date" label="Ngày bắt đầu" required />
        <AppInput v-model="form.end_date" type="date" label="Ngày kết thúc" />
```

Replace with:
```html
        <DatePicker v-model="form.start_date" label="Ngày bắt đầu" required />
        <DatePicker v-model="form.end_date" label="Ngày kết thúc" />
```

---

### Task 9: `add-contract.vue` — 2 vee-validate Fields with `<AppInput v-bind="field">`

**Files:**
- Modify: `micro-erp-spa-v3/pages/hrm/contract/add-contract.vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace the two date Fields in template**

Find:
```html
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="start_date" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="date" label="Ngày bắt đầu" :error="errors[0]" required />
          </Field>
          <Field name="end_date" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="date" label="Ngày kết thúc" :error="errors[0]" />
          </Field>
        </div>
```

Replace with:
```html
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="start_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày bắt đầu" :error="errors[0]" required />
          </Field>
          <Field name="end_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày kết thúc" :error="errors[0]" />
          </Field>
        </div>
```

---

### Task 10: `create-asset.vue` — 1 vee-validate Field

**Files:**
- Modify: `micro-erp-spa-v3/pages/hrm/asset/create-asset.vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace in template**

Find:
```html
          <Field name="purchase_date" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="date" label="Ngày mua" :error="errors[0]" />
          </Field>
```

Replace with:
```html
          <Field name="purchase_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày mua" :error="errors[0]" />
          </Field>
```

---

### Task 11: `edit-asset/[id].vue` — 1 vee-validate Field

**Files:**
- Modify: `micro-erp-spa-v3/pages/hrm/asset/edit-asset/[id].vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace in template**

Find:
```html
          <Field name="purchase_date" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="date" label="Ngày mua" :error="errors[0]" />
          </Field>
```

Replace with:
```html
          <Field name="purchase_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày mua" :error="errors[0]" />
          </Field>
```

---

### Task 12: `asset-list.vue` — 1 `<AppInput v-model type="date">`

**Files:**
- Modify: `micro-erp-spa-v3/pages/hrm/asset/asset-list.vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace in template**

Find:
```html
        <AppInput v-model="requestReturnDate" type="date" label="Ngày trả dự kiến" />
```

Replace with:
```html
        <DatePicker v-model="requestReturnDate" label="Ngày trả dự kiến" />
```

---

### Task 13: `create-project.vue` — 2 vee-validate Fields

**Files:**
- Modify: `micro-erp-spa-v3/pages/workflow/create-project.vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace the two date Fields in template**

Find:
```html
        <div class="grid grid-cols-2 gap-4 mb-4">
          <Field name="start_date" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="date" label="Ngày bắt đầu" :error="errors[0]" required />
          </Field>
          <Field name="end_date" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="date" label="Ngày kết thúc dự kiến" :error="errors[0]" />
          </Field>
        </div>
```

Replace with:
```html
        <div class="grid grid-cols-2 gap-4 mb-4">
          <Field name="start_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày bắt đầu" :error="errors[0]" required />
          </Field>
          <Field name="end_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày kết thúc dự kiến" :error="errors[0]" />
          </Field>
        </div>
```

---

### Task 14: `edit-project/[id].vue` — 2 vee-validate Fields

**Files:**
- Modify: `micro-erp-spa-v3/pages/workflow/edit-project/[id].vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace the two date Fields in template**

Find:
```html
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="start_date" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="date" label="Ngày bắt đầu" :error="errors[0]" />
          </Field>
          <Field name="end_date" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="date" label="Ngày kết thúc" :error="errors[0]" />
          </Field>
        </div>
```

Replace with:
```html
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="start_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày bắt đầu" :error="errors[0]" />
          </Field>
          <Field name="end_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày kết thúc" :error="errors[0]" />
          </Field>
        </div>
```

---

### Task 15: `boards.vue` — 1 `<AppInput v-model type="date">`

**Files:**
- Modify: `micro-erp-spa-v3/pages/workflow/boards.vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace in template**

Find:
```html
        <AppInput v-model="newTask.due_date" type="date" label="Hạn hoàn thành" />
```

Replace with:
```html
        <DatePicker v-model="newTask.due_date" label="Hạn hoàn thành" />
```

---

### Task 16: `project-board/[id].vue` — 1 `<AppInput v-model type="date">`

**Files:**
- Modify: `micro-erp-spa-v3/pages/workflow/project-board/[id].vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace in template**

Find:
```html
        <AppInput v-model="taskForm.due_date" type="date" label="Hạn hoàn thành" />
```

Replace with:
```html
        <DatePicker v-model="taskForm.due_date" label="Hạn hoàn thành" />
```

---

### Task 17: `create-recruitment.vue` — 2 vee-validate Fields

**Files:**
- Modify: `micro-erp-spa-v3/pages/recruitment/create-recruitment.vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace the two date Fields in template**

Find:
```html
        <div class="grid grid-cols-2 gap-4 mb-4">
          <Field name="start_date" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="date" label="Ngày bắt đầu" :error="errors[0]" required />
          </Field>
          <Field name="expiry_date" v-slot="{ field, errors }">
            <AppInput v-bind="field" type="date" label="Hạn nộp hồ sơ" :error="errors[0]" required />
          </Field>
        </div>
```

Replace with:
```html
        <div class="grid grid-cols-2 gap-4 mb-4">
          <Field name="start_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày bắt đầu" :error="errors[0]" required />
          </Field>
          <Field name="expiry_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Hạn nộp hồ sơ" :error="errors[0]" required />
          </Field>
        </div>
```

---

### Task 18: `edit-recruitment/[id].vue` — 1 vee-validate Field

**Files:**
- Modify: `micro-erp-spa-v3/pages/recruitment/edit-recruitment/[id].vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace in template**

Find:
```html
            <Field name="deadline" v-slot="{ field, errors }">
              <AppInput v-bind="field" type="date" label="Hạn nộp" :error="errors[0]" />
            </Field>
```

Replace with:
```html
            <Field name="deadline" v-slot="{ componentField, errors }">
              <DatePicker v-bind="componentField" label="Hạn nộp" :error="errors[0]" />
            </Field>
```

---

### Task 19: `settings/holidays/index.vue` — 1 `<AppInput v-model type="date">`

**Files:**
- Modify: `micro-erp-spa-v3/pages/settings/holidays/index.vue`

- [ ] **Step 1: Add DatePicker import**

Add to script imports:
```ts
import DatePicker from '~/components/ui/DatePicker.vue'
```

- [ ] **Step 2: Replace in template**

Find:
```html
        <AppInput v-model="newHoliday.date" label="Ngày" type="date" required />
```

Replace with:
```html
        <DatePicker v-model="newHoliday.date" label="Ngày" required />
```

---

### Task 20: Manual verification

- [ ] **Step 1: Confirm no remaining `type="date"` inputs**

Run in `micro-erp-spa-v3/`:
```bash
grep -r 'type="date"' pages/
```

Expected: no output.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

- [ ] **Step 3: Test each date picker location**

Open browser and verify each of the following shows a calendar popup (not a native date input):

| URL | Field |
|-----|-------|
| `/hrm/leave/history-user-leave` | Từ / Đến filter |
| `/hrm/leave/create-leave-request` | Ngày bắt đầu / Kết thúc |
| `/hrm/leave/leave-for-someone/1` | Ngày bắt đầu / Kết thúc |
| `/hrm/member/view-profile/1` (edit sheet) | Ngày sinh / Ngày vào công ty / Ngày cấp |
| `/hrm/member/edit-profile/1` | Ngày sinh |
| `/hrm/contract/manage-contract` (modal) | Ngày bắt đầu / Kết thúc |
| `/hrm/contract/add-contract` | Ngày bắt đầu / Kết thúc |
| `/hrm/asset/create-asset` | Ngày mua |
| `/hrm/asset/edit-asset/1` | Ngày mua |
| `/hrm/asset/asset-list` (borrow modal) | Ngày trả dự kiến |
| `/workflow/create-project` | Ngày bắt đầu / Kết thúc |
| `/workflow/edit-project/1` | Ngày bắt đầu / Kết thúc |
| `/workflow/boards` (add task modal) | Hạn hoàn thành |
| `/workflow/project-board/1` (task modal) | Hạn hoàn thành |
| `/recruitment/create-recruitment` | Ngày bắt đầu / Hạn nộp |
| `/recruitment/edit-recruitment/1` | Hạn nộp |
| `/settings/holidays` (add modal) | Ngày |

- [ ] **Step 4: Test form submission with a date selected**

On `/hrm/leave/create-leave-request`:
1. Select a start date using the calendar
2. Select an end date using the calendar
3. Check "Số ngày làm việc" updates correctly
4. Submit the form — verify no validation errors and date value sent correctly
