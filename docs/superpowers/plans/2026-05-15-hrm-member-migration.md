# HRM Member Pages Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all 5 pages under `pages/hrm/member/` from legacy custom components (AppInput, AppSelect, AppButton, AppBadge, AppAlert, AppTable, .card CSS class, `text-gray-*`) to shadcn-vue components and design tokens, matching the visual style of the rest of the new SPA.

**Architecture:** Each page is a self-contained rewrite — no new stores, composables, or API changes. Logic is preserved exactly; only the template + component imports change. Legacy components (`AppInput`, `AppSelect`, etc.) stay in the codebase and are NOT deleted — other pages may still use them.

**Tech Stack:** Vue 3, Nuxt 3, shadcn-vue (`Card`, `Button`, `Input`, `Badge`, `Avatar`, `Tabs`, `Skeleton`, `Separator`), Tailwind CSS v4, lucide-vue-next, vee-validate (edit-account only), reka-ui (via Tabs).

---

## Shadcn Components Available

All already installed — import paths shown per-task:
- `Card/CardHeader/CardTitle/CardContent` → `~/components/ui/Card.vue` etc.
- `Button` → `~/components/ui/button` (named export `Button`)
- `Input` → `~/components/ui/input` (named export `Input`)
- `Badge` → `~/components/ui/Badge.vue`
- `Avatar/AvatarFallback/AvatarImage` → `~/components/ui/Avatar.vue` etc.
- `Tabs/TabsList/TabsTrigger/TabsContent` → `~/components/ui/Tabs.vue` etc.
- `Skeleton` → `~/components/ui/skeleton` (named export `Skeleton`)
- `Separator` → `~/components/ui/separator` (named export `Separator`)

## Design Token Quick Reference

| Old class | New class |
|---|---|
| `text-gray-900` / `text-gray-800` | `text-foreground` |
| `text-gray-500` / `text-gray-400` | `text-muted-foreground` |
| `text-primary-600` / `text-primary-700` | `text-primary` |
| `bg-primary-100` | `bg-primary/10` |
| `border-gray-200` | `border-border` |
| `hover:bg-gray-50` | `hover:bg-muted/50` |
| `.card` CSS class | `<Card><CardContent class="p-6">` |

## Reusable inline patterns (used in multiple tasks)

**Select styled to match shadcn Input:**
```html
<select
  v-model="someRef"
  class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
>
  <option value="">Placeholder</option>
  <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
</select>
```

**Input with label + error:**
```html
<div class="space-y-1.5">
  <label class="text-sm font-medium leading-none">Label <span class="text-destructive">*</span></label>
  <Input v-model="form.field" />
  <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
</div>
```

---

## File Map

| File | Action |
|---|---|
| `pages/hrm/member/profile-list.vue` | Rewrite template + imports |
| `pages/hrm/member/view-profile/[id].vue` | Rewrite template + imports |
| `pages/hrm/member/edit-profile/[id].vue` | Rewrite template + imports |
| `pages/hrm/member/manage-request.vue` | Rewrite template + imports |
| `pages/hrm/member/edit-account.vue` | Rewrite template + imports |

---

### Task 1: Migrate profile-list.vue

Employee grid with search + branch/role filters. Replace `AppInput` → `Input`, filter selects → styled native selects, `AppBadge` → `Badge`, `.card` grid items → `Card`, `AppSpinner` → `Skeleton` cards.

**Files:**
- Modify: `pages/hrm/member/profile-list.vue`

- [ ] **Step 1: Rewrite the file**

Replace the entire file with:

