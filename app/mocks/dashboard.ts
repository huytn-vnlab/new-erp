import type { StatCardData, TabItem } from '~/types'

export const dashboardStats: StatCardData[] = [
  { label: 'Tổng nhân viên', icon: 'Users', value: 248, trend: { dir: 'up', value: '+12' }, sublabel: 'So với quý trước',
    sparkData: [212, 218, 224, 229, 232, 238, 244, 248],
    breakdown: [{ label: 'Hà Nội', value: 142 }, { label: 'Đà Nẵng', value: 58 }, { label: 'Hồ Chí Minh', value: 38 }, { label: 'Osaka', value: 10 }] },
  { label: 'Dự án', icon: 'Folder', value: 9, trend: { dir: 'up', value: '+1' }, sublabel: '6 đang hoạt động',
    sparkData: [6, 6, 7, 7, 8, 8, 9, 9],
    breakdown: [{ label: 'Đang hoạt động', value: 6 }, { label: 'Chờ khởi động', value: 2 }, { label: 'Đã kết thúc', value: 1 }] },
  { label: 'Kỳ đánh giá', icon: 'Star', value: 'Q2/26', sublabel: '94 nhân viên đã đánh giá',
    sparkData: [40, 55, 68, 80, 92, 94],
    breakdown: [{ label: 'Đã hoàn thành', value: '94 / 248' }, { label: 'Hạn cuối nộp', value: '15/06' }, { label: 'Tỷ lệ đạt S+A', value: '17%' }] },
]

export const homeTabs: TabItem[] = [
  { value: 'company', label: 'Thông tin công ty' },
  { value: 'personal', label: 'Thông tin của bạn' },
  { value: 'project', label: 'Thông tin dự án' },
]
