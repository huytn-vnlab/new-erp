<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { X } from 'lucide-vue-next'
import Btn from '~/components/base/Button.vue'
import Select from '~/components/base/Select.vue'
import DatePicker from '~/components/base/DatePicker.vue'
import TimePicker from '~/components/base/TimePicker.vue'
import type { MemberDetail, BranchItem, JobTitleItem } from '~/types'
import { toDbDate } from '~/utils/date'

const props = defineProps<{
  open: boolean
  detail: MemberDetail
  branches: BranchItem[]
  jobTitles: JobTitleItem[]
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  saved: []
}>()

const saving = ref(false)

const form = reactive({
  first_name: '',
  last_name: '',
  role_id: 0,
  employee_id: '',
  branch: 0,
  birthday: '',
  company_joined_date: '',
  department: '',
  job_title: 0,
  job_position: '',
  work_place: '',
  personal_email: '',
  phone_number: '',
  identity_card: '',
  date_of_identity_card: '',
  tax_code: '',
  permanent_residence: '',
  current_address: '',
  name_of_emergency: '',
  relationships_of_emergency: '',
  address_of_emergency: '',
})

// Per-employee work-hour override. Empty strings on the underlying model mean
// "no override, use the org default" — the toggle just controls whether the
// TimePicker fields are shown/edited; unchecking clears them back to "".
const customWorkHours = ref(false)
const workHoursForm = reactive({
  work_start_time: '',
  lunch_break_start_time: '',
  lunch_break_end_time: '',
  work_end_time: '',
})

watch(() => props.open, (v) => {
  if (!v) return
  const d = props.detail
  form.first_name = d.first_name
  form.last_name = d.last_name
  form.role_id = d.role_id
  form.employee_id = d.employee_id ?? ''
  form.branch = d.branch
  // Incoming values are "YYYY/MM/DD" (cf.FormatDateDisplay) — DatePicker's
  // v-model needs "YYYY-MM-DD", the same format the backend expects on save.
  form.birthday = toDbDate(d.birthday)
  form.company_joined_date = toDbDate(d.company_joined_date)
  form.department = d.department ?? ''
  form.job_title = d.job_title
  form.job_position = d.job_position ?? ''
  form.work_place = d.work_place ?? ''
  form.personal_email = d.personal_email ?? ''
  form.phone_number = d.phone_number ?? ''
  form.identity_card = d.identity_card ?? ''
  form.date_of_identity_card = toDbDate(d.date_of_identity_card)
  form.tax_code = d.tax_code ?? ''
  form.permanent_residence = d.permanent_residence ?? ''
  form.current_address = d.current_address ?? ''
  form.name_of_emergency = d.name_of_emergency ?? ''
  form.relationships_of_emergency = d.relationships_of_emergency ?? ''
  form.address_of_emergency = d.address_of_emergency ?? ''

  customWorkHours.value = !!d.work_start_time
  workHoursForm.work_start_time = d.work_start_time || d.effective_work_start_time
  workHoursForm.lunch_break_start_time = d.lunch_break_start_time || d.effective_lunch_break_start_time
  workHoursForm.lunch_break_end_time = d.lunch_break_end_time || d.effective_lunch_break_end_time
  workHoursForm.work_end_time = d.work_end_time || d.effective_work_end_time
}, { immediate: true })

const store = useMemberStore()
const { show } = useToast()
const { t } = useI18n()

const formError = ref('')

