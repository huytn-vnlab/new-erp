<template>
  <div class="max-w-3xl mx-auto">
    <div v-if="loading" class="flex justify-center py-16"><AppSpinner /></div>

    <template v-else-if="contracts.length > 0 || userInfo">
      <!-- User info -->
      <div v-if="userInfo" class="card mb-4">
        <div class="flex items-center gap-4">
          <div class="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span class="text-lg font-bold text-primary-700">{{ getInitials(userInfo.full_name) }}</span>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ userInfo.full_name }}</h2>
            <p class="text-sm text-gray-500">{{ userInfo.email }}</p>
            <p class="text-sm text-gray-500">{{ userInfo.job_title ?? 'Chưa có chức danh' }}</p>
          </div>
        </div>
      </div>

      <!-- Contracts list -->
      <div class="space-y-4">
        <div
          v-for="contract in contracts"
          :key="contract.id"
          class="card"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="font-semibold text-gray-900">{{ contract.contract_number }}</p>
              <p class="text-sm text-gray-500">{{ contract.contract_type_name }}</p>
            </div>
            <span
              class="badge"
              :class="{
                'badge-warning': contract.status === 0,
                'badge-success': contract.status === 1,
                'badge-error':   contract.status >= 2,
              }"
            >
              {{ contractStatusLabel(contract.status) }}
            </span>
          </div>
          <dl class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt class="text-gray-500">Ngày bắt đầu</dt>
              <dd class="font-medium">{{ formatDate(contract.start_date) }}</dd>
            </div>
            <div>
              <dt class="text-gray-500">Ngày kết thúc</dt>
              <dd class="font-medium">{{ contract.end_date ? formatDate(contract.end_date) : 'Không xác định' }}</dd>
            </div>
            <div>
              <dt class="text-gray-500">Lương</dt>
              <dd class="font-medium">{{ contract.salary ? formatCurrency(contract.salary) : '—' }}</dd>
            </div>
          </dl>
          <p v-if="contract.note" class="text-sm text-gray-500 mt-3">{{ contract.note }}</p>
        </div>
      </div>

      <div class="mt-6">
        <AppButton variant="secondary" @click="$router.back()">← Quay lại</AppButton>
      </div>
    </template>

    <div v-else class="card text-center py-12 text-sm text-gray-400">Không có hợp đồng</div>
  </div>
</template>

<script setup lang="ts">
import { getInitials, formatCurrency } from '~/utils/format'
import { formatDate } from '~/utils/date'
import type { UserProfile, Contract } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Hợp đồng nhân viên — Micro ERP' })

const route = useRoute()
const { post } = useApi()

const loading   = ref(true)
const contracts = ref<any[]>([])
const userInfo  = ref<any>(null)

function contractStatusLabel(s: number) {
  return ['Chờ ký', 'Có hiệu lực', 'Hết hạn', 'Chấm dứt'][s] ?? 'N/A'
}

onMounted(async () => {
  try {
    const userId = Number(route.params.id)
    const [profileRes, contractRes] = await Promise.all([
      post<{ profile: UserProfile }>('/user/get-user-profile', { user_id: userId }),
      post<{ contracts: Contract[] }>('/contract/get-user-contracts', { user_id: userId }),
    ])
    userInfo.value  = profileRes.data?.profile ?? null
    contracts.value = contractRes.data?.contracts ?? []
  } finally { loading.value = false }
})
</script>