```vue
<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <h2 class="text-lg font-semibold text-foreground">Danh sách nhân viên</h2>
      <div class="relative w-full sm:w-56">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input v-model="search" placeholder="Tìm kiếm..." class="pl-9" />
      </div>
    </div>

    <!-- Filter bar -->
    <div class="flex flex-wrap gap-3 mb-6">
      <select
        v-model="filterBranch"
        class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option v-for="opt in branchOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <select
        v-model="filterRole"
        class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>

    <!-- Skeleton loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Card v-for="n in 8" :key="n">
        <CardContent class="flex flex-col items-center gap-3 p-6">
          <Skeleton class="h-16 w-16 rounded-full" />
          <Skeleton class="h-4 w-32" />
          <Skeleton class="h-3 w-24" />
          <Skeleton class="h-5 w-16 rounded-full" />
        </CardContent>
      </Card>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredMembers.length === 0" class="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <Users class="h-12 w-12 mb-3 opacity-20" />
      <p class="text-sm">Không tìm thấy nhân viên</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <NuxtLink
        v-for="member in filteredMembers"
        :key="member.id"
        :to="`/hrm/member/view-profile/${member.id}`"
      >
        <Card class="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer h-full">
          <CardContent class="flex flex-col items-center text-center gap-2 p-6">
            <Avatar class="h-16 w-16">
              <AvatarImage v-if="member.avatar" :src="member.avatar" :alt="member.full_name" />
              <AvatarFallback class="bg-primary/10 text-primary text-lg font-bold">
                {{ getInitials(member.full_name) }}
              </AvatarFallback>
            </Avatar>
            <div>
              <p class="font-semibold text-foreground text-sm">{{ member.full_name }}</p>
              <p class="text-xs text-muted-foreground truncate max-w-[160px]">{{ member.email }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ member.job_title || '—' }}</p>
              <Badge variant="secondary" class="mt-2">{{ member.branch_name || 'HQ' }}</Badge>
            </div>
          </CardContent>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Users } from 'lucide-vue-next'
import { useUserProfile } from '~/composables/useUserProfile'
import { getInitials } from '~/utils/format'
import Card from '~/components/ui/Card.vue'
import CardContent from '~/components/ui/CardContent.vue'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import Badge from '~/components/ui/Badge.vue'
import Avatar from '~/components/ui/Avatar.vue'
import AvatarFallback from '~/components/ui/AvatarFallback.vue'
import AvatarImage from '~/components/ui/AvatarImage.vue'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({ layout: 'admin', middleware: ['auth', 'module-role'], meta: { module: 'member' } })
useHead({ title: 'Danh sách nhân viên — Micro ERP' })

const { fetchMemberList } = useUserProfile()

const members      = ref<any[]>([])
const loading      = ref(true)
const search       = ref('')
const filterBranch = ref('')
const filterRole   = ref('')

const branchOptions = ref<{ value: string; label: string }[]>([])
const roleOptions = [
  { value: '',  label: 'Tất cả vai trò' },
  { value: '1', label: 'Admin' },
  { value: '2', label: 'Nhân viên' },
]

const filteredMembers = computed(() => {
  let list = members.value
  if (search.value)       list = list.filter(m => m.full_name?.toLowerCase().includes(search.value.toLowerCase()) || m.email?.toLowerCase().includes(search.value.toLowerCase()))
  if (filterBranch.value) list = list.filter(m => String(m.branch_id) === filterBranch.value)
  if (filterRole.value)   list = list.filter(m => String(m.role_id) === filterRole.value)
  return list
})

onMounted(async () => {
  try {
    members.value = await fetchMemberList()
    const branches = [...new Map(members.value.filter(m => m.branch_id).map(m => [m.branch_id, { value: String(m.branch_id), label: m.branch_name || `Branch ${m.branch_id}` }])).values()]
    branchOptions.value = [{ value: '', label: 'Tất cả chi nhánh' }, ...branches]
  } finally {
    loading.value = false
  }
})
</script>
```

- [ ] **Step 2: Verify in browser**

Navigate to `/hrm/member/profile-list`.
- Skeleton cards appear while loading
- Cards render with avatar initials (or photo if present)
- Search filters in real time
- Branch/role dropdowns filter correctly
- Clicking a card navigates to view-profile

---

### Task 2: Migrate view-profile/[id].vue

Profile detail page. Replace `.card` → `Card`, `AppBadge` → `Badge`, `AppButton` → `Button`, `AppAlert` → inline error, `AppSpinner` → `Skeleton`, `text-gray-*` → design tokens.

**Files:**
- Modify: `pages/hrm/member/view-profile/[id].vue`

- [ ] **Step 1: Rewrite the file**

