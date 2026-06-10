<template>
  <div>
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="bg-transparent border-b border-border rounded-none h-auto p-0 justify-start gap-6 mb-6">
        <TabsTrigger
          value="members"
          class="rounded-none border-b-2 border-transparent text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-sm font-medium transition-all"
        >
          Danh sách thành viên
        </TabsTrigger>
        <TabsTrigger
          value="invitations"
          class="rounded-none border-b-2 border-transparent text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-sm font-medium transition-all"
        >
          Yêu cầu mời thành viên
        </TabsTrigger>
      </TabsList>

      <!-- ─── Tab 1: Member list ─── -->
      <TabsContent value="members" class="mt-0">
        <!-- Filters -->
        <div class="flex flex-wrap gap-3 mb-4">
          <div class="relative w-full sm:w-52">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input v-model="search" placeholder="Tìm kiếm tên, email..." class="pl-9" />
          </div>
          <Select v-model="filterBranch">
            <SelectTrigger class="w-44">
              <SelectValue :placeholder="branchOptions[0]?.label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in branchOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="filterPosition">
            <SelectTrigger class="w-44">
              <SelectValue :placeholder="positionOptions[0]?.label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in positionOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="filterStatus">
            <SelectTrigger class="w-44">
              <SelectValue :placeholder="statusOptions[0].label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Admin actions -->
        <div v-if="isAdminUser" class="flex gap-2 mb-6">
          <Button class="bg-green-600 hover:bg-green-700 text-white" @click="showInviteModal = true">
            <UserPlus class="mr-2 h-4 w-4 text-white" />
            Mời thành viên
          </Button>
          <Button variant="outline" :disabled="exporting" @click="exportExcel">
            <AppSpinner v-if="exporting" class="mr-2 h-4 w-4" />
            <Download v-else class="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
        </div>

        <!-- Table -->
        <div class="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-8" />
                <TableHead class="whitespace-nowrap">Tên</TableHead>
                <TableHead class="whitespace-nowrap">Chi nhánh</TableHead>
                <TableHead class="whitespace-nowrap">Chức danh</TableHead>
                <TableHead class="whitespace-nowrap">Email</TableHead>
                <TableHead class="whitespace-nowrap">Số điện thoại</TableHead>
                <TableHead class="text-center whitespace-nowrap">Trạng thái</TableHead>
                <TableHead class="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <!-- Skeleton loading -->
              <template v-if="loading">
                <TableRow v-for="n in 8" :key="n">
                  <TableCell><Skeleton class="h-8 w-8 rounded-full" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton class="h-5 w-20 mx-auto rounded-full" /></TableCell>
                  <TableCell />
                </TableRow>
              </template>

              <!-- Empty -->
              <template v-else-if="members.length === 0">
                <TableRow>
                  <TableCell colspan="8" class="py-16 text-center text-muted-foreground">
                    <Users class="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p class="text-sm">Không tìm thấy nhân viên</p>
                  </TableCell>
                </TableRow>
              </template>

              <!-- Rows -->
              <template v-else>
                <TableRow
                  v-for="member in members"
                  :key="member.id"
                  class="hover:bg-muted/50"
                >
                  <TableCell>
                    <Avatar class="h-8 w-8">
                      <AvatarImage v-if="member.avatar" :src="member.avatar" :alt="`${member.first_name} ${member.last_name}`" />
                      <AvatarFallback class="bg-primary/10 text-primary text-xs font-bold">
                        {{ getInitials(`${member.first_name} ${member.last_name}`) }}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell class="font-medium whitespace-nowrap">{{ `${member.first_name} ${member.last_name}`.trim() }}</TableCell>
                  <TableCell class="text-muted-foreground whitespace-nowrap">{{ member.branch || '—' }}</TableCell>
                  <TableCell class="text-muted-foreground whitespace-nowrap">{{ jobTitleMap[member.job_title] || member.job_position || '—' }}</TableCell>
                  <TableCell class="text-muted-foreground whitespace-nowrap">{{ member.email }}</TableCell>
                  <TableCell class="text-muted-foreground whitespace-nowrap">{{ member.phone_number || '—' }}</TableCell>
                  <TableCell class="text-center whitespace-nowrap">
                    <Badge :class="statusBadgeClass(member.status)">{{ statusLabel(member.status) }}</Badge>
                  </TableCell>
                  <TableCell @click.stop>
                    <NuxtLink :to="`/hrm/member/view-profile/${member.id}`">
                      <Button size="sm" variant="ghost" class="h-8 w-8 p-0">
                        <ExternalLink class="h-4 w-4" />
                      </Button>
                    </NuxtLink>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
          <p class="text-sm text-muted-foreground">
            {{ (currentPage - 1) * rowPerPage + 1 }}–{{ Math.min(currentPage * rowPerPage, totalRow) }} / {{ totalRow }} nhân viên
          </p>
          <Pagination v-model:page="currentPage" :total="totalRow" :items-per-page="rowPerPage" :sibling-count="1" show-edges>
            <PaginationContent v-slot="{ items }">
              <PaginationPrevious />
              <template v-for="item in items" :key="item.type === 'page' ? item.value : `ellipsis-${item.key}`">
                <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === currentPage">
                  {{ item.value }}
                </PaginationItem>
                <PaginationEllipsis v-else />
              </template>
              <PaginationNext />
            </PaginationContent>
          </Pagination>
        </div>
      </TabsContent>

      <!-- ─── Tab 2: Invitation requests ─── -->
      <TabsContent value="invitations" class="mt-0">
        <!-- Filters -->
        <div class="flex flex-wrap gap-3 mb-6">
          <div class="relative w-full sm:w-52">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input v-model="inviteSearch" placeholder="Tìm theo email..." class="pl-9" />
          </div>
          <Select v-model="inviteTypeFilter">
            <SelectTrigger class="w-36">
              <SelectValue placeholder="Tất cả loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tất cả loại</SelectItem>
              <SelectItem value="1">Yêu cầu</SelectItem>
              <SelectItem value="2">Mời</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="inviteStatusFilter">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tất cả trạng thái</SelectItem>
              <SelectItem value="1">Chờ duyệt</SelectItem>
              <SelectItem value="2">Từ chối</SelectItem>
              <SelectItem value="3">Đã chấp nhận</SelectItem>
              <SelectItem value="4">Đã đăng ký</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Loading -->
        <div v-if="inviteLoading" class="space-y-2">
          <Skeleton v-for="n in 5" :key="n" class="h-12 w-full rounded-md" />
        </div>

        <!-- Empty -->
        <div v-else-if="filteredInvitations.length === 0" class="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p class="text-sm">Không có yêu cầu nào</p>
        </div>

        <!-- Table -->
        <div v-else class="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="whitespace-nowrap">Email</TableHead>
                <TableHead class="whitespace-nowrap">Tin nhắn</TableHead>
                <TableHead class="whitespace-nowrap">Thời gian</TableHead>
                <TableHead class="whitespace-nowrap">Loại</TableHead>
                <TableHead class="whitespace-nowrap">Trạng thái</TableHead>
                <TableHead class="w-36" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in filteredInvitations" :key="row.id">
                <TableCell class="font-medium whitespace-nowrap">{{ row.email }}</TableCell>
                <TableCell class="text-muted-foreground max-w-[200px] truncate">{{ row.message || '—' }}</TableCell>
                <TableCell class="text-muted-foreground text-xs whitespace-nowrap">{{ row.time_request || formatDate(row.created_at) }}</TableCell>
                <TableCell class="whitespace-nowrap">
                  <Badge variant="secondary">{{ row.type === 1 ? 'Yêu cầu' : 'Mời' }}</Badge>
                </TableCell>
                <TableCell class="whitespace-nowrap">
                  <Badge :variant="inviteStatusVariant(row.status)" :class="inviteStatusClass(row.status)">
                    {{ inviteStatusLabel(row.status) }}
                  </Badge>
                </TableCell>
                <TableCell class="whitespace-nowrap">
                  <div v-if="row.status === 1" class="flex gap-1.5">
                    <Button size="sm" :disabled="inviteActionId === row.id" @click="acceptRequest(row)">
                      <AppSpinner v-if="inviteActionId === row.id && inviteDoing === 'accept'" class="mr-1 h-3 w-3" />
                      Chấp nhận
                    </Button>
                    <Button size="sm" variant="destructive" :disabled="inviteActionId === row.id" @click="denyRequest(row)">
                      <AppSpinner v-if="inviteActionId === row.id && inviteDoing === 'deny'" class="mr-1 h-3 w-3" />
                      Từ chối
                    </Button>
                  </div>
                  <div v-else-if="row.status === 3">
                    <Button size="sm" variant="outline" :disabled="inviteActionId === row.id" @click="resendEmail(row)">
                      <AppSpinner v-if="inviteActionId === row.id && inviteDoing === 'resend'" class="mr-1 h-3 w-3" />
                      Gửi lại
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>

    <!-- Invite member modal -->
    <AppModal v-model="showInviteModal" title="Mời thành viên" size="md">
      <div class="space-y-5">
        <!-- Email tag input -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium leading-none">Invite via email</label>
          <div
            class="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-text transition-colors hover:border-primary focus-within:border-primary"
            @click="focusEmailInput"
          >
            <div class="flex flex-wrap gap-1.5 mb-1">
              <Badge
                v-for="email in emailTags"
                :key="email"
                variant="secondary"
                class="gap-1 rounded-sm pr-1 font-normal"
              >
                {{ email }}
                <button
                  type="button"
                  class="rounded-full hover:bg-muted-foreground/20 p-0.5"
                  @click.stop="removeEmailTag(email)"
                >
                  <X class="h-3 w-3" />
                </button>
              </Badge>
            </div>
            <input
              ref="emailInputRef"
              v-model="emailInput"
              type="email"
              placeholder="mail1@gmail.com"
              class="w-full bg-transparent outline-none placeholder:text-muted-foreground"
              @keydown.enter.prevent="addEmailTag"
              @keydown.backspace="onBackspace"
            />
          </div>
          <p class="text-xs text-muted-foreground">Nhập email rồi nhấn Enter để thêm</p>
        </div>

        <!-- File upload -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium leading-none">Upload xlsx or csv file to invite</label>
          <div class="flex gap-2">
            <div class="flex-1 truncate rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
              {{ inviteFile?.name || 'No file chosen' }}
            </div>
            <Button variant="secondary" size="sm" @click="triggerFileInput">Upload</Button>
            <input ref="fileInputRef" type="file" accept=".xlsx,.csv" class="hidden" @change="onFileChange" />
          </div>
        </div>

        <!-- Invite button -->
        <Button
          class="bg-green-600 hover:bg-green-700 text-white"
          :disabled="inviting || emailTags.length === 0"
          @click="sendInvite"
        >
          <AppSpinner v-if="inviting" class="mr-2 h-4 w-4" />
          Mời
        </Button>

        <!-- Error / Success -->
        <div v-if="inviteError" class="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {{ inviteError }}
        </div>
        <div v-if="inviteSuccess" class="rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          {{ inviteSuccess }}
        </div>

        <!-- Download templates -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium leading-none">Download file template</label>
          <div class="flex gap-2">
            <Button variant="secondary" size="sm" @click="downloadTemplate('xlsx')">Tải file xlsx</Button>
            <Button variant="secondary" size="sm" @click="downloadTemplate('csv')">Tải file csv</Button>
          </div>
        </div>
      </div>

    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { Search, Users, UserPlus, Download, ExternalLink, X } from 'lucide-vue-next'
