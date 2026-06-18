export type AssetStatus = 'available' | 'in_use' | 'maintenance' | 'broken'
export type AssetCategory = 'laptop' | 'monitor' | 'keyboard' | 'mouse' | 'headphone' | 'phone' | 'tablet' | 'other'

export type Asset = {
  id: string
  name: string
  category: AssetCategory
  spec: string
  serial: string
  status: AssetStatus
  user: string | null
  branch: string
  date: string
  value: number
}

export type AssetRequest = {
  id: number
  asset: string
  user: string
  note: string
  return: string
  submitted: string
  status: 'pending' | 'approved' | 'completed'
}

export const CATEGORY_META: Record<AssetCategory, { label: string; glyph: string; color: string }> = {
  laptop:    { label: 'Laptop',     glyph: '⌘',  color: 'hsl(var(--primary-h) var(--primary-s) 55%)' },
  monitor:   { label: 'Màn hình',   glyph: '▭',  color: 'hsl(265 60% 55%)' },
  keyboard:  { label: 'Bàn phím',   glyph: '⌨', color: 'hsl(160 55% 45%)' },
  mouse:     { label: 'Chuột',      glyph: '◉',  color: 'hsl(35 90% 50%)' },
  headphone: { label: 'Tai nghe',   glyph: '○',  color: 'hsl(310 60% 55%)' },
  phone:     { label: 'Điện thoại', glyph: '▢',  color: 'hsl(15 80% 55%)' },
  tablet:    { label: 'Tablet',     glyph: '▣',  color: 'hsl(195 80% 45%)' },
  other:     { label: 'Khác',       glyph: '◆',  color: 'hsl(220 15% 50%)' },
}

type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

export const ASSET_STATUS_META: Record<AssetStatus, { label: string; variant: BadgeVariant }> = {
  available:   { label: 'Sẵn sàng',  variant: 'green'   },
  in_use:      { label: 'Đang dùng', variant: 'primary'  },
  maintenance: { label: 'Bảo trì',   variant: 'amber'    },
  broken:      { label: 'Hỏng',      variant: 'red'      },
}

export const ASSETS: Asset[] = [
  { id: 'AS-001', name: 'MacBook Pro 14"',       category: 'laptop',    spec: 'M3 Pro · 18GB · 512GB',      serial: 'C02XHGY7JG5J',  status: 'in_use',      user: 'Nguyễn Văn An',   branch: 'Hà Nội',  date: '15/01/2025', value: 64_000_000 },
  { id: 'AS-002', name: 'Dell XPS 15',           category: 'laptop',    spec: 'i7-13700H · 32GB · 1TB',     serial: 'DL-XPS-2401',   status: 'in_use',      user: 'Trần Thị Mai',    branch: 'Đà Nẵng', date: '08/06/2024', value: 42_500_000 },
  { id: 'AS-003', name: 'MacBook Air M2',        category: 'laptop',    spec: 'M2 · 16GB · 512GB',           serial: 'C02-M2A-2024',  status: 'available',   user: null,              branch: 'Hà Nội',  date: '—',          value: 38_000_000 },
  { id: 'AS-004', name: 'Dell U2723QE 27"',      category: 'monitor',   spec: '4K IPS · USB-C 90W',          serial: 'CN-0J7XY3-2401',status: 'in_use',      user: 'Lê Quang Huy',    branch: 'HCM',     date: '12/03/2025', value: 18_900_000 },
  { id: 'AS-005', name: 'LG 27UP850',            category: 'monitor',   spec: '4K · HDR400',                 serial: 'LG-27UP-2024',  status: 'available',   user: null,              branch: 'Hà Nội',  date: '—',          value: 13_500_000 },
  { id: 'AS-006', name: 'Keychron K3 Pro',       category: 'keyboard',  spec: 'Low profile · Brown sw',      serial: 'KC-K3P-991',    status: 'in_use',      user: 'Vũ Thị Lan',      branch: 'Hà Nội',  date: '04/02/2025', value: 3_200_000  },
  { id: 'AS-007', name: 'Logitech MX Master 3S', category: 'mouse',     spec: 'Wireless · Graphite',         serial: 'LO-MX3S-882',  status: 'in_use',      user: 'Phạm Thu Hà',     branch: 'Đà Nẵng', date: '17/04/2025', value: 2_690_000  },
  { id: 'AS-008', name: 'Sony WH-1000XM5',       category: 'headphone', spec: 'Wireless ANC',                serial: 'SN-XM5-441',    status: 'maintenance', user: null,              branch: 'Hà Nội',  date: '—',          value: 8_500_000  },
  { id: 'AS-009', name: 'iPhone 15 Pro',         category: 'phone',     spec: '256GB · Test device',         serial: 'IP15P-002',     status: 'in_use',      user: 'Bùi Đức Thành',   branch: 'Osaka',   date: '03/12/2024', value: 28_000_000 },
  { id: 'AS-010', name: 'iPad Air',              category: 'tablet',    spec: 'M2 · 256GB · Cellular',       serial: 'IPA-M2-2024',   status: 'available',   user: null,              branch: 'Hà Nội',  date: '—',          value: 22_500_000 },
  { id: 'AS-011', name: 'Wacom Intuos Pro',      category: 'other',     spec: 'Medium · Pen tablet',         serial: 'WC-IP-771',     status: 'in_use',      user: 'Vũ Thị Lan',      branch: 'Hà Nội',  date: '12/01/2025', value: 8_900_000  },
  { id: 'AS-012', name: 'Dell Docking WD22TB4',  category: 'other',     spec: 'Thunderbolt 4',               serial: 'DL-WD22-660',   status: 'in_use',      user: 'Hoàng Đức Thành', branch: 'Hà Nội',  date: '20/11/2024', value: 9_800_000  },
]

export const ASSET_REQUESTS: AssetRequest[] = [
  { id: 1, asset: 'MacBook Air M2',   user: 'Ngô Thanh Tùng', note: 'Cần laptop dự phòng cho onboarding',  return: '15/06/2026', submitted: '2 giờ trước',  status: 'pending'   },
  { id: 2, asset: 'iPad Air',         user: 'Đặng Thị Hồng',  note: 'Demo cho khách hàng tuần sau',         return: '30/05/2026', submitted: 'Hôm qua',      status: 'pending'   },
  { id: 3, asset: 'LG 27UP850',       user: 'Phan Văn Cường', note: 'Setup workspace mới ở Đà Nẵng',        return: '—',          submitted: '3 ngày trước', status: 'approved'  },
  { id: 4, asset: 'Sony WH-1000XM5',  user: 'Lý Quỳnh Anh',   note: 'Tai nghe cũ hỏng',                      return: '—',          submitted: '1 tuần trước', status: 'completed' },
]

export const formatVND = (v: number) => v.toLocaleString('vi-VN') + ' đ'