```vue
<template>
  <div>
    <!-- Skeleton -->
    <div v-if="loading" class="space-y-4">
      <Card>
        <CardContent class="flex flex-col sm:flex-row items-center gap-6 p-6">
          <Skeleton class="h-24 w-24 rounded-full shrink-0" />
          <div class="space-y-2 flex-1">
            <Skeleton class="h-6 w-48" />
            <Skeleton class="h-4 w-32" />
            <div class="flex gap-2 mt-2">
              <Skeleton class="h-6 w-20 rounded-full" />
              <Skeleton class="h-6 w-20 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardContent class="p-6 space-y-3">
          <Skeleton v-for="n in 4" :key="n" class="h-4 w-full" />
        </CardContent></Card>
        <Card><CardContent class="p-6 space-y-3">
          <Skeleton v-for="n in 4" :key="n" class="h-4 w-full" />
        </CardContent></Card>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {{ error }}
    </div>

    <template v-else-if="profile">
      <!-- Profile header -->
      <Card class="mb-6">
        <CardContent class="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6">
          <Avatar class="h-24 w-24 shrink-0">
            <AvatarImage v-if="profile.avatar" :src="profile.avatar" :alt="profile.full_name" />
            <AvatarFallback class="bg-primary/10 text-primary text-3xl font-bold">
              {{ getInitials(profile.full_name) }}
            </AvatarFallback>
          </Avatar>
          <div class="flex-1 text-center sm:text-left">
            <h2 class="text-xl font-bold text-foreground">{{ profile.full_name }}</h2>
            <p class="text-muted-foreground text-sm mt-0.5">{{ profile.job_title || '—' }}</p>
            <div class="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
              <Badge variant="secondary">{{ profile.branch_name || 'HQ' }}</Badge>
              <Badge :variant="(profile.role_id ?? 1) >= 2 ? 'default' : 'outline'">
                {{ (profile.role_id ?? 1) >= 2 ? 'Admin' : 'Nhân viên' }}
              </Badge>
            </div>
          </div>
          <div v-if="canEditProfile" class="shrink-0">
            <NuxtLink :to="`/hrm/member/edit-profile/${profile.id}`">
              <Button variant="outline" size="sm">{{ $t('common.edit') }}</Button>
            </NuxtLink>
          </div>
        </CardContent>
      </Card>

      <!-- Info sections -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader><CardTitle class="text-sm font-semibold">Thông tin liên hệ</CardTitle></CardHeader>
          <CardContent class="space-y-3 pt-0">
            <div v-for="row in contactRows" :key="row.label" class="flex gap-2 text-sm">
              <dt class="text-muted-foreground w-24 shrink-0">{{ row.label }}</dt>
              <dd class="text-foreground">{{ row.value }}</dd>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle class="text-sm font-semibold">Thông tin công việc</CardTitle></CardHeader>
          <CardContent class="space-y-3 pt-0">
            <div v-for="row in workRows" :key="row.label" class="flex gap-2 text-sm">
              <dt class="text-muted-foreground w-24 shrink-0">{{ row.label }}</dt>
              <dd class="text-foreground">{{ row.value }}</dd>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Skills -->
      <Card v-if="profile.skills?.length" class="mb-4">
        <CardHeader><CardTitle class="text-sm font-semibold">Kỹ năng</CardTitle></CardHeader>
        <CardContent class="flex flex-wrap gap-2 pt-0">
          <Badge
            v-for="skill in profile.skills"
            :key="skill.id"
            variant="secondary"
            class="font-medium"
          >{{ skill.name }}</Badge>
        </CardContent>
      </Card>

      <!-- Introduce -->
      <Card v-if="profile.introduce">
        <CardHeader><CardTitle class="text-sm font-semibold">Giới thiệu</CardTitle></CardHeader>
        <CardContent class="pt-0">
          <p class="text-sm text-foreground whitespace-pre-wrap">{{ profile.introduce }}</p>
        </CardContent>
      </Card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useUserProfileStore } from '~/stores/user-profile'
import { formatDate } from '~/utils/date'
import { getInitials } from '~/utils/format'
import { isAdmin } from '~/utils/permission'
import Card from '~/components/ui/Card.vue'
import CardHeader from '~/components/ui/CardHeader.vue'
import CardTitle from '~/components/ui/CardTitle.vue'
import CardContent from '~/components/ui/CardContent.vue'
import Badge from '~/components/ui/Badge.vue'
import Avatar from '~/components/ui/Avatar.vue'
import AvatarFallback from '~/components/ui/AvatarFallback.vue'
import AvatarImage from '~/components/ui/AvatarImage.vue'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const route        = useRoute()
const router       = useRouter()
const { user }     = useAuth()
const profileStore = useUserProfileStore()

const profile = computed(() => profileStore.profile)
const loading = ref(true)
const error   = ref('')

useHead(computed(() => ({ title: profile.value?.full_name ? `${profile.value.full_name} — Micro ERP` : 'Hồ sơ nhân viên' })))

const canEditProfile = computed(() => isAdmin(user.value) || user.value?.id === profile.value?.id)

const contactRows = computed(() => [
  { label: 'Email',      value: profile.value?.email || '—' },
  { label: 'Điện thoại', value: profile.value?.phone || '—' },
  { label: 'Ngày sinh',  value: profile.value?.date_of_birth ? formatDate(profile.value.date_of_birth) : (profile.value?.birthday ? formatDate(profile.value.birthday) : '—') },
  { label: 'Địa chỉ',   value: profile.value?.address || '—' },
])

const workRows = computed(() => [
  { label: 'Chức danh', value: profile.value?.job_title || '—' },
  { label: 'Chi nhánh', value: profile.value?.branch_name || '—' },
  { label: 'Cấp bậc',  value: profile.value?.rank || '—' },
  { label: 'Vào làm',  value: profile.value?.start_date ? formatDate(profile.value.start_date) : '—' },
])

onMounted(async () => {
  const id = Number(route.params.id) || user.value?.id
  if (!id) { router.replace('/home-admin'); return }
  try {
    await profileStore.fetchProfile(id)
  } catch (err: any) {
    error.value = err?.message ?? 'Không thể tải hồ sơ.'
  } finally {
    loading.value = false
  }
})
</script>
```

