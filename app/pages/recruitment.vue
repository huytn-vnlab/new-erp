<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FileText, Plus, X, UserPlus, Briefcase } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import Select from '~/components/base/Select.vue'
import FilterBar from '~/components/base/FilterBar.vue'
import FieldInput from '~/components/base/FieldInput.vue'
import SkeletonRow from '~/components/base/SkeletonRow.vue'
import EmptyState from '~/components/base/EmptyState.vue'
import ErrorBanner from '~/components/base/ErrorBanner.vue'
import type { JobRow, CvRow } from '~/types'
import { useRecruitmentStore } from '~/stores/recruitment'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const recruitStore = useRecruitmentStore()
onMounted(() => { recruitStore.fetchJobs(); recruitStore.fetchCvs() })

type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'
type JobStatus = 'open' | 'closed' | 'draft'
type ApplicantStage = 'review' | 'screened' | 'interview' | 'offer' | 'accepted' | 'rejected'

type Job = {
  id: number
  title: string
  branch: string
  dept: string
  count: number
  applied: number
  interviewed: number
  offered: number
  status: JobStatus
  start: string
  end: string
  jp: string
  salary: string
  owner: string
  desc: string
}

type Applicant = {
  name: string
  src: string
  applied: string
  stage: ApplicantStage
  note?: string
}

const STAGE_META: Record<ApplicantStage, { label: string; variant: BadgeVariant; step: number }> = {
  review:    { label: 'Xem hồ sơ',  variant: 'gray',   step: 1 },
  screened:  { label: 'Đã screen',  variant: 'sky',    step: 2 },
  interview: { label: 'Phỏng vấn',  variant: 'amber',  step: 3 },
  offer:     { label: 'Gửi offer',  variant: 'violet', step: 4 },
  accepted:  { label: 'Đã nhận',    variant: 'green',  step: 5 },
  rejected:  { label: 'Từ chối',    variant: 'red',    step: 0 },
}

const JOB_STATUS_META: Record<JobStatus, { label: string; variant: BadgeVariant }> = {
  open:   { label: 'Đang tuyển', variant: 'green' },
  closed: { label: 'Đã đóng',   variant: 'gray'  },
  draft:  { label: 'Nháp',      variant: 'amber' },
}

const SRC_COLOR: Record<string, string> = {
  LinkedIn:  '#0a66c2',
  JobStreet: '#e15a2b',
  Referral:  '#7c3aed',
  Website:   '#22c55e',
}

const FALLBACK_APPLICANTS: Applicant[] = [
  { name: 'Nguyễn Minh Khoa', src: 'LinkedIn',  applied: '18/05/2026', stage: 'interview', note: '3Y exp, portfolio tốt.' },
  { name: 'Trần Văn Phong',   src: 'JobStreet', applied: '15/05/2026', stage: 'review',    note: '4Y kinh nghiệm, không có JP.' },
  { name: 'Phạm Thu Linh',    src: 'Referral',  applied: '10/05/2026', stage: 'offer',     note: '5Y, N3. Đề xuất 52M.' },
  { name: 'Lê Đức Anh',       src: 'LinkedIn',  applied: '08/05/2026', stage: 'screened',  note: 'Fresh + intern 1Y.' },
  { name: 'Hoàng Thị Tâm',    src: 'Website',   applied: '05/05/2026', stage: 'rejected',  note: 'Không pass test R1.' },
]

const JOB_STATUS_NUM_MAP: Record<number, JobStatus> = { 1: 'open', 2: 'closed', 3: 'draft' }

function mapJobRow(r: JobRow): Job {
  return {
    id: r.id,
    title: r.title,
    branch: r.branch ?? '',
    dept: r.branch ?? '',
    count: r.quantity ?? 0,
    applied: 0,
    interviewed: 0,
    offered: 0,
    status: JOB_STATUS_NUM_MAP[r.status] ?? 'open',
    start: r.created_at?.slice(0, 10).split('-').reverse().join('/') ?? '',
    end: '',
    jp: '—',
    salary: '',
    owner: '',
    desc: r.description ?? '',
  }
}

const activeTab = ref<'jobs' | 'cvs'>('jobs')

const allJobs = computed<Job[]>(() => recruitStore.jobs.map(mapJobRow))

const search = ref('')
const statusF = ref('all')
const deptF = ref('all')
const openJob = ref<Job | null>(null)

const statusOpts = [
  { value: 'all', label: 'Tất cả trạng thái' },
  ...Object.entries(JOB_STATUS_META).map(([k, v]) => ({ value: k, label: v.label })),
]

const allDepts = computed(() => [...new Set(allJobs.value.map(j => j.dept).filter(Boolean))])
const deptOpts = computed(() => [
  { value: 'all', label: 'Tất cả bộ phận' },
  ...allDepts.value.map(d => ({ value: d, label: d })),
])

