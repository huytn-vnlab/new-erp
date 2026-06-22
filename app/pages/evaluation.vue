<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { FileText, Plus, X, Check, ChevronDown, ChevronRight, Trash2 } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import Select from '~/components/base/Select.vue'
import FilterBar from '~/components/base/FilterBar.vue'
import FieldInput from '~/components/base/FieldInput.vue'
import SectionCard from '~/components/home/SectionCard.vue'
import LineChart from '~/components/charts/LineChart.vue'
import {
  EVALUATIONS, EVAL_SECTIONS, EVAL_STATUS_META, RANK_COLOR, STARTER_GOALS, EVAL_PROJECT_OPTIONS,
  rankFromScore, weightedTotal, totalScore,
  type Evaluation, type EvalSectionKey,
} from '~/mocks/evaluation'
import { useEvaluationStore } from '~/stores/evaluation'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const auth = useAuth()
const evalStore = useEvaluationStore()
onMounted(() => evalStore.fetchEvaluations({
  year: parseInt(year.value),
  quarter: parseInt(quarter.value),
}))

watch([year, quarter], () => {
  evalStore.fetchEvaluations({ year: parseInt(year.value), quarter: parseInt(quarter.value) })
})

const ME = computed(() => auth.user.value?.name ?? 'Nguyễn Văn An')

// ── List state ──
const year = ref('2026')
const quarter = ref('2')
const tab = ref<'manage' | 'mine' | 'reports'>('manage')
const search = ref('')
const statusF = ref('all')
const rankF = ref('all')
const openEval = ref<Evaluation | null>(null)
const showCreate = ref(false)

// ── Form state ──
const formMode = ref<'self' | 'supervisor'>('self')
const formYear = ref('2026')
const formQuarter = ref('2')
const commentSelf = ref('Tự đánh giá: kỳ này em tập trung mạnh vào dự án Cổng thanh toán XYZ, hoàn thành module checkout đúng deadline. Blog cá nhân vẫn cần đẩy mạnh hơn — mới ra được 2 bài.')
const commentSup = ref('')
const sectionCollapsed = ref<Record<string, boolean>>({ common: false, personal: false, project: false, other: false })

type FormGoalRow = { id: string; weight: string; name: string; actual: string; result: string; target?: string; detail?: string; project?: string }
type FormGoals = Record<EvalSectionKey, FormGoalRow[]>

const goals = reactive<FormGoals>(
  Object.fromEntries(
    Object.entries(STARTER_GOALS).map(([k, rows]) => [
      k,
      rows.map(r => ({ ...r, weight: String(r.weight), actual: String(r.actual ?? ''), result: String(r.result ?? '') })),
    ])
  ) as FormGoals
)

// ── Computed: list ──
const yearOpts = ['2026', '2025', '2024', '2023'].map(y => ({ value: y, label: y }))
const statusOpts = [
  { value: 'all', label: 'Tất cả trạng thái' },
  ...Object.entries(EVAL_STATUS_META).map(([k, v]) => ({ value: k, label: v.label })),
]
const rankOpts = [
  { value: 'all', label: 'Tất cả rank' },
  ...['S', 'A', 'B', 'C', 'D', 'E'].map(r => ({ value: r, label: `Rank ${r}` })),
]

const allRows = computed(() => EVALUATIONS.filter(e => String(e.year) === year.value && String(e.q) === quarter.value))

const filtered = computed(() =>
  allRows.value.filter(e => {
    if (tab.value === 'mine' && e.user !== ME.value) return false
    if (search.value && !e.user.toLowerCase().includes(search.value.toLowerCase())) return false
    if (statusF.value !== 'all' && e.status !== statusF.value) return false
    const r = rankFromScore(totalScore(e))
    if (rankF.value !== 'all' && r !== rankF.value) return false
    return true
  })
)

const stats = computed(() => {
  const submitted = allRows.value.filter(e => e.status === 'submitted')
  const submittedCount = submitted.length
  const completionPct = Math.round((submittedCount / Math.max(allRows.value.length, 1)) * 100)
  const avgScore = submittedCount > 0 ? (submitted.reduce((a, e) => a + totalScore(e), 0) / submittedCount).toFixed(1) : '0'
  const topS = submitted.filter(e => totalScore(e) >= 9).length
  const needNudge = allRows.value.length - submittedCount
  return { submittedCount, completionPct, avgScore, topS, needNudge, total: allRows.value.length }
})

const rankDist = computed(() => {
  const dist: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0 }
  allRows.value.filter(e => e.status === 'submitted').forEach(e => {
    const k = rankFromScore(totalScore(e))
    dist[k] = (dist[k] ?? 0) + 1
  })
  return dist
})
const maxRankDist = computed(() => Math.max(...Object.values(rankDist.value), 1))

const topPerformers = computed(() =>
  [...allRows.value.filter(e => e.status === 'submitted')]
    .sort((a, b) => totalScore(b) - totalScore(a))
    .slice(0, 5)
)

const sectionAverages = computed(() => {
  const subs = allRows.value.filter(e => e.status === 'submitted')
  return EVAL_SECTIONS.map(s => ({
    ...s,
    avg: subs.length === 0 ? 0 : Math.round(subs.reduce((a, e) => a + (e.pct[s.key] || 0), 0) / subs.length),
  }))
})

