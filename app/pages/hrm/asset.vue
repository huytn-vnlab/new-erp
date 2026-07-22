<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { Plus, Search, LayoutGrid, List, X, Send, Package } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import Tabs from '~/components/base/Tabs.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Badge from '~/components/base/Badge.vue'
import Select from '~/components/base/Select.vue'
import FilterBar from '~/components/base/FilterBar.vue'
import FieldInput from '~/components/base/FieldInput.vue'
import Avatar from '~/components/base/Avatar.vue'
import SkeletonRow from '~/components/base/SkeletonRow.vue'
import EmptyState from '~/components/base/EmptyState.vue'
import ErrorBanner from '~/components/base/ErrorBanner.vue'
import Pagination from '~/components/base/Pagination.vue'
import DatePicker from '~/components/base/DatePicker.vue'
import AssetDetail from '~/components/asset/AssetDetail.vue'
import type { AssetRow, AssetRequestRow } from '~/types'
import { useAssetStore } from '~/stores/asset'
import type { Asset, AssetCategory, AssetStatus } from '~/mocks/asset'
import { CATEGORY_META, ASSET_STATUS_META, formatVND } from '~/mocks/asset'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { t } = useI18n()

type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

// ── Store ──────────────────────────────────────────────────────────────────────
const assetStore = useAssetStore()
const { user } = useAuth()
// The backend has no role middleware on asset routes at all, so any logged-in
// user could technically approve their own request — gate the UI to
// manager/GM as a client-side safety measure matching the rest of the app.
const isManager = computed(() => {
  const role = user.value?.role_name?.toLowerCase() ?? ''
  return role === 'manager' || role === 'general manager'
})
onMounted(() => {
  fetchAllAssets(1)
  fetchMineAssets(1)
  assetStore.fetchAssetTypes()
  assetStore.fetchAssetRequests()
  assetStore.fetchAssetLogs()
})

const tab = ref<'all' | 'mine' | 'requests' | 'history'>('all')
const viewMode = ref<'grid' | 'list'>('grid')
const search = ref('')
const filterStatus = ref<'all' | AssetStatus>('all')
const filterCategory = ref<'all' | AssetCategory>('all')
const selectedAsset = ref<Asset | null>(null)
const showRequestModal = ref(false)
const showCreateModal = ref(false)
const confirmDeleteAsset = ref<Asset | null>(null)

const { show } = useToast()

// CreateRequestAssetParams has no `reason`/`return` fields on the backend at
// all — a borrow request is just asset_id+user_id, so those inputs (which
// used to be silently discarded on submit) were removed from the form.
const requestForm = ref({ assetId: 0 })
const requestErrors = ref<Record<string, boolean>>({})

function fetchAllAssets(page = 1) {
  assetStore.fetchAssets({ current_page: page, asset_name: search.value.trim() || undefined })
}
function fetchMineAssets(page = 1) {
  assetStore.fetchMineAssets({ current_page: page, user_name: user.value?.name })
}

const historySearch = ref('')
const historyTypeId = ref(0)
const historyBranchId = ref(0)
const historyAssetCode = ref('')
function fetchHistory(page = 1) {
  assetStore.fetchAssetLogs({
    current_page: page,
    user_name: historySearch.value.trim() || undefined,
    asset_type_id: historyTypeId.value || undefined,
    branch_id: historyBranchId.value || undefined,
    asset_code: historyAssetCode.value || undefined,
  })
}

watchDebounced(search, () => fetchAllAssets(1), { debounce: 300 })
watchDebounced(historySearch, () => fetchHistory(1), { debounce: 300 })
watch([historyTypeId, historyBranchId], () => fetchHistory(1))

function viewAssetHistory(a: Asset) {
  selectedAsset.value = null
  historyAssetCode.value = a.id
  historySearch.value = ''
  tab.value = 'history'
  fetchHistory(1)
}

watch(tab, (t) => {
  if (t === 'all') fetchAllAssets(1)
  else if (t === 'mine') fetchMineAssets(1)
  else if (t === 'requests') assetStore.fetchAssetRequests()
  else if (t === 'history') fetchHistory(1)
})

// Backend has 7 raw status codes (cf.AssetStatus) but the UI only has 4 display
// buckets — unknown/not-in-use codes fold into 'broken' rather than silently
// defaulting to 'available' (which would misleadingly show e.g. a lost asset as ready to hand out).
const STATUS_MAP: Record<number, AssetStatus> = {
  1: 'available',   // Free
  2: 'in_use',       // Using
  4: 'maintenance',  // Guaranteeing
  5: 'broken',        // Broken
  3: 'broken',        // Sold
  6: 'broken',        // Lost
  7: 'broken',        // Other
}

