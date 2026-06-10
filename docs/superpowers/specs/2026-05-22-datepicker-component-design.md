# DatePicker Component — Design Spec

**Date:** 2026-05-22  
**Status:** Approved

## Goal

Replace all `type="date"` native HTML inputs across the codebase (25 occurrences, 15 files) with a reusable `DatePicker` component built on reka-ui primitives. The component uses a popover calendar UI matching the shadcn-vue date-picker pattern.

## Dependency

Install `@internationalized/date` (peer dependency required by reka-ui calendar/date-picker primitives):

```bash
npm install @internationalized/date
```

reka-ui v2.9.7 is already installed and provides all needed primitives.

## New Component: `components/ui/DatePicker.vue`

### Props

```ts
{
  modelValue?: string | null   // YYYY-MM-DD format (same as HTML date input)
  label?:      string
  error?:      string
  required?:   boolean
  placeholder?: string
  disabled?:   boolean
}
```

### Emits

```ts
'update:modelValue': [value: string]  // YYYY-MM-DD string
```

### Internal value conversion

- `modelValue` (YYYY-MM-DD string) → `parseDate(modelValue)` → `CalendarDate` for reka-ui
- On calendar select: `CalendarDate.toString()` → YYYY-MM-DD string → emit `update:modelValue`
- When `modelValue` is null/undefined/empty: bind `undefined` to reka-ui (shows placeholder)

### Styling

Reuses existing CSS classes:
- `form-label` — same as AppInput label
- `form-input` — trigger button styled as text input with calendar icon on the right
- `form-error` — same as AppInput error text

### reka-ui primitives used

```
DatePickerRoot
  DatePickerField (trigger area styled as form-input)
    DatePickerInput (segments: day, month, year)
    DatePickerTrigger (calendar icon button)
  DatePickerContent (popover)
    DatePickerCalendar
      DatePickerHeader
        DatePickerPrev / DatePickerHeading / DatePickerNext
      DatePickerGrid
        DatePickerGridHead / DatePickerGridBody
          DatePickerCell / DatePickerCellTrigger
```

## Files to Change

### 15 files with type="date" inputs

| File | Count | Pattern |
|------|-------|---------|
| `pages/hrm/leave/history-user-leave.vue` | 2 | `<Input v-model type="date">` |
| `pages/hrm/leave/create-leave-request.vue` | 2 | `<Field>` + `<Input v-bind="field" type="date">` |
| `pages/hrm/leave/leave-for-someone/[id].vue` | 2 | `<AppInput v-bind="field" type="date">` |
| `pages/hrm/member/view-profile/[id].vue` | 3 | `<input v-model type="date" class="field-input">` |
| `pages/hrm/member/edit-profile/[id].vue` | 1 | `<Input v-model type="date">` |
| `pages/hrm/contract/manage-contract.vue` | 2 | `<AppInput v-model type="date">` |
| `pages/hrm/contract/add-contract.vue` | 2 | `<AppInput v-bind="field" type="date">` |
| `pages/hrm/asset/create-asset.vue` | 1 | `<AppInput v-bind="field" type="date">` |
| `pages/hrm/asset/edit-asset/[id].vue` | 1 | `<AppInput v-bind="field" type="date">` |
| `pages/hrm/asset/asset-list.vue` | 1 | `<AppInput v-model type="date">` |
| `pages/workflow/create-project.vue` | 2 | `<AppInput v-bind="field" type="date">` |
| `pages/workflow/edit-project/[id].vue` | 2 | `<AppInput v-bind="field" type="date">` |
| `pages/workflow/boards.vue` | 1 | `<AppInput v-model type="date">` |
| `pages/workflow/project-board/[id].vue` | 1 | `<AppInput v-model type="date">` |
| `pages/recruitment/create-recruitment.vue` | 2 | `<AppInput v-bind="field" type="date">` |
| `pages/recruitment/edit-recruitment/[id].vue` | 1 | `<AppInput v-bind="field" type="date">` |
| `pages/settings/holidays/index.vue` | 1 | `<AppInput v-model type="date">` |

### Replacement patterns

**Pattern A — simple v-model:**
```html
<!-- Before -->
<Input v-model="dateFrom" type="date" />
<AppInput v-model="x" type="date" label="Ngày bắt đầu" />

<!-- After -->
<DatePicker v-model="dateFrom" />
<DatePicker v-model="x" label="Ngày bắt đầu" />
```

**Pattern B — vee-validate Field with AppInput:**
```html
<!-- Before -->
<Field name="start_date" v-slot="{ field, errors }">
  <AppInput v-bind="field" type="date" label="Ngày bắt đầu" :error="errors[0]" required />
</Field>

<!-- After -->
<Field name="start_date" v-slot="{ componentField, errors }">
  <DatePicker v-bind="componentField" label="Ngày bắt đầu" :error="errors[0]" required />
</Field>
```

**Pattern C — vee-validate Field with shadcn Input (create-leave-request.vue):**
```html
<!-- Before -->
<Field name="datetime_leave_from" v-slot="{ field, errors }">
  <div>
    <label>...</label>
    <Input v-bind="field" type="date" :class="errors[0] ? 'border-destructive' : ''" @change="startDate = ..." />
    <p v-if="errors[0]">{{ errors[0] }}</p>
  </div>
</Field>

<!-- After -->
<Field name="datetime_leave_from" v-slot="{ componentField, errors }">
  <DatePicker v-bind="componentField" label="..." :error="errors[0]" required
              @update:model-value="startDate = $event" />
</Field>
```

**Pattern D — raw input with class:**
```html
<!-- Before -->
<input v-model="editForm.birthday" type="date" class="field-input" />

<!-- After -->
<DatePicker v-model="editForm.birthday" />
```

## Constraints

- Value format stays as YYYY-MM-DD string throughout — no changes to composables, stores, or API calls
- `componentField` (vee-validate) provides `modelValue` + `onUpdate:modelValue` — compatible with `v-model` components
- No changes needed to `AppInput.vue` — it is NOT modified
