<template>
  <div>
    <!-- Settings sub-nav -->
    <div class="flex gap-3 mb-6 border-b border-gray-200 pb-4">
      <NuxtLink to="/settings/job-title">
        <AppButton size="sm" variant="secondary">Cài đặt cơ bản</AppButton>
      </NuxtLink>
      <NuxtLink to="/settings/user-permission">
        <AppButton size="sm">Phân quyền người dùng</AppButton>
      </NuxtLink>
    </div>

    <h2 class="text-base font-semibold text-gray-800 mb-6">Phân quyền người dùng</h2>

    <div v-if="loading" class="flex justify-center py-12"><AppSpinner /></div>

    <div v-else class="space-y-4">
      <div v-for="member in members" :key="member.id" class="card">
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <span class="text-sm font-bold text-primary-700">{{ getInitials(member.full_name) }}</span>
            </div>
            <div>
              <p class="font-medium text-sm text-gray-900">{{ member.full_name }}</p>
              <p class="text-xs text-gray-500">{{ member.email }}</p>
            </div>
          </div>
          <AppButton size="xs" :loading="savingId === member.id" @click="savePermissions(member)">
            Lưu
          </AppButton>
        </div>

        <!-- Module toggles -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <label
            v-for="mod in availableModules"
            :key="mod.key"
            class="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              :checked="hasModule(member, mod.key)"
              class="h-4 w-4 rounded text-primary-600 border-gray-300 focus:ring-primary-500"
              @change="toggleModule(member, mod.key, ($event.target as HTMLInputElement).checked)"
            />
            <span class="text-sm text-gray-700">{{ mod.label }}</span>
          </label>
        </div>
      </div>

      <div v-if="members.length === 0" class="card text-center py-8 text-sm text-gray-400">
        Không có nhân viên
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserProfile } from '~/composables/useUserProfile'
import { getInitials } from '~/utils/format'
import { handleApiError } from '~/utils/error-handler'
import type { UserPermission } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Phân quyền — Micro ERP' })

const { fetchMemberList } = useUserProfile()
const toast = useToast()
const { post } = useApi()

const loading  = ref(true)
const savingId = ref<number | null>(null)
const members  = ref<any[]>([])

// Module list — keys must match backend module names
const availableModules = [
  { key: 'leave',        label: 'Nghỉ phép' },
  { key: 'timekeeping',  label: 'Chấm công' },
  { key: 'overtime',     label: 'OT' },
  { key: 'recruitment',  label: 'Tuyển dụng' },
  { key: 'project',      label: 'Dự án' },
  { key: 'evaluation',   label: 'Đánh giá' },
  { key: 'assets',       label: 'Tài sản' },
  { key: 'contract',     label: 'Hợp đồng' },
  { key: 'registration', label: 'Đăng ký' },
  { key: 'target',       label: 'Mục tiêu' },
  { key: 'statistic',    label: 'Thống kê' },
  { key: 'member',       label: 'Nhân sự' },
]

function hasModule(member: any, key: string): boolean {
  return (member.modules ?? []).includes(key)
}

function toggleModule(member: any, key: string, checked: boolean) {
  if (!member.modules) member.modules = []
  if (checked) {
    if (!member.modules.includes(key)) member.modules = [...member.modules, key]
  } else {
    member.modules = member.modules.filter((m: string) => m !== key)
  }
}

async function savePermissions(member: any) {
  savingId.value = member.id
  try {
    await post('/setting/update-user-permission', { user_id: member.id, modules: member.modules ?? [] })
    toast.success(`Đã cập nhật quyền cho ${member.full_name}`)
  } catch (err) {
    toast.error(handleApiError(err))
  } finally {
    savingId.value = null
  }
}

onMounted(async () => {
  try {
    const list = await fetchMemberList()
    // Fetch each user's current module permissions
    const permRes = await post<{ permissions: UserPermission[] }>('/setting/get-user-permissions', {}).catch(() => ({ data: { permissions: [] as UserPermission[] } }))
    const permMap = Object.fromEntries(
      (permRes.data?.permissions ?? []).map((p: any) => [p.user_id, p.modules ?? []])
    )
    members.value = list.map((m: any) => ({ ...m, modules: permMap[m.id] ?? [] }))
  } finally {
    loading.value = false
  }
})
</script>
