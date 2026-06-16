# Plan B-1 — HRM base components + trang Quản lý nhân viên (Nuxt 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bổ sung bộ base component dùng chung cho HRM (FieldInput, FilterBar, Pagination, Select, Modal, Drawer, Toast) và dựng đầy đủ trang **HRM / Quản lý nhân viên** với mock data, khớp prototype `page-member.jsx`.

**Architecture:** Tiếp nối Plan A (Nuxt 4 `app/` dir, design tokens, Tailwind v4). Widget a11y phức tạp (Select, Dialog/Modal, Drawer) dùng **reka-ui headless** style theo prototype. Component thuần nhận props/emit; data ở `app/mocks/`.

**Tech Stack:** Nuxt 4, Vue 3.5, reka-ui (Dialog/Select), lucide-vue-next, vee-validate (sẵn), Vitest + @vue/test-utils.

**Nguồn tham chiếu thị giác:** `../new-erp/page-shell.jsx` (Select 116-199, FieldInput 99-113, FilterBar 93-96, Pagination 202-231), `../new-erp/page-member.jsx` (toàn bộ: InviteModal 31-151, PageMember 153-393, MemberDetail 395-466).

> **Quy ước:** Lệnh chạy tại `micro-erp-spa-v3`, dùng `corepack pnpm`. Test thuần dùng `@vue/test-utils` (happy-dom). Commit sau mỗi task.

> **Lưu ý reka-ui Select:** không cho phép `SelectItem` value = chuỗi rỗng. Vì vậy filter "tất cả" dùng sentinel `'all'` (không dùng `''`), và trang lọc coi `'all'` = không lọc.

---

### Task 1: Base — `FieldInput.vue` + `FilterBar.vue`

**Files:**
- Create: `app/components/base/FieldInput.vue`, `app/components/base/FilterBar.vue`
- Test: `tests/components/FieldInput.spec.ts`
- Reference: `page-shell.jsx` 99-113 (FieldInput), 93-96 (FilterBar).

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/FieldInput.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FieldInput from '../../app/components/base/FieldInput.vue'

describe('FieldInput', () => {
  it('hiển thị placeholder và phát update:modelValue khi gõ', async () => {
    const w = mount(FieldInput, { props: { modelValue: '', placeholder: 'Tìm…' } })
    const input = w.find('input')
    expect(input.attributes('placeholder')).toBe('Tìm…')
    await input.setValue('an')
    expect(w.emitted('update:modelValue')![0]).toEqual(['an'])
  })
})
```

- [ ] **Step 2: Chạy test → FAIL** — Run: `corepack pnpm test -- FieldInput`

- [ ] **Step 3: Viết `app/components/base/FieldInput.vue`**

```vue
<script setup lang="ts">
import type { Component } from 'vue'
import { Search } from 'lucide-vue-next'

withDefaults(defineProps<{ modelValue?: string; placeholder?: string; icon?: Component; width?: number }>(), {
  modelValue: '', width: 220,
})
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/30 focus-within:border-primary/60 transition-colors" :style="{ width: width + 'px' }">
    <component :is="icon ?? Search" :size="14" class="text-muted-foreground" />
    <input
      type="text" :value="modelValue" :placeholder="placeholder"
      class="bg-transparent text-[13px] flex-1 appearance-none border-0 outline-none placeholder:text-muted-foreground/70 text-foreground min-w-0"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>
```

- [ ] **Step 4: Viết `app/components/base/FilterBar.vue`**

```vue
<script setup lang="ts"></script>
<template>
  <div class="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-border/70 bg-card/60 backdrop-blur">
    <slot />
  </div>
</template>
```

- [ ] **Step 5: Chạy test → PASS** — Run: `corepack pnpm test -- FieldInput`

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(base): FieldInput + FilterBar"
```

---

### Task 2: Base — `Pagination.vue`

**Files:**
- Create: `app/components/base/Pagination.vue`
- Test: `tests/components/Pagination.spec.ts`
- Reference: `page-shell.jsx` 202-231.

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/Pagination.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '../../app/components/base/Pagination.vue'

describe('Pagination', () => {
  it('hiển thị khoảng và phát change khi bấm trang', async () => {
    const w = mount(Pagination, { props: { page: 1, total: 25, perPage: 10 } })
    expect(w.text()).toContain('1-10')
    expect(w.text()).toContain('25')
    // bấm nút trang số 2
    await w.findAll('button').find(b => b.text() === '2')!.trigger('click')
    expect(w.emitted('change')![0]).toEqual([2])
  })
  it('nút Trước bị disable ở trang 1', () => {
    const w = mount(Pagination, { props: { page: 1, total: 25, perPage: 10 } })
    const prev = w.findAll('button').find(b => b.text().includes('Trước'))!
    expect(prev.attributes('disabled')).toBeDefined()
  })
})
```

- [ ] **Step 2: Chạy test → FAIL** — Run: `corepack pnpm test -- Pagination`

- [ ] **Step 3: Viết `app/components/base/Pagination.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'

const props = defineProps<{ page: number; total: number; perPage: number }>()
const emit = defineEmits<{ change: [number] }>()

const pages = computed(() => Math.ceil(props.total / props.perPage))
const from = computed(() => (props.page - 1) * props.perPage + 1)
const to = computed(() => Math.min(props.page * props.perPage, props.total))
const nums = computed(() => Array.from({ length: Math.min(pages.value, 5) }, (_, i) => i + 1))
const gradient = { background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }
</script>