async function save() {
  if (!form.first_name.trim() || !form.last_name.trim() || !form.phone_number.trim() || !form.birthday || !form.company_joined_date || !form.employee_id.trim()) {
    formError.value = t('hrm.member.adminPage.drawer.requiredError')
    return
  }
  formError.value = ''
  saving.value = true
  // flag_edit_basic_profile gates every Set() call server-side (SaveProfile in
  // pgrepository.go) — without it this whole request is a silent no-op UPDATE.
  const result = await store.updateMemberDetail({
    user_id: props.detail.user_id,
    ...form,
    flag_edit_basic_profile: true,
    flag_edit_work_hours: true,
    work_start_time: customWorkHours.value ? workHoursForm.work_start_time : '',
    lunch_break_start_time: customWorkHours.value ? workHoursForm.lunch_break_start_time : '',
    lunch_break_end_time: customWorkHours.value ? workHoursForm.lunch_break_end_time : '',
    work_end_time: customWorkHours.value ? workHoursForm.work_end_time : '',
  })
  saving.value = false
  if (result.ok) {
    show(t('hrm.member.adminPage.drawer.saveSuccess'))
    emit('saved')
    emit('update:open', false)
  } else {
    show(result.message || t('hrm.member.adminPage.toast.saveFail'))
  }
}