- [ ] **Step 2: Verify in browser**

Navigate to `/hrm/member/view-profile/<any-id>`.
- Skeleton shows during load
- Avatar with initials renders when no photo
- Both info cards render correctly
- Skills badges show
- Edit button only visible for own profile or admin

---

### Task 3: Migrate edit-profile/[id].vue

Edit form with basic info, bio textarea, skill toggles. Replace `AppInput` → `Input` + label wrapper, `AppSelect` → styled native select, `AppButton` → `Button`, `.card` → `Card`, skill toggles use primary color classes.

**Files:**
- Modify: `pages/hrm/member/edit-profile/[id].vue`

- [ ] **Step 1: Rewrite the file**

```vue
<template>
  <div class="max-w-3xl mx-auto">
    <div v-if="loading" class="space-y-4">
      <Card><CardContent class="p-6 space-y-4">
        <Skeleton class="h-5 w-32" />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton v-for="n in 6" :key="n" class="h-10 w-full rounded-md" />
        </div>
      </CardContent></Card>
    </div>

    <template v-else-if="form">
      <!-- Server error -->
      <div v-if="serverError" class="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {{ serverError }}
      </div>

      <!-- Basic info -->
      <Card class="mb-4">
        <CardHeader><CardTitle>Thông tin cơ bản</CardTitle></CardHeader>
        <CardContent class="pt-0">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium leading-none">Họ và tên <span class="text-destructive">*</span></label>
              <Input v-model="form.full_name" placeholder="Nguyễn Văn A" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium leading-none">Số điện thoại</label>
              <Input v-model="form.phone" type="tel" placeholder="0901 234 567" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium leading-none">Ngày sinh</label>
              <Input v-model="form.date_of_birth" type="date" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium leading-none">Địa chỉ</label>
              <Input v-model="form.address" placeholder="123 Đường ABC, TP.HCM" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium leading-none">Chi nhánh</label>
              <select
                v-model="form.branch_id"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">— Chọn chi nhánh —</option>
                <option v-for="b in branchOptions" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium leading-none">Chức danh</label>
              <select
                v-model="form.job_title_id"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">— Chọn chức danh —</option>
                <option v-for="jt in jobTitleOptions" :key="jt.id" :value="jt.id">{{ jt.name }}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Introduce -->
      <Card class="mb-4">
        <CardHeader><CardTitle>Giới thiệu bản thân</CardTitle></CardHeader>
        <CardContent class="pt-0">
          <textarea
            v-model="form.introduce"
            rows="4"
            placeholder="Viết vài dòng giới thiệu về bản thân..."
            class="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        </CardContent>
      </Card>

      <!-- Skills -->
      <Card class="mb-6">
        <CardHeader><CardTitle>Kỹ năng &amp; Công nghệ</CardTitle></CardHeader>
        <CardContent class="pt-0">
          <div class="flex flex-wrap gap-2 mb-2">
            <button
              v-for="skill in availableSkills"
              :key="skill.id"
              type="button"
              class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              :class="selectedSkillIds.has(skill.id)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-input hover:border-primary/60'"
              @click="toggleSkill(skill.id)"
            >{{ skill.name }}</button>
          </div>
          <p class="text-xs text-muted-foreground">Nhấn để chọn/bỏ chọn kỹ năng</p>
        </CardContent>
      </Card>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <Button variant="outline" @click="$router.back()">{{ $t('common.cancel') }}</Button>
        <Button :disabled="saving" @click="save">
          <AppSpinner v-if="saving" class="mr-2 h-4 w-4" />
          {{ $t('common.save') }}
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useUserProfile } from '~/composables/useUserProfile'
import { useSettingStore } from '~/stores/setting'
import Card from '~/components/ui/Card.vue'
import CardHeader from '~/components/ui/CardHeader.vue'
import CardTitle from '~/components/ui/CardTitle.vue'
import CardContent from '~/components/ui/CardContent.vue'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import AppSpinner from '~/components/ui/AppSpinner.vue'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useHead({ title: 'Chỉnh sửa hồ sơ — Micro ERP' })

const route   = useRoute()
const router  = useRouter()
const { user } = useAuth()
const { loadProfile, saveProfile, profile: storeProfile } = useUserProfile()
const settingStore = useSettingStore()
const { post } = useApi()

const loading = ref(true)
const saving  = ref(false)
const serverError = ref('')
const form = ref<any>(null)

const branchOptions   = ref<any[]>([])
const jobTitleOptions = ref<any[]>([])
const availableSkills = ref<any[]>([])
const selectedSkillIds = ref(new Set<number>())

function toggleSkill(id: number) {
  if (selectedSkillIds.value.has(id)) selectedSkillIds.value.delete(id)
  else selectedSkillIds.value.add(id)
}

onMounted(async () => {
  const id = Number(route.params.id) || user.value?.id
  if (!id) { router.replace('/home-admin'); return }
  if (user.value?.id !== id && !user.value?.is_admin) {
    router.replace(`/hrm/member/view-profile/${id}`); return
  }
  try {
    const [, branchRes, skillRes] = await Promise.all([
      loadProfile(id),
      post<{ branches: { id: number; name: string }[] }>('/setting/get-branches', { org_id: user.value?.organization_id }).catch(() => ({ data: { branches: [] as { id: number; name: string }[] }, status: 0, message: '' })),
      post<{ skills: { id: number; name: string }[] }>('/user/get-skills', {}).catch(() => ({ data: { skills: [] as { id: number; name: string }[] }, status: 0, message: '' })),
    ])
    const p = storeProfile
    form.value = {
      full_name:     p?.full_name ?? '',
      phone:         p?.phone ?? '',
      date_of_birth: p?.birthday ?? '',
      address:       p?.address ?? '',
      branch_id:     p?.branch_id ?? '',
      job_title_id:  '',
      introduce:     p?.bio ?? '',
    }
    branchOptions.value   = branchRes.data?.branches ?? []
    jobTitleOptions.value = settingStore.jobTitles
    availableSkills.value = skillRes.data?.skills ?? []
    selectedSkillIds.value = new Set((p?.skills ?? []).map((s: any) => s.id))
  } catch {
    serverError.value = 'Không thể tải hồ sơ.'
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  serverError.value = ''
  try {
    await saveProfile({
      ...form.value,
      skill_ids: [...selectedSkillIds.value],
      user_id: Number(route.params.id) || user.value?.id,
    })
    router.push(`/hrm/member/view-profile/${route.params.id || user.value?.id}`)
  } catch {
    serverError.value = 'Lưu không thành công.'
  } finally {
    saving.value = false
  }
}
</script>
```