function inferCategory(typeName?: string | null): AssetCategory {
  const n = (typeName ?? '').toLowerCase()
  if (n.includes('laptop') || n.includes('macbook')) return 'laptop'
  if (n.includes('màn hình') || n.includes('monitor')) return 'monitor'
  if (n.includes('bàn phím') || n.includes('keyboard')) return 'keyboard'
  if (n.includes('chuột') || n.includes('mouse')) return 'mouse'
  if (n.includes('tai nghe') || n.includes('headphone')) return 'headphone'
  if (n.includes('điện thoại') || n.includes('phone')) return 'phone'
  if (n.includes('tablet') || n.includes('ipad')) return 'tablet'
  return 'other'
}

function mapAssetRow(r: AssetRow): Asset {
  const statusCode = r.status ?? 1
  return {
    id: r.asset_code,
    assetId: r.asset_id,
    name: r.asset_name,
    category: inferCategory(r.asset_type),
    spec: r.description || '',
    serial: '',
    status: STATUS_MAP[statusCode] ?? 'broken',
    statusCode,
    user: r.user_id ? (assetStore.users[String(r.user_id)] ?? null) : null,
    userId: r.user_id,
    branch: r.branch_id ? (assetStore.branches[String(r.branch_id)] ?? '') : '',
    // Backend formats an unset date_of_purchase as Go's zero-value date rather than omitting it.
    date: r.date_of_purchase && !r.date_of_purchase.startsWith('0001') ? r.date_of_purchase : '',
    value: r.purchase_price || 0,
  }
}

const allAssets = computed<Asset[]>(() => assetStore.assets.map(mapAssetRow))
const mineAssets = computed<Asset[]>(() => assetStore.mineAssets.map(mapAssetRow))

const tabItems = computed(() => [
  { value: 'all', label: t('hrm.asset.tabs.all'), count: assetStore.pagination.total_row },
  { value: 'mine', label: t('hrm.asset.tabs.mine'), count: assetStore.minePagination.total_row },
  { value: 'requests', label: t('hrm.asset.tabs.requests'), count: assetStore.requestPagination.total_row },
  { value: 'history', label: t('hrm.asset.tabs.history'), count: assetStore.assetLogPagination.total_row },
])

const statusOpts = computed(() => [
  { value: 'all', label: t('hrm.asset.manage.allStatuses') },
  { value: 'available', label: t('hrm.asset.status.available') },
  { value: 'in_use', label: t('hrm.asset.status.inUse') },
  { value: 'maintenance', label: t('hrm.asset.status.maintenance') },
  { value: 'broken', label: t('hrm.asset.status.broken') },
])

const categoryOpts = computed(() => [
  { value: 'all', label: t('hrm.asset.manage.allCategories') },
  { value: 'laptop', label: t('hrm.asset.category.laptop') },
  { value: 'monitor', label: t('hrm.asset.category.monitor') },
  { value: 'keyboard', label: t('hrm.asset.category.keyboard') },
  { value: 'mouse', label: t('hrm.asset.category.mouse') },
  { value: 'headphone', label: t('hrm.asset.category.headphone') },
  { value: 'phone', label: t('hrm.asset.category.phone') },
  { value: 'tablet', label: t('hrm.asset.category.tablet') },
  { value: 'other', label: t('hrm.asset.category.other') },
])

// Full set of raw backend asset status codes (cf.AssetStatus), used for the create/edit form.
const RAW_STATUS_OPTS = computed(() => [
  { value: 1, label: t('hrm.asset.status.available') },   // Free
  { value: 2, label: t('hrm.asset.status.inUse') },        // Using
  { value: 4, label: t('hrm.asset.status.maintenance') },  // Guaranteeing
  { value: 5, label: t('hrm.asset.status.broken') },       // Broken
  { value: 3, label: t('hrm.asset.status.sold') },         // Sold
  { value: 6, label: t('hrm.asset.status.lost') },         // Lost
  { value: 7, label: t('hrm.asset.status.other') },        // Other
])

const availableAssetOpts = computed(() =>
  allAssets.value.filter(a => a.status === 'available').map(a => ({ value: a.assetId, label: `${a.name} (${a.id})` }))
)

const branchOpts = computed(() =>
  Object.entries(assetStore.branches).map(([id, name]) => ({ value: Number(id), label: name }))
)
const assetTypeOpts = computed(() =>
  assetStore.assetTypes.map(at => ({ value: at.id, label: at.name }))
)
const userOpts = computed(() =>
  Object.entries(assetStore.users).map(([id, name]) => ({ value: Number(id), label: name }))
)
const depreciationOpts = computed(() =>
  Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: t('hrm.asset.createModal.depreciationYear', { n: i + 1 }) }))
)

const filtered = computed(() =>
  allAssets.value.filter(a => {
    const q = search.value.toLowerCase()
    if (q && !a.name.toLowerCase().includes(q) && !a.id.toLowerCase().includes(q) && !(a.user ?? '').toLowerCase().includes(q)) return false
    if (filterStatus.value !== 'all' && a.status !== filterStatus.value) return false
    if (filterCategory.value !== 'all' && a.category !== filterCategory.value) return false
    return true
  })
)

