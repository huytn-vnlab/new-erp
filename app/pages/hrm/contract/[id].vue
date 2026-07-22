<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronRight, ChevronDown, FileText, Trash2 } from 'lucide-vue-next'
import Avatar from '~/components/base/Avatar.vue'
import Btn from '~/components/base/Button.vue'
import PageHeader from '~/components/layout/PageHeader.vue'
import { useContractStore } from '~/stores/contract'
import { useMemberStore } from '~/stores/member'
import type { MemberDetail, ContractByUserRow } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const contractStore = useContractStore()
const memberStore = useMemberStore()
const { show } = useToast()

const userId = computed(() => Number(route.params.id))
const profile = ref<MemberDetail | null>(null)
const loading = ref(true)
const openId = ref<number | null>(null)

onMounted(async () => {
  loading.value = true
  const [p] = await Promise.all([
    memberStore.fetchMemberDetail(userId.value),
    contractStore.fetchContractsByUser(userId.value),
  ])
  profile.value = p
  openId.value = contractStore.contractsByUser[0]?.id ?? null
  loading.value = false
})

const fullName = computed(() => profile.value ? `${profile.value.first_name} ${profile.value.last_name}`.trim() : '…')
const empId = computed(() => profile.value?.employee_id || String(userId.value).padStart(4, '0'))

type BV = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'
const STATUS_META: Record<number, { labelKey: string; variant: BV }> = {
  1: { labelKey: 'hrm.contract.detail.status.active', variant: 'green' },
  2: { labelKey: 'hrm.contract.detail.status.probation', variant: 'amber' },
  3: { labelKey: 'hrm.contract.detail.status.resigned', variant: 'gray' },
}
const statusMeta = computed(() => STATUS_META[profile.value?.status ?? 0] ?? { labelKey: 'hrm.contract.detail.status.unknown', variant: 'gray' as BV })

function fmtDate(s: string | null | undefined): string {
  if (!s) return '—'
  const d = s.slice(0, 10)
  const parts = d.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d
}

function duration(c: ContractByUserRow): string {
  if (!c.contract_end_date) return t('hrm.contract.duration.unspecified')
  const start = new Date(c.contract_start_date ?? '')
  const end = new Date(c.contract_end_date)
  const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months >= 12 && months % 12 === 0) return t('hrm.contract.detail.durationYears', { n: months / 12 })
  if (months > 0) return t('hrm.contract.detail.durationMonths', { n: months })
  return t('hrm.contract.detail.durationDefined')
}

const CURRENCY_LABELS = ['VND', 'USD', 'JPY']
function fmtMoney(v: string | number | null | undefined, unit: string | number): string {
  if (v === null || v === undefined || v === '') return '—'
  const n = Number(v)
  const label = CURRENCY_LABELS[Number(unit)] ?? ''
  return (isNaN(n) ? String(v) : n.toLocaleString('vi-VN')) + (label ? ' ' + label : '')
}

function toggle(id: number) {
  openId.value = openId.value === id ? null : id
}

async function removeContract(id: number) {
  const res = await contractStore.deleteContract(id)
  show(res.message || (res.ok ? t('hrm.contract.toast.deleteSuccess') : t('hrm.contract.toast.deleteFail')))
  if (res.ok) contractStore.fetchContractsByUser(userId.value)
}

function openFile(url: string) {
  window.open(url, '_blank')
}

function renew() {
  router.push({ path: '/hrm/contract', query: { tab: 'create', renewUserId: userId.value, renewUserName: fullName.value } })
}
</script>

