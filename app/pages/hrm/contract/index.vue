<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { Search, FileText, LogIn, FileX, Upload, Trash2, Pencil } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import Select from '~/components/base/Select.vue'
import FilterBar from '~/components/base/FilterBar.vue'
import FieldInput from '~/components/base/FieldInput.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import SkeletonRow from '~/components/base/SkeletonRow.vue'
import EmptyState from '~/components/base/EmptyState.vue'
import ErrorBanner from '~/components/base/ErrorBanner.vue'
import Tabs from '~/components/base/Tabs.vue'
import Pagination from '~/components/base/Pagination.vue'
import Modal from '~/components/base/Modal.vue'
import ContractForm from '~/components/contract/ContractForm.vue'
import type { ContractRow, ContractType } from '~/types'
import { useContractStore } from '~/stores/contract'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { t } = useI18n()
const contractStore = useContractStore()
const route = useRoute()
const router = useRouter()
const { show } = useToast()

const tab = ref<'list' | 'create' | 'types'>('list')
const tabItems = computed(() => [
  { value: 'list', label: t('hrm.contract.tabs.list') },
  { value: 'create', label: t('hrm.contract.tabs.create') },
  { value: 'types', label: t('hrm.contract.tabs.types') },
])

// ── Renew: Create tab pre-filled via query params from the detail page ─────
const renewUserId = ref<number | null>(null)
const renewUserName = ref('')

onMounted(() => {
  fetchList(1)
  contractStore.fetchBranches()
  contractStore.fetchContractTypes()

  if (route.query.tab === 'create') {
    tab.value = 'create'
    if (route.query.renewUserId) renewUserId.value = Number(route.query.renewUserId)
    if (route.query.renewUserName) renewUserName.value = String(route.query.renewUserName)
    router.replace({ query: {} })
  }
})

type ContractDisplay = {
  id: number
  userId: number
  user: string
  branch: string
  start: string
  end: string | null
  joined: string
  type: string
}

const search = ref('')
const filterBranch = ref('all')
const filterType = ref('all')

const branchNameById = computed(() => {
  const map: Record<number, string> = {}
  for (const b of contractStore.branches) map[b.id] = b.name
  return map
})

function mapContractRow(r: ContractRow): ContractDisplay {
  return {
    id: r.id,
    userId: r.user_id,
    user: `${r.first_name} ${r.last_name}`.trim(),
    branch: branchNameById.value[r.branch_id] ?? '',
    start: r.contract_start_date ?? '',
    end: r.contract_end_date ?? null,
    joined: r.company_joined_date ?? '',
    type: r.contract_type_name ?? '',
  }
}

const allContracts = computed<ContractDisplay[]>(() => contractStore.contracts.map(mapContractRow))

const branchOpts = computed(() => [
  { value: 'all', label: t('hrm.contract.list.allBranches') },
  ...contractStore.branches.map(b => ({ value: b.id, label: b.name })),
])

const typeOpts = computed(() => [
  { value: 'all', label: t('hrm.contract.list.allTypes') },
  ...contractStore.contractTypes.map(ct => ({ value: ct.contract_type_id, label: ct.name })),
])

function fetchList(page: number) {
  contractStore.fetchContracts({
    user_name: search.value,
    branch_id: filterBranch.value === 'all' ? undefined : Number(filterBranch.value),
    contract_type_id: filterType.value === 'all' ? undefined : Number(filterType.value),
    current_page: page,
  })
}

watchDebounced(search, () => fetchList(1), { debounce: 300 })
watch([filterBranch, filterType], () => fetchList(1))

function viewDetail(c: ContractDisplay) {
  router.push(`/hrm/contract/${c.userId}`)
}

type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

const today = computed(() => new Date().toISOString().slice(0, 10))
function contractStatus(c: ContractDisplay): { label: string; variant: BadgeVariant } {
  if (!c.end) return { label: t('hrm.contract.status.indefinite'), variant: 'green' }
  if (c.end < today.value) return { label: t('hrm.contract.status.expired'), variant: 'red' }
  const daysLeft = Math.round((new Date(c.end).getTime() - new Date(today.value).getTime()) / 86400000)
  if (daysLeft < 60) return { label: t('hrm.contract.status.daysLeft', { n: daysLeft }), variant: 'amber' }
  return { label: t('hrm.contract.status.active'), variant: 'primary' }
}

