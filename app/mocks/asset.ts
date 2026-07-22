export type AssetStatus = 'available' | 'in_use' | 'maintenance' | 'broken'
export type AssetCategory = 'laptop' | 'monitor' | 'keyboard' | 'mouse' | 'headphone' | 'phone' | 'tablet' | 'other'

export type Asset = {
  id: string
  assetId: number
  name: string
  category: AssetCategory
  spec: string
  serial: string
  status: AssetStatus
  statusCode: number
  user: string | null
  userId: number | null
  branch: string
  date: string
  value: number
}

type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

// i18n keys (not literal text) — resolve with t() at display time.
export const CATEGORY_META: Record<AssetCategory, { labelKey: string; glyph: string; color: string }> = {
  laptop:    { labelKey: 'hrm.asset.category.laptop',    glyph: '⌘',  color: 'hsl(var(--primary-h) var(--primary-s) 55%)' },
  monitor:   { labelKey: 'hrm.asset.category.monitor',   glyph: '▭',  color: 'hsl(265 60% 55%)' },
  keyboard:  { labelKey: 'hrm.asset.category.keyboard',  glyph: '⌨', color: 'hsl(160 55% 45%)' },
  mouse:     { labelKey: 'hrm.asset.category.mouse',     glyph: '◉',  color: 'hsl(35 90% 50%)' },
  headphone: { labelKey: 'hrm.asset.category.headphone', glyph: '○',  color: 'hsl(310 60% 55%)' },
  phone:     { labelKey: 'hrm.asset.category.phone',     glyph: '▢',  color: 'hsl(15 80% 55%)' },
  tablet:    { labelKey: 'hrm.asset.category.tablet',    glyph: '▣',  color: 'hsl(195 80% 45%)' },
  other:     { labelKey: 'hrm.asset.category.other',     glyph: '◆',  color: 'hsl(220 15% 50%)' },
}

// i18n keys (not literal text) — resolve with t() at display time.
export const ASSET_STATUS_META: Record<AssetStatus, { labelKey: string; variant: BadgeVariant }> = {
  available:   { labelKey: 'hrm.asset.status.available',   variant: 'green'   },
  in_use:      { labelKey: 'hrm.asset.status.inUse',       variant: 'primary'  },
  maintenance: { labelKey: 'hrm.asset.status.maintenance', variant: 'amber'    },
  broken:      { labelKey: 'hrm.asset.status.broken',      variant: 'red'      },
}

export const formatVND = (v: number) => v.toLocaleString('vi-VN') + ' đ'
