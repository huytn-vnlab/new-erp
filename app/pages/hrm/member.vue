<script setup lang="ts">
import { ref, computed } from 'vue'
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
import InviteModal from '~/components/member/InviteModal.vue'
import MemberDetail from '~/components/member/MemberDetail.vue'
import { Building2, FileText, UserPlus, Users } from 'lucide-vue-next'
import { MEMBERS, MEMBER_STATUS_META, BRANCHES, INVITATIONS, RANK_COLOR, type Member, type Invitation } from '~/mocks/members'

definePageMeta({ layout: 'admin' })

const search = ref('')
const branch = ref('all')
const role = ref('all')
const status = ref('all')
const tab = ref('list')
const page = ref(1)
const perPage = 10
const openMember = ref<Member | null>(null)
const drawerOpen = ref(false)
const inviteOpen = ref(false)
const invitations = ref<Invitation[]>([...INVITATIONS])
const { show } = useToast()

const roleOptions = computed(() => [{ value: 'all', label: 'Tất cả chức vụ' }, ...Array.from(new Set(MEMBERS.map(m => m.role))).map(r => ({ value: r, label: r }))])
const branchOptions = [{ value: 'all', label: 'Tất cả chi nhánh' }, ...BRANCHES.map(b => ({ value: b, label: b }))]
const statusOptions = [{ value: 'all', label: 'Tất cả trạng thái' }, ...Object.entries(MEMBER_STATUS_META).map(([k, v]) => ({ value: k, label: v.label }))]

const filtered = computed(() => MEMBERS.filter((m) => {
  if (search.value && !m.name.toLowerCase().includes(search.value.toLowerCase()) && !m.email.toLowerCase().includes(search.value.toLowerCase())) return false
  if (branch.value !== 'all' && m.branch !== branch.value) return false
  if (role.value !== 'all' && m.role !== role.value) return false
  if (status.value !== 'all' && m.status !== status.value) return false
  return true
}))
const paged = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))
const pendingCount = computed(() => invitations.value.filter(i => i.status === 'pending').length)
const resetPage = () => { page.value = 1 }

const stats = computed(() => [
  { label: 'Tổng nhân viên', value: MEMBERS.length, sublabel: '4 chi nhánh', trend: { dir: 'up' as const, value: '+2 tháng này' }, accent: 'primary' as const },
  { label: 'Đang làm việc', value: MEMBERS.filter(m => m.status === 'active').length, sublabel: `${Math.round(MEMBERS.filter(m => m.status === 'active').length / MEMBERS.length * 100)}% tổng số`, accent: 'green' as const },
  { label: 'Đang onboard', value: MEMBERS.filter(m => m.status === 'onboarding').length, sublabel: '2 sẽ chính thức tháng 6', accent: 'amber' as const },
  { label: 'Lời mời chờ duyệt', value: pendingCount.value, sublabel: 'Cần phản hồi', accent: 'violet' as const },
])
const tabItems = computed(() => [
  { value: 'list', label: 'Danh sách thành viên', count: filtered.value.length },
  { value: 'invites', label: 'Yêu cầu mời thành viên', count: invitations.value.length },
])

