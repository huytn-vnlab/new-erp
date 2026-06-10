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
              <DatePicker v-model="form.date_of_birth" label="Ngày sinh" />
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
import DatePicker from '~/components/ui/DatePicker.vue'
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