// `total` mirrors the tab badge (server-side count for the current filter/search).
// inUse/available/totalValue are computed from the current page only — the list
// endpoint doesn't return a status breakdown across the full filtered result set.
const stats = computed(() => ({
  total: assetStore.pagination.total_row,
  inUse: allAssets.value.filter(a => a.status === 'in_use').length,
  available: allAssets.value.filter(a => a.status === 'available').length,
  totalValue: allAssets.value.reduce((s, a) => s + a.value, 0),
}))

// Backend RequestAssetStatus: 1=Accept, 2=Reject, 3=Pending
const REQUEST_STATUS_META = computed<Record<number, { label: string; variant: BadgeVariant }>>(() => ({
  1: { label: t('hrm.asset.requestStatus.approved'), variant: 'green' },
  2: { label: t('hrm.asset.requestStatus.rejected'), variant: 'red' },
  3: { label: t('hrm.asset.requestStatus.pending'), variant: 'amber' },
}))

async function submitRequest() {
  requestErrors.value = {}
  if (!requestForm.value.assetId) requestErrors.value.asset = true
  if (Object.keys(requestErrors.value).length) return
  const result = await assetStore.createAssetRequest({
    asset_id: requestForm.value.assetId,
    user_id: user.value?.id ?? 0,
  })
  show(result.ok ? t('hrm.asset.requestModal.submitSuccess') : result.message, result.ok ? 'success' : 'error')
  if (result.ok) {
    showRequestModal.value = false
    requestForm.value = { assetId: 0 }
    if (tab.value === 'requests') assetStore.fetchAssetRequests()
  }
}

const requestActionId = ref<number | null>(null)
// AssetRequestRow.status here is the raw uar.status set at creation (Pending=3
// per cf.RequestAssetStatus) — the edit endpoint uses a DIFFERENT numeric
// scale (cf.AcceptRequestBorrowAsset=1 / DenyRequestBorrow=5) for the action itself.
async function decideRequest(r: AssetRequestRow, approve: boolean) {
  requestActionId.value = r.id
  const result = await assetStore.editAssetRequest({
    id: r.id, user_id: r.created_by, asset_id: r.asset_id, status: approve ? 1 : 5,
  })
  requestActionId.value = null
  show(
    result.ok
      ? (approve ? t('hrm.asset.requests.approveSuccess') : t('hrm.asset.requests.rejectSuccess'))
      : (result.message || t('hrm.asset.requests.actionFail')),
    result.ok ? 'success' : 'error',
  )
  if (result.ok) {
    assetStore.fetchAssetRequests({ current_page: assetStore.requestPagination.current_page })
    if (approve) fetchAllAssets(assetStore.pagination.current_page)
  }
}

const CREATE_FORM_DEFAULT = {
  assetName: '', assetCode: '', assetTypeId: 0, branchId: 0, status: 1, price: '', description: '',
  managedBy: 0, userId: 0, dateOfPurchase: '', licenseEndDate: '', dateStartedUse: '', depreciationPeriod: 0,
}
const createForm = ref({ ...CREATE_FORM_DEFAULT })
const createErrors = ref<Record<string, boolean>>({})
const editingAssetId = ref<number | null>(null)

// Go's zero-value date ("0001-01-01") means "never set" — the create/edit
// form's DatePicker needs either a real ISO date or empty, never that sentinel.
function cleanDate(s: string | null | undefined): string {
  if (!s || s.startsWith('0001')) return ''
  return s.slice(0, 10)
}

function openCreateAsset() {
  editingAssetId.value = null
  createForm.value = { ...CREATE_FORM_DEFAULT }
  createErrors.value = {}
  showCreateModal.value = true
}

// UpdateAsset does an unconditional column overwrite (not an upsert-if-set) —
// license_end_date/date_started_use/depreciation_period must be pre-filled
// from the already-loaded row or a real edit would silently wipe them.
function openEditAsset(a: Asset) {
  const raw = assetStore.assets.find(r => r.asset_id === a.assetId) ?? assetStore.mineAssets.find(r => r.asset_id === a.assetId)
  if (!raw) { show(t('hrm.asset.detail.editNotFound'), 'error'); return }
  editingAssetId.value = raw.asset_id
  createForm.value = {
    assetName: raw.asset_name, assetCode: raw.asset_code,
    assetTypeId: raw.asset_type_id ?? 0, branchId: raw.branch_id ?? 0,
    status: raw.status ?? 1, price: raw.purchase_price ? String(raw.purchase_price) : '',
    description: raw.description ?? '', managedBy: raw.managed_by ?? 0, userId: raw.user_id ?? 0,
    dateOfPurchase: cleanDate(raw.date_of_purchase), licenseEndDate: cleanDate(raw.license_end_date),
    dateStartedUse: cleanDate(raw.date_started_use), depreciationPeriod: raw.depreciation_period ?? 0,
  }
  createErrors.value = {}
  selectedAsset.value = null
  showCreateModal.value = true
}

