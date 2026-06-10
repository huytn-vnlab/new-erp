<template>
  <div>
    <div v-if="loading" class="flex justify-center py-20"><AppSpinner size="lg" /></div>

    <AppAlert v-else-if="error" variant="error">{{ error }}</AppAlert>

    <template v-else-if="job">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ job.position }}</h2>
          <p class="text-sm text-gray-500 mt-1">Đăng ngày {{ formatDate(job.created_at) }}</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <AppBadge :variant="recruitmentStatusMeta(job.status).variant">{{ recruitmentStatusMeta(job.status).label }}</AppBadge>
          <NuxtLink :to="`/recruitment/edit-recruitment/${job.id}`">
            <AppButton size="sm" variant="secondary">{{ $t('common.edit') }}</AppButton>
          </NuxtLink>
        </div>
      </div>

      <!-- Details grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="card">
          <p class="text-xs text-gray-500 mb-1">Số lượng cần tuyển</p>
          <p class="text-2xl font-bold text-primary-700">{{ job.quantity }}</p>
        </div>
        <div class="card">
          <p class="text-xs text-gray-500 mb-1">Mức lương</p>
          <p class="font-semibold text-gray-800">{{ job.salary_range || '—' }}</p>
        </div>
        <div class="card">
          <p class="text-xs text-gray-500 mb-1">Hạn nộp hồ sơ</p>
          <p class="font-semibold text-gray-800">{{ job.deadline ? formatDate(job.deadline) : '—' }}</p>
        </div>
      </div>

      <!-- Description -->
      <div class="card mb-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Mô tả công việc</h3>
        <div class="prose prose-sm text-gray-700 whitespace-pre-wrap">{{ job.description }}</div>
      </div>

      <!-- CV list -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-700">Hồ sơ ứng viên ({{ cvList.length }})</h3>
        </div>
        <div v-if="cvList.length === 0" class="text-center py-6 text-sm text-gray-400">Chưa có hồ sơ ứng viên</div>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="cv in cvList" :key="cv.id" class="py-3 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <span class="text-xs font-bold text-primary-700">{{ getInitials(cv.name) }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ cv.name }}</p>
                <p class="text-xs text-gray-500">{{ cv.email }}</p>
              </div>
            </div>
            <AppBadge :variant="cv.status === 1 ? 'green' : cv.status === 2 ? 'red' : 'yellow'">
              {{ cv.status === 1 ? 'Đạt' : cv.status === 2 ? 'Loại' : 'Đang xét' }}
            </AppBadge>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/date'
import { recruitmentStatusMeta, getInitials } from '~/utils/format'
import type { Recruitment, Candidate } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'recruitment' } })

const route = useRoute()
const router = useRouter()
const { post } = useApi()

const job     = ref<any>(null)
const cvList  = ref<any[]>([])
const loading = ref(true)
const error   = ref('')

useHead(computed(() => ({ title: job.value?.position ? `${job.value.position} — Micro ERP` : 'Chi tiết tuyển dụng' })))

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) { router.replace('/recruitment/manage-recruitment'); return }
  try {
    const [jobRes, cvRes] = await Promise.all([
      post<{ recruitment: Recruitment }>('/recruitment/get-recruitment', { id }),
      post<{ cvs: Candidate[] }>('/recruitment/get-cvs', { recruitment_id: id }).catch(() => ({ data: { cvs: [] } })),
    ])
    job.value    = jobRes.data?.recruitment ?? null
    cvList.value = cvRes.data?.cvs ?? []
    if (!job.value) router.replace('/recruitment/manage-recruitment')
  } catch (err: any) {
    error.value = err?.message ?? 'Không thể tải chi tiết tuyển dụng.'
  } finally {
    loading.value = false
  }
})
</script>