import { useUserProfile } from '~/composables/useUserProfile'
import { useRegistrationRequestsStore } from '~/stores/registration-requests'
import { getInitials } from '~/utils/format'
import { formatDate } from '~/utils/date'
import { isAdmin } from '~/utils/permission'
import { handleApiError } from '~/utils/error-handler'
import Tabs from '~/components/ui/Tabs.vue'
import TabsList from '~/components/ui/TabsList.vue'
import TabsTrigger from '~/components/ui/TabsTrigger.vue'
import TabsContent from '~/components/ui/TabsContent.vue'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import Avatar from '~/components/ui/Avatar.vue'
import AvatarFallback from '~/components/ui/AvatarFallback.vue'
import AvatarImage from '~/components/ui/AvatarImage.vue'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '~/components/ui/table'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious } from '~/components/ui/pagination'
import AppModal from '~/components/ui/AppModal.vue'
import AppSpinner from '~/components/ui/AppSpinner.vue'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'member' } })
useHead({ title: 'Danh sách nhân viên — Micro ERP' })

const { user } = useAuth()
const { fetchMemberList, fetchProfileSelectBoxData } = useUserProfile()
const regStore = useRegistrationRequestsStore()
const toast = useToast()
const { post, request } = useApi()

const isAdminUser = computed(() => isAdmin(user.value))
const activeTab = ref('members')

