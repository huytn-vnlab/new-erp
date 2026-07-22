<script setup lang="ts">
import { Mail, Phone, Building2, Calendar, Briefcase, X, Cake, FolderOpen } from 'lucide-vue-next'
import Drawer from '~/components/base/Drawer.vue'
import Avatar from '~/components/base/Avatar.vue'
import Btn from '~/components/base/Button.vue'
import type { Member, MemberDetail, ProjectRow } from '~/types'
import { formatDateDisplay } from '~/utils/date'

const props = defineProps<{ open: boolean; member: Member | null; detail: MemberDetail | null }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const { t } = useI18n()
const { post } = useApi()

const ROLE_KEY: Record<string, string> = {
  'user':            'hrm.member.role.user',
  'manager':         'hrm.member.role.manager',
  'general manager': 'hrm.member.role.generalManager',
}
const roleLabel = (role: string) => t(ROLE_KEY[role?.toLowerCase()] ?? role)

function formatDate(s: string | null | undefined) {
  return s ? (formatDateDisplay(s) || s) : '—'
}

const RANK_COLOR: Record<string, string> = { S: '#0ea5e9', A: '#22c55e', B: '#a3a3a3', C: '#eab308', D: '#f97316', E: '#ef4444' }

const memberProjects = ref<ProjectRow[]>([])
const projectsLoading = ref(false)

watch(() => props.member?.id, async (id) => {
  memberProjects.value = []
  if (!id) return
  projectsLoading.value = true
  try {
    const res = await post<ProjectRow[]>('/user-project/get-projects-user-join', { user_id: id })
    memberProjects.value = res.data ?? []
  } catch { /* non-critical */ }
  finally { projectsLoading.value = false }
}, { immediate: true })
</script>

<template>
  <Drawer :open="open" :title="member?.name" @update:open="emit('update:open', $event)">
    <template v-if="member">
      <div class="p-5 border-b border-border/70 flex items-start justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <Avatar :name="member.name" :size="48" />
          <div class="min-w-0">
            <h3 class="font-bold text-[16px] font-heading text-foreground truncate">{{ member.name }}</h3>
            <p class="text-[12px] text-muted-foreground truncate">
              {{ roleLabel(detail?.role_name ?? member.role) }}
              <template v-if="detail?.job_title_name"> · {{ detail.job_title_name }}</template>
            </p>
          </div>
        </div>
        <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="emit('update:open', false)"><X :size="16" /></button>
      </div>

      <div class="flex-1 overflow-y-auto overscroll-contain scrollbar-thin p-5 space-y-5">
        <!-- contact info -->
        <div>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">{{ t('hrm.member.detail.contactInfo') }}</p>
          <ul class="space-y-2 text-[13px]">
            <li class="flex items-center gap-2"><Mail :size="13" class="text-primary" /> {{ detail?.email ?? member.email }}</li>
            <li class="flex items-center gap-2"><Phone :size="13" class="text-primary" /> <span class="font-mono">{{ detail?.phone_number || member.phone || '—' }}</span></li>
            <li class="flex items-center gap-2">
              <Building2 :size="13" class="text-primary shrink-0" />
              <span>{{ detail?.branch_name || member.branch || '—' }}</span>
            </li>
            <li class="flex items-center gap-2"><Calendar :size="13" class="text-primary" /> {{ t('hrm.member.detail.joinedCompany') }} <span class="font-mono ml-1">{{ formatDate(detail?.company_joined_date) }}</span></li>
            <li v-if="detail?.birthday" class="flex items-center gap-2"><Cake :size="13" class="text-primary" /> <span class="font-mono">{{ formatDate(detail.birthday) }}</span></li>
          </ul>
        </div>

        <!-- work -->
        <div v-if="detail?.department || detail?.job_title_name">
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">{{ t('hrm.member.detail.work') }}</p>
          <ul class="space-y-2 text-[13px]">
            <li v-if="detail.job_title_name" class="flex items-center gap-2"><Briefcase :size="13" class="text-primary" /> {{ detail.job_title_name }}</li>
            <li v-if="detail.department" class="flex items-center gap-2 text-foreground/80 pl-5">{{ detail.department }}</li>
          </ul>
        </div>

        <!-- evaluation -->
        <div>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">{{ t('hrm.member.detail.evaluation') }}</p>
          <div v-if="detail?.rank_name" class="flex items-center gap-3">
            <span
              class="inline-flex items-center justify-center w-12 h-12 rounded-xl text-white text-[20px] font-bold font-heading shrink-0"
              :style="{ background: RANK_COLOR[detail.rank_name] ?? '#a3a3a3' }"
            >{{ detail.rank_name }}</span>
            <div class="flex-1">
              <p class="text-[13px] font-semibold">{{ t('hrm.member.detail.lastTerm') }}</p>
            </div>
          </div>
          <div v-else class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground text-[20px] font-bold font-heading shrink-0">?</span>
            <p class="text-[12px] text-muted-foreground">{{ t('hrm.member.detail.noEvaluation') }}</p>
          </div>
        </div>

        <!-- projects -->
        <div>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">{{ t('hrm.member.detail.projects') }}</p>
          <template v-if="projectsLoading">
            <div class="space-y-2">
              <div class="h-8 rounded-lg bg-muted animate-pulse" />
              <div class="h-8 rounded-lg bg-muted animate-pulse w-4/5" />
            </div>
          </template>
          <template v-else-if="memberProjects.length">
            <ul class="space-y-1.5">
              <li
                v-for="p in memberProjects"
                :key="p.project_id"
                class="flex items-center gap-2 text-[13px] text-foreground/80"
              >
                <FolderOpen :size="13" class="text-primary shrink-0" />
                {{ p.project_name }}
              </li>
            </ul>
          </template>
          <p v-else class="text-[12px] text-muted-foreground">{{ t('hrm.member.detail.noProjects') }}</p>
        </div>

        <!-- skills -->
        <div>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">{{ t('hrm.member.detail.skills') }}</p>
          <template v-if="detail">
            <div v-if="detail.skill?.length" class="flex flex-wrap gap-1.5">
              <span v-for="s in detail.skill" :key="s.title" class="px-2 py-0.5 rounded-full text-[11.5px] bg-muted text-foreground/80">{{ s.title }}</span>
            </div>
            <p v-else class="text-[12px] text-muted-foreground">{{ t('hrm.member.detail.noSkills') }}</p>
          </template>
          <div v-else class="flex flex-wrap gap-1.5">
            <span class="h-5 w-14 rounded-full bg-muted animate-pulse" />
            <span class="h-5 w-20 rounded-full bg-muted animate-pulse" />
            <span class="h-5 w-16 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-border/70">
        <Btn variant="outline" size="sm" class="w-full" @click="navigateTo('/hrm/member/' + member!.id)">{{ t('hrm.member.detail.viewProfile') }}</Btn>
      </div>
    </template>
  </Drawer>
</template>
