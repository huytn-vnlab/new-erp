<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
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
import SkeletonRow from '~/components/base/SkeletonRow.vue'
import EmptyState from '~/components/base/EmptyState.vue'
import ErrorBanner from '~/components/base/ErrorBanner.vue'
import InviteModal from '~/components/member/InviteModal.vue'
import MemberDetail from '~/components/member/MemberDetail.vue'
import { Building2, FileText, UserPlus, Users } from 'lucide-vue-next'
import { useMemberStore } from '~/stores/member'
import type { Member, MemberDetail as MemberDetailData } from '~/types'
import type { InviteRow } from '~/stores/member'

definePageMeta({ layout: 'admin', middleware: 'auth' })

type InviteStatus = 'pending' | 'registered' | 'denied' | 'accepted' | 'cancelled'
type Invitation = { id?: number; email: string; sent: string; status: InviteStatus; status_name?: string; type_name: string; allow_resend?: boolean }

function mapInviteStatus(s: number): InviteStatus {
  if (s === 1) return 'pending'
  if (s === 4) return 'registered'
  if (s === 2) return 'denied'
  if (s === 3) return 'accepted'
  return 'pending'
}

const MEMBER_STATUS_META: Record<string, { labelKey: string; variant: 'green' | 'amber' | 'red' | 'gray' }> = {
  active:     { labelKey: 'hrm.member.status.active',     variant: 'green' },
  onboarding: { labelKey: 'hrm.member.status.onboarding', variant: 'amber' },
  leave:      { labelKey: 'hrm.member.status.leave',      variant: 'amber' },
  inactive:   { labelKey: 'hrm.member.status.inactive',   variant: 'gray' },
}

const RANK_COLOR: Record<string, string> = { S: '#0ea5e9', A: '#22c55e', B: '#a3a3a3', C: '#eab308' }

const { t } = useI18n()
const store = useMemberStore()
const search = ref('')
const branch = ref('all')
const role = ref('all')
const status = ref('all')
const tab = ref('list')
const page = ref(1)
const perPage = 10
const openMember = ref<Member | null>(null)
const openMemberDetail = ref<MemberDetailData | null>(null)
const drawerOpen = ref(false)
const inviteOpen = ref(false)
const invitations = ref<Invitation[]>([])
const inviteSearch = ref('')
const inviteTypeFilter = ref(0)
const inviteStatusFilter = ref(0)
const invitePagination = ref({ current_page: 1, total_row: 0, row_per_page: 10 })

const INVITE_TYPE_OPTIONS = computed(() => [
  { value: 0, label: t('hrm.member.inviteType.all') },
  { value: 1, label: t('hrm.member.inviteType.request') },
  { value: 2, label: t('hrm.member.inviteType.invite') },
])
const INVITE_STATUS_OPTIONS = computed(() => [
  { value: 0, label: t('hrm.member.inviteStatus.all') },
  { value: 1, label: t('hrm.member.inviteStatus.pending') },
  { value: 2, label: t('hrm.member.inviteStatus.denied') },
  { value: 3, label: t('hrm.member.inviteStatus.accepted') },
  { value: 4, label: t('hrm.member.inviteStatus.registered') },
])
const inviteLoading = ref(false)
let _searchSeq = 0
let _filterPending = false
const { show } = useToast()

const ROLE_KEY: Record<string, string> = {
  'user':            'hrm.member.role.user',
  'manager':         'hrm.member.role.manager',
  'general manager': 'hrm.member.role.generalManager',
}
const roleLabel = (role: string) => t(ROLE_KEY[role] ?? role)

const allMembers = computed(() => store.members)
const allBranches = computed(() => store.branches.map(b => b.name))
const jobTitleMap = computed(() => Object.fromEntries(store.jobTitles.map(j => [j.id, j.name])))
const jobTitleLabel = (id: number) => jobTitleMap.value[id] || '—'

async function searchInvitations(page = 1) {
  const seq = ++_searchSeq
  inviteLoading.value = true
  const result = await store.fetchInvitations({ email: inviteSearch.value, type: inviteTypeFilter.value, status: inviteStatusFilter.value, current_page: page })
  if (seq !== _searchSeq) return
  invitations.value = result.list.map((r: InviteRow) => ({
    id: r.id, email: r.email, sent: r.time_request ?? '—',
    status: mapInviteStatus(r.status), status_name: r.status_name,
    type_name: r.type_name ?? '—', allow_resend: r.allow_resend,
  }))
  invitePagination.value = result.pagination
  inviteLoading.value = false
}

