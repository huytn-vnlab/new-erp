import type { AuthUser, LoginCredentials } from '~/types'

/**
 * useAuth — STUB tạm cho giai đoạn design (chưa apply API).
 * Giữ đúng chữ ký công khai của bản gốc để các màn login/register/organization
 * build & render được. Logic xác thực thật sẽ được khôi phục ở plan migrate API.
 */
export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', { default: () => null })
  const refreshToken = useCookie<string | null>('refresh_token', { default: () => null })
  const user = useState<AuthUser | null>('auth_user', () => null)
  const loggedIn = computed(() => !!user.value)

  async function login(creds: LoginCredentials) {
    // MOCK: đăng nhập thành công không cần backend
    token.value = 'mock-token'
    user.value = { id: 1, name: 'Nguyễn Văn An', email: creds.email }
    return { data: { token: 'mock-token' } }
  }

  async function logout() {
    token.value = null
    refreshToken.value = null
    user.value = null
    await navigateTo('/')
  }

  async function register(_payload: unknown) {
    return { data: null }
  }

  async function refreshAccessToken() {
    return token.value
  }

  async function fetchUser() {
    return user.value
  }

  return { token, refreshToken, user, loggedIn, login, logout, register, refreshAccessToken, fetchUser }
}
