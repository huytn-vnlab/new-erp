/**
 * utils/error-handler.ts — normalise caught errors into user-facing strings.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number = 0,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const handleApiError = (err: unknown, fallback = 'Có lỗi xảy ra, vui lòng thử lại.'): string => {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error)    return err.message || fallback
  if (typeof err === 'string') return err
  return fallback
}
