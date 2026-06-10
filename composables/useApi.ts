import type { ApiResponse } from '~/types'

/**
 * useApi — typed wrapper around $fetch with automatic auth headers
 * and 401 → token refresh handling.
 *
 * Replaces: this.$axios.$get / this.$axios.$post
 *
 * Usage:
 *   const { get, post } = useApi()
 *   const data = await get<User[]>('/api/user/list')
 *   const result = await post<LeaveRequest>('/leave/create-leave', body)
 */
export const useApi = () => {
  const { token, refreshAccessToken } = useAuth()
  const config = useRuntimeConfig()

  const headers = computed(() => ({
    ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
  }))

  async function request<T>(
    url: string,
    options: Parameters<typeof $fetch>[1] = {},
  ): Promise<T> {
    try {
      return await $fetch<T>(url, {
        baseURL: config.public.apiBase,
        headers: headers.value,
        ...options,
      })
    } catch (err: any) {
      if (err?.response?.status === 401) {
        await refreshAccessToken()
        // Retry once with refreshed token
        return $fetch<T>(url, {
          baseURL: config.public.apiBase,
          headers: headers.value,
          ...options,
        })
      }
      throw err
    }
  }

  function get<T>(url: string, query?: Record<string, any>) {
    return request<ApiResponse<T>>(url, { method: 'GET', query })
  }

  function post<T>(url: string, body?: Record<string, any> | BodyInit | null) {
    return request<ApiResponse<T>>(url, { method: 'POST', body })
  }

  function put<T>(url: string, body?: Record<string, any> | BodyInit | null) {
    return request<ApiResponse<T>>(url, { method: 'PUT', body })
  }

  function del<T>(url: string) {
    return request<ApiResponse<T>>(url, { method: 'DELETE' })
  }

  return { get, post, put, del, request }
}