const fmtDate = (iso: string | null) => iso ? iso.slice(0, 10).split('-').reverse().join('/') : '—'

function onCreated() {
  show(t('hrm.contract.toast.createSuccess'))
  renewUserId.value = null
  renewUserName.value = ''
  tab.value = 'list'
  fetchList(1)
}

// ── Contract types tab: full CRUD ───────────────────────────────────────────
const typeSearch = ref('')
const selectedTypeIds = ref<number[]>([])

function fetchTypes(page = 1) {
  contractStore.fetchContractTypes({ contract_type_name: typeSearch.value, current_page: page })
}

watchDebounced(typeSearch, () => fetchTypes(1), { debounce: 300 })

const allTypesChecked = computed(() =>
  contractStore.contractTypes.length > 0 && contractStore.contractTypes.every(t => selectedTypeIds.value.includes(t.contract_type_id)),
)
function toggleAllTypes() {
  selectedTypeIds.value = allTypesChecked.value ? [] : contractStore.contractTypes.map(t => t.contract_type_id)
}
function toggleType(id: number) {
  selectedTypeIds.value = selectedTypeIds.value.includes(id)
    ? selectedTypeIds.value.filter(x => x !== id)
    : [...selectedTypeIds.value, id]
}

async function deleteSelectedTypes() {
  if (selectedTypeIds.value.length === 0) return
  const res = await contractStore.deleteContractTypes(selectedTypeIds.value)
  show(res.message || (res.ok ? t('hrm.contract.toast.typeDeleteSuccess') : t('hrm.contract.toast.typeDeleteFail')))
  selectedTypeIds.value = []
  if (res.ok) fetchTypes(1)
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const uploadOpen = ref(false)
const uploadName = ref('')
const uploadFile = ref<File | null>(null)
const uploadSubmitting = ref(false)

function onUploadFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  uploadFile.value = file
  if (file && !uploadName.value) uploadName.value = file.name.replace(/\.[^.]+$/, '')
}

async function submitUpload() {
  if (!uploadName.value || !uploadFile.value) return
  uploadSubmitting.value = true
  const content = await fileToBase64(uploadFile.value)
  const res = await contractStore.createContractType({ name: uploadName.value, template_file: uploadFile.value.name, file_content: content })
  uploadSubmitting.value = false
  show(res.message || (res.ok ? t('hrm.contract.toast.typeUploadSuccess') : t('hrm.contract.toast.typeUploadFail')))
  if (res.ok) {
    uploadOpen.value = false
    uploadName.value = ''
    uploadFile.value = null
    fetchTypes(1)
  }
}

const editOpen = ref(false)
const editTarget = ref<ContractType | null>(null)
const editName = ref('')
const editFile = ref<File | null>(null)
const editSubmitting = ref(false)

function openEdit(t: ContractType) {
  editTarget.value = t
  editName.value = t.name
  editFile.value = null
  editOpen.value = true
}