<template>
  <div class="flex items-center justify-between px-5 py-3 border-t border-border/70 text-[12px] text-muted-foreground">
    <span>Hiển thị <span class="font-semibold text-foreground tabular-nums">{{ from }}-{{ to }}</span> trên <span class="font-semibold text-foreground tabular-nums">{{ total }}</span></span>
    <div class="flex items-center gap-1">
      <button :disabled="page <= 1" class="h-7 px-2 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1" @click="emit('change', page - 1)">
        <ChevronRight :size="11" class="rotate-180" /> Trước
      </button>
      <button v-for="p in nums" :key="p" :class="'h-7 min-w-7 px-2 rounded-md font-medium tabular-nums ' + (p === page ? 'text-white shadow-sm' : 'hover:bg-muted text-foreground')" :style="p === page ? gradient : {}" @click="emit('change', p)">{{ p }}</button>
      <span v-if="pages > 5" class="px-1">…</span>
      <button :disabled="page >= pages" class="h-7 px-2 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1" @click="emit('change', page + 1)">
        Sau <ChevronRight :size="11" />
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Chạy test → PASS** — Run: `corepack pnpm test -- Pagination`

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(base): Pagination"`

---

### Task 3: Base — `Select.vue` (reka-ui)

**Files:**
- Create: `app/components/base/Select.vue`
- Test: `tests/components/Select.spec.ts`
- Reference: `page-shell.jsx` 116-199 (thị giác: trigger pill bg-muted/30, menu popover bo xl, item check primary).

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/Select.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Select from '../../app/components/base/Select.vue'

describe('Select', () => {
  it('hiển thị label của option đang chọn', () => {
    const w = mount(Select, { props: {
      modelValue: 'hn', options: [{ value: 'hn', label: 'Hà Nội' }, { value: 'dn', label: 'Đà Nẵng' }],
    } })
    expect(w.text()).toContain('Hà Nội')
  })
  it('hiển thị placeholder khi chưa chọn', () => {
    const w = mount(Select, { props: { modelValue: undefined, options: [], placeholder: 'Tất cả' } })
    expect(w.text()).toContain('Tất cả')
  })
})
```
> Ghi chú: reka-ui SelectValue render label qua context; test trên chỉ kiểm tra trigger hiển thị text (đủ cho smoke). Mở dropdown cần tương tác portal — verify thị giác ở Task 11.

- [ ] **Step 2: Chạy test → FAIL** — Run: `corepack pnpm test -- Select`

- [ ] **Step 3: Viết `app/components/base/Select.vue`**

```vue
<script setup lang="ts">
import {
  SelectRoot, SelectTrigger, SelectValue, SelectIcon, SelectPortal,
  SelectContent, SelectViewport, SelectItem, SelectItemText, SelectItemIndicator,
} from 'reka-ui'
import { ChevronDown, Check } from 'lucide-vue-next'

withDefaults(defineProps<{
  modelValue?: string
  options: { value: string; label: string }[]
  placeholder?: string
  width?: number
}>(), { placeholder: 'Chọn…', width: 160 })
const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="emit('update:modelValue', ($event as string))">
    <SelectTrigger
      :style="{ width: width + 'px' }"
      class="h-9 pl-3 pr-8 rounded-md border border-border bg-muted/30 hover:border-primary/40 data-[state=open]:border-primary/60 text-[13px] text-left inline-flex items-center justify-between gap-2 outline-none transition-colors relative"
    >
      <SelectValue :placeholder="placeholder" class="truncate" />
      <SelectIcon class="absolute right-2.5 top-1/2 -translate-y-1/2">
        <ChevronDown :size="12" class="text-muted-foreground" />
      </SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        position="popper" :side-offset="4"
        class="z-[9999] min-w-[var(--reka-select-trigger-width)] rounded-xl border border-border bg-popover shadow-popover overflow-hidden"
      >
        <SelectViewport class="max-h-60 overflow-y-auto scrollbar-thin py-1">
          <SelectItem
            v-for="o in options" :key="o.value" :value="o.value"
            class="w-full flex items-center gap-2 pl-3 pr-2.5 py-2 text-[13px] text-foreground/85 text-left cursor-pointer outline-none data-[highlighted]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-medium"
          >
            <SelectItemText>{{ o.label }}</SelectItemText>
            <SelectItemIndicator class="ml-auto">
              <Check :size="13" class="text-primary" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
```

- [ ] **Step 4: Chạy test → PASS** — Run: `corepack pnpm test -- Select`

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(base): Select (reka-ui)"`

---

### Task 4: Base — `Modal.vue` (reka-ui Dialog)

**Files:**
- Create: `app/components/base/Modal.vue`
- Test: `tests/components/Modal.spec.ts`
- Reference: `page-member.jsx` 79-149 (modal card bo 18, header icon + title, footer).

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/Modal.spec.ts`:
```ts
// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from '../../app/components/base/Modal.vue'

describe('Modal', () => {
  it('render title + slot khi open=true (qua portal vào body)', async () => {
    mount(Modal, { props: { open: true, title: 'Mời thành viên' }, slots: { default: 'NỘI DUNG' }, attachTo: document.body })
    await new Promise(r => setTimeout(r, 0))
    expect(document.body.textContent).toContain('Mời thành viên')
    expect(document.body.textContent).toContain('NỘI DUNG')
  })
  it('không render nội dung khi open=false', () => {
    mount(Modal, { props: { open: false, title: 'X' }, slots: { default: 'NỘI DUNG' }, attachTo: document.body })
    expect(document.body.textContent).not.toContain('NỘI DUNG')
  })
})
```

- [ ] **Step 2: Chạy test → FAIL** — Run: `corepack pnpm test -- Modal`

- [ ] **Step 3: Viết `app/components/base/Modal.vue`**

```vue
<script setup lang="ts">
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from 'reka-ui'
import { X } from 'lucide-vue-next'

withDefaults(defineProps<{ open: boolean; title?: string; maxWidth?: number }>(), { maxWidth: 480 })
const emit = defineEmits<{ 'update:open': [boolean] }>()
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/45 backdrop-blur-[4px]" />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] card-surface rise overflow-hidden focus:outline-none"
        :style="{ maxWidth: maxWidth + 'px', borderRadius: '18px' }"
      >
        <div v-if="title || $slots.header" class="flex items-center justify-between px-6 py-4 border-b border-border">
          <slot name="header"><DialogTitle class="font-heading font-bold text-[15px] text-foreground">{{ title }}</DialogTitle></slot>
          <DialogClose class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><X :size="14" /></DialogClose>
        </div>
        <DialogTitle v-else class="sr-only">{{ title }}</DialogTitle>
        <slot />
        <div v-if="$slots.footer" class="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/70 bg-muted/20">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