- [ ] **Step 2: Verify in browser**

Navigate to `/hrm/member/edit-profile/<own-id>`.
- Skeleton shows during load
- All fields pre-populate from existing profile
- Skill toggles highlight selected skills with primary color
- Save navigates back to view-profile on success

---

### Task 4: Migrate manage-request.vue (admin)

Admin-only page. Replace custom tab buttons → `Tabs`, `AppTable` → plain HTML table, `AppButton` → `Button`, `.badge-*` → `Badge`.

**Files:**
- Modify: `pages/hrm/member/manage-request.vue`

- [ ] **Step 1: Rewrite the file**

```vue
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
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/40">
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nhân viên</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Loại yêu cầu</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nội dung</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ngày gửi</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Trạng thái</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-28"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in requests"
                :key="row.id"
                class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td class="px-4 py-3 font-medium">{{ row.full_name }}</td>
                <td class="px-4 py-3">{{ requestTypeLabel(row.type) }}</td>
                <td class="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{{ row.content }}</td>
                <td class="px-4 py-3 text-muted-foreground">{{ formatDate(row.created_at) }}</td>
                <td class="px-4 py-3">
                  <Badge
                    :variant="row.status === 0 ? 'outline' : row.status === 1 ? 'default' : 'destructive'"
                    :class="row.status === 0 ? 'text-amber-600 border-amber-400' : row.status === 1 ? 'bg-green-600 hover:bg-green-600' : ''"
                  >
                    {{ requestStatusLabel(row.status) }}
                  </Badge>
                </td>
                <td class="px-4 py-3">
                  <div v-if="row.status === 0" class="flex gap-2">
                    <Button
                      size="sm"
                      :disabled="actionId === row.id"
                      @click="doApprove(row)"
                    >
                      <AppSpinner v-if="actionId === row.id && doing === 'approve'" class="mr-1 h-3 w-3" />
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      :disabled="actionId === row.id"
                      @click="doReject(row)"
                    >
                      <AppSpinner v-if="actionId === row.id && doing === 'reject'" class="mr-1 h-3 w-3" />
                      Từ chối
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/date'
import { handleApiError } from '~/utils/error-handler'
import Badge from '~/components/ui/Badge.vue'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import Tabs from '~/components/ui/Tabs.vue'
import TabsList from '~/components/ui/TabsList.vue'
import TabsTrigger from '~/components/ui/TabsTrigger.vue'
import TabsContent from '~/components/ui/TabsContent.vue'
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
```

