<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, FileText, Eye } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import Select from '~/components/base/Select.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import ContractForm from '~/components/contract/ContractForm.vue'
import {
  CONTRACTS, CONTRACT_TYPES, CONTRACT_BRANCHES,
  type Contract,
} from '~/mocks/contract'

definePageMeta({ layout: 'admin' })

const tab = ref<'list' | 'create' | 'types'>('list')
const search = ref('')
const filterBranch = ref('all')
const filterType = ref('all')
const selected = ref<Contract | null>(null)

const { show } = useToast()

const branchOpts = [{ value: 'all', label: 'Tất cả chi nhánh' }, ...CONTRACT_BRANCHES.map(b => ({ value: b, label: b }))]
const typeOpts = computed(() => [
  { value: 'all', label: 'Tất cả loại' },
  ...CONTRACT_TYPES.map(t => ({ value: t.name, label: t.name })),
])

const filtered = computed(() =>
  CONTRACTS.filter(c => {
    const q = search.value.toLowerCase()
    if (q && !c.user.toLowerCase().includes(q) && !c.type.toLowerCase().includes(q)) return false
    if (filterBranch.value !== 'all' && c.branch !== filterBranch.value) return false
    if (filterType.value !== 'all' && c.type !== filterType.value) return false
    return true
  })
)

type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

const today = '2026-06-17'
function contractStatus(c: Contract): { label: string; variant: BadgeVariant } {
  if (!c.end) return { label: 'Vô thời hạn', variant: 'green' }
  if (c.end < today) return { label: 'Hết hạn', variant: 'red' }
  const daysLeft = Math.round((new Date(c.end).getTime() - new Date(today).getTime()) / 86400000)
  if (daysLeft < 60) return { label: `Còn ${daysLeft} ngày`, variant: 'amber' }
  return { label: 'Còn hiệu lực', variant: 'primary' }
}

