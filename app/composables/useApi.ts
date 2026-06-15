import type { ApiResponse } from '~/types'

/**
 * useApi — STUB tạm cho giai đoạn design (chưa apply API).
 * Trả về response rỗng để các màn gọi API khi mount không lỗi.
 * Client thật (token, $fetch, refresh) sẽ được khôi phục ở plan migrate API.
 */
export const useApi = () => {
  async function request<T>(_url: string, _opts?: Record<string, unknown>): Promise<T> {
    return ({ data: null } as unknown) as T
  }
  async function get<T>(_url: string, _query?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return { data: null }
  }
  async function post<T>(_url: string, _body?: unknown): Promise<ApiResponse<T>> {
    return { data: null }
  }
  async function put<T>(_url: string, _body?: unknown): Promise<ApiResponse<T>> {
    return { data: null }
  }
  async function del<T>(_url: string): Promise<ApiResponse<T>> {
    return { data: null }
  }
  return { get, post, put, del, request }
}