async function submitEdit() {
  if (!editTarget.value || !editName.value) return
  editSubmitting.value = true
  const templateFile = editFile.value ? await fileToBase64(editFile.value) : ''
  const res = await contractStore.editContractType({
    contract_type_id: editTarget.value.contract_type_id,
    name: editName.value,
    template_file: templateFile,
  })
  editSubmitting.value = false
  show(res.message || (res.ok ? t('hrm.contract.toast.typeUpdateSuccess') : t('hrm.contract.toast.typeUpdateFail')))
  if (res.ok) {
    editOpen.value = false
    fetchTypes(contractStore.contractTypePagination.current_page)
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="t('hrm.contract.pageEyebrow')"
      :title="t('hrm.contract.pageTitle')"
      :description="t('hrm.contract.pageDescription')"
    />

    <Tabs v-model="tab" :items="tabItems" />

    <!-- LIST -->
    <template v-if="tab === 'list'">
      <ErrorBanner v-if="contractStore.error" :message="contractStore.error" @retry="fetchList(1)" />

      <FilterBar>
        <FieldInput v-model="search" :icon="Search" :placeholder="t('hrm.contract.list.searchPh')" :width="240" />
        <Select v-model="filterBranch" :options="branchOpts" :width="170" />
        <Select v-model="filterType" :options="typeOpts" :width="240" />
        <div class="flex-1" />
        <span class="text-[12px] text-muted-foreground">{{ contractStore.pagination.total_row }} {{ t('hrm.contract.list.totalSuffix') }}</span>
      </FilterBar>

      <div class="card-surface overflow-hidden rise">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 960px">
            <thead>
              <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold border-b border-border/70">
                <th class="text-left py-3 px-5">{{ t('hrm.contract.list.colEmployee') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.contract.list.colBranch') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.contract.list.colStart') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.contract.list.colEnd') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.contract.list.colJoined') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.contract.list.colType') }}</th>
                <th class="text-center py-3 px-3">{{ t('hrm.contract.list.colStatus') }}</th>
                <th class="text-center py-3 px-5 w-20">{{ t('hrm.contract.list.colAccess') }}</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRow v-if="contractStore.loading" :cols="8" :rows="5" />
              <tr v-else-if="allContracts.length === 0">
                <td colspan="8" class="p-0">
                  <EmptyState :icon="FileX" :title="t('hrm.contract.list.emptyTitle')" />
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="c in allContracts" :key="c.id"
                  class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  @click="viewDetail(c)"
                >
                  <td class="py-3 px-5">
                    <div class="flex items-center gap-2.5">
                      <Avatar :name="c.user" :size="30" />
                      <span class="font-medium truncate max-w-[150px]">{{ c.user }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-3 text-foreground/80">{{ c.branch }}</td>
                  <td class="py-3 px-3 font-mono text-[12px] text-foreground/80">{{ fmtDate(c.start) }}</td>
                  <td class="py-3 px-3 font-mono text-[12px] text-foreground/80">{{ fmtDate(c.end) }}</td>
                  <td class="py-3 px-3 font-mono text-[12px] text-muted-foreground">{{ fmtDate(c.joined) }}</td>
                  <td class="py-3 px-3 max-w-[260px]">
                    <p class="truncate text-foreground/80">{{ c.type }}</p>
                  </td>
                  <td class="py-3 px-3 text-center">
                    <Badge :variant="contractStatus(c).variant" dot>{{ contractStatus(c).label }}</Badge>
                  </td>
                  <td class="py-3 px-5">
                    <div class="flex justify-center">
                      <button class="h-7 w-7 rounded-md flex items-center justify-center text-primary hover:bg-primary/10 transition-colors" :title="t('hrm.contract.list.viewDetail')" @click.stop="viewDetail(c)">
                        <LogIn :size="15" />
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <Pagination
          :page="contractStore.pagination.current_page"
          :total="contractStore.pagination.total_row"
          :per-page="contractStore.pagination.row_per_page"
          @change="fetchList"
        />
      </div>
    </template>

    <!-- CREATE -->
    <template v-if="tab === 'create'">
      <ContractForm :prefill-user-id="renewUserId" :prefill-user-name="renewUserName" @submit="onCreated" @cancel="tab = 'list'" />
    </template>

    <!-- TYPES -->
    <template v-if="tab === 'types'">
      <FilterBar>
        <FieldInput v-model="typeSearch" :icon="Search" :placeholder="t('hrm.contract.types.searchPh')" :width="260" />
        <div class="flex-1" />
        <Btn variant="success" @click="uploadOpen = true"><Upload :size="13" /> {{ t('hrm.contract.types.uploadBtn') }}</Btn>
        <Btn :variant="selectedTypeIds.length ? 'danger' : 'outline'" @click="deleteSelectedTypes">
          <Trash2 :size="13" /> {{ t('hrm.contract.types.deleteSelected') }}{{ selectedTypeIds.length ? ` (${selectedTypeIds.length})` : '' }}
        </Btn>
      </FilterBar>

      <div class="card-surface overflow-hidden rise">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 860px">
            <thead>
              <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold border-b border-border/70">
                <th class="text-left py-3 px-5">{{ t('hrm.contract.types.colName') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.contract.types.colFile') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.contract.types.colCreated') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.contract.types.colUpdated') }}</th>
                <th class="text-center py-3 px-3">{{ t('hrm.contract.types.colEdit') }}</th>
                <th class="text-center py-3 px-5 w-12">
                  <input type="checkbox" :checked="allTypesChecked" class="h-3.5 w-3.5 rounded accent-primary cursor-pointer" @change="toggleAllTypes">
                </th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRow v-if="contractStore.contractTypesLoading" :cols="6" :rows="5" />
              <tr v-else-if="contractStore.contractTypes.length === 0">
                <td colspan="6" class="p-0"><EmptyState :icon="FileX" :title="t('hrm.contract.types.emptyTitle')" /></td>
              </tr>
              <template v-else>
              <tr
                v-for="ct in contractStore.contractTypes" :key="ct.contract_type_id"
                :class="['border-b border-border/40 last:border-0 transition-colors', selectedTypeIds.includes(ct.contract_type_id) ? 'bg-primary/5' : 'hover:bg-muted/20']"
              >
                <td class="py-3 px-5 font-medium text-foreground">{{ ct.name }}</td>
                <td class="py-3 px-3">
                  <a v-if="ct.file_template_content" :href="ct.file_template_content" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline">
                    <FileText :size="12" />
                    <span class="truncate max-w-[220px]">{{ ct.file_template_name }}</span>
                  </a>
                  <span v-else class="text-[12px] text-muted-foreground">{{ ct.file_template_name || '—' }}</span>
                </td>
                <td class="py-3 px-3 font-mono text-[12px] text-muted-foreground">{{ ct.created_at }}</td>
                <td class="py-3 px-3 font-mono text-[12px] text-muted-foreground">{{ ct.updated_at }}</td>
                <td class="py-3 px-3 text-center">
                  <button class="h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" @click="openEdit(ct)">
                    <Pencil :size="13" />
                  </button>
                </td>
                <td class="py-3 px-5 text-center">
                  <input type="checkbox" :checked="selectedTypeIds.includes(ct.contract_type_id)" class="h-3.5 w-3.5 rounded accent-primary cursor-pointer" @change="toggleType(ct.contract_type_id)">
                </td>
              </tr>
              </template>
            </tbody>
          </table>
        </div>
        <Pagination
          :page="contractStore.contractTypePagination.current_page"
          :total="contractStore.contractTypePagination.total_row"
          :per-page="contractStore.contractTypePagination.row_per_page"
          @change="fetchTypes"
        />
      </div>
    </template>

    <!-- UPLOAD CONTRACT TYPE MODAL -->
    <Modal v-model:open="uploadOpen" :title="t('hrm.contract.types.uploadModalTitle')" :max-width="480">
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.types.nameLabel') }} <span class="text-red-400">*</span></label>
          <input v-model="uploadName" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
        </div>
        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.types.fileLabel') }} <span class="text-red-400">*</span></label>
          <input type="file" accept=".doc,.docx,.pdf" class="w-full text-[13px]" @change="onUploadFileChange">
        </div>
      </div>
      <template #footer>
        <Btn variant="outline" @click="uploadOpen = false">{{ t('hrm.contract.types.cancel') }}</Btn>
        <Btn variant="primary" :disabled="uploadSubmitting || !uploadName || !uploadFile" @click="submitUpload">{{ t('hrm.contract.types.upload') }}</Btn>
      </template>
    </Modal>

    <!-- EDIT CONTRACT TYPE MODAL -->
    <Modal v-model:open="editOpen" :title="t('hrm.contract.types.editModalTitle')" :max-width="480">
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.types.nameLabel') }} <span class="text-red-400">*</span></label>
          <input v-model="editName" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
        </div>
        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.types.fileReplaceLabel') }}</label>
          <input type="file" accept=".doc,.docx,.pdf" class="w-full text-[13px]" @change="(e) => editFile = (e.target as HTMLInputElement).files?.[0] ?? null">
        </div>
      </div>
      <template #footer>
        <Btn variant="outline" @click="editOpen = false">{{ t('hrm.contract.types.cancel') }}</Btn>
        <Btn variant="primary" :disabled="editSubmitting || !editName" @click="submitEdit">{{ t('hrm.contract.types.save') }}</Btn>
      </template>
    </Modal>
  </div>
</template>
