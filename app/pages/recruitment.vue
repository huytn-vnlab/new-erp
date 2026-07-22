<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { FileText, Plus, X, UserPlus, Briefcase, Search, History } from 'lucide-vue-next'
import PageHeader from '~/components/layout/PageHeader.vue'
import Btn from '~/components/base/Button.vue'
import MiniStat from '~/components/base/MiniStat.vue'
import Badge from '~/components/base/Badge.vue'
import Avatar from '~/components/base/Avatar.vue'
import Select from '~/components/base/Select.vue'
import FilterBar from '~/components/base/FilterBar.vue'
import FieldInput from '~/components/base/FieldInput.vue'
import DatePicker from '~/components/base/DatePicker.vue'
import SkeletonRow from '~/components/base/SkeletonRow.vue'
import EmptyState from '~/components/base/EmptyState.vue'
import ErrorBanner from '~/components/base/ErrorBanner.vue'
import Modal from '~/components/base/Modal.vue'
import Pagination from '~/components/base/Pagination.vue'
import { useRecruitmentStore } from '~/stores/recruitment'
import type { CvRow, CvStatusLog, DetailedJob, JobDetail, JobRow } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const auth = useAuth()
const recruitStore = useRecruitmentStore()
const { show } = useToast()

const roleName = computed(() => auth.user.value?.role_name?.toLowerCase() ?? '')
const isManagerOrGM = computed(() => roleName.value === 'manager' || roleName.value === 'general manager')

type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

const todayStr = new Date().toISOString().slice(0, 10)
// No stored job status on the backend — active/done is purely derived from
// expiry_date vs today (matches cf.JOBACTIVE/JOBDONE's own filter semantics).
function isJobActive(expiryDate: string): boolean {
  return expiryDate >= todayStr
}
function jobStatusMeta(expiryDate: string): { label: string; variant: BadgeVariant } {
  return isJobActive(expiryDate) ? { label: 'Đang tuyển', variant: 'green' } : { label: 'Đã đóng', variant: 'gray' }
}

// ── Option maps the backend has no enum/dropdown for — these are this app's
// own convention (see recruitment.vue completion notes); Role/TypeOfWork/
// SalaryType have zero prior meaning anywhere in the codebase to conflict with. ──
const ROLE_OPTS = [
  { value: '1', label: 'Nhân viên' },
  { value: '2', label: 'Trưởng nhóm' },
  { value: '3', label: 'Quản lý' },
  { value: '4', label: 'Giám đốc' },
]
const TYPE_OF_WORK_OPTS = [
  { value: '1', label: 'Toàn thời gian' },
  { value: '2', label: 'Bán thời gian' },
  { value: '3', label: 'Cộng tác viên (CTV)' },
  { value: '4', label: 'Thực tập' },
]
const SALARY_TYPE_OPTS = [
  { value: '1', label: 'Gross' },
  { value: '2', label: 'Net' },
]
// House convention reused from configs/user.go's GenderExcel (1=Nam/2=Nữ).
const GENDER_OPTS = [
  { value: '0', label: 'Không yêu cầu' },
  { value: '1', label: 'Nam' },
  { value: '2', label: 'Nữ' },
]
const INTERVIEW_METHOD_OPTS = [
  { value: '1', label: 'Online' },
  { value: '2', label: 'Offline' },
]
// media_id source — matches old app's convention (fixed 1-7 list + 8="Khác").
const MEDIA_OPTS: { value: string; label: string }[] = [
  { value: '1', label: 'TopCV' },
  { value: '2', label: 'Vietnamworks' },
  { value: '3', label: 'LinkedIn' },
  { value: '4', label: 'Facebook' },
  { value: '5', label: 'ITviec' },
  { value: '6', label: 'JobNow' },
  { value: '7', label: 'CareerBuilder' },
  { value: '8', label: 'Khác' },
]
function mediaLabel(id: number, other: string): string {
  if (id === 8) return other || 'Khác'
  return MEDIA_OPTS.find(m => m.value === String(id))?.label ?? '—'
}

// cf.CVPENDING..CVINTERVIEW (configs/recruitment.go) — the 6 canonical values
// this backend currently defines (the old SPA's frontend had a stale/larger
// list from an earlier backend version; this app follows the live API).
const CV_STATUS_META: Record<number, { label: string; variant: BadgeVariant }> = {
  1: { label: 'Đang chờ xét duyệt', variant: 'gray' },
  2: { label: 'Đạt vòng 1', variant: 'sky' },
  3: { label: 'Trúng tuyển', variant: 'green' },
  4: { label: 'Từ chối', variant: 'red' },
  5: { label: 'Không đạt', variant: 'amber' },
  6: { label: 'Hẹn phỏng vấn', variant: 'violet' },
}
const CV_STATUS_OPTS = [
  { value: '0', label: 'Tất cả trạng thái' },
  ...Object.entries(CV_STATUS_META).map(([k, v]) => ({ value: k, label: v.label })),
]
function cvStatusMeta(status: number) {
  return CV_STATUS_META[status] ?? { label: '—', variant: 'gray' as BadgeVariant }
}

function branchName(id: number): string { return recruitStore.branches[String(id)] ?? `#${id}` }
function userName(id: number): string { return recruitStore.users[String(id)] ?? `#${id}` }

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── List state ──
const search = ref('')
const statusF = ref('0') // 0=all, 1=active, 2=done — matches cf.JOBACTIVE/JOBDONE
const branchF = ref('0')

const branchOpts = computed(() => [
  { value: '0', label: 'Tất cả chi nhánh' },
  ...Object.entries(recruitStore.branches).map(([id, name]) => ({ value: id, label: name })),
])
const statusOpts = [
  { value: '0', label: 'Tất cả trạng thái' },
  { value: '1', label: 'Đang tuyển' },
  { value: '2', label: 'Đã đóng' },
]

function fetchList(page = 1) {
  return recruitStore.fetchJobs({
    keyword: search.value.trim() || undefined,
    status: statusF.value === '0' ? undefined : Number(statusF.value),
    branch_id: branchF.value === '0' ? undefined : Number(branchF.value),
    current_page: page,
  })
}

onMounted(async () => {
  await fetchList(1)
})

watch([statusF, branchF], () => fetchList(1))
watchDebounced(search, () => fetchList(1), { debounce: 300 })

// Org-wide totals and per-job applicant counts come bundled with every
// get-jobs response now (computed server-side) — no separate fetch needed.
const stats = computed(() => ({
  total: recruitStore.stats.total,
  active: recruitStore.stats.active,
  closed: recruitStore.stats.done,
  totalCvs: recruitStore.stats.total_cvs,
}))