// ─── Tab 1: Member list ───
const members      = ref<any[]>([])
const loading      = ref(true)
const search       = ref('')
const filterBranch   = ref('_all')
const filterPosition = ref('_all')
const filterStatus   = ref('_all')
const exporting    = ref(false)

const branchOptions   = ref<{ value: string; label: string }[]>([{ value: '_all', label: 'Tất cả chi nhánh' }])
const positionOptions = ref<{ value: string; label: string }[]>([{ value: '_all', label: 'Tất cả chức danh' }])
const jobTitleMap     = ref<Record<string, string>>({})
const statusOptions   = ref<{ value: string; label: string }[]>([{ value: '_all', label: 'Tất cả trạng thái' }])

// Server-side pagination state
const currentPage = ref(1)
const rowPerPage  = ref(10)
const totalRow    = ref(0)
const totalPages  = computed(() => Math.ceil(totalRow.value / rowPerPage.value) || 1)

async function fetchMembers() {
  loading.value = true
  try {
    const data = await fetchMemberList({
      name:         search.value,
      branch:       filterBranch.value !== '_all'   ? Number(filterBranch.value)   : 0,
      job_title:    filterPosition.value !== '_all' ? Number(filterPosition.value) : 0,
      status:       filterStatus.value !== '_all'   ? Number(filterStatus.value)   : 0,
      current_page: currentPage.value,
    })
    members.value = data?.profile_list ?? data?.profiles ?? []
    if (data?.pagination) {
      rowPerPage.value = data.pagination.row_perpage
      totalRow.value   = data.pagination.total_row
    }
  } finally {
    loading.value = false
  }
}