const tabCounts = computed(() => ({
  manage: allRows.value.length,
  mine: allRows.value.filter(e => e.user === ME.value).length,
}))

// ── Computed: form totals ──
const allFormRows = computed(() => [...goals.common, ...goals.personal, ...goals.project, ...goals.other])
const totalWeight = computed(() => allFormRows.value.reduce((a, g) => a + (Number(g.weight) || 0), 0))
const totalFormScore = computed(() => +allFormRows.value.reduce((a, g) => a + rowScore(g), 0).toFixed(1))
const formRank10 = computed(() => +(totalFormScore.value / 10).toFixed(1))
const formRank = computed(() => rankFromScore(formRank10.value))
const weightDeficit = computed(() => 100 - totalWeight.value)

// EvalDetail helpers
const detailTotal = computed(() => openEval.value ? totalScore(openEval.value) : 0)
const detailRank = computed(() => rankFromScore(detailTotal.value))
const DONUT_R = 48
const DONUT_C = 2 * Math.PI * DONUT_R
const detailDashOffset = computed(() => DONUT_C * (1 - detailTotal.value / 10))

const HISTORY_ROWS = [
  { p: 'Q1/2026', s: 8.1 }, { p: 'Q4/2025', s: 7.6 }, { p: 'Q3/2025', s: 7.2 },
]

// ── Functions ──
function rowScore(g: FormGoalRow): number {
  const pct = g.result !== '' ? Number(g.result) : (g.actual !== '' ? Number(g.actual) : 0)
  return +((Number(g.weight) || 0) * (pct || 0) / 100).toFixed(1)
}

function addGoalRow(key: EvalSectionKey) {
  const id = key + '_' + Date.now()
  const base: FormGoalRow = { id, weight: '0', name: '', actual: '', result: '' }
  if (key === 'project') base.project = ''
  else if (key === 'other') base.detail = ''
  else base.target = ''
  goals[key].push(base)
}

function removeGoalRow(key: EvalSectionKey, id: string) {
  const idx = goals[key].findIndex(r => r.id === id)
  if (idx >= 0) goals[key].splice(idx, 1)
}

function accentOpacity(accent: string, opacity: number): string {
  if (accent.includes('var(--primary)') && !accent.includes('var(--primary-h)')) {
    return `hsl(var(--primary-h) var(--primary-s) 55% / ${opacity})`
  }
  return accent.replace(')', ` / ${opacity})`)
}

function sectionGridCols(key: EvalSectionKey): string {
  return key === 'project'
    ? '64px 180px 1fr 110px 110px 80px 28px'
    : '64px 1fr 1.4fr 110px 110px 80px 28px'
}
</script>

