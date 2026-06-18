<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, LayoutGrid, List, X, Send } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Badge from '~/components/base/Badge.vue'
import Select from '~/components/base/Select.vue'
import Avatar from '~/components/base/Avatar.vue'
import AssetDetail from '~/components/asset/AssetDetail.vue'
import {
  ASSETS, ASSET_REQUESTS, CATEGORY_META, ASSET_STATUS_META, formatVND,
  type Asset, type AssetStatus, type AssetCategory,
} from '~/mocks/asset'

definePageMeta({ layout: 'admin' })

const tab = ref<'all' | 'mine' | 'requests'>('all')
const viewMode = ref<'grid' | 'list'>('grid')
const search = ref('')
const filterStatus = ref<'all' | AssetStatus>('all')
const filterCategory = ref<'all' | AssetCategory>('all')
const selectedAsset = ref<Asset | null>(null)
const showRequestModal = ref(false)

const { show } = useToast()

const requestForm = ref({ asset: '', return: '', reason: '' })
const requestErrors = ref<Record<string, boolean>>({})

const statusOpts = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'available', label: 'Sẵn sàng' },
  { value: 'in_use', label: 'Đang dùng' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'broken', label: 'Hỏng' },
]

const categoryOpts = [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'monitor', label: 'Màn hình' },
  { value: 'keyboard', label: 'Bàn phím' },
  { value: 'mouse', label: 'Chuột' },
  { value: 'headphone', label: 'Tai nghe' },
  { value: 'phone', label: 'Điện thoại' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'other', label: 'Khác' },
]

const availableAssetOpts = computed(() =>
  ASSETS.filter(a => a.status === 'available').map(a => ({ value: a.name, label: a.name }))
)

const filtered = computed(() =>
  ASSETS.filter(a => {
    const q = search.value.toLowerCase()
    if (q && !a.name.toLowerCase().includes(q) && !a.id.toLowerCase().includes(q) && !(a.user ?? '').toLowerCase().includes(q)) return false
    if (filterStatus.value !== 'all' && a.status !== filterStatus.value) return false
    if (filterCategory.value !== 'all' && a.category !== filterCategory.value) return false
    return true
  })
)

const stats = computed(() => ({
  total: ASSETS.length,
  inUse: ASSETS.filter(a => a.status === 'in_use').length,
  available: ASSETS.filter(a => a.status === 'available').length,
  totalValue: ASSETS.reduce((s, a) => s + a.value, 0),
}))

const requestStatusMeta = { pending: { label: 'Chờ duyệt', variant: 'amber' }, approved: { label: 'Đã duyệt', variant: 'green' }, completed: { label: 'Hoàn thành', variant: 'primary' } } as const

