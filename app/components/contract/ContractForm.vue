<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Send, Search, Upload, X } from 'lucide-vue-next'
import Btn from '~/components/base/Button.vue'
import Select from '~/components/base/Select.vue'
import DatePicker from '~/components/base/DatePicker.vue'
import Avatar from '~/components/base/Avatar.vue'
import { CONTRACT_DURATIONS, CURRENCY_UNITS } from '~/mocks/contract'
import type { MemberDetail } from '~/types'
import { useContractStore } from '~/stores/contract'
import { useMemberStore } from '~/stores/member'

const props = defineProps<{
  prefillUserId?: number | null
  prefillUserName?: string | null
}>()

const emit = defineEmits<{ submit: []; cancel: [] }>()

const { t } = useI18n()
const contractStore = useContractStore()
const memberStore = useMemberStore()

const f = ref({
  userId: 0,
  contractTypeId: 0,
  laborContractNumber: '',
  contractCreationDate: '',
  insuranceSalary: '',
  subsidiesSalary: '',
  totalSalary: '',
  currencyUnit: 0,
  duration: '',
  contractStartDate: '',
  contractEndDate: '',
})
const errors = ref<Record<string, boolean>>({})

// Optional signed-contract file attach — no server-side template merge exists
// (preview-contract/create-contract are plain-file-upload endpoints), so this
// is for attaching an already-prepared document rather than auto-generating one.
const attachedFile = ref<File | null>(null)
function onFileChange(e: Event) {
  attachedFile.value = (e.target as HTMLInputElement).files?.[0] ?? null
}
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const employeeQuery = ref('')
const employeeName = ref('')
const profile = ref<MemberDetail | null>(null)
const showResults = ref(false)

watch(employeeQuery, (q) => {
  showResults.value = true
  if (q.trim().length > 0) memberStore.fetchMembers({ name: q })
})

const employeeResults = computed(() => memberStore.members)

async function pickEmployee(id: number, name: string) {
  f.value.userId = id
  employeeName.value = name
  employeeQuery.value = ''
  showResults.value = false
  errors.value.userId = false
  profile.value = await memberStore.fetchMemberDetail(id)
}

if (props.prefillUserId) {
  f.value.userId = props.prefillUserId
  employeeName.value = props.prefillUserName ?? ''
  memberStore.fetchMemberDetail(props.prefillUserId).then((p) => { profile.value = p })
}

const contractTypeOpts = computed(() => contractStore.contractTypes.map(ct => ({ value: ct.contract_type_id, label: ct.name })))
const currencyOpts = CURRENCY_UNITS.map((c, i) => ({ value: i, label: c }))
const durationOpts = computed(() => CONTRACT_DURATIONS.map(d => ({ value: d.value, label: t(d.labelKey) })))

function validate() {
  errors.value = {}
  if (!f.value.userId) errors.value.userId = true
  if (!f.value.contractTypeId) errors.value.contractTypeId = true
  if (!f.value.laborContractNumber) errors.value.laborContractNumber = true
  if (!f.value.contractCreationDate) errors.value.contractCreationDate = true
  if (!f.value.contractStartDate) errors.value.contractStartDate = true
  return Object.keys(errors.value).length === 0
}

const submitting = ref(false)
async function submit() {
  if (!validate()) return
  submitting.value = true
  const fileContent = attachedFile.value ? await fileToBase64(attachedFile.value) : undefined
  const res = await contractStore.createContract({
    user_id: f.value.userId,
    contract_type_id: f.value.contractTypeId,
    contract_start_date: f.value.contractStartDate,
    contract_end_date: f.value.contractEndDate || undefined,
    insurance_salary: f.value.insuranceSalary ? Number(f.value.insuranceSalary) : undefined,
    subsidies_salary: f.value.subsidiesSalary ? Number(f.value.subsidiesSalary) : undefined,
    total_salary: f.value.totalSalary || undefined,
    currency_unit: f.value.currencyUnit,
    labor_contract_number: f.value.laborContractNumber,
    contract_creation_date: f.value.contractCreationDate,
    file_content: fileContent,
    file_name: attachedFile.value?.name,
  })
  submitting.value = false
  if (res.ok) emit('submit')
}

const dField = 'w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-[13px] text-foreground/80 flex items-center truncate'
</script>

