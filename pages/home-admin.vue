<template>
  <div>
    <!-- Welcome banner -->
    <div class="mb-6 rounded-2xl bg-gradient-to-r from-primary-600 to-sky-500 px-6 py-5 text-white shadow-sm flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium opacity-80">{{ greeting }},</p>
        <h2 class="mt-0.5 text-2xl font-bold">{{ user?.full_name ?? '...' }}</h2>
        <p class="mt-1 text-sm opacity-70">{{ formattedDate }}</p>
      </div>

      <!-- Right side: remind or quick actions -->
      <div class="shrink-0 flex flex-col items-end gap-2">
        <!-- Remind check-in -->
        <template v-if="bannerAction === 'checkin'">
          <p class="text-sm font-medium opacity-90">Bạn chưa chấm công hôm nay!</p>
          <button
            class="flex items-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-semibold transition-colors"
            :disabled="tkLoading"
            @click="doCheckIn"
          >
            <AppSpinner v-if="tkLoading" class="h-4 w-4" />
            <LogIn v-else class="h-4 w-4" />
            Chấm công vào
          </button>
        </template>

        <!-- Remind check-out -->
        <template v-else-if="bannerAction === 'checkout'">
          <p class="text-sm font-medium opacity-90">Bạn chưa chấm công ra!</p>
          <button
            class="flex items-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-semibold transition-colors"
            :disabled="tkLoading"
            @click="doCheckOut"
          >
            <AppSpinner v-if="tkLoading" class="h-4 w-4" />
            <LogOut v-else class="h-4 w-4 scale-x-[-1]" />
            Chấm công ra
          </button>
        </template>

        <!-- Quick actions (all done) -->
        <template v-else>
          <p class="text-sm font-medium opacity-80">Thao tác nhanh</p>
          <div class="flex gap-2 flex-wrap justify-end">
            <NuxtLink
              to="/timekeeping"
              class="flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <Clock class="h-4 w-4" />
              Chấm công
            </NuxtLink>
            <NuxtLink
              to="/leave/create"
              class="flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <FileText class="h-4 w-4" />
              Tạo đơn nghỉ
            </NuxtLink>
            <NuxtLink
              to="/leave"
              class="flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <CalendarCheck class="h-4 w-4" />
              Ngày phép
            </NuxtLink>
          </div>
        </template>
      </div>
    </div>

    <!-- Stat cards (3-column layout) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Total Employees -->
      <Card>
        <CardContent class="flex flex-col gap-3 p-6">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tổng nhân viên</span>
            <div class="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Users class="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-3xl font-bold text-primary">
              <AppSpinner v-if="statsLoading.totalEmployees" />
              <template v-else>{{ totalEmployees }}</template>
            </span>
            <div v-if="!statsLoading.totalEmployees && numberPeopleBranch.length" class="mt-2 flex flex-col gap-1.5">
              <div v-for="item in numberPeopleBranch" :key="item.branch" class="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-1.5">
                <span class="font-medium">{{ item.branch }}</span>
                <span>{{ item.amount }} nhân viên</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Running Projects -->
      <Card>
        <CardContent class="flex flex-col gap-3 p-6">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dự án đang chạy</span>
            <div class="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <FolderKanban class="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-3xl font-bold text-primary">
              <AppSpinner v-if="statsLoading.runningProjects" />
              <template v-else>{{ runningProjects }}</template>
            </span>
            <span class="text-xs text-muted-foreground">Dự án hoạt động</span>
          </div>
        </CardContent>
      </Card>

      <!-- Current Evaluation Period -->
      <Card>
        <CardContent class="flex flex-col gap-3 p-6">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Kỳ đánh giá</span>
            <div class="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <Star class="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-3xl font-bold text-primary">
              <AppSpinner v-if="statsLoading.currentEvaluation" />
              <template v-else>{{ currentEvaluationPeriod }}</template>
            </span>
            <span class="text-xs text-muted-foreground">Kỳ đánh giá năm</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Tabs Layout -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="bg-transparent border-b border-border rounded-none h-auto p-0 justify-start gap-6 mb-6">
        <TabsTrigger
          v-for="tab in tabItems"
          :key="tab.value"
          :value="tab.value"
          class="rounded-none border-b-2 border-transparent text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base font-semibold transition-all"
        >
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>

      <!-- Tab 1: Thông tin công ty -->
      <TabsContent value="company" class="mt-0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Nhắc nhở -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Nhắc nhở</CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-4">
                <li v-for="rem in reminders" :key="rem.id" class="flex items-center gap-3">
                  <span :class="['h-2 w-2 rounded-full shrink-0', rem.color]" />
                  <span class="text-sm text-foreground flex-1">{{ rem.text }}</span>
                  <span class="text-xs text-muted-foreground">{{ rem.date }}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <!-- Thông báo gần đây -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Thông báo gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="loadingNotifs" class="flex justify-center py-6">
                <AppSpinner />
              </div>
              <ul v-else-if="recentNotifs.length" class="divide-y divide-border -mx-6 px-6">
                <li v-for="n in recentNotifs" :key="n.id" class="py-3 flex items-start gap-3">
                  <span :class="['mt-1.5 h-2 w-2 rounded-full shrink-0', n.status === 1 ? 'bg-primary-500' : 'bg-muted']" />
                  <div class="min-w-0">
                    <p class="text-sm text-foreground truncate">{{ n.content }}</p>
                    <p v-if="n.sender" class="text-xs text-muted-foreground truncate">{{ n.sender }}</p>
                    <p class="text-xs text-muted-foreground mt-0.5">{{ fromNow(n.created_at) }}</p>
                  </div>
                </li>
              </ul>
              <p v-else class="text-sm text-muted-foreground text-center py-4">Không có thông báo mới</p>
            </CardContent>
          </Card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Nhân viên theo chức vụ -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Nhân viên theo chức vụ</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <template v-if="numberPeopleJobTitle.length">
                <div
                  v-for="item in [...numberPeopleJobTitle].sort((a, b) => b.amount - a.amount)"
                  :key="item.job_title"
                  class="flex items-center gap-3"
                >
                  <span class="text-sm text-foreground w-36 shrink-0 truncate">{{ item.job_title }}</span>
                  <div class="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-primary to-sky-400 transition-all duration-500"
                      :style="{ width: `${Math.round(item.amount / Math.max(...numberPeopleJobTitle.map(x => x.amount)) * 100)}%` }"
                    />
                  </div>
                  <span class="text-sm font-semibold text-primary w-8 text-right shrink-0">{{ item.amount }}</span>
                </div>
              </template>
              <p v-else class="text-sm text-muted-foreground text-center py-4">Không có dữ liệu</p>
            </CardContent>
          </Card>

          <!-- Nhân viên theo trình độ tiếng Nhật -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Nhân viên theo trình độ tiếng Nhật</CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="numberPeopleJapaneseLevel.length" class="grid grid-cols-3 gap-3">
                <div
                  v-for="(item, i) in [...numberPeopleJapaneseLevel].sort((a, b) => b.amount - a.amount)"
                  :key="item.certificate"
                  class="flex flex-col items-center justify-center rounded-xl border border-border py-4 gap-1"
                  :class="[
                    i === 0 ? 'bg-primary/8 border-primary/30' :
                    i === 1 ? 'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800' :
                    'bg-muted/40'
                  ]"
                >
                  <span class="text-xl font-bold" :class="i === 0 ? 'text-primary' : i === 1 ? 'text-sky-500' : 'text-foreground'">
                    {{ item.amount }}
                  </span>
                  <span class="text-xs text-muted-foreground font-medium">{{ item.certificate || 'Không có' }}</span>
                </div>
              </div>
              <p v-else class="text-sm text-muted-foreground text-center py-4">Không có dữ liệu</p>
            </CardContent>
          </Card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Nhân viên theo công nghệ quan tâm -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Nhân viên theo công nghệ quan tâm</CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="numberPeopleInterestTechnology.length" class="flex flex-wrap gap-2">
                <div
                  v-for="item in [...numberPeopleInterestTechnology].sort((a, b) => b.amount - a.amount)"
                  :key="item.technology"
                  class="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <span class="text-sm font-medium text-foreground">{{ item.technology }}</span>
                  <span class="text-xs font-semibold text-primary bg-primary/10 rounded-full px-1.5 py-0.5 leading-none">{{ item.amount }}</span>
                </div>
              </div>
              <p v-else class="text-sm text-muted-foreground text-center py-4">Không có dữ liệu</p>
            </CardContent>
          </Card>

          <!-- Đánh giá 4 quý gần nhất -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Đánh giá 4 quý gần nhất</CardTitle>
            </CardHeader>
            <CardContent class="p-0">
              <div v-if="evaluationRank?.datetime?.length && evaluationRank?.datasets?.length" class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-border">
                      <th class="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Rank</th>
                      <th
                        v-for="dt in evaluationRank.datetime"
                        :key="dt"
                        class="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground"
                      >{{ dt }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(ds, i) in evaluationRank.datasets"
                      :key="ds.rank"
                      class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td class="px-4 py-2.5">
                        <span
                          class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
                          :style="{ backgroundColor: ['#176BA0','#1AC9E6','#1DE4BD','#c5a864','#DCDEDF','#ffcc00'][i % 6] }"
                        >{{ ds.rank }}</span>
                      </td>
                      <td
                        v-for="(val, j) in ds.data"
                        :key="j"
                        class="px-4 py-2.5 text-center font-medium"
                      >{{ val ?? 0 }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="text-sm text-muted-foreground text-center py-6">Không có dữ liệu</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- Tab 2: Thông tin của bạn -->
      <TabsContent value="personal" class="mt-0 space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 1. Thông tin liên hệ -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex items-center gap-3 text-sm">
                <Mail class="h-4 w-4 text-primary shrink-0" />
                <span class="text-muted-foreground w-28 shrink-0">Email</span>
                <span class="font-medium">{{ user?.email ?? '—' }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <Phone class="h-4 w-4 text-primary shrink-0" />
                <span class="text-muted-foreground w-28 shrink-0">Điện thoại</span>
                <span class="font-medium">{{ userProfileStore.profile?.phone ?? '—' }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <CalendarDays class="h-4 w-4 text-primary shrink-0" />
                <span class="text-muted-foreground w-28 shrink-0">Ngày sinh</span>
                <span class="font-medium">{{ userProfileStore.profile?.date_of_birth ?? '—' }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <Building2 class="h-4 w-4 text-primary shrink-0" />
                <span class="text-muted-foreground w-28 shrink-0">Chi nhánh</span>
                <span class="font-medium">{{ userProfileStore.profile?.branch_name ?? '—' }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- 2. Thông tin ngày nghỉ -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Thông tin ngày nghỉ</CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="leaveStore.loading" class="flex justify-center py-6">
                <AppSpinner />
              </div>
              <div v-else class="space-y-3">
                <div class="flex justify-between items-center text-sm border-b border-border pb-3">
                  <span class="text-muted-foreground">Đã nghỉ</span>
                  <span class="font-semibold text-red-500">{{ leaveStore.leaveInfo?.day_used ?? '—' }} ngày</span>
                </div>
                <div class="flex justify-between items-center text-sm border-b border-border pb-3">
                  <span class="text-muted-foreground">Còn lại</span>
                  <span class="font-semibold text-green-600">{{ leaveStore.leaveInfo?.day_remaining ?? '—' }} ngày</span>
                </div>
                <div class="flex justify-between items-center text-sm border-b border-border pb-3">
                  <span class="text-muted-foreground">Ngày phép thêm</span>
                  <span class="font-semibold text-primary">{{ leaveStore.leaveInfo?.day_bonus ?? '—' }} ngày</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-muted-foreground">Còn lại kỳ trước</span>
                  <span class="font-semibold">{{ leaveStore.leaveInfo?.day_remaining_previous ?? '—' }} ngày</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- 3. Hạng tăng trưởng -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Hạng tăng trưởng</CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <div v-if="!rankGrowthData.length" class="flex items-center justify-center h-32 text-sm text-muted-foreground">
              Chưa có dữ liệu hạng
            </div>
            <LineChart
              v-else
              :data="rankGrowthData"
              index="ngay"
              :categories="['rank']"
              class="h-[220px]"
              :show-legend="false"
              :y-formatter="(v) => String(v)"
            />
          </CardContent>
        </Card>

        <!-- 4. Dự án bạn tham gia -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Dự án bạn tham gia</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="loadingUserProjects" class="flex justify-center py-6">
              <AppSpinner />
            </div>
            <div v-else-if="!userProjects.length" class="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FolderKanban class="h-10 w-10 mb-2 opacity-20" />
              <p class="text-sm">Bạn chưa tham gia dự án nào</p>
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <NuxtLink
                v-for="project in userProjects"
                :key="project.project_id"
                :to="`/workflow/view-project/${project.project_id}`"
                class="rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <p class="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1 mb-2">{{ project.project_name }}</p>
                <div class="flex items-center text-xs text-muted-foreground">
                  <span>Tham gia: {{ project.joined_at ? project.joined_at.slice(0, 10) : '—' }}</span>
                </div>
              </NuxtLink>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Tab 3: Thông tin dự án -->
      <TabsContent value="project" class="mt-0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Số thành viên mỗi dự án</CardTitle>
            </CardHeader>
            <CardContent class="p-0">
              <div v-if="loadingProjectStats" class="flex justify-center py-8">
                <AppSpinner />
              </div>
              <div v-else-if="numberPeopleProject.length === 0" class="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <FolderKanban class="h-10 w-10 mb-2 opacity-20" />
                <p class="text-sm">Không có dữ liệu dự án</p>
              </div>
              <table v-else class="w-full text-sm">
                <tbody>
                  <tr
                    v-for="item in numberPeopleProject"
                    :key="item.project_id"
                    class="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                    @click="openProjectMemberModal(item)"
                  >
                    <td class="px-6 py-3 font-medium">{{ item.project_name }}</td>
                    <td class="px-6 py-3 text-center font-bold text-primary">{{ item.amount }}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <!-- Modal: member list per project -->
        <AppModal
          v-model="showProjectMemberModal"
          :title="`Danh sách thành viên${selectedManagerName ? ' — Quản lý: ' + selectedManagerName : ''}`"
          size="xl"
        >
          <div class="flex justify-end mb-3">
            <NuxtLink
              v-if="selectedProjectId"
              :to="`/workflow/view-project/${selectedProjectId}`"
              target="_blank"
              class="text-sm text-primary hover:underline"
            >
              Chi tiết dự án →
            </NuxtLink>
          </div>
          <div v-if="loadingProjectMembers" class="flex justify-center py-8">
            <AppSpinner />
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border text-muted-foreground text-left">
                  <th class="px-4 py-2 font-medium">Tên thành viên</th>
                  <th class="px-4 py-2 font-medium">Chi nhánh</th>
                  <th class="px-4 py-2 font-medium">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(member, idx) in projectMemberList"
                  :key="idx"
                  class="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer"
                  @click="onClickProfileDetail(member.user_id)"
                >
                  <td class="px-4 py-2">{{ projectUserBox.get(String(member.user_id)) ?? member.user_id }}</td>
                  <td class="px-4 py-2">{{ projectBranchBox.get(String(member.branch)) ?? member.branch }}</td>
                  <td class="px-4 py-2">{{ member.date_joined }}</td>
                </tr>
                <tr v-if="projectMemberList.length === 0">
                  <td colspan="3" class="px-4 py-6 text-center text-muted-foreground">Không có thành viên</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AppModal>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { Users, FolderKanban, Star, Mail, Phone, CalendarDays, Building2, LogIn, LogOut, Clock, FileText, CalendarCheck } from 'lucide-vue-next'
import { useLeaveStore }        from '~/stores/leave'
import { useUserProfileStore }  from '~/stores/user-profile'
import { useTimekeepingStore }  from '~/stores/timekeeping'
import { fromNow }              from '~/utils/date'
import Card from '~/components/ui/Card.vue'
import CardHeader from '~/components/ui/CardHeader.vue'
import CardTitle from '~/components/ui/CardTitle.vue'
import CardContent from '~/components/ui/CardContent.vue'
import Tabs from '~/components/ui/Tabs.vue'
import TabsList from '~/components/ui/TabsList.vue'
import TabsTrigger from '~/components/ui/TabsTrigger.vue'
import TabsContent from '~/components/ui/TabsContent.vue'
import AppSpinner from '~/components/ui/AppSpinner.vue'
import AppModal from '~/components/ui/AppModal.vue'
import { LineChart }  from '~/components/ui/chart-line'

import { useLayoutStore } from '~/stores/layout'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: 'Dashboard — Micro ERP' })

const { user }           = useAuth()
const { post }           = useApi()
const leaveStore         = useLeaveStore()
const userProfileStore   = useUserProfileStore()
const timekeepingStore   = useTimekeepingStore()
const layoutStore        = useLayoutStore()
const { fetchNotifications, fetchEventReminders, notificationCount } = useNotification()

const loadingNotifs = ref(true)
const recentNotifs  = ref<any[]>([])
const tkLoading     = ref(false)

// 'checkin' | 'checkout' | 'none'
const bannerAction = computed(() => {
  const rec = timekeepingStore.todayRecord
  if (!rec || !rec.check_in_time) return 'checkin'
  if (!rec.check_out_time) {
    // remind checkout after 17:30 server time
    const serverTime = rec.time_server ? new Date(rec.time_server) : new Date()
    const h = serverTime.getHours()
    const m = serverTime.getMinutes()
    if (h > 17 || (h === 17 && m >= 30)) return 'checkout'
  }
  return 'none'
})

async function doCheckIn() {
  tkLoading.value = true
  try {
    await timekeepingStore.checkIn()
    await timekeepingStore.fetchToday()
  } finally {
    tkLoading.value = false
  }
}

async function doCheckOut() {
  tkLoading.value = true
  try {
    await timekeepingStore.checkOut()
    await timekeepingStore.fetchToday()
  } finally {
    tkLoading.value = false
  }
}

// New stat cards data
const totalEmployees = ref(0)
const runningProjects = ref(0)
const currentEvaluationPeriod = ref('—')
const numberPeopleBranch = ref<{ branch: string; amount: number }[]>([])
const numberPeopleJobTitle = ref<{ job_title: string; amount: number }[]>([])
const numberPeopleJapaneseLevel = ref<{ certificate: string; amount: number }[]>([])
const numberPeopleInterestTechnology = ref<{ technology: string; amount: number }[]>([])
const evaluationRank = ref<{ datetime: string[]; datasets: any[] }>({ datetime: [], datasets: [] })
const userRankLogs = ref<{ rank: number; created_at: string }[]>([])

const statsLoading = ref({
  totalEmployees: true,
  runningProjects: true,
  currentEvaluation: true,
})

const activeTab = ref('company')
const tabItems = [
  { value: 'company',  label: 'Thông tin công ty' },
  { value: 'personal', label: 'Thông tin của bạn' },
  { value: 'project',  label: 'Thông tin dự án' },
]

const reminders = ref<{ id: number; text: string; date: string; color: string }[]>([])

// ── Unovis chart data (flat-array format) ─────────────────────────────────
type RankGrowthRow = { ngay: string; rank: number }

const rankGrowthData = ref<RankGrowthRow[]>([])

// ── Personal tab ─────────────────────────────────────────────────────────────
const userProjects        = ref<any[]>([])
const loadingUserProjects = ref(false)

// ── Greeting ────────────────────────────────────────────────────────────────
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
})

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
})

