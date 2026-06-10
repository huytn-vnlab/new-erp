import type { AuthUser, LoginCredentials, ApiResponse, TokenPair } from '~/types'

/**
 * useAuth — central authentication composable.
 *
 * Replaces @nuxtjs/auth. Stores access token in a short-lived cookie,
 * refresh token in an httpOnly cookie handled server-side, and user
 * state in a shared Nuxt useState slot so it survives page navigations.
 *
 * Mapping from old @nuxtjs/auth API:
 *   this.$auth.login()         → login()
 *   this.$auth.logout()        → logout()
 *   this.$auth.user            → user.value
 *   this.$auth.loggedIn        → loggedIn.value
 *   this.$auth.getToken('local') → token.value
 */
export const useAuth = () => {
  const config = useRuntimeConfig()

  // Access token — readable by JS (needed for Authorization header)
  const token = useCookie<string | null>('auth_token', {
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 3, // 3 days (matches JWT exp in BE)
    default: () => null,
  })

  // Refresh token — 30 days
  const refreshToken = useCookie<string | null>('refresh_token', {
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    default: () => null,
  })

  // Shared user state across all components
  const user = useState<AuthUser | null>('auth_user', () => null)

  const loggedIn = computed(() => !!token.value && !!user.value)

  // ── Actions ────────────────────────────────────────────────────────────────

  async function login(credentials: LoginCredentials): Promise<void> {
    const formData = new FormData()
    formData.append('email', credentials.email)
    formData.append('password', credentials.password)
    formData.append('organization_id', String(credentials.organization_id))

    const response = await $fetch<ApiResponse<TokenPair>>('/auth/login', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: formData,
    })

    if (response.status !== 1) {
      throw new Error(response.message || 'Login failed')
    }

    if (!response.data) throw new Error('Login failed: no token returned')
    token.value = response.data.token
    refreshToken.value = response.data.refresh_token

    await fetchCurrentUser()
  }

  async function logout(): Promise<void> {
    try {
      await $fetch('/auth/logout', {
        method: 'GET',
        baseURL: config.public.apiBase,
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
        body: refreshToken.value ? { refresh_token: refreshToken.value } : undefined,
      })
    } catch {
      // Ignore logout errors — clear local state regardless
    }

    token.value = null
    refreshToken.value = null
    user.value = null
    await navigateTo('/user/login')
  }

  async function fetchCurrentUser(): Promise<void> {
    if (!token.value) return
    try {
      const response = await $fetch<ApiResponse<Record<string, any>>>('/api/user/getuser', {
        baseURL: config.public.apiBase,
        headers: { Authorization: `Bearer ${token.value}` },
      })
      const d = response.data
      if (!d) { await logout(); return }

      // Normalize backend shape → AuthUser
      user.value = {
        id:               d.id,
        email:            d.email,
        first_name:       d.first_name,
        last_name:        d.last_name,
        full_name:        `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() || d.email,
        avatar:           d.avatar ?? null,
        role_id:          d.role_id ?? 1,
        is_admin:         (d.role_id ?? 1) >= 2,
        organization_id:  d.organization_id,
        organization_name: d.organization_name,
        language_id:      d.language_id,
        branch:           d.branch ?? null,
        func_permission:  d.func_permission ?? {},
        setting_step:     d.setting_step,
      }
    } catch {
      await logout()
    }
  }

  async function refreshAccessToken(): Promise<void> {
    if (!refreshToken.value) {
      await logout()
      return
    }
    try {
      const response = await $fetch<ApiResponse<TokenPair>>('/auth/refresh', {
        method: 'POST',
        baseURL: config.public.apiBase,
        body: { refresh_token: refreshToken.value },
      })
      if (!response.data) return
      token.value = response.data.token
      if (response.data.refresh_token) {
        refreshToken.value = response.data.refresh_token
      }
    } catch {
      await logout()
    }
  }

  return {
    token,
    refreshToken,
    user,
    loggedIn,
    login,
    logout,
    fetchCurrentUser,
    refreshAccessToken,
  }
}
