<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">Chỉnh sửa dự án</h2>

      <AppAlert v-if="serverError" variant="error" dismissible class="mb-4">{{ serverError }}</AppAlert>

      <div v-if="loading" class="flex justify-center py-12"><AppSpinner /></div>

      <Form v-else :validation-schema="schema" :initial-values="initialValues" @submit="onSubmit" v-slot="{ isSubmitting }">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="name" v-slot="{ field, errors }">
            <AppInput v-bind="field" label="Tên dự án" :error="errors[0]" required />
          </Field>
          <Field name="code" v-slot="{ field, errors }">
            <AppInput v-bind="field" label="Mã dự án" :error="errors[0]" required />
          </Field>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field name="start_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày bắt đầu" :error="errors[0]" />
          </Field>
          <Field name="end_date" v-slot="{ componentField, errors }">
            <DatePicker v-bind="componentField" label="Ngày kết thúc" :error="errors[0]" />
          </Field>
        </div>

        <div class="mb-4">
          <Field name="status" v-slot="{ field, errors }">
            <AppSelect
              v-bind="field"
              label="Trạng thái"
              :options="statusOptions"
              value-key="value"
              label-key="label"
              :error="errors[0]"
            />
          </Field>
        </div>

        <div class="mb-4">
          <Field name="description" v-slot="{ field, errors }">
            <div>
              <label class="form-label">Mô tả</label>
              <textarea v-bind="field" rows="3" class="form-input resize-none" placeholder="Mô tả dự án..." />
              <p v-if="errors[0]" class="form-error">{{ errors[0] }}</p>
            </div>
          </Field>
        </div>

        <!-- Members -->
        <div class="mb-6">
          <label class="form-label">Thành viên</label>
          <div class="flex gap-2 mb-2">
            <AppSelect
              v-model="memberSearch"
              :options="memberOptions"
              value-key="id"
              label-key="full_name"
              placeholder="Thêm thành viên..."
              class="flex-1"
            />
            <AppButton type="button" size="sm" @click="addMember">Thêm</AppButton>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="m in selectedMembers"
              :key="m.id"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm"
            >
              {{ m.full_name }}
              <button type="button" class="hover:text-red-500" @click="removeMember(m.id)">×</button>
            </span>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <AppButton variant="secondary" type="button" @click="$router.back()">{{ $t('common.cancel') }}</AppButton>
          <AppButton type="submit" :loading="isSubmitting">{{ $t('common.save') }}</AppButton>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useUserProfile } from '~/composables/useUserProfile'
import { handleApiError } from '~/utils/error-handler'
import type { Project } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'project' } })
useHead({ title: 'Sửa dự án — Micro ERP' })

const route  = useRoute()
const router = useRouter()
const toast  = useToast()
const { post } = useApi()
const { fetchMemberList } = useUserProfile()

const loading = ref(true)
const serverError = ref('')
const initialValues = ref<any>(null)
const memberOptions = ref<any[]>([])
const selectedMembers = ref<any[]>([])
const memberSearch = ref<any>('')

const statusOptions = [
  { value: 0, label: 'Chưa bắt đầu' },
  { value: 1, label: 'Đang thực hiện' },
  { value: 2, label: 'Hoàn thành' },
  { value: 3, label: 'Tạm dừng' },
]

const schema = toTypedSchema(z.object({
  name:        z.string().min(1, 'Nhập tên dự án'),
  code:        z.string().min(1, 'Nhập mã dự án'),
  start_date:  z.string().optional(),
  end_date:    z.string().optional(),
  status:      z.coerce.number().optional(),
  description: z.string().optional(),
}))

function addMember() {
  if (!memberSearch.value) return
  const found = memberOptions.value.find(m => m.id === Number(memberSearch.value))
  if (found && !selectedMembers.value.find(m => m.id === found.id)) {
    selectedMembers.value.push(found)
  }
  memberSearch.value = ''
}

function removeMember(id: number) {
  selectedMembers.value = selectedMembers.value.filter(m => m.id !== id)
}

async function onSubmit(values: any) {
  serverError.value = ''
  try {
    await post('/project/update-project', {
      ...values,
      id: Number(route.params.id),
      member_ids: selectedMembers.value.map(m => m.id),
    })
    toast.success('Đã cập nhật dự án')
    router.push(`/workflow/view-project/${route.params.id}`)
  } catch (err) {
    serverError.value = handleApiError(err)
  }
}

onMounted(async () => {
  try {
    const [projRes, allMembers] = await Promise.all([
      post<{ project: Project }>('/project/get-project-detail', { id: Number(route.params.id) }),
      fetchMemberList(),
    ])
    const proj = (projRes.data?.project ?? {}) as Partial<Project>
    initialValues.value = {
      name:        proj.name,
      code:        proj.code,
      start_date:  proj.start_date?.substring(0, 10) ?? '',
      end_date:    proj.end_date?.substring(0, 10) ?? '',
      status:      proj.status,
      description: proj.description ?? '',
    }
    memberOptions.value = allMembers
    selectedMembers.value = (proj.members ?? []).map((m: any) => ({ id: m.user_id, full_name: m.full_name }))
  } finally { loading.value = false }
})
</script>