async function submitCreate() {
  createErrors.value = {}
  if (!createForm.value.assetName.trim()) createErrors.value.assetName = true
  if (!createForm.value.assetCode.trim()) createErrors.value.assetCode = true
  if (!createForm.value.assetTypeId) createErrors.value.assetTypeId = true
  if (!createForm.value.branchId) createErrors.value.branchId = true
  if (!createForm.value.managedBy) createErrors.value.managedBy = true
  if (Object.keys(createErrors.value).length) return
  const payload = {
    asset_name: createForm.value.assetName.trim(),
    asset_code: createForm.value.assetCode.trim(),
    asset_type_id: createForm.value.assetTypeId,
    branch_id: createForm.value.branchId,
    managed_by: createForm.value.managedBy,
    user_id: createForm.value.userId || undefined,
    status: createForm.value.status,
    description: createForm.value.description,
    purchase_price: createForm.value.price ? Number(createForm.value.price) : undefined,
    date_of_purchase: createForm.value.dateOfPurchase || undefined,
    license_end_date: createForm.value.licenseEndDate || undefined,
    date_started_use: createForm.value.dateStartedUse || undefined,
    depreciation_period: createForm.value.depreciationPeriod || undefined,
  }
  const result = editingAssetId.value
    ? await assetStore.updateAsset({ ...payload, id: editingAssetId.value })
    : await assetStore.createAsset(payload)
  show(
    result.ok ? (editingAssetId.value ? t('hrm.asset.createModal.editSuccess') : t('hrm.asset.createModal.submitSuccess')) : result.message,
    result.ok ? 'success' : 'error',
  )
  if (result.ok) {
    showCreateModal.value = false
    createForm.value = { ...CREATE_FORM_DEFAULT }
    editingAssetId.value = null
    fetchAllAssets(assetStore.pagination.current_page)
  }
}