function openDetail(m: Member) { openMember.value = m; drawerOpen.value = true }
function onInvited(inv: { email: string; sent: string; by: string; status: 'pending' }) {
  invitations.value = [{ ...inv, role: '—', branch: '—' }, ...invitations.value]
  show('Lời mời đã được gửi tới ' + inv.email + '!')
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader eyebrow="HRM · Nhân sự" title="Quản lý nhân viên" description="Toàn bộ thành viên VNLab. Tìm kiếm, lọc theo chi nhánh / chức vụ / trạng thái và quản lý lời mời tham gia.">
      <template #actions>
        <Btn variant="outline"><FileText :size="14" /> Xuất Excel</Btn>
        <Btn variant="primary" @click="inviteOpen = true"><UserPlus :size="14" /> Mời thành viên</Btn>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MiniStat v-for="(s, i) in stats" :key="i" v-bind="s" :delay="40 + i * 40" />
    </div>

    <Tabs v-model="tab" :items="tabItems" />

    <template v-if="tab === 'list'">
      <FilterBar>
        <FieldInput v-model="search" placeholder="Tìm tên, email…" @update:model-value="resetPage" />
        <Select v-model="branch" :options="branchOptions" :width="170" @update:model-value="resetPage" />
        <Select v-model="role" :options="roleOptions" :width="170" @update:model-value="resetPage" />
        <Select v-model="status" :options="statusOptions" :width="170" @update:model-value="resetPage" />
        <div class="flex-1" />
        <span class="text-[12px] text-muted-foreground">{{ filtered.length }} / {{ MEMBERS.length }} kết quả</span>
      </FilterBar>

      <div class="card-surface overflow-hidden rise" style="animation-delay: 180ms">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th class="text-left py-3 px-5">Nhân viên</th>
                <th class="text-left py-3 px-3">Chi nhánh</th>
                <th class="text-left py-3 px-3">Chức vụ</th>
                <th class="text-left py-3 px-3">Liên hệ</th>
                <th class="text-center py-3 px-3">N. ngữ</th>
                <th class="text-center py-3 px-3">Rank</th>
                <th class="text-center py-3 px-3">Trạng thái</th>
                <th class="text-right py-3 px-5">Vào CT</th>
              </tr>
            </thead>
            <tbody>
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
                <td class="py-3 px-3"><span class="inline-flex items-center gap-1.5 text-foreground/80"><Building2 :size="12" class="text-muted-foreground" />{{ m.branch }}</span></td>
                <td class="py-3 px-3 text-foreground/80">{{ m.role }}</td>
                <td class="py-3 px-3">
                  <p class="text-foreground/85 truncate max-w-[200px]">{{ m.email }}</p>
                  <p class="text-[11.5px] text-muted-foreground font-mono">{{ m.phone }}</p>
                </td>
                <td class="py-3 px-3 text-center">
                  <span v-if="m.jp === '—'" class="text-muted-foreground">—</span>
                  <Badge v-else :variant="m.jp === 'N1' || m.jp === 'N2' ? 'primary' : 'gray'">{{ m.jp }}</Badge>
                </td>
                <td class="py-3 px-3 text-center">
                  <span v-if="m.rank === '—'" class="text-muted-foreground">—</span>
                  <span v-else class="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold text-white" :style="{ background: RANK_COLOR[m.rank] ?? '#a3a3a3' }">{{ m.rank }}</span>
                </td>
                <td class="py-3 px-3 text-center"><Badge :variant="MEMBER_STATUS_META[m.status].variant" dot>{{ MEMBER_STATUS_META[m.status].label }}</Badge></td>
                <td class="py-3 px-5 text-right font-mono text-muted-foreground">{{ m.join }}</td>
              </tr>
              <tr v-if="paged.length === 0">
                <td colspan="8" class="py-16 text-center text-muted-foreground">
                  <Users :size="36" class="mx-auto mb-2 opacity-30" />
                  <p class="text-[13px]">Không tìm thấy nhân viên phù hợp</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination v-if="filtered.length > perPage" :page="page" :total="filtered.length" :per-page="perPage" @change="(p) => page = p" />
      </div>
    </template>

    <div v-else class="card-surface overflow-hidden rise" style="animation-delay: 180ms">
      <div class="px-5 py-3.5 border-b border-border/70 flex items-center justify-between">
        <h3 class="section-title">Lời mời đang chờ phản hồi</h3>
        <Btn variant="primary" size="sm" @click="inviteOpen = true"><UserPlus :size="13" /> Mời mới</Btn>
      </div>
      <table class="w-full text-[13px]">
        <thead>
          <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
            <th class="text-left py-3 px-5">Email</th>
            <th class="text-left py-3 px-3">Chức vụ dự kiến</th>
            <th class="text-left py-3 px-3">Chi nhánh</th>
            <th class="text-left py-3 px-3">Người mời</th>
            <th class="text-left py-3 px-3">Ngày gửi</th>
            <th class="text-center py-3 px-3">Trạng thái</th>
            <th class="text-right py-3 px-5">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in invitations" :key="inv.email" class="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
            <td class="py-3 px-5 font-mono text-[12.5px]">{{ inv.email }}</td>
            <td class="py-3 px-3 text-foreground/85">{{ inv.role }}</td>
            <td class="py-3 px-3 text-foreground/85">{{ inv.branch }}</td>
            <td class="py-3 px-3 text-foreground/85">{{ inv.by }}</td>
            <td class="py-3 px-3 font-mono text-muted-foreground">{{ inv.sent }}</td>
            <td class="py-3 px-3 text-center">
              <Badge v-if="inv.status === 'pending'" variant="amber" dot>Chờ phản hồi</Badge>
              <Badge v-else variant="gray">Đã hết hạn</Badge>
            </td>
            <td class="py-3 px-5 text-right">
              <div class="inline-flex gap-1.5">
                <Btn variant="outline" size="xs">Gửi lại</Btn>
                <Btn variant="ghost" size="xs">Huỷ</Btn>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <MemberDetail v-model:open="drawerOpen" :member="openMember" />
    <InviteModal v-model:open="inviteOpen" @sent="onInvited" />
  </div>
</template>
