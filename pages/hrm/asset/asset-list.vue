<template>
  <div>
    <!-- Tabs: company assets / my assets / requests -->
    <div class="mb-4 border-b border-gray-200">
      <nav class="flex gap-6">
        <button v-for="tab in tabs" :key="tab.key"
          :class="['pb-3 text-sm font-medium border-b-2 transition-colors', activeTab === tab.key ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
          @click="switchTab(tab.key)">{{ tab.label }}</button>
      </nav>
    </div>

    <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
      <AppInput v-model="search" placeholder="Tìm tài sản..." class="w-56">
        <template #prefix>
          <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </template>
      </AppInput>
      <div class="flex gap-2">
        <NuxtLink v-if="isAdminUser" to="/hrm/asset/create-asset">
          <AppButton size="sm">+ Thêm tài sản</AppButton>
        </NuxtLink>
        <AppButton size="sm" variant="secondary" @click="showRequestModal = true">Yêu cầu mượn</AppButton>
      </div>
    </div>

    <AppTable :columns="columns" :rows="filteredAssets" :loading="loading" :empty-text="$t('common.noData')">
      <template #cell-status="{ value }">
        <AppBadge :variant="assetStatusVariant(value)">{{ assetStatusLabel(value) }}</AppBadge>
      </template>
      <template #cell-user_id="{ row }">
        <span class="text-sm text-gray-700">{{ row.user_id ? (assetsStore.users?.[row.user_id] || `#${row.user_id}`) : '—' }}</span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <AppButton v-if="isAdminUser" size="xs" variant="secondary"
            @click="$router.push(`/hrm/asset/edit-asset/${row.asset_id}`)">
            {{ $t('common.edit') }}
          </AppButton>
          <AppButton v-if="row.status === 0" size="xs" @click="requestAsset(row)">Mượn</AppButton>
        </div>
      </template>

      <template #footer>
        <AppPagination
          :current-page="assetsStore.pagination.current_page"
          :total-row="assetsStore.pagination.total_row"
          :row-per-page="assetsStore.pagination.row_per_page"
          @change="assetsStore.fetchAssets($event)"
        />
      </template>
    </AppTable>

    <!-- Borrow request modal -->
    <AppModal v-model="showRequestModal" title="Yêu cầu mượn tài sản" size="sm">
      <div class="space-y-3">
        <p v-if="selectedAsset" class="text-sm text-gray-700">
          Tài sản: <strong>{{ selectedAsset.name }}</strong>
        </p>
        <AppInput v-model="requestNote" label="Ghi chú" placeholder="Lý do mượn..." />
        <DatePicker v-model="requestReturnDate" label="Ngày trả dự kiến" />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showRequestModal = false">{{ $t('common.cancel') }}</AppButton>
        <AppButton :loading="submitting" @click="submitRequest">Gửi yêu cầu</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { useAssetsStore } from '~/stores/assets'
import { isAdmin } from '~/utils/permission'
import { handleApiError } from '~/utils/error-handler'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useHead({ title: 'Tài sản — Micro ERP' })

const assetsStore = useAssetsStore()
const { user }    = useAuth()
const toast       = useToast()
const { post }    = useApi()

const loading     = ref(true)
const activeTab   = ref('all')
const search      = ref('')
const showRequestModal = ref(false)
const submitting  = ref(false)
const selectedAsset    = ref<any>(null)
const requestNote      = ref('')
const requestReturnDate = ref('')

const isAdminUser = computed(() => isAdmin(user.value))

const tabs = [
  { key: 'all',      label: 'Tất cả tài sản' },
  { key: 'mine',     label: 'Tài sản của tôi' },
  { key: 'requests', label: 'Yêu cầu mượn' },
]

const columns = [
  { key: 'asset_name',  label: 'Tên tài sản' },
  { key: 'asset_type',  label: 'Phân loại' },
  { key: 'asset_code',  label: 'Mã / Serial' },
  { key: 'user_id',     label: 'Đang dùng' },
  { key: 'status',      label: 'Trạng thái' },
  { key: 'actions',     label: '' },
]

const assetStatusVariant = (s: number) =>
  s === 0 ? 'green' : s === 1 ? 'yellow' : s === 2 ? 'red' : 'gray'

const assetStatusLabel = (s: number) =>
  ({ 0: 'Còn trống', 1: 'Đang dùng', 2: 'Hỏng', 3: 'Đã thanh lý' }[s] ?? '—')

const filteredAssets = computed(() => {
  let rows = assetsStore.assets
  if (activeTab.value === 'mine') rows = rows.filter(a => a.user_id === user.value?.id)
  if (search.value) rows = rows.filter(a => a.asset_name?.toLowerCase().includes(search.value.toLowerCase()))
  return rows
})

async function switchTab(key: string) {
  activeTab.value = key
  loading.value = true
  await assetsStore.fetchAssets()
  loading.value = false
}

function requestAsset(asset: any) {
  selectedAsset.value = asset
  requestNote.value = ''
  requestReturnDate.value = ''
  showRequestModal.value = true
}

async function submitRequest() {
  submitting.value = true
  try {
    await post('/asset/create-user-request-asset', {
      asset_id:    selectedAsset.value?.asset_id,
      note:        requestNote.value,
      return_date: requestReturnDate.value || null,
    })
    toast.success('Yêu cầu mượn tài sản đã được gửi')
    showRequestModal.value = false
    selectedAsset.value = null
  } catch (err) {
    toast.error(handleApiError(err))
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await assetsStore.fetchAssets()
  loading.value = false
})
</script>