// ── Stat cards ───────────────────────────────────────────────────────────────
async function fetchStatCards() {
  try {
    const statRes = await post<any>('/statistic/general', {})
    const data = statRes.data

    if (data) {
      numberPeopleBranch.value = data.number_people_branch || []
      numberPeopleJobTitle.value = data.number_people_job_title || []
      numberPeopleJapaneseLevel.value = data.number_people_japanese_level || []
      numberPeopleInterestTechnology.value = data.number_people_interest_technology || []
      evaluationRank.value = {
        datetime: data.evaluation_rank?.datetime ?? [],
        datasets: data.evaluation_rank?.datasets ?? [],
      }
      userRankLogs.value = data.user_rank_logs || []
      totalEmployees.value = data.total?.users || 0
      runningProjects.value = data.total?.projects || 0

      rankGrowthData.value = userRankLogs.value.map(x => ({
        ngay: x.created_at.split(' ')[0],
        rank: x.rank,
      }))
    }
  } catch (e) {
    console.error(e)
  } finally {
    statsLoading.value.totalEmployees = false
    statsLoading.value.runningProjects = false
  }

  // Set current evaluation period (placeholder for now)
  currentEvaluationPeriod.value = new Date().getFullYear().toString()
  statsLoading.value.currentEvaluation = false
}