// ── Job detail drawer ──
const openJobId = ref<number | null>(null)
const detailLoading = ref(false)
const detailJob = ref<JobDetail | null>(null)
const detailDetailJob = ref<DetailedJob | null>(null)

async function openDetail(row: JobRow) {
  openJobId.value = row.id
  detailLoading.value = true
  detailJob.value = null
  detailDetailJob.value = null
  const [job, detail] = await Promise.all([
    recruitStore.getJob(row.id),
    recruitStore.getDetailJob(row.id),
  ])
  detailLoading.value = false
  if (!job) {
    show('Không thể xem chi tiết tin tuyển dụng này.', 'error')
    openJobId.value = null
    return
  }
  detailJob.value = job
  detailDetailJob.value = detail
  cvSearch.value = ''
  cvStatusF.value = '0'
  await fetchCvsForOpenJob(1)
}
function closeDetail() {
  openJobId.value = null
  detailJob.value = null
  detailDetailJob.value = null
}

// ── CVs inside the detail drawer ──
const cvSearch = ref('')
const cvStatusF = ref('0')
function fetchCvsForOpenJob(page = 1) {
  if (openJobId.value == null) return
  return recruitStore.fetchCvs({
    recruitment_id: openJobId.value,
    keyword: cvSearch.value.trim() || undefined,
    status: cvStatusF.value === '0' ? undefined : Number(cvStatusF.value),
    current_page: page,
  })
}
watch(cvStatusF, () => fetchCvsForOpenJob(1))
watchDebounced(cvSearch, () => fetchCvsForOpenJob(1), { debounce: 300 })

// ── Create / Edit Job modal ──
const modalOpen = ref(false)
const modalLoading = ref(false)
const modalSaving = ref(false)
const modalEditingId = ref<number | null>(null)
const modalExistingDetailJobId = ref<number | null>(null)
const form = reactive({ name: '', startDate: '', endDate: '', branchIds: [] as number[], assigneeIds: [] as number[] })
const formErrors = reactive({ name: '', startDate: '', endDate: '', branchIds: '', assigneeIds: '' })
const detailForm = reactive({
  amount: '', place: '', address: '', role: '1', gender: '0', typeOfWork: '1', experience: '',
  salaryType: '1', salaryFrom: '', salaryTo: '', profileRecipients: '', email: '', phoneNumber: '', description: '',
})
const detailFormError = ref('')
const assigneeSearch = ref('')
const assigneeResults = computed(() => {
  const q = assigneeSearch.value.trim().toLowerCase()
  const selected = new Set(form.assigneeIds)
  return Object.entries(recruitStore.users)
    .filter(([id, name]) => !selected.has(Number(id)) && (!q || name.toLowerCase().includes(q)))
    .map(([id, name]) => ({ id: Number(id), name }))
})
function addAssignee(id: number) { form.assigneeIds.push(id); assigneeSearch.value = '' }
function removeAssignee(id: number) { form.assigneeIds = form.assigneeIds.filter(x => x !== id) }
function toggleBranch(id: number) {
  form.branchIds = form.branchIds.includes(id) ? form.branchIds.filter(x => x !== id) : [...form.branchIds, id]
}

function resetDetailForm() {
  detailForm.amount = ''; detailForm.place = ''; detailForm.address = ''
  detailForm.role = '1'; detailForm.gender = '0'; detailForm.typeOfWork = '1'; detailForm.experience = ''
  detailForm.salaryType = '1'; detailForm.salaryFrom = ''; detailForm.salaryTo = ''
  detailForm.profileRecipients = ''; detailForm.email = ''; detailForm.phoneNumber = ''; detailForm.description = ''
}
// A detail-job section only gets submitted if the user actually filled
// something in — an all-blank section shouldn't create an empty sub-record.
function detailFormTouched(): boolean {
  return !!(detailForm.amount || detailForm.place || detailForm.address || detailForm.experience
    || detailForm.salaryFrom || detailForm.salaryTo || detailForm.profileRecipients
    || detailForm.email || detailForm.phoneNumber || detailForm.description)
}
// Once touched, the backend's CreateDetailJobParam requires amount/place/
// address/experience non-empty (govalidator `required`) — check this
// upfront so a typo'd/partial detail section doesn't silently 400 after the
// job itself has already been created.
function detailFormValid(): boolean {
  return !!(detailForm.amount && detailForm.place.trim() && detailForm.address.trim() && detailForm.experience)
}
function buildDetailPayload() {
  return {
    amount: Number(detailForm.amount) || 0,
    place: detailForm.place.split(',').map(s => s.trim()).filter(Boolean),
    address: detailForm.address.split(',').map(s => s.trim()).filter(Boolean),
    role: Number(detailForm.role) || 1,
    gender: Number(detailForm.gender) || 0,
    type_of_work: Number(detailForm.typeOfWork) || 1,
    experience: Number(detailForm.experience) || 0,
    salary_type: Number(detailForm.salaryType) || 1,
    salary_from: Number(detailForm.salaryFrom) || 0,
    salary_to: Number(detailForm.salaryTo) || 0,
    profile_recipients: detailForm.profileRecipients,
    email: detailForm.email,
    phone_number: detailForm.phoneNumber,
    description: detailForm.description,
  }
}

function openCreateModal() {
  modalEditingId.value = null
  modalExistingDetailJobId.value = null
  form.name = ''; form.startDate = todayStr; form.endDate = ''
  form.branchIds = []; form.assigneeIds = auth.user.value?.id ? [auth.user.value.id] : []
  formErrors.name = ''; formErrors.startDate = ''; formErrors.endDate = ''; formErrors.branchIds = ''; formErrors.assigneeIds = ''
  detailFormError.value = ''
  assigneeSearch.value = ''
  resetDetailForm()
  modalOpen.value = true
}

