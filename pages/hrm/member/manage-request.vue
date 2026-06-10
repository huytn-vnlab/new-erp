<template>
  <div>
    <h2 class="text-lg font-semibold text-foreground mb-6">Yêu cầu của nhân viên</h2>

    <Tabs v-model="activeTab" @update:model-value="loadData" class="w-full">
      <TabsList class="bg-transparent border-b border-border rounded-none h-auto p-0 justify-start gap-6 mb-6">
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          class="rounded-none border-b-2 border-transparent text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-sm font-medium transition-all"
        >
          {{ tab.label }}
          <Badge v-if="tab.value === 'pending' && pendingCount > 0" variant="destructive" class="ml-1.5 h-5 px-1.5 text-[10px]">
            {{ pendingCount }}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value" class="mt-0">
        <!-- Loading -->
        <div v-if="loading" class="space-y-2">
          <Skeleton v-for="n in 5" :key="n" class="h-12 w-full rounded-md" />
        </div>

        <!-- Empty -->
        <div v-else-if="requests.length === 0" class="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p class="text-sm">Không có yêu cầu nào</p>
        </div>

        <!-- Table -->
        <div v-else class="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Loại yêu cầu</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Ngày gửi</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead class="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in requests" :key="row.id">
                <TableCell class="font-medium">{{ row.full_name }}</TableCell>
                <TableCell>{{ requestTypeLabel(row.type) }}</TableCell>
                <TableCell class="text-muted-foreground max-w-[200px] truncate">{{ row.content }}</TableCell>
                <TableCell class="text-muted-foreground">{{ formatDate(row.created_at) }}</TableCell>
                <TableCell>
                  <Badge
                    :variant="row.status === 0 ? 'outline' : row.status === 1 ? 'default' : 'destructive'"
                    :class="row.status === 0 ? 'text-amber-600 border-amber-400' : row.status === 1 ? 'bg-green-600 hover:bg-green-600' : ''"
                  >
                    {{ requestStatusLabel(row.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div v-if="row.status === 0" class="flex gap-2">
                    <Button size="sm" :disabled="actionId === row.id" @click="doApprove(row)">
                      <AppSpinner v-if="actionId === row.id && doing === 'approve'" class="mr-1 h-3 w-3" />
                      Duyệt
                    </Button>
                    <Button size="sm" variant="destructive" :disabled="actionId === row.id" @click="doReject(row)">
                      <AppSpinner v-if="actionId === row.id && doing === 'reject'" class="mr-1 h-3 w-3" />
                      Từ chối
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/date'
import { handleApiError } from '~/utils/error-handler'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import Tabs from '~/components/ui/Tabs.vue'
import TabsList from '~/components/ui/TabsList.vue'
import TabsTrigger from '~/components/ui/TabsTrigger.vue'
import TabsContent from '~/components/ui/TabsContent.vue'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '~/components/ui/table'
import AppSpinner from '~/components/ui/AppSpinner.vue'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-role'] })
useHead({ title: 'Yêu cầu nhân viên — Micro ERP' })

const toast = useToast()
const { post } = useApi()

const loading   = ref(true)
const requests  = ref<any[]>([])
const activeTab = ref('pending')
const actionId  = ref<number | null>(null)
const doing     = ref('')

const tabs = [
  { value: 'pending',  label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'all',      label: 'Tất cả' },
]

const pendingCount = computed(() => requests.value.filter(r => r.status === 0).length)

function requestTypeLabel(t: string) {
  const map: Record<string, string> = { leave: 'Nghỉ phép', overtime: 'Tăng ca', asset: 'Mượn tài sản', profile: 'Cập nhật hồ sơ', other: 'Khác' }
  return map[t] ?? t
}

function requestStatusLabel(s: number) {
  return ['Chờ duyệt', 'Đã duyệt', 'Từ chối'][s] ?? 'N/A'
}

async function doApprove(row: any) {
  actionId.value = row.id; doing.value = 'approve'
  try {
    await post('/member/approve-request', { id: row.id })
    row.status = 1
    toast.success('Đã duyệt')
  } catch (err) { toast.error(handleApiError(err)) }
  finally { actionId.value = null }
}

async function doReject(row: any) {
  actionId.value = row.id; doing.value = 'reject'
  try {
    await post('/member/reject-request', { id: row.id })
    row.status = 2
    toast.success('Đã từ chối')
  } catch (err) { toast.error(handleApiError(err)) }
  finally { actionId.value = null }
}

async function loadData() {
  loading.value = true
  try {
    const res = await post<{ requests: any[] }>('/member/get-requests', { status: activeTab.value })
    requests.value = res.data?.requests ?? []
  } finally { loading.value = false }
}

onMounted(loadData)
</script>