// ── Personal tab – user projects ─────────────────────────────────────────────
async function fetchUserProjects() {
  loadingUserProjects.value = true
  try {
    const res = await post<{ projects: any[] }>('/project/get-projects-assigned', {
      keyword: '',
      current_page: 1,
      row_per_page: 50,
    })
    userProjects.value = res.data?.projects ?? []
  } catch { /* silent */ } finally {
    loadingUserProjects.value = false
  }
}

// ── Project tab ──────────────────────────────────────────────────────────────
interface NumberPeopleProject { project_id: number; project_name: string; amount: number; managed_by: number }
interface UserBranchEntry { user_id: number; branch: number; date_joined: string }

const numberPeopleProject = ref<NumberPeopleProject[]>([])
const loadingProjectStats = ref(false)
const showProjectMemberModal = ref(false)
const selectedProjectId = ref(0)
const selectedManagerName = ref('')
const projectMemberList = ref<UserBranchEntry[]>([])
const projectUserBox = ref<Map<string, string>>(new Map())
const projectBranchBox = ref<Map<string, string>>(new Map())
const loadingProjectMembers = ref(false)

async function fetchProjectStats() {
  loadingProjectStats.value = true
  try {
    const res = await post<{ number_people_project: NumberPeopleProject[] }>(
      '/statistic/project-statistic-detail',
      { current_page: 1, row_per_page: 50, total_row: 0 },
    )
    numberPeopleProject.value = res.data?.number_people_project ?? []
  } catch (e) {
    console.error(e)
  } finally {
    loadingProjectStats.value = false
  }
}

