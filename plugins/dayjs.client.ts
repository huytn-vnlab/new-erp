import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import weekday from 'dayjs/plugin/weekday'
import utc from 'dayjs/plugin/utc'
import isoWeek from 'dayjs/plugin/isoWeek'
import 'dayjs/locale/vi'
import 'dayjs/locale/ja'
import 'dayjs/locale/en'

dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(weekday)
dayjs.extend(utc)
dayjs.extend(isoWeek)
dayjs.locale('vi')

export default defineNuxtPlugin(() => {
  return {
    provide: { dayjs },
  }
})
