export type Trend = { dir: 'up' | 'down'; value: string }
export type StatCardData = {
  label: string; icon: string; value: string | number
  trend?: Trend; sublabel?: string; sparkData: number[]
  breakdown: { label: string; value: string | number }[]
}
export type TabItem = { value: string; label: string }