// Reset to page 1 and refetch when filters change
watch([search, filterBranch, filterPosition, filterStatus], () => {
  currentPage.value = 1
  fetchMembers()
})

// Refetch when page changes (skip if triggered by filter reset above)
watch(currentPage, fetchMembers)

function statusLabel(status: number) {
  return status === 1 ? 'Đang làm việc' : status === 2 ? 'Onsite' : status === 3 ? 'Đã nghỉ việc' : '—'
}
function statusBadgeClass(status: number) {
  if (status === 1) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-transparent'
  if (status === 2) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent'
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-transparent'
}

async function exportExcel() {
  exporting.value = true
  try {
    const blob = await request<Blob>('/api/user/export-excel', {
      method: 'POST',
      body: {
        name:      search.value,
        email:     '',
        branch:    filterBranch.value !== '_all' ? Number(filterBranch.value) : 0,
        job_title: filterPosition.value !== '_all' ? Number(filterPosition.value) : 0,
        status:    filterStatus.value !== '_all' ? Number(filterStatus.value) : 0,
      },
      responseType: 'blob',
    })
    const url  = window.URL.createObjectURL(new Blob([blob as any]))
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', 'profile-list.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    toast.error(handleApiError(err))
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  try {
    const [, selectData] = await Promise.all([
      fetchMembers(),
      fetchProfileSelectBoxData(),
    ])

    // Branch options — branch_list: { "id": "name" }
    if (selectData?.branch_list) {
      const branches = Object.entries(selectData.branch_list as Record<string, string>)
        .map(([id, label]) => ({ value: id, label }))
      branchOptions.value = [{ value: '_all', label: 'Tất cả chi nhánh' }, ...branches]
    }

    // Position options — job_title_list: { "id": "name" }
    if (selectData?.job_title_list) {
      jobTitleMap.value = selectData.job_title_list as Record<string, string>
      const positions = Object.entries(jobTitleMap.value)
        .map(([id, label]) => ({ value: id, label }))
        .sort((a, b) => a.label.localeCompare(b.label))
      positionOptions.value = [{ value: '_all', label: 'Tất cả chức danh' }, ...positions]
    }

    // Status options — fixed values (same as old SPA's working_status)
    statusOptions.value = [
      { value: '_all', label: 'Tất cả trạng thái' },
      { value: '1',    label: 'Đang làm việc' },
      { value: '2',    label: 'Onsite' },
      { value: '3',    label: 'Đã nghỉ việc' },
    ]
  } catch {
    loading.value = false
  }
})