async function onTypeFilterChange(v: number) {
  if (_filterPending) return
  inviteTypeFilter.value = v
  _filterPending = true
  await nextTick()
  _filterPending = false
  searchInvitations(1)
}

async function onStatusFilterChange(v: number) {
  if (_filterPending) return
  inviteStatusFilter.value = v
  _filterPending = true
  await nextTick()
  _filterPending = false
  searchInvitations(1)
}

onMounted(() => {
  store.fetchMembers()
  store.fetchBranches()
  store.fetchJobTitles()
  store.fetchStats()
  searchInvitations(1)
})

const roleOptions = computed(() => [{ value: 'all', label: t('hrm.member.filter.allRoles') }, ...Array.from(new Set(allMembers.value.map(m => m.role))).map(r => ({ value: r, label: roleLabel(r) }))])
const branchOptions = computed(() => [{ value: 'all', label: t('hrm.member.filter.allBranches') }, ...allBranches.value.map(b => ({ value: b, label: b }))])
const statusOptions = computed(() => [{ value: 'all', label: t('hrm.member.filter.allStatuses') }, ...Object.entries(MEMBER_STATUS_META).map(([k, v]) => ({ value: k, label: t(v.labelKey) }))])

const filtered = computed(() => allMembers.value.filter((m) => {
  if (search.value && !m.name.toLowerCase().includes(search.value.toLowerCase()) && !m.email.toLowerCase().includes(search.value.toLowerCase())) return false
  if (branch.value !== 'all' && m.branch !== branch.value) return false
  if (role.value !== 'all' && m.role !== role.value) return false
  if (status.value !== 'all' && m.status !== status.value) return false
  return true
}))
const paged = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))
const pendingCount = computed(() => invitations.value.filter(i => i.status === 'pending').length)
const inviteTotalCount = computed(() => invitePagination.value.total_row || invitations.value.length)
const resetPage = () => { page.value = 1 }

const totalEmployees = computed(() => store.pagination.total_row || allMembers.value.length)

const stats = computed(() => [
  { label: t('hrm.member.stats.total'), value: totalEmployees.value, sublabel: t('hrm.member.stats.totalSub', { n: allBranches.value.length }), trend: { dir: 'up' as const, value: t('hrm.member.stats.thisMonth') }, accent: 'primary' as const },
  { label: t('hrm.member.status.active'), value: store.statsActive, sublabel: t('hrm.member.stats.activeSub', { pct: Math.round(store.statsActive / (totalEmployees.value || 1) * 100) }), accent: 'green' as const },
  { label: t('hrm.member.status.onboarding'), value: store.statsOnboarding, sublabel: t('hrm.member.stats.onboardingSub'), accent: 'amber' as const },
  { label: t('hrm.member.stats.pendingInvites'), value: pendingCount.value, sublabel: t('hrm.member.stats.pendingInvitesSub'), accent: 'violet' as const },
])
const tabItems = computed(() => [
  { value: 'list', label: t('hrm.member.tabs.list'), count: totalEmployees.value },
  { value: 'invites', label: t('hrm.member.tabs.invites'), count: inviteTotalCount.value },
])

async function openDetail(m: Member) {
  openMember.value = m
  openMemberDetail.value = null
  drawerOpen.value = true
  openMemberDetail.value = await store.fetchMemberDetail(m.id)
}

async function onInvited(invites: { email: string; sent: string; by: string; status: 'pending' }[]) {
  let successCount = 0
  for (const inv of invites) {
    const result = await store.inviteUser({ email: inv.email })
    if (result.ok) successCount++
    else show(result.message || t('hrm.member.toast.inviteFail', { email: inv.email }))
  }
  if (successCount > 0) {
    show(successCount === 1
      ? t('hrm.member.toast.inviteSingleSuccess', { email: invites[0]!.email })
      : t('hrm.member.toast.inviteMultiSuccess', { count: successCount }))
    searchInvitations(1)
  }
}

async function onResend(inv: Invitation) {
  if (!inv.id) { show(t('hrm.member.toast.noInviteId')); return }
  const result = await store.resendInvite(inv.id)
  show(result.ok ? t('hrm.member.toast.resendSuccess', { email: inv.email }) : (result.message || t('hrm.member.toast.resendFail')))
  if (result.ok) searchInvitations(invitePagination.value.current_page)
}