<template>
  <div class="space-y-5">
    <PageHeader :eyebrow="t('hrm.contract.pageEyebrow')" :title="t('hrm.contract.detail.pageTitle')" />

    <button class="flex items-center gap-2.5 group" @click="router.push('/hrm/contract')">
      <span class="h-8 w-8 rounded-full border border-border flex items-center justify-center text-foreground group-hover:bg-muted group-hover:-translate-x-0.5 transition-all">
        <ChevronRight :size="15" class="rotate-180" />
      </span>
      <span class="font-heading font-bold text-[16px] text-foreground">{{ t('hrm.contract.detail.backToList') }}</span>
    </button>

    <template v-if="loading">
      <div class="card-surface h-40 animate-pulse" />
      <div class="card-surface h-56 animate-pulse" />
    </template>

    <template v-else-if="profile">
      <!-- Info card -->
      <div class="card-surface overflow-hidden rise">
        <div class="flex flex-col md:flex-row">
          <div class="md:w-[220px] shrink-0 p-6 flex flex-col items-center text-center md:border-r border-b md:border-b-0 border-border/60">
            <Avatar :name="fullName" :size="84" />
            <p class="font-semibold text-[16px] text-foreground mt-3">{{ fullName }}</p>
            <p class="text-[12.5px] text-muted-foreground mt-0.5">{{ profile.job_title_name || profile.role_name || '—' }}</p>
            <p class="text-[12px] text-muted-foreground/70 mt-0.5">ID: {{ empId }}</p>
            <span
              class="mt-2.5 inline-flex items-center px-3 py-1 rounded-md text-[11.5px] font-medium text-white"
              style="background: linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 60%),hsl(var(--primary-h) var(--primary-s) 46%))"
            >{{ t(statusMeta.labelKey) }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 border-b border-border/60">
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.email') }}</p><p class="text-[13.5px] font-medium text-foreground">{{ profile.email || '—' }}</p></div>
              <div class="lg:col-span-2"><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.permanentResidence') }}</p><p class="text-[13.5px] font-medium text-foreground">{{ profile.permanent_residence || '—' }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.birthday') }}</p><p class="text-[13.5px] font-medium text-foreground">{{ fmtDate(profile.birthday) }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.phone') }}</p><p class="text-[13.5px] font-medium text-foreground">{{ profile.phone_number || '—' }}</p></div>
              <div class="md:col-span-2 lg:col-span-3"><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.currentAddress') }}</p><p class="text-[13.5px] font-medium text-foreground">{{ profile.current_address || '—' }}</p></div>
            </div>
            <div class="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-5 gap-y-5">
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.identity') }}</p><p class="text-[13.5px] font-medium text-foreground">{{ profile.identity_card || '—' }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.idType') }}</p><p class="text-[13.5px] font-medium text-foreground">{{ profile.id_type || '—' }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.idDate') }}</p><p class="text-[13.5px] font-medium text-foreground">{{ fmtDate(profile.date_of_identity_card) }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.taxCode') }}</p><p class="text-[13.5px] font-medium text-foreground">{{ profile.tax_code || '—' }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.branch') }}</p><p class="text-[13.5px] font-medium text-foreground">{{ profile.branch_name || '—' }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.joined') }}</p><p class="text-[13.5px] font-medium text-foreground">{{ fmtDate(profile.company_joined_date) }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.rank') }}</p><p class="text-[13.5px] font-medium text-foreground">{{ profile.rank_name || '—' }}</p></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contract accordions -->
      <div class="space-y-3">
        <div v-if="contractStore.contractsByUserLoading" class="text-[13px] text-muted-foreground text-center py-8">{{ t('hrm.contract.detail.loadingContracts') }}</div>
        <div v-else-if="contractStore.contractsByUser.length === 0" class="card-surface py-14 text-center text-muted-foreground">
          <FileText :size="34" class="mx-auto mb-2 opacity-30" />
          {{ t('hrm.contract.detail.emptyContracts') }}
        </div>
        <div v-for="c in contractStore.contractsByUser" :key="c.id" class="card-surface overflow-hidden">
          <button class="w-full flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors text-left" @click="toggle(c.id)">
            <span class="font-medium text-foreground text-[14px]">{{ c.contract_type_name }}</span>
            <ChevronDown :size="16" :class="['text-muted-foreground transition-transform duration-200 shrink-0', openId === c.id ? 'rotate-180' : '']" />
          </button>
          <div v-if="openId === c.id" class="px-5 pb-5 pt-1 border-t border-border/50 rise" style="animation-duration:.2s">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 mt-4">
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.contractNo') }}</p><p class="text-[13.5px] font-medium" style="color:hsl(var(--primary-h) 55% 38%)">{{ c.labor_contract_number || '—' }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.durationLabel') }}</p><p class="text-[13.5px] font-medium" style="color:hsl(var(--primary-h) 55% 38%)">{{ duration(c) }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.effectiveFrom') }}</p><p class="text-[13.5px] font-medium" style="color:hsl(var(--primary-h) 55% 38%)">{{ fmtDate(c.contract_start_date) }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.expiryDate') }}</p><p class="text-[13.5px] font-medium" style="color:hsl(var(--primary-h) 55% 38%)">{{ c.contract_end_date ? fmtDate(c.contract_end_date) : t('hrm.contract.detail.undetermined') }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.position') }}</p><p class="text-[13.5px] font-medium" style="color:hsl(var(--primary-h) 55% 38%)">{{ profile.job_position || '—' }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.workplace') }}</p><p class="text-[13.5px] font-medium" style="color:hsl(var(--primary-h) 55% 38%)">{{ profile.work_place || '—' }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.insuranceSalary') }}</p><p class="text-[13.5px] font-medium" style="color:hsl(var(--primary-h) 55% 38%)">{{ fmtMoney(c.insurance_salary, c.currency_unit) }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.subsidies') }}</p><p class="text-[13.5px] font-medium" style="color:hsl(var(--primary-h) 55% 38%)">{{ fmtMoney(c.subsidies_salary, c.currency_unit) }}</p></div>
              <div><p class="text-[11px] text-muted-foreground mb-1">{{ t('hrm.contract.detail.totalSalary') }}</p><p class="text-[13.5px] font-medium" style="color:hsl(var(--primary-h) 55% 38%)">{{ fmtMoney(c.total_salary, c.currency_unit) }}</p></div>
            </div>
            <div class="flex items-center gap-2 mt-5 pt-4 border-t border-border/50">
              <Btn v-if="c.file_path" variant="outline" size="xs" @click="openFile(c.file_path)"><FileText :size="12" /> {{ t('hrm.contract.detail.downloadFile') }}</Btn>
              <Btn variant="primary" size="xs" @click="renew"><FileText :size="12" /> {{ t('hrm.contract.detail.renew') }}</Btn>
              <div class="flex-1" />
              <button class="text-red-500 hover:text-red-600 transition-colors" :title="t('hrm.contract.detail.deleteTitle')" @click="removeContract(c.id)"><Trash2 :size="14" /></button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="card-surface py-16 text-center text-muted-foreground">
      {{ t('hrm.contract.detail.notFound') }}
    </div>
  </div>
</template>