```
> Nếu dùng slot `header`, đặt `<DialogTitle>` bên trong slot đó để giữ a11y. Member InviteModal (Task 8) dùng slot header có DialogTitle.

- [ ] **Step 4: Chạy test → PASS** — Run: `corepack pnpm test -- Modal`
> Nếu happy-dom không flush portal kịp: tăng timeout chờ trong test lên 10ms. Nếu reka-ui cảnh báo thiếu `DialogTitle`, đảm bảo nhánh `v-else` luôn render một DialogTitle.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(base): Modal (reka-ui Dialog)"`

---

### Task 5: Base — `Drawer.vue` (reka-ui Dialog, sheet phải)

**Files:**
- Create: `app/components/base/Drawer.vue`
- Test: `tests/components/Drawer.spec.ts`
- Reference: `page-member.jsx` 395-411 (drawer trượt phải max-w-md, header avatar+tên).

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/Drawer.spec.ts`:
```ts
// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Drawer from '../../app/components/base/Drawer.vue'

describe('Drawer', () => {
  it('render slot khi open=true', async () => {
    mount(Drawer, { props: { open: true, title: 'Hồ sơ' }, slots: { default: 'CHI TIẾT' }, attachTo: document.body })
    await new Promise(r => setTimeout(r, 0))
    expect(document.body.textContent).toContain('CHI TIẾT')
  })
})
```

- [ ] **Step 2: Chạy test → FAIL** — Run: `corepack pnpm test -- Drawer`

- [ ] **Step 3: Viết `app/components/base/Drawer.vue`**

```vue
<script setup lang="ts">
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, VisuallyHidden } from 'reka-ui'

withDefaults(defineProps<{ open: boolean; title?: string; maxWidth?: number }>(), { maxWidth: 448 })
const emit = defineEmits<{ 'update:open': [boolean] }>()
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" />
      <DialogContent
        class="fixed inset-y-0 right-0 z-50 w-full bg-background border-l border-border h-full flex flex-col rise focus:outline-none"
        :style="{ maxWidth: maxWidth + 'px' }"
      >
        <VisuallyHidden><DialogTitle>{{ title }}</DialogTitle></VisuallyHidden>
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
```

- [ ] **Step 4: Chạy test → PASS** — Run: `corepack pnpm test -- Drawer`

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(base): Drawer (reka-ui Dialog sheet)"`

---

### Task 6: Base — Toast (`useToast` + `ToastHost`)

**Files:**
- Create: `app/composables/useToast.ts`, `app/components/base/ToastHost.vue`
- Modify: `app/layouts/admin.vue` (gắn `<ToastHost />`)
- Test: `tests/useToast.spec.ts`

- [ ] **Step 1: Viết test (failing)**

Create `tests/useToast.spec.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useToast } from '../app/composables/useToast'

describe('useToast', () => {
  beforeEach(() => { useToast().clear() })
  it('show thêm toast và dismiss xoá theo id', () => {
    const { toasts, show, dismiss } = useToast()
    const id = show('Đã gửi!', 'success', 0)
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]!.message).toBe('Đã gửi!')
    dismiss(id)
    expect(toasts.value).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Chạy test → FAIL** — Run: `corepack pnpm test -- useToast`

- [ ] **Step 3: Viết `app/composables/useToast.ts`**

```ts
import { ref } from 'vue'

export type ToastItem = { id: number; message: string; type: 'success' | 'error' | 'info' }

const toasts = ref<ToastItem[]>([])
let seq = 0

export function useToast() {
  function show(message: string, type: ToastItem['type'] = 'success', ms = 3000): number {
    const id = ++seq
    toasts.value = [...toasts.value, { id, message, type }]
    if (ms > 0) setTimeout(() => dismiss(id), ms)
    return id
  }
  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }
  function clear() { toasts.value = [] }
  return { toasts, show, dismiss, clear }
}
```

- [ ] **Step 4: Chạy test → PASS** — Run: `corepack pnpm test -- useToast`

- [ ] **Step 5: Viết `app/components/base/ToastHost.vue`**

```vue
<script setup lang="ts">
import { Check, AlertCircle, Info } from 'lucide-vue-next'
const { toasts } = useToast()
const ICON = { success: Check, error: AlertCircle, info: Info }
const BG = { success: 'hsl(160 60% 40%)', error: 'hsl(0 70% 50%)', info: 'hsl(203 89% 45%)' }
</script>
<template>
  <div class="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
    <div v-for="t in toasts" :key="t.id"
         class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-white shadow-popover rise"
         :style="{ background: BG[t.type], animationDuration: '0.2s' }">
      <component :is="ICON[t.type]" :size="13" />
      {{ t.message }}
    </div>
  </div>
</template>
```

- [ ] **Step 6: Gắn ToastHost vào `app/layouts/admin.vue`**

Thêm import trong `<script setup>`:
```ts
import ToastHost from '~/components/base/ToastHost.vue'
```
Thêm `<ToastHost />` ngay trước `</div>` root cuối (cạnh `<TweaksPanel />`).

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat(base): Toast (useToast + ToastHost)"`

---

### Task 7: Mock — `members.ts` + type `Member`

**Files:**
- Create: `app/mocks/members.ts`
- Test: `tests/members-mock.spec.ts`
- Reference: `page-member.jsx` 3-29 (MEMBERS, MEMBER_STATUS_META), 162-167 (invitations seed).

- [ ] **Step 1: Viết test (failing)**

