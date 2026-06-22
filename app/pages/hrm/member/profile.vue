<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Mail, Phone, Calendar, MapPin, Briefcase, Award,
  Hash, Building2, User, Shield, ChevronLeft,
} from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import Avatar from '~/components/base/Avatar.vue'
import Badge from '~/components/base/Badge.vue'
import type { MemberDetail } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const auth = useAuth()
const { post } = useApi()

const profile = ref<MemberDetail | null>(null)
const loading = ref(false)
const activeTab = ref('basic')

const tabs = [
  { value: 'basic', label: 'Thông tin cơ bản' },
  { value: 'skills', label: 'Kỹ năng & Ngôn ngữ' },
  { value: 'experience', label: 'Kinh nghiệm & Giới thiệu' },
  { value: 'contact', label: 'Liên hệ' },
]

type BadgeVariant = 'green' | 'amber' | 'gray' | 'red' | 'sky' | 'violet' | 'primary'
const STATUS_META: Record<number, { label: string; variant: BadgeVariant }> = {
  1: { label: 'Đang làm việc', variant: 'green' },
  2: { label: 'Thử việc', variant: 'amber' },
  3: { label: 'Đang nghỉ phép', variant: 'sky' },
  4: { label: 'Đã nghỉ việc', variant: 'gray' },
}
function statusMeta(n?: number) {
  return (n !== undefined ? STATUS_META[n] : undefined) ?? { label: 'Không xác định', variant: 'gray' as BadgeVariant }
}

const fullName = computed(() => profile.value
  ? `${profile.value.first_name} ${profile.value.last_name}`.trim()
  : auth.user.value?.name ?? '')

async function fetchProfile() {
  const userId = auth.user.value?.id
  if (!userId) return
  loading.value = true
  try {
    const res = await post<MemberDetail>('/api/user/get-user-info', { user_id: userId })
    if (res.status === 1 && res.data) profile.value = res.data
  } catch { /* show mock fallback */ }
  finally { loading.value = false }
}

onMounted(fetchProfile)
</script>