const fmtDate = (iso: string | null) => iso ? iso.split('-').reverse().join('/') : '—'
const fmtDateShort = (iso: string) => iso.slice(0, 7).replace('-', '/')
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      eyebrow="HRM · Hợp đồng"
      title="Quản lý hợp đồng"
      description="Danh sách và quản lý hợp đồng lao động của toàn thể nhân sự VNLab."
    >
      <template #actions>
        <Btn variant="primary" @click="tab = 'create'"><FileText :size="14" /> Tạo hợp đồng</Btn>
      </template>
    </PageHeader>

    <!-- Tabs -->
    <div class="flex flex-wrap gap-2">
      <button v-for="[k, l] in [['list','Danh sách hợp đồng'], ['create','Tạo hợp đồng'], ['types','Loại hợp đồng']]" :key="k"
        :class="['h-10 px-5 rounded-lg text-[13.5px] font-semibold transition-all', tab === k ? 'text-white shadow-sm' : 'border border-border text-foreground/70 hover:text-foreground hover:border-primary/40 bg-card']"
        :style="tab === k ? { background: 'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 60%),hsl(var(--primary-h) var(--primary-s) 44%))' } : {}"
        @click="tab = k as typeof tab"
      >{{ l }}</button>
    </div>

    <!-- LIST -->
    <template v-if="tab === 'list'">
      <div class="card-surface p-4">
        <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Tìm kiếm</label>
            <div class="relative">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input v-model="search" placeholder="Tên nhân viên, loại hợp đồng…" class="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60 placeholder:text-muted-foreground/50">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Chi nhánh</label>
            <Select v-model="filterBranch" :options="branchOpts" style="width: 100%" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Loại hợp đồng</label>
            <Select v-model="filterType" :options="typeOpts" style="width: 100%" />
          </div>
          <Btn variant="primary" @click="show('Đã áp dụng bộ lọc.')"><Search :size="13" /> Lọc</Btn>
        </div>
      </div>

      <div class="card-surface overflow-hidden rise">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 960px">
            <thead>
              <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold border-b border-border/70">
                <th class="text-left py-3 px-5">Nhân viên</th>
                <th class="text-left py-3 px-3">Chi nhánh</th>
                <th class="text-left py-3 px-3">Hiệu lực</th>
                <th class="text-left py-3 px-3">Kết thúc</th>
                <th class="text-left py-3 px-3">Ngày gia nhập</th>
                <th class="text-left py-3 px-3">Loại hợp đồng</th>
                <th class="text-center py-3 px-3">Trạng thái</th>
                <th class="text-center py-3 px-5 w-20">Xem</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="c in filtered" :key="c.id"
                class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                @click="selected = c"
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
                <td class="py-3 px-5 text-center">
                  <button class="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary transition-colors" @click.stop="selected = c">
                    <Eye :size="13" />
                  </button>
                </td>
              </tr>
              <tr v-if="filtered.length === 0">
                <td colspan="8" class="py-14 text-center text-muted-foreground"><FileText :size="32" class="mx-auto mb-2 opacity-30" />Không tìm thấy hợp đồng phù hợp</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-5 py-3 border-t border-border/70 bg-muted/10 text-[12.5px] text-muted-foreground">
          Tổng: <span class="font-semibold text-foreground">{{ filtered.length }}</span> hợp đồng
        </div>
      </div>
    </template>

    <!-- CREATE -->
    <template v-if="tab === 'create'">
      <ContractForm @submit="(_d) => { show('Đã tạo hợp đồng thành công.'); tab = 'list' }" @cancel="tab = 'list'" />
    </template>

    <!-- TYPES -->
    <template v-if="tab === 'types'">
      <div class="card-surface overflow-hidden rise">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 800px">
            <thead>
              <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold border-b border-border/70">
                <th class="text-left py-3 px-5">#</th>
                <th class="text-left py-3 px-3">Tên loại hợp đồng</th>
                <th class="text-left py-3 px-3">File mẫu</th>
                <th class="text-left py-3 px-3">Ngày tạo</th>
                <th class="text-left py-3 px-5">Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in CONTRACT_TYPES" :key="t.id" class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                <td class="py-3 px-5 text-muted-foreground tabular-nums font-mono">{{ t.id }}</td>
                <td class="py-3 px-3 font-medium text-foreground">{{ t.name }}</td>
                <td class="py-3 px-3">
                  <button class="inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline">
                    <FileText :size="12" />
                    <span class="truncate max-w-[220px]">{{ t.file }}</span>
                  </button>
                </td>
                <td class="py-3 px-3 font-mono text-[12px] text-muted-foreground">{{ t.created }}</td>
                <td class="py-3 px-5 font-mono text-[12px] text-muted-foreground">{{ t.updated }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-5 py-3 border-t border-border/70 bg-muted/10 text-[12.5px] text-muted-foreground">
          Tổng: <span class="font-semibold text-foreground">{{ CONTRACT_TYPES.length }}</span> loại hợp đồng
        </div>
      </div>
    </template>

    <!-- CONTRACT DETAIL DRAWER -->
    <Teleport to="body">
      <div v-if="selected" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="selected = null" />
        <div class="relative bg-background border-l border-border w-full max-w-md h-full flex flex-col rise" style="animation-duration:.3s">
          <div class="p-5 border-b border-border/70 flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center"><FileText :size="18" class="text-primary" /></div>
              <div>
                <p class="font-bold text-[15px] text-foreground">{{ selected.user }}</p>
                <p class="text-[12px] text-muted-foreground">{{ selected.branch }}</p>
              </div>
            </div>
            <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="selected = null"><Search :size="14" class="rotate-45" /></button>
          </div>
          <div class="flex-1 overflow-y-auto p-5 space-y-5">
            <Badge :variant="contractStatus(selected).variant" dot>{{ contractStatus(selected).label }}</Badge>

            <div class="card-surface p-4 space-y-3 text-[13px]">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Ngày hiệu lực</span>
                <span class="font-mono font-semibold">{{ fmtDate(selected.start) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Ngày kết thúc</span>
                <span class="font-mono font-semibold">{{ fmtDate(selected.end) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Ngày gia nhập</span>
                <span class="font-mono font-semibold">{{ fmtDate(selected.joined) }}</span>
              </div>
            </div>

            <div>
              <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Loại hợp đồng</p>
              <p class="text-[13.5px] text-foreground/85 leading-relaxed">{{ selected.type }}</p>
            </div>

            <div>
              <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Thống kê</p>
              <div class="card-surface p-4 text-[13px]">
                <div class="flex justify-between mb-2">
                  <span class="text-muted-foreground">Thời gian đã làm việc</span>
                  <span class="font-bold tabular-nums">
                    {{ Math.round((new Date(today).getTime() - new Date(selected.joined).getTime()) / 86400000 / 30) }} tháng
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Gia nhập tháng</span>
                  <span class="font-mono">{{ fmtDateShort(selected.joined) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="p-4 border-t border-border/70 flex items-center gap-2">
            <Btn variant="outline" size="sm" @click="selected = null">Đóng</Btn>
            <div class="flex-1" />
            <Btn variant="primary" size="sm" @click="tab = 'create'; selected = null"><FileText :size="13" /> Gia hạn HĐ</Btn>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