// ─── Tab 2: Invitation requests ───
const inviteSearch       = ref('')
const inviteTypeFilter   = ref('_all')
const inviteStatusFilter = ref('_all')
const inviteLoading      = ref(false)
const inviteActionId     = ref<number | null>(null)
const inviteDoing        = ref('')

const filteredInvitations = computed(() => {
  let list = regStore.requests
  if (inviteSearch.value)
    list = list.filter(r => r.email?.toLowerCase().includes(inviteSearch.value.toLowerCase()))
  if (inviteTypeFilter.value && inviteTypeFilter.value !== '_all')
    list = list.filter(r => String(r.type) === inviteTypeFilter.value)
  if (inviteStatusFilter.value && inviteStatusFilter.value !== '_all')
    list = list.filter(r => String(r.status) === inviteStatusFilter.value)
  return list
})

function inviteStatusLabel(s: number) {
  return ['', 'Chờ duyệt', 'Từ chối', 'Đã chấp nhận', 'Đã đăng ký'][s] ?? 'N/A'
}
function inviteStatusVariant(s: number): 'outline' | 'default' | 'destructive' | 'secondary' {
  if (s === 1) return 'outline'
  if (s === 3) return 'default'
  if (s === 2) return 'destructive'
  return 'secondary'
}
function inviteStatusClass(s: number) {
  if (s === 1) return 'text-amber-600 border-amber-400'
  if (s === 3) return 'bg-green-600 hover:bg-green-600'
  return ''
}

async function acceptRequest(row: any) {
  inviteActionId.value = row.id; inviteDoing.value = 'accept'
  try {
    await post('/request/updateRequestStatus', { request_id: row.id, status_request: 3 })
    row.status = 3
    toast.success('Đã chấp nhận')
  } catch (err) { toast.error(handleApiError(err)) }
  finally { inviteActionId.value = null }
}

async function denyRequest(row: any) {
  inviteActionId.value = row.id; inviteDoing.value = 'deny'
  try {
    await post('/request/updateRequestStatus', { request_id: row.id, status_request: 2 })
    row.status = 2
    toast.success('Đã từ chối')
  } catch (err) { toast.error(handleApiError(err)) }
  finally { inviteActionId.value = null }
}

async function resendEmail(row: any) {
  inviteActionId.value = row.id; inviteDoing.value = 'resend'
  try {
    await post('/request/resendEmailRegister', { request_id: row.id })
    toast.success('Đã gửi lại email')
  } catch (err) { toast.error(handleApiError(err)) }
  finally { inviteActionId.value = null }
}

watch(activeTab, async (tab) => {
  if (tab === 'invitations' && regStore.requests.length === 0) {
    inviteLoading.value = true
    await regStore.fetchRequests()
    inviteLoading.value = false
  }
})

