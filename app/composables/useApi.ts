import type { ApiResponse } from '~/types'

export const useApi = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string

  const token = useCookie<string | null>('auth_token')
  const refreshToken = useCookie<string | null>('refresh_token')

  function authHeaders(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  async function tryRefresh(): Promise<boolean> {
    if (!refreshToken.value) return false
    try {
      const res = await $fetch<ApiResponse<{ token: string; refresh_token: string }>>(
        `${base}/auth/refresh`,
        { method: 'POST', body: { refresh_token: refreshToken.value } },
      )
      if (res.status === 1 && res.data) {
        token.value = res.data.token
        refreshToken.value = res.data.refresh_token
        return true
      }
    } catch { /* ignore — fall through to logout */ }
    token.value = null
    refreshToken.value = null
    return false
  }

  async function call<T>(
    url: string,
    opts: Parameters<typeof $fetch>[1] = {},
    retried = false,
  ): Promise<ApiResponse<T>> {
    try {
      return await $fetch<ApiResponse<T>>(`${base}${url}`, {
        ...opts,
        headers: { ...authHeaders(), ...(opts.headers as Record<string, string> | undefined) },
      })
    } catch (err: unknown) {
      const fe = err as { response?: { status?: number }; status?: number; data?: unknown }
      const httpStatus = fe?.response?.status ?? fe?.status
      if (httpStatus === 401 && !retried) {
        const ok = await tryRefresh()
        if (ok) return call<T>(url, opts, true)
        await navigateTo('/organization/find-organization')
      }
      // ofetch puts the parsed response body in err.data — return it so callers get the API envelope
      const body = fe?.data
      if (body && typeof body === 'object' && 'status' in body && 'message' in body) {
        return body as ApiResponse<T>
      }
      throw err
    }
  }

  function get<T>(url: string, query?: Record<string, unknown>) {
    return call<T>(url, { method: 'GET', query })
  }

  function post<T>(url: string, body?: Record<string, unknown> | unknown[]) {
    return call<T>(url, { method: 'POST', body: body as Record<string, unknown> })
  }

  function postForm<T>(url: string, form: FormData) {
    return call<T>(url, { method: 'POST', body: form })
  }

  // Some export endpoints (e.g. /api/user/export-excel) return a raw
  // application/octet-stream body, not the {status,message,data} envelope —
  // call() can't parse those, so fetch and hand back a Blob directly.
  async function postBlob(url: string, body?: Record<string, unknown>): Promise<Blob | null> {
    try {
      return await $fetch<Blob>(`${base}${url}`, {
        method: 'POST',
        body,
        headers: authHeaders(),
        responseType: 'blob',
      })
    } catch {
      return null
    }
  }

  function put<T>(url: string, body?: Record<string, unknown>) {
    return call<T>(url, { method: 'PUT', body })
  }

  function del<T>(url: string, body?: Record<string, unknown>) {
    return call<T>(url, { method: 'DELETE', body })
  }

  return { get, post, postForm, postBlob, put, del }
}