<template>
<div>
  <!-- ============================================================ FORM MODE -->
  <div v-if="showCreate" class="space-y-6">
    <PageHeader
      :eyebrow="undefined"
      :title="undefined"
    >
      <template #eyebrow>
        <span class="inline-flex items-center gap-2 text-[12px]">
          <button class="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" @click="showCreate = false">
            <ChevronRight :size="11" class="rotate-180" /> Đánh giá nhân sự
          </button>
          <span class="text-border">/</span>
          <span class="text-foreground font-semibold">Tạo phiếu đánh giá</span>
        </span>
      </template>
      <template #title>
        Phiếu đánh giá <em class="font-display not-italic text-primary">Q{{ formQuarter }}/{{ formYear }}</em>
      </template>
      <template #actions>
        <Btn variant="ghost" @click="showCreate = false">Huỷ</Btn>
        <Btn variant="outline"><FileText :size="14" />Lưu nháp</Btn>
        <Btn variant="primary"><Check :size="14" />Gửi phiếu</Btn>
      </template>
    </PageHeader>

    <!-- Hero summary card -->
    <div class="card-surface overflow-hidden rise" style="animation-delay: 40ms">
      <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-0">
        <div class="p-5 relative overflow-hidden">
          <div class="absolute -right-12 -top-12 w-44 h-44 rounded-full pointer-events-none"
            style="background: radial-gradient(circle, hsl(var(--primary-h) var(--primary-s) 60% / 0.16), transparent 65%)" />
          <div class="relative flex items-start gap-4">
            <Avatar name="Trần Ngọc Huy" :size="56" />
            <div class="min-w-0 flex-1">
              <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Nhân viên được đánh giá</p>
              <h2 class="text-[20px] font-bold font-heading text-foreground mt-0.5 leading-tight">Trần Ngọc Huy</h2>
              <p class="text-[12.5px] text-muted-foreground mt-0.5">Backend Engineer · Chi nhánh Tokyo</p>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="primary">#0028</Badge>
                <Badge variant="gray">Kỳ trước: Rank A · 7.8/10</Badge>
              </div>
            </div>
          </div>
          <div class="mt-5 pt-5 border-t border-border/70 grid grid-cols-2 gap-4">
            <div>
              <label class="text-[10.5px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5 block">Kỳ đánh giá</label>
              <div class="flex items-center gap-2">
                <div class="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
                  <button
                    v-for="q in ['1','2','3','4']" :key="q"
                    class="h-7 px-2.5 rounded-[5px] text-[11.5px] font-semibold tabular-nums"
                    :class="formQuarter === q ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
                    @click="formQuarter = q"
                  >Q{{ q }}</button>
                </div>
                <Select v-model="formYear" :options="yearOpts" style="min-width: 90px" />
              </div>
            </div>
            <div>
              <label class="text-[10.5px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5 block">Vai trò nhập</label>
              <div class="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
                <button
                  class="h-7 px-3 rounded-[5px] text-[11.5px] font-semibold"
                  :class="formMode === 'self' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
                  @click="formMode = 'self'"
                >Nhân viên</button>
                <button
                  class="h-7 px-3 rounded-[5px] text-[11.5px] font-semibold"
                  :class="formMode === 'supervisor' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
                  @click="formMode = 'supervisor'"
                >Cấp trên</button>
              </div>
              <p class="text-[10.5px] text-muted-foreground mt-1 italic">
                {{ formMode === 'self' ? 'Đang nhập phần Thực tế (%)' : 'Đang nhập phần Kết quả (%)' }}
              </p>
            </div>
          </div>
        </div>
        <div class="border-l border-border/70 bg-muted/20 p-5 grid grid-cols-3 gap-4 items-center">
          <div class="text-center">
            <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Tổng trọng số</p>
            <p class="text-[28px] font-bold font-heading tabular-nums mt-1"
              :class="totalWeight === 100 ? 'text-emerald-600' : totalWeight > 100 ? 'text-red-500' : 'text-foreground'">
              {{ totalWeight }}<span class="text-muted-foreground text-[14px] font-normal">/100</span>
            </p>
            <p v-if="totalWeight !== 100" class="text-[10.5px] mt-0.5" :class="weightDeficit > 0 ? 'text-amber-600' : 'text-red-500'">
              {{ weightDeficit > 0 ? `Còn thiếu ${weightDeficit}%` : `Vượt ${-weightDeficit}%` }}
            </p>
            <p v-else class="text-[10.5px] mt-0.5 text-emerald-600">Đủ 100% ✓</p>
          </div>
          <div class="text-center">
            <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Tổng điểm</p>
            <p class="text-[28px] font-bold font-heading tabular-nums mt-1 text-primary">
              {{ totalFormScore.toFixed(1) }}<span class="text-muted-foreground text-[14px] font-normal">/100</span>
            </p>
            <p class="text-[10.5px] text-muted-foreground mt-0.5">Quy đổi: {{ formRank10.toFixed(1) }}/10</p>
          </div>
          <div class="text-center">
            <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Xếp hạng</p>
            <div class="mt-1.5 inline-flex flex-col items-center gap-0.5">
              <span class="inline-flex items-center justify-center w-12 h-12 rounded-xl text-[22px] font-bold text-white font-heading"
                :style="{ background: RANK_COLOR[formRank] }">{{ formRank }}</span>
              <span class="text-[10.5px] text-muted-foreground italic">
                {{ formRank === 'S' ? 'Xuất sắc' : formRank === 'A' ? 'Tốt' : formRank === 'B' ? 'Đạt' : formRank === 'C' ? 'Trung bình' : formRank === 'D' ? 'Cần cải thiện' : 'Yếu' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Goal sections -->
    <div v-for="(s, si) in EVAL_SECTIONS" :key="s.key" class="card-surface rise overflow-hidden" :style="{ animationDelay: `${80 + si * 60}ms`, background: accentOpacity(s.accent, 0.05) }">
      <div class="px-5 py-3 border-b flex items-center gap-3"
        :style="{ background: accentOpacity(s.accent, 0.12), borderColor: accentOpacity(s.accent, 0.25) }">
        <span class="h-7 w-1 rounded-full" :style="{ background: s.accent }" />
        <button class="inline-flex items-center gap-2" @click="sectionCollapsed[s.key] = !sectionCollapsed[s.key]">
          <ChevronDown :size="14" class="text-muted-foreground transition-transform" :class="sectionCollapsed[s.key] ? '-rotate-90' : ''" />
          <h3 class="section-title">{{ s.label }}</h3>
        </button>
        <p class="text-[11.5px] text-muted-foreground hidden md:block">— {{ s.desc }}</p>
        <div class="flex-1" />
        <div class="flex items-center gap-2 text-[11.5px]">
          <span class="px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-mono">
            Trọng số <strong class="text-foreground tabular-nums">{{ goals[s.key as EvalSectionKey].reduce((a, g) => a + (Number(g.weight) || 0), 0) }}%</strong>
          </span>
          <span class="px-2 py-0.5 rounded-full font-mono" :style="{ background: accentOpacity(s.accent, 0.14), color: s.accent }">
            Điểm <strong class="tabular-nums">{{ goals[s.key as EvalSectionKey].reduce((a, g) => a + rowScore(g), 0).toFixed(1) }}</strong>
          </span>
        </div>
      </div>

      <div v-if="!sectionCollapsed[s.key]" class="divide-y divide-border/60">
        <!-- Column headers -->
        <div class="px-5 py-2 bg-muted/30 grid items-center gap-3 text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground"
          :style="{ gridTemplateColumns: sectionGridCols(s.key as EvalSectionKey) }">
          <span>Trọng số</span>
          <span>{{ s.key === 'project' ? 'Dự án' : 'Tên mục tiêu' }}</span>
          <span>{{ s.key === 'project' ? 'Tên mục tiêu' : s.key === 'other' ? 'Chi tiết' : 'Mục tiêu cụ thể' }}</span>
          <span class="text-right">Thực tế (%)</span>
          <span class="text-right" style="color: hsl(265 60% 55%)">Kết quả (%)</span>
          <span class="text-right">Điểm</span>
          <span />
        </div>

        <!-- Goal rows -->
        <div
          v-for="row in goals[s.key as EvalSectionKey]" :key="row.id"
          class="px-5 py-2.5 grid items-center gap-3 hover:bg-muted/15 transition-colors group"
          :style="{ gridTemplateColumns: sectionGridCols(s.key as EvalSectionKey) }"
        >
          <div class="relative">
            <input v-model="row.weight" type="number" :readonly="formMode !== 'self'"
              class="w-full pr-5 px-2.5 py-1.5 rounded-md text-[13px] text-right outline-none font-mono transition-all border"
              :class="formMode === 'self' ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent text-foreground/70 cursor-default'" />
            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] text-muted-foreground pointer-events-none">%</span>
          </div>

          <!-- Project select or name input (col 2) -->
          <div v-if="s.key === 'project'" class="relative">
            <select v-model="row.project" :disabled="formMode !== 'self'"
              class="w-full appearance-none px-2 pr-7 py-1.5 rounded-md text-[13px] outline-none bg-transparent hover:bg-muted/40 focus:bg-card focus:ring-1 focus:ring-primary/40 text-foreground disabled:cursor-default disabled:text-foreground/70 truncate border border-border">
              <option value="" disabled>Chọn dự án…</option>
              <option v-for="p in EVAL_PROJECT_OPTIONS" :key="p" :value="p">{{ p }}</option>
            </select>
            <ChevronDown :size="11" class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <input v-else v-model="row.name" :readonly="formMode !== 'self'" placeholder="Tên mục tiêu…"
            class="w-full px-2.5 py-1.5 rounded-md text-[13px] outline-none transition-all border"
            :class="formMode === 'self' ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent text-foreground/70 cursor-default'" />

          <!-- Target / detail / name for project (col 3) -->
          <input
            :value="s.key === 'project' ? row.name : s.key === 'other' ? row.detail : row.target"
            :readonly="formMode !== 'self'"
            :placeholder="s.key === 'project' ? 'Tên mục tiêu…' : s.key === 'other' ? 'Chi tiết mục tiêu…' : 'Mô tả cụ thể…'"
            class="w-full px-2.5 py-1.5 rounded-md text-[13px] outline-none transition-all border"
            :class="formMode === 'self' ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent text-foreground/70 cursor-default'"
            @input="(e) => {
              const v = (e.target as HTMLInputElement).value
              if (s.key === 'project') row.name = v
              else if (s.key === 'other') row.detail = v
              else row.target = v
            }"
          />

          <!-- Actual % -->
          <div class="relative">
            <input v-model="row.actual" type="number" :readonly="formMode !== 'self'" placeholder="0"
              class="w-full pr-5 px-2.5 py-1.5 rounded-md text-[13px] text-right outline-none font-mono transition-all border"
              :class="[formMode === 'self' ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent cursor-default', row.actual ? 'text-primary' : 'text-foreground/70']" />
            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] text-muted-foreground pointer-events-none">%</span>
          </div>

          <!-- Result % -->
          <div class="relative">
            <input v-model="row.result" type="number" :readonly="formMode !== 'supervisor'" placeholder="—"
              class="w-full pr-5 px-2.5 py-1.5 rounded-md text-[13px] text-right outline-none font-mono transition-all border"
              :class="[formMode === 'supervisor' ? 'border-border bg-card hover:border-primary/40 focus:border-primary/60' : 'border-transparent bg-transparent cursor-default', row.result ? '' : 'text-foreground/70']"
              :style="row.result ? { color: 'hsl(265 60% 55%)' } : {}" />
            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] text-muted-foreground pointer-events-none">%</span>
          </div>

          <!-- Computed score -->
          <div class="rounded-md py-1.5 px-2 text-right font-bold tabular-nums text-[14px]"
            :style="rowScore(row) > 0 ? { background: accentOpacity(s.accent, 0.1), color: s.accent } : {}">
            {{ rowScore(row) > 0 ? rowScore(row).toFixed(1) : '—' }}
          </div>

          <!-- Delete -->
          <button :disabled="formMode !== 'self'"
            class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0"
            @click="removeGoalRow(s.key as EvalSectionKey, row.id)">
            <Trash2 :size="13" />
          </button>
        </div>

        <div v-if="goals[s.key as EvalSectionKey].length === 0" class="px-5 py-8 text-center text-muted-foreground text-[12.5px]">
          Chưa có mục tiêu nào trong nhóm này
        </div>

        <div class="px-5 py-2.5 bg-muted/15">
          <button class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:bg-primary/10 px-2 py-1.5 rounded-md transition-colors"
            @click="addGoalRow(s.key as EvalSectionKey)">
            <Plus :size="12" /> Thêm mục tiêu
          </button>
        </div>
      </div>
    </div>

    <!-- Comments -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 rise" style="animation-delay: 380ms">
      <!-- Self comment -->
      <div class="card-surface overflow-hidden">
        <div class="px-4 py-3 border-b border-border/70 flex items-center gap-3"
          style="background: linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 50% / 0.08) 0%, transparent 60%)">
          <Avatar name="Trần Ngọc Huy" :size="32" />
          <div class="min-w-0 flex-1">
            <p class="section-title">Nhận xét — Bản thân</p>
            <p class="text-[11px] text-muted-foreground truncate">Trần Ngọc Huy · tự đánh giá</p>
          </div>
          <Badge v-if="formMode !== 'self'" variant="gray">Chỉ đọc</Badge>
        </div>
        <textarea v-model="commentSelf" :readonly="formMode !== 'self'"
          placeholder="Tự nhận xét: điểm mạnh, điểm cần cải thiện…" rows="6"
          class="w-full px-4 py-3 text-[13px] outline-none resize-none"
          :class="formMode !== 'self' ? 'bg-muted/20 text-foreground/70 cursor-default' : 'bg-transparent focus:bg-muted/10'" />
      </div>
      <!-- Supervisor comment -->
      <div class="card-surface overflow-hidden">
        <div class="px-4 py-3 border-b border-border/70 flex items-center gap-3"
          style="background: linear-gradient(90deg, hsl(265 60% 55% / 0.08) 0%, transparent 60%)">
          <Avatar name="Phạm Thu Hà" :size="32" />
          <div class="min-w-0 flex-1">
            <p class="section-title">Nhận xét — Cấp trên</p>
            <p class="text-[11px] text-muted-foreground truncate">Phạm Thu Hà · Tech Lead</p>
          </div>
          <Badge v-if="formMode !== 'supervisor'" variant="gray">Chỉ đọc</Badge>
        </div>
        <textarea v-model="commentSup" :readonly="formMode !== 'supervisor'"
          placeholder="Đánh giá tổng thể từ cấp trên — sẽ được điền sau khi nhân viên gửi phiếu." rows="6"
          class="w-full px-4 py-3 text-[13px] outline-none resize-none"
          :class="formMode !== 'supervisor' ? 'bg-muted/20 text-foreground/70 cursor-default' : 'bg-transparent focus:bg-muted/10'" />
      </div>
    </div>

    <!-- Sticky footer -->
    <div class="sticky bottom-0 -mx-6 px-6 py-3 bg-background/85 backdrop-blur-md border-t border-border/70 flex items-center gap-3 z-10">
      <div class="flex items-center gap-3 flex-1 text-[12.5px]">
        <span v-if="totalWeight === 100" class="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
          <Check :size="13" /> Trọng số hợp lệ
        </span>
        <span v-else class="inline-flex items-center gap-1.5 text-amber-600 font-semibold">
          Trọng số chưa đủ 100% — phiếu sẽ được lưu nháp
        </span>
        <span class="text-muted-foreground">·</span>
        <span class="text-muted-foreground">Lưu nháp tự động lúc <span class="font-mono">14:42</span></span>
      </div>
      <Btn variant="ghost" @click="showCreate = false">Huỷ</Btn>
      <Btn variant="outline"><FileText :size="13" />Lưu nháp</Btn>
      <Btn variant="primary"><Check :size="13" />Gửi phiếu</Btn>
    </div>
  </div>

  <!-- ============================================================ LIST MODE -->
  <div v-else class="space-y-6">
    <PageHeader
      eyebrow="Đánh giá nhân sự"
      description="Quản lý phiếu đánh giá định kỳ. Mỗi nhân viên được chấm trên 5 tiêu chí và xếp hạng từ E đến S."
    >
      <template #title>
        Kỳ đánh giá <em class="font-display not-italic text-primary" style="letter-spacing: -0.025em">Q{{ quarter }}/{{ year }}</em>
      </template>
      <template #actions>
        <Btn variant="outline"><FileText :size="14" />Xuất báo cáo PDF</Btn>
        <Btn variant="primary" @click="showCreate = true"><Plus :size="14" />Tạo phiếu mới</Btn>
      </template>
    </PageHeader>

    <!-- Period switcher banner -->
    <div class="card-surface p-4 rise flex flex-wrap items-center gap-4" style="animation-delay: 40ms">
      <div class="flex items-center gap-2">
        <span class="text-[11.5px] uppercase tracking-wider font-semibold text-muted-foreground">Kỳ:</span>
        <div class="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
          <button
            v-for="q in ['1','2','3','4']" :key="q"
            class="h-7 px-3 rounded-[5px] text-[12px] font-semibold tabular-nums"
            :class="quarter === q ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
            @click="quarter = q"
          >Q{{ q }}</button>
        </div>
        <Select v-model="year" :options="yearOpts" style="min-width: 100px" />
      </div>
      <div class="h-6 w-px bg-border" />
      <div class="flex items-center gap-3 flex-1 min-w-[260px]">
        <span class="text-[12px] text-muted-foreground">Tiến độ kỳ:</span>
        <div class="flex-1 h-2 rounded-full bg-muted overflow-hidden max-w-[280px]">
          <div class="h-full rounded-full" :style="{ width: `${stats.completionPct}%`, background: 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 65%), hsl(var(--primary-h) var(--primary-s) 45%))' }" />
        </div>
        <span class="text-[12px] font-semibold tabular-nums">{{ stats.completionPct }}%</span>
        <span class="text-[11.5px] text-muted-foreground">({{ stats.submittedCount }}/{{ stats.total }} phiếu)</span>
      </div>
      <div class="h-6 w-px bg-border hidden md:block" />
      <div class="text-[12px] text-muted-foreground">
        Hạn cuối: <span class="font-mono font-semibold text-foreground">15/06/2026</span> · còn <span class="text-amber-600 font-semibold">24 ngày</span>
      </div>
    </div>

    <!-- MiniStats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MiniStat label="Phiếu đã gửi" :value="stats.submittedCount" :sublabel="`/ ${stats.total} tổng cộng`" accent="green" :delay="80" />
      <MiniStat label="Điểm trung bình" :value="stats.avgScore" sublabel="trên thang 10" accent="primary" :delay="120" />
      <MiniStat label="Đạt rank S" :value="stats.topS" :sublabel="`${Math.round(stats.topS / Math.max(stats.submittedCount,1) * 100)}% nhân viên`" accent="violet" :delay="160" />
      <MiniStat label="Cần đôn đốc" :value="stats.needNudge" sublabel="Phiếu chưa hoàn tất" :accent="stats.needNudge > 0 ? 'amber' : 'green'" :delay="200" />
    </div>

    <!-- Tab strip -->
    <div class="border-b border-border/70">
      <div class="flex gap-7">
        <button
          v-for="[k, l, n] in [['manage','Quản lý phiếu', tabCounts.manage], ['mine','Phiếu của tôi', tabCounts.mine], ['reports','Báo cáo & xu hướng', null]]"
          :key="(k as string)"
          :data-active="tab === k"
          class="tab-trigger inline-flex items-center gap-2"
          @click="tab = k as typeof tab"
        >
          {{ l }}
          <span v-if="n !== null"
            class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums"
            :class="tab === k ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'"
          >{{ n }}</span>
        </button>
      </div>
    </div>

    <!-- List tabs -->
    <template v-if="tab !== 'reports'">
      <FilterBar>
        <FieldInput v-model="search" placeholder="Tìm tên nhân viên…" :width="220" />
        <Select v-model="statusF" :options="statusOpts" style="min-width: 160px" />
        <Select v-model="rankF" :options="rankOpts" style="min-width: 130px" />
        <div class="flex-1" />
        <span class="text-[12px] text-muted-foreground">{{ filtered.length }} / {{ allRows.length }} phiếu</span>
      </FilterBar>

      <div class="card-surface overflow-hidden rise" style="animation-delay: 240ms">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 820px">
            <thead>
              <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th class="text-left py-3 px-5">Nhân viên</th>
                <th class="text-left py-3 px-3">Người đánh giá</th>
                <th class="text-left py-3 px-3" style="min-width: 200px">% đạt theo loại</th>
                <th class="text-center py-3 px-3">Tổng đạt</th>
                <th class="text-center py-3 px-3">Rank</th>
                <th class="text-center py-3 px-3">Trạng thái</th>
                <th class="text-right py-3 px-5">Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="e in filtered" :key="e.id"
                class="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                @click="openEval = e"
              >
                <td class="py-3 px-5">
                  <div class="flex items-center gap-3">
                    <Avatar :name="e.user" :size="32" />
                    <div>
                      <p class="font-semibold text-foreground">{{ e.user }}</p>
                      <p class="text-[11.5px] text-muted-foreground">{{ e.role }} · {{ e.branch }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3 text-foreground/85">{{ e.reviewer }}</td>
                <td class="py-3 px-3">
                  <div class="flex items-end gap-1.5 h-7">
                    <div v-for="s in EVAL_SECTIONS" :key="s.key" class="flex flex-col items-center gap-0.5">
                      <div class="w-4 rounded-sm flex items-end" style="height: 22px">
                        <div
                          class="w-full rounded-sm"
                          :style="{ height: `${Math.max(e.pct[s.key] || 0, 6)}%`, background: s.accent, opacity: (e.pct[s.key] || 0) >= 80 ? 1 : 0.55 }"
                          :title="`${s.label}: ${e.pct[s.key] || 0}%`"
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3 text-center">
                  <span class="font-bold tabular-nums text-foreground">{{ weightedTotal(e).toFixed(1) }}</span>
                  <span class="text-muted-foreground text-[11px]">/100</span>
                </td>
                <td class="py-3 px-3 text-center">
                  <span v-if="e.status === 'submitted'"
                    class="inline-flex items-center justify-center w-7 h-7 rounded-md text-[12px] font-bold text-white tabular-nums"
                    :style="{ background: RANK_COLOR[rankFromScore(totalScore(e))] }">
                    {{ rankFromScore(totalScore(e)) }}
                  </span>
                  <span v-else class="text-muted-foreground">—</span>
                </td>
                <td class="py-3 px-3 text-center">
                  <Badge :variant="EVAL_STATUS_META[e.status].variant" dot>{{ EVAL_STATUS_META[e.status].label }}</Badge>
                </td>
                <td class="py-3 px-5 text-right text-muted-foreground text-[12px]">{{ e.updated }}</td>
              </tr>
              <tr v-if="filtered.length === 0">
                <td colspan="7" class="py-14 text-center text-muted-foreground">Không có phiếu phù hợp</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Reports tab -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Rank distribution -->
      <SectionCard :delay="120" class="lg:col-span-3" title="Phân bố rank — kỳ này">
        <div class="flex items-end gap-6 h-48 px-4 pt-4">
          <div v-for="[r, n] in Object.entries(rankDist)" :key="r" class="flex-1 flex flex-col items-center gap-2">
            <span class="text-[13px] font-bold tabular-nums text-foreground">{{ n }}</span>
            <div class="w-full rounded-md transition-all relative overflow-hidden"
              :style="{ height: `${(Number(n) / maxRankDist) * 100}%`, minHeight: '4px', background: `linear-gradient(180deg, ${RANK_COLOR[r]} 0%, ${RANK_COLOR[r]}aa 100%)` }">
              <div class="absolute inset-x-0 top-0 h-px bg-white/30" />
            </div>
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-md text-[12px] font-bold text-white"
              :style="{ background: RANK_COLOR[r] }">{{ r }}</span>
          </div>
        </div>
        <p class="text-[11.5px] text-muted-foreground mt-4 pt-3 border-t border-border/60">
          Có <strong class="text-foreground">{{ stats.topS + (rankDist.A ?? 0) }}/{{ stats.submittedCount }}</strong> phiếu đạt rank A trở lên. Trung bình kỳ này tăng <span class="text-emerald-600 font-semibold">+0.3 điểm</span> so với Q1.
        </p>
      </SectionCard>

      <!-- Section averages -->
      <SectionCard :delay="180" class="lg:col-span-2" title="Trung bình theo loại mục tiêu">
        <div class="space-y-3.5">
          <div v-for="s in sectionAverages" :key="s.key">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[12.5px] text-foreground/85">{{ s.label }} <span class="text-[10.5px] text-muted-foreground">· {{ s.weight }}%</span></span>
              <span class="font-bold tabular-nums text-foreground">{{ s.avg }}<span class="text-muted-foreground font-normal text-[10.5px]">%</span></span>
            </div>
            <div class="h-2 rounded-full bg-muted overflow-hidden">
              <div class="h-full rounded-full" :style="{ width: `${s.avg}%`, background: s.accent }" />
            </div>
          </div>
        </div>
      </SectionCard>

      <!-- Top 5 performers -->
      <SectionCard :delay="240" class="lg:col-span-3" title="Top 5 — kỳ này">
        <ol class="space-y-2.5">
          <li
            v-for="(e, i) in topPerformers" :key="e.id"
            class="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
            @click="openEval = e"
          >
            <span class="w-6 text-center text-[12px] font-bold tabular-nums text-muted-foreground">#{{ i + 1 }}</span>
            <Avatar :name="e.user" :size="32" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-foreground truncate">{{ e.user }}</p>
              <p class="text-[11.5px] text-muted-foreground">{{ e.role }} · {{ e.branch }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold tabular-nums text-foreground text-[15px]">{{ totalScore(e) }}<span class="text-muted-foreground text-[10.5px] font-normal">/10</span></p>
            </div>
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-md text-[11px] font-bold text-white"
              :style="{ background: RANK_COLOR[rankFromScore(totalScore(e))] }">{{ rankFromScore(totalScore(e)) }}</span>
          </li>
        </ol>
      </SectionCard>

      <!-- Trend chart -->
      <SectionCard :delay="300" class="lg:col-span-2" title="Xu hướng điểm trung bình">
        <div class="h-44">
          <LineChart :data="[{ label:'Q3/25', value:6.8 }, { label:'Q4/25', value:7.1 }, { label:'Q1/26', value:7.4 }, { label:'Q2/26', value:Number(stats.avgScore) || 7.7 }]" :height="176" />
        </div>
        <p class="text-[11.5px] text-muted-foreground mt-2 italic">Trung bình điểm đánh giá toàn công ty qua 4 quý gần nhất.</p>
      </SectionCard>
    </div>
  </div>

  <!-- ============================================================ EVAL DETAIL slide-over -->
  <Teleport to="body">
    <div v-if="openEval" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="openEval = null" />
      <div class="relative bg-background border-l border-border w-full max-w-xl h-full flex flex-col rise" style="animation-duration: .4s">
        <!-- Header -->
        <div class="p-5 border-b border-border/70 flex items-start justify-between gap-4 shrink-0">
          <div class="flex items-center gap-4 min-w-0">
            <Avatar :name="openEval.user" :size="52" />
            <div class="min-w-0">
              <h3 class="font-bold text-[18px] text-foreground font-heading truncate">{{ openEval.user }}</h3>
              <p class="text-[12.5px] text-muted-foreground truncate">{{ openEval.role }} · {{ openEval.branch }}</p>
              <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge variant="primary">{{ openEval.period }}</Badge>
                <Badge :variant="EVAL_STATUS_META[openEval.status].variant" dot>{{ EVAL_STATUS_META[openEval.status].label }}</Badge>
              </div>
            </div>
          </div>
          <button class="p-2 rounded-md hover:bg-muted text-muted-foreground shrink-0" @click="openEval = null"><X :size="16" /></button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto scrollbar-thin">
          <!-- Score hero -->
          <div class="p-5 border-b border-border/70 flex items-center gap-6">
            <div class="relative shrink-0">
              <svg width="112" height="112" class="-rotate-90">
                <circle cx="56" cy="56" :r="DONUT_R" fill="none" stroke="hsl(var(--muted))" stroke-width="9" />
                <circle cx="56" cy="56" :r="DONUT_R" fill="none"
                  :stroke="RANK_COLOR[detailRank]"
                  stroke-width="9" stroke-linecap="round"
                  :stroke-dasharray="DONUT_C"
                  :stroke-dashoffset="detailDashOffset"
                  style="transition: stroke-dashoffset 0.9s cubic-bezier(.2,.7,.2,1)"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-[28px] font-bold font-heading tabular-nums leading-none">{{ detailTotal }}</span>
                <span class="text-[10.5px] text-muted-foreground">/ 10</span>
              </div>
            </div>
            <div class="flex-1">
              <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Xếp hạng kỳ</p>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="inline-flex items-center justify-center w-12 h-12 rounded-xl text-[20px] font-bold text-white font-heading"
                  :style="{ background: RANK_COLOR[detailRank] }">{{ detailRank }}</span>
                <span class="font-display italic text-foreground text-[20px] font-normal">
                  {{ detailRank === 'S' ? 'Xuất sắc' : detailRank === 'A' ? 'Tốt' : detailRank === 'B' ? 'Đạt yêu cầu' : detailRank === 'C' ? 'Trung bình' : detailRank === 'D' ? 'Cần cải thiện' : 'Yếu' }}
                </span>
              </div>
              <p class="text-[11.5px] text-muted-foreground mt-2">Đánh giá bởi <strong class="text-foreground">{{ openEval.reviewer }}</strong> · {{ openEval.updated }}</p>
            </div>
          </div>

          <!-- Section scores -->
          <div class="p-5 border-b border-border/70">
            <div class="flex items-center justify-between mb-4">
              <h4 class="section-title">Điểm theo loại mục tiêu</h4>
              <span class="text-[11px] text-muted-foreground">Trọng số × % đạt</span>
            </div>
            <ul class="space-y-4">
              <li v-for="s in EVAL_SECTIONS" :key="s.key">
                <div class="flex items-baseline justify-between mb-1.5">
                  <div class="flex items-center gap-2">
                    <span class="h-3 w-1 rounded-full" :style="{ background: s.accent }" />
                    <div>
                      <p class="text-[13px] font-semibold text-foreground">{{ s.label }} <span class="text-[10.5px] text-muted-foreground font-normal">· trọng số {{ s.weight }}%</span></p>
                      <p class="text-[11px] text-muted-foreground">{{ s.desc }}</p>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="font-bold tabular-nums text-foreground text-[15px]">{{ openEval.pct[s.key] || 0 }}<span class="text-muted-foreground text-[10.5px] font-normal">%</span></span>
                    <span class="block text-[10.5px] font-mono" :style="{ color: s.accent }">{{ +(s.weight * (openEval.pct[s.key] || 0) / 100).toFixed(1) }} điểm</span>
                  </div>
                </div>
                <div class="h-2 rounded-full bg-muted overflow-hidden">
                  <div class="h-full rounded-full" :style="{ width: `${openEval.pct[s.key] || 0}%`, background: s.accent, opacity: (openEval.pct[s.key] || 0) >= 80 ? 1 : 0.7 }" />
                </div>
              </li>
            </ul>
            <div class="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
              <span class="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Tổng điểm đạt</span>
              <span class="font-bold tabular-nums text-foreground text-[16px]">{{ weightedTotal(openEval).toFixed(1) }}<span class="text-muted-foreground text-[11px] font-normal">/100</span></span>
            </div>
          </div>

          <!-- Comment -->
          <div v-if="openEval.comment" class="p-5 border-b border-border/70">
            <h4 class="section-title mb-2">Nhận xét</h4>
            <blockquote class="border-l-2 border-primary/40 pl-3 text-[13px] text-foreground/85 italic" style="line-height: 1.55">
              "{{ openEval.comment }}"
            </blockquote>
            <p class="text-[11px] text-muted-foreground mt-2">— {{ openEval.reviewer }}</p>
          </div>

          <!-- History -->
          <div class="p-5">
            <h4 class="section-title mb-3">Lịch sử của {{ openEval.user.split(' ').slice(-1)[0] }}</h4>
            <div class="space-y-2 text-[13px]">
              <div v-for="(h, hi) in HISTORY_ROWS" :key="hi" class="flex items-center gap-3 p-2 -mx-2 rounded-md hover:bg-muted/30">
                <span class="font-mono text-[11.5px] text-muted-foreground w-16">{{ h.p }}</span>
                <div class="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div class="h-full" :style="{ width: `${h.s * 10}%`, background: RANK_COLOR[rankFromScore(h.s)] }" />
                </div>
                <span class="font-semibold tabular-nums w-10 text-right">{{ h.s }}</span>
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold text-white"
                  :style="{ background: RANK_COLOR[rankFromScore(h.s)] }">{{ rankFromScore(h.s) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-border/70 flex items-center gap-2 shrink-0">
          <Btn variant="ghost" size="sm" @click="openEval = null">Đóng</Btn>
          <div class="flex-1" />
          <Btn variant="outline" size="sm"><FileText :size="13" />Xuất PDF</Btn>
          <Btn variant="primary" size="sm"><FileText :size="13" />Chỉnh sửa</Btn>
        </div>
      </div>
    </div>
  </Teleport>
</div>
</template>