function submitRequest() {
  requestErrors.value = {}
  if (!requestForm.value.asset) requestErrors.value.asset = true
  if (!requestForm.value.reason.trim()) requestErrors.value.reason = true
  if (Object.keys(requestErrors.value).length) return
  show('Đã gửi yêu cầu mượn tài sản.')
  showRequestModal.value = false
  requestForm.value = { asset: '', return: '', reason: '' }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      eyebrow="HRM · Tài sản"
      title="Quản lý tài sản"
      description="Theo dõi toàn bộ thiết bị và tài sản công ty. Ghi nhận người dùng, trạng thái và lịch sử."
    >
      <template #actions>
        <Btn variant="outline" @click="showRequestModal = true"><Plus :size="14" /> Yêu cầu mượn</Btn>
        <Btn variant="primary"><Plus :size="14" /> Thêm tài sản</Btn>
      </template>
    </PageHeader>

    <!-- Tabs -->
    <div class="flex flex-wrap gap-2">
      <button v-for="[k, l] in [['all','Tất cả tài sản'], ['mine','Tài sản của tôi'], ['requests','Yêu cầu mượn']]" :key="k"
        :class="['h-10 px-5 rounded-lg text-[13.5px] font-semibold transition-all', tab === k ? 'text-white shadow-sm' : 'border border-border text-foreground/70 hover:text-foreground hover:border-primary/40 bg-card']"
        :style="tab === k ? { background: 'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 60%),hsl(var(--primary-h) var(--primary-s) 44%))' } : {}"
        @click="tab = k as typeof tab"
      >{{ l }}</button>
    </div>

    <!-- ALL ASSETS -->
    <template v-if="tab === 'all'">
      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Tổng tài sản" :value="stats.total" sublabel="Đang quản lý" accent="primary" :delay="40" />
        <MiniStat label="Đang sử dụng" :value="stats.inUse" sublabel="Đã gán người dùng" accent="violet" :delay="80" />
        <MiniStat label="Sẵn sàng" :value="stats.available" sublabel="Chưa sử dụng" accent="green" :delay="120" />
        <MiniStat label="Tổng giá trị" :value="formatVND(stats.totalValue)" sublabel="Ước tính" accent="amber" :delay="160" />
      </div>

      <!-- Filter bar -->
      <div class="card-surface p-4">
        <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 items-end">
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Tìm kiếm</label>
            <div class="relative">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input v-model="search" placeholder="Tên, mã, người dùng…" class="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60 placeholder:text-muted-foreground/50">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Trạng thái</label>
            <Select v-model="filterStatus" :options="statusOpts" style="width: 100%" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Loại tài sản</label>
            <Select v-model="filterCategory" :options="categoryOpts" style="width: 100%" />
          </div>
          <Btn variant="primary" @click="show('Đã áp dụng bộ lọc.')"><Search :size="13" /> Lọc</Btn>
          <div class="flex items-center gap-1 h-10 p-1 bg-muted rounded-lg">
            <button :class="['h-full px-3 rounded-md transition-colors text-[13px] font-medium', viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']" @click="viewMode = 'grid'"><LayoutGrid :size="14" /></button>
            <button :class="['h-full px-3 rounded-md transition-colors text-[13px] font-medium', viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']" @click="viewMode = 'list'"><List :size="14" /></button>
          </div>
        </div>
      </div>

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
              <Badge :variant="ASSET_STATUS_META[a.status].variant" class="text-[10.5px]">{{ ASSET_STATUS_META[a.status].label }}</Badge>
            </div>
            <div>
              <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">{{ CATEGORY_META[a.category].label }} · <span class="font-mono">{{ a.id }}</span></p>
              <p class="font-bold text-[14px] text-foreground truncate">{{ a.name }}</p>
              <p class="text-[12px] text-muted-foreground truncate">{{ a.spec }}</p>
            </div>
            <div class="border-t border-border/60 pt-2.5">
              <div class="flex items-center justify-between text-[11.5px]">
                <span class="text-muted-foreground">{{ a.user ?? 'Chưa gán' }}</span>
                <span class="font-bold tabular-nums text-primary">{{ formatVND(a.value) }}</span>
              </div>
            </div>
          </button>
          <div v-if="filtered.length === 0" class="col-span-full py-16 text-center text-muted-foreground">
            <Search :size="36" class="mx-auto mb-2 opacity-30" />Không tìm thấy tài sản phù hợp
          </div>
        </div>
      </template>

      <!-- List view -->
      <template v-else>
        <div class="card-surface overflow-hidden rise">
          <div class="overflow-x-auto">
            <table class="w-full text-[13px]" style="min-width: 840px">
              <thead>
                <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold border-b border-border/70">
                  <th class="text-left py-3 px-5">Tài sản</th>
                  <th class="text-left py-3 px-3">Chi nhánh</th>
                  <th class="text-left py-3 px-3">Người dùng</th>
                  <th class="text-center py-3 px-3">Trạng thái</th>
                  <th class="text-right py-3 px-3">Giá trị</th>
                  <th class="text-left py-3 px-5">Ngày cấp</th>
                </tr>
              </thead>
              <tbody>
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
                  <td class="py-3 px-3 text-center"><Badge :variant="ASSET_STATUS_META[a.status].variant" dot>{{ ASSET_STATUS_META[a.status].label }}</Badge></td>
                  <td class="py-3 px-3 text-right font-bold tabular-nums text-primary">{{ formatVND(a.value) }}</td>
                  <td class="py-3 px-5 font-mono text-muted-foreground text-[12px]">{{ a.date }}</td>
                </tr>
                <tr v-if="filtered.length === 0">
                  <td colspan="6" class="py-14 text-center text-muted-foreground"><Search :size="30" class="mx-auto mb-2 opacity-30" />Không tìm thấy tài sản phù hợp</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="px-5 py-3 border-t border-border/70 bg-muted/10 text-[12.5px] text-muted-foreground">
            Tổng: <span class="font-semibold text-foreground">{{ filtered.length }}</span> tài sản
          </div>
        </div>
      </template>
    </template>

    <!-- MINE -->
    <template v-if="tab === 'mine'">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rise">
        <button
          v-for="(a, i) in ASSETS.filter(x => x.user === 'Nguyễn Văn An')" :key="a.id"
          class="card-surface text-left p-4 space-y-3 hover:shadow-md transition-all"
          :style="`animation-delay: ${i * 40}ms`"
          @click="selectedAsset = a"
        >
          <div class="flex items-start justify-between">
            <span class="h-10 w-10 rounded-lg flex items-center justify-center text-[20px] shrink-0" :style="{ background: `${CATEGORY_META[a.category].color}22`, color: CATEGORY_META[a.category].color }">{{ CATEGORY_META[a.category].glyph }}</span>
            <Badge :variant="ASSET_STATUS_META[a.status].variant">{{ ASSET_STATUS_META[a.status].label }}</Badge>
          </div>
          <div>
            <p class="font-bold text-[14px] text-foreground">{{ a.name }}</p>
            <p class="text-[12px] text-muted-foreground">{{ a.spec }}</p>
          </div>
          <div class="text-[11.5px] text-muted-foreground font-mono">Cấp ngày: {{ a.date }}</div>
        </button>
        <div v-if="!ASSETS.some(x => x.user === 'Nguyễn Văn An')" class="col-span-full py-16 text-center text-muted-foreground">
          Bạn chưa được gán tài sản nào.
        </div>
      </div>
    </template>

    <!-- REQUESTS -->
    <template v-if="tab === 'requests'">
      <div class="card-surface overflow-hidden rise">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]" style="min-width: 700px">
            <thead>
              <tr class="thead-primary text-[11px] uppercase tracking-wider font-semibold border-b border-border/70">
                <th class="text-left py-3 px-5">Tài sản</th>
                <th class="text-left py-3 px-3">Người yêu cầu</th>
                <th class="text-left py-3 px-3">Ghi chú</th>
                <th class="text-left py-3 px-3">Ngày trả</th>
                <th class="text-left py-3 px-3">Gửi lúc</th>
                <th class="text-center py-3 px-5">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in ASSET_REQUESTS" :key="r.id" class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                <td class="py-3 px-5 font-semibold text-foreground">{{ r.asset }}</td>
                <td class="py-3 px-3"><div class="flex items-center gap-2"><Avatar :name="r.user" :size="26" />{{ r.user }}</div></td>
                <td class="py-3 px-3 text-foreground/80 max-w-[240px] truncate">{{ r.note }}</td>
                <td class="py-3 px-3 font-mono text-muted-foreground text-[12px]">{{ r.return }}</td>
                <td class="py-3 px-3 text-muted-foreground">{{ r.submitted }}</td>
                <td class="py-3 px-5 text-center">
                  <Badge :variant="requestStatusMeta[r.status].variant" dot>{{ requestStatusMeta[r.status].label }}</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-5 py-3 border-t border-border/70 bg-muted/10 text-[12.5px] text-muted-foreground">
          <span class="font-semibold text-amber-600">{{ ASSET_REQUESTS.filter(r => r.status === 'pending').length }}</span> yêu cầu đang chờ duyệt
        </div>
      </div>
    </template>

    <!-- ASSET DETAIL MODAL -->
    <Teleport to="body">
      <AssetDetail v-if="selectedAsset" :asset="selectedAsset" @close="selectedAsset = null" />
    </Teleport>

    <!-- REQUEST MODAL -->
    <Teleport to="body">
      <div v-if="showRequestModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="showRequestModal = false" />
        <div class="relative card-surface rise w-full max-w-md overflow-hidden">
          <div class="p-5 border-b border-border/70 flex items-center justify-between">
            <h3 class="font-heading font-bold text-[16px]">Yêu cầu mượn tài sản</h3>
            <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="showRequestModal = false"><X :size="14" /></button>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Tài sản <span class="text-red-400">*</span></label>
              <Select v-model="requestForm.asset" :options="availableAssetOpts" placeholder="— Chọn tài sản —" :class="requestErrors.asset ? 'ring-1 ring-red-400 rounded-md' : ''" style="width: 100%" />
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Ngày dự kiến trả</label>
              <input v-model="requestForm.return" type="date" class="w-full h-10 px-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/60">
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Lý do <span class="text-red-400">*</span></label>
              <textarea v-model="requestForm.reason" rows="3" placeholder="Mục đích sử dụng…"
                :class="['w-full px-3 py-2 rounded-lg border bg-card text-[13px] outline-none resize-none placeholder:text-muted-foreground/45', requestErrors.reason ? 'border-red-400' : 'border-border focus:border-primary/60']" />
            </div>
          </div>
          <div class="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
            <Btn variant="outline" size="sm" @click="showRequestModal = false">Huỷ</Btn>
            <Btn variant="primary" size="sm" @click="submitRequest"><Send :size="13" /> Gửi yêu cầu</Btn>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