Create `tests/members-mock.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { MEMBERS, MEMBER_STATUS_META, INVITATIONS } from '../app/mocks/members'

describe('mocks/members', () => {
  it('có 15 nhân viên, đủ field', () => {
    expect(MEMBERS).toHaveLength(15)
    expect(MEMBERS[0]).toHaveProperty('name')
    expect(MEMBERS[0]).toHaveProperty('branch')
    expect(MEMBERS[0]).toHaveProperty('status')
  })
  it('status meta map đủ 4 trạng thái', () => {
    expect(Object.keys(MEMBER_STATUS_META)).toEqual(['active', 'onboarding', 'leave', 'inactive'])
  })
  it('có lời mời seed', () => {
    expect(INVITATIONS.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Chạy test → FAIL** — Run: `corepack pnpm test -- members-mock`

- [ ] **Step 3: Viết `app/mocks/members.ts`** (port nguyên data từ `page-member.jsx` 3-29 + 162-167)

```ts
export type MemberStatus = 'active' | 'onboarding' | 'leave' | 'inactive'
export type Member = {
  id: number; name: string; branch: string; role: string; email: string
  phone: string; status: MemberStatus; jp: string; join: string; rank: string
}
export type Invitation = { email: string; role: string; branch: string; sent: string; by: string; status: 'pending' | 'expired' }

export const MEMBERS: Member[] = [
  { id: 1, name: 'Nguyễn Văn An', branch: 'Hà Nội', role: 'Senior Frontend', email: 'an.nguyen@vnlab.vn', phone: '0912 345 678', status: 'active', jp: 'N2', join: '15/01/2022', rank: 'S' },
  { id: 2, name: 'Trần Thị Mai', branch: 'Đà Nẵng', role: 'QA Engineer', email: 'mai.tran@vnlab.vn', phone: '0934 567 123', status: 'active', jp: 'N3', join: '08/06/2023', rank: 'A' },
  { id: 3, name: 'Lê Quang Huy', branch: 'Hồ Chí Minh', role: 'BrSE', email: 'huy.le@vnlab.vn', phone: '0987 654 321', status: 'active', jp: 'N1', join: '02/03/2021', rank: 'S' },
  { id: 4, name: 'Phạm Thu Hà', branch: 'Đà Nẵng', role: 'Tech Lead', email: 'ha.pham@vnlab.vn', phone: '0901 234 567', status: 'active', jp: 'N2', join: '17/09/2020', rank: 'S' },
  { id: 5, name: 'Đỗ Minh Tuấn', branch: 'Hà Nội', role: 'Backend Engineer', email: 'tuan.do@vnlab.vn', phone: '0945 678 901', status: 'active', jp: 'N3', join: '11/11/2022', rank: 'B' },
  { id: 6, name: 'Hoàng Đức Thành', branch: 'Hà Nội', role: 'PM Senior', email: 'thanh.hoang@vnlab.vn', phone: '0967 890 123', status: 'active', jp: 'N1', join: '04/05/2019', rank: 'S' },
  { id: 7, name: 'Vũ Thị Lan', branch: 'Hà Nội', role: 'Designer', email: 'lan.vu@vnlab.vn', phone: '0978 012 345', status: 'active', jp: 'N4', join: '23/07/2023', rank: 'A' },
  { id: 8, name: 'Bùi Đức Thành', branch: 'Osaka', role: 'DevOps', email: 'thanh.bui@vnlab.vn', phone: '+81 90 1234 5678', status: 'active', jp: 'N1', join: '12/10/2022', rank: 'A' },
  { id: 9, name: 'Ngô Thanh Tùng', branch: 'Hà Nội', role: 'Junior Developer', email: 'tung.ngo@vnlab.vn', phone: '0989 123 456', status: 'onboarding', jp: '—', join: '03/05/2026', rank: 'C' },
  { id: 10, name: 'Đặng Thị Hồng', branch: 'Đà Nẵng', role: 'Tester', email: 'hong.dang@vnlab.vn', phone: '0923 456 789', status: 'active', jp: 'N3', join: '20/04/2024', rank: 'B' },
  { id: 11, name: 'Nguyễn Hữu Phước', branch: 'Hồ Chí Minh', role: 'Backend Engineer', email: 'phuoc.nh@vnlab.vn', phone: '0956 789 012', status: 'leave', jp: 'N2', join: '15/02/2023', rank: 'A' },
  { id: 12, name: 'Lý Quỳnh Anh', branch: 'Hà Nội', role: 'BrSE', email: 'anh.ly@vnlab.vn', phone: '0901 567 890', status: 'active', jp: 'N1', join: '08/08/2021', rank: 'A' },
  { id: 13, name: 'Phan Văn Cường', branch: 'Đà Nẵng', role: 'DevOps', email: 'cuong.phan@vnlab.vn', phone: '0934 678 234', status: 'active', jp: 'N3', join: '19/11/2023', rank: 'B' },
  { id: 14, name: 'Tô Thị Kim Anh', branch: 'Hà Nội', role: 'Frontend Engineer', email: 'kimanh.to@vnlab.vn', phone: '0912 890 456', status: 'active', jp: 'N2', join: '07/03/2024', rank: 'B' },
  { id: 15, name: 'Hà Minh Quân', branch: 'Hồ Chí Minh', role: 'PM', email: 'quan.ha@vnlab.vn', phone: '0978 234 567', status: 'inactive', jp: '—', join: '12/06/2020', rank: '—' },
]

export const MEMBER_STATUS_META: Record<MemberStatus, { label: string; variant: 'green' | 'amber' | 'sky' | 'gray' }> = {
  active: { label: 'Đang làm việc', variant: 'green' },
  onboarding: { label: 'Đang onboard', variant: 'amber' },
  leave: { label: 'Nghỉ phép', variant: 'sky' },
  inactive: { label: 'Đã nghỉ việc', variant: 'gray' },
}

export const BRANCHES = ['Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh', 'Osaka']