// ─── Invite modal ───
const showInviteModal = ref(false)
const emailTags      = ref<string[]>([])
const emailInput     = ref('')
const emailInputRef  = ref<HTMLInputElement | null>(null)
const inviteFile     = ref<File | null>(null)
const fileInputRef   = ref<HTMLInputElement | null>(null)
const inviting       = ref(false)
const inviteError    = ref('')
const inviteSuccess  = ref('')

function focusEmailInput() { emailInputRef.value?.focus() }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function addEmailTag() {
  const email = emailInput.value.trim()
  if (!email) return
  if (!EMAIL_RE.test(email)) {
    inviteError.value = `Email không hợp lệ: ${email}`
    return
  }
  if (!emailTags.value.includes(email)) emailTags.value.push(email)
  emailInput.value = ''
  inviteError.value = ''
}

function removeEmailTag(email: string) {
  emailTags.value = emailTags.value.filter(e => e !== email)
}

function onBackspace() {
  if (!emailInput.value && emailTags.value.length) emailTags.value.pop()
}

function triggerFileInput() { fileInputRef.value?.click() }

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  inviteFile.value = file
  inviteError.value = ''

  const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    || file.name.endsWith('.xlsx')
  const isCsv = file.type === 'application/vnd.ms-excel' || file.name.endsWith('.csv')

  if (!isXlsx && !isCsv) {
    inviteError.value = 'Chỉ hỗ trợ file .xlsx hoặc .csv'
    return
  }

  const reader = new FileReader()

  if (isCsv) {
    reader.readAsText(file)
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const rows = text.split(/\r\n|\n/).filter(Boolean)
      if (rows.length < 2) { inviteError.value = 'File không có dữ liệu'; return }
      const invalid: string[] = []
      for (let i = 1; i < rows.length; i++) {
        const email = rows[i].trim()
        if (!email) continue
        if (!EMAIL_RE.test(email)) { invalid.push(`dòng ${i + 1}: ${email}`); continue }
        if (!emailTags.value.includes(email)) emailTags.value.push(email)
      }
      if (invalid.length) inviteError.value = `Email không hợp lệ — ${invalid.join(', ')}`
    }
  } else {
    reader.readAsBinaryString(file)
    reader.onload = async (ev) => {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(ev.target?.result, { type: 'binary' })
      const invalid: string[] = []
      workbook.SheetNames.forEach((sheetName) => {
        const rows = XLSX.utils.sheet_to_json<{ Email?: string }>(workbook.Sheets[sheetName])
        if (rows.length === 0) { inviteError.value = 'File không có dữ liệu'; return }
        rows.forEach((row, i) => {
          const email = row.Email?.trim()
          if (!email) return
          if (!EMAIL_RE.test(email)) { invalid.push(`dòng ${i + 2}: ${email}`); return }
          if (!emailTags.value.includes(email)) emailTags.value.push(email)
        })
      })
      if (invalid.length) inviteError.value = `Email không hợp lệ — ${invalid.join(', ')}`
    }
  }
}

watch(showInviteModal, (v) => {
  if (!v) {
    emailTags.value = []; emailInput.value = ''
    inviteFile.value = null; inviteError.value = ''; inviteSuccess.value = ''
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
})

async function sendInvite() {
  inviteError.value = ''; inviteSuccess.value = ''
  if (emailTags.value.length === 0) {
    inviteError.value = 'Vui lòng nhập ít nhất một email'
    return
  }
  inviting.value = true
  try {
    const res = await post<{ message: string }>('/registration/inviteUser', { emailList: emailTags.value })
    inviteSuccess.value = res.data?.message || 'Đã gửi lời mời thành công'
    emailTags.value = []
    inviteFile.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
  } catch (err) {
    inviteError.value = handleApiError(err)
  } finally {
    inviting.value = false
  }
}

async function downloadTemplate(type: 'xlsx' | 'csv') {
  try {
    const blob = await request<Blob>('/registration/download-template', {
      method: 'POST',
      body: { type_file: type },
      responseType: 'blob',
    })
    const url  = window.URL.createObjectURL(new Blob([blob as any]))
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', `invite-template.${type}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    toast.error(handleApiError(err))
  }
}
</script>