async function openEditModal(row: JobRow) {
  closeDetail()
  modalEditingId.value = row.id
  formErrors.name = ''; formErrors.startDate = ''; formErrors.endDate = ''; formErrors.branchIds = ''; formErrors.assigneeIds = ''
  detailFormError.value = ''
  assigneeSearch.value = ''
  modalOpen.value = true
  modalLoading.value = true
  const [job, detail] = await Promise.all([
    recruitStore.getJob(row.id),
    recruitStore.getDetailJob(row.id),
  ])
  modalLoading.value = false
  form.name = job?.job_name ?? row.job_name
  form.startDate = job?.start_date ?? row.start_date
  form.endDate = job?.expiry_date ?? row.expiry_date
  form.branchIds = job?.branch_ids ?? row.branch_ids
  form.assigneeIds = job?.assignees ?? row.assignees
  resetDetailForm()
  if (detail) {
    modalExistingDetailJobId.value = detail.id
    detailForm.amount = String(detail.amount || '')
    detailForm.place = detail.place.join(', ')
    detailForm.address = detail.address.join(', ')
    detailForm.role = String(detail.role || 1)
    detailForm.gender = String(detail.gender || 0)
    detailForm.typeOfWork = String(Number(detail.type_of_work) || 1)
    detailForm.experience = String(detail.experience || '')
    detailForm.salaryType = String(detail.salary_type || 1)
    detailForm.salaryFrom = String(detail.salary_from || '')
    detailForm.salaryTo = String(detail.salary_to || '')
    detailForm.profileRecipients = detail.profile_recipients
    detailForm.email = detail.email
    detailForm.phoneNumber = detail.phone_number
    detailForm.description = detail.description
  } else {
    modalExistingDetailJobId.value = null
  }
}

async function submitModal() {
  formErrors.name = ''; formErrors.startDate = ''; formErrors.endDate = ''; formErrors.branchIds = ''; formErrors.assigneeIds = ''
  detailFormError.value = ''
  if (!form.name.trim()) formErrors.name = 'Vui lòng nhập tên vị trí'
  if (!form.startDate) formErrors.startDate = 'Vui lòng chọn ngày đăng'
  if (!form.endDate) formErrors.endDate = 'Vui lòng chọn hạn nộp'
  if (form.startDate && form.endDate && form.startDate > form.endDate) formErrors.endDate = 'Hạn nộp phải sau ngày đăng'
  if (form.branchIds.length === 0) formErrors.branchIds = 'Chọn ít nhất một chi nhánh'
  if (form.assigneeIds.length === 0) formErrors.assigneeIds = 'Chọn ít nhất một người phụ trách'
  if (Object.values(formErrors).some(Boolean)) return
  // A partially-filled detail section would otherwise 400 silently after the
  // job itself is already created — catch it here instead, before anything is
  // sent. An existing detail-job record is always re-submitted on edit (even
  // if the user didn't touch it further this time), so it needs the same check.
  const detailTouched = detailFormTouched()
  if ((detailTouched || modalExistingDetailJobId.value !== null) && !detailFormValid()) {
    detailFormError.value = 'Chi tiết vị trí cần điền đủ Số lượng, Địa điểm, Địa chỉ và Kinh nghiệm (hoặc xoá hết để bỏ qua phần này).'
    return
  }

  modalSaving.value = true
  const corePayload = {
    job_name: form.name, start_date: form.startDate, expiry_date: form.endDate,
    branch_ids: form.branchIds, assignees: form.assigneeIds,
  }

  if (modalEditingId.value === null) {
    const res = await recruitStore.createJob(corePayload)
    if (!res.ok || !res.id) {
      modalSaving.value = false
      show(res.message || 'Tạo tin tuyển dụng thất bại.', 'error')
      return
    }
    if (detailTouched) {
      const detailRes = await recruitStore.createDetailJob(res.id, buildDetailPayload())
      if (!detailRes.ok) show(detailRes.message || 'Đã tạo tin nhưng lưu chi tiết vị trí thất bại.', 'error')
    }
    show('Đã tạo tin tuyển dụng: ' + form.name)
  } else {
    const id = modalEditingId.value
    const res = await recruitStore.editJob({ id, ...corePayload })
    if (!res.ok) {
      modalSaving.value = false
      show(res.message || 'Cập nhật tin tuyển dụng thất bại.', 'error')
      return
    }
    if (modalExistingDetailJobId.value !== null) {
      const detailRes = await recruitStore.updateDetailJob(modalExistingDetailJobId.value, buildDetailPayload())
      if (!detailRes.ok) show(detailRes.message || 'Cập nhật chi tiết vị trí thất bại.', 'error')
    } else if (detailTouched) {
      const detailRes = await recruitStore.createDetailJob(id, buildDetailPayload())
      if (!detailRes.ok) show(detailRes.message || 'Lưu chi tiết vị trí thất bại.', 'error')
    }
    show('Đã cập nhật tin tuyển dụng: ' + form.name)
  }
  modalSaving.value = false
  modalOpen.value = false
  // fetchList's get-jobs response already carries fresh stats/cv_counts —
  // no separate refresh call needed.
  await fetchList(modalEditingId.value === null ? 1 : recruitStore.pagination.current_page)
}

// ── Delete confirm (job or CV) ──
const deleteTarget = ref<{ type: 'job' | 'cv'; id: number } | null>(null)
const deleteConfirmOpen = ref(false)
function openDeleteJob(id: number) { deleteTarget.value = { type: 'job', id }; deleteConfirmOpen.value = true }
function openDeleteCv(id: number) { deleteTarget.value = { type: 'cv', id }; deleteConfirmOpen.value = true }
async function confirmDeleteTarget() {
  if (!deleteTarget.value) return
  const { type, id } = deleteTarget.value
  if (type === 'job') {
    const res = await recruitStore.removeJob(id)
    if (res.ok) {
      if (openJobId.value === id) closeDetail()
      const total = recruitStore.pagination.total_row - 1
      const lastPage = Math.max(1, Math.ceil(total / recruitStore.pagination.row_per_page))
      const page = Math.min(recruitStore.pagination.current_page, lastPage)
      await fetchList(page)
      show('Đã xóa tin tuyển dụng')
    } else {
      show(res.message || 'Xóa tin tuyển dụng thất bại.', 'error')
    }
  } else {
    const res = await recruitStore.removeCv(id)
    if (res.ok) {
      await fetchCvsForOpenJob(recruitStore.cvsPagination.current_page)
      show('Đã xóa ứng viên')
    } else {
      show(res.message || 'Xóa ứng viên thất bại.', 'error')
    }
  }
  deleteConfirmOpen.value = false
  deleteTarget.value = null
}

// ── Add / Edit CV modal ──
const cvModalOpen = ref(false)
const cvModalLoading = ref(false)
const cvModalSaving = ref(false)
const cvEditingId = ref<number | null>(null)
const cvForm = reactive({
  fullName: '', phone: '', email: '', salary: '', dateReceipt: todayStr,
  interviewMethod: '1', contactLink: '', mediaId: '3', mediaOther: '',
})
const cvFile = ref<File | null>(null)
const cvFileName = ref('')
const cvFormErrors = reactive({ fullName: '', phone: '', email: '', dateReceipt: '', file: '' })