async function handleDeleteAsset(a: Asset) {
  const result = await assetStore.deleteAsset(a.assetId)
  show(result.ok ? t('hrm.asset.detail.deleteSuccess') : result.message, result.ok ? 'success' : 'error')
  if (result.ok) {
    selectedAsset.value = null
    fetchAllAssets(assetStore.pagination.current_page)
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="t('hrm.asset.pageEyebrow')"
      :title="t('hrm.asset.pageTitle')"
      :description="t('hrm.asset.pageDescription')"
    >
      <template #actions>
        <Btn variant="outline" @click="showRequestModal = true"><Plus :size="14" /> {{ t('hrm.asset.requestBtn') }}</Btn>
        <Btn variant="primary" @click="openCreateAsset"><Plus :size="14" /> {{ t('hrm.asset.createBtn') }}</Btn>
      </template>
    </PageHeader>

    <!-- Tabs -->
    <Tabs :model-value="tab" :items="tabItems" @update:model-value="tab = $event as typeof tab" />

    <!-- ALL ASSETS -->
    <template v-if="tab === 'all'">
      <ErrorBanner v-if="assetStore.error" :message="assetStore.error" @retry="fetchAllAssets(assetStore.pagination.current_page)" />

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat :label="t('hrm.asset.manage.statTotal')" :value="stats.total" :sublabel="t('hrm.asset.manage.statTotalSub')" accent="primary" :delay="40" />
        <MiniStat :label="t('hrm.asset.manage.statInUse')" :value="stats.inUse" :sublabel="t('hrm.asset.manage.statInUseSub')" accent="violet" :delay="80" />
        <MiniStat :label="t('hrm.asset.manage.statAvailable')" :value="stats.available" :sublabel="t('hrm.asset.manage.statAvailableSub')" accent="green" :delay="120" />
        <MiniStat :label="t('hrm.asset.manage.statValue')" :value="formatVND(stats.totalValue)" :sublabel="t('hrm.asset.manage.statValueSub')" accent="amber" :delay="160" />
      </div>

      <!-- Filter bar -->
      <FilterBar>
        <FieldInput v-model="search" :icon="Search" :placeholder="t('hrm.asset.manage.searchPh')" :width="240" />
        <Select v-model="filterCategory" :options="categoryOpts" :width="190" />
        <Select v-model="filterStatus" :options="statusOpts" :width="170" />
        <div class="flex-1" />
        <div class="flex items-center gap-1 h-9 p-1 bg-muted rounded-lg">
          <button :class="['h-full px-3 rounded-md transition-colors text-[13px] font-medium', viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']" @click="viewMode = 'grid'"><LayoutGrid :size="14" /></button>
          <button :class="['h-full px-3 rounded-md transition-colors text-[13px] font-medium', viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']" @click="viewMode = 'list'"><List :size="14" /></button>
        </div>
      </FilterBar>

      <!-- Grid view -->
      <template v-if="viewMode === 'grid'">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <button
            v-for="(a, i) in filtered" :key="a.id"
            class="card-surface text-left p-4 space-y-3 rise hover:shadow-md hover:-translate-y-0.5 transition-all"
            :style="`animation-delay: ${i * 30}ms`"
            @click="selectedAsset = a"
          >
            <div class="flex items-start justify-between gap-2">
              <span class="h-10 w-10 rounded-lg flex items-center justify-center text-[20px] shrink-0" :style="{ background: `${CATEGORY_META[a.category].color}22`, color: CATEGORY_META[a.category].color }">{{ CATEGORY_META[a.category].glyph }}</span>
              <Badge :variant="ASSET_STATUS_META[a.status].variant" class="text-[10.5px]">{{ t(ASSET_STATUS_META[a.status].labelKey) }}</Badge>
            </div>
            <div>
              <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">{{ t(CATEGORY_META[a.category].labelKey) }} · <span class="font-mono">{{ a.id }}</span></p>
              <p class="font-bold text-[14px] text-foreground truncate">{{ a.name }}</p>
              <p class="text-[12px] text-muted-foreground truncate">{{ a.spec }}</p>
            </div>
            <div class="border-t border-border/60 pt-2.5">
              <div class="flex items-center justify-between text-[11.5px]">
                <span class="text-muted-foreground">{{ a.user ?? t('hrm.asset.manage.unassigned') }}</span>
                <span class="font-bold tabular-nums text-primary">{{ formatVND(a.value) }}</span>
              </div>
            </div>
          </button>
          <div v-if="!assetStore.loading && filtered.length === 0" class="col-span-full">
            <EmptyState :icon="Package" :title="t('hrm.asset.manage.emptyTitle')" :description="t('hrm.asset.manage.emptyDesc')" />
          </div>
        </div>
        <div class="card-surface overflow-hidden">
          <Pagination
            :page="assetStore.pagination.current_page"
            :total="assetStore.pagination.total_row"
            :per-page="assetStore.pagination.row_per_page"
            @change="fetchAllAssets($event)"
          />
        </div>
      </template>

      <!-- List view -->
      <template v-else>
        <div class="card-surface overflow-hidden rise">
          <div class="overflow-x-auto">
            <table class="w-full text-[13px]" style="min-width: 840px">
              <thead>
                <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold border-b border-border/70">
                  <th class="text-left py-3 px-5">{{ t('hrm.asset.manage.colAsset') }}</th>
                  <th class="text-left py-3 px-3">{{ t('hrm.asset.manage.colBranch') }}</th>
                  <th class="text-left py-3 px-3">{{ t('hrm.asset.manage.colUser') }}</th>
                  <th class="text-center py-3 px-3">{{ t('hrm.asset.manage.colStatus') }}</th>
                  <th class="text-right py-3 px-3">{{ t('hrm.asset.manage.colValue') }}</th>
                  <th class="text-left py-3 px-5">{{ t('hrm.asset.manage.colDate') }}</th>
                </tr>
              </thead>
              <tbody>
                <SkeletonRow v-if="assetStore.loading" :cols="6" :rows="5" />
                <tr v-else-if="filtered.length === 0">
                  <td colspan="6" class="p-0">
                    <EmptyState :icon="Package" :title="t('hrm.asset.manage.emptyTitle')" :description="t('hrm.asset.manage.emptyDesc')" />
                  </td>
                </tr>
                <template v-else>
                  <tr v-for="a in filtered" :key="a.id" class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" @click="selectedAsset = a">
                    <td class="py-3 px-5">
                      <div class="flex items-center gap-2.5">
                        <span class="h-8 w-8 rounded-md flex items-center justify-center shrink-0" :style="{ background: `${CATEGORY_META[a.category].color}18`, color: CATEGORY_META[a.category].color }">{{ CATEGORY_META[a.category].glyph }}</span>
                        <div>
                          <p class="font-semibold text-foreground">{{ a.name }}</p>
                          <p class="text-[11px] font-mono text-muted-foreground">{{ a.id }} · {{ a.serial }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-3 text-foreground/80">{{ a.branch }}</td>
                    <td class="py-3 px-3">
                      <span v-if="a.user" class="flex items-center gap-1.5"><Avatar :name="a.user" :size="22" />{{ a.user }}</span>
                      <span v-else class="italic text-muted-foreground">—</span>
                    </td>
                    <td class="py-3 px-3 text-center"><Badge :variant="ASSET_STATUS_META[a.status].variant" dot>{{ t(ASSET_STATUS_META[a.status].labelKey) }}</Badge></td>
                    <td class="py-3 px-3 text-right font-bold tabular-nums text-primary">{{ formatVND(a.value) }}</td>
                    <td class="py-3 px-5 font-mono text-muted-foreground text-[12px]">{{ a.date }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <Pagination
            :page="assetStore.pagination.current_page"
            :total="assetStore.pagination.total_row"
            :per-page="assetStore.pagination.row_per_page"
            @change="fetchAllAssets($event)"
          />
        </div>
      </template>
    </template>

    <!-- MINE -->
    <template v-else-if="tab === 'mine'">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rise">
        <template v-if="assetStore.mineLoading">
          <div v-for="i in 3" :key="i" class="card-surface p-4 h-[120px] animate-pulse bg-muted/40" />
        </template>
        <template v-else>
          <button
            v-for="(a, i) in mineAssets" :key="a.id"
            class="card-surface text-left p-4 space-y-3 hover:shadow-md transition-all"
            :style="`animation-delay: ${i * 40}ms`"
            @click="selectedAsset = a"
          >
            <div class="flex items-start justify-between">
              <span class="h-10 w-10 rounded-lg flex items-center justify-center text-[20px] shrink-0" :style="{ background: `${CATEGORY_META[a.category].color}22`, color: CATEGORY_META[a.category].color }">{{ CATEGORY_META[a.category].glyph }}</span>
              <Badge :variant="ASSET_STATUS_META[a.status].variant">{{ t(ASSET_STATUS_META[a.status].labelKey) }}</Badge>
            </div>
            <div>
              <p class="font-bold text-[14px] text-foreground">{{ a.name }}</p>
              <p class="text-[12px] text-muted-foreground">{{ a.spec }}</p>
            </div>
            <div class="text-[11.5px] text-muted-foreground font-mono">{{ t('hrm.asset.mine.issuedDate') }} {{ a.date }}</div>
          </button>
          <div v-if="mineAssets.length === 0" class="col-span-full">
            <EmptyState :icon="Package" :title="t('hrm.asset.mine.emptyTitle')" />
          </div>
        </template>
      </div>
      <div v-if="assetStore.minePagination.total_row > 0" class="card-surface overflow-hidden">
        <Pagination
          :page="assetStore.minePagination.current_page"
          :total="assetStore.minePagination.total_row"
          :per-page="assetStore.minePagination.row_per_page"
          @change="fetchMineAssets($event)"
        />
      </div>
    </template>

    <!-- REQUESTS -->
    <template v-else-if="tab === 'requests'">
      <div class="card-surface overflow-hidden rise">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 700px">
            <thead>
              <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold border-b border-border/70">
                <th class="text-left py-3 px-5">{{ t('hrm.asset.requests.colAsset') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.asset.requests.colRequester') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.asset.requests.colType') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.asset.requests.colBranch') }}</th>
                <th class="text-center py-3 px-3">{{ t('hrm.asset.requests.colStatus') }}</th>
                <th v-if="isManager" class="text-right py-3 px-5">{{ t('hrm.asset.requests.colAction') }}</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRow v-if="assetStore.requestsLoading" :cols="5" :rows="4" />
              <tr v-else-if="assetStore.requests.length === 0">
                <td :colspan="isManager ? 6 : 5" class="p-0">
                  <EmptyState :icon="Package" :title="t('hrm.asset.requests.emptyTitle')" />
                </td>
              </tr>
              <tr v-for="r in assetStore.requests" v-else :key="r.id" class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                <td class="py-3 px-5">
                  <p class="font-semibold text-foreground">{{ r.asset_name }}</p>
                  <p class="text-[11px] font-mono text-muted-foreground">{{ r.asset_code }}</p>
                </td>
                <td class="py-3 px-3"><div class="flex items-center gap-2"><Avatar :name="assetStore.requestUsers[String(r.created_by)] ?? '?'" :size="26" />{{ assetStore.requestUsers[String(r.created_by)] ?? '—' }}</div></td>
                <td class="py-3 px-3 text-foreground/80">{{ r.asset_type }}</td>
                <td class="py-3 px-3 text-foreground/80">{{ r.branch }}</td>
                <td class="py-3 px-3 text-center">
                  <Badge :variant="REQUEST_STATUS_META[r.status]?.variant ?? 'gray'" dot>{{ REQUEST_STATUS_META[r.status]?.label ?? r.status }}</Badge>
                </td>
                <td v-if="isManager" class="py-3 px-5 text-right">
                  <div v-if="r.status === 3" class="flex items-center justify-end gap-1.5">
                    <Btn variant="outline" size="xs" :disabled="requestActionId === r.id" @click="decideRequest(r, false)">{{ t('hrm.asset.requests.reject') }}</Btn>
                    <Btn variant="success" size="xs" :disabled="requestActionId === r.id" @click="decideRequest(r, true)">{{ t('hrm.asset.requests.approve') }}</Btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-5 py-3 border-t border-border/70 bg-muted/10 text-[12.5px] text-muted-foreground">
          <span class="font-semibold text-amber-600">{{ assetStore.requests.filter(r => r.status === 3).length }}</span> {{ t('hrm.asset.requests.pendingCountSuffix') }}
        </div>
        <Pagination
          :page="assetStore.requestPagination.current_page"
          :total="assetStore.requestPagination.total_row"
          :per-page="assetStore.requestPagination.row_per_page"
          @change="assetStore.fetchAssetRequests({ current_page: $event })"
        />
      </div>
    </template>

    <!-- HISTORY -->
    <template v-else-if="tab === 'history'">
      <div class="space-y-4 rise">
        <!-- Filter bar -->
        <FilterBar>
          <FieldInput v-model="historySearch" :icon="Search" :placeholder="t('hrm.asset.history.searchPh')" :width="240" />
          <Select v-model="historyTypeId" :options="[{ value: 0, label: t('hrm.asset.history.allTypes') }, ...assetTypeOpts]" :width="190" />
          <Select v-model="historyBranchId" :options="[{ value: 0, label: t('hrm.asset.history.allBranches') }, ...branchOpts]" :width="170" />
          <div class="flex-1" />
          <Badge v-if="historyAssetCode" variant="primary" class="cursor-pointer" @click="historyAssetCode = ''; fetchHistory(1)">
            {{ t('hrm.asset.history.filteredByAsset', { code: historyAssetCode }) }} <X :size="11" class="ml-1" />
          </Badge>
        </FilterBar>

        <!-- Table -->
        <div class="card-surface overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-[13px]" style="min-width: 780px">
              <thead>
                <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold border-b border-border/70">
                  <th class="text-left py-3 px-5">{{ t('hrm.asset.history.colType') }}</th>
                  <th class="text-left py-3 px-3">{{ t('hrm.asset.history.colCode') }}</th>
                  <th class="text-left py-3 px-3">{{ t('hrm.asset.history.colUser') }}</th>
                  <th class="text-left py-3 px-3">{{ t('hrm.asset.history.colBranch') }}</th>
                  <th class="text-left py-3 px-3">{{ t('hrm.asset.history.colStart') }}</th>
                  <th class="text-left py-3 px-5">{{ t('hrm.asset.history.colEnd') }}</th>
                </tr>
              </thead>
              <tbody>
                <SkeletonRow v-if="assetStore.assetLogsLoading" :cols="6" :rows="5" />
                <tr v-else-if="assetStore.assetLogs.length === 0">
                  <td colspan="6" class="p-0">
                    <EmptyState :icon="Package" :title="t('hrm.asset.history.emptyTitle')" />
                  </td>
                </tr>
                <tr v-for="(h, i) in assetStore.assetLogs" v-else :key="i" class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td class="py-3 px-5 text-foreground/80">{{ h.asset_type_name }}</td>
                  <td class="py-3 px-3 font-mono text-[12px] text-muted-foreground">{{ h.asset_code }}</td>
                  <td class="py-3 px-3"><div class="flex items-center gap-2"><Avatar :name="`${h.first_name} ${h.last_name}`.trim() || '?'" :size="26" />{{ `${h.first_name} ${h.last_name}`.trim() || '—' }}</div></td>
                  <td class="py-3 px-3 text-foreground/80">{{ assetStore.branches[String(h.branch_id)] ?? '' }}</td>
                  <td class="py-3 px-3 font-mono text-muted-foreground text-[12px]">{{ !h.start_day_using?.startsWith('0001') ? h.start_day_using?.slice(0, 10) : '—' }}</td>
                  <td class="py-3 px-5 font-mono text-muted-foreground text-[12px]">{{ !h.end_day_using?.startsWith('0001') ? h.end_day_using?.slice(0, 10) : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Pagination
            :page="assetStore.assetLogPagination.current_page"
            :total="assetStore.assetLogPagination.total_row"
            :per-page="assetStore.assetLogPagination.row_per_page"
            @change="fetchHistory($event)"
          />
        </div>
      </div>
    </template>

    <!-- ASSET DETAIL MODAL -->
    <Teleport to="body">
      <AssetDetail
        v-if="selectedAsset" :asset="selectedAsset" :can-manage="isManager"
        @close="selectedAsset = null" @edit="openEditAsset" @delete="confirmDeleteAsset = $event" @view-history="viewAssetHistory"
      />
    </Teleport>

    <!-- DELETE CONFIRM MODAL -->
    <Teleport to="body">
      <div v-if="confirmDeleteAsset" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="confirmDeleteAsset = null" />
        <div class="relative card-surface rise w-full max-w-sm overflow-hidden">
          <div class="p-5">
            <h3 class="font-heading font-bold text-[15px] mb-2">{{ t('hrm.asset.detail.deleteConfirmTitle') }}</h3>
            <p class="text-[13.5px] text-foreground/80">{{ t('hrm.asset.detail.deleteConfirmMessage', { name: confirmDeleteAsset.name }) }}</p>
          </div>
          <div class="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
            <Btn variant="outline" size="sm" @click="confirmDeleteAsset = null">{{ t('common.cancel') }}</Btn>
            <Btn variant="danger" size="sm" @click="handleDeleteAsset(confirmDeleteAsset); confirmDeleteAsset = null">{{ t('hrm.asset.detail.delete') }}</Btn>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- REQUEST MODAL -->
    <Teleport to="body">
      <div v-if="showRequestModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="showRequestModal = false" />
        <div class="relative card-surface rise w-full max-w-md overflow-hidden">
          <div class="p-5 border-b border-border/70 flex items-center justify-between">
            <h3 class="font-heading font-bold text-[16px]">{{ t('hrm.asset.requestModal.title') }}</h3>
            <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="showRequestModal = false"><X :size="14" /></button>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.requestModal.assetLabel') }} <span class="text-red-400">*</span></label>
              <Select v-model="requestForm.assetId" :options="availableAssetOpts" :placeholder="t('hrm.asset.requestModal.assetPh')" :class="requestErrors.asset ? 'ring-1 ring-red-400 rounded-md' : ''" style="width: 100%" />
            </div>
          </div>
          <div class="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
            <Btn variant="outline" size="sm" @click="showRequestModal = false">{{ t('common.cancel') }}</Btn>
            <Btn variant="primary" size="sm" @click="submitRequest"><Send :size="13" /> {{ t('hrm.asset.requestModal.submit') }}</Btn>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- CREATE ASSET MODAL -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="showCreateModal = false" />
        <div class="relative card-surface rise w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
          <div class="p-5 border-b border-border/70 flex items-center justify-between shrink-0">
            <h3 class="font-heading font-bold text-[16px]">{{ editingAssetId ? t('hrm.asset.createModal.editTitle') : t('hrm.asset.createModal.title') }}</h3>
            <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="showCreateModal = false"><X :size="14" /></button>
          </div>
          <div class="p-5 space-y-4 overflow-y-auto overscroll-contain scrollbar-thin">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.nameLabel') }} <span class="text-red-400">*</span></label>
              <input v-model="createForm.assetName" type="text" :placeholder="t('hrm.asset.createModal.namePh')" :class="['w-full h-10 px-3 rounded-lg border bg-card text-[13px] outline-none', createErrors.assetName ? 'border-red-400' : 'border-border focus:border-primary/60']">
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.codeLabel') }} <span class="text-red-400">*</span></label>
              <input v-model="createForm.assetCode" type="text" :placeholder="t('hrm.asset.createModal.codePh')" :class="['w-full h-10 px-3 rounded-lg border bg-card text-[13px] outline-none font-mono', createErrors.assetCode ? 'border-red-400' : 'border-border focus:border-primary/60']">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.typeLabel') }} <span class="text-red-400">*</span></label>
                <Select v-model="createForm.assetTypeId" :options="assetTypeOpts" :placeholder="t('hrm.asset.createModal.typePh')" :class="createErrors.assetTypeId ? 'ring-1 ring-red-400 rounded-md' : ''" style="width: 100%" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.branchLabel') }} <span class="text-red-400">*</span></label>
                <Select v-model="createForm.branchId" :options="branchOpts" :placeholder="t('hrm.asset.createModal.branchPh')" :class="createErrors.branchId ? 'ring-1 ring-red-400 rounded-md' : ''" style="width: 100%" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.managedByLabel') }} <span class="text-red-400">*</span></label>
                <Select v-model="createForm.managedBy" :options="userOpts" :placeholder="t('hrm.asset.createModal.managedByPh')" :class="createErrors.managedBy ? 'ring-1 ring-red-400 rounded-md' : ''" style="width: 100%" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.userLabel') }}</label>
                <Select v-model="createForm.userId" :options="userOpts" :placeholder="t('hrm.asset.createModal.userPh')" style="width: 100%" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.statusLabel') }}</label>
                <Select v-model="createForm.status" :options="RAW_STATUS_OPTS" style="width: 100%" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.valueLabel') }}</label>
                <input v-model="createForm.price" type="number" min="0" placeholder="0" class="w-full h-10 px-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.purchaseDateLabel') }}</label>
                <DatePicker v-model="createForm.dateOfPurchase" width="100%" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.startUseDateLabel') }}</label>
                <DatePicker v-model="createForm.dateStartedUse" width="100%" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.warrantyDateLabel') }}</label>
                <DatePicker v-model="createForm.licenseEndDate" width="100%" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.depreciationLabel') }}</label>
                <Select v-model="createForm.depreciationPeriod" :options="[{ value: 0, label: t('hrm.asset.createModal.depreciationNone') }, ...depreciationOpts]" style="width: 100%" />
              </div>
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{{ t('hrm.asset.createModal.descriptionLabel') }}</label>
              <textarea v-model="createForm.description" rows="2" :placeholder="t('hrm.asset.createModal.descriptionPh')" class="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] outline-none resize-none focus:border-primary/60 placeholder:text-muted-foreground/45" />
            </div>
          </div>
          <div class="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2 shrink-0">
            <Btn variant="outline" size="sm" @click="showCreateModal = false">{{ t('common.cancel') }}</Btn>
            <Btn variant="primary" size="sm" @click="submitCreate"><Plus :size="13" /> {{ editingAssetId ? t('hrm.asset.createModal.editSubmit') : t('hrm.asset.createModal.submit') }}</Btn>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