async function onCancel(inv: Invitation) {
  if (!inv.id) {
    invitations.value = invitations.value.filter(i => i.email !== inv.email)
    return
  }
  const result = await store.cancelInvite(inv.id)
  if (result.ok) {
    show(t('hrm.member.toast.cancelSuccess'))
    const page = invitations.value.length === 1 && invitePagination.value.current_page > 1
      ? invitePagination.value.current_page - 1
      : invitePagination.value.current_page
    searchInvitations(page)
  } else {
    show(result.message || t('hrm.member.toast.cancelFail'))
  }
}

const exporting = ref(false)
async function handleExport() {
  exporting.value = true
  const blob = await store.exportExcel({ name: search.value })
  exporting.value = false
  if (!blob) { show(t('hrm.member.toast.exportFail')); return }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `members-${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader :eyebrow="t('hrm.member.eyebrow')" :title="t('hrm.member.title')" :description="t('hrm.member.description')">
      <template #actions>
        <Btn variant="outline" :disabled="exporting" @click="handleExport"><FileText :size="14" /> {{ exporting ? t('common.loading') : t('hrm.member.exportExcel') }}</Btn>
        <Btn variant="primary" @click="inviteOpen = true"><UserPlus :size="14" /> {{ t('hrm.member.inviteBtn') }}</Btn>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MiniStat v-for="(s, i) in stats" :key="i" v-bind="s" :delay="40 + i * 40" />
    </div>

    <Tabs v-model="tab" :items="tabItems" />

    <template v-if="tab === 'list'">
      <FilterBar>
        <FieldInput v-model="search" :placeholder="t('hrm.member.filter.searchPlaceholder')" @update:model-value="resetPage" />
        <Select v-model="branch" :options="branchOptions" :width="170" @update:model-value="resetPage" />
        <Select v-model="role" :options="roleOptions" :width="170" @update:model-value="resetPage" />
        <Select v-model="status" :options="statusOptions" :width="170" @update:model-value="resetPage" />
        <div class="flex-1" />
        <span class="text-[12px] text-muted-foreground">{{ t('hrm.member.filter.results', { filtered: filtered.length, total: allMembers.length }) }}</span>
      </FilterBar>

      <ErrorBanner v-if="store.error" :message="store.error" @retry="store.fetchMembers()" />

      <div class="card-surface overflow-hidden rise" style="animation-delay: 180ms">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th class="text-left py-3 px-5">{{ t('hrm.member.col.employee') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.member.col.branch') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.member.col.role') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.member.col.position') }}</th>
                <th class="text-left py-3 px-3">{{ t('hrm.member.col.contact') }}</th>
                <th class="text-center py-3 px-3">{{ t('hrm.member.col.status') }}</th>
                <th class="text-right py-3 px-5">{{ t('hrm.member.col.joinDate') }}</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRow v-if="store.loading" :cols="6" :rows="5" />
              <template v-else>
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
                  <td class="py-3 px-3">
                    <span v-if="m.branch" class="inline-flex items-center gap-1.5 text-foreground/80"><Building2 :size="12" class="text-muted-foreground" />{{ m.branch }}</span>
                    <span v-else class="text-muted-foreground">—</span>
                  </td>
                  <td class="py-3 px-3 text-foreground/80">{{ roleLabel(m.role) }}</td>
                  <td class="py-3 px-3 text-foreground/70">{{ jobTitleLabel(m.jobTitleId) }}</td>
                  <td class="py-3 px-3">
                    <p class="text-foreground/85 truncate max-w-[200px]">{{ m.email }}</p>
                    <p class="text-[11.5px] text-muted-foreground font-mono">{{ m.phone }}</p>
                  </td>
                  <td class="py-3 px-3 text-center"><Badge :variant="MEMBER_STATUS_META[m.status]?.variant ?? 'gray'" dot>{{ t(MEMBER_STATUS_META[m.status]?.labelKey ?? m.status) }}</Badge></td>
                  <td class="py-3 px-5 text-right font-mono text-muted-foreground">{{ m.join }}</td>
                </tr>
                <tr v-if="paged.length === 0">
                  <td colspan="7">
                    <EmptyState :icon="Users" :title="t('hrm.member.empty.title')" :description="t('hrm.member.empty.description')" />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="store.pagination.total_row > store.pagination.row_per_page"
          data-test="pagination"
          :page="store.pagination.current_page"
          :total="store.pagination.total_row"
          :per-page="store.pagination.row_per_page"
          @change="(p) => store.fetchMembers({ current_page: p })"
        />
      </div>
    </template>

    <div v-else class="card-surface overflow-hidden rise" style="animation-delay: 180ms">
      <div class="px-5 py-3.5 border-b border-border/70 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-1">
          <FieldInput
            v-model="inviteSearch"
            :placeholder="t('hrm.member.filter.inviteSearchPlaceholder')"
            class="max-w-[220px]"
            @update:model-value="searchInvitations(1)"
          />
          <Select
            :model-value="inviteTypeFilter"
            :options="INVITE_TYPE_OPTIONS"
            :width="140"
            @update:model-value="(v) => onTypeFilterChange(Number(v))"
          />
          <Select
            :model-value="inviteStatusFilter"
            :options="INVITE_STATUS_OPTIONS"
            :width="160"
            @update:model-value="(v) => onStatusFilterChange(Number(v))"
          />
          <span class="text-[12px] text-muted-foreground">{{ t('hrm.member.filter.inviteResults', { total: inviteTotalCount }) }}</span>
        </div>
        <Btn variant="primary" size="sm" @click="inviteOpen = true"><UserPlus :size="13" /> {{ t('hrm.member.inviteNewBtn') }}</Btn>
      </div>
      <table class="w-full text-[13px]">
        <thead>
          <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
            <th class="text-left py-3 px-5">Email</th>
            <th class="text-left py-3 px-3">{{ t('hrm.member.inviteCol.type') }}</th>
            <th class="text-left py-3 px-3">{{ t('hrm.member.inviteCol.sentDate') }}</th>
            <th class="text-center py-3 px-3">{{ t('hrm.member.inviteCol.status') }}</th>
            <th class="text-right py-3 px-5">{{ t('hrm.member.inviteCol.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <SkeletonRow v-if="inviteLoading" :cols="5" :rows="5" />
          <template v-else>
            <tr v-for="inv in invitations" :key="inv.email" class="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
              <td class="py-3 px-5 font-mono text-[12.5px]">{{ inv.email }}</td>
              <td class="py-3 px-3">
                <Badge :variant="inv.type_name === 'Invite' ? 'sky' : 'violet'">{{ inv.type_name === 'Invite' ? t('hrm.member.inviteType.invite') : inv.type_name === 'Request' ? t('hrm.member.inviteType.request') : inv.type_name }}</Badge>
              </td>
              <td class="py-3 px-3 font-mono text-muted-foreground">{{ inv.sent }}</td>
              <td class="py-3 px-3 text-center">
                <Badge v-if="inv.status === 'pending'" variant="amber" dot>{{ t('hrm.member.inviteStatus.pendingBadge') }}</Badge>
                <Badge v-else-if="inv.status === 'accepted'" variant="sky" dot>{{ t('hrm.member.inviteStatus.accepted') }}</Badge>
                <Badge v-else-if="inv.status === 'registered'" variant="green" dot>{{ t('hrm.member.inviteStatus.registered') }}</Badge>
                <Badge v-else-if="inv.status === 'denied'" variant="red" dot>{{ t('hrm.member.inviteStatus.denied') }}</Badge>
                <Badge v-else variant="gray" dot>{{ t('hrm.member.inviteStatus.cancelled') }}</Badge>
              </td>
              <td class="py-3 px-5 text-right">
                <div class="inline-flex gap-1.5">
                  <Btn variant="outline" size="xs" :disabled="inv.allow_resend === false" @click.stop="onResend(inv)">{{ t('hrm.member.action.resend') }}</Btn>
                  <Btn variant="ghost" size="xs" :disabled="inv.status !== 'pending'" @click.stop="onCancel(inv)">{{ t('hrm.member.action.cancel') }}</Btn>
                </div>
              </td>
            </tr>
            <tr v-if="!inviteLoading && invitations.length === 0">
              <td colspan="5">
                <EmptyState :icon="Users" :title="t('hrm.member.empty.inviteTitle')" :description="t('hrm.member.empty.inviteDescription')" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <Pagination
        v-if="invitePagination.total_row > invitePagination.row_per_page"
        :page="invitePagination.current_page"
        :total="invitePagination.total_row"
        :per-page="invitePagination.row_per_page"
        @change="(p) => searchInvitations(p)"
      />
    </div>

    <MemberDetail v-model:open="drawerOpen" :member="openMember" :detail="openMemberDetail" />
    <InviteModal v-model:open="inviteOpen" @sent="onInvited" />
  </div>
</template>