function resetCvForm() {
  cvForm.fullName = ''; cvForm.phone = ''; cvForm.email = ''; cvForm.salary = ''
  cvForm.dateReceipt = todayStr; cvForm.interviewMethod = '1'; cvForm.contactLink = ''
  cvForm.mediaId = '3'; cvForm.mediaOther = ''
  cvFile.value = null; cvFileName.value = ''
  cvFormErrors.fullName = ''; cvFormErrors.phone = ''; cvFormErrors.email = ''; cvFormErrors.dateReceipt = ''; cvFormErrors.file = ''
}
function openAddCvModal() {
  cvEditingId.value = null
  resetCvForm()
  cvModalOpen.value = true
}
async function openEditCvModal(row: CvRow) {
  cvEditingId.value = row.id
  resetCvForm()
  cvModalOpen.value = true
  cvModalLoading.value = true
  const detail = await recruitStore.getCvById(row.id)
  cvModalLoading.value = false
  if (!detail) {
    show('Không thể tải chi tiết ứng viên này (có thể do lỗi lưu trữ file). Vui lòng thử lại sau.', 'error')
    cvModalOpen.value = false
    return
  }
  cvForm.fullName = detail.full_name
  cvForm.phone = detail.phone_number
  cvForm.email = detail.email
  cvForm.salary = detail.salary
  // date_receipt_cv comes back as YYYY/MM/DD (display format) — <input type=date> needs YYYY-MM-DD.
  cvForm.dateReceipt = detail.date_receipt_cv.replace(/\//g, '-')
  cvForm.interviewMethod = String(detail.interview_method || 1)
  cvForm.contactLink = detail.contact_link
  cvForm.mediaId = String(detail.media_id || 3)
  cvForm.mediaOther = detail.media_id_other
  cvFileName.value = detail.file_name
}
function onCvFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) { cvFile.value = file; cvFileName.value = file.name }
}

async function submitCvModal() {
  cvFormErrors.fullName = ''; cvFormErrors.phone = ''; cvFormErrors.email = ''; cvFormErrors.dateReceipt = ''; cvFormErrors.file = ''
  if (!cvForm.fullName.trim()) cvFormErrors.fullName = 'Vui lòng nhập họ tên'
  if (!cvForm.phone.trim()) cvFormErrors.phone = 'Vui lòng nhập số điện thoại'
  if (!cvForm.email.trim()) cvFormErrors.email = 'Vui lòng nhập email'
  if (!cvForm.dateReceipt) cvFormErrors.dateReceipt = 'Vui lòng chọn ngày nhận hồ sơ'
  if (cvEditingId.value === null && !cvFile.value) cvFormErrors.file = 'Vui lòng chọn file CV'
  if (Object.values(cvFormErrors).some(Boolean) || openJobId.value == null) return

  cvModalSaving.value = true
  const fileContent = cvFile.value ? await fileToBase64(cvFile.value) : ''
  const base = {
    recruitment_id: openJobId.value,
    full_name: cvForm.fullName,
    phone_number: cvForm.phone,
    email: cvForm.email,
    salary: cvForm.salary,
    date_receipt_cv: cvForm.dateReceipt,
    interview_method: Number(cvForm.interviewMethod),
    contact_link: cvForm.contactLink,
    media_id: Number(cvForm.mediaId),
    media_id_other: cvForm.mediaId === '8' ? cvForm.mediaOther : '',
  }

  if (cvEditingId.value === null) {
    const res = await recruitStore.createCv({
      ...base, file_name: cvFile.value!.name, file_content: fileContent, assignees: detailJob.value?.assignees ?? [],
    })
    cvModalSaving.value = false
    if (!res.ok) {
      show(res.message || 'Thêm ứng viên thất bại.', 'error')
      return
    }
    show('Đã thêm ứng viên: ' + cvForm.fullName)
  } else {
    const res = await recruitStore.updateCv({
      ...base, id: cvEditingId.value,
      file_name: cvFile.value ? cvFile.value.name : undefined,
      file_content: cvFile.value ? fileContent : undefined,
    })
    cvModalSaving.value = false
    if (!res.ok) {
      show(res.message || 'Cập nhật ứng viên thất bại.', 'error')
      return
    }
    show('Đã cập nhật ứng viên: ' + cvForm.fullName)
  }
  cvModalOpen.value = false
  await fetchCvsForOpenJob(recruitStore.cvsPagination.current_page)
}

// ── CV status change (small popover-style form) ──
const statusChangeFor = ref<CvRow | null>(null)
const statusChangeOpen = ref(false)
const statusChangeValue = ref('1')
const statusChangeSaving = ref(false)
function openStatusChange(row: CvRow) {
  statusChangeFor.value = row
  statusChangeValue.value = String(row.status || 1)
  statusChangeOpen.value = true
}
function closeStatusChange() { statusChangeOpen.value = false; statusChangeFor.value = null }
async function submitStatusChange() {
  if (!statusChangeFor.value || openJobId.value == null) return
  statusChangeSaving.value = true
  const res = await recruitStore.createLogCvStatus({
    cv_id: statusChangeFor.value.id,
    status: Number(statusChangeValue.value),
    recruitment_id: openJobId.value,
    assignees: detailJob.value?.assignees ?? [],
  })
  statusChangeSaving.value = false
  if (res.ok) {
    show('Đã cập nhật trạng thái ứng viên')
    closeStatusChange()
    await fetchCvsForOpenJob(recruitStore.cvsPagination.current_page)
  } else {
    show(res.message || 'Cập nhật trạng thái thất bại.', 'error')
  }
}

// ── CV status history ──
const historyFor = ref<CvRow | null>(null)
const historyOpen = ref(false)
const historyLogs = ref<CvStatusLog[]>([])
const historyLoading = ref(false)
async function openHistory(row: CvRow) {
  historyFor.value = row
  historyOpen.value = true
  historyLoading.value = true
  historyLogs.value = await recruitStore.getLogsCvStatus(row.id)
  historyLoading.value = false
}
function closeHistory() { historyOpen.value = false; historyFor.value = null }
</script>