export const INVITATIONS: Invitation[] = [
  { email: 'phong.le@example.com', role: 'Frontend Engineer', branch: 'Hà Nội', sent: '20/05/2026', by: 'Hoàng Đức Thành', status: 'pending' },
  { email: 'mai.t@example.com', role: 'QA', branch: 'Đà Nẵng', sent: '18/05/2026', by: 'Phạm Thu Hà', status: 'pending' },
  { email: 'duc.tran@example.com', role: 'BrSE', branch: 'Hà Nội', sent: '15/05/2026', by: 'Hoàng Đức Thành', status: 'expired' },
  { email: 'tuan.bui@example.com', role: 'PM', branch: 'HCM', sent: '12/05/2026', by: 'Lê Quang Huy', status: 'pending' },
]

export const RANK_COLOR: Record<string, string> = { S: '#0ea5e9', A: '#22c55e', B: '#a3a3a3', C: '#eab308' }
```

- [ ] **Step 4: Chạy test → PASS** — Run: `corepack pnpm test -- members-mock`

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(mocks): members + types"`

---

### Task 8: Member — `InviteModal.vue`

**Files:**
- Create: `app/components/member/InviteModal.vue`
- Test: `tests/components/InviteModal.spec.ts`
- Reference: `page-member.jsx` 31-151 (tag-input email, validate, gửi).

- [ ] **Step 1: Viết test (failing)**

Create `tests/components/InviteModal.spec.ts`:
```ts
// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InviteModal from '../../app/components/member/InviteModal.vue'

describe('InviteModal', () => {
  it('thêm email hợp lệ khi nhấn Enter, hiện chip', async () => {
    const w = mount(InviteModal, { props: { open: true }, attachTo: document.body })
    await new Promise(r => setTimeout(r, 0))
    const input = document.body.querySelector('input[type="email"]') as HTMLInputElement
    input.value = 'a@b.com'
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await new Promise(r => setTimeout(r, 0))
    expect(document.body.textContent).toContain('a@b.com')
  })
})
```
> Nếu test tương tác qua DOM thật khó ổn định trong happy-dom, thay bằng test logic thuần: tách hàm `isValidEmail` ra và test riêng. (Xem Step 3 — export `isValidEmail`.)

- [ ] **Step 2: Chạy test → FAIL** — Run: `corepack pnpm test -- InviteModal`

- [ ] **Step 3: Viết `app/components/member/InviteModal.vue`** (port logic 31-151)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UserPlus, Mail, X } from 'lucide-vue-next'
import Modal from '~/components/base/Modal.vue'
import Btn from '~/components/base/Button.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean]; sent: [{ email: string; sent: string; by: string; status: 'pending' }] }>()

const emails = ref<string[]>([])
const input = ref('')
const error = ref('')
const sending = ref(false)

const isValidEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim())

function addEmail(val: string) {
  const v = val.trim()
  if (!v) return
  if (!isValidEmail(v)) { error.value = 'Email không hợp lệ: ' + v; return }
  if (emails.value.includes(v)) { error.value = 'Email đã được thêm'; return }
  emails.value = [...emails.value, v]; input.value = ''; error.value = ''
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEmail(input.value) }
  else if (e.key === 'Backspace' && !input.value && emails.value.length) emails.value = emails.value.slice(0, -1)
}
function removeEmail(em: string) { emails.value = emails.value.filter(x => x !== em) }
function close() { emails.value = []; input.value = ''; error.value = ''; emit('update:open', false) }
function send() {
  const pending = input.value.trim()
  const all = pending && isValidEmail(pending) ? [...emails.value, pending] : emails.value
  if (all.length === 0) { error.value = 'Nhập ít nhất một địa chỉ email'; return }
  if (pending && !isValidEmail(pending)) { error.value = 'Email không hợp lệ: ' + pending; return }
  sending.value = true
  setTimeout(() => {
    all.forEach(em => emit('sent', { email: em, sent: new Date().toLocaleDateString('vi-VN'), by: 'Hoàng Đức Thành', status: 'pending' }))
    sending.value = false; close()
  }, 600)
}
</script>

<template>
  <Modal :open="open" :max-width="480" @update:open="(v) => !v && close()">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center" :style="{ background: 'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 65%),hsl(var(--primary-h) var(--primary-s) 45%))' }">
          <UserPlus :size="14" class="text-white" />
        </div>
        <div>
          <h3 class="font-heading font-bold text-[15px] text-foreground">Mời thành viên</h3>
          <p class="text-[11.5px] text-muted-foreground mt-0.5">Nhấn Enter để thêm nhiều email</p>
        </div>
      </div>
    </template>

    <div class="p-6">
      <div
        :class="'min-h-[80px] flex flex-wrap gap-1.5 p-3 rounded-xl border cursor-text transition-colors ' + (error ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-border bg-card focus-within:border-primary/60')"
      >
        <span v-for="em in emails" :key="em" class="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-[12.5px] font-medium" :style="{ background: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.1)', color: 'hsl(var(--primary))' }">
          <Mail :size="11" />{{ em }}
          <button class="h-4 w-4 rounded flex items-center justify-center hover:bg-primary/20 transition-colors ml-0.5" @click="removeEmail(em)"><X :size="9" /></button>
        </span>
        <input
          type="email" :value="input" :placeholder="emails.length === 0 ? 'ten@congty.com, nhấn Enter để thêm tiếp…' : ''"
          class="flex-1 min-w-[180px] bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/50 py-0.5"
          @input="input = ($event.target as HTMLInputElement).value; error = ''"
          @keydown="onKeydown"
          @blur="input.trim() && addEmail(input)"
        >
      </div>
      <p v-if="error" class="text-[11.5px] text-red-400 mt-1.5">{{ error }}</p>
      <p v-else class="text-[11.5px] text-muted-foreground mt-2">
        <template v-if="emails.length > 0"><span class="font-semibold text-foreground">{{ emails.length }}</span> email · Link có hiệu lực <strong>7 ngày</strong></template>
        <template v-else>Nhập email rồi nhấn Enter. Có thể mời nhiều người cùng lúc.</template>
      </p>
    </div>

    <template #footer>
      <Btn variant="outline" size="sm" @click="close">Huỷ</Btn>
      <Btn variant="primary" size="sm" @click="send">
        <span v-if="sending" class="flex items-center gap-2"><span class="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Đang gửi…</span>
        <span v-else>{{ emails.length > 1 ? `Gửi ${emails.length} lời mời` : 'Gửi lời mời' }}</span>
      </Btn>
    </template>
  </Modal>