<template>
  <div class="card-surface p-6 rise">
    <h3 class="font-heading font-bold text-[17px] text-foreground mb-6">{{ t('hrm.contract.create.title') }}</h3>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
      <!-- ───── Left column: employee ───── -->
      <div class="space-y-5">
        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.contractTypeLabel') }} <span class="text-red-400">*</span></label>
          <Select
            v-model="f.contractTypeId"
            :options="contractTypeOpts"
            :placeholder="t('hrm.contract.create.contractTypePh')"
            :class="errors.contractTypeId ? 'ring-1 ring-red-400 rounded-md' : ''"
            style="width: 100%"
          />
        </div>

        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.employeeLabel') }} <span class="text-red-400">*</span></label>
          <div class="relative">
            <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              v-model="employeeQuery"
              :placeholder="employeeName || t('hrm.contract.create.employeeSearchPh')"
              :class="['w-full h-9 pl-8 pr-3 rounded-lg border bg-card text-[13px] text-foreground outline-none placeholder:text-muted-foreground/45', errors.userId ? 'border-red-400' : 'border-border focus:border-primary/60']"
              @focus="showResults = true"
            >
            <div v-if="showResults && employeeQuery" class="absolute z-20 left-0 right-0 mt-1 card-surface border border-border shadow-popover rounded-xl overflow-hidden max-h-52 overflow-y-auto scrollbar-thin">
              <p v-if="employeeResults.length === 0" class="px-3 py-2.5 text-[12.5px] text-muted-foreground">{{ t('hrm.contract.create.employeeNotFound') }}</p>
              <button
                v-for="m in employeeResults" :key="m.id" type="button"
                class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/40 transition-colors text-left"
                @click="pickEmployee(m.id, m.name)"
              >
                <Avatar :name="m.name" :size="24" /><span class="text-[13px] text-foreground">{{ m.name }}</span>
              </button>
            </div>
          </div>
          <p v-if="employeeName" class="mt-1.5 text-[12px] text-foreground/70">{{ t('hrm.contract.create.employeeSelected') }} <span class="font-medium text-foreground">{{ employeeName }}</span></p>
        </div>

        <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.phoneLabel') }}</label><div :class="dField">{{ profile?.phone_number || '—' }}</div></div>
        <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.birthdayLabel') }}</label><div :class="dField">{{ profile ? (profile.birthday || '—') : '—' }}</div></div>
        <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.nationalityLabel') }}</label><div :class="dField">{{ profile?.country || '—' }}</div></div>
        <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.positionLabel') }}</label><div :class="dField">{{ profile?.job_position || '—' }}</div></div>
        <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.addressLabel') }}</label><div :class="dField">{{ profile?.current_address || '—' }}</div></div>
        <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.permanentLabel') }}</label><div :class="dField">{{ profile?.permanent_residence || '—' }}</div></div>
        <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.originLabel') }}</label><div :class="dField">{{ profile?.user_birth_place || '—' }}</div></div>
        <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.taxCodeLabel') }}</label><div :class="dField">{{ profile?.tax_code || '—' }}</div></div>
      </div>

      <!-- ───── Right column: contract ───── -->
      <div class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.identityLabel') }}</label><div :class="dField">{{ profile?.identity_card || '—' }}</div></div>
          <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.idDateLabel') }}</label><div :class="dField">{{ profile?.date_of_identity_card || '—' }}</div></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.idPlaceLabel') }}</label><div :class="dField">{{ profile?.place_of_issue || '—' }}</div></div>
          <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.departmentLabel') }}</label><div :class="dField">{{ profile?.department || '—' }}</div></div>
        </div>
        <div><label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.workplaceLabel') }}</label><div :class="dField">{{ profile?.work_place || '—' }}</div></div>

        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.contractNoLabel') }} <span class="text-red-400">*</span></label>
          <input
            v-model="f.laborContractNumber"
            :class="['w-full h-9 px-3 rounded-lg border bg-card text-[13px] text-foreground outline-none focus:border-primary/60', errors.laborContractNumber ? 'border-red-400' : 'border-border']"
          >
        </div>

        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.creationDateLabel') }} <span class="text-red-400">*</span></label>
          <DatePicker v-model="f.contractCreationDate" :error="errors.contractCreationDate" width="100%" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.insuranceSalaryLabel') }}</label>
            <input v-model="f.insuranceSalary" type="text" inputmode="numeric" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground font-mono outline-none focus:border-primary/60">
          </div>
          <div>
            <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.currencyUnitLabel') }}</label>
            <Select v-model="f.currencyUnit" :options="currencyOpts" style="width: 100%" />
          </div>
        </div>

        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.subsidiesLabel') }}</label>
          <input v-model="f.subsidiesSalary" type="text" inputmode="numeric" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground font-mono outline-none focus:border-primary/60">
        </div>

        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.totalSalaryLabel') }}</label>
          <input v-model="f.totalSalary" type="text" inputmode="numeric" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground font-mono outline-none focus:border-primary/60">
        </div>

        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.durationLabel') }}</label>
          <Select v-model="f.duration" :options="durationOpts" :placeholder="t('hrm.contract.create.durationPh')" style="width: 100%" />
        </div>

        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.startDateLabel') }} <span class="text-red-400">*</span></label>
          <DatePicker v-model="f.contractStartDate" :error="errors.contractStartDate" width="100%" />
        </div>
        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.endDateLabel') }}</label>
          <DatePicker v-model="f.contractEndDate" width="100%" />
        </div>

        <div>
          <label class="block text-[12px] font-medium text-foreground/80 mb-1.5">{{ t('hrm.contract.create.fileLabel') }}</label>
          <label class="w-full h-9 px-3 rounded-lg border border-dashed border-border bg-muted/20 text-[12.5px] text-muted-foreground flex items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
            <Upload :size="13" class="shrink-0" />
            <span class="truncate">{{ attachedFile?.name || t('hrm.contract.create.filePh') }}</span>
            <input type="file" class="hidden" accept=".pdf,.doc,.docx" @change="onFileChange">
          </label>
          <button v-if="attachedFile" type="button" class="mt-1 text-[11.5px] text-red-500 hover:underline inline-flex items-center gap-1" @click="attachedFile = null">
            <X :size="10" /> {{ t('hrm.contract.create.fileRemove') }}
          </button>
        </div>
      </div>
    </div>

    <div class="pt-5 mt-2 border-t border-border/60 flex items-center justify-end gap-2">
      <Btn variant="outline" @click="emit('cancel')">{{ t('hrm.contract.create.cancel') }}</Btn>
      <Btn variant="primary" :disabled="submitting" @click="submit"><Send :size="13" /> {{ t('hrm.contract.create.submit') }}</Btn>
    </div>
  </div>
</template>
