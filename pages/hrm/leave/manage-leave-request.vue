<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-800 mb-6">{{ $t('hrm.leave.manage.title') }}</h2>

    <!-- Filter bar -->
    <Card class="mb-4">
      <CardContent class="pt-4 pb-4">
        <div class="flex flex-wrap gap-3 items-center">
          <Select v-model="filterStatus">
            <SelectTrigger class="w-44">
              <SelectValue :placeholder="$t('hrm.leave.manage.allStatuses')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in statusOptions" :key="String(opt.value)" :value="String(opt.value)">
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="filterName"
              :placeholder="$t('hrm.leave.manage.filterNamePlaceholder')"
              class="pl-9 w-56"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Table -->
    <Card>
      <CardContent class="p-0">
        <div v-if="leaveStore.loading" class="p-6 space-y-3">
          <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
        </div>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>{{ $t('hrm.leave.manage.columns.employee') }}</TableHead>
              <TableHead>{{ $t('hrm.leave.manage.columns.type') }}</TableHead>
              <TableHead>{{ $t('common.from') }}</TableHead>
              <TableHead>{{ $t('common.to') }}</TableHead>
              <TableHead class="max-w-xs">{{ $t('leave.reason') }}</TableHead>
              <TableHead>{{ $t('common.status') }}</TableHead>
              <TableHead class="text-right">{{ $t('common.actions') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in filteredRows" :key="row.id">
              <TableCell>
                <div class="flex items-center gap-2">
                  <div class="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span class="text-xs font-semibold text-primary">{{ getInitials(row.user_name) }}</span>
                  </div>
                  <span class="text-sm font-medium">{{ row.user_name }}</span>
                </div>
              </TableCell>
              <TableCell>{{ row.leave_type_name }}</TableCell>
              <TableCell>{{ formatDate(row.start_date) }}</TableCell>
              <TableCell>{{ formatDate(row.end_date) }}</TableCell>
              <TableCell class="max-w-xs truncate">{{ row.reason }}</TableCell>
              <TableCell>
                <Badge :class="leaveStatusBadgeClass(row.status)">
                  {{ leaveStatusMeta(row.status).label }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <div v-if="row.status === 0" class="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    :disabled="processingId === row.id"
                    @click="doApprove(row)"
                  >
                    <span v-if="processingId === row.id">{{ $t('common.loading') }}</span>
                    <span v-else>{{ $t('leave.approve') }}</span>
                  </Button>
                  <Button size="sm" variant="destructive" @click="openRejectDialog(row)">
                    {{ $t('leave.reject') }}
                  </Button>
                </div>
                <span v-else class="text-xs text-muted-foreground">—</span>
              </TableCell>
            </TableRow>
            <TableRow v-if="!filteredRows.length">
              <TableCell colspan="7" class="text-center py-10 text-muted-foreground">
                {{ $t('common.noData') }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>

      <!-- Pagination -->
      <CardFooter v-if="leaveStore.pagination.total_row > leaveStore.pagination.row_per_page" class="flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4">
        <p class="text-sm text-muted-foreground">
          {{ $t('pagination.showing', {
            from: paginationFrom,
            to: paginationTo,
            total: leaveStore.pagination.total_row,
          }) }}
        </p>
        <Pagination
          :total="leaveStore.pagination.total_row"
          :items-per-page="leaveStore.pagination.row_per_page"
          :page="leaveStore.pagination.current_page"
          :sibling-count="1"
          :show-edges="true"
          @update:page="leaveStore.fetchLeaveRequests($event)"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious>
              <ChevronLeft class="h-4 w-4" />
              <span class="hidden sm:block">{{ $t('common.prev') }}</span>
            </PaginationPrevious>
            <template v-for="item in items" :key="item.type === 'page' ? item.page : item.index">
              <PaginationItem v-if="item.type === 'page'" :value="item.page" as-child>
                <Button
                  variant="outline"
                  size="icon-sm"
                  :class="item.isSelected ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : ''"
                >
                  {{ item.page }}
                </Button>
              </PaginationItem>
              <PaginationEllipsis v-else :index="item.index" />
            </template>
            <PaginationNext>
              <span class="hidden sm:block">{{ $t('common.next') }}</span>
              <ChevronRight class="h-4 w-4" />
            </PaginationNext>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>

    <!-- Reject dialog -->
    <Dialog v-model:open="showRejectDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ $t('hrm.leave.manage.rejectTitle') }}</DialogTitle>
        </DialogHeader>
        <p class="text-sm text-muted-foreground mb-3">
          {{ $t('hrm.leave.manage.rejectPrompt') }}
          <strong>{{ selectedLeave?.user_name }}</strong>:
        </p>
        <Textarea
          v-model="rejectReason"
          rows="3"
          class="resize-none"
          :placeholder="$t('hrm.leave.manage.rejectPlaceholder')"
        />
        <DialogFooter class="mt-4">
          <Button variant="outline" @click="showRejectDialog = false">{{ $t('common.cancel') }}</Button>
          <Button
            variant="destructive"
            :disabled="rejecting || !rejectReason.trim()"
            @click="doReject"
          >
            <span v-if="rejecting">{{ $t('common.loading') }}</span>
            <span v-else>{{ $t('leave.reject') }}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Search, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useLeaveStore } from '~/stores/leave'
import { useLeave } from '~/composables/useLeave'
import { formatDate } from '~/utils/date'
import { leaveStatusMeta, getInitials } from '~/utils/format'
import Card from '~/components/ui/Card.vue'
import CardContent from '~/components/ui/CardContent.vue'
import CardFooter from '~/components/ui/CardFooter.vue'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Skeleton } from '~/components/ui/skeleton'
import { Badge } from '~/components/ui/badge'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '~/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table'
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationPrevious, PaginationNext, PaginationEllipsis,
} from '~/components/ui/pagination'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '~/components/ui/dialog'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-role'],
})