</template>
```

- [ ] **Step 4: Chạy test → PASS** — Run: `corepack pnpm test -- InviteModal`
> Nếu test DOM-tương tác không ổn định trong happy-dom, đổi test sang kiểm tra `isValidEmail` (export hàm này từ một file util nhỏ `app/utils/email.ts` và import ở component) — vẫn bảo đảm logic validate đúng.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(member): InviteModal"`

---

### Task 9: Member — `MemberDetail.vue` (drawer)

**Files:**
- Create: `app/components/member/MemberDetail.vue`
- Reference: `page-member.jsx` 395-466.

- [ ] **Step 1: Viết `app/components/member/MemberDetail.vue`**

```vue
<script setup lang="ts">
import { Mail, Phone, Building2, Calendar, FileText, ExternalLink, X, ChevronRight } from 'lucide-vue-next'
import Drawer from '~/components/base/Drawer.vue'
import Avatar from '~/components/base/Avatar.vue'
import Btn from '~/components/base/Button.vue'
import type { Member } from '~/mocks/members'

const props = defineProps<{ open: boolean; member: Member | null }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()
const RANK_BG: Record<string, string> = { S: '#0ea5e9', A: '#22c55e' }
const projects = ['Cổng thanh toán XYZ', 'Hệ thống CRM nội bộ', 'Module báo cáo BI']
const skills = ['Vue.js', 'TypeScript', 'Node.js', 'Tailwind', 'Figma', 'AWS']
</script>

<template>
  <Drawer :open="open" :title="member?.name" @update:open="emit('update:open', $event)">
    <template v-if="member">
      <div class="p-5 border-b border-border/70 flex items-start justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <Avatar :name="member.name" :size="48" />
          <div class="min-w-0">
            <h3 class="font-bold text-[16px] font-heading text-foreground truncate">{{ member.name }}</h3>
            <p class="text-[12px] text-muted-foreground truncate">{{ member.role }} · {{ member.branch }}</p>
          </div>
        </div>
        <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="emit('update:open', false)"><X :size="16" /></button>
      </div>
      <div class="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
        <div>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Thông tin liên hệ</p>
          <ul class="space-y-2 text-[13px]">
            <li class="flex items-center gap-2"><Mail :size="13" class="text-primary" /> {{ member.email }}</li>
            <li class="flex items-center gap-2"><Phone :size="13" class="text-primary" /> <span class="font-mono">{{ member.phone }}</span></li>
            <li class="flex items-center gap-2"><Building2 :size="13" class="text-primary" /> {{ member.branch }}</li>
            <li class="flex items-center gap-2"><Calendar :size="13" class="text-primary" /> Vào công ty <span class="font-mono">{{ member.join }}</span></li>
          </ul>
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Đánh giá</p>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-12 h-12 rounded-xl text-white text-[20px] font-bold font-heading" :style="{ background: RANK_BG[member.rank] ?? '#a3a3a3' }">{{ member.rank }}</span>
            <div class="flex-1">
              <p class="text-[13px] font-semibold">Kỳ hiện tại Q2/2026</p>
              <p class="text-[11.5px] text-muted-foreground">Tăng 1 hạng so với Q1</p>
            </div>
          </div>
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Dự án đang tham gia</p>
          <ul class="space-y-2">
            <li v-for="p in projects" :key="p" class="flex items-center justify-between text-[13px] p-2 -mx-2 rounded-md hover:bg-muted/40">
              <span>{{ p }}</span><ChevronRight :size="12" class="text-muted-foreground" />
            </li>
          </ul>
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Kỹ năng</p>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="s in skills" :key="s" class="px-2 py-0.5 rounded-full text-[11.5px] bg-muted text-foreground/80">{{ s }}</span>
          </div>
        </div>
      </div>
      <div class="p-4 border-t border-border/70 flex items-center gap-2">
        <Btn variant="outline" size="sm" class="flex-1"><ExternalLink :size="13" /> Xem hồ sơ đầy đủ</Btn>
        <Btn variant="primary" size="sm"><FileText :size="13" /> Chỉnh sửa</Btn>
      </div>
    </template>
  </Drawer>
</template>
```

- [ ] **Step 2: Commit** — `git add -A && git commit -m "feat(member): MemberDetail drawer"`

---

### Task 10: Member — ráp trang `app/pages/hrm/member.vue`

**Files:**
- Replace: `app/pages/hrm/member.vue` (đang là placeholder)
- Reference: `page-member.jsx` 153-393.

- [ ] **Step 1: Viết `app/pages/hrm/member.vue`**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Tabs from '~/components/base/Tabs.vue'
import FilterBar from '~/components/base/FilterBar.vue'
import FieldInput from '~/components/base/FieldInput.vue'
import Select from '~/components/base/Select.vue'
import Pagination from '~/components/base/Pagination.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import InviteModal from '~/components/member/InviteModal.vue'
import MemberDetail from '~/components/member/MemberDetail.vue'
import { Building2, FileText, UserPlus, Users } from 'lucide-vue-next'
import { MEMBERS, MEMBER_STATUS_META, BRANCHES, INVITATIONS, RANK_COLOR, type Member, type Invitation } from '~/mocks/members'

definePageMeta({ layout: 'admin' })

