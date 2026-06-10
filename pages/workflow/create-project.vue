<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">Tạo dự án mới</h2>

      <AppAlert v-if="serverError" variant="error" dismissible class="mb-4">{{ serverError }}</AppAlert>

      <Form :validation-schema="schema" @submit="onSubmit" v-slot="{ isSubmitting }">
        <div class="mb-4">
          <Field name="name" v-slot="{ field, errors }">
            <AppInput v-bind="field" label="Tên dự án" placeholder="VD: ERP Phase 2" :error="errors[0]" required />
          </Field>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <Field name="start_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày bắt đầu" :error="errors[0]" required />
          </Field>
          <Field name="end_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày kết thúc dự kiến" :error="errors[0]" />
          </Field>
        </div>

        <div class="mb-6">
          <Field name="description" v-slot="{ field, errors }">
            <div>
              <label class="form-label">Mô tả dự án</label>
              <textarea v-bind="field" rows="4" class="form-input resize-none" placeholder="Mô tả mục tiêu, phạm vi dự án..." />
              <p v-if="errors[0]" class="form-error">{{ errors[0] }}</p>
            </div>
          </Field>
        </div>

        <!-- Member selection -->
        <div class="mb-6">
          <label class="form-label">Thêm thành viên</label>
          <div class="flex gap-2 mb-2">
            <AppInput v-model="memberSearch" placeholder="Tìm nhân viên..." class="flex-1" />
          </div>
          <div class="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-200 rounded-lg bg-gray-50">
            <span v-if="selectedMembers.length === 0" class="text-sm text-gray-400">Chưa chọn thành viên</span>
            <span
              v-for="m in selectedMembers"
              :key="m.id"
              class="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
            >
              {{ m.full_name }}
              <button type="button" class="hover:text-red-600" @click="removeMember(m.id)">×</button>
            </span>
          </div>
          <!-- Search results dropdown -->
          <div v-if="memberSearch && searchResults.length" class="mt-1 border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
            <button
              v-for="m in searchResults"
              :key="m.id"
              type="button"
              class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50"
              @click="addMember(m)"
            >
              <div class="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <span class="text-xs font-bold text-primary-700">{{ getInitials(m.full_name, 1) }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ m.full_name }}</p>
                <p class="text-xs text-gray-400">{{ m.email }}</p>
              </div>
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <AppButton variant="secondary" type="button" @click="$router.back()">{{ $t('common.cancel') }}</AppButton>
          <AppButton type="submit" :loading="isSubmitting">Tạo dự án</AppButton>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useProject } from '~/composables/useProject'
import { useUserProfile } from '~/composables/useUserProfile'
import { getInitials } from '~/utils/format'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'project' } })
useHead({ title: 'Tạo dự án — Micro ERP' })

const router = useRouter()
const { createProject } = useProject()
const { fetchMemberList } = useUserProfile()

const serverError     = ref('')
const memberSearch    = ref('')
const allMembers      = ref<any[]>([])
const selectedMembers = ref<any[]>([])

const searchResults = computed(() =>
  allMembers.value
    .filter(m => !selectedMembers.value.find(s => s.id === m.id))
    .filter(m =>
      m.full_name?.toLowerCase().includes(memberSearch.value.toLowerCase()) ||
      m.email?.toLowerCase().includes(memberSearch.value.toLowerCase())
    )
    .slice(0, 6)
)

function addMember(m: any) {
  selectedMembers.value.push(m)
  memberSearch.value = ''
}

function removeMember(id: number) {
  selectedMembers.value = selectedMembers.value.filter(m => m.id !== id)
}

const schema = toTypedSchema(z.object({
  name:        z.string().min(2, 'Vui lòng nhập tên dự án'),
  start_date:  z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  end_date:    z.string().optional(),
  description: z.string().optional(),
}))

async function onSubmit(values: any) {
  serverError.value = ''
  try {
    await createProject({
      ...values,
      member_ids: selectedMembers.value.map(m => m.id),
    })
    router.push('/workflow/project-list')
  } catch {
    serverError.value = 'Tạo dự án không thành công.'
  }
}

onMounted(async () => {
  allMembers.value = await fetchMemberList()
})
</script>
