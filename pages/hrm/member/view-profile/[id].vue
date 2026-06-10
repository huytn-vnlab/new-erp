<template>
  <div class="space-y-4">
    <!-- Skeleton -->
    <template v-if="loading">
      <Card><CardContent class="flex gap-6 p-6">
        <Skeleton class="h-24 w-24 rounded-full shrink-0" />
        <div class="flex-1 space-y-3">
          <Skeleton class="h-6 w-48" />
          <Skeleton class="h-4 w-32" />
          <div class="grid grid-cols-4 gap-3 mt-4">
            <Skeleton v-for="n in 8" :key="n" class="h-10" />
          </div>
        </div>
      </CardContent></Card>
      <Card><CardContent class="p-6">
        <div class="grid grid-cols-4 gap-6">
          <Skeleton v-for="n in 12" :key="n" class="h-10" />
        </div>
      </CardContent></Card>
      <Card v-for="n in 3" :key="n"><CardContent class="p-4 space-y-2">
        <Skeleton class="h-5 w-40" />
        <Skeleton v-for="m in 2" :key="m" class="h-4 w-full" />
      </CardContent></Card>
    </template>

    <!-- Error -->
    <div v-else-if="error" class="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {{ error }}
    </div>

    <template v-else-if="p">

      <!-- ── ROW 1: Profile card + Personal info side by side ── -->
      <div class="flex flex-col lg:flex-row gap-4 items-stretch">

      <!-- Profile card -->
      <Card class="overflow-hidden w-full lg:w-[420px] shrink-0">
        <!-- Blue header band -->
        <div class="bg-gradient-to-br from-sky-400 to-blue-500 px-9 pb-6 pt-4 text-white flex flex-col items-center text-center">
          <!-- Avatar -->
          <Avatar class="h-32 w-32 border-4 border-white mt-4 mb-3">
            <AvatarImage v-if="p.avatar" :src="avatarSrc" :alt="p.full_name" />
            <AvatarFallback class="bg-sky-600 text-white text-3xl font-bold">
              {{ getInitials(p.full_name) }}
            </AvatarFallback>
          </Avatar>
          <!-- Name / ID / Role -->
          <div class="font-bold text-lg leading-snug mb-1">{{ p.full_name }}</div>
          <div class="text-xs opacity-90 mb-0.5">ID: {{ p.employee_id || '0000' }}</div>
          <div class="text-xs opacity-90 mb-4">{{ p.role_name || roleLabel }}</div>
          <!-- Status badge -->
          <span
            class="inline-block rounded px-4 py-1 text-xs font-bold text-white mb-6"
            :class="p.status === 3 ? 'bg-red-500' : 'bg-green-500'"
          >{{ statusLabel }}</span>
          <!-- Work info rows -->
          <div class="w-full grid grid-cols-2 gap-x-4 gap-y-7 text-xs text-left">
            <div>
              <div class="font-bold mb-1 opacity-80">Chi nhánh</div>
              <div>{{ p.branch_name || '—' }}</div>
            </div>
            <div>
              <div class="font-bold mb-1 opacity-80">Ngày vào công ty</div>
              <div>{{ (p.company_joined_date || p.start_date) ? formatDate(p.company_joined_date || p.start_date) : '—' }}</div>
            </div>
            <div>
              <div class="font-bold mb-1 opacity-80">Phòng ban</div>
              <div>{{ p.department || '—' }}</div>
            </div>
            <div>
              <div class="font-bold mb-1 opacity-80">Ngày sinh</div>
              <div>{{ (p.birthday || p.date_of_birth) ? formatDate(p.birthday || p.date_of_birth) : '—' }}</div>
            </div>
            <div class="col-span-2">
              <div class="font-bold mb-1 opacity-80">Chức danh / Vị trí công việc</div>
              <div>{{ jobTitleLabel }}</div>
            </div>
            <div class="col-span-2">
              <div class="font-bold mb-1 opacity-80">Địa điểm làm việc</div>
              <div>{{ p.work_place || '—' }}</div>
            </div>
            <div class="col-span-2">
              <div class="font-bold mb-1 opacity-80">Hạng</div>
              <div>{{ p.rank_name || p.rank || '—' }}</div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <CardContent class="px-6 py-3 flex gap-3 bg-white">
          <Button v-if="canEdit" variant="default" size="sm" @click="openEdit">
            Chỉnh sửa <i class="far fa-edit ml-1"></i>
          </Button>
          <Button variant="outline" size="sm" @click="exportPDF">
            Xuất PDF <i class="fas fa-file-pdf ml-1"></i>
          </Button>
        </CardContent>
      </Card>

      <!-- ── Edit Sheet ── -->
      <Sheet v-model:open="sheetOpen">
        <SheetContent side="right" class="sm:max-w-2xl w-full flex flex-col p-0">
          <SheetHeader class="px-6 py-4 border-b shrink-0">
            <SheetTitle>Chỉnh sửa hồ sơ</SheetTitle>
          </SheetHeader>

          <div v-if="editForm" class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <!-- Server error -->
            <div v-if="saveError" class="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {{ saveError }}
            </div>

            <!-- Section: Thông tin chung -->
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">Thông tin chung</h3>
              <div class="grid grid-cols-2 gap-4">
                <FormField label="Họ" required>
                  <input v-model="editForm.first_name" class="field-input" placeholder="Nguyễn" />
                </FormField>
                <FormField label="Tên" required>
                  <input v-model="editForm.last_name" class="field-input" placeholder="Văn A" />
                </FormField>
                <FormField label="ID nhân viên">
                  <input v-model="editForm.employee_id" class="field-input" placeholder="0000" />
                </FormField>
                <FormField label="Quyền">
                  <select v-model="editForm.role_id" class="field-input">
                    <option :value="1">Thành viên</option>
                    <option :value="2">Quản lý</option>
                    <option :value="3">Tổng quản lý</option>
                  </select>
                </FormField>
                <FormField label="Chi nhánh">
                  <select v-model="editForm.branch" class="field-input">
                    <option value="">— Chọn —</option>
                    <option v-for="(name, id) in branchList" :key="id" :value="Number(id)">{{ name }}</option>
                  </select>
                </FormField>
                <FormField label="Ngày sinh">
                  <DatePicker v-model="editForm.birthday" />
                </FormField>
                <FormField label="Giới tính">
                  <select v-model="editForm.gender" class="field-input">
                    <option value="">— Chọn —</option>
                    <option :value="1">Nam</option>
                    <option :value="2">Nữ</option>
                  </select>
                </FormField>
                <FormField label="Ngày vào công ty">
                  <DatePicker v-model="editForm.company_joined_date" />
                </FormField>
                <FormField label="Chức danh/Vị trí công việc" class="col-span-2">
                  <select v-model="editForm.job_title" class="field-input">
                    <option value="">— Chọn —</option>
                    <option v-for="(name, id) in jobTitleList" :key="id" :value="Number(id)">{{ name }}</option>
                  </select>
                </FormField>
                <FormField label="Phòng ban" class="col-span-2">
                  <input v-model="editForm.department" class="field-input" placeholder="System Development Department" />
                </FormField>
                <FormField label="Địa điểm làm việc" class="col-span-2">
                  <input v-model="editForm.work_place" class="field-input" />
                </FormField>
                <FormField label="Hạng">
                  <select v-model="editForm.rank" class="field-input">
                    <option value="">— Chọn —</option>
                    <option v-for="(name, id) in rankList" :key="id" :value="Number(id)">{{ name }}</option>
                  </select>
                </FormField>
              </div>
            </div>

            <!-- Section: Thông tin cá nhân -->
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">Thông tin cá nhân</h3>
              <div class="grid grid-cols-2 gap-4">
                <FormField label="Tình trạng hôn nhân">
                  <input v-model="editForm.marital_status" class="field-input" />
                </FormField>
                <FormField label="Email cá nhân">
                  <input v-model="editForm.personal_email" type="email" class="field-input" />
                </FormField>
                <FormField label="Số điện thoại">
                  <input v-model="editForm.phone_number" type="tel" class="field-input" />
                </FormField>
                <FormField label="Số CMND/CCCD" required>
                  <input v-model="editForm.identity_card" class="field-input" />
                </FormField>
                <FormField label="Loại giấy tờ" required>
                  <select v-model="editForm.id_type" class="field-input">
                    <option :value="1">Chứng Minh Nhân Dân</option>
                    <option :value="2">Căn Cước Công Dân</option>
                  </select>
                </FormField>
                <FormField label="Ngày cấp">
                  <DatePicker v-model="editForm.date_of_identity_card" />
                </FormField>
                <FormField label="Nguyên quán / Nơi sinh" required class="col-span-2">
                  <input v-model="editForm.user_birth_place" class="field-input" />
                </FormField>
                <FormField label="Nơi cấp giấy tờ">
                  <input v-model="editForm.place_of_issue" class="field-input" />
                </FormField>
                <FormField label="Quốc tịch">
                  <input v-model="editForm.country" class="field-input" />
                </FormField>
                <FormField label="Dân tộc">
                  <input v-model="editForm.nation" class="field-input" />
                </FormField>
                <FormField label="Tôn giáo">
                  <input v-model="editForm.religion" class="field-input" />
                </FormField>
                <FormField label="Mã số thuế">
                  <input v-model="editForm.tax_code" class="field-input" />
                </FormField>
                <FormField label="Hộ khẩu thường trú" class="col-span-2">
                  <textarea v-model="editForm.permanent_residence" rows="2" class="field-input resize-none" />
                </FormField>
                <FormField label="Địa chỉ hiện tại" class="col-span-2">
                  <textarea v-model="editForm.current_address" rows="2" class="field-input resize-none" />
                </FormField>
                <FormField label="Số tài khoản VietcomBank">
                  <input v-model="editForm.account_number_vcb" class="field-input" />
                </FormField>
                <FormField label="Số sổ BHXH (nếu có)">
                  <input v-model="editForm.book_number_bhxh" class="field-input" />
                </FormField>
              </div>
            </div>

            <!-- Section: Liên hệ khẩn cấp -->
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">Liên hệ khẩn cấp</h3>
              <div class="grid grid-cols-2 gap-4">
                <FormField label="Họ tên người liên hệ khẩn cấp" class="col-span-2">
                  <input v-model="editForm.name_of_emergency" class="field-input" />
                </FormField>
                <FormField label="Quan hệ">
                  <input v-model="editForm.relationships_of_emergency" class="field-input" />
                </FormField>
                <FormField label="Hiệu xe và biển số xe máy">
                  <input v-model="editForm.license_plates" class="field-input" />
                </FormField>
                <FormField label="Địa chỉ người liên hệ khẩn cấp" class="col-span-2">
                  <textarea v-model="editForm.address_of_emergency" rows="2" class="field-input resize-none" />
                </FormField>
              </div>
            </div>
          </div>

          <SheetFooter class="px-6 py-4 border-t shrink-0 flex gap-3">
            <Button variant="outline" :disabled="saving" @click="sheetOpen = false">Hủy</Button>
            <Button :disabled="saving" @click="saveEdit">
              <span v-if="saving" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Xác nhận
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <!-- Personal info card -->
      <Card class="flex-1 min-w-0">
        <CardContent class="px-6 py-6">
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-8">
            <InfoRow label="Tình trạng hôn nhân"          :value="p.marital_status" />
            <InfoRow label="Địa chỉ email"                :value="p.email" />
            <InfoRow label="Email cá nhân"                :value="p.personal_email" />
            <InfoRow label="Số điện thoại"                :value="p.phone_number || p.phone" />
            <InfoRow label="Nguyên quán / Nơi sinh"       :value="p.user_birth_place || p.place_of_birth" />
            <InfoRow label="Số CMND/CCCD"                 :value="p.identity_card" />
            <InfoRow label="Loại giấy tờ"                 :value="idTypeLabel" />
            <InfoRow label="Ngày cấp"                     :value="p.date_of_identity_card ? formatDate(p.date_of_identity_card) : undefined" />
            <InfoRow label="Nơi cấp giấy tờ"              :value="p.place_of_issue" />
            <InfoRow label="Mã số thuế"                   :value="p.tax_code" />
            <InfoRow label="Quốc tịch"                    :value="p.country" />
            <InfoRow label="Dân tộc"                      :value="p.nation" />
            <InfoRow label="Tôn giáo"                     :value="p.religion" />
            <InfoRow label="Hộ khẩu thường trú"           :value="p.permanent_residence" class="col-span-2" />
            <InfoRow label="Địa chỉ hiện tại"             :value="p.current_address" class="col-span-2" />
            <InfoRow label="Số tài khoản VietcomBank"     :value="p.account_number_vcb" />
            <InfoRow label="Số sổ BHXH (nếu có)"         :value="p.book_number_bhxh" />

            <!-- Divider row -->
            <div class="col-span-2 sm:col-span-3 lg:col-span-4 border-t border-dashed border-gray-200 pt-2">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Liên hệ khẩn cấp</span>
            </div>

            <InfoRow label="Họ tên người liên hệ khẩn cấp"     :value="p.name_of_emergency" />
            <InfoRow label="Quan hệ"                            :value="p.relationships_of_emergency" />
            <InfoRow label="Địa chỉ người liên hệ khẩn cấp"    :value="p.address_of_emergency" class="col-span-2" />
            <InfoRow label="Hiệu xe và biển số xe máy"          :value="p.license_plates" />
          </div>
        </CardContent>
      </Card>

      </div><!-- end side-by-side row -->

      <!-- ── ROW 2: Collapsible sections ── -->
      <CollapsibleSection title="Học vấn / Chứng chỉ">
        <div v-if="p.education?.length">
          <div
            v-for="(item, idx) in p.education"
            :key="idx"
            class="px-5 py-5 text-xs"
            :class="idx < p.education.length - 1 ? 'border-b border-gray-200' : ''"
          >
            <div class="mb-3">
              <span class="font-bold">{{ item.title }}</span>
              <span class="ml-2 text-muted-foreground">({{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }})</span>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-2">
              <div><div class="font-bold mb-1">Trình độ học vấn</div><div>{{ item.academic_level }}</div></div>
              <div><div class="font-bold mb-1">Chuyên ngành</div><div>{{ item.major }}</div></div>
              <div><div class="font-bold mb-1">Chuyên sâu</div><div>{{ item.specialize }}</div></div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div><div class="font-bold mb-1">Chứng chỉ</div><div>{{ item.achievement }}</div></div>
              <div><div class="font-bold mb-1">Xếp loại</div><div>{{ item.rank }}</div></div>
              <div><div class="font-bold mb-1">Nơi cấp / Trường học</div><div>{{ item.university }}</div></div>
            </div>
            <div v-if="item.description" class="mt-2">
              <div class="font-bold mb-1">Mô tả</div>
              <div>{{ item.description }}</div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Kinh nghiệm làm việc">
        <div v-if="p.experience?.length" class="px-4 py-4">
          <table
            v-for="(exp, i) in p.experience"
            :key="i"
            class="w-full text-xs border border-gray-300 mb-4"
          >
            <thead>
              <tr class="bg-gray-200">
                <th colspan="3" class="text-left px-3 py-2 uppercase font-bold">{{ exp.company }}</th>
              </tr>
              <tr>
                <th class="border border-gray-300 px-2 py-1 text-center w-[20%] bg-yellow-100">Thời gian</th>
                <th class="border border-gray-300 px-2 py-1 text-center w-[20%] bg-yellow-100">Vị trí</th>
                <th class="border border-gray-300 px-2 py-1 text-center bg-yellow-100">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(proj, j) in exp.projects" :key="j">
                <td class="border border-gray-300 px-2 py-1 text-center">({{ formatDate(proj.start_date) }} - {{ formatDate(proj.end_date) }})</td>
                <td class="border border-gray-300 px-2 py-1 text-center">{{ proj.position }}</td>
                <td class="border border-gray-300 px-2 py-1 whitespace-pre-line">{{ proj.technology || proj.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Ngoại ngữ">
        <div v-if="p.language?.length" class="px-5 py-4 text-xs space-y-3">
          <div v-for="(lang, i) in p.language" :key="i">
            <div class="font-bold mb-1">{{ profileStore.languageName(lang.language_id) }}</div>
            <div class="grid grid-cols-2 gap-2 text-gray-400">
              <div>{{ profileStore.levelLanguageName(lang.level_id) }}</div>
              <div>Chứng chỉ: {{ lang.certificate }}</div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Kỹ năng">
        <div v-if="p.skill?.length" class="px-5 py-4 text-xs space-y-4">
          <div v-for="(sk, i) in p.skill" :key="i">
            <p class="font-bold mb-2">{{ sk.title }}</p>
            <p class="text-gray-400">Số năm kinh nghiệm: {{ sk.years_of_experience }}</p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Lĩnh vực quan tâm">
        <div v-if="p.interest_technology?.length" class="px-5 py-4">
          <ul class="list-disc pl-4 text-xs space-y-3">
            <li v-for="(tech, i) in p.interest_technology" :key="i">{{ tech.technology_name }}</li>
          </ul>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Giải thưởng / Thành tích">
        <div v-if="p.award?.length" class="px-5 py-4">
          <div class="flex flex-wrap gap-4 text-xs">
            <div v-for="(aw, i) in p.award" :key="i" class="w-full sm:w-[calc(50%-8px)] lg:w-[calc(33%-8px)]">
              <p class="font-bold">{{ aw.title }}</p>
              <p class="whitespace-pre-line">{{ aw.description }}</p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Giới thiệu bản thân">
        <div v-if="p.introduce" class="px-5 py-4 text-xs whitespace-pre-line">
          {{ p.introduce }}
        </div>
      </CollapsibleSection>

    </template>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore — pdfmake ships without bundled types
import pdfMake from 'pdfmake/build/pdfmake'
// @ts-ignore
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { useUserProfileStore } from '~/stores/user-profile'
import { formatDate } from '~/utils/date'
import { getInitials } from '~/utils/format'
import { isAdmin } from '~/utils/permission'
import Card from '~/components/ui/Card.vue'
import CardContent from '~/components/ui/CardContent.vue'
import Avatar from '~/components/ui/Avatar.vue'
import AvatarFallback from '~/components/ui/AvatarFallback.vue'
import AvatarImage from '~/components/ui/AvatarImage.vue'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '~/components/ui/sheet'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

// ── FormField component (inline) ─────────────────────────────────────────────
const FormField = defineComponent({
  props: { label: String, required: Boolean },
  setup(props, { slots }) {
    return () => h('div', { class: 'space-y-1.5' }, [
      h('label', { class: 'block text-xs font-medium text-gray-700' }, [
        props.label,
        props.required ? h('span', { class: 'text-red-500 ml-0.5' }, '*') : null,
      ]),
      slots.default?.(),
    ])
  },
})

// ── Collapsible section component (inline) ───────────────────────────────────
const CollapsibleSection = defineComponent({
  props: { title: String },
  setup(props, { slots }) {
    const open = ref(true)
    return () => h('div', { class: 'block-card rounded-lg border border-gray-200 bg-white shadow-sm text-sm' }, [
      h('div',
        {
          class: 'flex items-center justify-between cursor-pointer px-4 py-3 border-b border-gray-200 select-none',
          onClick: () => { open.value = !open.value },
        },
        [
          h('span', { class: 'font-semibold text-sky-500' }, props.title),
          h('i', { class: open.value ? 'fas fa-chevron-up text-gray-400' : 'fas fa-chevron-down text-gray-400' }),
        ]
      ),
      open.value ? h('div', {}, slots.default?.()) : null,
    ])
  },
})

// ── InfoRow component (inline) ────────────────────────────────────────────────
const InfoRow = defineComponent({
  props: { label: String, value: String },
  setup(props) {
    return () => h('div', {}, [
      h('span', { class: 'block text-xs font-bold text-gray-400 tracking-wide mb-3' }, props.label),
      h('span', { class: 'block text-xs font-normal text-black min-h-[15px]' }, props.value || ''),
    ])
  },
})

// ── Setup ─────────────────────────────────────────────────────────────────────
const route        = useRoute()
const router       = useRouter()
const { user }     = useAuth()
const profileStore = useUserProfileStore()

const p       = computed(() => profileStore.profile)
const loading = ref(true)
const error   = ref('')

useHead(computed(() => ({ title: p.value?.full_name ? `${p.value.full_name} — Micro ERP` : 'Hồ sơ nhân viên' })))

const canEdit = computed(() => isAdmin(user.value) || user.value?.id === (p.value?.user_id ?? p.value?.id))

const USER_STATUS: Record<number, string> = { 1: 'Đang làm việc', 2: 'Onsite', 3: 'Nghỉ việc' }
const ID_TYPE: Record<number, string>    = { 1: 'Chứng Minh Nhân Dân', 2: 'Căn Cước Công Dân' }
const JOBTITLE: Record<number, string>   = {
  1: 'Giám đốc', 2: 'Quản lý', 3: 'Phó quản lý', 4: 'Kỹ sư', 5: 'Trợ lý',
  6: 'Bán thời gian', 7: 'Thực tập sinh', 8: 'Phó giám đốc', 9: 'Trưởng nhóm',
  10: 'Thiết kế', 11: 'Khác',
}

const statusLabel  = computed(() => p.value?.status ? (USER_STATUS[p.value.status] ?? '—') : 'Đang làm việc')
const idTypeLabel  = computed(() => p.value?.id_type ? (ID_TYPE[p.value.id_type] ?? '—') : '')
const jobTitleLabel = computed(() => {
  if (!p.value) return '—'
  if (p.value.job_position) return p.value.job_position
  if (typeof p.value.job_title === 'number') return JOBTITLE[p.value.job_title] ?? '—'
  return p.value.job_title || p.value.job_title_name || '—'
})
const roleLabel = computed(() => {
  const rid = p.value?.role_id
  if (!rid) return 'user'
  if (rid >= 3) return 'Tổng quản lý'
  if (rid >= 2) return 'Quản lý'
  return 'user'
})

const avatarSrc = computed(() => {
  if (!p.value?.avatar) return ''
  if (p.value.avatar.startsWith('data:')) return p.value.avatar
  if (p.value.avatar.startsWith('http')) return p.value.avatar
  return `data:image/png;base64,${p.value.avatar}`
})

onMounted(async () => {
  const id = Number(route.params.id) || user.value?.id
  if (!id) { router.replace('/home-admin'); return }
  try {
    await Promise.all([
      profileStore.fetchProfile(id),
      profileStore.fetchListItems(),
    ])
  } catch (err: any) {
    error.value = err?.message ?? 'Không thể tải hồ sơ.'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  profileStore.resetProfile()
})

// ── Edit Sheet ────────────────────────────────────────────────────────────────
const sheetOpen = ref(false)
const editForm  = ref<Record<string, any> | null>(null)
const saving    = ref(false)
const saveError = ref('')

const branchList   = computed<Record<string, string>>(() => profileStore.listItems?.branch_list    ?? {})
const rankList     = computed<Record<string, string>>(() => profileStore.listItems?.rank_list       ?? {})
const jobTitleList = computed<Record<string, string>>(() => profileStore.listItems?.job_title_list  ?? {})

function openEdit() {
  const d = p.value
  if (!d) return
  editForm.value = {
    first_name:                   d.first_name ?? '',
    last_name:                    d.last_name  ?? '',
    employee_id:                  d.employee_id ?? '',
    role_id:                      d.role_id ?? 1,
    branch:                       d.branch ?? d.branch_id ?? '',
    birthday:                     d.birthday ?? d.date_of_birth ?? '',
    gender:                       d.gender ?? '',
    company_joined_date:          d.company_joined_date ?? d.start_date ?? '',
    job_title:                    typeof d.job_title === 'number' ? d.job_title : '',
    department:                   d.department ?? '',
    work_place:                   d.work_place ?? '',
    rank:                         typeof d.rank === 'number' ? d.rank : '',
    marital_status:               d.marital_status ?? '',
    personal_email:               d.personal_email ?? '',
    phone_number:                 d.phone_number ?? d.phone ?? '',
    identity_card:                d.identity_card ?? '',
    id_type:                      d.id_type ?? 1,
    date_of_identity_card:        d.date_of_identity_card ?? '',
    user_birth_place:             d.user_birth_place ?? d.place_of_birth ?? '',
    place_of_issue:               d.place_of_issue ?? '',
    country:                      d.country ?? '',
    nation:                       d.nation ?? '',
    religion:                     d.religion ?? '',
    tax_code:                     d.tax_code ?? '',
    permanent_residence:          d.permanent_residence ?? '',
    current_address:              d.current_address ?? '',
    account_number_vcb:           d.account_number_vcb ?? '',
    book_number_bhxh:             d.book_number_bhxh ?? '',
    name_of_emergency:            d.name_of_emergency ?? '',
    relationships_of_emergency:   d.relationships_of_emergency ?? '',
    address_of_emergency:         d.address_of_emergency ?? '',
    license_plates:               d.license_plates ?? '',
  }
  saveError.value = ''
  sheetOpen.value = true
}

async function saveEdit() {
  if (!editForm.value || !p.value) return
  saving.value    = true
  saveError.value = ''
  try {
    await profileStore.updateProfile({
      ...editForm.value,
      user_id: p.value.user_id ?? p.value.id,
    })
    sheetOpen.value = false
  } catch (err: any) {
    saveError.value = err?.message ?? 'Lưu không thành công.'
  } finally {
    saving.value = false
  }
}

// ── PDF Export ────────────────────────────────────────────────────────────────
function exportPDF() {
  if (!p.value) return
  pdfMake.vfs = pdfFonts.pdfMake?.vfs ?? (pdfFonts as any).vfs

  const d = p.value
  const fullName = d.full_name || `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim()

  const basicInfo: any = {
    columns: [
      {
        width: '50%',
        stack: [
          ...(avatarSrc.value ? [{ image: avatarSrc.value, width: 100, height: 100, style: 'textCenter' }] : []),
          { text: fullName, margin: [0, 20, 0, 10], style: ['header', 'textCenter'] },
        ],
      },
      {
        width: '50%',
        stack: [
          { columns: [{ text: 'Birthday', bold: true, width: '35%', margin: [0, 5, 0, 5] }, { text: d.birthday || '', margin: [0, 5, 0, 5] }] },
          { columns: [{ text: 'Phone', bold: true, width: '35%', margin: [0, 5, 0, 5] }, { text: d.phone_number || d.phone || '', margin: [0, 5, 0, 5] }] },
          { columns: [{ text: 'Email', bold: true, width: '35%', margin: [0, 5, 0, 5] }, { text: d.email || '', margin: [0, 5, 0, 5] }] },
        ],
      },
    ],
  }

  const makeSection = (title: string, content: any) => [
    { text: title, margin: [0, 30, 0, 10], style: 'heading1' },
    content,
  ]

  const educationTable = d.education?.length ? {
    table: {
      widths: ['30%', '70%'],
      body: [
        [{ text: 'Từ - Đến', bold: true, style: 'textCenter', fillColor: '#ffcc7c' }, { text: 'Trường', bold: true, style: 'textCenter', fillColor: '#ffcc7c' }],
        ...d.education.map(e => [
          `${e.start_date ? formatDate(e.start_date) : ''} - ${e.end_date ? formatDate(e.end_date) : ''}`,
          { stack: [e.university, e.major, e.rank, e.description].filter(Boolean).map(t => ({ text: t, margin: [0, 0, 0, 5] })) },
        ]),
      ],
    },
  } : {}

  const skillTable = d.skill?.length ? {
    table: {
      widths: ['30%', '70%'],
      body: d.skill.map(s => [
        { text: s.title, bold: true, style: 'textCenter' },
        { stack: [{ columns: [{ text: 'Số năm kinh nghiệm', bold: true, width: '50%' }, { text: `: ${s.years_of_experience}` }] }] },
      ]),
    },
  } : {}

  const experiencePdf: any[] = []
  if (d.experience?.length) {
    d.experience.forEach(exp => {
      experiencePdf.push({
        margin: [0, 0, 0, 15],
        table: {
          widths: ['15%', '50%', '35%'],
          body: [
            [{ text: `Công ty: ${exp.company}`, colSpan: 3, bold: true, fillColor: '#81b27f', style: 'heading2' }, {}, {}],
            [
              { text: 'Thời gian', bold: true, style: 'textCenter', fillColor: '#ffcc7c' },
              { text: 'Mô tả', bold: true, style: 'textCenter', fillColor: '#ffcc7c' },
              { text: 'Vị trí', bold: true, style: 'textCenter', fillColor: '#ffcc7c' },
            ],
            ...exp.projects.map(pr => [
              `${formatDate(pr.start_date)} - ${formatDate(pr.end_date)}`,
              pr.technology || pr.description,
              pr.position,
            ]),
          ],
        },
      })
    })
  }

  const languageTable = d.language?.length ? {
    table: {
      widths: ['30%', '30%', '40%'],
      body: [
        [
          { text: 'Ngôn ngữ', bold: true, style: 'textCenter', fillColor: '#ffcc7c' },
          { text: 'Trình độ', bold: true, style: 'textCenter', fillColor: '#ffcc7c' },
          { text: 'Chứng chỉ', bold: true, style: 'textCenter', fillColor: '#ffcc7c' },
        ],
        ...d.language.map(l => [
          profileStore.languageName(l.language_id),
          profileStore.levelLanguageName(l.level_id),
          l.certificate,
        ]),
      ],
    },
  } : {}

  const technologyList = d.interest_technology?.length
    ? { ul: d.interest_technology.map(t => ({ text: t.technology_name, margin: [0, 0, 0, 10] })) }
    : {}

  const awardTable = d.award?.length ? {
    table: {
      widths: ['40%', '60%'],
      body: [
        [{ text: 'Giải thưởng', bold: true, style: 'textCenter', fillColor: '#ffcc7c' }, { text: 'Mô tả', bold: true, style: 'textCenter', fillColor: '#ffcc7c' }],
        ...d.award.map(a => [a.title, a.description]),
      ],
    },
  } : {}

  const docDefinition: any = {
    content: [
      basicInfo,
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
      ...(d.introduce ? makeSection('GIỚI THIỆU', { alignment: 'justify', text: d.introduce }) : []),
      ...(d.education?.length ? makeSection('HỌC VẤN', educationTable) : []),
      ...(d.skill?.length ? makeSection('KỸ NĂNG', skillTable) : []),
      ...(d.experience?.length ? makeSection('KINH NGHIỆM', ...experiencePdf) : []),
      ...(d.language?.length ? makeSection('NGOẠI NGỮ', languageTable) : []),
      ...(d.interest_technology?.length ? makeSection('LĨNH VỰC QUAN TÂM', technologyList) : []),
      ...(d.award?.length ? makeSection('GIẢI THƯỞNG', awardTable) : []),
    ],
    styles: {
      header:    { fontSize: 28, bold: true },
      heading1:  { fontSize: 18, bold: true },
      heading2:  { fontSize: 16, bold: true },
      textCenter: { alignment: 'center' },
    },
  }

  pdfMake.createPdf(docDefinition).download(`${fullName.replace(/\s+/g, '_')}_profile.pdf`)
}
</script>

<style scoped>
.field-input {
  display: flex;
  height: 2.5rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--input));
  background-color: hsl(var(--background));
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: box-shadow 0.15s;
}
.field-input:focus {
  box-shadow: 0 0 0 2px hsl(var(--ring));
}
textarea.field-input {
  height: auto;
}
</style>