const search = ref('')
const branch = ref('all')
const role = ref('all')
const status = ref('all')
const tab = ref('list')
const page = ref(1)
const perPage = 10
const openMember = ref<Member | null>(null)
const drawerOpen = ref(false)
const inviteOpen = ref(false)
const invitations = ref<Invitation[]>([...INVITATIONS])
const { show } = useToast()

const roleOptions = computed(() => [{ value: 'all', label: 'Tất cả chức vụ' }, ...Array.from(new Set(MEMBERS.map(m => m.role))).map(r => ({ value: r, label: r }))])
const branchOptions = [{ value: 'all', label: 'Tất cả chi nhánh' }, ...BRANCHES.map(b => ({ value: b, label: b }))]
const statusOptions = [{ value: 'all', label: 'Tất cả trạng thái' }, ...Object.entries(MEMBER_STATUS_META).map(([k, v]) => ({ value: k, label: v.label }))]

const filtered = computed(() => MEMBERS.filter((m) => {
  if (search.value && !m.name.toLowerCase().includes(search.value.toLowerCase()) && !m.email.toLowerCase().includes(search.value.toLowerCase())) return false
  if (branch.value !== 'all' && m.branch !== branch.value) return false
  if (role.value !== 'all' && m.role !== role.value) return false
  if (status.value !== 'all' && m.status !== status.value) return false
  return true
}))
const paged = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))
const pendingCount = computed(() => invitations.value.filter(i => i.status === 'pending').length)
const resetPage = () => { page.value = 1 }

const stats = computed(() => [
  { label: 'Tổng nhân viên', value: MEMBERS.length, sublabel: '4 chi nhánh', trend: { dir: 'up' as const, value: '+2 tháng này' }, accent: 'primary' as const },
  { label: 'Đang làm việc', value: MEMBERS.filter(m => m.status === 'active').length, sublabel: '88% tổng số', accent: 'green' as const },
  { label: 'Đang onboard', value: MEMBERS.filter(m => m.status === 'onboarding').length, sublabel: '2 sẽ chính thức tháng 6', accent: 'amber' as const },
  { label: 'Lời mời chờ duyệt', value: pendingCount.value, sublabel: 'Cần phản hồi', accent: 'violet' as const },
])
const tabItems = computed(() => [
  { value: 'list', label: 'Danh sách thành viên', count: filtered.value.length },
  { value: 'invites', label: 'Yêu cầu mời thành viên', count: invitations.value.length },
])