- [ ] **Step 2: Verify in browser** (admin account required)

Navigate to `/hrm/member/manage-request`.
- Tabs switch between Chờ duyệt / Đã duyệt / Tất cả and reload data
- Badge count on "Chờ duyệt" shows pending count
- Approve/Reject buttons visible only for status=0 rows
- Status badge colors: amber=pending, green=approved, red=rejected

---

### Task 5: Migrate edit-account.vue (change password)

Simple form with vee-validate. Replace `.card` → `Card`, `AppInput` → `Input` inside `Field`, `AppButton` → `Button`, `AppAlert` → inline states.

**Files:**
- Modify: `pages/hrm/member/edit-account.vue`

- [ ] **Step 1: Rewrite the file**

```vue
<template>
  <div class="max-w-xl mx-auto">
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <!-- Success -->
        <div v-if="successMsg" class="mb-4 rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          {{ successMsg }}
        </div>
        <!-- Error -->
        <div v-if="errorMsg" class="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {{ errorMsg }}
        </div>

        <Form :validation-schema="schema" @submit="onSubmit" v-slot="{ isSubmitting }">
          <div class="space-y-4 mb-6">
            <Field name="current_password" v-slot="{ field, errors }">
              <div class="space-y-1.5">
                <label class="text-sm font-medium leading-none">Mật khẩu hiện tại <span class="text-destructive">*</span></label>
                <Input v-bind="field" type="password" autocomplete="current-password" :class="errors.length ? 'border-destructive focus-visible:ring-destructive' : ''" />
                <p v-if="errors[0]" class="text-xs text-destructive">{{ errors[0] }}</p>
              </div>
            </Field>
            <Field name="new_password" v-slot="{ field, errors }">
              <div class="space-y-1.5">
                <label class="text-sm font-medium leading-none">Mật khẩu mới <span class="text-destructive">*</span></label>
                <Input v-bind="field" type="password" autocomplete="new-password" :class="errors.length ? 'border-destructive focus-visible:ring-destructive' : ''" />
                <p v-if="errors[0]" class="text-xs text-destructive">{{ errors[0] }}</p>
              </div>
            </Field>
            <Field name="repeat_new_password" v-slot="{ field, errors }">
              <div class="space-y-1.5">
                <label class="text-sm font-medium leading-none">Xác nhận mật khẩu mới <span class="text-destructive">*</span></label>
                <Input v-bind="field" type="password" autocomplete="new-password" :class="errors.length ? 'border-destructive focus-visible:ring-destructive' : ''" />
                <p v-if="errors[0]" class="text-xs text-destructive">{{ errors[0] }}</p>
              </div>
            </Field>
          </div>

          <Button type="submit" :disabled="isSubmitting" class="w-full">
            <AppSpinner v-if="isSubmitting" class="mr-2 h-4 w-4" />
            Đổi mật khẩu
          </Button>
        </Form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { handleApiError } from '~/utils/error-handler'
import Card from '~/components/ui/Card.vue'
import CardHeader from '~/components/ui/CardHeader.vue'
import CardTitle from '~/components/ui/CardTitle.vue'
import CardContent from '~/components/ui/CardContent.vue'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import AppSpinner from '~/components/ui/AppSpinner.vue'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: 'Đổi mật khẩu — Micro ERP' })

const { post } = useApi()
const successMsg = ref('')
const errorMsg   = ref('')

const schema = toTypedSchema(z.object({
  current_password:    z.string().min(8, 'Ít nhất 8 ký tự'),
  new_password:        z.string().min(8, 'Ít nhất 8 ký tự'),
  repeat_new_password: z.string().min(8, 'Ít nhất 8 ký tự'),
}).refine(d => d.new_password === d.repeat_new_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['repeat_new_password'],
}))

async function onSubmit(values: any, { resetForm }: any) {
  successMsg.value = ''
  errorMsg.value   = ''
  try {
    await post('/api/user/changepassword', {
      current_password:    values.current_password,
      new_password:        values.new_password,
      repeat_new_password: values.repeat_new_password,
    })
    successMsg.value = 'Đã đổi mật khẩu thành công!'
    resetForm()
  } catch (err) {
    const e = err as any
    const status = e?.response?.status ?? e?.status
    if (status === 401 || status === 400) {
      errorMsg.value = 'Mật khẩu hiện tại không đúng.'
    } else {
      errorMsg.value = handleApiError(err)
    }
  }
}
</script>
```

- [ ] **Step 2: Verify in browser**

Navigate to `/hrm/member/edit-account`.
- Form renders inside Card with proper title
- Inline validation errors appear below each field
- Wrong current password → shows error banner
- Success → green banner + form resets

---

## Self-Review

**Spec coverage:**
- ✅ profile-list: search, branch filter, role filter, grid of cards, skeleton loading, Avatar, Badge
- ✅ view-profile: header with avatar+badges, contact/work info cards, skills, bio, edit button (admin/own only), skeleton
- ✅ edit-profile: all fields, branch/job-title selects, textarea, skill toggles, save/cancel
- ✅ manage-request: shadcn Tabs, table with approve/reject, badge status colors
- ✅ edit-account: vee-validate preserved, Input + Button, inline feedback

**Placeholder scan:** None found — all tasks have complete file content.

**Type consistency:** `UserProfile` from `~/types` used consistently. `form.value` shape in edit-profile matches original exactly (`full_name`, `phone`, `date_of_birth`, `address`, `branch_id`, `job_title_id`, `introduce`). API endpoints unchanged.