const filtered = computed(() =>
  allJobs.value.filter(j => {
    if (search.value && !j.title.toLowerCase().includes(search.value.toLowerCase())) return false
    if (statusF.value !== 'all' && j.status !== statusF.value) return false
    if (deptF.value !== 'all' && j.dept !== deptF.value) return false
    return true
  })
)

const stats = computed(() => {
  const jobs = allJobs.value
  const open = jobs.filter(j => j.status === 'open').length
  const drafts = jobs.filter(j => j.status === 'draft').length
  const totalApplied = jobs.reduce((a, j) => a + j.applied, 0)
  const totalInterviewed = jobs.reduce((a, j) => a + j.interviewed, 0)
  const totalOffers = jobs.reduce((a, j) => a + j.offered, 0)
  const convRate = totalApplied > 0 ? Math.round(totalOffers / totalApplied * 100) : 0
  return { open, drafts, totalApplied, totalInterviewed, totalOffers, convRate }
})

function getApplicants(jobId: number, max: number) {
  return FALLBACK_APPLICANTS.slice(0, max)
}

const FUNNEL_COLORS = [
  'hsl(var(--primary-h) var(--primary-s) 70% / 0.6)',
  'hsl(38 92% 55% / 0.7)',
  'hsl(265 60% 60% / 0.7)',
  'hsl(160 60% 50% / 0.7)',
]
const FUNNEL_LABELS = ['Nhận hồ sơ', 'Phỏng vấn', 'Gửi offer', 'Accepted']

function funnelVals(j: Job) {
  return [j.applied, j.interviewed, j.offered, j.offered > 0 ? Math.ceil(j.offered * 0.7) : 0]
}

const DETAIL_PIPELINE = [
  { l: 'Đã nhận',   color: 'hsl(var(--primary-h) var(--primary-s) 55%)' },
  { l: 'Phỏng vấn', color: 'hsl(38 92% 50%)' },
  { l: 'Offer',     color: 'hsl(265 60% 55%)' },
  { l: 'Headcount', color: 'hsl(160 60% 45%)' },
]

function detailPipelineVal(j: Job, i: number): number {
  return ([j.applied, j.interviewed, j.offered, j.count])[i] ?? 0
}

function pipelineBg(color: string): string {
  return color.endsWith(')') ? color.replace(')', ' / 0.07)') : color
}