const branchOptions = computed(() => props.branches.map(b => ({ value: b.id, label: b.name })))
const jobTitleOptions = computed(() => props.jobTitles.map(j => ({ value: j.id, label: j.name })))
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="emit('update:open', false)" />

        <div class="relative bg-background border-l border-border w-full max-w-2xl h-full flex flex-col rise" style="animation-duration:.3s">

          <!-- Header -->
          <div class="px-6 py-4 border-b border-border shrink-0 flex items-center justify-between">
            <div>
              <h3 class="font-heading font-bold text-[16px] text-foreground">{{ t('hrm.member.adminPage.drawer.title') }}</h3>
              <p class="text-[12px] text-muted-foreground mt-0.5">{{ detail.first_name }} {{ detail.last_name }}</p>
            </div>
            <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="emit('update:open', false)">
              <X :size="15" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto overscroll-contain scrollbar-thin px-6 py-5 space-y-7">

            <!-- General info -->
            <section>
              <p class="text-[11px] uppercase tracking-[0.12em] font-bold text-muted-foreground/70 mb-3 pb-2 border-b border-border/60">{{ t('hrm.member.adminPage.drawer.generalInfo') }}</p>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.drawer.lastName') }} <span class="text-red-400">*</span></label>
                  <input v-model="form.first_name" class="field-input" :placeholder="t('hrm.member.adminPage.drawer.lastNamePh')" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.drawer.firstName') }} <span class="text-red-400">*</span></label>
                  <input v-model="form.last_name" class="field-input" :placeholder="t('hrm.member.adminPage.drawer.firstNamePh')" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.drawer.employeeId') }} <span class="text-red-400">*</span></label>
                  <input v-model="form.employee_id" class="field-input font-mono" placeholder="EMP-0001" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.drawer.branch') }}</label>
                  <Select v-model="form.branch" :options="branchOptions" :width="'100%'" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.birthday') }} <span class="text-red-400">*</span></label>
                  <DatePicker v-model="form.birthday" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.drawer.joinedDate') }} <span class="text-red-400">*</span></label>
                  <DatePicker v-model="form.company_joined_date" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.department') }}</label>
                  <input v-model="form.department" class="field-input" placeholder="System Development" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.jobTitle') }}</label>
                  <Select v-model="form.job_title" :options="jobTitleOptions" :width="'100%'" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.jobPosition') }}</label>
                  <input v-model="form.job_position" class="field-input" placeholder="Tech Lead" />
                </div>
                <div class="col-span-2 space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.workPlace') }}</label>
                  <input v-model="form.work_place" class="field-input" placeholder="Floor 7, 123 Cau Giay, Hanoi" />
                </div>
              </div>
            </section>

            <!-- Personal info -->
            <section>
              <p class="text-[11px] uppercase tracking-[0.12em] font-bold text-muted-foreground/70 mb-3 pb-2 border-b border-border/60">{{ t('hrm.member.adminPage.overview.personalInfo') }}</p>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.emailPersonal') }}</label>
                  <input v-model="form.personal_email" type="email" class="field-input" placeholder="email@gmail.com" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.phone') }}</label>
                  <input v-model="form.phone_number" class="field-input" placeholder="0912 345 678" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.identityCard') }}</label>
                  <input v-model="form.identity_card" class="field-input font-mono" placeholder="038094001234" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.identityDate') }}</label>
                  <DatePicker v-model="form.date_of_identity_card" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.taxCode') }}</label>
                  <input v-model="form.tax_code" class="field-input font-mono" placeholder="8734561290" />
                </div>
                <div class="col-span-2 space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.permanentResidence') }}</label>
                  <input v-model="form.permanent_residence" class="field-input" placeholder="45 Ngo 12 Doi Can, Ba Dinh, Hanoi" />
                </div>
                <div class="col-span-2 space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.currentAddress') }}</label>
                  <input v-model="form.current_address" class="field-input" placeholder="123 Tran Duy Hung, Cau Giay, Hanoi" />
                </div>
              </div>
            </section>

            <!-- Emergency contact -->
            <section>
              <p class="text-[11px] uppercase tracking-[0.12em] font-bold text-muted-foreground/70 mb-3 pb-2 border-b border-border/60">{{ t('hrm.member.adminPage.overview.emergency') }}</p>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.drawer.emergencyContactName') }}</label>
                  <input v-model="form.name_of_emergency" class="field-input" :placeholder="t('hrm.member.adminPage.drawer.emergencyContactNamePh')" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.emergencyRelation') }}</label>
                  <input v-model="form.relationships_of_emergency" class="field-input" :placeholder="t('hrm.member.adminPage.drawer.emergencyRelationPh')" />
                </div>
                <div class="col-span-2 space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.overview.emergencyAddress') }}</label>
                  <input v-model="form.address_of_emergency" class="field-input" :placeholder="t('hrm.member.adminPage.drawer.emergencyAddressPh')" />
                </div>
              </div>
            </section>

            <!-- Work hours override -->
            <section>
              <div class="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
                <p class="text-[11px] uppercase tracking-[0.12em] font-bold text-muted-foreground/70">{{ t('hrm.member.adminPage.drawer.workHours') }}</p>
                <label class="flex items-center gap-1.5 text-[12px] text-muted-foreground cursor-pointer">
                  <input v-model="customWorkHours" type="checkbox" class="rounded" />
                  {{ t('hrm.member.adminPage.drawer.workHoursCustom') }}
                </label>
              </div>
              <div v-if="customWorkHours" class="space-y-4">
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.drawer.workStart') }}</label>
                  <TimePicker v-model="workHoursForm.work_start_time" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.drawer.lunchStart') }}</label>
                    <TimePicker v-model="workHoursForm.lunch_break_start_time" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.drawer.lunchEnd') }}</label>
                    <TimePicker v-model="workHoursForm.lunch_break_end_time" />
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{{ t('hrm.member.adminPage.drawer.workEnd') }}</label>
                  <TimePicker v-model="workHoursForm.work_end_time" />
                </div>
              </div>
              <p v-else class="text-[12px] text-muted-foreground">{{ t('hrm.member.adminPage.drawer.workHoursDefault') }}</p>
            </section>

          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-border/70 bg-muted/20 shrink-0">
            <p v-if="formError" class="text-[12.5px] text-red-500">{{ formError }}</p>
            <div v-else />
            <div class="flex items-center gap-2 shrink-0">
            <Btn variant="ghost" size="sm" @click="emit('update:open', false)">{{ t('hrm.member.adminPage.form.cancel') }}</Btn>
            <Btn variant="primary" size="sm" :disabled="saving" @click="save">
              <span v-if="saving" class="flex items-center gap-2">
                <span class="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {{ t('hrm.member.adminPage.form.saving') }}
              </span>
              <span v-else>{{ t('hrm.member.adminPage.drawer.confirm') }}</span>
            </Btn>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.field-input {
  width: 100%;
  height: 2.25rem;
  padding: 0 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--card));
  font-size: 13px;
  color: hsl(var(--foreground));
  outline: none;
}
.field-input:focus {
  border-color: hsl(var(--primary) / 0.6);
}
.field-input::placeholder {
  color: hsl(var(--muted-foreground) / 0.4);
}
</style>