<template>
  <div class="space-y-6">
    <PageHeader eyebrow="Hồ sơ cá nhân" :title="fullName || 'Đang tải…'">
      <template #actions>
        <Btn variant="ghost" @click="$router.back()"><ChevronLeft :size="14" />Quay lại</Btn>
        <Btn variant="primary">Chỉnh sửa hồ sơ</Btn>
      </template>
    </PageHeader>

    <!-- Loading skeleton -->
    <div v-if="loading" class="card-surface p-8 text-center text-muted-foreground text-[13px] rise">
      Đang tải hồ sơ…
    </div>

    <template v-else>
      <!-- Profile header card -->
      <div class="card-surface rise overflow-hidden">
        <div class="h-24 w-full" :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 50% / 0.18), hsl(var(--primary-h) var(--primary-s) 65% / 0.10))' }" />
        <div class="px-6 pb-6 -mt-10 flex items-end gap-5 flex-wrap">
          <div class="relative">
            <Avatar :name="fullName" :size="80" />
          </div>
          <div class="pb-1 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <Badge v-if="profile?.status !== undefined" :variant="statusMeta(profile.status).variant" dot>{{ statusMeta(profile.status).label }}</Badge>
              <Badge v-if="profile?.role_name" variant="primary">{{ profile.role_name }}</Badge>
            </div>
            <h2 class="text-[22px] font-bold font-heading text-foreground leading-tight">{{ fullName }}</h2>
            <p class="text-[13px] text-muted-foreground mt-0.5">
              {{ profile?.job_title_name || '—' }}
              <template v-if="profile?.branch_name"> · {{ profile.branch_name }}</template>
            </p>
          </div>
          <div class="flex gap-4 pb-1 text-[12.5px] text-muted-foreground">
            <div v-if="profile?.employee_id" class="flex items-center gap-1.5"><Hash :size="13" />{{ profile.employee_id }}</div>
            <div v-if="profile?.company_joined_date" class="flex items-center gap-1.5"><Calendar :size="13" />Gia nhập {{ profile.company_joined_date }}</div>
          </div>
        </div>
      </div>

      <!-- Tab strip -->
      <div class="flex gap-1 border-b border-border overflow-x-auto scrollbar-thin">
        <button
          v-for="t in tabs" :key="t.value"
          :class="'tab-trigger px-4 py-2.5 text-[13px] font-medium whitespace-nowrap ' + (activeTab === t.value ? 'active' : '')"
          @click="activeTab = t.value"
        >{{ t.label }}</button>
      </div>

      <!-- Tab: Thông tin cơ bản -->
      <div v-if="activeTab === 'basic'" class="grid grid-cols-1 md:grid-cols-2 gap-4 rise">
        <div class="card-surface p-5 space-y-4">
          <p class="section-title">Thông tin cá nhân</p>
          <dl class="space-y-3 text-[13px]">
            <div class="flex gap-3 items-start">
              <Mail :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Email công ty</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.email || '—' }}</dd>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <Mail :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Email cá nhân</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.personal_email || '—' }}</dd>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <Phone :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Số điện thoại</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.phone_number || '—' }}</dd>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <Calendar :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Ngày sinh</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.birthday || '—' }}</dd>
              </div>
            </div>
          </dl>
        </div>

        <div class="card-surface p-5 space-y-4">
          <p class="section-title">Thông tin công việc</p>
          <dl class="space-y-3 text-[13px]">
            <div class="flex gap-3 items-start">
              <Briefcase :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Chức danh</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.job_title_name || '—' }}</dd>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <Building2 :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Chi nhánh / Phòng ban</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.branch_name || '—' }}<template v-if="profile?.department"> · {{ profile.department }}</template></dd>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <Award :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Cấp bậc</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.rank_name || '—' }}</dd>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <MapPin :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Nơi làm việc</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.work_place || '—' }}</dd>
              </div>
            </div>
          </dl>
        </div>
      </div>

      <!-- Tab: Kỹ năng & Ngôn ngữ -->
      <div v-if="activeTab === 'skills'" class="grid grid-cols-1 md:grid-cols-2 gap-4 rise">
        <div class="card-surface p-5">
          <p class="section-title mb-3">Kỹ năng</p>
          <div v-if="profile?.skill && (profile.skill as unknown[]).length" class="flex flex-wrap gap-2">
            <span
              v-for="(s, i) in (profile.skill as string[])" :key="i"
              class="px-3 py-1.5 rounded-full text-[12px] font-medium bg-primary/10 text-primary"
            >{{ s }}</span>
          </div>
          <p v-else class="text-[13px] text-muted-foreground">Chưa cập nhật kỹ năng</p>
        </div>
        <div class="card-surface p-5">
          <p class="section-title mb-3">Ngoại ngữ</p>
          <div v-if="profile?.language && (profile.language as unknown[]).length" class="space-y-2">
            <div
              v-for="(l, i) in (profile.language as Record<string, string>[])" :key="i"
              class="flex items-center justify-between text-[13px] p-2.5 rounded-lg bg-muted/40"
            >
              <span class="font-medium text-foreground">{{ l.language ?? l }}</span>
              <Badge variant="sky">{{ l.level ?? '' }}</Badge>
            </div>
          </div>
          <p v-else class="text-[13px] text-muted-foreground">Chưa cập nhật ngoại ngữ</p>
        </div>
        <div class="card-surface p-5 md:col-span-2">
          <p class="section-title mb-3">Học vấn</p>
          <div v-if="profile?.education && (profile.education as unknown[]).length" class="space-y-3">
            <div
              v-for="(e, i) in (profile.education as Record<string, string>[])" :key="i"
              class="p-3.5 rounded-xl border border-border/70 text-[13px]"
            >
              <p class="font-semibold text-foreground">{{ e.school ?? e }}</p>
              <p v-if="e.major" class="text-muted-foreground mt-0.5">{{ e.major }}<template v-if="e.year"> · {{ e.year }}</template></p>
            </div>
          </div>
          <p v-else class="text-[13px] text-muted-foreground">Chưa cập nhật học vấn</p>
        </div>
      </div>

      <!-- Tab: Kinh nghiệm & Giới thiệu -->
      <div v-if="activeTab === 'experience'" class="space-y-4 rise">
        <div class="card-surface p-5">
          <p class="section-title mb-3">Giới thiệu bản thân</p>
          <p class="text-[13px] text-foreground/85 leading-relaxed whitespace-pre-line">{{ profile?.introduce || 'Chưa cập nhật' }}</p>
        </div>
        <div class="card-surface p-5">
          <p class="section-title mb-3">Kinh nghiệm làm việc</p>
          <div v-if="profile?.experience && (profile.experience as unknown[]).length" class="space-y-3">
            <div
              v-for="(e, i) in (profile.experience as Record<string, string>[])" :key="i"
              class="p-3.5 rounded-xl border border-border/70 text-[13px]"
            >
              <p class="font-semibold text-foreground">{{ e.company ?? e }}</p>
              <p v-if="e.role" class="text-muted-foreground mt-0.5">{{ e.role }}</p>
              <p v-if="e.duration" class="text-[11px] text-muted-foreground/70 mt-1 font-mono">{{ e.duration }}</p>
            </div>
          </div>
          <p v-else class="text-[13px] text-muted-foreground">Chưa cập nhật kinh nghiệm</p>
        </div>
        <div v-if="profile?.award && (profile.award as unknown[]).length" class="card-surface p-5">
          <p class="section-title mb-3">Giải thưởng & Thành tích</p>
          <ul class="space-y-2">
            <li
              v-for="(a, i) in (profile.award as string[])" :key="i"
              class="flex items-start gap-2 text-[13px]"
            >
              <Award :size="13" class="mt-0.5 text-primary shrink-0" />
              <span class="text-foreground/85">{{ a }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Tab: Liên hệ -->
      <div v-if="activeTab === 'contact'" class="grid grid-cols-1 md:grid-cols-2 gap-4 rise">
        <div class="card-surface p-5 space-y-4">
          <p class="section-title">Địa chỉ</p>
          <dl class="space-y-3 text-[13px]">
            <div class="flex gap-3 items-start">
              <MapPin :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Địa chỉ thường trú</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.permanent_residence || '—' }}</dd>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <MapPin :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Địa chỉ hiện tại</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.current_address || '—' }}</dd>
              </div>
            </div>
          </dl>
        </div>
        <div class="card-surface p-5 space-y-4">
          <p class="section-title">Liên hệ khẩn cấp</p>
          <dl class="space-y-3 text-[13px]">
            <div class="flex gap-3 items-start">
              <User :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Người liên hệ</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.name_of_emergency || '—' }}</dd>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <Shield :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Quan hệ</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.relationships_of_emergency || '—' }}</dd>
              </div>
            </div>
            <div class="flex gap-3 items-start">
              <MapPin :size="14" class="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Địa chỉ</dt>
                <dd class="mt-0.5 text-foreground">{{ profile?.address_of_emergency || '—' }}</dd>
              </div>
            </div>
          </dl>
        </div>
        <div class="card-surface p-5 md:col-span-2 space-y-4">
          <p class="section-title">Giấy tờ tùy thân</p>
          <dl class="grid grid-cols-2 md:grid-cols-3 gap-4 text-[13px]">
            <div>
              <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">CMND / CCCD</dt>
              <dd class="mt-0.5 text-foreground font-mono">{{ profile?.identity_card || '—' }}</dd>
            </div>
            <div>
              <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Ngày cấp</dt>
              <dd class="mt-0.5 text-foreground">{{ profile?.date_of_identity_card || '—' }}</dd>
            </div>
            <div>
              <dt class="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Mã số thuế</dt>
              <dd class="mt-0.5 text-foreground font-mono">{{ profile?.tax_code || '—' }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </template>
  </div>
</template>