<template>
<div class="space-y-6">
  <PageHeader
    eyebrow="Tuyển dụng"
    title="Quản lý tin tuyển dụng"
    description="Theo dõi các vị trí đang tuyển và ứng viên theo từng tin."
  >
    <template #actions>
      <Btn v-if="isManagerOrGM" variant="primary" @click="openCreateModal"><Plus :size="14" />Tạo tin mới</Btn>
    </template>
  </PageHeader>

  <!-- MiniStats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <MiniStat label="Tổng tin tuyển dụng" :value="stats.total" sublabel="Toàn tổ chức" accent="primary" :delay="40" />
    <MiniStat label="Đang tuyển" :value="stats.active" sublabel="Còn hạn nộp hồ sơ" accent="green" :delay="80" />
    <MiniStat label="Đã đóng" :value="stats.closed" sublabel="Hết hạn nộp hồ sơ" accent="gray" :delay="120" />
    <MiniStat label="Tổng ứng viên" :value="stats.totalCvs" sublabel="Tất cả vị trí" accent="violet" :delay="160" />
  </div>

  <!-- Filter bar -->
  <FilterBar>
    <FieldInput v-model="search" placeholder="Tìm vị trí…" :width="220" />
    <Select v-model="statusF" :options="statusOpts" style="min-width: 150px" />
    <Select v-model="branchF" :options="branchOpts" style="min-width: 170px" />
    <div class="flex-1" />
    <span class="text-[12px] text-muted-foreground">{{ recruitStore.pagination.total_row }} tin</span>
  </FilterBar>

  <!-- Error banner -->
  <ErrorBanner v-if="recruitStore.error" :message="recruitStore.error" @retry="fetchList(recruitStore.pagination.current_page)" />

  <!-- Job list table -->
  <div class="card-surface overflow-hidden rise" style="animation-delay: 180ms">
    <div class="overflow-x-auto">
      <table class="w-full text-[13px]" style="min-width: 860px">
        <thead>
          <tr class="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
            <th class="text-left py-3 px-5">Vị trí</th>
            <th class="text-left py-3 px-3">Chi nhánh</th>
            <th class="text-left py-3 px-3">Người phụ trách</th>
            <th class="text-center py-3 px-3">Ứng viên</th>
            <th class="text-center py-3 px-3">Trạng thái</th>
            <th class="text-right py-3 px-5">Hạn nộp</th>
          </tr>
        </thead>
        <tbody>
          <SkeletonRow v-if="recruitStore.loading" :cols="6" :rows="5" />
          <template v-else-if="recruitStore.jobs.length === 0">
            <tr>
              <td colspan="6" class="py-0">
                <EmptyState :icon="Briefcase" title="Không có tin tuyển dụng" description="Chưa có vị trí nào phù hợp với bộ lọc hiện tại." />
              </td>
            </tr>
          </template>
          <template v-else>
            <tr
              v-for="j in recruitStore.jobs" :key="j.id"
              class="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
              @click="openDetail(j)"
            >
              <td class="py-3.5 px-5">
                <p class="font-semibold text-foreground">{{ j.job_name }}</p>
                <p class="text-[11.5px] text-muted-foreground mt-0.5">Đăng {{ j.start_date }}</p>
              </td>
              <td class="py-3.5 px-3">
                <div class="flex flex-wrap gap-1">
                  <span v-for="bid in j.branch_ids.slice(0, 2)" :key="bid" class="px-1.5 py-0.5 rounded bg-muted text-[11px] text-foreground/80">{{ branchName(bid) }}</span>
                  <span v-if="j.branch_ids.length > 2" class="px-1.5 py-0.5 rounded bg-muted text-[11px] text-muted-foreground">+{{ j.branch_ids.length - 2 }}</span>
                </div>
              </td>
              <td class="py-3.5 px-3">
                <div class="flex -space-x-2">
                  <Avatar v-for="uid in j.assignees.slice(0, 4)" :key="uid" :name="userName(uid)" :size="24" class="border-2 border-card" />
                  <div v-if="j.assignees.length > 4" class="h-6 w-6 rounded-lg border-2 border-card bg-muted flex items-center justify-center text-[9.5px] font-semibold text-muted-foreground">
                    +{{ j.assignees.length - 4 }}
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-3 text-center">
                <span class="font-bold tabular-nums text-primary">{{ recruitStore.jobCvCounts[j.id] ?? '—' }}</span>
              </td>
              <td class="py-3.5 px-3 text-center">
                <Badge :variant="jobStatusMeta(j.expiry_date).variant" dot>{{ jobStatusMeta(j.expiry_date).label }}</Badge>
              </td>
              <td class="py-3.5 px-5 text-right font-mono text-muted-foreground text-[12px]">{{ j.expiry_date }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <Pagination
      v-if="recruitStore.pagination.total_row > 0"
      :page="recruitStore.pagination.current_page"
      :total="recruitStore.pagination.total_row"
      :per-page="recruitStore.pagination.row_per_page"
      @change="fetchList"
    />
  </div>

  <!-- ── Job detail slide-over ── -->
  <Teleport to="body">
    <div v-if="openJobId !== null" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="closeDetail" />
      <div class="relative bg-background border-l border-border w-full max-w-3xl h-full flex flex-col rise" style="animation-duration: .3s">
        <template v-if="detailLoading">
          <div class="flex-1 flex items-center justify-center">
            <span class="h-8 w-8 rounded-full border-[3px] border-primary/25 border-t-primary animate-spin" />
          </div>
        </template>
        <template v-else-if="detailJob">
          <!-- Header -->
          <div class="p-5 border-b border-border/70 shrink-0">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <Badge :variant="jobStatusMeta(detailJob.expiry_date).variant" dot>{{ jobStatusMeta(detailJob.expiry_date).label }}</Badge>
                <h2 class="text-[20px] font-bold font-heading text-foreground mt-1.5">{{ detailJob.job_name }}</h2>
                <div class="flex flex-wrap items-center gap-1.5 mt-2 text-[12px] text-muted-foreground">
                  <span v-for="bid in detailJob.branch_ids" :key="bid" class="px-1.5 py-0.5 rounded bg-muted text-foreground/80">{{ branchName(bid) }}</span>
                  <span class="font-mono">{{ detailJob.start_date }} → {{ detailJob.expiry_date }}</span>
                </div>
              </div>
              <button class="p-2 rounded-md hover:bg-muted text-muted-foreground shrink-0" @click="closeDetail"><X :size="16" /></button>
            </div>

            <div class="mt-3 flex items-center gap-2">
              <span class="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Phụ trách:</span>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span v-for="uid in detailJob.assignees" :key="uid" class="inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-muted/60 text-[12px]">
                  <Avatar :name="userName(uid)" :size="18" />{{ userName(uid) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Scrollable body -->
          <div class="flex-1 overflow-y-auto overscroll-contain scrollbar-thin p-5 space-y-5">
            <!-- Detail-job info, if filled in -->
            <div v-if="detailDetailJob" class="card-surface p-5 space-y-4">
              <h3 class="section-title">Thông tin chi tiết vị trí</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12.5px]">
                <div><p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Số lượng</p><p class="mt-0.5 font-medium text-foreground">{{ detailDetailJob.amount }}</p></div>
                <div><p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Cấp bậc</p><p class="mt-0.5 font-medium text-foreground">{{ ROLE_OPTS.find(o => o.value === String(detailDetailJob.role))?.label ?? '—' }}</p></div>
                <div><p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Hình thức</p><p class="mt-0.5 font-medium text-foreground">{{ TYPE_OF_WORK_OPTS.find(o => o.value === String(Number(detailDetailJob.type_of_work)))?.label ?? '—' }}</p></div>
                <div><p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Kinh nghiệm</p><p class="mt-0.5 font-medium text-foreground">{{ detailDetailJob.experience }} năm</p></div>
                <div v-if="detailDetailJob.salary_from || detailDetailJob.salary_to">
                  <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Mức lương ({{ SALARY_TYPE_OPTS.find(o => o.value === String(detailDetailJob.salary_type))?.label }})</p>
                  <p class="mt-0.5 font-medium text-foreground">{{ detailDetailJob.salary_from.toLocaleString() }} – {{ detailDetailJob.salary_to.toLocaleString() }} VND</p>
                </div>
                <div v-if="detailDetailJob.place.length"><p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Địa điểm</p><p class="mt-0.5 font-medium text-foreground">{{ detailDetailJob.place.join(', ') }}</p></div>
                <div v-if="detailDetailJob.address.length"><p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Địa chỉ</p><p class="mt-0.5 font-medium text-foreground">{{ detailDetailJob.address.join(', ') }}</p></div>
              </div>
              <div v-if="detailDetailJob.description">
                <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Mô tả</p>
                <p class="text-[13px] text-foreground/85 leading-relaxed whitespace-pre-wrap">{{ detailDetailJob.description }}</p>
              </div>
            </div>

            <!-- CV / applicants -->
            <div>
              <div class="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <p class="section-title">Ứng viên ({{ recruitStore.cvsPagination.total_row }})</p>
                <Btn variant="primary" size="xs" @click="openAddCvModal"><UserPlus :size="11" />Thêm ứng viên</Btn>
              </div>

              <div class="flex items-center gap-2 mb-3 flex-wrap">
                <FieldInput v-model="cvSearch" placeholder="Tìm tên ứng viên…" :width="180" />
                <Select v-model="cvStatusF" :options="CV_STATUS_OPTS" style="min-width: 150px" />
              </div>

              <SkeletonRow v-if="recruitStore.cvsLoading" :cols="1" :rows="3" />
              <EmptyState v-else-if="recruitStore.cvs.length === 0" :icon="UserPlus" title="Chưa có ứng viên" description="Chưa có ứng viên nào cho vị trí này." />
              <ul v-else class="space-y-2">
                <li
                  v-for="cv in recruitStore.cvs" :key="cv.id"
                  class="card-surface p-3.5 flex items-center gap-3"
                >
                  <Avatar :name="cv.full_name" :size="36" />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <p class="font-semibold text-foreground">{{ cv.full_name }}</p>
                      <span class="text-[10px] font-bold px-1.5 py-0.5 rounded text-white bg-slate-500">{{ mediaLabel(cv.media_id, cv.media_id_other) }}</span>
                    </div>
                    <p class="text-[11px] font-mono text-muted-foreground mt-0.5">Nhận hồ sơ {{ cv.date_receipt_cv }} · Cập nhật {{ cv.updated_at }}</p>
                  </div>
                  <div class="shrink-0">
                    <Badge :variant="cvStatusMeta(cv.status).variant" dot>{{ cvStatusMeta(cv.status).label }}</Badge>
                  </div>
                  <div class="shrink-0 flex items-center gap-1">
                    <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Lịch sử trạng thái" @click="openHistory(cv)"><History :size="13" /></button>
                    <Btn variant="outline" size="xs" @click="openStatusChange(cv)">Cập nhật</Btn>
                    <Btn variant="ghost" size="xs" @click="openEditCvModal(cv)"><FileText :size="12" /></Btn>
                    <Btn v-if="isManagerOrGM" variant="ghost" size="xs" @click="openDeleteCv(cv.id)"><X :size="12" /></Btn>
                  </div>
                </li>
              </ul>
              <Pagination
                v-if="recruitStore.cvsPagination.total_row > 0"
                :page="recruitStore.cvsPagination.current_page"
                :total="recruitStore.cvsPagination.total_row"
                :per-page="recruitStore.cvsPagination.row_per_page"
                @change="fetchCvsForOpenJob"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-border/70 flex items-center gap-2 shrink-0">
            <Btn variant="ghost" size="sm" @click="closeDetail">Đóng</Btn>
            <div class="flex-1" />
            <Btn v-if="isManagerOrGM" variant="outline" size="sm" @click="openDeleteJob(openJobId!)">Xóa</Btn>
            <Btn v-if="isManagerOrGM" variant="primary" size="sm" @click="openEditModal({ id: openJobId!, job_name: detailJob.job_name, start_date: detailJob.start_date, expiry_date: detailJob.expiry_date, branch_ids: detailJob.branch_ids, assignees: detailJob.assignees })">
              <FileText :size="13" />Chỉnh sửa
            </Btn>
          </div>
        </template>
      </div>
    </div>
  </Teleport>

  <!-- ── Create / Edit Job Modal ── -->
  <Teleport to="body">
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="modalOpen = false" />
      <div class="relative card-surface rise w-full flex flex-col" style="max-width: 640px; border-radius: 20px; overflow: hidden; animation-duration: .22s; max-height: 92vh">
        <div class="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h3 class="font-heading font-bold text-[15px] text-foreground">{{ modalEditingId === null ? 'Tạo tin tuyển dụng mới' : 'Sửa tin tuyển dụng' }}</h3>
            <p class="text-[11.5px] text-muted-foreground">Thông tin chung và chi tiết vị trí (tùy chọn)</p>
          </div>
          <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="modalOpen = false"><X :size="14" /></button>
        </div>

        <div v-if="modalLoading" class="flex-1 flex items-center justify-center p-10">
          <span class="h-7 w-7 rounded-full border-[3px] border-primary/25 border-t-primary animate-spin" />
        </div>
        <div v-else class="overflow-y-auto overscroll-contain scrollbar-thin flex-1 p-6 space-y-5">
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Tên vị trí <span class="text-red-400">*</span></label>
            <input v-model="form.name" placeholder="VD: Senior Frontend Engineer" class="w-full h-9 px-3 rounded-lg border text-[13px] text-foreground outline-none bg-card" :class="formErrors.name ? 'border-red-400' : 'border-border focus:border-primary/60'">
            <p v-if="formErrors.name" class="text-[11.5px] text-red-500 mt-1">{{ formErrors.name }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Ngày đăng <span class="text-red-400">*</span></label>
              <DatePicker v-model="form.startDate" width="100%" :error="!!formErrors.startDate" />
              <p v-if="formErrors.startDate" class="text-[11.5px] text-red-500 mt-1">{{ formErrors.startDate }}</p>
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Hạn nộp <span class="text-red-400">*</span></label>
              <DatePicker v-model="form.endDate" width="100%" :min="form.startDate" :error="!!formErrors.endDate" />
              <p v-if="formErrors.endDate" class="text-[11.5px] text-red-500 mt-1">{{ formErrors.endDate }}</p>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Chi nhánh <span class="text-red-400">*</span></label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="[id, name] in Object.entries(recruitStore.branches)" :key="id" type="button"
                class="px-2.5 py-1 rounded-full text-[12px] font-medium border transition-colors"
                :class="form.branchIds.includes(Number(id)) ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'"
                @click="toggleBranch(Number(id))"
              >{{ name }}</button>
            </div>
            <p v-if="formErrors.branchIds" class="text-[11.5px] text-red-500 mt-1">{{ formErrors.branchIds }}</p>
          </div>

          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Người phụ trách <span class="text-red-400">*</span></label>
            <div v-if="form.assigneeIds.length > 0" class="flex flex-wrap gap-1.5 mb-2">
              <span v-for="id in form.assigneeIds" :key="id" class="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-full text-[12px] font-medium" style="background: hsl(var(--primary-h) var(--primary-s) 60% / 0.12); color: hsl(var(--primary-h) var(--primary-s) 42%)">
                {{ userName(id) }}
                <button class="h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors" @click="removeAssignee(id)"><X :size="9" /></button>
              </span>
            </div>
            <div class="relative">
              <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input v-model="assigneeSearch" placeholder="Tìm và thêm người phụ trách…" class="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
            </div>
            <div v-if="assigneeSearch && assigneeResults.length > 0" class="card-surface border border-border shadow-sm rounded-xl overflow-hidden mt-1">
              <button v-for="u in assigneeResults.slice(0, 5)" :key="u.id" class="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/40 transition-colors text-left" @click="addAssignee(u.id)">
                <Avatar :name="u.name" :size="24" /><span class="text-[13px] text-foreground">{{ u.name }}</span>
              </button>
            </div>
            <p v-if="formErrors.assigneeIds" class="text-[11.5px] text-red-500 mt-1">{{ formErrors.assigneeIds }}</p>
          </div>

          <!-- Detail-job section -->
          <div class="pt-1 border-t border-dashed border-border/70">
            <p class="text-[12.5px] font-semibold text-foreground mt-4 mb-1">Chi tiết vị trí (tùy chọn)</p>
            <p v-if="detailFormError" class="text-[11.5px] text-red-500 mb-2">{{ detailFormError }}</p>
            <p v-else class="text-[11px] text-muted-foreground mb-3">Nếu điền, cần đủ Số lượng / Địa điểm / Địa chỉ / Kinh nghiệm.</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Số lượng cần tuyển</label>
                <input v-model="detailForm.amount" inputmode="numeric" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Kinh nghiệm (năm)</label>
                <input v-model="detailForm.experience" inputmode="numeric" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Cấp bậc</label>
                <Select v-model="detailForm.role" :options="ROLE_OPTS" style="width: 100%" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Hình thức làm việc</label>
                <Select v-model="detailForm.typeOfWork" :options="TYPE_OF_WORK_OPTS" style="width: 100%" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Giới tính</label>
                <Select v-model="detailForm.gender" :options="GENDER_OPTS" style="width: 100%" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Loại lương</label>
                <Select v-model="detailForm.salaryType" :options="SALARY_TYPE_OPTS" style="width: 100%" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Lương từ (VND)</label>
                <input v-model="detailForm.salaryFrom" inputmode="numeric" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Lương đến (VND)</label>
                <input v-model="detailForm.salaryTo" inputmode="numeric" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Địa điểm (phân cách bởi dấu phẩy)</label>
                <input v-model="detailForm.place" placeholder="Hà Nội, Đà Nẵng…" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Địa chỉ chi tiết (phân cách bởi dấu phẩy)</label>
                <input v-model="detailForm.address" placeholder="123 Đường ABC…" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Email liên hệ</label>
                <input v-model="detailForm.email" type="email" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
              </div>
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">SĐT liên hệ</label>
                <input v-model="detailForm.phoneNumber" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
              </div>
            </div>
            <div class="mt-3">
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Nơi nhận hồ sơ</label>
              <input v-model="detailForm.profileRecipients" placeholder="hr@company.com" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
            </div>
            <div class="mt-3">
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Mô tả công việc</label>
              <textarea v-model="detailForm.description" rows="4" placeholder="Yêu cầu, quyền lợi, mô tả công việc…" class="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 resize-none" />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/70 bg-muted/20 shrink-0">
          <Btn variant="outline" size="sm" @click="modalOpen = false">Hủy</Btn>
          <Btn variant="primary" size="sm" :disabled="modalSaving || modalLoading" @click="submitModal">
            <Plus v-if="modalEditingId === null" :size="13" />Lưu
          </Btn>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── Add / Edit CV Modal ── -->
  <Teleport to="body">
    <div v-if="cvModalOpen" class="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="cvModalOpen = false" />
      <div class="relative card-surface rise w-full flex flex-col" style="max-width: 520px; border-radius: 20px; overflow: hidden; animation-duration: .22s; max-height: 92vh">
        <div class="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h3 class="font-heading font-bold text-[15px] text-foreground">{{ cvEditingId === null ? 'Thêm ứng viên' : 'Sửa thông tin ứng viên' }}</h3>
          <button class="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted" @click="cvModalOpen = false"><X :size="14" /></button>
        </div>

        <div v-if="cvModalLoading" class="flex-1 flex items-center justify-center p-10">
          <span class="h-7 w-7 rounded-full border-[3px] border-primary/25 border-t-primary animate-spin" />
        </div>
        <div v-else class="overflow-y-auto overscroll-contain scrollbar-thin flex-1 p-6 space-y-4">
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Họ tên <span class="text-red-400">*</span></label>
            <input v-model="cvForm.fullName" class="w-full h-9 px-3 rounded-lg border text-[13px] text-foreground outline-none bg-card" :class="cvFormErrors.fullName ? 'border-red-400' : 'border-border focus:border-primary/60'">
            <p v-if="cvFormErrors.fullName" class="text-[11.5px] text-red-500 mt-1">{{ cvFormErrors.fullName }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Số điện thoại <span class="text-red-400">*</span></label>
              <input v-model="cvForm.phone" class="w-full h-9 px-3 rounded-lg border text-[13px] text-foreground outline-none bg-card" :class="cvFormErrors.phone ? 'border-red-400' : 'border-border focus:border-primary/60'">
              <p v-if="cvFormErrors.phone" class="text-[11.5px] text-red-500 mt-1">{{ cvFormErrors.phone }}</p>
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Email <span class="text-red-400">*</span></label>
              <input v-model="cvForm.email" type="email" class="w-full h-9 px-3 rounded-lg border text-[13px] text-foreground outline-none bg-card" :class="cvFormErrors.email ? 'border-red-400' : 'border-border focus:border-primary/60'">
              <p v-if="cvFormErrors.email" class="text-[11.5px] text-red-500 mt-1">{{ cvFormErrors.email }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Ngày nhận hồ sơ <span class="text-red-400">*</span></label>
              <DatePicker v-model="cvForm.dateReceipt" width="100%" :error="!!cvFormErrors.dateReceipt" />
              <p v-if="cvFormErrors.dateReceipt" class="text-[11.5px] text-red-500 mt-1">{{ cvFormErrors.dateReceipt }}</p>
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Mức lương mong muốn</label>
              <input v-model="cvForm.salary" placeholder="VD: 20-25M" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Nguồn CV</label>
              <Select v-model="cvForm.mediaId" :options="MEDIA_OPTS" style="width: 100%" />
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Hình thức phỏng vấn</label>
              <Select v-model="cvForm.interviewMethod" :options="INTERVIEW_METHOD_OPTS" style="width: 100%" />
            </div>
          </div>
          <div v-if="cvForm.mediaId === '8'">
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Nguồn khác</label>
            <input v-model="cvForm.mediaOther" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Link liên hệ (LinkedIn, Facebook…)</label>
            <input v-model="cvForm.contactLink" class="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60">
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">File CV {{ cvEditingId === null ? '(bắt buộc)' : '(để trống nếu giữ file cũ)' }} <span v-if="cvEditingId === null" class="text-red-400">*</span></label>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" class="w-full text-[12.5px] text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary file:text-[12.5px] file:font-medium" @change="onCvFileChange">
            <p v-if="cvFileName" class="text-[11.5px] text-muted-foreground mt-1">Đã chọn: {{ cvFileName }}</p>
            <p v-if="cvFormErrors.file" class="text-[11.5px] text-red-500 mt-1">{{ cvFormErrors.file }}</p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/70 bg-muted/20 shrink-0">
          <Btn variant="outline" size="sm" @click="cvModalOpen = false">Hủy</Btn>
          <Btn variant="primary" size="sm" :disabled="cvModalSaving || cvModalLoading" @click="submitCvModal">Lưu</Btn>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── CV status change modal ── -->
  <Modal v-model:open="statusChangeOpen" :title="`Cập nhật trạng thái — ${statusChangeFor?.full_name ?? ''}`" :max-width="380">
    <div class="px-6 py-4">
      <label class="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Trạng thái mới</label>
      <Select v-model="statusChangeValue" :options="CV_STATUS_OPTS.filter(o => o.value !== '0')" style="width: 100%" />
    </div>
    <template #footer>
      <Btn variant="ghost" size="sm" @click="closeStatusChange">Hủy</Btn>
      <Btn variant="primary" size="sm" :disabled="statusChangeSaving" @click="submitStatusChange">Lưu</Btn>
    </template>
  </Modal>

  <!-- ── CV status history modal ── -->
  <Modal v-model:open="historyOpen" :title="`Lịch sử trạng thái — ${historyFor?.full_name ?? ''}`" :max-width="420">
    <div class="px-6 py-4 max-h-[50vh] overflow-y-auto overscroll-contain scrollbar-thin">
      <div v-if="historyLoading" class="py-6 text-center text-[12.5px] text-muted-foreground">Đang tải…</div>
      <div v-else-if="historyLogs.length === 0" class="py-6 text-center text-[12.5px] text-muted-foreground">Chưa có lịch sử cập nhật trạng thái.</div>
      <ul v-else class="space-y-2">
        <li v-for="(log, i) in historyLogs" :key="i" class="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
          <Badge :variant="cvStatusMeta(log.status).variant" dot>{{ cvStatusMeta(log.status).label }}</Badge>
          <span class="text-[11.5px] font-mono text-muted-foreground">{{ log.datetime_update }}</span>
        </li>
      </ul>
    </div>
    <template #footer>
      <Btn variant="ghost" size="sm" @click="closeHistory">Đóng</Btn>
    </template>
  </Modal>

  <!-- ── Delete Confirm Modal ── -->
  <Modal v-model:open="deleteConfirmOpen" :title="deleteTarget?.type === 'job' ? 'Xác nhận xóa tin tuyển dụng' : 'Xác nhận xóa ứng viên'" :max-width="400">
    <div class="px-6 py-4">
      <p class="text-[13.5px] text-foreground/85">
        {{ deleteTarget?.type === 'job' ? 'Bạn có chắc chắn muốn xóa tin tuyển dụng này không?' : 'Bạn có chắc chắn muốn xóa ứng viên này không?' }}
        Hành động này không thể hoàn tác.
      </p>
    </div>
    <template #footer>
      <Btn variant="ghost" size="sm" @click="deleteConfirmOpen = false; deleteTarget = null">Hủy</Btn>
      <Btn variant="danger" size="sm" @click="confirmDeleteTarget">Xác nhận</Btn>
    </template>
  </Modal>
</div>
</template>
