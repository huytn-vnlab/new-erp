import type { AuthUser, LoginCredentials, ApiResponse } from '~/types'

export const useAuth = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string

  const token = useCookie<string | null>('auth_token', { default: () => null, maxAge: 60 * 60 * 72 })
  const refreshToken = useCookie<string | null>('refresh_token', { default: () => null, maxAge: 60 * 60 * 24 * 30 })
  const user = useState<AuthUser | null>('auth_user', () => null)
  const loggedIn = computed(() => !!token.value)

  async function login(creds: LoginCredentials) {
    const form = new FormData()
    form.append('email', creds.email)
    form.append('password', creds.password)
    if (creds.organization_id) form.append('organization_id', String(creds.organization_id))

    const res = await $fetch<ApiResponse<{ token: string; refresh_token: string }>>(
      `${base}/api/auth/login`,
      { method: 'POST', body: form },
    )
    if (res.status !== 1 || !res.data) {
      throw new Error(res.message || 'Login failed')
    }
    token.value = res.data.token
    refreshToken.value = res.data.refresh_token
    await fetchUser()
    return res
  }

  async function logout() {
    try {
      if (token.value) {
        await $fetch(`${base}/api/auth/logout`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token.value}` },
        })
      }
    } catch { /* best-effort */ }
    token.value = null
    refreshToken.value = null
    user.value = null
    await navigateTo('/organization/find-organization')
  }

  async function fetchUser(): Promise<AuthUser | null> {
    if (!token.value) return null
    try {
      const res = await $fetch<ApiResponse<AuthUser>>(`${base}/api/user/getuser`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token.value}` },
      })
      if (res.status === 1 && res.data) {
        user.value = res.data
        return res.data
      }
    } catch { /* session may have expired */ }
    return null
  }

  async function refreshAccessToken(): Promise<string | null> {
    if (!refreshToken.value) return null
    try {
      const res = await $fetch<ApiResponse<{ token: string; refresh_token: string }>>(
        `${base}/api/auth/refresh`,
        { method: 'POST', body: { refresh_token: refreshToken.value } },
      )
      if (res.status === 1 && res.data) {
        token.value = res.data.token
        refreshToken.value = res.data.refresh_token
        return res.data.token
      }
    } catch { /* ignore */ }
    token.value = null
    refreshToken.value = null
    return null
  }

  async function register(_payload: unknown) {
    return { data: null }
  }

  return {
    token,
    refreshToken,
    user,
    loggedIn,
    login,
    logout,
    fetchUser,
    refreshAccessToken,
    register,
  }
}