async function openProjectMemberModal(item: NumberPeopleProject) {
  selectedProjectId.value = item.project_id
  showProjectMemberModal.value = true
  loadingProjectMembers.value = true
  try {
    const res = await post<{ user_box: Record<string, string>; branch_box: Record<string, string>; user_branch_list: UserBranchEntry[] }>(
      '/user-project/get-user-project',
      { project_id: item.project_id },
    )
    projectUserBox.value = new Map(Object.entries(res.data?.user_box ?? {}))
    projectBranchBox.value = new Map(Object.entries(res.data?.branch_box ?? {}))
    projectMemberList.value = res.data?.user_branch_list ?? []
    selectedManagerName.value = projectUserBox.value.get(String(item.managed_by)) ?? ''
  } catch (e) {
    console.error(e)
  } finally {
    loadingProjectMembers.value = false
  }
}

function onClickProfileDetail(userId: number) {
  window.open(`/hrm/member/view-profile/${userId}`, '_blank')
}

// ── Boot ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  layoutStore.setPageTitle('Tổng quan / Bảng điều khiển')
  await Promise.all([
    leaveStore.fetchLeaveInfo(),
    timekeepingStore.fetchToday(),
    fetchStatCards(),
    fetchProjectStats(),
    fetchUserProjects(),
    user.value?.id ? userProfileStore.fetchProfile(user.value.id) : Promise.resolve(),
  ])

  try {
    recentNotifs.value = await fetchNotifications(1, 5)
    
    // Fetch and map reminders
    const remindersData = await fetchEventReminders()
    if (remindersData) {
      const arr = []
      let id = 1
      for (const item of (remindersData.bithday_list || [])) {
        arr.push({ id: id++, text: `Sinh nhật ${item.fullname}`, date: item.birthday, color: 'bg-amber-500' })
      }
      for (const item of (remindersData.company_join_date_list || [])) {
        arr.push({ id: id++, text: `Vào công ty ${item.fullname}`, date: item.company_joined_date, color: 'bg-blue-500' })
      }
      for (const item of (remindersData.contract_remind_list || [])) {
        arr.push({ id: id++, text: `Gia hạn hợp đồng ${item.fullname}`, date: item.contract_expiration_date, color: 'bg-green-500' })
      }
      reminders.value = arr
    }
  } finally {
    loadingNotifs.value = false
  }
})
</script>
