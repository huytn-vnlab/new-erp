export type Trend = { dir: 'up' | 'down'; value: string }
export type StatCardData = {
  label: string; icon: string; value: string | number
  trend?: Trend; sublabel?: string; sparkData: number[]
  breakdown: { label: string; value: string | number }[]
}
export type TabItem = { value: string; label: string }

// ── Auth / API (khôi phục cho các màn pre-dashboard; logic thật ở plan migrate API) ──
export interface ApiResponse<T = unknown> {
  data: T | null
  message?: string
  status?: number
}

export interface Organization {
  id: number
  name: string
  code: string
  email: string
  logo?: string
  phone?: string
  address?: string
  created_at?: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  [key: string]: unknown
}

export interface LoginCredentials {
  email: string
  password: string
  organization_id?: number
}