const { t } = useI18n()
useHead({ title: computed(() => `${t('hrm.leave.manage.title')} — Micro ERP`) })

const leaveStore = useLeaveStore()
const { approveLeave, rejectLeave } = useLeave()

const statusOptions = computed(() => [
  { value: '_all', label: t('common.all') },
  { value: '0',    label: t('leave.pending') },
  { value: '1',    label: t('leave.approved') },
  { value: '2',    label: t('leave.rejected') },
])

const filterStatus     = ref('_all')
const filterName       = ref('')
const processingId     = ref<number | null>(null)
const showRejectDialog = ref(false)
const rejecting        = ref(false)
const rejectReason     = ref('')
const selectedLeave    = ref<any>(null)

const filteredRows = computed(() => {
  let rows = leaveStore.leaveRequests
  if (filterStatus.value !== '_all') rows = rows.filter(r => String(r.status) === filterStatus.value)
  if (filterName.value)          rows = rows.filter(r => r.user_name?.toLowerCase().includes(filterName.value.toLowerCase()))
  return rows
})

// ── Pagination helpers ─────────────────────────────────────────────────────────
const paginationFrom = computed(() =>
  (leaveStore.pagination.current_page - 1) * leaveStore.pagination.row_per_page + 1
)
const paginationTo = computed(() =>
  Math.min(leaveStore.pagination.current_page * leaveStore.pagination.row_per_page, leaveStore.pagination.total_row)
)

// ── Badge variant mapping ──────────────────────────────────────────────────────
function leaveStatusBadgeClass(status: number): string {
  const map: Record<number, string> = {
    0: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
    1: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
    2: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100'
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function doApprove(row: any) {
  processingId.value = row.id
  try {
    await approveLeave(row.id)
  } finally {
    processingId.value = null
  }
}

function openRejectDialog(row: any) {
  selectedLeave.value    = row
  rejectReason.value     = ''
  showRejectDialog.value = true
}

async function doReject() {
  if (!selectedLeave.value) return
  rejecting.value = true
  try {
    await rejectLeave(selectedLeave.value.id, rejectReason.value)
    showRejectDialog.value = false
  } finally {
    rejecting.value = false
  }
}

onMounted(() => { if (!leaveStore.leaveRequests.length) leaveStore.fetchLeaveRequests() })
</script>
