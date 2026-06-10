/**
 * useToast — lightweight global toast notification system.
 * Backed by useState so the AppToast component can react anywhere.
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  variant: ToastVariant
  duration: number
}

let _id = 0

export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])

  function add(message: string, variant: ToastVariant = 'info', duration = 3500) {
    const id = ++_id
    toasts.value = [...toasts.value, { id, message, variant, duration }]
    setTimeout(() => remove(id), duration)
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    success: (msg: string, duration?: number) => add(msg, 'success', duration),
    error:   (msg: string, duration?: number) => add(msg, 'error',   duration),
    warning: (msg: string, duration?: number) => add(msg, 'warning', duration),
    info:    (msg: string, duration?: number) => add(msg, 'info',    duration),
    remove,
  }
}