// CV status label
function cvStatusLabel(status: number): string {
  const map: Record<number, string> = { 1: 'Đang xét', 2: 'Phỏng vấn', 3: 'Trúng tuyển', 4: 'Từ chối' }
  return map[status] ?? 'Không rõ'
}
function cvStatusVariant(status: number): BadgeVariant {
  const map: Record<number, BadgeVariant> = { 1: 'amber', 2: 'sky', 3: 'green', 4: 'red' }
  return map[status] ?? 'gray'
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      eyebrow="Tuyển dụng"
      title="Quản lý tin tuyển dụng"
      description="Theo dõi pipeline tuyển dụng — từ đăng tin đến offer. Xem ứng viên theo từng vị trí."
    >
      <template #actions>
        <Btn variant="outline"><FileText :size="14" />Xuất báo cáo</Btn>
        <Btn variant="primary"><Plus :size="14" />Tạo tin mới</Btn>
      </template>
    </PageHeader>

    <!-- Error banner -->
    <ErrorBanner v-if="recruitStore.error" :message="recruitStore.error" @retry="recruitStore.fetchJobs()" />

    <!-- MiniStats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MiniStat label="Vị trí đang tuyển" :value="stats.open" :sublabel="`${stats.drafts} tin nháp chờ đăng`" accent="primary" :delay="40" />
      <MiniStat label="Ứng viên nhận được" :value="stats.totalApplied" sublabel="Tất cả vị trí" accent="green" :delay="80" />
      <MiniStat label="Đang phỏng vấn" :value="stats.totalInterviewed" sublabel="Bước 3/5 trong pipeline" accent="amber" :delay="120" />
      <MiniStat label="Tỷ lệ offer" :value="`${stats.convRate}%`" :sublabel="`${stats.totalOffers} offers đã gửi`" accent="violet" :delay="160" />
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-border/60">
      <button
        class="tab-trigger"
        :class="{ 'tab-trigger--active': activeTab === 'jobs' }"
        @click="activeTab = 'jobs'"
      >Tin tuyển dụng</button>
      <button
        class="tab-trigger"
        :class="{ 'tab-trigger--active': activeTab === 'cvs' }"
        @click="activeTab = 'cvs'"
      >CV / Ứng viên</button>
    </div>

    <!-- Jobs tab -->
    <template v-if="activeTab === 'jobs'">
      <!-- Filter bar -->
      <FilterBar>
        <FieldInput v-model="search" placeholder="Tìm vị trí…" :width="220" />
        <Select v-model="statusF" :options="statusOpts" style="min-width: 150px" />
        <Select v-model="deptF" :options="deptOpts" style="min-width: 170px" />
        <div class="flex-1" />
        <span class="text-[12px] text-muted-foreground">{{ filtered.length }} tin</span>
      </FilterBar>

      <!-- Job list table -->
      <div class="card-surface overflow-hidden rise" style="animation-delay: 180ms">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 860px">
            <thead>
              <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th class="text-left py-3 px-5">Vị trí</th>
                <th class="text-left py-3 px-3">Bộ phận</th>
                <th class="text-left py-3 px-3">Chi nhánh</th>
                <th class="text-center py-3 px-3">Tuyển</th>
                <th class="text-left py-3 px-3" style="min-width: 180px">Pipeline</th>
                <th class="text-center py-3 px-3">JLPT</th>
                <th class="text-center py-3 px-3">Trạng thái</th>
                <th class="text-right py-3 px-5">Deadline</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRow v-if="recruitStore.loading" :cols="8" :rows="5" />
              <template v-else-if="filtered.length === 0">
                <tr>
                  <td colspan="8" class="py-0">
                    <EmptyState :icon="Briefcase" title="Không có tin tuyển dụng" description="Chưa có vị trí nào phù hợp với bộ lọc hiện tại." />
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr
                  v-for="j in filtered" :key="j.id"
                  class="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  @click="openJob = j"
                >
                  <td class="py-3.5 px-5">
                    <p class="font-semibold text-foreground">{{ j.title }}</p>
                    <p class="text-[11.5px] text-muted-foreground mt-0.5">
                      {{ j.count }} headcount · {{ j.salary }}
                      <span
                        v-if="j.jp !== '—'"
                        class="ml-1.5 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10.5px]"
                      >{{ j.jp }}</span>
                    </p>
                  </td>
                  <td class="py-3.5 px-3 text-foreground/85">{{ j.dept }}</td>
                  <td class="py-3.5 px-3 text-foreground/85">{{ j.branch }}</td>
                  <td class="py-3.5 px-3 text-center">
                    <span class="font-bold tabular-nums text-primary">{{ j.applied }}</span>
                    <p class="text-[10.5px] text-muted-foreground">ứng viên</p>
                  </td>
                  <td class="py-3.5 px-3">
                    <div class="flex items-end gap-0.5 h-8">
                      <div
                        v-for="(n, i) in funnelVals(j)" :key="i"
                        class="flex-1 rounded-sm"
                        style="min-height: 2px"
                        :style="{
                          height: `${Math.max(4, (n / Math.max(j.applied, 1)) * 100)}%`,
                          background: FUNNEL_COLORS[i],
                        }"
                        :title="`${FUNNEL_LABELS[i]}: ${n}`"
                      />
                    </div>
                    <p class="text-[10px] text-muted-foreground mt-1 tabular-nums">
                      {{ j.applied }} → {{ j.interviewed }} → {{ j.offered }}
                    </p>
                  </td>
                  <td class="py-3.5 px-3 text-center">
                    <span v-if="j.jp === '—'" class="text-muted-foreground">—</span>
                    <span v-else class="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[11px] font-semibold">{{ j.jp }}</span>
                  </td>
                  <td class="py-3.5 px-3 text-center">
                    <Badge :variant="JOB_STATUS_META[j.status].variant" dot>{{ JOB_STATUS_META[j.status].label }}</Badge>
                  </td>
                  <td class="py-3.5 px-5 text-right font-mono text-muted-foreground text-[12px]">{{ j.end }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- CVs tab -->
    <template v-if="activeTab === 'cvs'">
      <div class="card-surface overflow-hidden rise" style="animation-delay: 180ms">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 700px">
            <thead>
              <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th class="text-left py-3 px-5">Họ tên</th>
                <th class="text-left py-3 px-3">Email</th>
                <th class="text-center py-3 px-3">Trạng thái</th>
                <th class="text-right py-3 px-5">Ngày nộp</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRow v-if="recruitStore.loading" :cols="4" :rows="5" />
              <template v-else-if="recruitStore.cvs.length === 0">
                <tr>
                  <td colspan="4" class="py-0">
                    <EmptyState :icon="Briefcase" title="Chưa có ứng viên" description="Chưa có hồ sơ ứng viên nào được ghi nhận." />
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr
                  v-for="cv in recruitStore.cvs" :key="cv.id"
                  class="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td class="py-3.5 px-5 font-semibold text-foreground">{{ cv.full_name }}</td>
                  <td class="py-3.5 px-3 text-foreground/85">{{ cv.email }}</td>
                  <td class="py-3.5 px-3 text-center">
                    <Badge :variant="cvStatusVariant(cv.status)" dot>{{ cvStatusLabel(cv.status) }}</Badge>
                  </td>
                  <td class="py-3.5 px-5 text-right font-mono text-muted-foreground text-[12px]">{{ cv.created_at }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Job detail slide-over -->
    <Teleport to="body">
      <div v-if="openJob" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="openJob = null" />
        <div class="relative bg-background border-l border-border w-full max-w-2xl h-full flex flex-col rise" style="animation-duration: .3s">
          <!-- Header -->
          <div class="p-5 border-b border-border/70 shrink-0">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5 mb-1">
                  <Badge :variant="JOB_STATUS_META[openJob.status].variant" dot>{{ JOB_STATUS_META[openJob.status].label }}</Badge>
                  <Badge variant="gray">{{ openJob.dept }}</Badge>
                  <span
                    v-if="openJob.jp !== '—'"
                    class="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10.5px] font-semibold"
                  >{{ openJob.jp }}</span>
                </div>
                <h2 class="text-[20px] font-bold font-heading text-foreground">{{ openJob.title }}</h2>
                <p class="text-[12.5px] text-muted-foreground mt-0.5">{{ openJob.branch }} · {{ openJob.count }} headcount · {{ openJob.salary }} VND/tháng</p>
              </div>
              <button class="p-2 rounded-md hover:bg-muted text-muted-foreground shrink-0" @click="openJob = null">
                <X :size="16" />
              </button>
            </div>

            <!-- Pipeline 4-col funnel stats -->
            <div class="mt-4 grid grid-cols-4 gap-2">
              <div
                v-for="(pipe, i) in DETAIL_PIPELINE" :key="pipe.l"
                class="text-center rounded-xl p-3"
                :style="{ background: pipelineBg(pipe.color) }"
              >
                <p class="text-[22px] font-bold font-heading tabular-nums" :style="{ color: pipe.color }">
                  {{ detailPipelineVal(openJob, i) }}
                </p>
                <p class="text-[10.5px] text-muted-foreground">{{ pipe.l }}</p>
              </div>
            </div>
          </div>

          <!-- Scrollable body -->
          <div class="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
            <div>
              <p class="section-title mb-2">Mô tả vị trí</p>
              <p class="text-[13px] text-foreground/85 leading-relaxed">{{ openJob.desc }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3 text-[12.5px]">
              <div
                v-for="[l, v] in [['Người phụ trách', openJob.owner], ['Ngày đăng', openJob.start], ['Hạn nộp', openJob.end], ['Chi nhánh', openJob.branch]]"
                :key="String(l)"
              >
                <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">{{ l }}</p>
                <p class="mt-0.5 font-medium text-foreground">{{ v }}</p>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-3">
                <p class="section-title">Ứng viên ({{ getApplicants(openJob.id, openJob.applied).length }})</p>
                <Btn variant="primary" size="xs"><UserPlus :size="11" />Thêm ứng viên</Btn>
              </div>
              <ul class="space-y-2">
                <li
                  v-for="(a, i) in getApplicants(openJob.id, openJob.applied)"
                  :key="i"
                  class="card-surface interactive p-3.5 flex items-center gap-3 cursor-pointer"
                >
                  <Avatar :name="a.name" :size="36" />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <p class="font-semibold text-foreground">{{ a.name }}</p>
                      <span
                        class="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                        :style="{ background: SRC_COLOR[a.src] || '#666' }"
                      >{{ a.src }}</span>
                    </div>
                    <p v-if="a.note" class="text-[11.5px] text-muted-foreground mt-0.5">{{ a.note }}</p>
                    <p class="text-[11px] font-mono text-muted-foreground mt-0.5">{{ a.applied }}</p>
                  </div>
                  <div class="shrink-0">
                    <Badge :variant="STAGE_META[a.stage].variant" dot>{{ STAGE_META[a.stage].label }}</Badge>
                  </div>
                  <div class="shrink-0">
                    <Btn v-if="a.stage !== 'rejected' && a.stage !== 'accepted'" variant="outline" size="xs">Cập nhật</Btn>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-border/70 flex items-center gap-2 shrink-0">
            <Btn variant="ghost" size="sm" @click="openJob = null">Đóng</Btn>
            <div class="flex-1" />
            <Btn variant="outline" size="sm"><FileText :size="13" />Chỉnh sửa</Btn>
            <Btn v-if="openJob.status === 'open'" variant="danger" size="sm">Đóng tin</Btn>
            <Btn v-else variant="primary" size="sm">Mở lại</Btn>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