function openDetail(m: Member) { openMember.value = m; drawerOpen.value = true }
function onInvited(inv: { email: string; sent: string; by: string; status: 'pending' }) {
  invitations.value = [{ ...inv, role: '—', branch: '—' }, ...invitations.value]
  show('Lời mời đã được gửi tới ' + inv.email + '!')
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader eyebrow="HRM · Nhân sự" title="Quản lý nhân viên" description="Toàn bộ thành viên VNLab. Tìm kiếm, lọc theo chi nhánh / chức vụ / trạng thái và quản lý lời mời tham gia.">
      <template #actions>
        <Btn variant="outline"><FileText :size="14" /> Xuất Excel</Btn>
        <Btn variant="primary" @click="inviteOpen = true"><UserPlus :size="14" /> Mời thành viên</Btn>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MiniStat v-for="(s, i) in stats" :key="i" v-bind="s" :delay="40 + i * 40" />
    </div>

    <Tabs v-model="tab" :items="tabItems" />

    <template v-if="tab === 'list'">
      <FilterBar>
        <FieldInput v-model="search" placeholder="Tìm tên, email…" @update:model-value="resetPage" />
        <Select v-model="branch" :options="branchOptions" :width="170" @update:model-value="resetPage" />
        <Select v-model="role" :options="roleOptions" :width="170" @update:model-value="resetPage" />
        <Select v-model="status" :options="statusOptions" :width="170" @update:model-value="resetPage" />
        <div class="flex-1" />
        <span class="text-[12px] text-muted-foreground">{{ filtered.length }} / {{ MEMBERS.length }} kết quả</span>
      </FilterBar>

      <div class="card-surface overflow-hidden rise" style="animation-delay: 180ms">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th class="text-left py-3 px-5">Nhân viên</th>
                <th class="text-left py-3 px-3">Chi nhánh</th>
                <th class="text-left py-3 px-3">Chức vụ</th>
                <th class="text-left py-3 px-3">Liên hệ</th>
                <th class="text-center py-3 px-3">N. ngữ</th>
                <th class="text-center py-3 px-3">Rank</th>
                <th class="text-center py-3 px-3">Trạng thái</th>
                <th class="text-right py-3 px-5">Vào CT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in paged" :key="m.id" class="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" @click="openDetail(m)">
                <td class="py-3 px-5">
                  <div class="flex items-center gap-3">
                    <Avatar :name="m.name" :size="36" />
                    <div class="min-w-0">
                      <p class="font-semibold text-foreground">{{ m.name }}</p>
                      <p class="text-[11.5px] text-muted-foreground">#{{ String(m.id).padStart(4, '0') }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3"><span class="inline-flex items-center gap-1.5 text-foreground/80"><Building2 :size="12" class="text-muted-foreground" />{{ m.branch }}</span></td>
                <td class="py-3 px-3 text-foreground/80">{{ m.role }}</td>
                <td class="py-3 px-3">
                  <p class="text-foreground/85 truncate max-w-[200px]">{{ m.email }}</p>
                  <p class="text-[11.5px] text-muted-foreground font-mono">{{ m.phone }}</p>
                </td>
                <td class="py-3 px-3 text-center">
                  <span v-if="m.jp === '—'" class="text-muted-foreground">—</span>
                  <Badge v-else :variant="m.jp === 'N1' || m.jp === 'N2' ? 'primary' : 'gray'">{{ m.jp }}</Badge>
                </td>
                <td class="py-3 px-3 text-center">
                  <span v-if="m.rank === '—'" class="text-muted-foreground">—</span>
                  <span v-else class="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold text-white" :style="{ background: RANK_COLOR[m.rank] ?? '#a3a3a3' }">{{ m.rank }}</span>
                </td>
                <td class="py-3 px-3 text-center"><Badge :variant="MEMBER_STATUS_META[m.status].variant" dot>{{ MEMBER_STATUS_META[m.status].label }}</Badge></td>
                <td class="py-3 px-5 text-right font-mono text-muted-foreground">{{ m.join }}</td>
              </tr>
              <tr v-if="paged.length === 0">
                <td colspan="8" class="py-16 text-center text-muted-foreground">
                  <Users :size="36" class="mx-auto mb-2 opacity-30" />
                  <p class="text-[13px]">Không tìm thấy nhân viên phù hợp</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination v-if="filtered.length > perPage" :page="page" :total="filtered.length" :per-page="perPage" @change="(p) => page = p" />
      </div>
    </template>

    <div v-else class="card-surface overflow-hidden rise" style="animation-delay: 180ms">
      <div class="px-5 py-3.5 border-b border-border/70 flex items-center justify-between">
        <h3 class="section-title">Lời mời đang chờ phản hồi</h3>
        <Btn variant="primary" size="sm" @click="inviteOpen = true"><UserPlus :size="13" /> Mời mới</Btn>
      </div>
      <table class="w-full text-[13px]">
        <thead>
          <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
            <th class="text-left py-3 px-5">Email</th>
            <th class="text-left py-3 px-3">Chức vụ dự kiến</th>
            <th class="text-left py-3 px-3">Chi nhánh</th>
            <th class="text-left py-3 px-3">Người mời</th>
            <th class="text-left py-3 px-3">Ngày gửi</th>
            <th class="text-center py-3 px-3">Trạng thái</th>
            <th class="text-right py-3 px-5">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(inv, i) in invitations" :key="i" class="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
            <td class="py-3 px-5 font-mono text-[12.5px]">{{ inv.email }}</td>
            <td class="py-3 px-3 text-foreground/85">{{ inv.role }}</td>
            <td class="py-3 px-3 text-foreground/85">{{ inv.branch }}</td>
            <td class="py-3 px-3 text-foreground/85">{{ inv.by }}</td>
            <td class="py-3 px-3 font-mono text-muted-foreground">{{ inv.sent }}</td>
            <td class="py-3 px-3 text-center">
              <Badge v-if="inv.status === 'pending'" variant="amber" dot>Chờ phản hồi</Badge>
              <Badge v-else variant="gray">Đã hết hạn</Badge>
            </td>
            <td class="py-3 px-5 text-right">
              <div class="inline-flex gap-1.5">
                <Btn variant="outline" size="xs">Gửi lại</Btn>
                <Btn variant="ghost" size="xs">Huỷ</Btn>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <MemberDetail v-model:open="drawerOpen" :member="openMember" />
    <InviteModal v-model:open="inviteOpen" @sent="onInvited" />
  </div>
</template>
```

- [ ] **Step 2: Cập nhật breadcrumb (đã có sẵn `/hrm/member` trong `admin.vue` từ Plan A — không cần sửa).**

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(member): trang Quản lý nhân viên (filters, stats, tabs, table, drawer, modal, toast)"`

---

### Task 11: Verify — typecheck / lint / test / screenshot

- [ ] **Step 1: Typecheck** — Run: `corepack pnpm typecheck` → Expected: 0 lỗi (sửa nếu có).
- [ ] **Step 2: Lint** — Run: `corepack pnpm lint` → Expected: 0 error (warning chấp nhận).
- [ ] **Step 3: Unit test** — Run: `corepack pnpm test` → Expected: tất cả pass.
- [ ] **Step 4: Verify thị giác** — chạy `corepack pnpm dev`, mở `http://localhost:3000/hrm/member`. Đối chiếu `../new-erp/screenshots` (member): 4 mini-stat, filter bar (search + 3 select), bảng nhân viên (avatar/badge/rank/status), phân trang; bấm dòng → drawer chi tiết trượt phải; bấm "Mời thành viên" → modal tag-input email; gửi → toast góc phải-dưới. Đổi accent ở Tweaks → màu primary đổi đồng bộ.
- [ ] **Step 5: Commit (nếu có sửa)** — `git add -A && git commit -m "fix: typecheck/lint/visual cho trang member"`

---

## Self-Review (đã rà)

- **Spec coverage:** base components HRM (Select/FieldInput/FilterBar/Pagination/Modal/Drawer/Toast) — Task 1-6 ✓ (Table = raw `<table>` + `.thead-primary` đã có ở Plan A, không cần component riêng — YAGNI); reka-ui cho Select/Dialog ✓; trang member đầy đủ filter/stats/tabs/table/drawer/modal/toast — Task 7-10 ✓; mock tách riêng `app/mocks/members.ts` ✓; component nhận props/emit, không gọi data trực tiếp ✓.
- **Placeholder scan:** không có TBD/TODO; mọi task có code đầy đủ. Test InviteModal có phương án dự phòng (test `isValidEmail`) nêu rõ cách làm — không phải placeholder mơ hồ.
- **Type consistency:** `Member`/`Invitation`/`MemberStatus` định nghĩa ở Task 7, dùng nhất quán ở Task 9-10; `MEMBER_STATUS_META` keys khớp `MemberStatus`; Select dùng sentinel `'all'` nhất quán giữa options và logic lọc; `useToast().show` chữ ký khớp Task 6 và dùng ở Task 10; props `open`/`update:open` của Modal/Drawer nhất quán giữa Task 4-5 và 8-10.

## Phạm vi tiếp theo (Plan B-2)
Trang `leave`, `asset`, `contract`, `timekeeping` — nhân bản pattern (FilterBar + MiniStat + table + Pagination + drawer/modal khi cần) với mock riêng. Tham chiếu `page-leave.jsx`, `page-asset.jsx`, `page-contract.jsx`, `page-timekeeping.jsx`.
