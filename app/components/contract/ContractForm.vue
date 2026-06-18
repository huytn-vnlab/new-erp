<script setup lang="ts">
import { ref } from 'vue'
import { Send } from 'lucide-vue-next'
import Btn from '~/components/base/Button.vue'
import Select from '~/components/base/Select.vue'
import { ALL_EMPLOYEES, CONTRACT_TYPES, CONTRACT_BRANCHES, CONTRACT_DURATIONS } from '~/mocks/contract'

const emit = defineEmits<{ submit: [{ user: string; type: string; branch: string; start: string; end: string; duration: string; note: string }]; cancel: [] }>()

const f = ref({ user: '', type: '', branch: '', start: '', end: '', duration: '', note: '' })
const errors = ref<Record<string, boolean>>({})

const employeeOpts = ALL_EMPLOYEES.map(e => ({ value: e, label: e }))
const typeOpts = CONTRACT_TYPES.map(t => ({ value: t.name, label: t.name }))
const branchOpts = CONTRACT_BRANCHES.map(b => ({ value: b, label: b }))
const durationOpts = CONTRACT_DURATIONS.map(d => ({ value: d, label: d }))

function validate() {
  errors.value = {}
  if (!f.value.user) errors.value.user = true
  if (!f.value.type) errors.value.type = true
  if (!f.value.branch) errors.value.branch = true
  if (!f.value.start) errors.value.start = true
  return Object.keys(errors.value).length === 0
}

function submit() {
  if (!validate()) return
  emit('submit', { ...f.value })
  f.value = { user: '', type: '', branch: '', start: '', end: '', duration: '', note: '' }
  errors.value = {}
}
</script>

<template>
  <div class="card-surface p-6 max-w-[680px] rise">
    <h3 class="font-heading font-bold text-[17px] text-foreground mb-6">Tạo hợp đồng mới</h3>

    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">Nhân viên <span class="text-red-400">*</span></label>
          <Select
            v-model="f.user"
            :options="employeeOpts"
            placeholder="— Chọn nhân viên —"
            :class="errors.user ? 'ring-1 ring-red-400 rounded-md' : ''"
            style="width: 100%"
          />
        </div>
        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">Chi nhánh <span class="text-red-400">*</span></label>
          <Select
            v-model="f.branch"
            :options="branchOpts"
            placeholder="— Chọn chi nhánh —"
            :class="errors.branch ? 'ring-1 ring-red-400 rounded-md' : ''"
            style="width: 100%"
          />
        </div>
      </div>

      <div>
        <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">Loại hợp đồng <span class="text-red-400">*</span></label>
        <Select
          v-model="f.type"
          :options="typeOpts"
          placeholder="— Chọn loại hợp đồng —"
          :class="errors.type ? 'ring-1 ring-red-400 rounded-md' : ''"
          style="width: 100%"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">Ngày hiệu lực <span class="text-red-400">*</span></label>
          <input
            v-model="f.start"
            type="date"
            :class="['w-full h-9 px-3 rounded-lg border bg-card text-[13px] text-foreground outline-none focus:border-primary/60', errors.start ? 'border-red-400' : 'border-border']"
          >
        </div>
        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">Ngày kết thúc</label>
          <input
            v-model="f.end"
            type="date"
            class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60"
          >
        </div>
      </div>

      <div>
        <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">Thời hạn hợp đồng</label>
        <Select v-model="f.duration" :options="durationOpts" placeholder="— Chọn thời hạn —" style="width: 100%" />
      </div>

      <div>
        <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">Ghi chú</label>
        <textarea
          v-model="f.note"
          rows="3"
          placeholder="Ghi chú thêm về hợp đồng…"
          class="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 resize-none placeholder:text-muted-foreground/50"
        />
      </div>

      <div class="pt-2 flex items-center justify-end gap-2">
        <Btn variant="outline" @click="emit('cancel')">Huỷ</Btn>
        <Btn variant="primary" @click="submit"><Send :size="13" /> Tạo hợp đồng</Btn>
      </div>
    </div>
  </div>
</template>
