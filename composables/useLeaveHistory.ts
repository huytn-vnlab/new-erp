// composables/useLeaveHistory.ts
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import isBetween from 'dayjs/plugin/isBetween'
import { slugify } from '~/utils/slugify'

dayjs.extend(isoWeek)
dayjs.extend(isBetween)

export interface UserLeave {
  user_id:       number
  first_name:    string
  last_name:     string
  avatar:        string | null
  leave_request: LeaveRequest[]
}

export interface LeaveRequest {
  leave_request_type_id:    number
  subtract_day_off_type_id: number
  date_time_leave_from:     string
  date_time_leave_to:       string
}

export interface LeaveHistoryPagination {
  current_page: number
  total_row:    number
  row_per_page: number
}

export function useLeaveHistory() {
  const { post } = useApi()
  const route    = useRoute()
  const router   = useRouter()

  // ── State ──────────────────────────────────────────────────────────────────
  const loading             = ref(false)
  const userLeaveList       = ref<UserLeave[]>([])
  const userList            = ref<Map<string, string>>(new Map())
  const leaveRequestTypes   = ref<Map<string, string>>(new Map())
  const subtractDayOffTypes = ref<Map<string, string>>(new Map())
  const pagination          = ref<LeaveHistoryPagination>({ current_page: 1, total_row: 0, row_per_page: 10 })

  // Filter fields
  const memberNameInput = ref('')
  const selectedUserId  = ref(0)
  const dateFrom        = ref('')   // YYYY-MM-DD
  const dateTo          = ref('')   // YYYY-MM-DD
  const currentPage     = ref(1)

  // Week navigation
  const weekOffset  = ref(0)
  const anchorDate  = ref<dayjs.Dayjs>(dayjs())
  const datesOfWeek = computed<dayjs.Dayjs[]>(() => {
    const monday = anchorDate.value.add(weekOffset.value, 'week').isoWeekday(1)
    return Array.from({ length: 7 }, (_, i) => monday.add(i, 'day'))
  })

  // Member autocomplete
  const userListSearching = computed<string[]>(() => {
    const q = memberNameInput.value
    const result: string[] = []
    userList.value.forEach((name, id) => {
      if (!q || slugify(name).includes(slugify(q))) result.push(id)
    })
    return result
  })

  // ── API ────────────────────────────────────────────────────────────────────
  async function search() {
    loading.value = true
    try {
      const dateOfWeek = datesOfWeek.value.map(d => d.format('YYYY-MM-DD'))
      const res = await post<{
        user_leave:             UserLeave[]
        user_list:              Record<string, string>
        leave_request_types:    Record<string, string>
        subtract_day_off_types: Record<string, string>
        pagination:             LeaveHistoryPagination
      }>('/leave/get-leave-history', {
        id:                       0,
        user_id:                  selectedUserId.value,
        user_name:                memberNameInput.value,
        datetime_leave_from:      dateFrom.value,
        datetime_leave_to:        dateTo.value,
        subtract_day_off_type_id: 0,
        date_of_week:             dateOfWeek,
        current_page:             currentPage.value,
      })

      const data = res.data
      userLeaveList.value       = data?.user_leave                              ?? []
      userList.value            = new Map(Object.entries(data?.user_list            ?? {}))
      leaveRequestTypes.value   = new Map(Object.entries(data?.leave_request_types  ?? {}))
      subtractDayOffTypes.value = new Map(Object.entries(data?.subtract_day_off_types ?? {}))
      pagination.value          = data?.pagination                              ?? pagination.value

      // Resolve member name from fetched user list (mirrors old SPA's getUserNameByKey call)
      if (selectedUserId.value && !memberNameInput.value) {
        memberNameInput.value = userList.value.get(String(selectedUserId.value)) ?? ''
      }
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // ── Week navigation ────────────────────────────────────────────────────────
  function prevWeek() {
    weekOffset.value -= 1
    search()
  }

  function nextWeek() {
    weekOffset.value += 1
    search()
  }

  const rangeLabel = computed(() => {
    const first = datesOfWeek.value[0]
    const last  = datesOfWeek.value[6]
    return `${first.format('YYYY/MM/DD')} - ${last.format('YYYY/MM/DD')}`
  })

  // ── Member selection ───────────────────────────────────────────────────────
  function selectMember(id: string) {
    selectedUserId.value  = parseInt(id)
    memberNameInput.value = userList.value.get(id) ?? ''
  }

  function clearMember() {
    selectedUserId.value  = 0
    memberNameInput.value = ''
  }

  // ── Date helpers ───────────────────────────────────────────────────────────
  function leaveCoversDay(leave: LeaveRequest, day: dayjs.Dayjs): boolean {
    const from = dayjs(leave.date_time_leave_from.split(' ')[0], 'YYYY/MM/DD')
    const to   = dayjs(leave.date_time_leave_to.split(' ')[0],   'YYYY/MM/DD')
    return day.isBetween(from, to, 'day', '[]')
  }

  function timeOf(dt: string): string {
    const parts = dt.split(' ')
    return parts[1] ? parts[1].slice(0, 5) : ''
  }

  // ── Apply filter ───────────────────────────────────────────────────────────
  function applyFilter() {
    weekOffset.value = 0
    anchorDate.value = dateFrom.value ? dayjs(dateFrom.value) : dayjs()
    currentPage.value = 1
    search()
    syncUrl()
  }

  function syncUrl() {
    const q: Record<string, string> = { current_page: String(currentPage.value) }
    if (memberNameInput.value) q.user_name = memberNameInput.value
    if (selectedUserId.value)  q.user_id   = String(selectedUserId.value)
    if (dateFrom.value)        q.date_from = dateFrom.value
    if (dateTo.value)          q.date_to   = dateTo.value
    router.replace({ query: q })
  }

  function goToPage(page: number) {
    currentPage.value = page
    search()
  }

  // ── Bootstrap from URL query ───────────────────────────────────────────────
  function initFromQuery() {
    const q = route.query
    memberNameInput.value = q.user_name    ? String(q.user_name)                 : ''
    selectedUserId.value  = q.user_id      ? parseInt(String(q.user_id))          : 0
    dateFrom.value        = q.date_from    ? String(q.date_from)                  : ''
    dateTo.value          = q.date_to      ? String(q.date_to)                    : ''
    currentPage.value     = q.current_page ? parseInt(String(q.current_page))     : 1
    if (dateFrom.value) anchorDate.value = dayjs(dateFrom.value)
  }

  return {
    loading, userLeaveList, userList, leaveRequestTypes, subtractDayOffTypes,
    pagination, memberNameInput, selectedUserId, dateFrom, dateTo, currentPage,
    datesOfWeek, rangeLabel, userListSearching,
    search, prevWeek, nextWeek, selectMember, clearMember,
    leaveCoversDay, timeOf, applyFilter, goToPage, initFromQuery,
  }
}
